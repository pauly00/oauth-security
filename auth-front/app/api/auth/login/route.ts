import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

// ── 개발용 더미 (BACKEND_URL 미설정 시에만 사용) ──────────────────
const DUMMY_USERS = [{ username: "test", password: "1234" }];

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  // ── Spring 백엔드 연동 ─────────────────────────────────────────
  if (BACKEND_URL) {
    let backendRes: Response;
    try {
      backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
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
        { message: data.message ?? "로그인에 실패했습니다." },
        { status: backendRes.status }
      );
    }

    // Spring이 발급한 세션 ID를 httpOnly 쿠키에 저장
    const { sessionId } = await backendRes.json();
    const res = NextResponse.json({ ok: true });
    res.cookies.set("gogle_session", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1시간 (Spring 세션 만료와 맞출 것)
    });
    return res;
  }

  // ── 더미 폴백 (BACKEND_URL 미설정 시) ─────────────────────────
  const user = DUMMY_USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return NextResponse.json(
      { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  // 더미 세션 ID: "dummy:username" 형태 (세션 검증 라우트와 약속된 포맷)
  const dummySessionId = `dummy:${username}`;
  const res = NextResponse.json({ ok: true });
  res.cookies.set("gogle_session", dummySessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  return res;
}
