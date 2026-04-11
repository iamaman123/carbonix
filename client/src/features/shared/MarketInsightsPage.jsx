import MarketInsights from "@/components/MarketInsights";
import { Activity } from "lucide-react";

const MarketInsightsPage = () => {
  return (
    <div className="min-h-screen bg-background pt-24 lg:pt-28">
      <div className="border-b border-border/50 bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Market Insights</h1>
              <p className="text-xs text-muted-foreground">
                Real-time carbon credit market trends and pricing intelligence
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <MarketInsights />
      </main>
    </div>
  );
};

export default MarketInsightsPage;
