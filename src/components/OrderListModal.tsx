import React, { useState } from 'react';
import { ReagentItem } from '../types';
import { X, Copy, Check, Clipboard } from 'lucide-react';

interface OrderListModalProps {
  isOpen: boolean;
  items: ReagentItem[];
  onClose: () => void;
}

export const OrderListModal: React.FC<OrderListModalProps> = ({ isOpen, items, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Filter items that need ordering or attention: expired, imminent, low stock
  const orderItems = items.filter(
    item => item.expiry_state === '만료' || item.expiry_state === '임박' || item.qty_state === '부족'
  );

  const generateTabText = () => {
    const header = '시약ID\t시약명\tCAS번호\t보관위치\t유효기간상태\t잔량상태\t담당자\t비고';
    const rows = orderItems.map(item =>
      `${item.reagent_id}\t${item.reagent_name}\t${item.cas_no}\t${item.location}\t${item.expiry_state} (${item.d_day !== null ? 'D' + (item.d_day >= 0 ? '-' + item.d_day : '+' + Math.abs(item.d_day)) : '미기재'})\t${item.qty_state} (${item.remain_qty !== null ? item.remain_qty + item.qty_unit : '미기재'})\t${item.emp_name}\t${item.remark || ''}`
    );
    return [header, ...rows].join('\n');
  };

  const handleCopy = () => {
    const text = generateTabText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <Clipboard className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">발주 후보 목록 (만료·임박·부족)</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>발주 검토 대상 시약: <strong className="text-amber-700">{orderItems.length}건</strong></span>
            <span>Excel 붙여넣기 호환 탭(Tab) 구분 텍스트</span>
          </div>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs max-h-60 overflow-y-auto selection:bg-indigo-500">
            <pre className="whitespace-pre-wrap">{generateTabText()}</pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-slate-200 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
            {copied ? '클립보드 복사 완료!' : '탭 구분 텍스트 복사'}
          </button>
        </div>

      </div>
    </div>
  );
};
