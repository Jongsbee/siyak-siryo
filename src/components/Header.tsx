import React from 'react';
import { Database, Upload, Plus, Copy, Download, RefreshCw, Calendar, LogOut, User, Settings } from 'lucide-react';
import { BASE_DATE_STR } from '../utils/reagentUtils';

interface HeaderProps {
  onOpenImport: () => void;
  onOpenAdd: () => void;
  onOpenOrderList: () => void;
  onExportCSV: () => void;
  onResetSample: () => void;
  onLogout: () => void;
  onOpenConfig: () => void;
  userEmail?: string;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenImport,
  onOpenAdd,
  onOpenOrderList,
  onExportCSV,
  onResetSample,
  onLogout,
  onOpenConfig,
  userEmail,
  totalCount
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Title & Badge */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">시약·시료 재고 관리대장</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  PRD-R02 (총 {totalCount}건)
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-500 font-medium">
                <span className="inline-flex items-center text-slate-600">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  기준일: <strong className="ml-1 text-slate-800">{BASE_DATE_STR}</strong>
                </span>
                <span>•</span>
                <span className="inline-flex items-center text-emerald-600 font-semibold">
                  <User className="w-3 h-3 mr-1" />
                  {userEmail || 'Supabase 인증됨'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenImport}
              className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-xs transition-colors"
              title="CSV 파일 또는 텍스트 대장 반입"
            >
              <Upload className="w-4 h-4 mr-1.5 text-slate-500" />
              대장 반입
            </button>

            <button
              onClick={onOpenAdd}
              className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
              title="새 시약 직접 등록"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              시약 등록
            </button>

            <button
              onClick={onOpenOrderList}
              className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 shadow-xs transition-colors"
              title="만료·임박·부족 항목 발주 후보 복사"
            >
              <Copy className="w-4 h-4 mr-1.5 text-amber-600" />
              발주 후보 복사
            </button>

            <button
              onClick={onExportCSV}
              className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-xs transition-colors"
              title="현재 목록 CSV 다운로드"
            >
              <Download className="w-4 h-4 mr-1.5 text-slate-500" />
              내보내기
            </button>

            <button
              onClick={onResetSample}
              className="inline-flex items-center px-2.5 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="초기 샘플 데이터(80행)로 복원"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenConfig}
              className="inline-flex items-center px-2.5 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Supabase 설정"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 shadow-xs transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4 mr-1" />
              로그아웃
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
