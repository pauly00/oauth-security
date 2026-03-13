'use client'

import { useRouter } from 'next/navigation'

interface SidebarProps {
    activePage: 'dashboard' | 'register' | 'detail'
}

export default function Sidebar({ activePage }: SidebarProps) {
    const router = useRouter()

    return (
        <aside className="w-56 border-r pt-6 px-3">
            <p className="text-xs font-medium text-gray-500 px-3 mb-2">API 및 서비스</p>
            <ul className="text-sm text-gray-700 space-y-1">
                <li
                    className={`px-3 py-2 rounded-full cursor-pointer ${activePage === 'dashboard' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                    onClick={() => router.push('/dashboard')}
                >
                    대시보드
                </li>
                <li
                    className={`px-3 py-2 rounded-full cursor-pointer ${activePage === 'register' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                    onClick={() => router.push('/dashboard/register')}
                >
                    OAuth 클라이언트 등록
                </li>
            </ul>
        </aside>
    )
}