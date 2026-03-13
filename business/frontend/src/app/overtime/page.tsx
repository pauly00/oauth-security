"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';

const statusLabel: Record<string, string> = {
  PENDING: '대기중',
  IN_PROGRESS: '진행중',
  APPROVED: '승인완료',
  REJECTED: '반려됨',
  CANCELLED: '취소됨',
};

const statusStyle: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-500/20',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-700 ring-indigo-500/20',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-500/20',
  REJECTED: 'bg-red-50 text-red-700 ring-red-500/20',
  CANCELLED: 'bg-slate-50 text-slate-400 ring-slate-300/20',
};

const stepStatusIcon: Record<string, string> = {
  PENDING: '⏳',
  APPROVED: '✅',
  REJECTED: '❌',
};

// 승인 체인 컴포넌트
function ApprovalChain({ steps }: { steps: any[] }) {
  if (!steps || steps.length === 0) {
    return (
      <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400 font-bold text-center py-2">
        승인 체인 없음 (직속 상관이 없거나 단독 직책)
      </div>
    );
  }

  const sorted = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">승인 체인</p>
      <div className="flex items-start gap-0">
        {sorted.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center min-w-[100px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-sm
                ${step.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                  step.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-400'}`}>
                {stepStatusIcon[step.status] || '⏳'}
              </div>
              <div className="mt-2 text-center">
                <p className="text-[11px] font-black text-slate-700">{step.approverName}</p>
                <p className="text-[10px] text-slate-400">{step.approverRankTitle}</p>
                <p className={`text-[10px] font-bold mt-0.5
                  ${step.status === 'APPROVED' ? 'text-emerald-600' :
                    step.status === 'REJECTED' ? 'text-red-500' :
                    'text-slate-400'}`}>
                  {statusLabel[step.status] || step.status}
                </p>
                {step.comment && (
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[90px] break-words">💬 {step.comment}</p>
                )}
              </div>
            </div>
            {idx < sorted.length - 1 && (
              <div className="flex-1 h-8 flex items-center px-1">
                <div className={`h-0.5 w-full ${step.status === 'APPROVED' ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                <div className={`text-[10px] ${step.status === 'APPROVED' ? 'text-emerald-400' : 'text-slate-300'}`}>▶</div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function OvertimePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isFetching, setIsFetching] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) { router.push('/'); return; }
    if (user) fetchRequests();
  }, [user, authLoading]);

  const fetchRequests = async () => {
    if (!user) return;
    setIsFetching(true);
    try {
      const data = await API.getMyOvertime(user.id);
      setRequests(data);
    } catch (err: any) {
      console.error('Failed to load overtime requests', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await API.createOvertime({ requesterId: user.id, overtimeDate: date, hours: Number(hours), reason });
      setMessage({ text: '✅ 야근 신청이 완료되었습니다.', type: 'success' });
      setReason('');
      setHours('');
      fetchRequests();
    } catch (err: any) {
      setMessage({ text: err.message || '신청 실패', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!user || !confirm('야근 신청을 취소하시겠습니까?')) return;
    try {
      await API.cancelOvertime(id, user.id);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || '취소 실패');
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  if (authLoading || !user) return null;

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <Sidebar />
      <main className="flex-1 ml-60 p-8 max-w-6xl">
        <header className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">🌙 야근 신청</h2>
          <p className="text-slate-500 text-sm mt-1">야근 내역을 등록하면 자동으로 승인 요청이 전송됩니다.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-700 mb-6 flex items-center gap-2 uppercase tracking-tight">
                <span className="text-lg text-indigo-500">📝</span> 새 야근 신청서
              </h3>

              {message.text && (
                <div className={`mb-6 p-3 rounded-lg text-sm font-bold border-l-4 ${
                  message.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-red-50 border-red-500 text-red-700'
                }`}>{message.text}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">야근 날짜</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">야근 시간 (시간)</label>
                  <input type="number" step="0.5" min="0.5" max="12" required value={hours} onChange={e => setHours(e.target.value)}
                    placeholder="예: 2.5"
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">야근 사유</label>
                  <textarea rows={4} required value={reason} onChange={e => setReason(e.target.value)}
                    placeholder="상세 내용을 입력하세요..."
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 resize-none" />
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                  <div className="text-lg">💡</div>
                  <div className="text-xs text-slate-500 leading-relaxed">
                    야근 수당: 시간당 <strong>10,000원 × 1.5배 = 15,000원</strong>이 자동 계산되어 익월 급여에 반영됩니다.
                  </div>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-black rounded-lg shadow-lg shadow-indigo-200 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-70 disabled:translate-y-0">
                  {isLoading ? '제출 중...' : '신청서 제출'}
                </button>
              </form>
            </div>
          </div>

          {/* Request List */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-tight">
                <span className="text-xl">📋</span> 내 신청 내역
                <span className="ml-auto text-slate-300 font-bold normal-case text-[10px]">행을 클릭하면 승인 체인을 확인할 수 있습니다</span>
              </div>
              {isFetching ? (
                <div className="p-16 text-center text-slate-400 font-bold">불러오는 중...</div>
              ) : requests.length === 0 ? (
                <div className="p-16 text-center text-slate-400 font-bold">신청 내역이 없습니다.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {requests.map((req) => (
                    <div key={req.id}>
                      {/* Row */}
                      <div
                        onClick={() => toggleExpand(req.id)}
                        className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex-1 grid grid-cols-4 gap-4 items-center text-[13px]">
                          <span className="font-bold text-slate-500 whitespace-nowrap">{req.overtimeDate}</span>
                          <span className="font-bold text-slate-800 col-span-2 truncate">{req.reason}</span>
                          <div className="flex items-center gap-2 justify-end">
                            <span className="font-black text-indigo-500">{Number(req.hours)}h</span>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ring-1 ring-inset ${statusStyle[req.status] || ''}`}>
                              {statusLabel[req.status] || req.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {(req.status === 'PENDING' || req.status === 'IN_PROGRESS') && (
                            <button
                              onClick={e => { e.stopPropagation(); handleCancel(req.id); }}
                              className="px-3 py-1 bg-red-50 text-red-500 border border-red-200 rounded-lg text-[11px] font-bold hover:bg-red-100 transition-all">
                              취소
                            </button>
                          )}
                          <span className="text-slate-300 text-sm">{expandedId === req.id ? '▲' : '▼'}</span>
                        </div>
                      </div>
                      {/* Approval Chain Panel */}
                      {expandedId === req.id && (
                        <div className="px-6 pb-5 bg-slate-50/50">
                          <ApprovalChain steps={req.approvalSteps} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
