import { NextRequest, NextResponse } from "next/server";

// 더미 계정 — 백엔드 API 연동 전 테스트용
const DUMMY_USERS = [
  { username: "test", password: "1234" },
];

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = DUMMY_USERS.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return NextResponse.json(
      { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
