import { cookies } from "next/headers";
import LoginButton from "@/app/components/auth/LoginButton";

interface HomePageProps {
  searchParams: Promise<{
    client_id?: string;
    redirect_uri?: string;
    scope?: string;
    state?: string;
  }>;
}

const BACKEND_URL = process.env.BACKEND_URL;

export default async function Home({ searchParams }: HomePageProps) {
  const { client_id, redirect_uri, scope, state } = await searchParams;

  let alreadyLoggedIn = false;
  let loggedInUsername = "";

  // OAuth 요청일 때 (client_id 존재): 세션 확인 후 모달로 분기
  if (client_id) {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("JSESSIONID")?.value;

    if (sessionId) {
      alreadyLoggedIn = true;

      // 백엔드에서 사용자 이름 조회 (BACKEND_URL 설정 시)
      if (BACKEND_URL) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/user/me`, {
            headers: { "X-Session-Id": sessionId },
            cache: "no-store",
          });
          if (res.ok) {
            const data = await res.json();
            loggedInUsername = data.username ?? data.email ?? "";
          }
        } catch {
          // 조회 실패 시 빈 문자열 유지
        }
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <LoginButton
        clientId={client_id}
        redirectUri={redirect_uri}
        scope={scope}
        state={state}
        alreadyLoggedIn={alreadyLoggedIn}
        loggedInUsername={loggedInUsername}
        authServerUrl={BACKEND_URL ?? "http://localhost:9000"}
      />
    </div>
  );
}
