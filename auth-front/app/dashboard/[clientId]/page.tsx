'use client'

import { useState, useEffect } from 'react'
import { getClients, deleteClient } from '@/lib/api/dashboard'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/app/components/dashboard/Navbar'
import Sidebar from '@/app/components/dashboard/Sidebar'

export default function ClientDetailPage() {
    const router = useRouter()
    const params = useParams()
    const clientId = params.clientId as string

    const [client, setClient] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [secretVisible, setSecretVisible] = useState(false)

    useEffect(() => {
        fetchClient()
    }, [])

    const fetchClient = async () => {
        setLoading(true)
        try {
            const data = await getClients()
            const found = data.find((c: any) => c.client_id === clientId)
            setClient(found)
        } catch (e) {
            console.error('클라이언트 조회 실패', e)
            setClient(null)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
        try {
            await deleteClient(clientId)
            router.push('/dashboard')
        } catch (e) {
            alert('삭제 실패')
        }
    }

    if (loading) return <p className="p-10 text-sm text-gray-400">불러오는 중...</p>
    if (!client) return <p className="p-10 text-sm text-red-400">앱을 찾을 수 없습니다.</p>

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar activePage="detail" />
                <main className="flex-1 px-10 py-8 max-w-2xl">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="text-sm text-blue-600 cursor-pointer hover:underline"
                            onClick={() => router.push('/dashboard')}
                        >
                            사용자 인증 정보
                        </span>
                        <span className="text-gray-400 text-sm">›</span>
                        <span className="text-sm text-gray-700">OAuth 클라이언트 상세</span>
                    </div>

                    <h1 className="text-2xl text-gray-800 mb-6">{client.clientName}</h1>

                    <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                        <div className="bg-gray-50 px-6 py-3 border-b">
                            <p className="text-sm font-medium text-gray-700">클라이언트 정보</p>
                        </div>
                        <div className="divide-y">
                            <div className="grid grid-cols-3 px-6 py-4">
                                <span className="text-sm text-gray-500">앱 이름</span>
                                <span className="text-sm text-gray-800 col-span-2">{client.clientName}</span>
                            </div>
                            <div className="grid grid-cols-3 px-6 py-4">
                                <span className="text-sm text-gray-500">클라이언트 ID</span>
                                <span className="text-sm font-mono text-gray-800 col-span-2">{client.client_id}</span>
                            </div>
                            <div className="grid grid-cols-3 px-6 py-4 items-center">
                                <span className="text-sm text-gray-500">클라이언트 보안 비밀</span>
                                <div className="col-span-2 flex items-center gap-3">
                                    <span className="text-sm font-mono text-gray-800">
                                        {secretVisible ? client.client_secret : '••••••••••••••••'}
                                    </span>
                                    <button
                                        onClick={() => setSecretVisible(prev => !prev)}
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        {secretVisible ? '숨기기' : '표시'}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 px-6 py-4">
                                <span className="text-sm text-gray-500">Redirect URI</span>
                                <span className="text-sm text-gray-800 col-span-2">{client.redirectUri}</span>
                            </div>
                            <div className="grid grid-cols-3 px-6 py-4">
                                <span className="text-sm text-gray-500">스코프</span>
                                <div className="col-span-2 flex gap-2 flex-wrap">
                                    {client.scopes?.map((scope: string) => (
                                        <span key={scope} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                            {scope}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-sm text-blue-600 px-6 py-2 rounded hover:bg-blue-50"
                        >
                            ← 목록으로
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-sm text-white bg-red-500 px-6 py-2 rounded hover:bg-red-600"
                        >
                            클라이언트 삭제
                        </button>
                    </div>
                </main>
            </div>
        </div>
    )
}