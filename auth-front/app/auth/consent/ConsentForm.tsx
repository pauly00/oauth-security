"use client";

// scope → 한국어 설명 매핑
const SCOPE_LABELS: Record<string, { label: string; desc: string }> = {
  openid: { label: "기본 정보 확인", desc: "사용자 식별자(ID)를 읽습니다." },
  profile: { label: "프로필", desc: "이름, 프로필 사진을 읽습니다." },
  read: { label: "읽기", desc: "계정 데이터를 조회합니다." },
  write: { label: "쓰기", desc: "계정 데이터를 생성·수정합니다." },
};

// 동의 폼 props
interface ConsentFormProps {
  clientName: string;
  requestedScopes: string[];
  clientId: string;
  state: string;
  redirectUri: string;
  authServerUrl: string;
}

export default function ConsentForm({
  clientName,
  requestedScopes,
  clientId,
  state,
  redirectUri,
  authServerUrl,
}: ConsentFormProps) {
  function handleDeny() {
    window.location.href = `${redirectUri}?error=access_denied&state=${state}`;
  }

  // Spring Authorization Server가 기대하는 POST /oauth2/authorize 대신 커스텀 엔드포인트 사용
  const consentActionUrl = `${authServerUrl}/api/auth/consent`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const selectedScopes = formData.getAll("scope") as string[];

    try {
      const response = await fetch(consentActionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // JSESSIONID 쿠키 포함
        body: JSON.stringify({
          client_id: clientId,
          state: state,
          redirect_uri: redirectUri,
          scope: selectedScopes.join(" "),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.redirectUri) {
          window.location.href = data.redirectUri;
        }
      } else {
        const errorText = await response.text();
        alert("동의 처리 중 오류가 발생했습니다: " + errorText);
      }
    } catch (error) {
      console.error("Consent submission failed:", error);
      alert("서버 연결에 실패했습니다.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-[420px] rounded-2xl border border-zinc-200 bg-white px-8 py-8 shadow-lg">

        {/* 고글 로고 */}
        <div className="mb-5 flex justify-center">
          <span className="text-2xl font-semibold tracking-tight">
            <span style={{ color: "#4285F4" }}>G</span>
            <span style={{ color: "#EA4335" }}>o</span>
            <span style={{ color: "#FBBC05" }}>g</span>
            <span style={{ color: "#4285F4" }}>l</span>
            <span style={{ color: "#34A853" }}>e</span>
          </span>
        </div>

        {/* 타이틀 */}
        <h1 className="mb-1 text-center text-xl font-normal text-zinc-900">
          <span className="font-semibold">{clientName}</span>이(가)
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-500">
          고글 계정 접근을 요청합니다.
        </p>

        {/*
          Spring Authorization Server의 /oauth2/authorize 에 직접 POST 합니다.
          - client_id, state: hidden input
          - scope: 각 항목을 checkbox (name="scope") 로 전송
        */}
        <form onSubmit={handleSubmit}>
          {/* <input type="hidden" name="client_id" value={clientId} /> */}
          {/* <input type="hidden" name="state" value={state} /> */}

          {/* 요청 권한 목록 (checkbox) */}
          <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 divide-y divide-zinc-200">
            {requestedScopes.map((s) => {
              const info = SCOPE_LABELS[s] ?? { label: s, desc: `${s} 권한` };
              return (
                <label
                  key={s}
                  className="flex cursor-pointer items-start gap-3 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    name="scope"
                    value={s}
                    defaultChecked
                    className="mt-1 h-4 w-4 flex-shrink-0 rounded accent-black"
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{info.label}</p>
                    <p className="text-xs text-zinc-500">{info.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* 안내 문구 */}
          <p className="mb-6 text-xs text-zinc-400 text-center">
            허용 시 <span className="font-medium text-zinc-600">{clientName}</span>이
            위 권한으로 내 고글 계정에 접근할 수 있습니다.
            언제든지 고글 계정 설정에서 취소할 수 있습니다.
          </p>

          {/* 버튼 */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleDeny}
              className="text-sm font-medium text-zinc-500 hover:underline"
            >
              거부
            </button>
            <button
              type="submit"
              className="rounded-full bg-black px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              허용
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
