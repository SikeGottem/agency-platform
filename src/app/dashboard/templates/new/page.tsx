import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TemplateBuilder } from "@/components/dashboard/template-builder";

export const metadata = {
  title: "Create Template — Briefed",
};

export default async function NewTemplatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) redirect("/login");
  if (user.user_metadata?.role === "client") redirect("/dashboard");

  return (
    <TemplateBuilder />
  );
}