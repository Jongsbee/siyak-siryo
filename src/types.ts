export type HazardClass = '인화성' | '독성' | '부식성' | '산화성' | '해당없음' | string;
export type StorageTemp = 'RT' | '4℃' | '-20℃' | string;

export type ExpiryState = '만료' | '임박' | '정상' | '유효기간 미기재';
export type QtyState = '데이터 오류' | '부족' | '정상' | '잔량 미기재';

export interface ReagentItem {
  reagent_id: string;
  reagent_name: string;
  cas_no: string;
  hazard_class: HazardClass;
  storage_temp: StorageTemp;
  location: string;
  init_qty: number;
  remain_qty: number | null;
  qty_unit: string;
  receipt_date: string;
  expiry_date: string | null;
  emp_name: string;
  remark?: string;

  // Computed fields
  d_day?: number | null;
  expiry_state?: ExpiryState;
  qty_percentage?: number | null;
  qty_state?: QtyState;
  is_duplicate_candidate?: boolean;
  warn_rank?: number;
  date_reversed?: boolean;
  id_duplicate?: boolean;
}

export interface DuplicateGroupInfo {
  cas_no: string;
  names: { name: string; count: number; totalRemain: number; unit: string }[];
  totalRows: number;
}

export interface InventorySummary {
  totalCount: number;
  expiredCount: number;
  imminentCount: number;
  lowStockCount: number;
  errorStockCount: number;
  duplicateGroupCount: number;
  missingDataCount: number;
}

export type FilterState = {
  search: string;
  warningFilter: 'all' | '만료' | '임박' | '부족' | '데이터 오류' | '중복 후보' | '결측';
  hazardFilter: string;
  storageFilter: string;
  labFilter: string;
  sortBy: 'urgency' | 'name' | 'remain' | 'expiry' | 'id';
};
