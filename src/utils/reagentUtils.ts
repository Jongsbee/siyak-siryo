import { ReagentItem, ExpiryState, QtyState, DuplicateGroupInfo, InventorySummary } from '../types';

export const BASE_DATE_STR = '2026-08-27';
export const BASE_DATE = new Date(BASE_DATE_STR + 'T00:00:00');

export function parseCSV(csvText: string): ReagentItem[] {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.trim().toLowerCase());

  const items: ReagentItem[] = [];
  const idSet = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length === 0) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] !== undefined ? values[idx].trim() : '';
    });

    const reagent_id = rowObj['reagent_id'] || `RG-${String(i).padStart(3, '0')}`;
    const reagent_name = rowObj['reagent_name'] || '';
    const cas_no = rowObj['cas_no'] || '';
    const hazard_class = rowObj['hazard_class'] || '해당없음';
    const storage_temp = rowObj['storage_temp'] || 'RT';
    const location = rowObj['location'] || '';
    
    const initRaw = rowObj['init_qty']?.replace(/,/g, '');
    const init_qty = initRaw && !isNaN(Number(initRaw)) ? Number(initRaw) : 0;

    const remainRaw = rowObj['remain_qty']?.replace(/,/g, '');
    const remain_qty = remainRaw && remainRaw !== '' && !isNaN(Number(remainRaw)) ? Number(remainRaw) : null;

    const qty_unit = rowObj['qty_unit'] || 'g';
    const receipt_date = rowObj['receipt_date'] || '';
    const expiry_date = rowObj['expiry_date'] && rowObj['expiry_date'] !== '' ? rowObj['expiry_date'] : null;
    const emp_name = rowObj['emp_name'] || '';
    const remark = rowObj['remark'] || '';

    const id_duplicate = idSet.has(reagent_id);
    idSet.add(reagent_id);

    items.push({
      reagent_id,
      reagent_name,
      cas_no,
      hazard_class,
      storage_temp,
      location,
      init_qty,
      remain_qty,
      qty_unit,
      receipt_date,
      expiry_date,
      emp_name,
      remark,
      id_duplicate
    });
  }

  return processReagentItems(items);
}

// Simple robust CSV line parser handling quotes
function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + '"'.length] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map(s => s.replace(/^"|"$/g, '').trim());
}

export function processReagentItems(items: ReagentItem[]): ReagentItem[] {
  // 1. First pass: detect duplicate registration candidates by cas_no and raw reagent_name
  const casGroupMap = new Map<string, Set<string>>();
  items.forEach(item => {
    if (!item.cas_no) return;
    if (!casGroupMap.has(item.cas_no)) {
      casGroupMap.set(item.cas_no, new Set());
    }
    if (item.reagent_name) {
      casGroupMap.get(item.cas_no)!.add(item.reagent_name);
    }
  });

  const duplicateCasSet = new Set<string>();
  casGroupMap.forEach((nameSet, cas) => {
    if (nameSet.size >= 2) {
      duplicateCasSet.add(cas);
    }
  });

  // 2. Second pass: calculate metrics for each item
  return items.map(item => {
    // D-day calculation
    let d_day: number | null = null;
    let expiry_state: ExpiryState = '유효기간 미기재';

    if (item.expiry_date) {
      const expDate = new Date(item.expiry_date + 'T00:00:00');
      if (!isNaN(expDate.getTime())) {
        const diffTime = expDate.getTime() - BASE_DATE.getTime();
        d_day = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (d_day <= 0) {
          expiry_state = '만료';
        } else if (d_day <= 30) {
          expiry_state = '임박';
        } else {
          expiry_state = '정상';
        }
      }
    }

    // Quantity percentage & Qty state
    let qty_percentage: number | null = null;
    let qty_state: QtyState = '잔량 미기재';

    if (item.remain_qty !== null && item.remain_qty !== undefined) {
      if (item.init_qty <= 0) {
        qty_state = '데이터 오류';
      } else {
        const rawPct = (item.remain_qty / item.init_qty) * 100;
        qty_percentage = Number(rawPct.toFixed(1));

        if (rawPct > 100) {
          qty_state = '데이터 오류';
        } else if (rawPct <= 20) {
          qty_state = '부족';
        } else {
          qty_state = '정상';
        }
      }
    }

    // Duplicate candidate check
    const is_duplicate_candidate = duplicateCasSet.has(item.cas_no);

    // Date reversed check
    let date_reversed = false;
    if (item.receipt_date && item.expiry_date) {
      const recDate = new Date(item.receipt_date + 'T00:00:00');
      const expDate = new Date(item.expiry_date + 'T00:00:00');
      if (!isNaN(recDate.getTime()) && !isNaN(expDate.getTime()) && recDate > expDate) {
        date_reversed = true;
      }
    }

    // Warn rank calculation (min rank)
    // 만료(0) / 데이터오류(1) / 부족(2) / 임박(3) / 중복후보(4) / 정상(5)
    let warn_rank = 5;
    if (expiry_state === '만료' || qty_state === '데이터 오류' || date_reversed) {
      warn_rank = 0;
    } else if (qty_state === '부족') {
      warn_rank = 2;
    } else if (expiry_state === '임박') {
      warn_rank = 3;
    } else if (is_duplicate_candidate) {
      warn_rank = 4;
    }

    return {
      ...item,
      d_day,
      expiry_state,
      qty_percentage,
      qty_state,
      is_duplicate_candidate,
      warn_rank,
      date_reversed
    };
  });
}

export function calculateSummary(items: ReagentItem[]): InventorySummary {
  let expiredCount = 0;
  let imminentCount = 0;
  let lowStockCount = 0;
  let errorStockCount = 0;
  let missingDataCount = 0;

  const duplicateCasGroups = new Set<string>();
  const casNameMap = new Map<string, Set<string>>();

  items.forEach(item => {
    if (item.expiry_state === '만료') expiredCount++;
    if (item.expiry_state === '임박') imminentCount++;
    if (item.qty_state === '부족') lowStockCount++;
    if (item.qty_state === '데이터 오류' || item.date_reversed) errorStockCount++;
    if (!item.expiry_date || item.remain_qty === null) missingDataCount++;

    if (item.cas_no) {
      if (!casNameMap.has(item.cas_no)) {
        casNameMap.set(item.cas_no, new Set());
      }
      if (item.reagent_name) {
        casNameMap.get(item.cas_no)!.add(item.reagent_name);
      }
    }
  });

  casNameMap.forEach((names, cas) => {
    if (names.size >= 2) {
      duplicateCasGroups.add(cas);
    }
  });

  return {
    totalCount: items.length,
    expiredCount,
    imminentCount,
    lowStockCount,
    errorStockCount,
    duplicateGroupCount: duplicateCasGroups.size,
    missingDataCount
  };
}

export function getDuplicateGroups(items: ReagentItem[]): DuplicateGroupInfo[] {
  const casMap = new Map<string, ReagentItem[]>();
  items.forEach(item => {
    if (!item.cas_no) return;
    if (!casMap.has(item.cas_no)) {
      casMap.set(item.cas_no, []);
    }
    casMap.get(item.cas_no)!.push(item);
  });

  const result: DuplicateGroupInfo[] = [];

  casMap.forEach((groupItems, cas_no) => {
    const nameMap = new Map<string, { count: number; totalRemain: number; unit: string }>();
    groupItems.forEach(item => {
      const name = item.reagent_name || '(미기재)';
      if (!nameMap.has(name)) {
        nameMap.set(name, { count: 0, totalRemain: 0, unit: item.qty_unit });
      }
      const entry = nameMap.get(name)!;
      entry.count++;
      if (item.remain_qty !== null) {
        entry.totalRemain += item.remain_qty;
      }
    });

    if (nameMap.size >= 2) {
      const names = Array.from(nameMap.entries()).map(([name, data]) => ({
        name,
        count: data.count,
        totalRemain: Number(data.totalRemain.toFixed(1)),
        unit: data.unit
      }));
      result.push({
        cas_no,
        names,
        totalRows: groupItems.length
      });
    }
  });

  return result;
}

export function exportToCSV(items: ReagentItem[]): string {
  const headers = ['reagent_id', 'reagent_name', 'cas_no', 'hazard_class', 'storage_temp', 'location', 'init_qty', 'remain_qty', 'qty_unit', 'receipt_date', 'expiry_date', 'emp_name', 'remark'];
  const rows = items.map(item => [
    item.reagent_id,
    `"${item.reagent_name.replace(/"/g, '""')}"`,
    item.cas_no,
    item.hazard_class,
    item.storage_temp,
    item.location,
    item.init_qty,
    item.remain_qty !== null ? item.remain_qty : '',
    item.qty_unit,
    item.receipt_date,
    item.expiry_date || '',
    `"${item.emp_name.replace(/"/g, '""')}"`,
    `"${(item.remark || '').replace(/"/g, '""')}"`
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}
