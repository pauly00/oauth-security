"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';

export default function RankManagementPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [ranks, setRanks] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [level, setLevel] = useState('');
  const [title, setTitle] = useState('');
  const [formError, setFormError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) { router.push('/'); return; }
    if (user && user.role !== 'HR' && user.role !== 'ADMIN') { router.push('/dashboard'); return; }
    if (user) { fetchRanks(); }
  }, [user, authLoading]);

  const fetchRanks = async () => {
    if (!user) return;
    setIsFetching(true);
    try {
      const data = await API.getRankLevels(user.companyId);
      setRanks(data);
    } catch (err) { console.error('Failed to load ranks', err); }
    finally { setIsFetching(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsAdding(true);
    setFormError('');
    try {
      await API.createRankLevel({ companyId: user.companyId, level: Number(level), title });
      setLevel('');
      setTitle('');
      fetchRanks();
    } catch (err: any) {
      setFormError(err.message || '직책 추가 실패');
    } finally { setIsAdding(false); }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" 직책을 삭제하시겠습니까?\n해당 직책에 배정된 사원이 있으면 삭제가 불가합니다.`)) return;
    try {
      await API.deleteRankLevel(id);
      fetchRanks();
    } catch (err: any) {
      alert(err.message || '삭제 실패.\n해당 직책에 소속된 사원이 있으면 삭제할 수 없습니다.');
    }
  };

  if (authLoading || !user) return null;

  // 레벨 높은 숫자 = 상위 직책 (부장이 최고 레벨, 내림차순으로 표시)
  const sortedRanks = [...ranks].sort((a, b) => b.level - a.level);
  const maxLevel = sortedRanks.length > 0 ? sortedRanks[0].level : null;
  const minLevel = sortedRanks.length > 0 ? sortedRanks[sortedRanks.length - 1].level : null;

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <Sidebar />
      <main className="flex-1 ml-60 p-8 max-w-4xl">
        <header className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">⚙️ 직책 관리</h2>
          <p className="text-slate-500 text-sm mt-1">승인 워크플로우에 사용될 직책 계층을 설정합니다. <strong>레벨 숫자가 클수록 상위 직책</strong> (예: 레벨 5 = 부장, 레벨 1 = 계장)</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Add Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-700 mb-5 uppercase tracking-tight">➕ 새 직책 추가</h3>
              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold">{formError}</div>
              )}
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">레벨 (숫자, 낮을수록 상위)</label>
                  <input
                    type="number" min="1" required
                    value={level} onChange={e => setLevel(e.target.value)}
                    placeholder="예: 5 (부장), 4 (차장), 3 (과장) ..."
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">직책명</label>
                  <input
                    required
                    value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="예: 부장, 과장, 대리 ..."
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-800"
                  />
                </div>
                <button type="submit" disabled={isAdding}
                  className="w-full py-3 bg-indigo-600 text-white font-black text-sm rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-60">
                  {isAdding ? '추가 중...' : '직책 추가'}
                </button>
              </form>
              <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-700 font-bold leading-relaxed">
                  💡 <strong>승인 워크플로우 자동 구성</strong><br />
                  레벨 기준으로 <strong>낮은 레벨부터 높은 레벨 순서</strong>로 결재를 받습니다.<br />
                  예) 레벨 1 직원 신청 → 레벨 2 → 레벨 5 (부장) 순서로 승인
                </p>
              </div>
            </div>
          </div>

          {/* Rank List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-tight">
                <span className="text-xl">📊</span> 현재 직책 목록 ({ranks.length}개)
              </div>
              <div className="divide-y divide-slate-100">
                {isFetching ? (
                  <div className="p-16 text-center text-slate-400 font-bold">불러오는 중...</div>
                ) : sortedRanks.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 font-bold">등록된 직책이 없습니다.<br />왼쪽 폼으로 직책을 추가해 주세요.</div>
                ) : sortedRanks.map((rank: any, idx: number) => (
                  <div key={rank.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                        {rank.level}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">{rank.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Level {rank.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {rank.level === maxLevel && sortedRanks.length > 0 && <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">👑 최상위 직책</span>}
                      {rank.level === minLevel && sortedRanks.length > 1 && <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-full">신입 직책</span>}
                      <button
                        onClick={() => handleDelete(rank.id, rank.title)}
                        className="px-3 py-1 bg-red-50 text-red-500 border border-red-200 rounded-lg text-[11px] font-bold hover:bg-red-100 transition-all">
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
