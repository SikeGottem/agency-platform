import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch client profile for display name
  const { data: profile } = await supabase
    .from("client_profiles")
    .select("full_name, company_name")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.full_name || profile?.company_name || user.email || "Client";

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Top nav — clean, no sidebar */}
      <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link
            href="/client"
            className="font-[family-name:var(--font-display)] text-xl font-bold text-stone-900 tracking-tight"
          >
            Briefed
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-stone-600">
              {displayName}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
