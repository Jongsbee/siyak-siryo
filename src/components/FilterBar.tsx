import React from 'react';
import { FilterState } from '../types';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';

interface FilterBarProps {
  filter: FilterState;
  onChangeFilter: (updated: Partial<FilterState>) => void;
  availableHazards: string[];
  availableStorages: string[];
  availableLabs: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onChangeFilter,
  availableHazards,
  availableStorages,
  availableLabs
}) => {
  const hasActiveFilters =
    filter.search !== '' ||
    filter.warningFilter !== 'all' ||
    filter.hazardFilter !== 'all' ||
    filter.storageFilter !== 'all' ||
    filter.labFilter !== 'all';

  const resetFilters = () => {
    onChangeFilter({
      search: '',
      warningFilter: 'all',
      hazardFilter: 'all',
      storageFilter: 'all',
      labFilter: 'all'
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="시약명, CAS 번호, 보관위치(LAB), 담당자 검색..."
            value={filter.search}
            onChange={e => onChangeFilter({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Sort & Reset */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium">정렬:</span>
            <select
              value={filter.sortBy}
              onChange={e => onChangeFilter({ sortBy: e.target.value as FilterState['sortBy'] })}
              className="bg-transparent font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="urgency">위험도·임박순 (기본)</option>
              <option value="name">시약명순</option>
              <option value="remain">잔량률 낮은순</option>
              <option value="expiry">유효기간 임박순</option>
              <option value="id">시약 ID순</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              필터 초기화
            </button>
          )}
        </div>

      </div>

      {/* Select Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-1 text-slate-500 font-medium mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>상세 필터:</span>
        </div>

        {/* Warning Filter status badge */}
        {filter.warningFilter !== 'all' && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
            경고: {filter.warningFilter}
            <button onClick={() => onChangeFilter({ warningFilter: 'all' })} className="ml-1.5 hover:text-indigo-900">
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Hazard Filter */}
        <select
          value={filter.hazardFilter}
          onChange={e => onChangeFilter({ hazardFilter: e.target.value })}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
        >
          <option value="all">위험물 등급 전체</option>
          {availableHazards.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        {/* Storage Filter */}
        <select
          value={filter.storageFilter}
          onChange={e => onChangeFilter({ storageFilter: e.target.value })}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
        >
          <option value="all">보관조건 전체</option>
          {availableStorages.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Lab Filter */}
        <select
          value={filter.labFilter}
          onChange={e => onChangeFilter({ labFilter: e.target.value })}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
        >
          <option value="all">연구실 전체 (LAB)</option>
          {availableLabs.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
