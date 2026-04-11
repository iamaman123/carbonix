import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NumberTicker } from "@/components/magicui/number-ticker";
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Calendar,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SellerAnalytics = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "carbonix-me-1.vercel.app/api";

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/seller`, {
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

  const { summary, monthlyRevenue, topBuyers, recentTransactions } = analytics;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-blue-50 dark:bg-blue-950/30">
        <div className="mx-auto max-w-7xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary shrink-0" />
            <div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                Seller Analytics
              </h1>
              <p className="text-xs text-muted-foreground">
                Track your sales performance and revenue
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
          <Card className="border border-border/60 bg-card shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NumberTicker
                value={summary.totalRevenue}
                className="text-3xl font-bold"
                prefix="₹"
                decimalPlaces={0}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                All-time earnings
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Package className="h-4 w-4" />
                Credits Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NumberTicker
                value={summary.totalCreditsSold}
                className="text-3xl font-bold"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Total credits sold
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
                Completed sales
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Package className="h-4 w-4" />
                Active Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NumberTicker
                value={summary.activeListings}
                className="text-3xl font-bold"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Available for sale
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Revenue Chart */}
        <Card className="border border-border/60 bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Revenue (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyRevenue.map((month, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium">
                    {getMonthName(month._id.month)} {month._id.year}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-to-r from-brandMainColor to-emerald-500"
                        style={{
                          width: `${Math.min(
                            (month.revenue /
                              Math.max(
                                ...monthlyRevenue.map((m) => m.revenue),
                              )) *
                              100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-32 text-right text-sm font-semibold">
                    ₹{month.revenue.toLocaleString()}
                  </div>
                  <div className="w-24 text-right text-xs text-muted-foreground">
                    {month.credits} credits
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Buyers */}
          <Card className="border border-border/60 bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Buyers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topBuyers.map((buyer, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {buyer.name || buyer.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {buyer.transactionCount} transactions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ₹{buyer.totalSpent.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
                {topBuyers.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    No buyers yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border border-border/60 bg-card shadow-lg">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
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

export default SellerAnalytics;
