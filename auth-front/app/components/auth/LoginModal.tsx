"use client";

import { useEffect, useState } from "react";
import LoginForm from "./LoginForm";

// 로그인 모달 컴포넌트
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  redirectUri?: string;
  scope?: string;
  state?: string;
  alreadyLoggedIn?: boolean;
  loggedInUsername?: string;
}

// 더미 권한 항목
const DUMMY_SCOPES = [
  { id: "read", label: "읽기 — 계정 정보 조회" },
  { id: "write", label: "쓰기 — 데이터 생성 및 수정" },
];

// 로그인 모달 컴포넌트
export default function LoginModal({
  isOpen,
  onClose,
  clientId,
  redirectUri,
  scope,
  state,
  alreadyLoggedIn = false,
  loggedInUsername,
}: LoginModalProps) {
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["read"]);

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

  function handleLoginSuccess() {
    onClose();
    if (clientId && redirectUri && scope && state) {
      window.location.href = `/auth/consent?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
    } else {
      window.location.href = "/dashboard";
    }
  }

  function toggleScope(id: string) {
    setSelectedScopes((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleConfirm() {
    onClose();
    window.location.href = `/auth/consent?client_id=${clientId}&scope=${selectedScopes.join(",")}&state=${state}`;
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
          /* ── 이미 로그인된 경우: 확인 팝업 ── */
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

            {/* 더미 권한 선택 */}
            <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                권한 선택 (더미)
              </p>
              <div className="flex flex-col gap-2">
                {DUMMY_SCOPES.map(({ id, label }) => (
                  <label
                    key={id}
                    className="flex cursor-pointer items-center gap-3 text-sm text-zinc-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes(id)}
                      onChange={() => toggleScope(id)}
                      className="h-4 w-4 rounded accent-black"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* 확인 / 취소 */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-medium text-zinc-500 hover:underline"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-full bg-black px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                확인
              </button>
            </div>
          </>
        ) : (
          /* ── 미로그인: 기존 로그인 폼 ── */
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
