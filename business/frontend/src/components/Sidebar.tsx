"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  href: string;
  icon: string;
  label: string;
  roles?: string[];
  hideForHR?: boolean;
}

const Sidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  
  if (!user) return null;
  const isHR = user.role === 'HR' || user.role === 'ADMIN';

  const menuItems: NavItem[] = [
    { href: '/dashboard', icon: '🏠', label: '대시보드' },
    { href: '/overtime', icon: '🌙', label: '야근 신청', roles: ['EMPLOYEE'] },
    { href: '/approval', icon: '✅', label: '승인 처리', hideForHR: true },
    { href: '/salary', icon: '💰', label: '급여 지급', roles: ['HR', 'ADMIN'] },
    { href: '/employee-management', icon: '👥', label: '사용자 관리', roles: ['HR', 'ADMIN'] },
    { href: '/rank-management', icon: '⚙️', label: '직책 관리', roles: ['HR', 'ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => {
    if (item.roles && !item.roles.includes(user.role)) return false;
    if (item.hideForHR && isHR) return false;
    return true;
  });

  return (
    <aside className="fixed top-0 left-0 w-60 h-screen bg-[#0F172A] text-white flex flex-col shadow-2xl z-50">
      <div className="p-6 pb-5 border-b border-white/10">
        <h1 className="text-lg font-extrabold bg-gradient-to-br from-[#6366F1] to-[#06B6D4] bg-clip-text text-transparent tracking-tight">
          PAYROLL
        </h1>
        <p className="text-[10px] text-slate-500 mt-1 font-bold">급여 지급 관리 시스템</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-5 py-2 text-[10px] font-bold text-slate-500 tracking-widest uppercase">메뉴</div>
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3 text-[13.5px] font-medium transition-all border-l-4 ${
                isActive 
                  ? 'text-white bg-indigo-500/20 border-indigo-400' 
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-5 border-top border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-sm">
            {user.name?.[0] || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">{user.name || '사용자'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.rankTitle || '—'}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full py-2 border border-white/20 rounded-lg text-slate-400 text-[11px] font-bold hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all flex items-center justify-center gap-1.5"
        >
          🚪 로그아웃
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
