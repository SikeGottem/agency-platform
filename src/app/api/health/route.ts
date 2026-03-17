import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const startTime = Date.now();

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};
  let healthy = true;

  // Database check
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const t0 = Date.now();
    const { error } = await supabase.from('_health_check').select('*').limit(1).maybeSingle();
    const latencyMs = Date.now() - t0;

    // Table may not exist — that's fine, we just care that the DB responded
    if (error && !error.message.includes('does not exist') && !error.code?.startsWith('42')) {
      throw error;
    }
    checks.database = { status: 'healthy', latencyMs };
  } catch (err: unknown) {
    healthy = false;
    checks.database = {
      status: 'unhealthy',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }

  // Environment check
  const requiredEnv = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const missingEnv = requiredEnv.filter((k) => !process.env[k]);
  if (missingEnv.length > 0) {
    healthy = false;
    checks.environment = { status: 'unhealthy', error: `Missing: ${missingEnv.join(', ')}` };
  } else {
    checks.environment = { status: 'healthy' };
  }

  const body = {
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };

  return NextResponse.json(body, { status: healthy ? 200 : 503 });
}
