import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientDetailView } from "./client-detail-view";

interface InvoiceRow {
  id: string;
  project_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

interface LifecycleRow {
  project_id: string;
  current_phase: string;
  client_health_score: number;
  updated_at: string;
}

interface MessageRow {
  id: string;
  project_id: string;
  sender_type: string;
  content: string;
  created_at: string;
}

interface Props {
  params: Promise<{ email: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { email } = await params;
  return { title: `${decodeURIComponent(email)} – Clients – Briefed` };
}

export default async function ClientDetailPage({ params }: Props) {
  const { email: rawEmail } = await params;
  const clientEmail = decodeURIComponent(rawEmail);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all projects for this client under this designer
  const { data: projects } = await supabase
    .from("projects")
    .select("id, client_email, client_name, project_type, status, created_at, updated_at, completed_at")
    .eq("designer_id", user.id)
    .eq("client_email", clientEmail)
    .order("created_at", { ascending: false });

  if (!projects || projects.length === 0) notFound();

  const projectIds = projects.map((p) => p.id);

  // Fetch invoices, lifecycle states, messages in parallel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const [invoicesRes, lifecycleRes, messagesRes] = await Promise.all([
    sb
      .from("invoices")
      .select("id, project_id, amount_cents, currency, status, due_date, paid_at, created_at")
      .eq("designer_id", user.id)
      .eq("client_email", clientEmail)
      .order("created_at", { ascending: false }) as Promise<{ data: InvoiceRow[] | null }>,
    sb
      .from("lifecycle_states")
      .select("project_id, current_phase, client_health_score, updated_at")
      .in("project_id", projectIds) as Promise<{ data: LifecycleRow[] | null }>,
    sb
      .from("messages")
      .select("id, project_id, sender_type, content, created_at")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false })
      .limit(50) as Promise<{ data: MessageRow[] | null }>,
  ]);

  const clientName = projects.find((p) => p.client_name)?.client_name ?? "";

  // Calculate lifetime value (paid invoices)
  const lifetimeValueCents = (invoicesRes.data ?? [])
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount_cents, 0);

  // Build health score map
  const lifecycleMap = new Map<
    string,
    { phase: string; healthScore: number; updatedAt: string }
  >();
  for (const ls of lifecycleRes.data ?? []) {
    lifecycleMap.set(ls.project_id, {
      phase: ls.current_phase,
      healthScore: Number(ls.client_health_score),
      updatedAt: ls.updated_at,
    });
  }

  // Build timeline events from projects, invoices, messages
  const timeline: Array<{
    type: "project" | "invoice" | "message";
    date: string;
    title: string;
    description: string;
    projectId?: string;
  }> = [];

  for (const p of projects) {
    timeline.push({
      type: "project",
      date: p.created_at,
      title: `Project created: ${p.project_type.replace(/_/g, " ")}`,
      description: `Status: ${p.status}`,
      projectId: p.id,
    });
    if (p.completed_at) {
      timeline.push({
        type: "project",
        date: p.completed_at,
        title: `Project completed: ${p.project_type.replace(/_/g, " ")}`,
        description: "",
        projectId: p.id,
      });
    }
  }

  for (const inv of invoicesRes.data ?? []) {
    timeline.push({
      type: "invoice",
      date: inv.created_at,
      title: `Invoice ${inv.status}: $${(inv.amount_cents / 100).toFixed(2)}`,
      description: inv.paid_at ? `Paid ${new Date(inv.paid_at).toLocaleDateString("en-AU")}` : "",
      projectId: inv.project_id,
    });
  }

  for (const msg of messagesRes.data ?? []) {
    timeline.push({
      type: "message",
      date: msg.created_at,
      title: `${msg.sender_type === "client" ? "Client" : "You"} sent a message`,
      description: msg.content.slice(0, 80) + (msg.content.length > 80 ? "…" : ""),
      projectId: msg.project_id,
    });
  }

  timeline.sort((a, b) => b.date.localeCompare(a.date));

  // Projects with lifecycle info
  const projectsWithLifecycle = projects.map((p) => {
    const lc = lifecycleMap.get(p.id);
    return {
      ...p,
      currentPhase: lc?.phase ?? null,
      healthScore: lc?.healthScore ?? null,
    };
  });

  // Health score trend (ordered by project creation)
  const healthTrend = projects
    .slice()
    .reverse()
    .map((p) => {
      const lc = lifecycleMap.get(p.id);
      return {
        projectType: p.project_type,
        date: p.created_at,
        score: lc?.healthScore ?? null,
      };
    })
    .filter((h) => h.score !== null);

  return (
    <ClientDetailView
      clientName={clientName}
      clientEmail={clientEmail}
      projects={projectsWithLifecycle}
      lifetimeValueCents={lifetimeValueCents}
      timeline={timeline.slice(0, 30)}
      healthTrend={healthTrend as Array<{ projectType: string; date: string; score: number }>}
    />
  );
}
