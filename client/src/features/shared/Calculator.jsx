import { useState, useEffect } from "react";
import { 
  Zap, TrendingUp, TrendingDown, Activity, RefreshCw, 
  Car, Plane, Bus, Train, Flame, Battery, Leaf, 
  Calculator as CalcIcon, Factory, Fuel
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMarketInsights } from "@/hooks/useDynamicPricing";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const emissionFactors = {
  electricity: 0.5, // kg CO2/kWh
  naturalGas: 2.03, // kg CO2/m3
  coal: 2.86, // kg CO2/kg
  flight: 0.15, // kg CO2/passenger-km
  bus: 0.1, // kg CO2/passenger-km
  train: 0.05, // kg CO2/passenger-km
  diesel: 2.68, // kg CO2/liter
  petrol: 2.31, // kg CO2/liter
};

const categoryMap = {
  electricity: "energy",
  naturalGas: "energy",
  coal: "energy",
  flight: "mobility",
  bus: "mobility",
  train: "mobility",
  diesel: "fuel",
  petrol: "fuel"
};

const iconMap = {
  electricity: <Zap className="w-5 h-5 text-yellow-500" />,
  naturalGas: <Flame className="w-5 h-5 text-orange-500" />,
  coal: <Factory className="w-5 h-5 text-slate-700 dark:text-slate-400" />,
  flight: <Plane className="w-5 h-5 text-sky-500" />,
  bus: <Bus className="w-5 h-5 text-emerald-500" />,
  train: <Train className="w-5 h-5 text-indigo-500" />,
  diesel: <Fuel className="w-5 h-5 text-red-500" />,
  petrol: <Car className="w-5 h-5 text-rose-500" />
};

const unitOptions = {
  electricity: ["kWh", "MWh"],
  naturalGas: ["m3", "cubic feet"],
  coal: ["kg", "tons"],
  flight: ["passenger-km", "miles"],
  bus: ["passenger-km", "miles"],
  train: ["passenger-km", "miles"],
  diesel: ["liters", "gallons"],
  petrol: ["liters", "gallons"],
};

const CarbonEmissionCalculator = () => {
  const { insights, loading: insightsLoading, refreshInsights } = useMarketInsights(true);
  
  const [activities, setActivities] = useState(
    Object.keys(emissionFactors).reduce((acc, type) => {
      acc[type] = { amount: "", unit: unitOptions[type][0] };
      return acc;
    }, {})
  );

  const [totalEmissions, setTotalEmissions] = useState(0);
  const [requiredCredits, setRequiredCredits] = useState(0);
  const [useMarketPrice, setUseMarketPrice] = useState(true);
  const [customCreditCost, setCustomCreditCost] = useState(10);
  const [categoryEmissions, setCategoryEmissions] = useState({ energy: 0, mobility: 0, fuel: 0 });

  // Calculate market average price from insights
  const marketAveragePrice = insights?.averagePrice || 10;
  const creditCost = useMarketPrice ? marketAveragePrice : customCreditCost;

  // Update custom price when market price changes (first time)
  useEffect(() => {
    if (insights?.averagePrice && customCreditCost === 10) {
      setCustomCreditCost(insights.averagePrice);
    }
  }, [insights?.averagePrice]);

  // Real-time calculation UX: as soon as they type, footprint updates
  useEffect(() => {
    let total = 0;
    let catTotals = { energy: 0, mobility: 0, fuel: 0 };
    
    Object.entries(activities).forEach(([type, data]) => {
      const amount = parseFloat(data.amount) || 0;
      const em = amount * (emissionFactors[type] || 0);
      total += em;
      if(categoryMap[type]) catTotals[categoryMap[type]] += em;
    });

    const totalEmissionsTons = total / 1000;
    setTotalEmissions(totalEmissionsTons);
    setRequiredCredits(Math.ceil(totalEmissionsTons));
    setCategoryEmissions({
      energy: catTotals.energy / 1000,
      mobility: catTotals.mobility / 1000,
      fuel: catTotals.fuel / 1000
    });
  }, [activities]);

  const handleActivityChange = (type, field, value) => {
    setActivities(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
  };

  const clearForm = () => {
    setActivities(Object.keys(emissionFactors).reduce((acc, type) => {
      acc[type] = { amount: "", unit: unitOptions[type][0] };
      return acc;
    }, {}));
  };

  const renderActivityInputGroup = (typesArray) => {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {typesArray.map((type) => (
          <div
            key={type}
            className={`flex flex-col justify-between rounded-xl border border-border/40 p-4 transition-all duration-300 ${
              activities[type].amount ? 'bg-primary/5 border-primary/30 shadow-sm' : 'bg-background/50 hover:bg-muted/50 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-background shadow-sm border border-border/50 flex items-center justify-center">
                {iconMap[type]}
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-foreground capitalize">
                  {type.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Input
                  type="number"
                  min="0"
                  className="h-9 bg-background border-border/60 text-sm font-medium focus-visible:ring-brandMainColor/50 focus-visible:border-brandMainColor"
                  value={activities[type].amount}
                  onChange={(e) => handleActivityChange(type, "amount", e.target.value)}
                  placeholder={`Enter usage`}
                />
              </div>
              <Select
                value={activities[type].unit}
                onValueChange={(value) => handleActivityChange(type, "unit", value)}
              >
                <SelectTrigger className="h-9 border-border/60 bg-background/80 font-medium text-sm">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions[type].map((unit) => (
                    <SelectItem key={unit} value={unit} className="text-sm font-medium">
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-16 pt-24 lg:pt-28">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-brandMainColor/10 dark:bg-brandSubColor/5 border-b border-border/40">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:16px_16px]" />
        <div className="mx-auto max-w-6xl px-6 py-8 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brandMainColor text-white dark:bg-brandSubColor dark:text-slate-900 shadow-lg shadow-brandMainColor/20 mb-4">
            <CalcIcon className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">
            Carbon Footprint <span className="text-brandMainColor dark:text-brandSubColor">Calculator</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-xl">
            Live translation of your energy, mobility, and fuel usage into actionable offset requirements using real-time market data.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          
          {/* Main Calculator Area */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <Card className="border border-border/50 bg-card/60 backdrop-blur-xl shadow-sm rounded-2xl overflow-hidden">
              <div className="border-b border-border/30 bg-muted/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    Emission Sources
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Enter values across different categories to see your footprint.</p>
                </div>
                <Button variant="outline" size="sm" onClick={clearForm} className="h-8 rounded-full shrink-0 text-xs font-semibold border-border/50">
                  <RefreshCw className="w-3 h-3 mr-1.5" />
                  Reset
                </Button>
              </div>
              
              <div className="p-5">
                <Tabs defaultValue="energy" className="w-full">
                  <TabsList className="w-full sm:w-auto grid grid-cols-3 h-11 rounded-xl bg-muted/50 p-1 mb-6">
                    <TabsTrigger value="energy" className="rounded-lg font-bold text-[13px] h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <Zap className="w-3.5 h-3.5 mr-1.5 text-yellow-500" />
                      Energy
                    </TabsTrigger>
                    <TabsTrigger value="mobility" className="rounded-lg font-bold text-[13px] h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <Plane className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
                      Mobility
                    </TabsTrigger>
                    <TabsTrigger value="fuel" className="rounded-lg font-bold text-[13px] h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <Fuel className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                      Fuel
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="energy" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {renderActivityInputGroup(["electricity", "naturalGas", "coal"])}
                  </TabsContent>
                  <TabsContent value="mobility" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {renderActivityInputGroup(["flight", "bus", "train"])}
                  </TabsContent>
                  <TabsContent value="fuel" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {renderActivityInputGroup(["petrol", "diesel"])}
                  </TabsContent>
                </Tabs>
              </div>
            </Card>

            {/* Price configuration */}
            <Card className="border border-border/50 bg-card/60 backdrop-blur-xl shadow-sm rounded-2xl overflow-hidden">
              <div className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Market Pricing</h3>
                    <p className="text-xs text-muted-foreground">Toggle between automated live pricing or a custom rate.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-xl border border-border/50 mt-3 sm:mt-0">
                    <Label htmlFor="pricing-mode" className="text-xs font-bold cursor-pointer ml-2">Live Market Data</Label>
                    <Switch id="pricing-mode" checked={useMarketPrice} onCheckedChange={setUseMarketPrice} className="data-[state=checked]:bg-brandMainColor scale-90" />
                  </div>
                </div>

                {useMarketPrice ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex gap-3 items-center w-full md:w-auto">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Token Rate</p>
                          <Badge variant="outline" className="bg-emerald-500 text-white border-transparent text-[9px] py-0 px-1.5 h-4">LIVE</Badge>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          {insightsLoading ? (
                            <div className="h-6 w-20 bg-muted animate-pulse rounded"></div>
                          ) : (
                            <span className="text-xl font-black text-foreground">₹{marketAveragePrice.toFixed(2)}</span>
                          )}
                          <span className="text-xs font-semibold text-muted-foreground">/ credit</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex gap-3 text-xs font-medium">
                      {!insightsLoading && insights?.averagePriceChange !== undefined && (
                        <div className={`flex items-center px-3 py-1.5 rounded-lg border ${insights.averagePriceChange > 0 ? "bg-red-500/10 border-red-500/20 text-red-600" : "bg-green-500/10 border-green-500/20 text-green-600"}`}>
                          {insights.averagePriceChange > 0 ? <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-1.5" />}
                          {insights.averagePriceChange > 0 ? "+" : "-"}₹{Math.abs(insights.averagePriceChange).toFixed(2)}
                        </div>
                      )}
                      <Button variant="outline" size="icon" onClick={refreshInsights} disabled={insightsLoading} className="rounded-lg h-8 w-8 shrink-0">
                        <RefreshCw className={`w-3.5 h-3.5 ${insightsLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border/60 bg-background/50 p-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="w-full flex-1">
                      <Label htmlFor="custom-cost" className="text-xs font-bold mb-1.5 block">Custom Value per Credit (₹)</Label>
                      <Input
                        id="custom-cost"
                        type="number"
                        min="1"
                        className="h-10 text-sm font-bold focus-visible:ring-brandMainColor/50 border-border/60"
                        value={customCreditCost}
                        onChange={(e) => setCustomCreditCost(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="hidden md:block w-px h-8 bg-border"></div>
                    <p className="text-xs text-muted-foreground md:max-w-[200px] leading-relaxed">
                      Manually defined credit cost. Turn on Live Market Data for real-time averages.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sticky Results Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-5">
            <Card className="border-0 bg-slate-900 text-slate-50 shadow-xl rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Leaf className="w-24 h-24" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-brandMainColor/20 via-transparent to-transparent opacity-50 z-0"></div>
              
              <CardHeader className="relative z-10 pb-2 px-5 pt-5">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  Live Snapshot
                  {totalEmissions > 0 && (
                    <span className="flex h-2.5 w-2.5 relative ml-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs mt-0.5">
                  Real-time carbon liability overview
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4 px-5 pb-5 pt-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Carbon Footprint</p>
                  <p className="text-4xl font-black text-white tracking-tighter shadow-sm flex items-end gap-1.5">
                    {totalEmissions.toFixed(2)}
                    <span className="text-lg text-slate-400 font-bold mb-1">tCO₂e</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-sm flex flex-col justify-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Required Credits</p>
                    <p className="text-2xl font-black text-emerald-400">{requiredCredits}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-sm flex flex-col justify-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Est. Liability</p>
                    <p className="text-xl font-black text-white">₹{Math.ceil(requiredCredits * creditCost).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Breakdown Progress Bars if there are emissions */}
                {totalEmissions > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Category Breakdown</p>
                    
                    {categoryEmissions.energy > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-300 font-semibold">
                          <span>Energy</span>
                          <span>{((categoryEmissions.energy / totalEmissions) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 rounded-full" style={{width: `${(categoryEmissions.energy / totalEmissions) * 100}%`}}></div>
                        </div>
                      </div>
                    )}
                    
                    {categoryEmissions.mobility > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-300 font-semibold">
                          <span>Mobility</span>
                          <span>{((categoryEmissions.mobility / totalEmissions) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-sky-500 rounded-full" style={{width: `${(categoryEmissions.mobility / totalEmissions) * 100}%`}}></div>
                        </div>
                      </div>
                    )}
                    
                    {categoryEmissions.fuel > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-300 font-semibold">
                          <span>Fuel</span>
                          <span>{((categoryEmissions.fuel / totalEmissions) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{width: `${(categoryEmissions.fuel / totalEmissions) * 100}%`}}></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-brandMainColor/40 bg-card/60 backdrop-blur-xl p-0.5 shadow-sm dark:border-brandSubColor/40 rounded-2xl overflow-hidden group">
              <div className="bg-gradient-to-br from-brandMainColor/10 to-transparent p-5 rounded-[14px] h-full transition-colors group-hover:from-brandMainColor/15">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2 mb-1.5">
                  <Leaf className="w-4 h-4 text-brandMainColor dark:text-brandSubColor" />
                  Take Environmental Action
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed text-muted-foreground mb-4 font-medium">
                  Translate your calculated liability directly into verified carbon credits through our peer-to-peer marketplace.
                </CardDescription>
                
                {totalEmissions > 0 ? (
                   <Link
                    to={`/marketplace?required=${requiredCredits}`}
                    className="w-full flex items-center justify-center rounded-lg bg-brandMainColor h-10 text-sm font-bold text-white shadow-md shadow-brandMainColor/20 hover:bg-brandMainColor/90 transition-all"
                  >
                    Procure {requiredCredits} Credits
                  </Link>
                ) : (
                  <Link
                    to="/marketplace"
                    className="w-full flex items-center justify-center rounded-lg bg-background border border-border/50 h-10 text-sm font-bold text-foreground shadow-sm hover:bg-muted transition-all"
                  >
                    Browse Marketplace
                  </Link>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonEmissionCalculator;
