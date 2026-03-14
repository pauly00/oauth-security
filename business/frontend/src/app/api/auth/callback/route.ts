import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Token exchange logic
  try {
    const tokenRes = await fetch('http://localhost:9000/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from('test-client:secret').toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://localhost:4000/api/auth/callback',
      }),
    });

    if (!tokenRes.ok) {
        const errorData = await tokenRes.json();
        console.error('Token exchange failed', errorData);
        return NextResponse.redirect(new URL('/?error=token_exchange_failed', req.url));
    }

    const tokens = await tokenRes.json();
    
    // 비즈니스 백엔드(8080)와 세션을 맺음
    const sessionRes = await fetch('http://localhost:8080/api/auth/session', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    const response = NextResponse.redirect(new URL('/dashboard', req.url));

    if (sessionRes.ok) {
        // 백엔드에서 보낸 JSESSIONID 쿠키를 찾아서 프론트엔드 브라우저로 전달
        const setCookie = sessionRes.headers.get('set-cookie');
        if (setCookie) {
            // JSESSIONID=... 형태를 추출하여 설정
            const jsessionid = setCookie.split(';')[0].split('=')[1];
            response.cookies.set('JSESSIONID', jsessionid, {
                httpOnly: true,
                secure: false, // localhost
                path: '/',
            });
        }
    }

    // 개발 편의를 위해 access_token도 남겨둠
    response.cookies.set('access_token', tokens.access_token, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.expires_in,
    });

    return response;
  } catch (e) {
    console.error('Callback error', e);
    return NextResponse.redirect(new URL('/?error=internal_server_error', req.url));
  }
}
