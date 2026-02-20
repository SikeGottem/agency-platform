import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Users 
} from "lucide-react";
import type { OverviewStats } from "@/lib/analytics";

interface OverviewStatsProps {
  stats: OverviewStats;
}

const statCards = [
  {
    title: "Total Projects",
    key: "totalProjects" as keyof OverviewStats,
    icon: FileText,
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "All projects created",
    suffix: undefined,
  },
  {
    title: "Completion Rate",
    key: "completionRate" as keyof OverviewStats,
    icon: CheckCircle2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Sent projects completed",
    suffix: "%",
  },
  {
    title: "Avg. Time to Complete",
    key: "avgTimeToComplete" as keyof OverviewStats,
    icon: Clock,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "From sent to completion",
    suffix: undefined,
  },
  {
    title: "Active Clients",
    key: "activeClients" as keyof OverviewStats,
    icon: Users,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    description: "Currently working with you",
    suffix: undefined,
  },
] as const;

export function OverviewStats({ stats }: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key];
        const displayValue = typeof value === "number" && card.suffix 
          ? `${value}${card.suffix}` 
          : value;

        return (
          <Card key={card.key} className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl ${card.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {displayValue}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}