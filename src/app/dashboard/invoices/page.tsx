import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InvoiceDashboard } from "./invoice-dashboard";
import type { UserRole, Invoice } from "@/types";

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invoices } = await (supabase as any)
    .from("invoices")
    .select("*")
    .eq("designer_id", user.id)
    .order("created_at", { ascending: false });

  const { data: projects } = await supabase
    .from("projects")
    .select("id, project_type, client_email, client_name")
    .eq("designer_id", user.id)
    .order("created_at", { ascending: false });

  // Map projects to expected shape
  const mappedProjects = (projects ?? []).map((p) => ({
    id: p.id,
    name: `${p.project_type}${p.client_name ? ` — ${p.client_name}` : ""}`,
    client_email: p.client_email,
    client_name: p.client_name,
  }));

  return (
    <InvoiceDashboard
      invoices={(invoices as Invoice[]) ?? []}
      projects={mappedProjects}
      designerId={user.id}
    />
  );
}
