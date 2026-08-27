import React, { useState } from 'react';
import { getSupabaseClient, getStoredSupabaseConfig } from '../utils/supabaseClient';
import { Database, Lock, Mail, Key, ArrowRight, Settings, AlertCircle, CheckCircle2, UserPlus, LogIn } from 'lucide-react';
import { SupabaseConfigModal } from './SupabaseConfigModal';

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const config = getStoredSupabaseConfig();
  const isConfigured = !!(config.url && config.key && !config.url.includes('your-project-id'));

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
      setErrorMsg('먼저 우측 상단 또는 아래 버튼을 눌러 Supabase 연동 설정을 완료해주세요.');
      setIsConfigOpen(true);
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setErrorMsg('Supabase 클라이언트를 초기화할 수 없습니다. 설정을 확인하세요.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const { data, error } = await client.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        if (data.session) {
          onLoginSuccess(data.user);
        } else {
          setSuccessMsg('회원가입이 완료되었습니다! 이메일 인증이 필요한 경우 메일함 또는 Supabase 설정을 확인하세요.');
        }
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || '인증 과정에서 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
            <Database className="w-7 h-7" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-white">
          시약·시료 재고 관리대장
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Supabase 인증 기반 연구실 보안 재고 시스템
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200">
          
          {/* Supabase Status Banner */}
          <div className="mb-6 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-semibold text-slate-700">
                {isConfigured ? 'Supabase 연동됨' : 'Supabase 미설정'}
              </span>
            </div>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-bold"
            >
              <Settings className="w-3.5 h-3.5 mr-1" />
              {isConfigured ? '설정 변경' : '연동 설정하기'}
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">이메일 주소</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="researcher@lab.ac.kr"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>처리 중...</span>
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Supabase 회원가입</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Supabase 로그인</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인하기' : '계정이 없으신가요? Supabase 회원가입'}
            </button>
          </div>

        </div>
      </div>

      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfigSaved={() => {
          setIsConfigOpen(false);
        }}
      />
    </div>
  );
};
