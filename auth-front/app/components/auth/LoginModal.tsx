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
}

export default function LoginModal({
  isOpen,
  onClose,
  clientId,
  redirectUri,
  scope,
  state,
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
    // TODO: 백엔드 팀과 성공 후 리다이렉트 경로 확정
    window.location.href = `/auth/consent?client_id=${clientId}&scope=${scope}&state=${state}`;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      {/* 카드 */}
      <div
        className="relative w-full max-w-[450px] rounded-[28px] border border-zinc-200 bg-white px-10 py-10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gogle 로고 */}
        <div className="mb-6 flex justify-center">
          <span className="text-[28px] font-semibold tracking-tight">
            <span style={{ color: "#4285F4" }}>G</span>
            <span style={{ color: "#EA4335" }}>o</span>
            <span style={{ color: "#FBBC05" }}>g</span>
            <span style={{ color: "#4285F4" }}>l</span>
            <span style={{ color: "#34A853" }}>e</span>
          </span>
        </div>

        {/* 타이틀 + 서브타이틀 */}
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
      </div>
    </div>
  );
}
