import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, FileText, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-gradient-to-b from-[#f5f0eb] via-background to-background">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-primary/[0.04] blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Big 404 */}
        <div className="relative mb-6">
          <span className="text-[8rem] sm:text-[10rem] font-bold leading-none tracking-tighter text-muted-foreground/10 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl tracking-tight mb-3">
          Page not found
        </h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white rounded-xl"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl">
            <Link href="/dashboard">
              <FileText className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground transition-colors underline underline-offset-4 decoration-border">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors underline underline-offset-4 decoration-border">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-foreground transition-colors underline underline-offset-4 decoration-border">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
