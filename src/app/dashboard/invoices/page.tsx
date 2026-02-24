import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InvoiceDashboard } from "./invoice-dashboard";
import type { UserRole } from "@/types";

export const metadata = {
  title: "Invoices — Briefed",
};

export default async function InvoicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role: UserRole =
    (user.user_metadata?.role as UserRole) ?? "designer";
  if (role !== "designer") redirect("/dashboard");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("designer_id", user.id)
    .order("created_at", { ascending: false });

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, client_email, client_name")
    .eq("designer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <InvoiceDashboard
      invoices={invoices ?? []}
      projects={projects ?? []}
      designerId={user.id}
    />
  );
}
