"use client";

import React, { useState, useEffect } from 'react';
import Particles from '@/components/Particles';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';

export default function LoginPage() {
  const { user, login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userData = await API.login(email, password);
      login(userData);
    } catch (err: any) {
      setError(err.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0F172A]">
      {/* Left Brand Area */}
      <div className="relative flex-1 hidden md:flex items-center justify-center p-10 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1a1035] overflow-hidden">
        <Particles />
        <div className="relative z-10 max-w-md w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight bg-gradient-to-br from-white to-cyan-400 bg-clip-text text-transparent mb-4">
            PAYROLL<br />SERVICE
          </h1>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
            체계적인 야근 승인 워크플로우와<br />투명한 급여 지급 시스템
          </p>
          
          <div className="space-y-4">
            {[
              { icon: '🏢', title: '커스터마이징 가능한 직책', desc: 'HR이 직접 직책 레벨을 설정' },
              { icon: '✅', title: '단계별 승인 워크플로우', desc: '계층 구조에 따른 자동 승인 체인' },
              { icon: '💰', title: '야근 수당 자동 계산', desc: '승인 시 수당 자동 반영' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-slate-200">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0 shadow-lg backdrop-blur-sm">
                  {feature.icon}
                </div>
                <div>
                  <div className="font-bold text-sm tracking-tight">{feature.title}</div>
                  <div className="text-xs text-white/50">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full md:w-[460px] bg-white flex items-center justify-center p-8 md:p-12 shadow-2xl relative z-20">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-extrabold text-[#0F172A] mb-1">로그인</h2>
          <p className="text-slate-500 text-sm mb-8 font-medium">이메일과 비밀번호를 입력하세요</p>

          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 mb-3 ml-1 flex items-center gap-1">
               🎯 빠른 로그인 (시연용)
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: '계장 김철수', email: 'kim@fisa.com' },
                { name: '대리 이영희', email: 'lee@fisa.com' },
                { name: '과장 최민수', email: 'choi@fisa.com' },
                { name: '차장 한지원', email: 'han@fisa.com' },
                { name: '부장 박민준', email: 'park@fisa.com' },
                { name: 'HR 정수진', email: 'hr@fisa.com', special: true },
              ].map((u) => (
                <button
                  key={u.email}
                  onClick={() => quickLogin(u.email, '1234')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    u.special 
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                      : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  👤 {u.name}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full mb-8" />

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#334155] ml-1" htmlFor="email">이메일</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 text-slate-900 font-medium"
                placeholder="example@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#334155] ml-1" htmlFor="password">비밀번호</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 text-slate-900 font-medium"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || authLoading}
              className="w-full py-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-black rounded-lg shadow-lg shadow-indigo-200 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-70 disabled:translate-y-0"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p className="mt-8 text-xs text-slate-400 text-center font-medium">
            시연용 비밀번호는 모두 <strong className="text-slate-600">1234</strong>입니다
          </p>
        </div>
      </div>
    </div>
  );
}
