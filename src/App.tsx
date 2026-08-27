/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ReagentItem, FilterState } from './types';
import { RAW_SAMPLE_CSV_DATA } from './data/sampleReagents';
import { parseCSV, processReagentItems, calculateSummary, getDuplicateGroups, exportToCSV } from './utils/reagentUtils';
import { getSupabaseClient, getStoredSupabaseConfig } from './utils/supabaseClient';
import { Header } from './components/Header';
import { DashboardCards } from './components/DashboardCards';
import { FilterBar } from './components/FilterBar';
import { ReagentTable } from './components/ReagentTable';
import { ImportModal } from './components/ImportModal';
import { DetailModal } from './components/DetailModal';
import { AddEditModal } from './components/AddEditModal';
import { OrderListModal } from './components/OrderListModal';
import { AuthScreen } from './components/AuthScreen';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

const LOCAL_STORAGE_KEY = 'reagent_inventory_data_v1';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const [items, setItems] = useState<ReagentItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return processReagentItems(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
    return parseCSV(RAW_SAMPLE_CSV_DATA);
  });

  const [filter, setFilter] = useState<FilterState>({
    search: '',
    warningFilter: 'all',
    hazardFilter: 'all',
    storageFilter: 'all',
    labFilter: 'all',
    sortBy: 'urgency'
  });

  // Modal states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isOrderListOpen, setIsOrderListOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReagentItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<ReagentItem | null>(null);

  // Check Supabase Auth session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            setUser(session.user);
          }
          const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
          });
          setAuthChecking(false);
          return () => {
            subscription.unsubscribe();
          };
        }
      } catch (err) {
        console.error('Auth session check error:', err);
      }
      setAuthChecking(false);
    };

    checkSession();
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [items]);

  // Summary and Duplicate Groups
  const summary = useMemo(() => calculateSummary(items), [items]);
  const duplicateGroups = useMemo(() => getDuplicateGroups(items), [items]);

  // Available dropdown options extracted from data
  const availableHazards = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => { if (i.hazard_class) set.add(i.hazard_class); });
    return Array.from(set);
  }, [items]);

  const availableStorages = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => { if (i.storage_temp) set.add(i.storage_temp); });
    return Array.from(set);
  }, [items]);

  const availableLabs = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => {
      if (i.location) {
        const labPrefix = i.location.split(' ')[0];
        if (labPrefix) set.add(labPrefix);
      }
    });
    return Array.from(set).sort();
  }, [items]);

  // Filter & Sort logic
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // 1. Search query
    if (filter.search.trim() !== '') {
      const q = filter.search.toLowerCase();
      result = result.filter(item =>
        item.reagent_name.toLowerCase().includes(q) ||
        item.cas_no.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.emp_name.toLowerCase().includes(q) ||
        item.reagent_id.toLowerCase().includes(q)
      );
    }

    // 2. Warning filter
    if (filter.warningFilter !== 'all') {
      if (filter.warningFilter === '만료') {
        result = result.filter(i => i.expiry_state === '만료');
      } else if (filter.warningFilter === '임박') {
        result = result.filter(i => i.expiry_state === '임박');
      } else if (filter.warningFilter === '부족') {
        result = result.filter(i => i.qty_state === '부족');
      } else if (filter.warningFilter === '데이터 오류') {
        result = result.filter(i => i.qty_state === '데이터 오류' || i.date_reversed);
      } else if (filter.warningFilter === '중복 후보') {
        result = result.filter(i => i.is_duplicate_candidate);
      } else if (filter.warningFilter === '결측') {
        result = result.filter(i => !i.expiry_date || i.remain_qty === null);
      }
    }

    // 3. Hazard filter
    if (filter.hazardFilter !== 'all') {
      result = result.filter(i => i.hazard_class === filter.hazardFilter);
    }

    // 4. Storage filter
    if (filter.storageFilter !== 'all') {
      result = result.filter(i => i.storage_temp === filter.storageFilter);
    }

    // 5. Lab filter
    if (filter.labFilter !== 'all') {
      result = result.filter(i => i.location.startsWith(filter.labFilter));
    }

    // 6. Sorting
    result.sort((a, b) => {
      if (filter.sortBy === 'urgency') {
        if ((a.warn_rank ?? 5) !== (b.warn_rank ?? 5)) {
          return (a.warn_rank ?? 5) - (b.warn_rank ?? 5);
        }
        if (a.d_day !== null && b.d_day !== null && a.d_day !== b.d_day) {
          return a.d_day - b.d_day;
        }
        return a.reagent_id.localeCompare(b.reagent_id);
      }
      if (filter.sortBy === 'name') {
        return a.reagent_name.localeCompare(b.reagent_name);
      }
      if (filter.sortBy === 'remain') {
        const pA = a.qty_percentage ?? 999;
        const pB = b.qty_percentage ?? 999;
        return pA - pB;
      }
      if (filter.sortBy === 'expiry') {
        const dA = a.d_day ?? 9999;
        const dB = b.d_day ?? 9999;
        return dA - dB;
      }
      if (filter.sortBy === 'id') {
        return a.reagent_id.localeCompare(b.reagent_id);
      }
      return 0;
    });

    return result;
  }, [items, filter]);

  // Handlers
  const handleImport = (newItems: ReagentItem[]) => {
    setItems(processReagentItems(newItems));
  };

  const handleResetSample = () => {
    if (window.confirm('초기 샘플 데이터(80행)로 복원하시겠습니까? 기존 수정 사항이 초기화됩니다.')) {
      setItems(parseCSV(RAW_SAMPLE_CSV_DATA));
      setFilter({
        search: '',
        warningFilter: 'all',
        hazardFilter: 'all',
        storageFilter: 'all',
        labFilter: 'all',
        sortBy: 'urgency'
      });
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV(filteredAndSortedItems);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reagent_inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveItem = (savedItem: ReagentItem, isEdit: boolean) => {
    let updated: ReagentItem[];
    if (isEdit) {
      updated = items.map(i => i.reagent_id === savedItem.reagent_id ? savedItem : i);
    } else {
      updated = [savedItem, ...items];
    }
    setItems(processReagentItems(updated));
  };

  const handleDeleteItem = (reagent_id: string) => {
    const updated = items.filter(i => i.reagent_id !== reagent_id);
    setItems(processReagentItems(updated));
  };

  const handleLogout = async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    setUser(null);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">인증 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show AuthScreen
  if (!user) {
    return (
      <AuthScreen
        onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
      
      {/* Header */}
      <Header
        onOpenImport={() => setIsImportOpen(true)}
        onOpenAdd={() => { setItemToEdit(null); setIsAddOpen(true); }}
        onOpenOrderList={() => setIsOrderListOpen(true)}
        onExportCSV={handleExportCSV}
        onResetSample={handleResetSample}
        onLogout={handleLogout}
        onOpenConfig={() => setIsConfigOpen(true)}
        userEmail={user?.email}
        totalCount={items.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Dashboard Summary Cards */}
        <DashboardCards
          summary={summary}
          filter={filter}
          onSelectWarningFilter={warningFilter => setFilter({ ...filter, warningFilter })}
        />

        {/* Filter & Search Bar */}
        <FilterBar
          filter={filter}
          onChangeFilter={updated => setFilter({ ...filter, ...updated })}
          availableHazards={availableHazards}
          availableStorages={availableStorages}
          availableLabs={availableLabs}
        />

        {/* Inventory Table / List */}
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>검색 및 필터 결과: <strong className="text-slate-800">{filteredAndSortedItems.length}</strong>건</span>
          <span>기준일 고정: 2026-08-27 (PRD-R02)</span>
        </div>

        <ReagentTable
          items={filteredAndSortedItems}
          onSelectItem={item => setSelectedItem(item)}
        />

      </main>

      {/* Modals */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
      />

      <DetailModal
        isOpen={!!selectedItem}
        item={selectedItem}
        duplicateGroups={duplicateGroups}
        onClose={() => setSelectedItem(null)}
        onEdit={item => { setItemToEdit(item); setIsAddOpen(true); }}
        onDelete={handleDeleteItem}
      />

      <AddEditModal
        isOpen={isAddOpen}
        itemToEdit={itemToEdit}
        onClose={() => { setIsAddOpen(false); setItemToEdit(null); }}
        onSave={handleSaveItem}
      />

      <OrderListModal
        isOpen={isOrderListOpen}
        items={items}
        onClose={() => setIsOrderListOpen(false)}
      />

      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfigSaved={() => {
          setIsConfigOpen(false);
          window.location.reload();
        }}
      />

    </div>
  );
}
