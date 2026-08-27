import React from 'react';
import { InventorySummary, FilterState } from '../types';
import { AlertTriangle, Clock, TrendingDown, AlertOctagon, Copy, HelpCircle, Layers } from 'lucide-react';

interface DashboardCardsProps {
  summary: InventorySummary;
  filter: FilterState;
  onSelectWarningFilter: (warning: FilterState['warningFilter']) => void;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  summary,
  filter,
  onSelectWarningFilter
}) => {
  const cards = [
    {
      id: 'all',
      label: '전체 시약',
      count: summary.totalCount,
      unit: '건',
      icon: Layers,
      color: 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300',
      iconColor: 'text-slate-600 bg-slate-100',
      activeBorder: 'ring-2 ring-slate-500'
    },
    {
      id: '만료',
      label: '유효기간 만료',
      count: summary.expiredCount,
      unit: '건',
      icon: AlertTriangle,
      color: 'bg-red-50/60 border-red-200 text-red-900 hover:bg-red-50',
      iconColor: 'text-red-600 bg-red-100',
      activeBorder: 'ring-2 ring-red-500'
    },
    {
      id: '임박',
      label: '유효기간 임박 (30일내)',
      count: summary.imminentCount,
      unit: '건',
      icon: Clock,
      color: 'bg-orange-50/60 border-orange-200 text-orange-900 hover:bg-orange-50',
      iconColor: 'text-orange-600 bg-orange-100',
      activeBorder: 'ring-2 ring-orange-500'
    },
    {
      id: '부족',
      label: '잔량 부족 (20% 이하)',
      count: summary.lowStockCount,
      unit: '건',
      icon: TrendingDown,
      color: 'bg-amber-50/60 border-amber-200 text-amber-900 hover:bg-amber-50',
      iconColor: 'text-amber-600 bg-amber-100',
      activeBorder: 'ring-2 ring-amber-500'
    },
    {
      id: '데이터 오류',
      label: '데이터 오류 / 일자역전',
      count: summary.errorStockCount,
      unit: '건',
      icon: AlertOctagon,
      color: 'bg-rose-50/60 border-rose-200 text-rose-900 hover:bg-rose-50',
      iconColor: 'text-rose-600 bg-rose-100',
      activeBorder: 'ring-2 ring-rose-500'
    },
    {
      id: '중복 후보',
      label: '중복 등록 후보 (CAS)',
      count: summary.duplicateGroupCount,
      unit: '그룹',
      icon: Copy,
      color: 'bg-purple-50/60 border-purple-200 text-purple-900 hover:bg-purple-50',
      iconColor: 'text-purple-600 bg-purple-100',
      activeBorder: 'ring-2 ring-purple-500'
    },
    {
      id: '결측',
      label: '필수 데이터 결측',
      count: summary.missingDataCount,
      unit: '행',
      icon: HelpCircle,
      color: 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100',
      iconColor: 'text-slate-500 bg-slate-200',
      activeBorder: 'ring-2 ring-slate-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
      {cards.map(card => {
        const Icon = card.icon;
        const isActive = filter.warningFilter === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onSelectWarningFilter(card.id as FilterState['warningFilter'])}
            className={`text-left p-3.5 rounded-xl border transition-all shadow-xs flex flex-col justify-between ${card.color} ${isActive ? card.activeBorder : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600 line-clamp-1">{card.label}</span>
              <div className={`p-1.5 rounded-lg ${card.iconColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold tracking-tight">
                {card.count}
              </span>
              <span className="text-xs text-slate-500 font-medium">{card.unit}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
