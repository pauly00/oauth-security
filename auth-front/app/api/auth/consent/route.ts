import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: NextRequest) {
  const { clientId, scope, state, redirectUri, allow } = await req.json();
  const sessionId = req.cookies.get("gogle_session")?.value;

  if (!sessionId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  // ── Spring 백엔드 연동 ─────────────────────────────────────────
  if (BACKEND_URL) {
    let backendRes: Response;
    try {
      backendRes = await fetch(`${BACKEND_URL}/api/oauth/consent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId,
        },
        body: JSON.stringify({ clientId, scope, state, redirectUri, allow }),
      });
    } catch {
      return NextResponse.json(
        { message: "백엔드 서버에 연결할 수 없습니다." },
        { status: 503 }
      );
    }

    if (!backendRes.ok) {
      const data = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: data.message ?? "동의 처리에 실패했습니다." },
        { status: backendRes.status }
      );
    }

    // Spring이 발급한 auth code가 포함된 redirect URL 반환
    const { authCode } = await backendRes.json();
    return NextResponse.json({
      redirectUrl: `${redirectUri}?code=${authCode}&state=${state}`,
    });
  }

  // ── 더미 폴백 (BACKEND_URL 미설정 시) ─────────────────────────
  if (!allow) {
    return NextResponse.json({
      redirectUrl: `${redirectUri}?error=access_denied&state=${state}`,
    });
  }

  // 더미: 동의 기록을 쿠키에 저장 + 가짜 auth code 발급
  const dummyAuthCode = `dummy_code_${Date.now()}`;
  const res = NextResponse.json({
    redirectUrl: `${redirectUri}?code=${dummyAuthCode}&state=${state}`,
  });
  res.cookies.set(`gogle_consent_${clientId}`, scope, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180, // 180일
  });
  return res;
}
