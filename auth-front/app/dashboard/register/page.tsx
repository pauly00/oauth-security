'use client'

import { useState } from 'react'
import { registerClient } from '@/lib/api/dashboard'
import { useRouter } from 'next/navigation'
import Navbar from '@/app/components/dashboard/Navbar'
import Sidebar from '@/app/components/dashboard/Sidebar'

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        clientName: '',
        redirectUris: [''],
        scopes: [] as string[],
        authorizationGrantTypes: ['authorization_code', 'refresh_token']
    })
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const handleScopeChange = (scope: string) => {
        setForm(prev => ({
            ...prev,
            scopes: prev.scopes.includes(scope)
                ? prev.scopes.filter(s => s !== scope)
                : [...prev.scopes, scope],
        }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const data = await registerClient(form)
            setResult(data)
        } catch (e) {
            alert('등록 실패')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar activePage="register" />
                <main className="flex-1 px-10 py-8 max-w-2xl">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="text-gray-400 text-sm cursor-pointer hover:text-blue-500"
                            onClick={() => router.push('/dashboard')}
                        >
                            사용자 인증 정보
                        </span>
                        <span className="text-gray-400 text-sm">›</span>
                        <span className="text-sm text-gray-700">OAuth 클라이언트 ID 만들기</span>
                    </div>
                    <h1 className="text-2xl text-gray-800 mb-1">OAuth 클라이언트 ID 만들기</h1>
                    <p className="text-sm text-gray-500 mb-8">
                        클라이언트 ID는 고글 OAuth 서버에서 앱을 식별하는 데 사용됩니다.
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm text-gray-700 mb-1">
                            앱 이름 <span className="text-red-500">*</span>
                        </label>
                        <input
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="내 애플리케이션"
                            value={form.clientName}
                            onChange={e => setForm({ ...form, clientName: e.target.value })}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm text-gray-700 mb-1">
                            승인된 리디렉션 URI <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-400 mb-2">인증 후 사용자가 리디렉션될 URI입니다.</p>
                        <input
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="http://localhost:3000/callback"
                            value={form.redirectUris[0]}
                            onChange={e => setForm({ ...form, redirectUris: [e.target.value] })}
                        />
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm text-gray-700 mb-2">스코프</label>
                        <p className="text-xs text-gray-400 mb-3">앱이 접근할 수 있는 데이터 범위를 선택하세요.</p>
                        <div className="border border-gray-200 rounded divide-y">
                            {[
                                { value: 'openid', label: 'OpenID', desc: '사용자 식별자' },
                                { value: 'profile', label: 'Profile', desc: '이름, 프로필 사진' },
                                { value: 'read', label: 'Read', desc: '데이터 읽기 권한' },
                                { value: 'write', label: 'Write', desc: '데이터 쓰기 권한' },
                            ].map(scope => (
                                <label key={scope.value} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-blue-500"
                                        checked={form.scopes.includes(scope.value)}
                                        onChange={() => handleScopeChange(scope.value)}
                                    />
                                    <div>
                                        <p className="text-sm text-gray-700 font-medium">{scope.label}</p>
                                        <p className="text-xs text-gray-400">{scope.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-blue-600 text-white text-sm px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? '만드는 중...' : '만들기'}
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-sm text-blue-600 px-6 py-2 rounded hover:bg-blue-50"
                        >
                            취소
                        </button>
                    </div>

                    {result && (
                        <div className="mt-8 border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                </div>
                                <p className="text-gray-800 font-medium">OAuth 클라이언트가 생성되었습니다</p>
                            </div>
                            <div className="bg-gray-50 rounded p-4 space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">클라이언트 ID</p>
                                    <p className="font-mono text-gray-800">{result.clientId}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">클라이언트 보안 비밀번호</p>
                                    <p className="font-mono text-gray-800">{result.clientSecret}</p>
                                </div>
                            </div>
                            <p className="text-xs text-red-500 mt-3">
                                보안 비밀번호는 지금만 표시됩니다. 반드시 저장해 두세요.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}