import { useMarketInsights } from "@/hooks/useDynamicPricing";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, ThermometerSun } from "lucide-react";

const MarketInsights = () => {
  const { insights, loading } = useMarketInsights(true);

  if (loading || !insights) {
    return (
      <Card className="border border-border/50 bg-card rounded-xl">
        <div className="p-6 space-y-4">
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-muted/50" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const avgPriceChange = insights.averagePriceChange || 0;
  const avgDemandScore = Number((insights.averageDemandScore || 0).toFixed(0));
  const avgSupplyScore = Number((insights.averageSupplyScore || 0).toFixed(0));
  const tempDistribution = insights.temperatureDistribution || {};
  const isPriceUp = avgPriceChange >= 0;

  const tempStyles = {
    cold:     { bar: "bg-blue-400",    text: "text-blue-500" },
    cool:     { bar: "bg-cyan-400",    text: "text-cyan-500" },
    moderate: { bar: "bg-emerald-400", text: "text-emerald-500" },
    warm:     { bar: "bg-orange-400",  text: "text-orange-500" },
    hot:      { bar: "bg-red-400",     text: "text-red-500" },
  };

  const totalListings = Object.values(tempDistribution).reduce((a, b) => a + b, 0);

  return (
    <Card className="border border-border/50 bg-card rounded-xl shadow-sm">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold text-foreground">Market Intelligence</CardTitle>
        </div>
        <CardDescription className="text-sm">Real-time carbon credit market overview</CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Price movement */}
          <div className="rounded-xl border border-border/40 bg-muted/20 p-5">
            <p className="text-sm text-muted-foreground mb-3">Avg Price Movement</p>
            <div className="flex items-center gap-2">
              {isPriceUp
                ? <TrendingUp className="h-5 w-5 text-green-500" />
                : <TrendingDown className="h-5 w-5 text-red-500" />}
              <span className={`text-2xl font-bold ${isPriceUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {isPriceUp ? "+" : "-"}₹{Math.abs(avgPriceChange).toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Prices {isPriceUp ? "rising" : "falling"} across listings
            </p>
          </div>

          {/* Demand */}
          <div className="rounded-xl border border-border/40 bg-muted/20 p-5">
            <p className="text-sm text-muted-foreground mb-3">Demand Score</p>
            <p className="text-2xl font-bold text-foreground">{avgDemandScore}<span className="text-base font-normal text-muted-foreground">/100</span></p>
            <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-blue-400" style={{ width: `${avgDemandScore}%` }} />
            </div>
          </div>

          {/* Supply */}
          <div className="rounded-xl border border-border/40 bg-muted/20 p-5">
            <p className="text-sm text-muted-foreground mb-3">Supply Score</p>
            <p className="text-2xl font-bold text-foreground">{avgSupplyScore}<span className="text-base font-normal text-muted-foreground">/100</span></p>
            <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-purple-400" style={{ width: `${avgSupplyScore}%` }} />
            </div>
          </div>
        </div>

        {/* Temperature + Multiplier */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Network temperature */}
          <div className="rounded-xl border border-border/40 bg-muted/20 p-5">
            <div className="flex items-center gap-2 mb-5">
              <ThermometerSun className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Network Temperature</p>
            </div>
            <div className="space-y-3">
              {Object.entries(tempDistribution).map(([temp, count]) => {
                const style = tempStyles[temp] || tempStyles.moderate;
                const pct = totalListings > 0 ? ((count / totalListings) * 100).toFixed(0) : 0;
                return (
                  <div key={temp} className="flex items-center gap-3">
                    <span className="w-20 text-sm capitalize text-muted-foreground">{temp}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`w-12 text-right text-sm font-medium ${style.text}`}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multiplier range */}
          {insights.priceMultiplierRange && (
            <div className="rounded-xl border border-border/40 bg-muted/20 p-5">
              <p className="text-sm font-semibold text-foreground mb-5">Price Multiplier Range</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Highest</span>
                  <span className="text-lg font-semibold text-red-500">{insights.priceMultiplierRange.max.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average</span>
                  <span className="text-lg font-semibold text-foreground">{insights.priceMultiplierRange.avg.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Lowest</span>
                  <span className="text-lg font-semibold text-green-500">{insights.priceMultiplierRange.min.toFixed(2)}x</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketInsights;
