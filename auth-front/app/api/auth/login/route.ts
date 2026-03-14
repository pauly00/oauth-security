import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: NextRequest) {
  const { username, password, clientId, redirectUri, scope, state } = await req.json();

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      redirect: "manual",
    });
  } catch {
    return NextResponse.json(
      { message: "백엔드 서버에 연결할 수 없습니다." },
      { status: 503 }
    );
  }

  if (!backendRes.ok) {
    let message = "아이디 또는 비밀번호가 올바르지 않습니다.";
    const contentType = backendRes.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await backendRes.json().catch(() => ({}));
      if (data.message) message = data.message;
    }
    return NextResponse.json({ message }, { status: backendRes.status });
  }

  // Spring LoginController: { "ok": true } + Set-Cookie: JSESSIONID=xxx
  const cookieHeaders: string[] =
    (backendRes.headers as any).getSetCookie?.() ??
    [backendRes.headers.get("set-cookie") ?? ""].filter(Boolean);
  const jsessionId = cookieHeaders
    .map((h) => h.match(/JSESSIONID=([^;]+)/)?.[1])
    .find(Boolean);

  if (!jsessionId) {
    return NextResponse.json({ message: "세션 생성 실패" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("JSESSIONID", jsessionId, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  // OAuth 파라미터 보존 (Consent 페이지용)
  if (clientId) res.cookies.set("oauth_clientId", clientId, { path: "/", maxAge: 60 * 5 });
  if (redirectUri) res.cookies.set("oauth_redirectUri", redirectUri, { path: "/", maxAge: 60 * 5 });
  if (scope) res.cookies.set("oauth_scope", scope, { path: "/", maxAge: 60 * 5 });
  if (state) res.cookies.set("oauth_state", state, { path: "/", maxAge: 60 * 5 });

  return res;
}
