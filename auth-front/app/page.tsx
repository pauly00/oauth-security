import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginButton from "@/app/components/auth/LoginButton";

interface HomePageProps {
  searchParams: Promise<{
    client_id?: string;
    redirect_uri?: string;
    scope?: string;
    state?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const { client_id, redirect_uri, scope, state } = await searchParams;

  // OAuth 요청일 때 (client_id 존재): 페이지 도착 즉시 세션 확인
  // → 실제 Google/Kakao 동작과 동일
  if (client_id) {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("gogle_session")?.value;

    if (sessionId) {
      // 이미 로그인됨 → consent 페이지로 즉시 이동
      // (consent 페이지에서 기동의 여부를 Spring에 확인)
      redirect(
        `/auth/consent?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`
      );
    }
  }

  // 미로그인 → 로그인 UI 표시
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <LoginButton
        clientId={client_id}
        redirectUri={redirect_uri}
        scope={scope}
        state={state}
      />
    </div>
  );
}
