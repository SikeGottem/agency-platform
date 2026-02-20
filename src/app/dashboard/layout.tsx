import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import type { Database } from "@/types/supabase";
import type { UserRole } from "@/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ClientProfileRow = Database["public"]["Tables"]["client_profiles"]["Row"];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role: UserRole = (user.user_metadata?.role as UserRole) ?? "designer";

  let displayName = "";

  if (role === "client") {
    if (user.email) {
      await supabase
        .from("projects")
        .update({ client_id: user.id })
        .eq("client_email", user.email)
        .is("client_id", null);
    }

    const { data: clientProfile } = await supabase
      .from("client_profiles")
      .select("*")
      .eq("id", user.id)
      .returns<ClientProfileRow[]>()
      .single();
    displayName = clientProfile?.full_name ?? "";
  } else {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .returns<ProfileRow[]>()
      .single();
    displayName = profile?.full_name ?? "";
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SidebarNav
        user={{ email: user.email ?? "", name: displayName, id: user.id }}
        role={role}
      />
      <main className="md:pl-64 pt-14 md:pt-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
