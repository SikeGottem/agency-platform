import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Send, ClipboardCheck, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-stone-50/95 backdrop-blur supports-[backdrop-filter]:bg-stone-50/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-xl font-bold text-stone-900">Briefed</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#how-it-works" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
              How It Works
            </Link>
            <Link href="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
              Log In
            </Link>
            <Button asChild size="sm" className="bg-stone-900 hover:bg-stone-800">
              <Link href="/signup">Start Free</Link>
            </Button>
          </nav>
          <Button asChild size="sm" className="md:hidden bg-stone-900 hover:bg-stone-800">
            <Link href="/signup">Start Free</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 md:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium tracking-wide text-stone-500 uppercase">
            For designers & agencies
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl md:text-6xl leading-[1.1]">
            Turn client conversations into{" "}
            <span className="text-stone-500">actionable design briefs</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
            Stop chasing emails for project details. Send your client one link, get back a structured brief ready to design from.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild className="bg-stone-900 hover:bg-stone-800 text-base px-8">
              <Link href="/signup">
                Send Your First Brief <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-stone-300 text-stone-700 hover:bg-stone-100 text-base">
              <Link href="/login">
                Log In
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-stone-400">
            Free to start · No credit card required
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-y border-stone-200 bg-white py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Three steps. One perfect brief.
            </h2>
            <p className="mt-4 text-lg text-stone-500">
              From first contact to design-ready in minutes, not days.
            </p>
          </div>

          <div className="mx-auto max-w-4xl grid gap-12 md:grid-cols-3 md:gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100">
                <FileText className="h-6 w-6 text-stone-700" />
              </div>
              <div className="mb-2 text-xs font-semibold tracking-wider text-stone-400 uppercase">Step 1</div>
              <h3 className="mb-2 text-xl font-semibold text-stone-900">Create</h3>
              <p className="text-stone-500 leading-relaxed">
                Set up a project and pick a questionnaire template — branding, web, or custom.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100">
                <Send className="h-6 w-6 text-stone-700" />
              </div>
              <div className="mb-2 text-xs font-semibold tracking-wider text-stone-400 uppercase">Step 2</div>
              <h3 className="mb-2 text-xl font-semibold text-stone-900">Send</h3>
              <p className="text-stone-500 leading-relaxed">
                Share a magic link with your client. They fill it out at their own pace — no account needed.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100">
                <ClipboardCheck className="h-6 w-6 text-stone-700" />
              </div>
              <div className="mb-2 text-xs font-semibold tracking-wider text-stone-400 uppercase">Step 3</div>
              <h3 className="mb-2 text-xl font-semibold text-stone-900">Brief</h3>
              <p className="text-stone-500 leading-relaxed">
                Get a structured, designer-ready brief with style preferences, goals, and everything you need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Briefed */}
      <section className="container py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-stone-900 mb-8 text-center sm:text-3xl">
            Why designers use Briefed
          </h2>
          <div className="space-y-6">
            {[
              { title: "No more email chains", desc: "One link replaces weeks of back-and-forth trying to extract project requirements." },
              { title: "Clients actually finish it", desc: "Interactive, mobile-friendly questionnaires with auto-save. Clients can pause and come back." },
              { title: "Visual style capture", desc: "Built-in style selectors help clients show what they like — not just tell you." },
              { title: "Professional PDF briefs", desc: "Export clean, branded briefs you can reference throughout the project." },
              { title: "Your brand, your experience", desc: "Custom colors, logo, and business name on every client touchpoint." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="mt-1 h-2 w-2 rounded-full bg-stone-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-stone-900">{item.title}</h3>
                  <p className="text-stone-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-stone-200 bg-stone-900 py-20">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to streamline your briefs?
          </h2>
          <p className="mt-4 text-lg text-stone-400">
            Join designers who spend less time chasing details and more time creating.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild className="bg-white text-stone-900 hover:bg-stone-100 text-base px-8">
              <Link href="/signup">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-50">
        <div className="container py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-stone-900 text-white">
                <Sparkles className="h-3 w-3" />
              </div>
              <span className="font-display font-semibold text-stone-900">Briefed</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-stone-500">
              <Link href="/login" className="hover:text-stone-900 transition-colors">Log In</Link>
              <Link href="/signup" className="hover:text-stone-900 transition-colors">Sign Up</Link>
              <Link href="/privacy" className="hover:text-stone-900 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-stone-900 transition-colors">Terms</Link>
            </div>
            <p className="text-sm text-stone-400">&copy; {new Date().getFullYear()} Briefed</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
