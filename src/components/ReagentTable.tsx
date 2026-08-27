import React from 'react';
import { ReagentItem } from '../types';
import { AlertTriangle, Clock, AlertOctagon, Copy, CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react';

interface ReagentTableProps {
  items: ReagentItem[];
  onSelectItem: (item: ReagentItem) => void;
}

export const ReagentTable: React.FC<ReagentTableProps> = ({ items, onSelectItem }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">조건에 해당하는 시약이 없습니다</h3>
        <p className="text-sm text-slate-500 mt-1">검색어나 필터 조건을 변경하거나 초기화해 주세요.</p>
      </div>
    );
  }

  const getHazardBadgeStyle = (hazard: string) => {
    switch (hazard) {
      case '인화성':
        return 'bg-red-50 text-red-700 border-red-200';
      case '독성':
        return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
      case '부식성':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case '산화성':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStorageBadgeStyle = (storage: string) => {
    switch (storage) {
      case '-20℃':
        return 'bg-indigo-900 text-white';
      case '4℃':
        return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  const getExpiryBadge = (item: ReagentItem) => {
    if (item.expiry_state === '만료') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-300">
          <AlertTriangle className="w-3 h-3 mr-1 text-red-600" />
          만료 ({item.d_day !== null ? `D+${Math.abs(item.d_day)}` : ''})
        </span>
      );
    }
    if (item.expiry_state === '임박') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
          <Clock className="w-3 h-3 mr-1 text-orange-600" />
          임박 ({item.d_day === 0 ? 'D-DAY' : `D-${item.d_day}`})
        </span>
      );
    }
    if (item.expiry_state === '정상') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          정상 (D-{item.d_day})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
        유효기간 미기재
      </span>
    );
  };

  const getQtyBar = (item: ReagentItem) => {
    if (item.remain_qty === null) {
      return <span className="text-xs text-slate-400 italic">잔량 미기재</span>;
    }
    if (item.qty_state === '데이터 오류') {
      return (
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
            <AlertOctagon className="w-3 h-3 mr-1" />
            데이터 오류 ({item.qty_percentage !== null ? `${item.qty_percentage}%` : '초과'})
          </span>
        </div>
      );
    }

    const pct = item.qty_percentage ?? 0;
    const isLow = item.qty_state === '부족';
    const barColor = isLow ? 'bg-amber-500' : 'bg-indigo-600';

    return (
      <div className="w-full max-w-[140px]">
        <div className="flex items-center justify-between text-xs mb-1 font-medium">
          <span className={isLow ? 'text-amber-700 font-bold' : 'text-slate-700'}>
            {item.remain_qty} / {item.init_qty} {item.qty_unit}
          </span>
          <span className={isLow ? 'text-amber-700 font-bold' : 'text-slate-500'}>
            ({pct}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
          />
        </div>
        {isLow && (
          <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-700">
            ⚠️ 부족 경고 (≤20%)
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">시약 ID / 명칭</th>
              <th className="py-3 px-4">CAS 번호</th>
              <th className="py-3 px-4">등급 / 보관</th>
              <th className="py-3 px-4">보관 위치</th>
              <th className="py-3 px-4">유효기간 판정</th>
              <th className="py-3 px-4">잔량 현황</th>
              <th className="py-3 px-4">담당자</th>
              <th className="py-3 px-4 text-right">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {items.map((item, idx) => {
              const rowHighlight =
                item.expiry_state === '만료' || item.qty_state === '데이터 오류' || item.date_reversed
                  ? 'bg-red-50/30 hover:bg-red-50/50'
                  : item.expiry_state === '임박' || item.qty_state === '부족'
                  ? 'bg-amber-50/20 hover:bg-amber-50/40'
                  : 'hover:bg-slate-50/80';

              return (
                <tr
                  key={`${item.reagent_id}-${idx}`}
                  onClick={() => onSelectItem(item)}
                  className={`cursor-pointer transition-colors ${rowHighlight}`}
                >
                  {/* ID / Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.reagent_id}
                      </span>
                      {item.is_duplicate_candidate && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded border border-purple-200" title="동일 CAS 내 명칭 상이 중복 후보">
                          <Copy className="w-2.5 h-2.5 mr-0.5" />
                          중복후보
                        </span>
                      )}
                      {item.date_reversed && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded border border-rose-200" title="입고일이 유효기간보다 늦음">
                          일자역전
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-slate-900 mt-1">{item.reagent_name}</div>
                    {item.remark && (
                      <div className="text-xs text-slate-500 mt-0.5 italic line-clamp-1">{item.remark}</div>
                    )}
                  </td>

                  {/* CAS */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                    {item.cas_no}
                  </td>

                  {/* Hazard & Storage */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col space-y-1.5 items-start">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getHazardBadgeStyle(item.hazard_class)}`}>
                        {item.hazard_class}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${getStorageBadgeStyle(item.storage_temp)}`}>
                        {item.storage_temp}
                      </span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 font-medium text-slate-700 text-xs">
                    {item.location}
                  </td>

                  {/* Expiry State */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col space-y-1 items-start">
                      {getExpiryBadge(item)}
                      <span className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {item.expiry_date || '미기재'}
                      </span>
                    </div>
                  </td>

                  {/* Quantity State */}
                  <td className="py-3.5 px-4">
                    {getQtyBar(item)}
                  </td>

                  {/* Employee */}
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                    {item.emp_name}
                  </td>

                  {/* Arrow Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
