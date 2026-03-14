"use client";

import { useEffect, useState } from "react";
import LoginForm from "./LoginForm";

const SCOPE_LABELS: Record<string, string> = {
  openid: "기본 정보 확인 — 사용자 식별자(ID)를 읽습니다.",
  profile: "프로필 — 이름, 프로필 사진을 읽습니다.",
  read: "읽기 — 계정 데이터를 조회합니다.",
  write: "쓰기 — 계정 데이터를 생성·수정합니다.",
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  redirectUri?: string;
  scope?: string;
  state?: string;
  alreadyLoggedIn?: boolean;
  loggedInUsername?: string;
  authServerUrl?: string;
}

export default function LoginModal({
  isOpen,
  onClose,
  clientId,
  redirectUri,
  scope,
  state,
  alreadyLoggedIn = false,
  loggedInUsername,
  authServerUrl = "http://localhost:9000",
}: LoginModalProps) {
  const requestedScopes = scope?.split(/[\s,]+/).filter(Boolean) ?? [];
  const [selectedScopes, setSelectedScopes] = useState<string[]>(requestedScopes);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function toggleScope(id: string) {
    setSelectedScopes((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleLoginSuccess() {
    onClose();
    // 빽단에서 온 redirectUri가 있다면 그걸 사용, 없으면 test-client 기본값 시뮬레이션
    const targetRedirectUri = redirectUri || "http://localhost:4000/api/auth/callback";
    const targetClientId = clientId || "test-client";
    const targetScope = scope || "openid profile";
    
    window.location.href = `/auth/consent?response_type=code&client_id=${targetClientId}&redirect_uri=${encodeURIComponent(targetRedirectUri)}&scope=${encodeURIComponent(targetScope)}&state=${state || ""}`;
  }

  const GogleLogo = () => (
    <div className="mb-6 flex justify-center">
      <span className="text-[28px] font-semibold tracking-tight">
        <span style={{ color: "#4285F4" }}>G</span>
        <span style={{ color: "#EA4335" }}>o</span>
        <span style={{ color: "#FBBC05" }}>g</span>
        <span style={{ color: "#4285F4" }}>l</span>
        <span style={{ color: "#34A853" }}>e</span>
      </span>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[450px] rounded-[28px] border border-zinc-200 bg-white px-10 py-10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <GogleLogo />

        {alreadyLoggedIn ? (
          /* 이미 로그인된 경우: scope 선택 후 Spring /oauth2/authorize 로 직접 POST */
          <>
            <h2
              id="login-modal-title"
              className="mb-2 text-center text-2xl font-normal text-zinc-900"
            >
              로그인하시겠습니까?
            </h2>
            <p className="mb-6 text-center text-sm text-zinc-500">
              <span className="font-medium text-zinc-700">{loggedInUsername}</span>
              &nbsp;계정으로 로그인되어 있습니다.
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch(`${authServerUrl}/api/auth/consent`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include", // JSESSIONID 포함
                  body: JSON.stringify({
                    client_id: clientId,
                    state: state,
                    redirect_uri: redirectUri || "http://localhost:4000/api/auth/callback",
                    scope: selectedScopes.join(" "),
                  }),
                });
                if (response.ok) {
                  const data = await response.json();
                  if (data.redirectUri) window.location.href = data.redirectUri;
                } else {
                  alert("오류가 발생했습니다.");
                }
              } catch (err) {
                console.error(err);
                alert("서버 연결 실패");
              }
            }}>
              <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  권한 선택
                </p>
                <div className="flex flex-col gap-2">
                  {requestedScopes.map((s) => (
                    <label
                      key={s}
                      className="flex cursor-pointer items-center gap-3 text-sm text-zinc-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(s)}
                        onChange={() => toggleScope(s)}
                        className="h-4 w-4 rounded accent-black"
                      />
                      {SCOPE_LABELS[s] ?? `${s} 권한`}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm font-medium text-zinc-500 hover:underline"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-black px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                >
                  확인
                </button>
              </div>
            </form>
          </>
        ) : (
          /* 미로그인: 로그인 폼 */
          <>
            <h2
              id="login-modal-title"
              className="mb-2 text-center text-2xl font-normal text-zinc-900"
            >
              로그인
            </h2>
            <p className="mb-8 text-center text-sm text-zinc-500">
              {clientId ? (
                <>
                  <span className="font-medium text-zinc-700">{clientId}</span>
                  &nbsp;계속 사용
                </>
              ) : (
                "Gogle 계정으로 계속"
              )}
            </p>

            <LoginForm
              clientId={clientId}
              redirectUri={redirectUri}
              scope={scope}
              state={state}
              onSuccess={handleLoginSuccess}
            />
          </>
        )}
      </div>
    </div>
  );
}
