import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import PaymentSuccessDialog from "@/components/common/PaymentSuccessDialog";
import {
  Search,
  Leaf,
  ShoppingCart,
  Star,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  IndianRupee,
  RefreshCw,
  X,
  CreditCard,
  Wind,
  Info,
  Car,
  Lightbulb,
  TreePine,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import {
  getEcoProducts,
  createCheckoutSession,
  getMyEcoOrders,
} from "@/services/ecoProductService";
import { ECO_PRODUCT_CATEGORIES } from "@/constants/api";
import api from "@/lib/api";
import { loadRazorpayScript } from "@/lib/loadRazorpay";

const parseTags = (tags) => {
  if (!tags) return [];
  const tagsArray = Array.isArray(tags) ? tags : [tags];
  return tagsArray
    .flatMap((t) => (typeof t === "string" ? t.split(",").map((s) => s.trim()) : []))
    .filter(Boolean);
};

// Translate grams CO₂ prevented into relatable real-world equivalents
const getImpactEquivalents = (grams) => {
  if (!grams || grams <= 0) return null;
  const kg = grams / 1000;

  // Driving: ~4 km per kg → convert to meters (× 1000)
  const meters = Math.round(kg * 4 * 1000);

  // LED bulb: ~1.2 hrs per kg → convert to minutes (× 60)
  const minutes = Math.round(kg * 1.2 * 60);

  // Tree absorption: ~21 kg/year → convert fraction to hours (× 365 × 24)
  const treeHours = Math.round((kg / 21) * 365 * 24);

  return [
    {
      Icon: Car,
      iconColor: "text-sky-500",
      label: `${meters.toLocaleString()} m`,
      detail: "driving avoided",
    },
    {
      Icon: Lightbulb,
      iconColor: "text-amber-500",
      label: `${minutes} min`,
      detail: "LED energy saved",
    },
    {
      Icon: TreePine,
      iconColor: "text-emerald-500",
      label: `${treeHours} hrs`,
      detail: "tree absorption",
    },
  ];
};

const EcoMarketplace = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Purchase dialog
  const [purchaseProduct, setPurchaseProduct] = useState(null);
  const [purchaseQty, setPurchaseQty] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [purchasing, setPurchasing] = useState(false);

  // Orders dialog
  const [showOrders, setShowOrders] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Payment success dialog
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successOrderDetails, setSuccessOrderDetails] = useState(null);
  // Impact info dialog
  const [impactProduct, setImpactProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search, category, sortOrder]);

  // Check for payment success on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const orderId = urlParams.get("orderId");

    if (success === "true" && orderId) {
      // Fetch order details
      fetchOrderDetails(orderId);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchOrderDetails = async (orderId) => {
    const maxAttempts = 12;
    let attempts = 0;

    const check = async () => {
      try {
        const { data } = await api.get(`/eco-products/order/${orderId}`);
        const order = data.data;

        if (order?.paymentStatus === "completed") {
          setSuccessOrderDetails({
            orderHash: order.orderHash,
            productName: order.product?.name,
            quantity: order.quantity,
            totalAmount: order.totalAmount,
          });
          setShowSuccessDialog(true);
          fetchProducts();
          return;
        }
      } catch (err) {
        console.error("Failed to fetch order details:", err);
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(check, 2500);
      } else {
        // Show dialog anyway after timeout
        setShowSuccessDialog(true);
        fetchProducts();
      }
    };

    check();
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        status: "Active",
        sortBy: "createdAt",
        sortOrder,
      };
      if (search) params.search = search;
      if (category && category !== "all") params.category = category;

      const res = await getEcoProducts(params);
      setProducts(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      }
    } catch (err) {
      console.error("Failed to load eco products:", err);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to purchase products",
        variant: "destructive",
      });
      return;
    }
    setPurchasing(true);
    try {
      const res = await createCheckoutSession({
        productId: purchaseProduct._id,
        quantity: purchaseQty,
        shippingAddress,
      });
      const d = res.data;
      if (!d?.orderId) {
        throw new Error("No checkout session from server");
      }

      if (d.checkoutMode === "mock") {
        await api.post("/eco-products/complete-mock-checkout", {
          orderId: d.mongoOrderId,
        });
        setPurchasing(false);
        window.location.href = `/eco-marketplace?success=true&orderId=${d.mongoOrderId}`;
        return;
      }

      if (!d?.keyId) {
        throw new Error("No Razorpay key from server");
      }
      const RazorpayCtor = await loadRazorpayScript();
      const rzp = new RazorpayCtor({
        key: d.keyId,
        amount: d.amount,
        currency: d.currency || "INR",
        order_id: d.orderId,
        name: "Carbonix",
        description: d.productName || purchaseProduct.name,
        prefill: user?.email ? { email: user.email } : {},
        theme: { color: "#0f766e" },
        handler(response) {
          void (async () => {
            try {
              await api.post("/eco-products/verify-razorpay-payment", {
                orderId: d.mongoOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              window.location.href = `/eco-marketplace?success=true&orderId=${d.mongoOrderId}`;
            } catch (err) {
              toast({
                title: "Verification failed",
                description:
                  err.response?.data?.message || err.message || "Could not confirm payment",
                variant: "destructive",
              });
              setPurchasing(false);
            }
          })();
        },
        modal: {
          ondismiss() {
            setPurchasing(false);
          },
        },
      });
      rzp.on("payment.failed", (response) => {
        toast({
          title: "Payment failed",
          description: response?.error?.description || "Payment was not completed",
          variant: "destructive",
        });
        setPurchasing(false);
      });
      rzp.open();
    } catch (err) {
      toast({
        title: "Payment Failed",
        description:
          err.response?.data?.message || err.message || "Something went wrong",
        variant: "destructive",
      });
      setPurchasing(false);
    }
  };

  const openOrders = async () => {
    setShowOrders(true);
    setOrdersLoading(true);
    try {
      const res = await getMyEcoOrders();
      setMyOrders(res.data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load your orders",
        variant: "destructive",
      });
    } finally {
      setOrdersLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setSortOrder("desc");
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const FilterSidebar = () => (
    <div className="space-y-6 p-1">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Filter className="h-5 w-5" /> Filters
      </h3>
      <div>
        <Label>Category</Label>
        <Select
          value={category}
          onValueChange={(val) => {
            setCategory(val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {ECO_PRODUCT_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Sort by Price</Label>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Price: Low to High</SelectItem>
            <SelectItem value="desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" className="w-full" onClick={resetFilters}>
        <RefreshCw className="h-4 w-4 mr-2" /> Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-24 lg:pt-28">
      {/* Compact Header Bar */}
      <div className="border-b border-border bg-green-50 dark:bg-green-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
            <div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                Eco-Friendly Marketplace
              </h1>
              <p className="text-xs text-muted-foreground">
                {totalItems} sustainable products across{" "}
                {ECO_PRODUCT_CATEGORIES.length} categories
              </p>
            </div>
          </div>
          {user && (
            <Button
              size="sm"
              variant="outline"
              className="border-green-600 text-green-700 hover:bg-green-100 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-950/60 shrink-0"
              onClick={openOrders}
            >
              <Package className="h-4 w-4 mr-1.5" /> My Orders
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search eco products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Mobile filter trigger */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="sm:hidden">
                <Filter className="h-4 w-4 mr-2" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-6">
              <FilterSidebar />
            </SheetContent>
          </Sheet>

          {/* Desktop filters inline */}
          <div className="hidden sm:flex gap-3">
            <Select
              value={category}
              onValueChange={(val) => {
                setCategory(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {ECO_PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Price: Low → High</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={resetFilters}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-8 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Leaf className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">
              No products found
            </h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your filters or search terms.
            </p>
            <Button variant="outline" className="mt-4" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-1">
            {products.map((product) => (
              <Card
                key={product._id}
                className="group flex flex-col overflow-hidden rounded-3xl border-2 border-border/40 bg-card hover:border-brandMainColor/50 hover:shadow-[0_0_30px_-5px_rgba(92,179,56,0.15)] transition-all duration-500"
              >
                {/* ── Image Section ── */}
                <div className="relative h-44 overflow-hidden bg-muted/20">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-green-50 dark:bg-green-900/20">
                      <Leaf className="h-16 w-16 text-green-300 dark:text-green-700/50" />
                    </div>
                  )}

                  {/* Gradient Overlay for Bottom Text Context */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                  {/* Top Left: Stars (Eco Rating) */}
                  <div className="absolute left-3 top-3">
                    <Badge className="bg-background/95 text-yellow-500 backdrop-blur-sm shadow-sm border-border/50 text-[10px] tracking-widest pointer-events-none px-2.5 py-0.5">
                      {"★".repeat(product.ecoRating || 3)}
                    </Badge>
                  </div>

                  {/* Top Right: Carbon Impact — removed, shown in card body instead */}

                  {/* Bottom Left: Category */}
                  <div className="absolute bottom-3 left-3 pointer-events-none">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-md border-border/50 text-xs font-medium text-foreground px-2.5 py-0.5 shadow-sm">
                      {product.category}
                    </Badge>
                  </div>
                </div>

                {/* ── Content Section ── */}
                <CardContent className="flex flex-1 flex-col p-4">
                  {/* Title & Description */}
                  <div className="mb-2">
                    <h3 className="line-clamp-1 text-lg font-bold text-foreground group-hover:text-brandMainColor transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="line-clamp-2 mt-1 text-[13px] text-muted-foreground leading-snug">
                      {product.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {parseTags(product.tags).length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {parseTags(product.tags)
                        .slice(0, 3)
                        .map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground border border-border/40 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Environmental Impact — Compact */}
                  {product.carbonEmissionSaved != null && (
                    <button
                      onClick={() => setImpactProduct(product)}
                      className="group/impact relative w-full mb-3 rounded-xl overflow-hidden text-left transition-all duration-300 border border-border/30 bg-card/60 backdrop-blur-xl hover:shadow-[0_4px_20px_rgba(92,179,56,0.1)] hover:border-brandMainColor/40"
                    >
                      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-brandMainColor/40 to-transparent opacity-0 group-hover/impact:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative px-3 py-2.5">
                        {/* Row 1: Icon + Value + Arrow */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-brandMainColor/10">
                              <Leaf className="h-4 w-4 text-brandMainColor" />
                            </div>
                            <div>
                              <p className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-foreground tracking-tight tabular-nums leading-none">
                                  {product.carbonEmissionSaved?.toLocaleString()}
                                </span>
                                <span className="text-xs font-bold text-brandMainColor">g</span>
                                <span className="text-[10px] font-semibold text-muted-foreground">CO₂ prevented</span>
                              </p>
                            </div>
                          </div>
                          <Wind className="h-3.5 w-3.5 text-muted-foreground/50 group-hover/impact:text-brandMainColor transition-colors shrink-0" />
                        </div>
                        
                        {/* Row 2: Three equivalents inline */}
                        {(() => {
                          const kg = product.carbonEmissionSaved / 1000;
                          const meters = Math.round(kg * 4 * 1000);
                          const minutes = Math.round(kg * 1.2 * 60);
                          const treeHours = Math.round((kg / 21) * 365 * 24);
                          return (
                            <div className="flex items-center gap-1">
                              <div className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-muted/40 text-sky-600 dark:text-sky-400">
                                <Car className="h-3 w-3" />
                                <span className="text-[10px] font-extrabold">{meters.toLocaleString()}m</span>
                              </div>
                              <div className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-muted/40 text-amber-600 dark:text-amber-400">
                                <Lightbulb className="h-3 w-3" />
                                <span className="text-[10px] font-extrabold">{minutes}min</span>
                              </div>
                              <div className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-muted/40 text-emerald-600 dark:text-emerald-400">
                                <TreePine className="h-3 w-3" />
                                <span className="text-[10px] font-extrabold">{treeHours}hrs</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </button>
                  )}

                  {/* Price + Buy — Compact footer */}
                  <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-foreground leading-none">
                        ₹{product.price?.toLocaleString()}
                      </p>
                      <p className="text-[10px] mt-1 font-medium text-muted-foreground">
                        {product.stock > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">{product.stock} in stock</span>
                        ) : (
                          <span className="text-destructive">Unavailable</span>
                        )}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="rounded-full bg-brandMainColor text-white font-semibold transition-all duration-300 hover:scale-105 hover:bg-brandMainColor/90 disabled:opacity-50 h-9 px-5 shadow-sm hover:shadow-[0_0_15px_-3px_rgba(92,179,56,0.5)]"
                      onClick={() => {
                        setPurchaseProduct(product);
                        setPurchaseQty(1);
                      }}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                      {product.stock === 0 ? "Sold Out" : "Buy"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Purchase Dialog */}
      <Dialog
        open={!!purchaseProduct}
        onOpenChange={() => setPurchaseProduct(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Purchase Product
            </DialogTitle>
            <DialogDescription>
              Review quantity and shipping, then pay securely with Razorpay.
            </DialogDescription>
          </DialogHeader>
          {purchaseProduct && (
            <div className="space-y-4 mt-2">
              <div className="flex gap-4">
                {purchaseProduct.imageUrl ? (
                  <img
                    src={purchaseProduct.imageUrl}
                    alt={purchaseProduct.name}
                    className="h-20 w-20 rounded object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Leaf className="h-8 w-8 text-green-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{purchaseProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {purchaseProduct.category}
                  </p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">
                    ₹{purchaseProduct.price?.toLocaleString()} / unit
                  </p>
                </div>
              </div>

              <div>
                <Label>Quantity (max {purchaseProduct.stock})</Label>
                <Input
                  type="number"
                  min={1}
                  max={purchaseProduct.stock}
                  value={purchaseQty}
                  onChange={(e) =>
                    setPurchaseQty(
                      Math.min(Number(e.target.value), purchaseProduct.stock),
                    )
                  }
                />
              </div>

              <div>
                <Label>Shipping Address (optional)</Label>
                <Input
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter delivery address"
                />
              </div>

              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span>Unit Price</span>
                  <span>₹{purchaseProduct.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Quantity</span>
                  <span>×{purchaseQty}</span>
                </div>
                <hr className="my-2 border-green-200 dark:border-green-800" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-700 dark:text-green-400">
                    ₹{(purchaseProduct.price * purchaseQty).toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={handlePurchase}
                disabled={purchasing || purchaseQty < 1}
              >
                {purchasing ? (
                  <span className="flex items-center gap-2">
                    Opening Razorpay…
                  </span>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay with Razorpay — ₹
                    {(purchaseProduct.price * purchaseQty).toLocaleString()}
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Secure payment via Razorpay (test mode when using rzp_test_ keys)
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* My Orders Dialog */}
      <Dialog open={showOrders} onOpenChange={setShowOrders}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              My Eco Orders
            </DialogTitle>
            <DialogDescription className="sr-only">
              List of your eco marketplace orders and their status.
            </DialogDescription>
          </DialogHeader>
          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : myOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No orders yet. Start shopping!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myOrders.map((order) => (
                <Card key={order._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {order.product?.imageUrl ? (
                          <img
                            src={order.product.imageUrl}
                            alt={order.product?.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Leaf className="h-5 w-5 text-green-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {order.product?.name || "Product"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {order.quantity} • ₹
                            {order.totalAmount?.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          order.orderStatus === "delivered"
                            ? "bg-green-600 text-white"
                            : ""
                        }
                      >
                        {order.orderStatus}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Success Dialog */}
      <PaymentSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          setSuccessOrderDetails(null);
        }}
        orderDetails={successOrderDetails}
      />

      {/* Environmental Impact Info Dialog */}
      <Dialog open={!!impactProduct} onOpenChange={() => setImpactProduct(null)}>
        <DialogContent className="max-w-md overflow-hidden p-0 border-0 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4),0_0_20px_rgba(92,179,56,0.1)] rounded-[2rem] gap-0 [&>button]:hidden">
          {/* Header — theme-consistent glassmorphic style */}
          <div className="relative px-6 pt-7 pb-7 flex flex-col items-center justify-center overflow-hidden bg-muted/50 dark:bg-muted/30 border-b border-border/30">
            {/* Custom Close Button */}
            <button 
              onClick={() => setImpactProduct(null)}
              className="absolute top-4 right-4 z-50 p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            {/* Soft brand glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-brandMainColor/8 rounded-full blur-[80px] pointer-events-none"></div>
            
            <DialogHeader className="relative z-10 w-full mb-4">
              <DialogTitle className="flex items-center justify-center gap-2 text-muted-foreground text-[11px] uppercase tracking-[0.2em] font-bold">
                <div className="p-1.5 rounded-lg bg-brandMainColor/10">
                  <Leaf className="h-3 w-3 text-brandMainColor" />
                </div>
                Environmental Impact
              </DialogTitle>
              <DialogDescription className="sr-only">
                Estimated environmental benefits for this product.
              </DialogDescription>
            </DialogHeader>
            {impactProduct && (
              <div className="relative z-10 text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="flex items-baseline justify-center">
                  <span className="text-6xl font-black text-foreground tracking-tighter leading-none">
                    {impactProduct.carbonEmissionSaved?.toLocaleString()}
                  </span>
                  <span className="text-xl font-bold text-brandMainColor ml-2">g</span>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground mt-3 bg-brandMainColor/10 text-brandMainColor px-4 py-1.5 rounded-full tracking-wide uppercase">
                  CO₂ emission prevented per unit
                </p>
              </div>
            )}
          </div>

          {impactProduct && (
            <div className="px-6 py-5 space-y-4 bg-card">
              <div className="text-center space-y-1">
                <h4 className="text-base font-bold text-foreground">
                  The <span className="text-brandMainColor">{impactProduct.name}</span> Effect
                </h4>
                <p className="text-[13px] text-muted-foreground leading-relaxed px-2 font-medium">
                  Avoid emissions simply by making this sustainable choice.
                </p>
              </div>

              {/* Equivalents */}
              <div className="space-y-3 mt-1">
                <div className="flex items-center justify-center gap-3">
                  <div className="h-px bg-border/60 flex-1"></div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Translation to real-world</p>
                  <div className="h-px bg-border/60 flex-1"></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {getImpactEquivalents(impactProduct.carbonEmissionSaved).map((eq, i) => (
                    <div key={i} className="group relative rounded-2xl flex flex-col items-center bg-muted/40 p-4 text-center hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="absolute inset-0 bg-gradient-to-br from-brandMainColor/0 via-brandMainColor/0 to-brandMainColor/5 group-hover:via-brandMainColor/5 rounded-2xl transition-all"></div>
                      <eq.Icon className={`h-6 w-6 mb-2 drop-shadow-sm group-hover:scale-110 transition-transform duration-300 ease-out ${eq.iconColor}`} />
                      <p className="text-xs font-extrabold text-foreground mb-0.5">{eq.label}</p>
                      <p className="text-[9px] font-semibold text-muted-foreground leading-tight px-0.5">{eq.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 transition-colors">
                <div className="shrink-0 mt-0.5 bg-emerald-500/20 p-2 rounded-full">
                  <Wind className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-snug font-semibold">
                  This contributes to India's 2070 net-zero targets and UN goals.
                </p>
              </div>

              <Button
                className="w-full text-white font-black uppercase tracking-wide shadow-[0_8px_20px_rgba(92,179,56,0.3)] hover:shadow-[0_12px_25px_rgba(92,179,56,0.4)] transition-all duration-300 hover:-translate-y-0.5 rounded-xl h-12 text-sm bg-brandMainColor hover:bg-brandMainColor/90 dark:text-black"
                onClick={() => {
                  setImpactProduct(null);
                  setPurchaseProduct(impactProduct);
                  setPurchaseQty(1);
                }}
                disabled={impactProduct.stock === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {impactProduct.stock === 0 ? "Currently Unavailable" : "Buy & Prevent Emissions"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EcoMarketplace;
