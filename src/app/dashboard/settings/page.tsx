import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/dashboard/settings-form";
import type { Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export const metadata = {
  title: "Settings — Briefed",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .returns<ProfileRow[]>()
    .single();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>
      <div className="max-w-2xl">
        <SettingsForm
          profile={{
            fullName: profile?.full_name ?? "",
            businessName: profile?.business_name ?? "",
            avatarUrl: profile?.avatar_url ?? "",
            email: user.email ?? "",
            planTier: profile?.plan_tier ?? "free",
            userId: user.id,
          }}
        />
      </div>
    </div>
  );
}
