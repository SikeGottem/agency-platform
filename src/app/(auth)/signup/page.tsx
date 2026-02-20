import { Suspense } from "react";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign Up — Briefed",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-[500px] rounded-lg bg-muted" />}>
      <SignUpForm />
    </Suspense>
  );
}
