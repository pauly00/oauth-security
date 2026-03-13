"use client";

import { useState } from "react";

// scope → 한국어 설명 매핑
const SCOPE_LABELS: Record<string, { label: string; desc: string }> = {
  openid: { label: "기본 정보 확인", desc: "사용자 식별자(ID)를 읽습니다." },
  profile: { label: "프로필", desc: "이름, 프로필 사진을 읽습니다." },
  read: { label: "읽기", desc: "계정 데이터를 조회합니다." },
  write: { label: "쓰기", desc: "계정 데이터를 생성·수정합니다." },
};

interface ConsentFormProps {
  clientName: string;
  requestedScopes: string[];
  clientId: string;
  scope: string;
  state: string;
  redirectUri: string;
}

export default function ConsentForm({
  clientName,
  requestedScopes,
  clientId,
  scope,
  state,
  redirectUri,
}: ConsentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAllow() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, scope, state, redirectUri, allow: true }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "동의 처리 중 오류가 발생했습니다.");
      }

      const { redirectUrl } = await res.json();
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      setLoading(false);
    }
  }

  function handleDeny() {
    // 거부 시 redirect_uri에 error 파라미터로 알림
    window.location.href = `${redirectUri}?error=access_denied&state=${state}`;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-[420px] rounded-2xl border border-zinc-200 bg-white px-8 py-8 shadow-lg">

        {/* 고글 로고 */}
        <div className="mb-5 flex justify-center">
          <span className="text-2xl font-semibold tracking-tight">
            <span style={{ color: "#4285F4" }}>G</span>
            <span style={{ color: "#EA4335" }}>o</span>
            <span style={{ color: "#FBBC05" }}>g</span>
            <span style={{ color: "#4285F4" }}>l</span>
            <span style={{ color: "#34A853" }}>e</span>
          </span>
        </div>

        {/* 타이틀 */}
        <h1 className="mb-1 text-center text-xl font-normal text-zinc-900">
          <span className="font-semibold">{clientName}</span>이(가)
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-500">
          고글 계정 접근을 요청합니다.
        </p>

        {/* 요청 권한 목록 */}
        <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 divide-y divide-zinc-200">
          {requestedScopes.map((s) => {
            const info = SCOPE_LABELS[s] ?? { label: s, desc: `${s} 권한` };
            return (
              <div key={s} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-800">{info.label}</p>
                  <p className="text-xs text-zinc-500">{info.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 안내 문구 */}
        <p className="mb-6 text-xs text-zinc-400 text-center">
          허용 시 <span className="font-medium text-zinc-600">{clientName}</span>이
          위 권한으로 내 고글 계정에 접근할 수 있습니다.
          언제든지 고글 계정 설정에서 취소할 수 있습니다.
        </p>

        {error && (
          <p className="mb-4 text-center text-xs text-red-500">{error}</p>
        )}

        {/* 버튼 */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleDeny}
            disabled={loading}
            className="text-sm font-medium text-zinc-500 hover:underline disabled:opacity-50"
          >
            거부
          </button>
          <button
            type="button"
            onClick={handleAllow}
            disabled={loading}
            className="rounded-full bg-black px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "처리 중..." : "허용"}
          </button>
        </div>
      </div>
    </div>
  );
}
