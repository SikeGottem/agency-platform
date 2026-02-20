import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Log In — Briefed",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-[400px] rounded-lg bg-muted" />}>
      <LoginForm />
    </Suspense>
  );
}
