import React, { useState, useEffect } from 'react';
import { ReagentItem } from '../types';
import { X, Plus, Save } from 'lucide-react';

interface AddEditModalProps {
  isOpen: boolean;
  itemToEdit: ReagentItem | null;
  onClose: () => void;
  onSave: (item: ReagentItem, isEdit: boolean) => void;
}

export const AddEditModal: React.FC<AddEditModalProps> = ({
  isOpen,
  itemToEdit,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<ReagentItem>({
    reagent_id: '',
    reagent_name: '',
    cas_no: '',
    hazard_class: '인화성',
    storage_temp: 'RT',
    location: 'LAB-1 A-01',
    init_qty: 500,
    remain_qty: 500,
    qty_unit: 'mL',
    receipt_date: '2026-08-27',
    expiry_date: '2028-08-27',
    emp_name: '',
    remark: ''
  });

  useEffect(() => {
    if (itemToEdit) {
      setFormData(itemToEdit);
    } else {
      setFormData({
        reagent_id: `RG-${Math.floor(100 + Math.random() * 900)}`,
        reagent_name: '',
        cas_no: '900-99-9',
        hazard_class: '인화성',
        storage_temp: 'RT',
        location: 'LAB-1 A-01',
        init_qty: 500,
        remain_qty: 500,
        qty_unit: 'mL',
        receipt_date: '2026-08-27',
        expiry_date: '2028-08-27',
        emp_name: '',
        remark: ''
      });
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reagent_id || !formData.reagent_name || !formData.cas_no) {
      alert('시약 ID, 시약명, CAS 번호는 필수 입력 항목입니다.');
      return;
    }
    onSave(formData, !!itemToEdit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-base font-bold text-slate-900">
            {itemToEdit ? '시약 정보 수정' : '신규 시약 등록'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">시약 ID *</label>
              <input
                type="text"
                required
                value={formData.reagent_id}
                onChange={e => setFormData({ ...formData, reagent_id: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">CAS 번호 *</label>
              <input
                type="text"
                required
                value={formData.cas_no}
                onChange={e => setFormData({ ...formData, cas_no: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">시약명 *</label>
            <input
              type="text"
              required
              value={formData.reagent_name}
              onChange={e => setFormData({ ...formData, reagent_name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">위험물 등급</label>
              <select
                value={formData.hazard_class}
                onChange={e => setFormData({ ...formData, hazard_class: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="인화성">인화성</option>
                <option value="독성">독성</option>
                <option value="부식성">부식성</option>
                <option value="산화성">산화성</option>
                <option value="해당없음">해당없음</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">보관 온도</label>
              <select
                value={formData.storage_temp}
                onChange={e => setFormData({ ...formData, storage_temp: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="RT">RT (실온)</option>
                <option value="4℃">4℃ (냉장)</option>
                <option value="-20℃">-20℃ (냉동)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">보관 위치 (LAB)</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">초기 입고량</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.init_qty}
                onChange={e => setFormData({ ...formData, init_qty: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">현재 잔량</label>
              <input
                type="number"
                step="0.1"
                value={formData.remain_qty !== null ? formData.remain_qty : ''}
                onChange={e => setFormData({ ...formData, remain_qty: e.target.value === '' ? null : Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">단위</label>
              <select
                value={formData.qty_unit}
                onChange={e => setFormData({ ...formData, qty_unit: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="g">g</option>
                <option value="mL">mL</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">입고일자</label>
              <input
                type="date"
                value={formData.receipt_date}
                onChange={e => setFormData({ ...formData, receipt_date: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">유효기간</label>
              <input
                type="date"
                value={formData.expiry_date || ''}
                onChange={e => setFormData({ ...formData, expiry_date: e.target.value || null })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">담당 연구원</label>
              <input
                type="text"
                value={formData.emp_name}
                onChange={e => setFormData({ ...formData, emp_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">특이사항 (Remark)</label>
              <input
                type="text"
                value={formData.remark || ''}
                onChange={e => setFormData({ ...formData, remark: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
            >
              취소
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 shadow-xs"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              저장하기
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
