"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';
import Link from 'next/link';

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [overtimes, setOvertimes] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    setIsFetching(true);
    try {
      // HR은 회사 전체, 직원은 본인 신청 목록
      const data = user.role === 'HR' || user.role === 'ADMIN'
        ? await API.getCompanyOvertime(user.companyId)
        : await API.getMyOvertime(user.id);
      setOvertimes(data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsFetching(false);
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center font-bold text-slate-400">인증 확인 중...</div>;
  }

  const isHR = user.role === 'HR' || user.role === 'ADMIN';

  const totalCount = overtimes.length;
  const approvedCount = overtimes.filter(o => o.status === 'APPROVED').length;
  const pendingCount = overtimes.filter(o => o.status === 'PENDING' || o.status === 'IN_PROGRESS').length;

  const stats = isHR
    ? [
        { icon: '📋', value: totalCount, label: '전체 신청 건수' },
        { icon: '⏳', value: pendingCount, label: '처리 중' },
        { icon: '✅', value: approvedCount, label: '승인 완료' },
      ]
    : [
        { icon: '📄', value: totalCount, label: '나의 신청 건수' },
        { icon: '⏳', value: pendingCount, label: '처리 중' },
        { icon: '✅', value: approvedCount, label: '승인 완료' },
      ];

  const recentOvertimes = overtimes.slice(0, 5);

  const statusLabel: Record<string, string> = {
    PENDING: '대기중',
    IN_PROGRESS: '진행중',
    APPROVED: '승인완료',
    REJECTED: '반려됨',
    CANCELLED: '취소됨',
  };

  const statusStyle: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    IN_PROGRESS: 'bg-cyan-100 text-cyan-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-600',
    CANCELLED: 'bg-slate-100 text-slate-400',
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <Sidebar />
      
      <main className="flex-1 ml-60 p-8 max-w-6xl">
        <header className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">대시보드</h2>
          <p className="text-slate-500 text-sm mt-1">{user.name} {user.rankTitle}님, 안녕하세요 👋</p>
        </header>

        {/* Stats Grid — HR만 표시 */}
        {isHR && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1.5">
                <div className="text-2xl">{stat.icon}</div>
                <div className="text-2xl font-black text-indigo-600 leading-none">{isFetching ? '—' : stat.value}</div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{stat.label}</div>
              </div>
            ))}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1.5 border-l-4 border-l-indigo-500">
               <div className="text-2xl">💼</div>
               <div className="text-lg font-bold text-slate-800">{user.companyName}</div>
               <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">소속 회사</div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {!isHR && (
            <Link href="/overtime" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 text-center hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xl group-hover:bg-indigo-100">🌙</div>
              <p className="text-xs font-black text-slate-700">야근 신청하기</p>
            </Link>
          )}
          {!isHR && (
            <Link href="/approval" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 text-center hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-xl group-hover:bg-emerald-100">✅</div>
              <p className="text-xs font-black text-slate-700">승인 처리하기</p>
            </Link>
          )}
          {isHR && (
            <Link href="/salary" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 text-center hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-xl group-hover:bg-emerald-100">💰</div>
              <p className="text-xs font-black text-slate-700">급여 지급 처리</p>
            </Link>
          )}
          {isHR && (
            <Link href="/employee-management" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 text-center hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xl group-hover:bg-indigo-100">👥</div>
              <p className="text-xs font-black text-slate-700">직원 관리</p>
            </Link>
          )}
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-700">
            <span className="text-xl">📋</span> {isHR ? '최근 야근 신청 현황' : '내 최근 야근 신청'}
          </div>
          <div className="overflow-x-auto">
            {isFetching ? (
              <div className="p-16 text-center text-slate-400 font-bold">불러오는 중...</div>
            ) : recentOvertimes.length === 0 ? (
              <div className="p-16 text-center text-slate-400 font-bold">데이터가 없습니다.</div>
            ) : (
              <table className="w-full text-left text-[13.5px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {isHR && <th className="px-6 py-3 font-black text-[10px] text-slate-500 uppercase tracking-widest">신청자</th>}
                    <th className="px-6 py-3 font-black text-[10px] text-slate-500 uppercase tracking-widest text-center">날짜</th>
                    <th className="px-6 py-3 font-black text-[10px] text-slate-500 uppercase tracking-widest">사유</th>
                    <th className="px-6 py-3 font-black text-[10px] text-slate-500 uppercase tracking-widest text-center">시간</th>
                    <th className="px-6 py-3 font-black text-[10px] text-slate-500 uppercase tracking-widest text-center">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOvertimes.map((o) => (
                    <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      {isHR && <td className="px-6 py-4 font-bold text-slate-700">{o.requesterName} <span className="text-slate-400 text-xs">{o.requesterRankTitle}</span></td>}
                      <td className="px-6 py-4 text-center font-medium text-slate-600">{o.overtimeDate}</td>
                      <td className="px-6 py-4 text-slate-700 font-bold max-w-xs truncate">{o.reason}</td>
                      <td className="px-6 py-4 text-center font-black text-indigo-600">{Number(o.hours)}시간</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full font-bold text-[11px] ${statusStyle[o.status] || ''}`}>
                          {statusLabel[o.status] || o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
