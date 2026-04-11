import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpRight,
  CheckCircle,
  Loader2,
  PackageCheck,
  TrendingUp,
  User,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import DynamicPriceDisplay from "@/components/DynamicPriceDisplay";

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return `₹${amount.toLocaleString('en-IN')}`;
};

const SellerDashboard = () => {
  const { user, token } = useAuth();
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        return;
      }
      setIsLoading(true);
      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "https://carbonix-me-1.vercel.app/api";

        // Fetch transactions
        const transactionsResponse = await axios.get(
          `${API_BASE_URL}/credits/payment-data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (Array.isArray(transactionsResponse.data.data?.sellerTransactions)) {
          setRecentPurchases(transactionsResponse.data.data.sellerTransactions);
        } else {
          setRecentPurchases([]);
        }

        // Fetch listings
        const listingsResponse = await axios.get(
          `${API_BASE_URL}/credits/posted-data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (Array.isArray(listingsResponse.data?.posted)) {
          setListings(listingsResponse.data.posted);
        } else {
          setListings([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setRecentPurchases([]);
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const metrics = useMemo(() => {
    const totalRevenue = recentPurchases.reduce(
      (sum, transaction) => sum + (Number(transaction.totalAmount) || 0),
      0,
    );
    const totalCreditsSold = recentPurchases.reduce(
      (sum, transaction) => sum + (Number(transaction.quantity) || 0),
      0,
    );
    const totalOrders = recentPurchases.length;
    const avgDealSize = totalOrders ? totalRevenue / totalOrders : 0;
    const pendingOrders = recentPurchases.filter((transaction) => {
      const status = (transaction.paymentStatus || "").toLowerCase();
      return status === "pending";
    }).length;
    const activeListings = listings.filter(
      (listing) => listing.status === "Available",
    ).length;
    const totalListings = listings.length;

    return {
      totalRevenue,
      totalCreditsSold,
      totalOrders,
      avgDealSize,
      pendingOrders,
      activeListings,
      totalListings,
    };
  }, [recentPurchases, listings]);

  const overviewCards = [
    {
      title: "Revenue",
      value: metrics.totalRevenue,
      icon: <TrendingUp className="h-4 w-4 text-primary" />,
      isCurrency: true,
      description: "Total earnings from completed sales",
    },
    {
      title: "Active Listings",
      value: metrics.activeListings,
      icon: <PackageCheck className="h-4 w-4 text-primary" />,
      description: `${metrics.totalListings} total listings created`,
    },
    {
      title: "Credits sold",
      value: metrics.totalCreditsSold,
      icon: <CheckCircle className="h-4 w-4 text-primary" />,
      description: "Volume moved across all transactions",
    },
    {
      title: "Orders",
      value: metrics.totalOrders,
      icon: <User className="h-4 w-4 text-primary" />,
      description: "Fulfilled and in-progress deals",
    },
  ];

  const statsCards = overviewCards;

  return (
    <div className="flex min-h-screen flex-col bg-background pt-24 lg:pt-28">
      <div className="border-b border-border bg-muted/40 dark:bg-muted/20">
        <div className="mx-auto max-w-6xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary shrink-0" />
            <div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                Sales performance dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Track revenue, credits sold, and buyer trends for your carbon
                offset portfolio
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/seller-analytics">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </Link>
          </Button>
        </div>
      </div>

      <section className="mt-10 px-8">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((card, index) => (
            <Card
              key={index}
              className="border border-border/70 bg-card/90 shadow-xl"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <h3 className="text-2xl font-bold text-foreground">
                      {card.isCurrency
                        ? `₹${card.value.toLocaleString()}`
                        : card.value.toLocaleString()}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    {card.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10 px-8 pb-10">
        <Card className="border border-border/70 bg-card/90 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">
                  Your Listings
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your carbon credit listings
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/listings">
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : listings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.slice(0, 5).map((listing) => (
                    <TableRow key={listing._id}>
                      <TableCell className="font-medium">
                        {listing.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{listing.projectType}</Badge>
                      </TableCell>
                      <TableCell>
                        {Number(listing.quantity || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <DynamicPriceDisplay
                          itemId={listing._id}
                          isProduct={false}
                          basePrice={listing.pricePerCredit}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            listing.status === "Available"
                              ? "default"
                              : listing.status === "Sold"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {listing.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No listings yet. Create your first listing to get started.
                </p>
                <Button asChild className="mt-4" variant="outline">
                  <Link to="/form">Create Listing</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default SellerDashboard;
