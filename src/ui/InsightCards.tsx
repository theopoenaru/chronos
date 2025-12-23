import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Layers, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

type InsightCard = {
  title: string;
  subtitle: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
};

type InsightCardsProps = {
  insights: InsightCard[];
  onPromptClick?: (prompt: string) => void;
};

const INSIGHT_ICONS = [Clock, TrendingUp, Layers, RotateCw];
const INSIGHT_ICONS_BG = [
  "bg-blue-50",
  "bg-sky-50",
  "bg-cyan-50",
  "bg-indigo-50",
];

const INSIGHT_PROMPTS: Record<string, string> = {
  "Meeting Hours": "What meetings do I have this week?",
  "Focus Time": "When do I have focus time available?",
  "Categories": "What types of meetings do I have?",
  "Recurring": "Show me my recurring meetings",
};

export function InsightCards({ insights, onPromptClick }: InsightCardsProps) {
  const handleCardClick = (insight: InsightCard) => {
    const prompt = INSIGHT_PROMPTS[insight.title] || `Tell me about ${insight.title.toLowerCase()}`;
    onPromptClick?.(prompt);
  };

  return (
    <div className="flex gap-4 pl-4 py-4">
      {insights.map((insight, idx) => {
        const Icon = INSIGHT_ICONS[idx % INSIGHT_ICONS.length];
        const iconBg = INSIGHT_ICONS_BG[idx % INSIGHT_ICONS_BG.length];
        const hasPrompt = INSIGHT_PROMPTS[insight.title] !== undefined;
        
        return (
          <Card
            key={idx}
            className={cn(
              "chronos-card min-w-[180px] flex-shrink-0",
              onPromptClick && hasPrompt && "cursor-pointer hover:border-primary/50 transition-colors"
            )}
            onClick={() => onPromptClick && hasPrompt && handleCardClick(insight)}
          >
            <CardHeader className="pb-2 space-y-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                    {insight.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {insight.subtitle}
                  </p>
                </div>
                <div className={`p-1.5 rounded ${iconBg}`}>
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-2xl font-semibold tracking-tight text-foreground">
                {insight.value}
              </div>
              {insight.change && (
                <p
                  className={`text-xs mt-1 font-medium ${
                    insight.changeType === "positive"
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {insight.change}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
      <div className="flex-shrink-0 w-1" aria-hidden="true" />
    </div>
  );
}

