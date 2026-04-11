import { useDynamicPricing } from "@/hooks/useDynamicPricing";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Zap, Clock } from "lucide-react";

const temperatureConfig = {
  cold:     { bg: "bg-blue-100 dark:bg-blue-900/30",   text: "text-blue-700 dark:text-blue-300" },
  cool:     { bg: "bg-cyan-100 dark:bg-cyan-900/30",   text: "text-cyan-700 dark:text-cyan-300" },
  moderate: { bg: "bg-muted",                           text: "text-muted-foreground" },
  warm:     { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  hot:      { bg: "bg-red-100 dark:bg-red-900/30",     text: "text-red-700 dark:text-red-300" },
};

const DynamicPriceDisplay = ({ itemId, isProduct = false, basePrice }) => {
  const { pricing, loading, error, isDiscounted, getDiscountPercentage } =
    useDynamicPricing(itemId, isProduct);

  if (loading) {
    return (
      <div className="space-y-2 w-full">
        <div className="h-7 bg-muted rounded-lg animate-pulse w-24" />
        <div className="h-4 bg-muted rounded animate-pulse w-16" />
        <div className="h-4 bg-muted rounded animate-pulse w-20" />
      </div>
    );
  }

  if (error || !pricing) {
    return (
      <div className="text-right">
        <p className="text-xs text-muted-foreground mb-0.5">Base Price</p>
        <p className="text-lg font-bold text-foreground">₹{basePrice?.toLocaleString() ?? "—"}</p>
      </div>
    );
  }

  const discountPercent = getDiscountPercentage();
  const recommendedPrice = pricing?.recommendedPrice ?? basePrice;
  const marketTemp = pricing?.currentMarketTemperature ?? "moderate";
  const demandScore = pricing?.demandScore ?? 0;
  const supplyScore = pricing?.supplyScore ?? 0;
  const tempStyle = temperatureConfig[marketTemp] ?? temperatureConfig.moderate;

  return (
    <div className="space-y-2.5 w-full text-right">
      {/* Price */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
          AI-Recommended Price
        </p>
        <div className="flex items-center justify-end gap-2">
          <p className="text-xl font-bold text-primary">
            ₹{recommendedPrice.toLocaleString()}
          </p>
          {isDiscounted() && (
            <Badge className="bg-green-600 hover:bg-green-700 text-white text-[10px] px-1.5 py-0 h-5">
              <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
              -{discountPercent}%
            </Badge>
          )}
        </div>
        {basePrice && basePrice !== recommendedPrice && (
          <p className="text-xs text-muted-foreground line-through">
            ₹{basePrice.toLocaleString()}
          </p>
        )}
      </div>

      {/* Market temperature */}
      <div className="flex items-center justify-end gap-1.5">
        <span className="text-[10px] text-muted-foreground">Market:</span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${tempStyle.bg} ${tempStyle.text}`}
        >
          <Zap className="w-2.5 h-2.5" />
          {marketTemp}
        </span>
      </div>


      {/* Last updated */}
      {pricing.lastUpdatedAt && (
        <p className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          <Clock className="w-2.5 h-2.5" />
          Updated {new Date(pricing.lastUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </div>
  );
};

export default DynamicPriceDisplay;
