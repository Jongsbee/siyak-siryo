import React from 'react';
import { ReagentItem, DuplicateGroupInfo } from '../types';
import { X, AlertTriangle, Clock, TrendingDown, AlertOctagon, Copy, CheckCircle2, Shield, Calendar, MapPin, User, FileText, Edit, Trash2 } from 'lucide-react';
import { BASE_DATE_STR } from '../utils/reagentUtils';

interface DetailModalProps {
  item: ReagentItem | null;
  duplicateGroups: DuplicateGroupInfo[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: ReagentItem) => void;
  onDelete: (reagent_id: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  duplicateGroups,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!isOpen || !item) return null;

  // Find if this item belongs to any duplicate group
  const matchingGroup = duplicateGroups.find(g => g.cas_no === item.cas_no);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
              {item.reagent_id}
            </span>
            <h2 className="text-lg font-bold text-slate-900">{item.reagent_name}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Status Alert Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Expiry Status */}
            <div className={`p-3.5 rounded-xl border flex items-center space-x-3 ${
              item.expiry_state === '만료' ? 'bg-red-50 border-red-200 text-red-900' :
              item.expiry_state === '임박' ? 'bg-orange-50 border-orange-200 text-orange-900' :
              item.expiry_state === '정상' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="p-2 rounded-lg bg-white/80 shadow-xs">
                {item.expiry_state === '만료' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
                 item.expiry_state === '임박' ? <Clock className="w-5 h-5 text-orange-600" /> :
                 <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </div>
              <div>
                <div className="text-xs font-medium opacity-80">유효기간 판정 (기준일: {BASE_DATE_STR})</div>
                <div className="text-sm font-bold mt-0.5">
                  {item.expiry_state} {item.d_day !== null ? `(D${item.d_day >= 0 ? '-' + item.d_day : '+' + Math.abs(item.d_day)})` : ''}
                </div>
              </div>
            </div>

            {/* Qty Status */}
            <div className={`p-3.5 rounded-xl border flex items-center space-x-3 ${
              item.qty_state === '데이터 오류' ? 'bg-rose-50 border-rose-200 text-rose-900' :
              item.qty_state === '부족' ? 'bg-amber-50 border-amber-200 text-amber-900' :
              item.qty_state === '정상' ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="p-2 rounded-lg bg-white/80 shadow-xs">
                {item.qty_state === '데이터 오류' ? <AlertOctagon className="w-5 h-5 text-rose-600" /> :
                 item.qty_state === '부족' ? <TrendingDown className="w-5 h-5 text-amber-600" /> :
                 <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
              </div>
              <div>
                <div className="text-xs font-medium opacity-80">잔량률 및 판정</div>
                <div className="text-sm font-bold mt-0.5">
                  {item.qty_state} {item.qty_percentage !== null ? `(${item.qty_percentage}%)` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Duplicate Candidate Notice */}
          {item.is_duplicate_candidate && matchingGroup && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs uppercase tracking-wide">
                <Copy className="w-4 h-4 text-purple-600" />
                <span>중복 등록 후보 그룹 검출 (CAS: {item.cas_no})</span>
              </div>
              <p className="text-xs text-purple-700">
                동일 CAS 번호 내에 표기가 상이한 시약명이 복수 등록되어 있습니다 (물질 재고 집계 왜곡 주의).
              </p>
              <div className="bg-white rounded-lg p-3 border border-purple-100 space-y-1.5 text-xs">
                {matchingGroup.names.map((n, idx) => (
                  <div key={idx} className="flex justify-between items-center font-medium">
                    <span className="text-slate-800 font-semibold">• "{n.name}"</span>
                    <span className="text-slate-500 font-mono">등록 {n.count}건 / 잔량합산: {n.totalRemain}{n.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Attributes Grid */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">시약 ID</span>
              <span className="font-mono font-bold text-slate-800">{item.reagent_id}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">CAS 번호</span>
              <span className="font-mono font-bold text-slate-800">{item.cas_no}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">위험물 등급</span>
              <span className="font-semibold text-slate-800">{item.hazard_class}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">보관 조건</span>
              <span className="font-semibold text-slate-800">{item.storage_temp}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">보관 위치</span>
              <span className="font-semibold text-slate-800">{item.location}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">담당 연구원</span>
              <span className="font-semibold text-slate-800">{item.emp_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">초기 입고량</span>
              <span className="font-semibold text-slate-800">{item.init_qty} {item.qty_unit}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">현재 잔량</span>
              <span className="font-semibold text-slate-800">{item.remain_qty !== null ? `${item.remain_qty} ${item.qty_unit}` : '미기재'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">입고일자</span>
              <span className="font-mono font-semibold text-slate-800">{item.receipt_date}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">유효기간</span>
              <span className="font-mono font-semibold text-slate-800">{item.expiry_date || '미기재'}</span>
            </div>
          </div>

          {item.remark && (
            <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs">
              <span className="font-bold text-amber-900 block mb-0.5">특이사항 (Remark)</span>
              <span className="text-amber-800">{item.remark}</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={() => {
              if (window.confirm('정말 이 시약 항목을 삭제하시겠습니까?')) {
                onDelete(item.reagent_id);
                onClose();
              }
            }}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            삭제
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              닫기
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              수정
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
