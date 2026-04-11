import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, Leaf, History, Download, ShoppingCart, Search, DollarSign, TrendingUp, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";

const TransactionListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [buyerTransactions, setBuyerTransactions] = useState([]);
  const [sellerTransactions, setSellerTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const userRole = user?.role;
  const isBuyer = userRole === "CONSUMER" || userRole === "BOTH";
  const isSeller = userRole === "PRODUCER" || userRole === "BOTH";

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await api.get("/credits/payment-data");
        const data = res.data.data;

        // Buyer transactions (purchases)
        const purchases = (data?.transactions || [])
          .filter((t) => t.paymentStatus === "completed")
          .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
        setBuyerTransactions(purchases);

        // Seller transactions (sales)
        const sales = (data?.sellerTransactions || [])
          .filter((t) => t.paymentStatus === "completed")
          .sort((a, b) => new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt));
        setSellerTransactions(sales);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const buyerTotals = useMemo(() =>
    buyerTransactions.reduce(
      (acc, tx) => ({
        totalCredits: acc.totalCredits + (Number(tx.quantity) || 0),
        totalSpent: acc.totalSpent + (Number(tx.totalAmount) || 0),
      }),
      { totalCredits: 0, totalSpent: 0 }
    ), [buyerTransactions]
  );

  const sellerTotals = useMemo(() =>
    sellerTransactions.reduce(
      (acc, tx) => ({
        totalCredits: acc.totalCredits + (Number(tx.quantity) || 0),
        totalEarned: acc.totalEarned + (Number(tx.totalAmount) || 0),
      }),
      { totalCredits: 0, totalEarned: 0 }
    ), [sellerTransactions]
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    return date.toLocaleDateString("en-IN");
  };

  const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

  // Determine default tab
  const defaultTab = isBuyer ? "purchases" : "sales";

  // Stats for purchases
  const purchaseStats = [
    {
      title: "Credits Purchased",
      value: buyerTotals.totalCredits.toLocaleString(),
      description: "Across all completed transactions",
      icon: Leaf,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Total Spent",
      value: formatCurrency(buyerTotals.totalSpent),
      description: "In INR, excluding fees",
      icon: ArrowUpRight,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      title: "Total Orders",
      value: buyerTransactions.length.toLocaleString(),
      description: "Completed purchases",
      icon: ShoppingCart,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
  ];

  // Stats for sales
  const salesStats = [
    {
      title: "Credits Sold",
      value: sellerTotals.totalCredits.toLocaleString(),
      description: "Across all completed sales",
      icon: Leaf,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      title: "Total Earned",
      value: formatCurrency(sellerTotals.totalEarned),
      description: "Revenue from sales",
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Total Sales",
      value: sellerTransactions.length.toLocaleString(),
      description: "Completed sales",
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
  ];

  const StatsGrid = ({ stats }) => (
    <div className="grid gap-6 mb-10 md:grid-cols-3">
      {loading
        ? Array(3).fill(0).map((_, i) => (
            <Card key={i} className="border-border/30 bg-card/60 backdrop-blur-xl rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))
        : stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="group overflow-hidden border border-border/30 bg-card/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 rounded-2xl relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                  <Icon className={`h-24 w-24 ${stat.color.split(" ")[0]}`} />
                </div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-xl ${stat.bgColor} shadow-sm`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-extrabold text-foreground tracking-tight">{stat.value}</div>
                  <p className="text-xs font-medium text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
    </div>
  );

  const TransactionCard = ({ tx, type }) => {
    const isPurchase = type === "purchase";
    return (
      <div
        className="group relative flex flex-col justify-between p-6 border border-border/40 bg-gradient-to-br from-background/80 to-background/40 rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-brandMainColor/30 transition-all duration-300 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brandMainColor/5 dark:bg-brandSubColor/5 rounded-bl-[120px] -z-10 group-hover:scale-110 group-hover:bg-brandMainColor/10 transition-transform duration-500" />

        {/* Top row: date + status */}
        <div className="flex justify-between items-start mb-4 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-bold text-muted-foreground backdrop-blur-sm shadow-sm">
            <History className="w-3.5 h-3.5" />
            {formatDate(tx.purchaseDate || tx.createdAt)}
          </div>
          <Badge
            variant="outline"
            className="capitalize font-bold border-2 rounded-xl py-1 px-3 text-green-600 border-green-600/30 bg-green-500/10 dark:text-green-400"
          >
            Completed
          </Badge>
        </div>

        {/* Title / Counterparty */}
        <h4 className="text-lg font-extrabold text-foreground line-clamp-2 mb-1 z-10">
          {tx.listing?.title || "Carbon Credit"}
        </h4>
        <p className="text-xs font-medium text-muted-foreground mb-4 z-10">
          {isPurchase
            ? `Seller: ${tx.seller?.name || tx.seller?.email || "Unknown"}`
            : `Buyer: ${tx.buyer?.name || tx.buyer?.email || "Unknown"}`
          }
        </p>

        {/* Credits + Amount */}
        <div className="flex items-end justify-between z-10 bg-card/40 p-4 rounded-2xl border border-border/30 backdrop-blur-md mb-4">
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Credits</p>
            <div className="flex items-center gap-1.5 font-black text-xl text-green-600 dark:text-green-400">
              <Leaf className="w-5 h-5" />
              {Number(tx.quantity).toLocaleString()}
              <span className="text-sm text-muted-foreground font-semibold">credits</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
              {isPurchase ? "Total Paid" : "Earned"}
            </p>
            <p className="font-extrabold text-2xl text-foreground">
              {formatCurrency(tx.totalAmount)}
            </p>
          </div>
        </div>

        {/* Receipt button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-xl border-border/50 font-semibold hover:bg-muted/80 transition-all"
          onClick={() => navigate(`/receipt/${tx._id}`)}
        >
          <Download className="mr-2 h-4 w-4" />
          View Receipt
        </Button>
      </div>
    );
  };

  const TransactionGrid = ({ transactions, type, emptyMessage }) => (
    <>
      {loading ? (
        <div className="text-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brandMainColor border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16 bg-background/40 rounded-3xl border border-dashed border-border/60 backdrop-blur-sm">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <p className="text-xl font-bold text-foreground mb-2">No transactions yet</p>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
            {emptyMessage}
          </p>
          {type === "purchase" && (
            <Button
              asChild
              className="h-12 px-8 rounded-xl bg-brandMainColor hover:bg-brandMainColor/90 font-bold shadow-lg transition-all dark:bg-brandSubColor dark:text-slate-950 dark:hover:bg-brandSubColor/90"
            >
              <Link to="/market">Browse Marketplace</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {transactions.map((tx) => (
            <TransactionCard key={tx._id} tx={tx} type={type} />
          ))}
        </div>
      )}
    </>
  );

  // If user is only a buyer or only a seller, show a single view without tabs
  const showTabs = isBuyer && isSeller;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-brandMainColor/5 to-emerald-500/5 dark:via-brandSubColor/5 dark:to-lime-400/5 pt-24 lg:pt-28 relative">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:20px_20px]" />

      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 relative z-10">

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-card/60 backdrop-blur-xl border border-border/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Transaction History
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Every carbon credit transaction, audit-ready and in one place.
            </p>
          </div>
          {isBuyer && (
            <Button
              asChild
              className="h-11 rounded-xl bg-brandMainColor px-6 text-sm font-semibold shadow-md hover:bg-brandMainColor/90 hover:shadow-lg transition-all dark:bg-brandSubColor dark:text-slate-950 dark:hover:bg-brandSubColor/90"
            >
              <Link to="/market">
                <Search className="mr-2 h-4 w-4" />
                Browse Marketplace
              </Link>
            </Button>
          )}
        </div>

        {showTabs ? (
          /* Tabbed view for users with BOTH roles */
          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="grid w-full max-w-sm grid-cols-2">
              <TabsTrigger value="purchases">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Purchases
              </TabsTrigger>
              <TabsTrigger value="sales">
                <ArrowDownLeft className="mr-2 h-4 w-4" />
                Sales
              </TabsTrigger>
            </TabsList>

            <TabsContent value="purchases" className="space-y-6 mt-6">
              <StatsGrid stats={purchaseStats} />
              <Card className="border border-border/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <History className="w-64 h-64 text-brandMainColor dark:text-brandSubColor" />
                </div>
                <CardHeader className="border-b border-border/20 bg-muted/10 pb-6 px-8 rounded-t-3xl relative z-10">
                  <CardTitle className="text-2xl font-extrabold flex items-center gap-3">
                    <ArrowUpRight className="w-7 h-7 text-brandMainColor dark:text-brandSubColor" />
                    Purchase Ledger
                  </CardTitle>
                  <CardDescription className="text-sm mt-1 text-muted-foreground">
                    Your carbon credit purchases, latest first
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 relative z-10">
                  <TransactionGrid
                    transactions={buyerTransactions}
                    type="purchase"
                    emptyMessage="Visit the marketplace to make your first carbon credit purchase."
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales" className="space-y-6 mt-6">
              <StatsGrid stats={salesStats} />
              <Card className="border border-border/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <History className="w-64 h-64 text-brandMainColor dark:text-brandSubColor" />
                </div>
                <CardHeader className="border-b border-border/20 bg-muted/10 pb-6 px-8 rounded-t-3xl relative z-10">
                  <CardTitle className="text-2xl font-extrabold flex items-center gap-3">
                    <ArrowDownLeft className="w-7 h-7 text-brandMainColor dark:text-brandSubColor" />
                    Sales Ledger
                  </CardTitle>
                  <CardDescription className="text-sm mt-1 text-muted-foreground">
                    Your carbon credit sales, latest first
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 relative z-10">
                  <TransactionGrid
                    transactions={sellerTransactions}
                    type="sale"
                    emptyMessage="Once buyers purchase your carbon credits, your sales history will appear here."
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          /* Single view for single-role users */
          <>
            <StatsGrid stats={isBuyer ? purchaseStats : salesStats} />
            <Card className="border border-border/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <History className="w-64 h-64 text-brandMainColor dark:text-brandSubColor" />
              </div>
              <CardHeader className="border-b border-border/20 bg-muted/10 pb-6 px-8 rounded-t-3xl relative z-10">
                <CardTitle className="text-2xl font-extrabold flex items-center gap-3">
                  <History className="w-7 h-7 text-brandMainColor dark:text-brandSubColor" />
                  {isBuyer ? "Purchase Ledger" : "Sales Ledger"}
                </CardTitle>
                <CardDescription className="text-sm mt-1 text-muted-foreground">
                  {isBuyer
                    ? "Your carbon credit purchases, latest first"
                    : "Your carbon credit sales, latest first"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 relative z-10">
                <TransactionGrid
                  transactions={isBuyer ? buyerTransactions : sellerTransactions}
                  type={isBuyer ? "purchase" : "sale"}
                  emptyMessage={
                    isBuyer
                      ? "Visit the marketplace to make your first carbon credit purchase."
                      : "Once buyers purchase your carbon credits, your sales history will appear here."
                  }
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionListing;
