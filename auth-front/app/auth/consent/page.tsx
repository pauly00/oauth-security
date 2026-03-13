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

const BACKEND_URL = process.env.BACKEND_URL;

export default async function ConsentPage({ searchParams }: ConsentPageProps) {
  const { client_id, redirect_uri, scope, state } = await searchParams;
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("JSESSIONID")?.value;

  // 세션 없으면 로그인 페이지로
  if (!sessionId) {
    redirect(
      `/?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`
    );
  }

  // ── Spring 백엔드 연동 ──────────────────────────────────────────
  if (BACKEND_URL) {
    const res = await fetch(
      `${BACKEND_URL}/api/oauth/consent/status?client_id=${client_id}&scope=${encodeURIComponent(scope ?? "")}`,
      {
        headers: { "X-Session-Id": sessionId },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      // 세션 만료 등 → 로그인으로
      redirect(
        `/?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      redirect(
        `/?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`
      );
    }
    const data = await res.json();

    // 이미 동의한 적 있으면 → Spring이 발급한 auth code로 바로 리다이렉트
    if (data.alreadyConsented) {
      redirect(`${redirect_uri}?code=${data.authCode}&state=${state}`);
    }

    // 동의 화면 표시
    return (
      <ConsentForm
        clientName={data.clientName}
        requestedScopes={data.requestedScopes as string[]}
        clientId={client_id ?? ""}
        scope={scope ?? ""}
        state={state ?? ""}
        redirectUri={redirect_uri ?? ""}
      />
    );
  }

  // ── 더미 폴백 (BACKEND_URL 미설정 시) ─────────────────────────
  // 쿠키에 동의 기록이 있으면 바로 통과 (더미 auth code 생성)
  const consentRecord = cookieStore.get(`gogle_consent_${client_id}`)?.value;
  if (consentRecord) {
    redirect(
      `${redirect_uri}?code=dummy_code_${Date.now()}&state=${state}`
    );
  }

  return (
    <ConsentForm
      clientName={client_id ?? "알 수 없는 앱"}
      requestedScopes={scope?.split(",").filter(Boolean) ?? []}
      clientId={client_id ?? ""}
      scope={scope ?? ""}
      state={state ?? ""}
      redirectUri={redirect_uri ?? ""}
    />
  );
}
