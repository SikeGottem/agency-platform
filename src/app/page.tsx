import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Sparkles, Palette, Compass, Zap } from 'lucide-react';

export default async function LandingPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  const features = [
    {
      icon: Compass,
      title: 'Discover',
      description: 'Explore an infinite canvas of curated design inspiration.',
    },
    {
      icon: Palette,
      title: 'Design DNA',
      description: 'AI learns your unique aesthetic taste over time.',
    },
    {
      icon: Zap,
      title: 'Instant Boards',
      description: 'Drag, arrange, and share moodboards effortlessly.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          <span className="text-lg font-semibold">Briefed</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            Your design taste,{' '}
            <span className="text-accent">understood.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-lg mx-auto">
            AI-powered moodboards that learn your aesthetic. Discover, curate,
            and share visual inspiration like never before.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg">Start for free</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">Log in</Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mt-24 mb-16">
          {features.map((feature) => (
            <div key={feature.title} className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-muted">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-text-tertiary border-t border-border">
        © 2026 Briefed. Built with taste.
      </footer>
    </div>
  );
}
