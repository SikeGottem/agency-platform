import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function GET() {
  const mem = process.memoryUsage();

  let lastCommit: string | null = null;
  try {
    lastCommit = execSync('git log -1 --format="%H %s"', { encoding: "utf-8" }).trim();
  } catch {
    lastCommit = null;
  }

  return NextResponse.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    memory: {
      rss: +(mem.rss / 1024 / 1024).toFixed(2),
      heapUsed: +(mem.heapUsed / 1024 / 1024).toFixed(2),
      heapTotal: +(mem.heapTotal / 1024 / 1024).toFixed(2),
    },
    lastCommit,
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
  });
}
