import LoginButton from "@/app/components/auth/LoginButton";

interface HomePageProps {
  searchParams: Promise<{
    client_id?: string;
    redirect_uri?: string;
    scope?: string;
    state?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <LoginButton
        clientId={params.client_id}
        redirectUri={params.redirect_uri}
        scope={params.scope}
        state={params.state}
      />
    </div>
  );
}
