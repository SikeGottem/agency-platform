"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Users, DollarSign, Activity } from "lucide-react";

interface ClientSummary {
  email: string;
  name: string;
  totalProjects: number;
  totalRevenueCents: number;
  lastProjectDate: string;
  avgHealthScore: number | null;
}

export function ClientsListView({ clients }: { clients: ClientSummary[] }) {
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.email.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
    );
  });

  function healthColor(score: number | null) {
    if (score === null) return "secondary";
    if (score >= 80) return "default";
    if (score >= 50) return "secondary";
    return "destructive";
  }

  function formatCurrency(cents: number) {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No clients found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((client) => (
            <Link
              key={client.email}
              href={`/dashboard/clients/${encodeURIComponent(client.email)}`}
            >
              <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {client.name || client.email}
                    </p>
                    {client.name && (
                      <p className="text-sm text-muted-foreground truncate">
                        {client.email}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1" title="Projects">
                      <Users className="h-3.5 w-3.5" />
                      {client.totalProjects}
                    </span>

                    {client.totalRevenueCents > 0 && (
                      <span className="flex items-center gap-1" title="Revenue">
                        <DollarSign className="h-3.5 w-3.5" />
                        {formatCurrency(client.totalRevenueCents)}
                      </span>
                    )}

                    {client.avgHealthScore !== null && (
                      <Badge variant={healthColor(client.avgHealthScore)}>
                        <Activity className="h-3 w-3 mr-1" />
                        {client.avgHealthScore}
                      </Badge>
                    )}

                    <span className="text-xs hidden sm:inline">
                      {new Date(client.lastProjectDate).toLocaleDateString(
                        "en-AU",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
