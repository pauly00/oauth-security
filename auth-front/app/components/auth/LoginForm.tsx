"use client";

import { useState, FormEvent } from "react";

interface LoginFormProps {
  clientId?: string;
  redirectUri?: string;
  scope?: string;
  state?: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export default function LoginForm({
  clientId,
  redirectUri,
  scope,
  state,
  onSuccess,
  onError,
}: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, clientId, redirectUri, scope, state }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "로그인에 실패했습니다.");
      }

      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setErrorMsg(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* 아이디 — Google 아웃라인 스타일 */}
      <div className="relative">
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder=" "
          autoComplete="username"
          className="peer w-full rounded-md border border-zinc-300 px-3 pb-2 pt-5 text-sm text-black outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
        />
        <label
          htmlFor="username"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 transition-all peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black peer-[&:not(:placeholder-shown)]:top-3 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-xs"
        >
          아이디
        </label>
      </div>

      {/* 비밀번호 */}
      <div className="relative">
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder=" "
          autoComplete="current-password"
          className="peer w-full rounded-md border border-zinc-300 px-3 pb-2 pt-5 text-sm text-black outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black"
        />
        <label
          htmlFor="password"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 transition-all peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black peer-[&:not(:placeholder-shown)]:top-3 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-xs"
        >
          비밀번호
        </label>
      </div>

      {/* 에러 메시지 */}
      {errorMsg && (
        <p className="text-xs text-red-500">{errorMsg}</p>
      )}

      {/* 비밀번호 찾기 링크 */}
      <button
        type="button"
        className="self-start text-sm font-medium text-black hover:underline"
      >
        비밀번호를 잊으셨나요?
      </button>

      {/* 하단 액션 — Google: 계정만들기(좌) + 다음(우) */}
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          className="text-sm font-medium text-black hover:underline"
        >
          계정 만들기
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-black px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "로그인 중..." : "다음"}
        </button>
      </div>
    </form>
  );
}
