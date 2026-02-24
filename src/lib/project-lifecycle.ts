import { createClient } from "@/lib/supabase/server";
import type {
  LifecycleState,
  LifecyclePhase,
  Blocker,
  CompletedPhase,
  LIFECYCLE_PHASES,
} from "@/types";

// ===========================
// Read lifecycle state
// ===========================

export async function getLifecycleState(
  projectId: string
): Promise<LifecycleState | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lifecycle_states")
    .select("*")
    .eq("project_id", projectId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch lifecycle state: ${error.message}`);
  }
  return data as LifecycleState | null;
}

// ===========================
// Initialize lifecycle state
// ===========================

export async function initLifecycleState(
  projectId: string,
  phase: LifecyclePhase = "discovery"
): Promise<LifecycleState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lifecycle_states")
    .upsert(
      {
        project_id: projectId,
        current_phase: phase,
        phase_started_at: new Date().toISOString(),
        phases_completed: [],
        blockers: [],
        client_health_score: 100,
      },
      { onConflict: "project_id" }
    )
    .select()
    .single();

  if (error) throw new Error(`Failed to init lifecycle: ${error.message}`);
  return data as LifecycleState;
}

// ===========================
// Advance phase
// ===========================

export async function advancePhase(
  projectId: string,
  nextPhase: LifecyclePhase
): Promise<LifecycleState> {
  const current = await getLifecycleState(projectId);
  if (!current) throw new Error("No lifecycle state found for project");

  const now = new Date().toISOString();
  const completedPhase: CompletedPhase = {
    phase: current.current_phase,
    started_at: current.phase_started_at,
    completed_at: now,
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lifecycle_states")
    .update({
      current_phase: nextPhase,
      phase_started_at: now,
      phases_completed: [...current.phases_completed, completedPhase],
    })
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) throw new Error(`Failed to advance phase: ${error.message}`);
  return data as LifecycleState;
}

// ===========================
// Blockers
// ===========================

export async function addBlocker(
  projectId: string,
  blocker: Omit<Blocker, "id" | "created_at">
): Promise<LifecycleState> {
  const current = await getLifecycleState(projectId);
  if (!current) throw new Error("No lifecycle state found for project");

  const newBlocker: Blocker = {
    ...blocker,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lifecycle_states")
    .update({
      blockers: [...current.blockers, newBlocker],
    })
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) throw new Error(`Failed to add blocker: ${error.message}`);
  return data as LifecycleState;
}

export async function resolveBlocker(
  projectId: string,
  blockerId: string
): Promise<LifecycleState> {
  const current = await getLifecycleState(projectId);
  if (!current) throw new Error("No lifecycle state found for project");

  const updatedBlockers = current.blockers.map((b) =>
    b.id === blockerId ? { ...b, resolved_at: new Date().toISOString() } : b
  );

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lifecycle_states")
    .update({ blockers: updatedBlockers })
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) throw new Error(`Failed to resolve blocker: ${error.message}`);
  return data as LifecycleState;
}

// ===========================
// Client health score
// ===========================

export async function updateClientHealth(
  projectId: string,
  score: number
): Promise<LifecycleState> {
  const clamped = Math.max(0, Math.min(100, score));
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lifecycle_states")
    .update({ client_health_score: clamped })
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update health: ${error.message}`);
  return data as LifecycleState;
}

// ===========================
// Helpers
// ===========================

export function getActiveBlockers(state: LifecycleState): Blocker[] {
  return state.blockers.filter((b) => !b.resolved_at);
}

export function isPhaseComplete(
  state: LifecycleState,
  phase: LifecyclePhase
): boolean {
  return state.phases_completed.some((p) => p.phase === phase);
}
