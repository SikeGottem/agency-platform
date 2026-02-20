import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewProjectForm } from "@/components/dashboard/new-project-form";

export const metadata = {
  title: "New Project — Briefed",
};

export default async function NewProjectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.user_metadata?.role === "client") redirect("/dashboard");

  // Fetch designer's templates for the template picker
  const { data: templates } = await supabase
    .from("templates")
    .select("id, name, project_type, is_default")
    .eq("designer_id", user.id)
    .order("is_default", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground">
          Set up a new client onboarding project and send them a questionnaire link.
        </p>
      </div>
      <NewProjectForm
        templates={(templates ?? []).map((t) => ({
          id: t.id,
          name: t.name,
          projectType: t.project_type,
          isDefault: t.is_default ?? false,
        }))}
      />
    </div>
  );
}
