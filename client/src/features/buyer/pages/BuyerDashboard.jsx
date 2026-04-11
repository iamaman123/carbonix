import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  Leaf,
  Sparkles,
  User,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { Link } from "react-router-dom";
import DynamicPriceDisplay from "@/components/DynamicPriceDisplay";
import MarketInsights from "@/components/MarketInsights";
import { API_BASE_URL } from "@/constants/api";

const BuyerDashboard = () => {
  const { user, token } = useAuth();
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/credits/payment-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        console.log("Posted Data", response.data.data?.transactions);

        const transactions = response.data.data?.transactions || [];
        if (Array.isArray(transactions)) {
          setRecentPurchases(transactions);

          // Calculate the total amount spent
          const total = transactions.reduce(
            (sum, transaction) => sum + (transaction.totalAmount || 0),
            0,
          );
          setTotalAmount(total);
        } else {
          console.error("Invalid data format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchListings();
  }, [token]);

  const overviewTotals = useMemo(() => {
    const orders = recentPurchases.length;
    const totalCredits = recentPurchases.reduce(
      (sum, tx) => sum + (Number(tx.quantity) || 0),
      0,
    );
    return {
      totalSpent: totalAmount || 0,
      totalCredits,
      totalOrders: orders,
    };
  }, [recentPurchases, totalAmount]);

  return (
    <div className="bg-background pt-24 lg:pt-28">
      <div className="border-b border-border bg-muted/40 dark:bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary shrink-0" />
            <div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                Buyer Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Monitor purchases, understand spend, and track your climate
                portfolio
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/market">Browse marketplace</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/buyer-analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <section className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-3">
              <Card className="border border-border/70 bg-card/90 p-6 shadow-xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" /> Total credits
                  purchased
                </div>
                <CardContent className="mt-4 p-0">
                  <NumberTicker
                    value={overviewTotals.totalCredits}
                    className="text-4xl font-semibold text-foreground"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Aggregated credits from verified projects
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-border/70 bg-card/90 p-6 shadow-xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-red-600 dark:text-red-400" /> Total
                  spend (₹)
                </div>
                <CardContent className="mt-4 p-0">
                  <NumberTicker
                    value={overviewTotals.totalSpent}
                    className="text-4xl font-semibold text-foreground"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Captures payments recorded through Carbonix
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-border/70 bg-card/90 p-6 shadow-xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Total orders
                </div>
                <CardContent className="mt-4 p-0">
                  <NumberTicker
                    value={overviewTotals.totalOrders}
                    className="text-4xl font-semibold text-foreground"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Includes pending fulfilments and settlements
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-border/70 bg-card/90 shadow-2xl">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-2xl font-semibold text-foreground">
                    Recent purchases
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Keep track of your latest transactions and associated spend.
                  </CardDescription>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-border/70 text-sm font-semibold"
                >
                  <Link to="/transaction-listing">See all</Link>
                </Button>
              </CardHeader>
              <CardContent className="overflow-hidden rounded-2xl border border-border/60">
                <Table>
                  <TableHeader className="bg-muted/60">
                    <TableRow>
                      <TableHead>Seller</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPurchases.length > 0 ? (
                      recentPurchases.slice(0, 5).map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="text-sm text-foreground">
                            {order.seller?.name || "Unknown"}
                          </TableCell>
                          <TableCell className="text-sm text-foreground">
                            {Number(order.quantity || 0).toLocaleString()}{" "}
                            credits
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-foreground">
                            ₹{Number(order.totalAmount || 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          No purchases recorded yet. Visit the marketplace to
                          get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <MarketInsights />
            
            <Card className="border border-border/70 bg-card/90 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Workspace tips
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Ways to keep your team aligned
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Share this dashboard with finance, sustainability, and
                  procurement leads so everyone tracks offsets and spend in real
                  time.
                </p>
                <p>
                  Use the transaction ledger export when reporting to auditors,
                  ESG stakeholders, or compliance bodies.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-primary/30 bg-primary/10 shadow-xl dark:border-brandSubColor/30 dark:bg-brandSubColor/10">
              <CardContent className="space-y-4 p-6 text-sm text-primary dark:text-primary-foreground/90">
                <p>
                  Ready to scale climate impact? Explore bundle purchases,
                  long-term offtakes, and curated portfolios tailored to your
                  industry.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-full border-primary/40 text-primary hover:bg-primary/10 dark:border-primary-foreground/30 dark:text-primary-foreground"
                >
                  <Link to="/contact">Talk to our team</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default BuyerDashboard;
