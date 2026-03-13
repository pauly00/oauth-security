import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const jsessionId = req.cookies.get("JSESSIONID")?.value;

  if (!jsessionId) {
    return NextResponse.json({ loggedIn: false });
  }

  return NextResponse.json({ loggedIn: true });
}
