"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Copy, Trash2 } from "lucide-react";
import { PROJECT_TYPE_LABELS, type ProjectType } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Template {
  id: string;
  name: string;
  projectType: string;
  isDefault: boolean;
  stepsCount: number;
  projectsUsing: number;
  updatedAt: string;
}

interface TemplateListProps {
  templates: Template[];
  onTemplateDelete?: (templateId: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  branding: "bg-purple-100 text-purple-800",
  web_design: "bg-blue-100 text-blue-800",
  social_media: "bg-pink-100 text-pink-800",
};

export function TemplateList({ templates, onTemplateDelete }: TemplateListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      PROJECT_TYPE_LABELS[template.projectType as ProjectType]
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  async function handleDeleteTemplate(templateId: string, templateName: string) {
    if (!confirm(`Are you sure you want to delete "${templateName}"?`)) {
      return;
    }

    setDeletingId(templateId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      toast.success("Template deleted successfully");
      onTemplateDelete?.(templateId);
      router.refresh();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDuplicateTemplate(template: Template) {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      // Get the full template data
      const { data: templateData } = await supabase
        .from("templates")
        .select("*")
        .eq("id", template.id)
        .single();

      if (!templateData) throw new Error("Template not found");

      // Create duplicate
      const { error } = await supabase
        .from("templates")
        .insert({
          designer_id: user.id,
          name: `${template.name} (Copy)`,
          project_type: templateData.project_type,
          questions: templateData.questions,
          is_default: false,
        });

      if (error) throw error;

      toast.success("Template duplicated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast.error("Failed to duplicate template");
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Plus className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No templates yet</h3>
          <p className="mb-4 max-w-sm text-muted-foreground">
            Create your first template to customize questionnaires for your clients.
          </p>
          <Button
            style={{ backgroundColor: "#E05252" }}
            className="text-white hover:opacity-90"
            onClick={() => router.push("/dashboard/templates/new")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="group transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  {template.isDefault && <Badge variant="secondary">Default</Badge>}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      TYPE_COLORS[template.projectType] ?? "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {PROJECT_TYPE_LABELS[template.projectType as ProjectType] ?? template.projectType}
                  </span>
                </div>
                <CardTitle className="font-display text-base leading-tight">
                  {template.name}
                </CardTitle>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-4 h-4 flex flex-col justify-center">
                      <div className="w-1 h-1 bg-current rounded-full mb-0.5"></div>
                      <div className="w-1 h-1 bg-current rounded-full mb-0.5"></div>
                      <div className="w-1 h-1 bg-current rounded-full"></div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => router.push(`/dashboard/templates/${template.id}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  {!template.isDefault && (
                    <DropdownMenuItem 
                      className="text-destructive"
                      disabled={deletingId === template.id}
                      onClick={() => handleDeleteTemplate(template.id, template.name)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent 
              className="cursor-pointer"
              onClick={() => router.push(`/dashboard/templates/${template.id}`)}
            >
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{template.stepsCount} steps</p>
                <p>
                  {template.projectsUsing} project{template.projectsUsing !== 1 ? "s" : ""} using this
                </p>
                <p className="text-xs">Last edited {formatDate(template.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results */}
      {filteredTemplates.length === 0 && searchTerm && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or create a new template.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}