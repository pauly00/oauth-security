import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ConsentForm from "./ConsentForm";

interface ConsentPageProps {
  searchParams: Promise<{
    client_id?: string;
    redirect_uri?: string;
    scope?: string;
    state?: string;
  }>;
}

const BACKEND_URL = process.env.BACKEND_URL ?? "";

export default async function ConsentPage({ searchParams }: ConsentPageProps) {
  let { client_id, redirect_uri, scope, state } = await searchParams;
  const cookieStore = await cookies();

  // URL 파라미터 없으면 쿠키에서 복원
  if (!client_id) client_id = cookieStore.get("oauth_clientId")?.value;
  if (!redirect_uri) redirect_uri = cookieStore.get("oauth_redirectUri")?.value;
  if (!scope) scope = cookieStore.get("oauth_scope")?.value;
  if (!state) state = cookieStore.get("oauth_state")?.value;

  const sessionId = cookieStore.get("JSESSIONID")?.value;

  const loginUrl = `/?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`;

  // 세션 없으면 로그인 페이지로
  if (!sessionId) {
    redirect(loginUrl);
  }

  if (BACKEND_URL) {
    const res = await fetch(
      `${BACKEND_URL}/api/oauth/consent/status?client_id=${client_id}&scope=${encodeURIComponent(scope ?? "")}`,
      {
        headers: { "X-Session-Id": sessionId },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      redirect(loginUrl);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      redirect(loginUrl);
    }

    const data = await res.json();

    // 이미 동의한 경우 Spring이 발급한 auth code로 바로 리다이렉트
    if (data.alreadyConsented) {
      redirect(`${redirect_uri}?code=${data.authCode}&state=${state}`);
    }

    return (
      <ConsentForm
        clientName={data.clientName}
        requestedScopes={data.requestedScopes as string[]}
        clientId={client_id ?? ""}
        state={state ?? ""}
        redirectUri={redirect_uri ?? ""}
        authServerUrl={BACKEND_URL}
      />
    );
  }

  // BACKEND_URL 미설정 시 더미 폴백
  return (
    <ConsentForm
      clientName={client_id ?? "알 수 없는 앱"}
      requestedScopes={scope?.split(" ").filter(Boolean) ?? []}
      clientId={client_id ?? ""}
      state={state ?? ""}
      redirectUri={redirect_uri ?? ""}
      authServerUrl="http://localhost:9000"
    />
  );
}
