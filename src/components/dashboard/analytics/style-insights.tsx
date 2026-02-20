import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, TrendingUp, Crown } from "lucide-react";
import type { StyleInsight } from "@/lib/analytics";

interface StyleInsightsProps {
  data: StyleInsight[];
}

// Style option display configurations
const styleConfig = {
  minimalist: { 
    label: "Minimalist", 
    emoji: "⚪", 
    description: "Clean, simple designs" 
  },
  bold: { 
    label: "Bold", 
    emoji: "🔥", 
    description: "Strong, impactful visuals" 
  },
  playful: { 
    label: "Playful", 
    emoji: "🎨", 
    description: "Fun, creative approaches" 
  },
  elegant: { 
    label: "Elegant", 
    emoji: "✨", 
    description: "Sophisticated, refined" 
  },
  vintage: { 
    label: "Vintage", 
    emoji: "📻", 
    description: "Classic, retro aesthetics" 
  },
  modern: { 
    label: "Modern", 
    emoji: "🚀", 
    description: "Contemporary, cutting-edge" 
  },
  organic: { 
    label: "Organic", 
    emoji: "🌿", 
    description: "Natural, flowing forms" 
  },
  geometric: { 
    label: "Geometric", 
    emoji: "🔷", 
    description: "Structured, pattern-based" 
  },
} as const;

const colorScale = [
  "bg-gradient-to-r from-emerald-500 to-emerald-600",
  "bg-gradient-to-r from-blue-500 to-blue-600", 
  "bg-gradient-to-r from-violet-500 to-violet-600",
  "bg-gradient-to-r from-amber-500 to-amber-600",
  "bg-gradient-to-r from-rose-500 to-rose-600",
  "bg-gradient-to-r from-cyan-500 to-cyan-600",
  "bg-gradient-to-r from-orange-500 to-orange-600",
  "bg-gradient-to-r from-pink-500 to-pink-600",
];

export function StyleInsights({ data }: StyleInsightsProps) {
  if (data.length === 0 || data[0]?.totalResponses === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-500" />
            Style Insights
            <div className="ml-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
              PRO
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your clients' collective style preferences — the data advantage
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <div className="text-center">
              <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No style data yet</p>
              <p className="text-sm">Complete some briefs to unlock style insights!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topStyle = data[0];
  const totalResponses = topStyle?.totalResponses || 0;
  const maxPercentage = Math.max(...data.map(d => d.percentage));

  return (
    <Card className="relative overflow-hidden">
      {/* Premium badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <Crown className="h-3 w-3" />
          PRO
        </div>
      </div>

      <CardHeader>
        <CardTitle className="flex items-center gap-2 pr-16">
          <Palette className="h-5 w-5 text-purple-500" />
          Style Insights
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your clients' collective style preferences — the data advantage
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Top insight callout */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 rounded-lg border border-purple-200/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">{styleConfig[topStyle.style].emoji}</div>
            <div>
              <p className="font-semibold text-purple-900 dark:text-purple-100">
                {styleConfig[topStyle.style].label} is your clients' top choice
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {topStyle.percentage}% of clients prefer this style
              </p>
            </div>
          </div>
        </div>

        {/* Style breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Style Preferences</span>
            <span className="text-muted-foreground">
              Based on {totalResponses} client briefs
            </span>
          </div>

          {data.map((insight, index) => {
            const config = styleConfig[insight.style];
            const widthPercentage = maxPercentage > 0 ? (insight.percentage / maxPercentage) * 100 : 0;
            
            return (
              <div key={insight.style} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{config.emoji}</span>
                    <span className="font-medium">{config.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {config.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{insight.percentage}%</span>
                    <span className="text-muted-foreground text-xs">
                      ({insight.count})
                    </span>
                  </div>
                </div>
                
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ease-out ${colorScale[index % colorScale.length]}`}
                    style={{ width: `${Math.max(widthPercentage, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Actionable insights */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Actionable Insights
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {topStyle.percentage >= 40 && (
              <li>• <strong>{styleConfig[topStyle.style].label}</strong> dominates your client base — consider specializing your portfolio</li>
            )}
            {data.filter(d => d.percentage >= 20).length >= 3 && (
              <li>• You attract diverse style preferences — showcase versatility in your marketing</li>
            )}
            {data.some(d => d.style === "minimalist" && d.percentage >= 30) && (
              <li>• High minimalist preference suggests corporate/professional client focus</li>
            )}
            {totalResponses >= 10 && (
              <li>• Sample size of {totalResponses} briefs provides reliable trend data for client targeting</li>
            )}
          </ul>
        </div>

        {/* Data source note */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-dashed">
          Data aggregated from the adaptive style selector across all completed briefs
        </div>
      </CardContent>
    </Card>
  );
}