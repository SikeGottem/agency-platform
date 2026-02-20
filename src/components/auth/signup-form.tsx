"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { signUpSchema, type SignUpFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Paintbrush, User, Loader2 } from "lucide-react";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score: 2, label: "Fair", color: "bg-orange-500" };
    if (score <= 3) return { score: 3, label: "Good", color: "bg-yellow-500" };
    if (score <= 4) return { score: 4, label: "Strong", color: "bg-green-500" };
    return { score: 5, label: "Very strong", color: "bg-emerald-500" };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i <= strength.score ? strength.color : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{strength.label}</p>
    </div>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prefilledEmail = searchParams.get("email") || "";
  const projectId = searchParams.get("project_id") || null;

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: prefilledEmail,
      password: "",
      fullName: "",
      role: projectId ? "client" : undefined,
    },
  });

  useEffect(() => {
    if (prefilledEmail) {
      form.setValue("email", prefilledEmail);
    }
  }, [prefilledEmail, form]);

  async function onSubmit(data: SignUpFormData) {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: data.role,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    if (projectId) {
      try {
        const response = await fetch("/api/profile/link-project", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        if (!response.ok) {
          const responseData = await response.json();
          console.error("Failed to link project:", responseData.error);
        }
      } catch (err) {
        console.error("Error linking project:", err);
      }
    }

    setIsRedirecting(true);
    if (data.role === "designer") {
      router.push("/dashboard");
    } else {
      router.push("/client");
    }
    router.refresh();
  }

  const selectedRole = form.watch("role");
  const watchedPassword = form.watch("password");

  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#E05252]" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Setting up your account...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold tracking-tight">
          Create your account
        </h2>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Get started free — no credit card required
        </p>
      </div>

      {/* Google OAuth */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 mb-6 gap-2.5 font-medium"
        onClick={() => {
          // OAuth not wired up yet
        }}
      >
        <GoogleIcon />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-muted-foreground">or continue with email</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">I am a...</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 gap-3"
                  >
                    <Label
                      htmlFor="role-designer"
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:border-[#E05252]/50 focus-within:ring-2 focus-within:ring-[#E05252] focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-black",
                        selectedRole === "designer"
                          ? "border-[#E05252] bg-[#E05252]/5 shadow-sm"
                          : "border-muted"
                      )}
                    >
                      <RadioGroupItem
                        value="designer"
                        id="role-designer"
                        className="sr-only"
                      />
                      <Paintbrush className="h-5 w-5" />
                      <span className="text-sm font-medium">Designer</span>
                      <span className="text-[11px] text-muted-foreground text-center leading-tight">
                        Create briefs &amp; manage projects
                      </span>
                    </Label>
                    <Label
                      htmlFor="role-client"
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:border-[#E05252]/50 focus-within:ring-2 focus-within:ring-[#E05252] focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-black",
                        selectedRole === "client"
                          ? "border-[#E05252] bg-[#E05252]/5 shadow-sm"
                          : "border-muted"
                      )}
                    >
                      <RadioGroupItem
                        value="client"
                        id="role-client"
                        className="sr-only"
                      />
                      <User className="h-5 w-5" />
                      <span className="text-sm font-medium">Client</span>
                      <span className="text-[11px] text-muted-foreground text-center leading-tight">
                        Share your vision with designers
                      </span>
                    </Label>
                  </RadioGroup>
                </FormControl>
                <FormMessage className="text-xs animate-in fade-in slide-in-from-top-1 duration-150" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">Full name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jane Smith"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs animate-in fade-in slide-in-from-top-1 duration-150" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs animate-in fade-in slide-in-from-top-1 duration-150" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <PasswordStrength password={watchedPassword} />
                <FormMessage className="text-xs animate-in fade-in slide-in-from-top-1 duration-150" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full h-11 bg-[#E05252] hover:bg-[#c94545] text-white font-medium transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#E05252] hover:text-[#c94545] transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E05252] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black"
          >
            Log in
          </Link>
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-foreground transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
