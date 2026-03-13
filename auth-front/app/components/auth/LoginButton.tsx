"use client";

import { useState } from "react";
import LoginModal from "./LoginModal";

interface LoginButtonProps {
  clientId?: string;
  redirectUri?: string;
  scope?: string;
  state?: string;
  alreadyLoggedIn?: boolean;
  loggedInUsername?: string;
  authServerUrl?: string;
}

export default function LoginButton({
  clientId,
  redirectUri,
  scope,
  state,
  alreadyLoggedIn = false,
  loggedInUsername = "",
  authServerUrl = "http://localhost:9000",
}: LoginButtonProps) {
  const [isOpen, setIsOpen] = useState(alreadyLoggedIn);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="h-12 w-36 border border-black bg-black text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
      >
        로그인
      </button>

      <LoginModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        clientId={clientId}
        redirectUri={redirectUri}
        scope={scope}
        state={state}
        alreadyLoggedIn={alreadyLoggedIn}
        loggedInUsername={loggedInUsername}
        authServerUrl={authServerUrl}
      />
    </>
  );
}
