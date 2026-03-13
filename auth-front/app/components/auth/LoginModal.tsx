"use client";

import { useEffect } from "react";
import LoginForm from "./LoginForm";

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
      window.location.href = "http://localhost:8080/dashboard.html";
    }
  }

  // 이미 로그인된 경우 동의 화면으로 이동
  function handleConfirm() {
    onClose();
    window.location.href = `/auth/consent?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri ?? "")}&scope=${encodeURIComponent(scope ?? "")}&state=${state}`;
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
          /* 이미 로그인된 경우: 계정 확인 후 동의 화면으로 이동 */
          <>
            <h2
              id="login-modal-title"
              className="mb-2 text-center text-2xl font-normal text-zinc-900"
            >
              로그인하시겠습니까?
            </h2>
            <p className="mb-8 text-center text-sm text-zinc-500">
              <span className="font-medium text-zinc-700">{loggedInUsername}</span>
              &nbsp;계정으로 로그인되어 있습니다.
            </p>

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
