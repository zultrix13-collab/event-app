import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_link: "The login link has expired or is invalid. Request a new link below.",
  session_expired: "Your session has expired. Please sign in again.",
  missing_code: "The login link is incomplete. Request a new link below.",
  auth_unavailable: "Sign-in is temporarily unavailable. Please try again later."
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Sign in</h1>
      <p>Use your email to receive a secure one-time login link.</p>
      {params.error && ERROR_MESSAGES[params.error] ? (
        <p style={{ color: "#b91c1c", marginBottom: "0.5rem" }}>{ERROR_MESSAGES[params.error]}</p>
      ) : null}
      {params.next ? <p>After sign-in you will continue to: {params.next}</p> : null}
      <LoginForm next={params.next} />
    </main>
  );
}
