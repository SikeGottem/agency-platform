import { createClient } from "@/lib/supabase/server";
import { DesignerDashboard } from "@/components/dashboard/designer-dashboard";
import { ClientDashboard } from "@/components/dashboard/client-dashboard";
import type { UserRole } from "@/types";

export const metadata = {
  title: "Dashboard — Briefed",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role: UserRole = (user!.user_metadata?.role as UserRole) ?? "designer";

  if (role === "client") {
    return <ClientDashboard userId={user!.id} />;
  }

  return <DesignerDashboard userId={user!.id} />;
}
