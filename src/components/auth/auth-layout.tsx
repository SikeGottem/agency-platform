"use client";

import { Briefcase } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const isSignup = pathname === "/signup";
  const isLegal = pathname === "/privacy" || pathname === "/terms";

  // Legal pages get a simple centered layout
  if (isLegal) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="mx-auto max-w-2xl flex items-center gap-2 px-4 py-4">
            <Link href="/login" className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#E05252]" />
              <span className="text-lg font-display font-bold">Briefed</span>
            </Link>
          </div>
        </header>
        {children}
      </div>
    );
  }

  // Login — simple centered form, no advertising panel
  if (!isSignup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7] p-6">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-2 mb-10 justify-center">
            <Briefcase className="h-5 w-5 text-[#E05252]" />
            <span className="text-lg font-display font-bold">Briefed</span>
          </div>
          {children}
        </div>
      </div>
    );
  }

  // Signup — split layout with branding panel
  return (
    <div className="min-h-screen flex bg-[#faf9f7]">
      {/* Left Panel — Branding (signup only) */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#faf9f7]">
        {/* Warm gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E05252]/[0.06] via-transparent to-[#E05252]/[0.03]" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#E05252]/[0.04] blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Briefcase className="h-6 w-6 text-[#E05252]" />
            <span className="text-xl font-display font-bold tracking-tight">Briefed</span>
          </div>

          {/* Main Content */}
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E05252]/[0.08] px-3.5 py-1.5 text-xs font-medium text-[#E05252] mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E05252] animate-pulse" />
              Join 500+ designers already on Briefed
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight leading-[1.1] mb-4">
              Your briefs,
              <br />
              <span className="text-[#E05252]">finally sorted.</span>
            </h1>
            <p className="text-base text-muted-foreground mb-10 leading-relaxed">
              Stop chasing clients for project details. Create a brief, share a link, and get everything you need — organized and ready to go.
            </p>

            {/* Feature highlights */}
            <div className="space-y-4">
              {[
                { emoji: "✦", title: "Smart questionnaires", desc: "Tailored to your design niche" },
                { emoji: "◈", title: "No client signup needed", desc: "They fill briefs at their own pace" },
                { emoji: "◇", title: "Beautiful output", desc: "Organized briefs, every single time" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3.5 group">
                  <div className="flex-shrink-0 mt-0.5 h-8 w-8 rounded-lg bg-[#E05252]/[0.06] border border-[#E05252]/[0.1] flex items-center justify-center text-[#E05252] text-sm transition-colors group-hover:bg-[#E05252]/[0.1]">
                    {item.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} Briefed. Built for designers who value their time.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <Briefcase className="h-5 w-5 text-[#E05252]" />
            <span className="text-lg font-display font-bold">Briefed</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
