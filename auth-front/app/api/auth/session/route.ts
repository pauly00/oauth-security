import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get("gogle_session")?.value;

  if (!sessionId) {
    return NextResponse.json({ loggedIn: false });
  }

  // ── Spring 백엔드 연동 ─────────────────────────────────────────
  if (BACKEND_URL) {
    let backendRes: Response;
    try {
      backendRes = await fetch(`${BACKEND_URL}/api/auth/session/validate`, {
        method: "GET",
        headers: {
          // 세션 ID를 헤더로 전달 (쿠키를 그대로 포워딩하는 것도 가능)
          "X-Session-Id": sessionId,
        },
      });
    } catch {
      // 백엔드 연결 실패 시 미로그인으로 처리
      return NextResponse.json({ loggedIn: false });
    }

    if (!backendRes.ok) {
      // 세션이 만료됐거나 유효하지 않으면 쿠키 삭제
      const res = NextResponse.json({ loggedIn: false });
      res.cookies.delete("gogle_session");
      return res;
    }

    const { username } = await backendRes.json();
    return NextResponse.json({ loggedIn: true, username });
  }

  // ── 더미 폴백 (BACKEND_URL 미설정 시) ─────────────────────────
  // login 라우트에서 "dummy:username" 형태로 저장한 값을 파싱
  if (sessionId.startsWith("dummy:")) {
    const username = sessionId.slice("dummy:".length);
    return NextResponse.json({ loggedIn: true, username });
  }

  return NextResponse.json({ loggedIn: false });
}
