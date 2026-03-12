'use client'

import { useState, useEffect } from 'react'
import { getClients, deleteClient } from '@/lib/api/dashboard'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
    const router = useRouter()
    const [clients, setClients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // 페이지 로드 시 앱 목록 불러오기
    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        setLoading(true)
        try {
            const data = await getClients()
            setClients(data)
        } catch (e) {
            // 백엔드 연결 전이라 에러 무시, 더미 데이터로 대체
            setClients([
                { client_id: 'abc123', clientName: '내 첫번째 앱', redirectUri: 'http://localhost:3000/callback' },
                { client_id: 'def456', clientName: '테스트 앱', redirectUri: 'http://localhost:8080/callback' },
            ])
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (clientId: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return
        try {
            await deleteClient(clientId)
            setClients(prev => prev.filter(c => c.client_id !== clientId))
        } catch (e) {
            alert('삭제 실패')
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">

            {/* 상단 네비게이션 */}
            <nav className="flex items-center justify-between px-6 py-3 border-b">
                <div className="flex items-center gap-1 text-2xl font-medium">
                    <span className="text-blue-500">G</span>
                    <span className="text-red-500">o</span>
                    <span className="text-yellow-500">g</span>
                    <span className="text-blue-500">l</span>
                    <span className="text-green-500">e</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">고글 Cloud Console</span>
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                        U
                    </div>
                </div>
            </nav>

            <div className="flex flex-1">

                {/* 사이드바 */}
                <aside className="w-56 border-r pt-6 px-3">
                    <p className="text-xs font-medium text-gray-500 px-3 mb-2">API 및 서비스</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                        <li className="px-3 py-2 rounded-full bg-blue-50 text-blue-700 font-medium cursor-pointer">
                            대시보드
                        </li>
                        <li
                            className="px-3 py-2 rounded-full hover:bg-gray-100 cursor-pointer"
                            onClick={() => router.push('/dashboard/register')}
                        >
                            OAuth 클라이언트 등록
                        </li>
                    </ul>
                </aside>

                {/* 메인 */}
                <main className="flex-1 px-10 py-8">

                    {/* 타이틀 + 등록 버튼 */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl text-gray-800">사용자 인증 정보</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                등록된 OAuth 클라이언트 목록입니다.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard/register')}
                            className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
                        >
                            + 클라이언트 ID 만들기
                        </button>
                    </div>

                    {/* 목록 테이블 */}
                    {loading ? (
                        <p className="text-sm text-gray-400">불러오는 중...</p>
                    ) : clients.length === 0 ? (
                        // 등록된 앱이 없을 때
                        <div className="border border-dashed border-gray-300 rounded-lg p-16 text-center">
                            <p className="text-gray-400 text-sm mb-4">등록된 클라이언트가 없습니다.</p>
                            <button
                                onClick={() => router.push('/dashboard/register')}
                                className="text-blue-600 text-sm hover:underline"
                            >
                                첫 번째 클라이언트 등록하기 →
                            </button>
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* 테이블 헤더 */}
                            <div className="grid grid-cols-4 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-500 border-b">
                                <span>앱 이름</span>
                                <span>클라이언트 ID</span>
                                <span>Redirect URI</span>
                                <span>관리</span>
                            </div>

                            {/* 테이블 행 */}
                            {clients.map((client, index) => (
                                <div
                                    key={client.client_id}
                                    className={`grid grid-cols-4 px-4 py-4 text-sm items-center ${index !== clients.length - 1 ? 'border-b' : ''} hover:bg-gray-50`}
                                >
                                    <span className="text-gray-800 font-medium">{client.clientName}</span>
                                    <span className="font-mono text-gray-500 text-xs">{client.client_id}</span>
                                    <span className="text-gray-500 text-xs truncate">{client.redirectUri}</span>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => router.push(`/dashboard/${client.client_id}`)}
                                            className="text-blue-600 text-xs hover:underline"
                                        >
                                            상세보기
                                        </button>
                                        <button
                                            onClick={() => handleDelete(client.client_id)}
                                            className="text-red-500 text-xs hover:underline"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}