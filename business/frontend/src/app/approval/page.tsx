"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 ring-amber-500/20',
    IN_PROGRESS: 'bg-indigo-50 text-indigo-700 ring-indigo-500/20',
    APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-500/20',
    REJECTED: 'bg-red-50 text-red-700 ring-red-500/20',
  };
  const labels: Record<string, string> = {
    PENDING: '대기중',
    IN_PROGRESS: '진행중',
    APPROVED: '승인됨',
    REJECTED: '반려됨',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ring-1 ring-inset ${styles[status] || ''}`}>
      {labels[status] || status}
    </span>
  );
};

export default function ApprovalPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }
    if (user) {
      fetchPending();
    }
  }, [user, authLoading]);

  const fetchPending = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await API.getPendingOvertime(user.id);
      setList(data);
    } catch (err) {
      console.error('Failed to load approval list', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!user) return;
    setActionLoading(id);
    try {
      await API.approveOvertime(id, user.id);
      fetchPending();
    } catch (err: any) {
      alert(err.message || '승인 실패');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!user) return;
    const comment = prompt('반려 사유를 입력하세요 (선택)') ?? '';
    setActionLoading(id);
    try {
      await API.rejectOvertime(id, user.id, comment);
      fetchPending();
    } catch (err: any) {
      alert(err.message || '반려 실패');
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <Sidebar />
      
      <main className="flex-1 ml-60 p-8 max-w-6xl">
        <header className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">✅ 승인 처리</h2>
          <p className="text-slate-500 text-sm mt-1">내 차례의 야근 신청서를 확인하고 승인 또는 반려합니다.</p>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center p-20 text-slate-400 font-bold">
            불러오는 중...
          </div>
        ) : list.length === 0 ? (
          <div className="bg-white p-16 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-lg font-extrabold text-[#0F172A]">처리할 승인 건이 없습니다!</p>
            <p className="text-sm text-slate-400 mt-1">모든 신청서를 완벽히 처리했습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs font-black text-slate-500 flex items-center gap-2 mb-2 uppercase tracking-wide">
              {list.length}건의 승인 대기 중
            </div>
            {list.map((o) => (
              <div key={o.id} className="bg-white p-6 rounded-xl border border-slate-200 border-l-4 border-l-amber-400 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-slate-800">{o.requesterName}</span>
                    <span className="text-[11px] font-bold text-slate-500 tracking-tight">{o.requesterRankTitle}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-600">
                      <span className="text-slate-300">📅</span> {o.overtimeDate}
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-600">
                      <span className="text-slate-300">⏱</span> {Number(o.hours).toFixed(1)}시간
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-indigo-600">
                      <span className="text-slate-300">💵</span> 수당 약 {(Number(o.hours) * 15000).toLocaleString()}원
                    </div>
                  </div>

                  <div className="text-sm text-slate-500 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="opacity-40">💬</span> {o.reason || '사유 없음'}
                  </div>
                </div>

                <div className="flex md:flex-col justify-end gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(o.id)}
                    disabled={actionLoading === o.id}
                    className="flex-1 md:w-28 py-2.5 bg-indigo-600 text-white font-black text-xs rounded-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-60"
                  >
                    {actionLoading === o.id ? '처리중...' : '✅ 승인'}
                  </button>
                  <button
                    onClick={() => handleReject(o.id)}
                    disabled={actionLoading === o.id}
                    className="flex-1 md:w-28 py-2.5 bg-white border-2 border-slate-100 text-slate-500 font-black text-xs rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all disabled:opacity-60"
                  >
                    ❌ 반려
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
