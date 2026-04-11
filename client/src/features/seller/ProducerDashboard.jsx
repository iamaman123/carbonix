import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  DollarSign, 
  TrendingUp, 
  Grid, 
  Plus, 
  Activity,
  MessageCircle,
  Zap,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPostedListings, getTransactionData } from "@/services/listingService";
import { toast } from "sonner";
import DynamicPriceDisplay from "@/components/DynamicPriceDisplay";
import MarketInsights from "@/components/MarketInsights";
import LiveChatPanel from "@/components/common/LiveChatPanel";

const ProducerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeListings: 0,
    creditsSold: 0,
    totalTransactions: 0
  });
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch posted listings and transactions in parallel
      const [listingsResponse, transactionsResponse] = await Promise.all([
        getPostedListings(),
        getTransactionData()
      ]);

      const userListings = listingsResponse.posted || [];
      const sellerTransactions = transactionsResponse.data?.sellerTransactions || [];

      setListings(userListings);
      setTransactions(sellerTransactions);

      // Calculate stats from real data
      const totalEarnings = sellerTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
      const creditsSold = sellerTransactions.reduce((sum, t) => sum + (t.quantity || 0), 0);
      const activeListings = userListings.filter(l => l.status === "Available").length;

      setStats({
        totalEarnings,
        activeListings,
        creditsSold,
        totalTransactions: sellerTransactions.length
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Earnings",
      value: `₹${stats.totalEarnings.toFixed(2)}`,
      description: "From completed sales",
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: "Active Listings",
      value: stats.activeListings,
      description: "Currently available",
      icon: Grid,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Credits Sold",
      value: `${stats.creditsSold} credits`,
      description: "Total carbon credits sold",
      icon: Leaf,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
    },
    {
      title: "Transactions",
      value: stats.totalTransactions,
      description: "Total completed",
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    }
  ];

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-brandMainColor/5 to-emerald-500/5 dark:via-brandSubColor/5 dark:to-lime-400/5 pt-24 lg:pt-28 relative">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 relative z-10">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-card/60 backdrop-blur-xl border border-border/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              Producer Dashboard
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Welcome back, <span className="text-brandMainColor dark:text-brandSubColor">{user?.name || user?.email}</span>! Manage your carbon credit listings and track your earnings.
            </p>
          </div>
          <Button 
            onClick={() => navigate("/form")}
            className="h-11 rounded-xl bg-brandMainColor px-6 text-sm font-semibold shadow-md hover:bg-brandMainColor/90 hover:shadow-lg transition-all dark:bg-brandSubColor dark:text-slate-950 dark:hover:bg-brandSubColor/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 mb-10 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="border-border/30 bg-card/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                  <div className="h-8 w-8 bg-muted animate-pulse rounded-lg"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-20 bg-muted animate-pulse rounded mb-2"></div>
                  <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="group overflow-hidden border border-border/30 bg-card/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 rounded-2xl relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                    <Icon className={`h-24 w-24 ${stat.color.split(' ')[0]}`} />
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
                    <p className="text-xs font-medium text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full max-w-sm grid-cols-3">
            <TabsTrigger value="listings">
              <Grid className="mr-2 h-4 w-4" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <Activity className="mr-2 h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageCircle className="mr-2 h-4 w-4" />
              Live Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4 mt-6">
            <Card className="border border-border/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Grid className="w-64 h-64 text-brandMainColor dark:text-brandSubColor" />
              </div>
              <CardHeader className="border-b border-border/20 bg-muted/10 pb-6 px-8 rounded-t-3xl relative z-10">
                <CardTitle className="text-2xl font-extrabold flex items-center gap-3">
                  <Grid className="w-7 h-7 text-brandMainColor dark:text-brandSubColor" />
                  Active Listings
                </CardTitle>
                <CardDescription className="text-sm mt-1 text-muted-foreground">
                  Your currently available carbon credit listings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 relative z-10">
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brandMainColor border-t-transparent mx-auto mb-4"></div>
                      <p className="text-muted-foreground font-medium">Loading your listings...</p>
                    </div>
                  ) : listings.length === 0 ? (
                    <div className="text-center py-16 bg-background/40 rounded-3xl border border-dashed border-border/60 backdrop-blur-sm">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Grid className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                      <p className="text-xl font-bold text-foreground mb-2">No listings yet</p>
                      <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">Create your first carbon credit listing and start earning from your verified green energy projects.</p>
                      <Button onClick={() => navigate("/form")} className="h-12 px-8 rounded-xl bg-brandMainColor hover:bg-brandMainColor/90 font-bold shadow-lg transition-all dark:bg-brandSubColor dark:text-slate-950 dark:hover:bg-brandSubColor/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Listing
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {listings.slice(0, 3).map((listing) => (
                        <div
                          key={listing._id}
                          className="group relative flex flex-col justify-between p-6 border border-border/40 bg-gradient-to-br from-background/80 to-background/40 rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-brandMainColor/30 transition-all duration-300 overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-brandMainColor/5 dark:bg-brandSubColor/5 rounded-bl-[120px] -z-10 group-hover:scale-110 group-hover:bg-brandMainColor/10 transition-transform duration-500"></div>
                          
                          <div className="flex flex-col gap-3 mb-6 z-10">
                            <div className="flex items-center justify-between">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-bold text-muted-foreground backdrop-blur-sm shadow-sm">
                                <Zap className="w-3.5 h-3.5" /> {listing.projectType || "Carbon Credit"}
                              </div>
                              <Badge
                                variant="outline"
                                className={`capitalize font-bold border-2 rounded-xl py-1 px-3 ${
                                  listing.status === "Available"
                                    ? "text-green-600 border-green-600/30 bg-green-500/10 dark:text-green-400"
                                    : "text-muted-foreground border-border"
                                }`}
                              >
                                {listing.status}
                              </Badge>
                            </div>
                            <h4
                              className="text-xl font-extrabold text-foreground"
                              title={listing.title || `${listing.quantity} ${listing.unit || 'kWh'}`}
                            >
                              {listing.title || `${listing.quantity} ${listing.unit || 'kWh'}`}
                            </h4>
                            {listing.location && (
                              <p className="text-xs font-medium text-muted-foreground">{listing.location}</p>
                            )}
                          </div>
                          
                          <div className="flex items-end justify-between z-10 mt-2 bg-card/40 p-4 rounded-2xl border border-border/30 backdrop-blur-md">
                            <div>
                              <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Credits</p>
                              <div className="flex items-center gap-1.5 font-black text-xl text-green-600 dark:text-green-400">
                                <Leaf className="w-5 h-5" /> {listing.quantity} <span className="text-sm text-muted-foreground font-semibold">credits</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Price</p>
                              <DynamicPriceDisplay
                                itemId={listing._id}
                                isProduct={false}
                                basePrice={listing.pricePerCredit}
                              />
                            </div>
                          </div>

                        </div>
                      ))}
                      
                      <div className="md:col-span-2 xl:col-span-3 pt-6">
                        <Button 
                          variant="outline" 
                          className="w-full h-14 rounded-2xl border-border/50 bg-background/50 text-sm font-bold hover:bg-muted/80 hover:text-foreground transition-all flex items-center justify-center gap-2 shadow-sm"
                          onClick={() => navigate("/listings")}
                        >
                          View All Listings
                          <Search className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 mt-6">
            <Card className="border border-border/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Activity className="w-64 h-64 text-brandMainColor dark:text-brandSubColor" />
              </div>
              <CardHeader className="border-b border-border/20 bg-muted/10 pb-6 px-8 rounded-t-3xl relative z-10">
                <CardTitle className="text-2xl font-extrabold flex items-center gap-3">
                  <Activity className="w-7 h-7 text-brandMainColor dark:text-brandSubColor" />
                  Recent Transactions
                </CardTitle>
                <CardDescription className="text-sm mt-1 text-muted-foreground">
                  Your latest carbon credit sales
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 relative z-10">
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brandMainColor border-t-transparent mx-auto mb-4"></div>
                      <p className="text-muted-foreground font-medium">Loading your transactions...</p>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-16 bg-background/40 rounded-3xl border border-dashed border-border/60 backdrop-blur-sm">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Activity className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                      <p className="text-xl font-bold text-foreground mb-2">No transactions yet</p>
                      <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">Once buyers purchase your carbon credits, your transaction history will appear here.</p>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {transactions.slice(0, 3).map((transaction) => (
                        <div
                          key={transaction._id}
                          className="group relative flex flex-col justify-between p-6 border border-border/40 bg-gradient-to-br from-background/80 to-background/40 rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-brandMainColor/30 transition-all duration-300 overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-brandMainColor/5 dark:bg-brandSubColor/5 rounded-bl-[120px] -z-10 group-hover:scale-110 group-hover:bg-brandMainColor/10 transition-transform duration-500"></div>
                          
                          <div className="flex flex-col gap-3 mb-6 z-10">
                            <div className="flex items-center justify-between">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-bold text-muted-foreground backdrop-blur-sm shadow-sm">
                                <Activity className="w-3.5 h-3.5" /> {formatDate(transaction.purchaseDate || transaction.createdAt)}
                              </div>
                              <Badge variant="outline" className={`capitalize font-bold border-2 rounded-xl py-1 px-3 ${transaction.paymentStatus === 'completed' ? 'text-green-600 border-green-600/30 bg-green-500/10 dark:text-green-400' : 'text-amber-600 border-amber-600/30 bg-amber-500/10 dark:text-amber-400'}`}>
                                {transaction.paymentStatus || 'completed'}
                              </Badge>
                            </div>
                            <h4 className="text-xl font-extrabold text-foreground">
                              {transaction.buyer?.name || transaction.buyer?.email || 'Anonymous Buyer'}
                            </h4>
                          </div>
                          
                          <div className="flex items-end justify-between z-10 mt-2 bg-card/40 p-4 rounded-2xl border border-border/30 backdrop-blur-md">
                            <div>
                              <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Credits</p>
                              <div className="flex items-center gap-1.5 font-black text-xl text-green-600 dark:text-green-400">
                                <Leaf className="w-5 h-5" /> {transaction.quantity} <span className="text-sm text-muted-foreground font-semibold">credits</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Earned</p>
                              <p className="font-extrabold text-2xl text-foreground">
                                {formatCurrency(transaction.totalAmount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="md:col-span-2 xl:col-span-3 pt-6">
                        <Button 
                          variant="outline" 
                          className="w-full h-14 rounded-2xl border-border/50 bg-background/50 text-sm font-bold hover:bg-muted/80 hover:text-foreground transition-all flex items-center justify-center gap-2 shadow-sm"
                          onClick={() => navigate("/transaction-listing")}
                        >
                          View All Transactions
                          <Search className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4 mt-6">
            <Card className="border border-border/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <MessageCircle className="w-64 h-64 text-brandMainColor dark:text-brandSubColor" />
              </div>
              <CardHeader className="border-b border-border/20 bg-muted/10 pb-6 px-8 rounded-t-3xl relative z-10">
                <CardTitle className="text-2xl font-extrabold flex items-center gap-3">
                  <MessageCircle className="w-7 h-7 text-brandMainColor dark:text-brandSubColor" />
                  Buyer Messages
                </CardTitle>
                <CardDescription className="text-sm mt-1 text-muted-foreground">
                  Respond quickly to consumer inquiries and close deals faster.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 relative z-10 bg-background/20">
                <LiveChatPanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Market Insights Section */}
        <div className="mt-10">
          <MarketInsights />
        </div>
      </div>
    </div>
  );
};

export default ProducerDashboard;
