import React, { useState } from 'react';
import { Upload, FileText, X, AlertCircle, Check } from 'lucide-react';
import { parseCSV } from '../utils/reagentUtils';
import { ReagentItem } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: ReagentItem[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [pastedText, setPastedText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ReagentItem[] | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const items = parseCSV(text);
        if (items.length === 0) {
          setErrorMsg('파싱 가능한 데이터가 없습니다. CSV 헤더 형식을 확인해 주세요.');
          return;
        }
        setParsedPreview(items);
        setSuccessCount(items.length);
        setErrorMsg('');
      } catch (err) {
        setErrorMsg('파일 읽기 또는 CSV 파싱 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleTextParse = () => {
    if (!pastedText.trim()) {
      setErrorMsg('붙여넣을 텍스트가 없습니다.');
      return;
    }
    try {
      const items = parseCSV(pastedText);
      if (items.length === 0) {
        setErrorMsg('파싱 가능한 데이터가 없습니다.');
        return;
      }
      setParsedPreview(items);
      setSuccessCount(items.length);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('텍스트 파싱 중 오류가 발생했습니다.');
    }
  };

  const confirmImport = () => {
    if (parsedPreview && parsedPreview.length > 0) {
      onImport(parsedPreview);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">시약 재고대장 반입 (F-01)</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-200 text-sm">
            <button
              onClick={() => setActiveTab('file')}
              className={`pb-2.5 px-4 font-semibold border-b-2 transition-colors ${activeTab === 'file' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              CSV 파일 업로드
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`pb-2.5 px-4 font-semibold border-b-2 transition-colors ${activeTab === 'text' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              텍스트 붙여넣기
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'file' ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">시약 재고대장 CSV 파일을 선택하세요</p>
                <p className="text-xs text-slate-500 mt-1">UTF-8 인코딩, 첫 행 헤더 필수 (`dr01_reagent_inventory.csv` 호환)</p>
                <label className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-indigo-700 shadow-xs transition-colors">
                  파일 선택
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">CSV 또는 탭 구분 대장 텍스트 입력</label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="reagent_id,reagent_name,cas_no,hazard_class,storage_temp,location,init_qty,remain_qty,qty_unit,receipt_date,expiry_date,emp_name,remark..."
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                onClick={handleTextParse}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
              >
                텍스트 파싱 검증
              </button>
            </div>
          )}

          {successCount !== null && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>총 {successCount}건의 시약 데이터 파싱 완료!</span>
              </div>
              <span className="text-xs text-emerald-600 font-medium">자동 판정 준비 완료</span>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-slate-200 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={confirmImport}
            disabled={!parsedPreview || parsedPreview.length === 0}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
          >
            대장 반영하기
          </button>
        </div>

      </div>
    </div>
  );
};
