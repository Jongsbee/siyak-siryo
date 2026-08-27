import React, { useState } from 'react';
import { getStoredSupabaseConfig, saveSupabaseConfig, getSupabaseClient } from '../utils/supabaseClient';
import { Settings, X, Check, Key, Globe, AlertCircle, ExternalLink } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const current = getStoredSupabaseConfig();
  const [url, setUrl] = useState(current.url);
  const [key, setKey] = useState(current.key);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !key) {
      setErrorMsg('Supabase URL과 Anon Key를 모두 입력해주세요.');
      return;
    }

    try {
      saveSupabaseConfig(url, key);
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase 클라이언트 생성 실패');
      }

      // Test connection by fetching auth settings or health check
      const { data, error } = await client.auth.getSession();
      if (error && error.message.includes('Invalid API key')) {
        throw new Error('유효하지 않은 Anon Key 입니다.');
      }

      setTestStatus('success');
      setErrorMsg('');
      setTimeout(() => {
        onConfigSaved();
        onClose();
      }, 1000);
    } catch (err: any) {
      setTestStatus('error');
      setErrorMsg(err.message || 'Supabase 연결에 실패했습니다. URL과 Key를 확인해주세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Supabase 연동 설정</h2>
              <p className="text-xs text-slate-500">인증 및 데이터 저장을 위한 Supabase 프로젝트 파라미터 입력</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleTestAndSave} className="p-6 space-y-4 text-xs">
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-900 space-y-1">
            <div className="font-bold flex items-center">
              <span>💡 Supabase 프로젝트 연결 안내</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Supabase 대시보드(Project Settings &gt; API)에서 <strong>Project URL</strong>과 <strong>anon/public key</strong>를 복사하여 입력하세요.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {testStatus === 'success' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Supabase 연동 테스트 성공! 설정을 저장하고 있습니다...</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center">
              <Globe className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Supabase Project URL *
            </label>
            <input
              type="url"
              required
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center">
              <Key className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Supabase Anon / Public Key *
            </label>
            <input
              type="password"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={e => setKey(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
            />
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
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 shadow-xs transition-colors"
            >
              연동 테스트 및 저장
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
