import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { redirectUri, state, allow } = await req.json();
  const jsessionId = req.cookies.get("JSESSIONID")?.value;

  if (!jsessionId) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!allow) {
    return NextResponse.json({
      redirectUrl: `${redirectUri}?error=access_denied&state=${state}`,
    });
  }

  // 동의 처리는 ConsentForm에서 Spring AS /oauth2/authorize 로 직접 POST됨
  return NextResponse.json({ message: "동의는 Spring AS에서 직접 처리됩니다." }, { status: 400 });
}
