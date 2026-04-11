import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  ShoppingCart,
  ArrowLeftRight,
  Activity,
  Eye,
  History
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllListings, getPostedListings, getTransactionData } from "@/services/listingService";
import { toast } from "sonner";
import DynamicPriceDisplay from "@/components/DynamicPriceDisplay";
import MarketInsights from "@/components/MarketInsights";

const CombinedDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);
  const [marketplaceListings, setMarketplaceListings] = useState([]);
  const [sellerTransactions, setSellerTransactions] = useState([]);
  const [buyerTransactions, setBuyerTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalSpent: 0,
    energySold: 0,
    energyPurchased: 0,
    activeListings: 0,
    activePurchases: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [myListingsData, marketplaceData, transactionsData] = await Promise.all([
        getPostedListings(),
        getAllListings(),
        getTransactionData()
      ]);

      // Set my listings (seller data)
      const postedListings = myListingsData?.posted || [];
      setMyListings(postedListings);

      // Set marketplace listings (buyer data)
      const availableListings = (marketplaceData?.data || []).filter(
        listing => listing.status === 'Available'
      );
      setMarketplaceListings(availableListings);

      // Get seller and buyer transactions
      const sellerTxns = transactionsData?.data?.sellerTransactions || [];
      const buyerTxns = transactionsData?.data?.transactions || [];
      setSellerTransactions(sellerTxns);
      setBuyerTransactions(buyerTxns);

      // Calculate stats from real data
      const totalEarnings = sellerTxns.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
      const totalSpent = buyerTxns.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
      const energySold = sellerTxns.reduce((sum, t) => sum + (t.quantity || 0), 0);
      const energyPurchased = buyerTxns.reduce((sum, t) => sum + (t.quantity || 0), 0);

      setStats({
        totalEarnings,
        totalSpent,
        energySold,
        energyPurchased,
        activeListings: postedListings.filter(l => l.status === 'Available').length,
        activePurchases: availableListings.length
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

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

  const netBalance = stats.totalEarnings - stats.totalSpent;

  const statsCards = [
    {
      title: "Total Earnings",
      value: formatCurrency(stats.totalEarnings),
      description: "From selling energy",
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: "Total Spent",
      value: formatCurrency(stats.totalSpent),
      description: "On purchasing energy",
      icon: DollarSign,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20"
    },
    {
      title: "Net Balance",
      value: formatCurrency(netBalance),
      description: netBalance >= 0 ? "Profit" : "Loss",
      icon: ArrowLeftRight,
      color: netBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
      bgColor: netBalance >= 0 ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
    },
    {
      title: "Energy Balance",
      value: `${stats.energySold - stats.energyPurchased} credits`,
      description: stats.energySold > stats.energyPurchased ? "Surplus sold" : "Net consumed",
      icon: Zap,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
    }
  ];

  // Combine and sort all transactions
  const allTransactions = [
    ...sellerTransactions.map(t => ({
      ...t,
      type: 'Sale',
      party: t.buyer?.name || t.buyer?.email || 'Buyer',
      isPositive: true,
      amount: t.totalAmount
    })),
    ...buyerTransactions.map(t => ({
      ...t,
      type: 'Purchase',
      party: t.seller?.name || t.seller?.email || 'Seller',
      isPositive: false,
      amount: t.totalAmount
    }))
  ].sort((a, b) => new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-24 lg:pt-28">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                Combined Dashboard
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  <ArrowLeftRight className="mr-1 h-3 w-3" />
                  Producer + Consumer
                </Badge>
              </h1>
              <p className="mt-2 text-muted-foreground">
                Welcome back, {user?.name || user?.email}! Manage both your buying and selling activities.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate("/marketplace")}
                variant="outline"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buy Energy
              </Button>
              <Button 
                onClick={() => navigate("/form")}
                className="bg-brandMainColor hover:bg-brandMainColor/90 dark:bg-brandSubColor dark:hover:bg-brandSubColor/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Sell Energy
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="border-border/50">
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
                <Card key={stat.title} className="border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="sell" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="sell">
              <Zap className="mr-2 h-4 w-4" />
              Sell Energy
            </TabsTrigger>
            <TabsTrigger value="buy">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Buy Energy
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <Activity className="mr-2 h-4 w-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          {/* Sell Energy Tab */}
          <TabsContent value="sell" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    My Listings
                  </CardTitle>
                  <CardDescription>
                    Your active energy listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">Loading...</p>
                      </div>
                    ) : myListings.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No listings yet</p>
                      </div>
                    ) : (
                      <>
                        {myListings.slice(0, 3).map((listing) => (
                          <div
                            key={listing._id}
                            className="flex items-center justify-between p-3 border border-border rounded-lg"
                          >
                            <div>
                              <p className="font-semibold text-foreground">
                                {listing.quantity} {listing.unit || 'credits'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {listing.projectType || 'Energy'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-foreground">{formatCurrency(listing.price)}</p>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate("/listings")}
                        >
                          View All
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Selling Stats
                  </CardTitle>
                  <CardDescription>
                    Your selling performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active Listings</span>
                      <span className="font-bold text-foreground">{stats.activeListings}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Energy Sold</span>
                      <span className="font-bold text-foreground">{stats.energySold} credits</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Earnings</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(stats.totalEarnings)}
                      </span>
                    </div>
                    <Button 
                      className="w-full bg-brandMainColor hover:bg-brandMainColor/90 dark:bg-brandSubColor dark:hover:bg-brandSubColor/90"
                      onClick={() => navigate("/seller-analytics")}
                    >
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Buy Energy Tab */}
          <TabsContent value="buy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Available Energy
                </CardTitle>
                <CardDescription>
                  Browse energy listings from verified producers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading listings...</p>
                    </div>
                  ) : marketplaceListings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No listings available</p>
                    </div>
                  ) : (
                    <>
                      {marketplaceListings.slice(0, 3).map((listing) => (
                        <div
                          key={listing._id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {listing.projectType || 'Energy Listing'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {listing.quantity} credits
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <DynamicPriceDisplay
                                itemId={listing._id}
                                isProduct={false}
                                basePrice={listing.pricePerCredit}
                              />
                            </div>
                            <Button 
                              size="sm"
                              className="bg-brandMainColor hover:bg-brandMainColor/90 dark:bg-brandSubColor dark:hover:bg-brandSubColor/90"
                              onClick={() => navigate(`/marketplace/${listing._id}`)}
                            >
                              Buy
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate("/marketplace")}
                      >
                        Browse All Listings
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  All Transactions
                </CardTitle>
                <CardDescription>
                  Your complete transaction history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading transactions...</p>
                    </div>
                  ) : allTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No transactions yet</p>
                    </div>
                  ) : (
                    <>
                      {allTransactions.slice(0, 4).map((transaction) => (
                        <div
                          key={transaction._id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant="outline" 
                              className={transaction.type === "Sale" 
                                ? "text-green-600 border-green-600" 
                                : "text-blue-600 border-blue-600"
                              }
                            >
                              {transaction.type}
                            </Badge>
                            <div>
                              <p className="font-semibold text-foreground">{transaction.party}</p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.quantity} credits • {formatDate(transaction.purchaseDate || transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                          <p className={`font-bold ${
                            transaction.isPositive 
                              ? "text-green-600 dark:text-green-400" 
                              : "text-red-600 dark:text-red-400"
                          }`}>
                            {transaction.isPositive ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate("/transaction-listing")}
                      >
                        View All Transactions
                      </Button>
                    </>
                  )}
                </div>
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

export default CombinedDashboard;
