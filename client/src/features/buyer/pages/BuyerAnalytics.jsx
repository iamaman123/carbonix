import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NumberTicker } from "@/components/magicui/number-ticker";
import {
  Leaf,
  TrendingUp,
  Package,
  Calendar,
  Download,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BuyerAnalytics = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://carbonix-me-1.vercel.app/api";

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/buyer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(response.data.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-blue-50 dark:bg-blue-950/30">
          <div className="mx-auto max-w-7xl px-8 py-4">
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="mx-auto max-w-7xl p-8 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { summary, monthlySpending, creditsByType, recentTransactions } =
    analytics;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-blue-50 dark:bg-blue-950/30">
        <div className="mx-auto max-w-7xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary shrink-0" />
            <div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                Buyer Analytics
              </h1>
              <p className="text-xs text-muted-foreground">
                Track your carbon offset impact
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-7xl p-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border border-border/60 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <Leaf className="h-4 w-4" />
                Carbon Offset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NumberTicker
                value={summary.carbonOffsetTons}
                className="text-3xl font-bold text-emerald-600 dark:text-emerald-400"
              />
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                Tons CO₂ offset
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NumberTicker
                value={summary.totalSpent}
                className="text-3xl font-bold"
                prefix="₹"
                decimalPlaces={0}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                All-time spending
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Package className="h-4 w-4" />
                Credits Purchased
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NumberTicker
                value={summary.totalCreditsPurchased}
                className="text-3xl font-bold"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Total credits
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NumberTicker
                value={summary.totalTransactions}
                className="text-3xl font-bold"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Purchases made
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Spending Chart */}
        <Card className="border border-border/60 bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Spending (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlySpending.map((month, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium">
                    {getMonthName(month._id.month)} {month._id.year}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{
                          width: `${Math.min(
                            (month.spending /
                              Math.max(
                                ...monthlySpending.map((m) => m.spending),
                              )) *
                              100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-32 text-right text-sm font-semibold">
                    ₹{month.spending.toLocaleString()}
                  </div>
                  <div className="w-24 text-right text-xs text-muted-foreground">
                    {month.credits} credits
                  </div>
                </div>
              ))}
              {monthlySpending.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No purchase history yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Credits by Type */}
          <Card className="border border-border/60 bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Credits by Project Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creditsByType.map((type, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium capitalize">
                        {type._id || "General"}
                      </div>
                      <div className="text-sm font-semibold">
                        {type.credits} credits
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                        style={{
                          width: `${Math.min(
                            (type.credits /
                              Math.max(
                                ...creditsByType.map((t) => t.credits),
                              )) *
                              100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ₹{type.spent.toLocaleString()} spent
                    </div>
                  </div>
                ))}
                {creditsByType.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No purchases yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border border-border/60 bg-card shadow-lg">
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.slice(0, 5).map((txn) => (
                  <div
                    key={txn._id}
                    className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {txn.listing?.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(txn.purchaseDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        ₹{txn.totalAmount.toLocaleString()}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {txn.quantity} credits
                      </Badge>
                    </div>
                  </div>
                ))}
                {recentTransactions.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    No transactions yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BuyerAnalytics;
