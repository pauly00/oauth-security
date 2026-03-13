"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';

export default function EmployeeManagementPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [rankLevels, setRankLevels] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '1234', role: 'EMPLOYEE', rankLevelId: '' });
  const [formError, setFormError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) { router.push('/'); return; }
    if (user && user.role !== 'HR' && user.role !== 'ADMIN') { router.push('/dashboard'); return; }
    if (user) { fetchData(); }
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    setIsFetching(true);
    try {
      const [emps, ranks] = await Promise.all([
        API.getEmployees(user.companyId),
        API.getRankLevels(user.companyId),
      ]);
      setEmployees(emps);
      setRankLevels(ranks);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsAdding(true);
    setFormError('');
    try {
      await API.createEmployee({ ...form, companyId: user.companyId, rankLevelId: Number(form.rankLevelId) });
      setShowForm(false);
      setForm({ name: '', email: '', password: '1234', role: 'EMPLOYEE', rankLevelId: '' });
      fetchData();
    } catch (err: any) {
      setFormError(err.message || '사원 등록 실패');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 사원을 퇴사 처리하시겠습니까?`)) return;
    try {
      await API.deleteEmployee(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || '퇴사 처리 실패');
    }
  };

  const roleLabel: Record<string, string> = { EMPLOYEE: '직원', HR: '인사담당자', ADMIN: '관리자' };
  const roleStyle: Record<string, string> = {
    EMPLOYEE: 'bg-slate-100 text-slate-600',
    HR: 'bg-indigo-100 text-indigo-700',
    ADMIN: 'bg-red-100 text-red-600',
  };

  if (authLoading || !user) return null;

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <Sidebar />
      <main className="flex-1 ml-60 p-8 max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">👥 사용자 관리</h2>
            <p className="text-slate-500 text-sm mt-1">회사 구성원을 추가하거나 퇴사 처리합니다.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 bg-indigo-600 text-white font-black text-sm rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            {showForm ? '✕ 닫기' : '+ 사원 추가'}
          </button>
        </header>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
            <h3 className="text-sm font-black text-slate-700 mb-5 uppercase tracking-tight">📝 신규 사원 등록</h3>
            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold">{formError}</div>
            )}
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">이름</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="홍길동"
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">이메일</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="hong@company.com"
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">초기 비밀번호</label>
                <input required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">역할</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-800">
                  <option value="EMPLOYEE">직원</option>
                  <option value="HR">인사담당자</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">직책</label>
                <select required value={form.rankLevelId} onChange={e => setForm({...form, rankLevelId: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-800">
                  <option value="">직책 선택</option>
                  {rankLevels.sort((a,b) => a.level - b.level).map((r: any) => (
                    <option key={r.id} value={r.id}>Lv.{r.level} {r.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={isAdding}
                  className="w-full py-2.5 bg-indigo-600 text-white font-black text-sm rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-60">
                  {isAdding ? '등록 중...' : '등록'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Employee Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 font-black text-slate-700 uppercase text-xs tracking-tight">
            <span className="text-xl">📋</span> 구성원 목록 ({employees.length}명)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">이름</th>
                  <th className="px-5 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">이메일</th>
                  <th className="px-5 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">직책</th>
                  <th className="px-5 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">역할</th>
                  <th className="px-5 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">퇴사 처리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isFetching ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold">불러오는 중...</td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold">등록된 사원이 없습니다.</td></tr>
                ) : employees.map((emp: any) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-black text-slate-800">{emp.name}</td>
                    <td className="px-5 py-4 text-slate-500 font-medium">{emp.email}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-xs font-bold text-slate-600">Lv.{emp.rankLevel} {emp.rankTitle}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${roleStyle[emp.role] || ''}`}>
                        {roleLabel[emp.role] || emp.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {emp.id !== user.id && (
                        <button onClick={() => handleDelete(emp.id, emp.name)}
                          className="px-3 py-1 bg-red-50 text-red-500 border border-red-200 rounded-lg text-[11px] font-bold hover:bg-red-100 transition-all">
                          퇴사
                        </button>
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
