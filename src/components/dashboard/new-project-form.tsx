"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, ArrowLeft, Send, User, Mail, Briefcase, FileText, Wand2,
  Palette, Globe, Share2, Package, PenTool, Layout, Printer, Play, Smartphone,
  Zap, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_TYPES, PROJECT_TYPE_LABELS, PROJECT_TYPE_ICONS, type ProjectType } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette, Globe, Share2, Package, PenTool, Layout, Printer, Play, Smartphone,
};

const newProjectSchema = z.object({
  clientName: z.string().min(1, "Client name is required").max(100),
  clientEmail: z.string().email("Please enter a valid email address"),
  projectType: z.enum(PROJECT_TYPES),
  briefMode: z.enum(["full", "quick"]),
  templateId: z.string().optional(),
  customMessage: z.string().max(500).optional(),
});

type NewProjectData = z.infer<typeof newProjectSchema>;

interface Template {
  id: string;
  name: string;
  projectType: string;
  isDefault: boolean;
}

interface NewProjectFormProps {
  templates: Template[];
}

export function NewProjectForm({ templates }: NewProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewProjectData>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      projectType: "branding",
      briefMode: "full",
      templateId: "",
      customMessage: "",
    },
  });

  const selectedProjectType = form.watch("projectType");
  const availableTemplates = templates.filter(
    t => t.projectType === selectedProjectType
  );

  // Set default template when project type changes
  React.useEffect(() => {
    if (availableTemplates.length > 0) {
      const defaultTemplate = availableTemplates.find(t => t.isDefault);
      if (defaultTemplate) {
        form.setValue("templateId", defaultTemplate.id);
      } else {
        form.setValue("templateId", availableTemplates[0].id);
      }
    }
  }, [selectedProjectType, availableTemplates, form]);

  async function onSubmit(data: NewProjectData) {
    setIsSubmitting(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          designer_id: user.id,
          client_name: data.clientName,
          client_email: data.clientEmail,
          project_type: data.projectType,
          brief_mode: data.briefMode,
          template_id: data.templateId || null,
          status: "draft",
          custom_message: data.customMessage || null,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Generate magic link token for easy client access
      const magicToken = crypto.randomUUID();
      const { error: tokenError } = await supabase
        .from("projects")
        .update({ magic_link_token: magicToken })
        .eq("id", project.id);

      if (tokenError) throw tokenError;

      toast.success("Project created successfully!");
      router.push(`/dashboard/projects/${project.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </CardTitle>
            <CardDescription>
              Enter your client's basic information to create their personalized briefing experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Smith"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    They'll receive the briefing link and updates at this email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Project Details
            </CardTitle>
            <CardDescription>
              Choose the project type and template for this client's briefing questionnaire.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Type</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {PROJECT_TYPES.map((type) => {
                      const IconComp = ICON_MAP[PROJECT_TYPE_ICONS[type]];
                      const isSelected = field.value === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => field.onChange(type)}
                          className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-sm transition-colors hover:bg-accent ${
                            isSelected
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-muted text-muted-foreground"
                          }`}
                        >
                          {IconComp && <IconComp className="h-5 w-5" />}
                          <span className="font-medium text-xs">{PROJECT_TYPE_LABELS[type]}</span>
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="briefMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brief Mode</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => field.onChange("full")}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-colors hover:bg-accent",
                        field.value === "full"
                          ? "border-primary bg-primary/5"
                          : "border-muted"
                      )}
                    >
                      <ClipboardList className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium">Full Brief</div>
                        <div className="text-xs text-muted-foreground">10+ detailed steps</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange("quick")}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-colors hover:bg-accent",
                        field.value === "quick"
                          ? "border-primary bg-primary/5"
                          : "border-muted"
                      )}
                    >
                      <Zap className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium">Quick Brief</div>
                        <div className="text-xs text-muted-foreground">3 steps for small projects</div>
                      </div>
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Questionnaire Template</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            {template.name}
                            {template.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {availableTemplates.length === 0 ? (
                      <span className="text-amber-600">
                        No templates available for {PROJECT_TYPE_LABELS[selectedProjectType]}. 
                        <Link href="/dashboard/templates" className="underline ml-1">
                          Create one first
                        </Link>.
                      </span>
                    ) : (
                      "The questionnaire template that will be used for this project."
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Custom Message (Optional)
            </CardTitle>
            <CardDescription>
              Add a personal message that will appear on the client's briefing page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="customMessage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Hi John! I'm excited to work on your branding project. Please take a few minutes to complete this brief so I can understand your vision better."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This message will be shown to your client when they start the briefing process.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <Button 
            type="submit" 
            disabled={isSubmitting || availableTemplates.length === 0}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Create Project
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Fix React import
import * as React from "react";