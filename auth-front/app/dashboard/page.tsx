'use client'

import { useState, useEffect } from 'react'
import { getClients, deleteClient } from '@/lib/api/dashboard'
import { useRouter } from 'next/navigation'
import Navbar from '@/app/components/dashboard/Navbar'
import Sidebar from '@/app/components/dashboard/Sidebar'

export default function DashboardPage() {
    const router = useRouter()
    const [clients, setClients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        setLoading(true)
        try {
            const data = await getClients()
            setClients(data)
        } catch (e) {
            console.error('클라이언트 목록 조회 실패', e)
            setClients([])
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
            <Navbar />
            <div className="flex flex-1">
                <Sidebar activePage="dashboard" />
                <main className="flex-1 px-10 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl text-gray-800">사용자 인증 정보</h1>
                            <p className="text-sm text-gray-500 mt-1">등록된 OAuth 클라이언트 목록입니다.</p>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard/register')}
                            className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
                        >
                            + 클라이언트 ID 만들기
                        </button>
                    </div>

                    {loading ? (
                        <p className="text-sm text-gray-400">불러오는 중...</p>
                    ) : clients.length === 0 ? (
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
                            <div className="grid grid-cols-4 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-500 border-b">
                                <span>앱 이름</span>
                                <span>클라이언트 ID</span>
                                <span>Redirect URI</span>
                                <span>관리</span>
                            </div>
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