import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientsListView } from "./clients-list-view";

export const metadata = { title: "Clients – Briefed" };

export default async function ClientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all projects for this designer
  const { data: projects } = await supabase
    .from("projects")
    .select("id, client_email, client_name, status, created_at, updated_at")
    .eq("designer_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch all invoices for this designer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: invoices } = (await sb
    .from("invoices")
    .select("client_email, amount_cents, status")
    .eq("designer_id", user.id)) as {
    data: Array<{ client_email: string; amount_cents: number; status: string }> | null;
  };

  // Fetch lifecycle states for health scores
  const projectIds = (projects ?? []).map((p) => p.id);
  const { data: lifecycleStates } = (projectIds.length
    ? await sb
        .from("lifecycle_states")
        .select("project_id, client_health_score")
        .in("project_id", projectIds)
    : { data: [] }) as {
    data: Array<{ project_id: string; client_health_score: number }> | null;
  };

  // Build health score map: project_id -> score
  const healthMap = new Map<string, number>();
  for (const ls of lifecycleStates ?? []) {
    healthMap.set(ls.project_id, Number(ls.client_health_score));
  }

  // Aggregate by client_email
  const clientMap = new Map<
    string,
    {
      email: string;
      name: string;
      totalProjects: number;
      totalRevenueCents: number;
      lastProjectDate: string;
      healthScores: number[];
    }
  >();

  for (const p of projects ?? []) {
    const existing = clientMap.get(p.client_email);
    const health = healthMap.get(p.id);
    if (existing) {
      existing.totalProjects++;
      if (p.created_at > existing.lastProjectDate) {
        existing.lastProjectDate = p.created_at;
      }
      if (!existing.name && p.client_name) existing.name = p.client_name;
      if (health !== undefined) existing.healthScores.push(health);
    } else {
      clientMap.set(p.client_email, {
        email: p.client_email,
        name: p.client_name ?? "",
        totalProjects: 1,
        totalRevenueCents: 0,
        lastProjectDate: p.created_at,
        healthScores: health !== undefined ? [health] : [],
      });
    }
  }

  // Add invoice revenue
  for (const inv of invoices ?? []) {
    const client = clientMap.get(inv.client_email);
    if (client && inv.status === "paid") {
      client.totalRevenueCents += inv.amount_cents;
    }
  }

  const clients = Array.from(clientMap.values())
    .map((c) => ({
      ...c,
      avgHealthScore:
        c.healthScores.length > 0
          ? Math.round(
              c.healthScores.reduce((a, b) => a + b, 0) / c.healthScores.length
            )
          : null,
    }))
    .sort((a, b) => b.lastProjectDate.localeCompare(a.lastProjectDate));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">
          Clients
        </h1>
        <p className="text-muted-foreground mt-1">
          {clients.length} client{clients.length !== 1 ? "s" : ""} across all
          projects
        </p>
      </div>
      <ClientsListView clients={clients} />
    </div>
  );
}
