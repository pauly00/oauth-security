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
    login();
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

          <div className="space-y-6">
            <button
              onClick={() => login()}
              disabled={authLoading}
              className="w-full group relative flex items-center justify-center gap-3 py-4 bg-[#0F172A] text-white font-black rounded-xl shadow-xl shadow-slate-200 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-70 disabled:translate-y-0 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="text-xl">🔑</span>
              <span>OAuth로 로그인하기</span>
            </button>
            
            <p className="text-center text-slate-400 text-xs font-medium px-4">
              Fisa OAuth 플랫폼을 통해 안전하게 로그인합니다.
            </p>
          </div>

          <p className="mt-8 text-xs text-slate-400 text-center font-medium">
            시연용 비밀번호는 모두 <strong className="text-slate-600">1234</strong>입니다
          </p>
        </div>
      </div>
    </div>
  );
}
