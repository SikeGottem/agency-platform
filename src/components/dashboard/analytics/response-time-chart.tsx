import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import type { ResponseTimeData } from "@/lib/analytics";

interface ResponseTimeChartProps {
  data: ResponseTimeData[];
}

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

export function ResponseTimeChart({ data }: ResponseTimeChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Response Time Trends
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Average client response time over the last 6 months
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No completed projects yet</p>
              <p className="text-sm">Send some briefs to see response trends!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxHours = Math.max(...data.map(d => d.avgHours));
  const minHours = Math.min(...data.map(d => d.avgHours));
  
  // Calculate trend
  const isImproving = data.length >= 2 && data[data.length - 1].avgHours < data[0].avgHours;
  const latestValue = data[data.length - 1]?.avgHours || 0;
  const previousValue = data[data.length - 2]?.avgHours || latestValue;
  const trendPercentage = previousValue > 0 
    ? Math.abs(Math.round(((latestValue - previousValue) / previousValue) * 100))
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Response Time Trends
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Average client response time over the last 6 months
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="space-y-4">
          {data.map((point, index) => {
            const heightPercentage = maxHours > 0 ? (point.avgHours / maxHours) * 100 : 0;
            const isLatest = index === data.length - 1;
            
            return (
              <div key={point.period} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={isLatest ? "font-semibold" : "text-muted-foreground"}>
                    {point.period}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={isLatest ? "font-bold" : "font-medium"}>
                      {formatHours(point.avgHours)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({point.count} projects)
                    </span>
                  </div>
                </div>
                
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ease-out ${
                      isLatest 
                        ? "bg-gradient-to-r from-blue-500 to-blue-600" 
                        : "bg-blue-500/70"
                    }`}
                    style={{ width: `${Math.max(heightPercentage, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Trend indicator */}
        {data.length >= 2 && (
          <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              {isImproving ? (
                <TrendingDown className="h-5 w-5 text-emerald-500" />
              ) : (
                <TrendingUp className="h-5 w-5 text-amber-500" />
              )}
              <div className="text-center">
                <p className="text-sm font-medium">
                  {isImproving ? "Response time improved" : "Response time increased"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {trendPercentage}% vs. previous month
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick insights */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600">
              {formatHours(minHours)}
            </p>
            <p className="text-xs text-muted-foreground">Fastest Month</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">
              {formatHours(maxHours)}
            </p>
            <p className="text-xs text-muted-foreground">Slowest Month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}