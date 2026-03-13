"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';

export default function SalaryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [yearMonth, setYearMonth] = useState('');
  const [salaries, setSalaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [payLoading, setPayLoading] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }
    if (user && user.role !== 'HR' && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    if (user) {
      const now = new Date();
      setYearMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    }
  }, [user, authLoading]);

  const loadSalaries = async () => {
    if (!user || !yearMonth) return;
    setIsLoading(true);
    try {
      const data = await API.getSalary(user.companyId, yearMonth);
      setSalaries(data);
    } catch (err: any) {
      alert(err.message || '급여 데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async (id: number) => {
    if (!user) return;
    if (!confirm('급여를 지급 처리하시겠습니까?')) return;
    setPayLoading(id);
    try {
      await API.paySalary(id, user.id);
      loadSalaries(); // 목록 새로고침
    } catch (err: any) {
      alert(err.message || '지급 처리 실패');
    } finally {
      setPayLoading(null);
    }
  };

  const handlePayAll = async () => {
    if (!user) return;
    const pending = salaries.filter(s => s.status === 'PENDING');
    if (pending.length === 0) return alert('지급 대기 중인 급여가 없습니다.');
    if (!confirm(`${pending.length}건의 급여를 일괄 지급 처리하시겠습니까?`)) return;
    try {
      await Promise.all(pending.map(s => API.paySalary(s.id, user.id)));
      loadSalaries();
    } catch (err: any) {
      alert(err.message || '일괄 지급 실패');
    }
  };

  if (authLoading || !user) return null;

  const totalAmount = salaries.reduce((acc, s) => acc + Number(s.totalSalary), 0);
  const paidCount = salaries.filter(s => s.status === 'PAID').length;

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <Sidebar />
      
      <main className="flex-1 ml-60 p-8 max-w-6xl">
        <header className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">💰 급여 지급 관리</h2>
          <p className="text-slate-500 text-sm mt-1">야근 수당이 반영된 급여를 확인하고 지급 처리합니다.</p>
        </header>

        {/* Filter Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-end gap-4 flex-wrap">
          <div className="space-y-1.5 shrink-0">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">조회 년월</label>
            <input
              type="month"
              value={yearMonth}
              onChange={(e) => setYearMonth(e.target.value)}
              className="w-48 px-4 py-2 rounded-lg border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-black text-slate-800"
            />
          </div>
          <button 
            onClick={loadSalaries}
            disabled={isLoading}
            className="px-6 py-2.5 bg-indigo-600 text-white font-black text-xs rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-60"
          >
            {isLoading ? '조회 중...' : '조회하기'}
          </button>
          <button 
            onClick={handlePayAll}
            disabled={isLoading || salaries.filter(s => s.status === 'PENDING').length === 0}
            className="px-6 py-2.5 bg-emerald-600 text-white font-black text-xs rounded-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 ml-auto disabled:opacity-60"
          >
            💰 미지급분 일괄 지급
          </button>
        </div>

        {/* Summary Row */}
        {salaries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
              <div className="text-xl">👥</div>
              <div className="text-xl font-black text-slate-800">{salaries.length}명</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">대상 사원</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
              <div className="text-xl">💵</div>
              <div className="text-xl font-black text-slate-800">{(totalAmount / 10000).toLocaleString()}만원</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">총 지급액</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
              <div className="text-xl">🌙</div>
              <div className="text-xl font-black text-slate-800">{(salaries.reduce((a, s) => a + Number(s.overtimePay), 0) / 10000).toLocaleString()}만원</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">야근수당 합계</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-cyan-500">
              <div className="text-xl">✅</div>
              <div className="text-xl font-black text-slate-800">{paidCount} / {salaries.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">지급 완료 건수</div>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-tight">
            <span className="text-xl">📊</span> 급여 내역
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">사원명</th>
                  <th className="px-5 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">직책</th>
                  <th className="px-5 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">기본급</th>
                  <th className="px-5 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">야근수당</th>
                  <th className="px-5 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">합계</th>
                  <th className="px-5 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">상태</th>
                  <th className="px-5 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">처리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-bold">데이터 분석 중...</td></tr>
                ) : salaries.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-bold">연월을 선택하고 조회를 클릭하세요.</td></tr>
                ) : salaries.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-5 text-center font-black text-slate-800">{s.employeeName}</td>
                    <td className="px-5 py-5 font-bold text-slate-500">{s.rankTitle}</td>
                    <td className="px-5 py-5 text-right font-medium text-slate-500">{Number(s.baseSalary).toLocaleString()}원</td>
                    <td className={`px-5 py-5 text-right font-black ${Number(s.overtimePay) > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                      {Number(s.overtimePay) > 0 ? `+${Number(s.overtimePay).toLocaleString()}` : '0'}원
                    </td>
                    <td className="px-5 py-5 text-right font-black text-[#0F172A]">{Number(s.totalSalary).toLocaleString()}원</td>
                    <td className="px-5 py-5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tight ${
                        s.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/10' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/10'
                      }`}>
                        {s.status === 'PAID' ? '지급완료' : '지급대기'}
                      </span>
                    </td>
                    <td className="px-5 py-5 text-center">
                      {s.status === 'PENDING' ? (
                        <button
                          onClick={() => handlePay(s.id)}
                          disabled={payLoading === s.id}
                          className="px-4 py-1.5 bg-emerald-600 text-white font-black text-[11px] rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-60"
                        >
                          {payLoading === s.id ? '처리중...' : '지급'}
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-300">처리완료</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
