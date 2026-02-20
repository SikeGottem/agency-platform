import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Eye, PlayCircle, CheckCircle2 } from "lucide-react";
import type { FunnelData } from "@/lib/analytics";

interface ProjectFunnelProps {
  data: FunnelData;
}

const funnelSteps = [
  {
    key: "sent" as keyof FunnelData,
    label: "Sent",
    icon: Send,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    textColor: "text-blue-700",
    description: "Projects sent to clients",
  },
  {
    key: "opened" as keyof FunnelData,
    label: "Opened", 
    icon: Eye,
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    textColor: "text-amber-700",
    description: "Clients viewed the brief",
  },
  {
    key: "started" as keyof FunnelData,
    label: "Started",
    icon: PlayCircle,
    color: "bg-violet-500", 
    lightColor: "bg-violet-50",
    textColor: "text-violet-700",
    description: "Clients began filling out",
  },
  {
    key: "completed" as keyof FunnelData,
    label: "Completed",
    icon: CheckCircle2,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50", 
    textColor: "text-emerald-700",
    description: "Fully completed briefs",
  },
] as const;

export function ProjectFunnel({ data }: ProjectFunnelProps) {
  // Calculate the max value for scaling
  const maxValue = Math.max(data.sent, data.opened, data.started, data.completed, 1);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gradient-to-br from-blue-500 to-emerald-500 rounded" />
          Project Funnel
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track how clients progress through your brief process
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {funnelSteps.map((step, index) => {
          const Icon = step.icon;
          const value = data[step.key];
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          // Calculate conversion rate from previous step
          let conversionRate = 0;
          if (index > 0) {
            const prevStep = funnelSteps[index - 1];
            const prevValue = data[prevStep.key];
            conversionRate = prevValue > 0 ? Math.round((value / prevValue) * 100) : 0;
          }
          
          return (
            <div key={step.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 ${step.lightColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${step.textColor}`} />
                  </div>
                  <div>
                    <p className="font-medium">{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold">{value}</p>
                  {index > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {conversionRate}% convert
                    </p>
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${step.color} transition-all duration-700 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              {/* Connector line */}
              {index < funnelSteps.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="h-6 w-px bg-border" />
                </div>
              )}
            </div>
          );
        })}
        
        {/* Summary stats */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">
                {data.sent > 0 ? Math.round((data.opened / data.sent) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Open Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">
                {data.sent > 0 ? Math.round((data.completed / data.sent) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Completion Rate</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}