import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  MapPin,
  IndianRupee,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  MessageCircle,
  Sparkles,
  Leaf,
  Eye,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  PAGINATION,
  LISTING_STATUS,
} from "@/constants/api";
import DynamicPriceDisplay from "@/components/DynamicPriceDisplay";
import LiveChatPanel from "@/components/common/LiveChatPanel";
import { toast } from "sonner";

const Marketplace = () => {
  const navigate = useNavigate();
  const [allListings, setAllListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [filters, setFilters] = useState({
    title: "",
    location: "",
    minPrice: "",
  });
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pricingData, setPricingData] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [chatParticipantId, setChatParticipantId] = useState(null);
  const [chatParticipantName, setChatParticipantName] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(PAGINATION.DEFAULT_PAGE);
  const itemsPerPage = PAGINATION.ITEMS_PER_PAGE.MARKETPLACE;
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (allListings.length > 0) {
      applyFiltersAndSort(allListings, filters, sortOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortOrder, allListings]);

  useEffect(() => {
    if (selectedListing && showDetailsModal) {
      fetchPricingData(selectedListing._id);
    }
  }, [selectedListing, showDetailsModal]);

  const fetchPricingData = async (listingId) => {
    setPricingLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/pricing/${listingId}?isProduct=false`,
      );
      if (response.data.data) {
        setPricingData(response.data.data);
      }
    } catch (err) {
      console.error("Failed to load pricing data:", err);
    }
    setPricingLoading(false);
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      // Fetch all available listings to allow frontend sorting and filtering
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.CREDITS.BASE}`,
        { params: { status: LISTING_STATUS.AVAILABLE, limit: 1000 } }
      );
      
      const rawListings = response.data.data || [];

      // Optimized chunking processor to prevent network flooding/rate limits
      const fetchInChunks = async (items, chunkSize = 5) => {
        const results = [];
        for (let i = 0; i < items.length; i += chunkSize) {
          const chunk = items.slice(i, i + chunkSize);
          const chunkPromises = chunk.map(async (listing) => {
            try {
              const pRes = await axios.get(`${API_BASE_URL}/api/pricing/${listing._id}?isProduct=false`);
              const recommendedPrice = pRes.data?.data?.recommendedPrice || listing.pricePerCredit;
              return { ...listing, dynamicPrice: recommendedPrice };
            } catch (err) {
              return { ...listing, dynamicPrice: listing.pricePerCredit };
            }
          });
          const completedChunk = await Promise.all(chunkPromises);
          results.push(...completedChunk);
        }
        return results;
      };

      const listingsWithPricing = await fetchInChunks(rawListings, 5);
      
      setAllListings(listingsWithPricing);
      setError(null);
    } catch (err) {
      console.error("Failed to load listings:", err);
      setError("Failed to load listings");
    }
    setLoading(false);
  };

  const applyFiltersAndSort = (listings, currentFilters, currentSort) => {
    let result = [...listings];
    
    // Apply filters
    if (currentFilters.title?.trim()) {
      const q = currentFilters.title.trim().toLowerCase();
      result = result.filter(item => 
        (item.title && item.title.toLowerCase().includes(q)) || 
        (item.projectType && item.projectType.toLowerCase().includes(q))
      );
    }
    
    if (currentFilters.location?.trim()) {
      const loc = currentFilters.location.trim().toLowerCase();
      result = result.filter(item => 
        item.location && item.location.toLowerCase().includes(loc)
      );
    }
    
    if (currentFilters.minPrice && parseFloat(currentFilters.minPrice) > 0) {
      const min = parseFloat(currentFilters.minPrice);
      result = result.filter(item => item.dynamicPrice >= min);
    }
    
    // Sort Results using the AI-Recommended dynamic price
    if (currentSort === "asc") {
      result.sort((a, b) => a.dynamicPrice - b.dynamicPrice);
    } else if (currentSort === "desc") {
      result.sort((a, b) => b.dynamicPrice - a.dynamicPrice);
    }
    
    setFilteredListings(result);
    setTotalItems(result.length);
    setTotalPages(Math.ceil(result.length / itemsPerPage) || 1);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    setCurrentPage(PAGINATION.DEFAULT_PAGE);
  };

  const handleClearFilters = () => {
    setFilters({ title: "", location: "", minPrice: "" });
    setSortOrder("asc");
    setCurrentPage(PAGINATION.DEFAULT_PAGE);
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  // Pagination Logic
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);
  const indexOfFirstItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const currentListings = filteredListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const marketInsights = useMemo(() => {
    if (!allListings.length) {
      return {
        totalProjects: 0,
        averagePrice: 0,
        regions: 0,
        totalCarbonReduced: 0,
      };
    }

    const getEmissionReductionPerCredit = (projectType = "") => {
      const normalizedType = projectType.toLowerCase();

      if (normalizedType.includes("renewable")) return 0.92;
      if (normalizedType.includes("reforestation")) return 1.15;
      if (normalizedType.includes("blue carbon")) return 1.3;
      if (normalizedType.includes("waste")) return 0.75;
      if (normalizedType.includes("agriculture")) return 0.65;
      return 0.8;
    };

    const totalProjects = allListings.length;
    const totalPrice = allListings.reduce(
      (sum, project) => sum + (Number(project.pricePerCredit) || 0),
      0,
    );
    const regions = new Set(
      allListings
        .map((project) => project.location?.toLowerCase().trim())
        .filter(Boolean),
    ).size;
    const totalCarbonReduced = allListings.reduce((sum, project) => {
      const quantity = Number(project.quantity) || 0;
      const perCreditReduction = getEmissionReductionPerCredit(project.projectType);
      return sum + quantity * perCreditReduction;
    }, 0);

    return {
      totalProjects,
      averagePrice: totalPrice / totalProjects || 0,
      regions,
      totalCarbonReduced,
    };
  }, [allListings]);

  const trendingListings = useMemo(() => {
    if (!allListings.length) return [];
    // Get top 4 listings by price (highest first)
    return allListings
      .sort((a, b) => Number(b.pricePerCredit) - Number(a.pricePerCredit))
      .slice(0, 4);
  }, [allListings]);

  return (
    <>
      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedListing && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedListing.title}</DialogTitle>
                <DialogDescription>{selectedListing.projectType || "Carbon Credit Listing"}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold text-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {selectedListing.location || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available Credits</p>
                    <p className="font-semibold text-foreground">{Number(selectedListing.quantity).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Base Price</p>
                    <p className="font-semibold text-foreground flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" /> {selectedListing.pricePerCredit.toFixed(2)} per credit
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vintage Year</p>
                    <p className="font-semibold text-foreground">{selectedListing.vintageYear || "Current"}</p>
                  </div>
                </div>

                {/* Description */}
                {selectedListing.description && (
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Description</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedListing.description}</p>
                  </div>
                )}

                {/* Project Details */}
                {selectedListing.projectDetails && (
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Project Details</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedListing.projectDetails}</p>
                  </div>
                )}

                {/* Pricing Analysis */}
                {pricingLoading ? (
                  <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                    <p className="text-sm text-muted-foreground">Loading pricing analysis...</p>
                  </div>
                ) : pricingData ? (
                  <div className="space-y-4">
                    {/* Recommended Price */}
                    <div className="rounded-lg border border-brandMainColor/30 bg-brandMainColor/5 dark:bg-brandSubColor/5 p-4">
                      <p className="text-sm text-muted-foreground mb-2">Dynamic Price</p>
                      <div className="flex items-baseline justify-between">
                        <div>
                          <p className="text-3xl font-bold text-brandMainColor dark:text-brandSubColor">
                            ₹{pricingData.recommendedPrice?.toFixed(2) || selectedListing.pricePerCredit}
                          </p>
                          <p className="text-xs text-muted-foreground">Recommended price (multiplier: {pricingData.priceMultiplier?.toFixed(2)}x)</p>
                        </div>
                        <div className="text-right">
                          {pricingData.savings > 0 && (
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                              Save ₹{pricingData.savings.toFixed(2)}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">Market: {pricingData.currentMarketTemperature}</p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Factors Grid */}
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-3">Pricing Factors Analysis</p>
                      <div className="grid grid-cols-2 gap-3">
                        {pricingData.factors && (
                          <>

                            <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                              <p className="text-xs text-muted-foreground">Rate Factor</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-lg font-bold text-foreground">
                                  {(pricingData.factors.rateFactor * 100).toFixed(0)}%
                                </span>
                                <span className="text-xs text-blue-600">✓ Quality</span>
                              </div>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                              <p className="text-xs text-muted-foreground">Verification Factor</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-lg font-bold text-foreground">
                                  {(pricingData.factors.verificationFactor * 100).toFixed(0)}%
                                </span>
                                <span className="text-xs text-green-600">✓ Verified</span>
                              </div>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                              <p className="text-xs text-muted-foreground">Trend Factor</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-lg font-bold text-foreground">
                                  {(pricingData.factors.trendFactor * 100).toFixed(0)}%
                                </span>
                                <span className="text-xs text-sky-600">📈 Trend</span>
                              </div>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                              <p className="text-xs text-muted-foreground">Time Decay Factor</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-lg font-bold text-foreground">
                                  {(pricingData.factors.timeDecayFactor * 100).toFixed(0)}%
                                </span>
                                <span className="text-xs text-slate-600">⏱ Age</span>
                              </div>
                            </div>
                          </>
                        )}

                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Verification & Documents */}
                <div className="rounded-lg border border-border/60 bg-background/50 p-4 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Verification & Documents</p>
                  <p className="text-sm text-muted-foreground">
                    ✓ Includes verification reports
                    {"\n"}✓ Registry attestations
                    {"\n"}✓ Monitoring data for due diligence
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1 h-10 rounded-lg bg-brandMainColor text-sm font-semibold text-white hover:bg-brandMainColor/90 dark:bg-brandSubColor dark:text-slate-950 dark:hover:bg-brandSubColor/90"
                    onClick={() => {
                      navigate(
                        `/payment?id=${selectedListing._id}&price=${selectedListing.pricePerCredit}&title=${encodeURIComponent(selectedListing.title)}&maxQuantity=${selectedListing.quantity}`,
                      );
                      setShowDetailsModal(false);
                    }}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" /> Purchase Now
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 rounded-lg"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chat with {chatParticipantName || "Seller"}</DialogTitle>
            <DialogDescription>
              Ask questions and finalize your carbon credit purchase.
            </DialogDescription>
          </DialogHeader>
          <LiveChatPanel initialParticipantId={chatParticipantId} />
        </DialogContent>
      </Dialog>

      <div className="bg-background pt-24 lg:pt-28">
      <div className="border-b border-border bg-muted/40 dark:bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary shrink-0" />
            <div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                Carbon Credit Marketplace
              </h1>
              <p className="text-xs text-muted-foreground">
                Browse verified listings across renewable energy, nature-based
                solutions, and carbon removal
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchListings}>
            Refresh inventory
          </Button>
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-3 flex gap-6">
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {marketInsights.totalProjects}
            </span>{" "}
            live projects
          </div>
          <div className="text-xs text-muted-foreground">
            Avg.{" "}
            <span className="font-semibold text-foreground">
              ₹{marketInsights.averagePrice.toFixed(0)}
            </span>{" "}
            / credit
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {marketInsights.regions}
            </span>{" "}
            regions
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {marketInsights.totalCarbonReduced.toFixed(0)}
            </span>{" "}
            tons CO2e reduced
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <section className="grid gap-10 lg:grid-cols-[280px,1fr]">
          <div className="space-y-4">
            <Card className="hidden lg:block border border-border/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card/50 backdrop-blur-md overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brandMainColor/80 to-emerald-400 dark:from-brandSubColor/80" />
              <CardHeader className="space-y-1 pb-4 pt-5">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Filter className="h-4 w-4 text-brandMainColor dark:text-brandSubColor" /> 
                  Refine Results
                </CardTitle>
                <CardDescription className="text-xs">
                  Narrow down AI-priced credits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brandMainColor transition-colors" />
                    <Input
                      name="title"
                      value={filters.title}
                      placeholder="Keywords or title"
                      className="pl-9 bg-background/50 border-border/50 focus-visible:ring-brandMainColor/30 rounded-xl"
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brandMainColor transition-colors" />
                    <Input
                      name="location"
                      value={filters.location}
                      placeholder="Location"
                      className="pl-9 bg-background/50 border-border/50 focus-visible:ring-brandMainColor/30 rounded-xl"
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="relative group">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brandMainColor transition-colors" />
                    <Input
                      name="minPrice"
                      value={filters.minPrice}
                      placeholder="Min AI Price"
                      type="number"
                      className="pl-9 bg-background/50 border-border/50 focus-visible:ring-brandMainColor/30 rounded-xl"
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    className="h-10 w-full rounded-xl bg-brandMainColor text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-brandMainColor/90 transition-all dark:bg-brandSubColor dark:text-slate-950 dark:hover:bg-brandSubColor/90"
                    onClick={handleApplyFilters}
                  >
                    Apply filters
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-10 w-full rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
                    onClick={handleClearFilters}
                  >
                    Clear filters
                  </Button>
                </div>
              </CardContent>
            </Card>



            <div className="flex items-center justify-between gap-3 lg:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 rounded-xl bg-card border-border/50 shadow-sm">
                    <Filter size={16} /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="space-y-4 p-6 rounded-t-3xl border-border/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Refine Results</h2>
                    <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-muted-foreground">
                      Reset
                    </Button>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input name="title" value={filters.title} placeholder="Keywords or title" className="pl-9 rounded-xl bg-muted/50 border-border/50" onChange={handleFilterChange} />
                    </div>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input name="location" value={filters.location} placeholder="Location" className="pl-9 rounded-xl bg-muted/50 border-border/50" onChange={handleFilterChange} />
                    </div>
                    <div className="relative group">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input name="minPrice" value={filters.minPrice} placeholder="Min AI Price" type="number" className="pl-9 rounded-xl bg-muted/50 border-border/50" onChange={handleFilterChange} />
                    </div>
                    <Button
                      className="h-11 mt-2 rounded-xl bg-brandMainColor text-sm font-semibold text-white shadow-md w-full dark:bg-brandSubColor dark:text-slate-950"
                      onClick={() => { handleApplyFilters(); setIsSheetOpen(false); }}
                    >
                      Apply filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Select onValueChange={handleSortChange} value={sortOrder}>
                <SelectTrigger className="w-[180px] rounded-xl bg-card border-border/50 shadow-sm focus:ring-brandMainColor/30">
                  <SelectValue placeholder="Sort by AI price" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-border/50">
                  <SelectItem value="asc" className="rounded-lg my-1 cursor-pointer font-medium text-sm">AI Price: Low to High</SelectItem>
                  <SelectItem value="desc" className="rounded-lg my-1 cursor-pointer font-medium text-sm">AI Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="hidden lg:flex flex-col gap-3 border border-border/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card/50 backdrop-blur-md p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 text-brandMainColor dark:text-brandSubColor" />
                  Sort By AI Price
                </h3>
              </div>
              <Select onValueChange={handleSortChange} value={sortOrder}>
                <SelectTrigger className="bg-background/50 border-border/50 rounded-xl shadow-sm focus:ring-brandMainColor/30">
                  <SelectValue placeholder="Select sorting order" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50 shadow-xl">
                  <SelectItem value="asc" className="rounded-lg cursor-pointer my-1 text-sm font-medium">Low to High</SelectItem>
                  <SelectItem value="desc" className="rounded-lg cursor-pointer my-1 text-sm font-medium">High to Low</SelectItem>
                </SelectContent>
              </Select>
            </Card>
          </div>

          <section className="space-y-8">
            {/* Trending Section Above Listings */}
            {!loading && trendingListings.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-brandMainColor dark:text-brandSubColor fill-brandMainColor/20" />
                  Trending Now
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {trendingListings.map((listing) => (
                    <Card
                      key={listing._id}
                      className="group cursor-pointer border border-brandMainColor/20 dark:border-brandSubColor/20 shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-gradient-to-br from-brandMainColor/5 to-transparent dark:from-brandSubColor/5 backdrop-blur-md rounded-2xl overflow-hidden hover:border-brandMainColor/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                      onClick={() => {
                        setSelectedListing(listing);
                        setPricingData(null);
                        setShowDetailsModal(true);
                      }}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center rounded-full bg-brandMainColor/10 px-2.5 py-0.5 text-[10px] font-bold text-brandMainColor dark:bg-brandSubColor/10 dark:text-brandSubColor">
                            HOT DEAL
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-brandMainColor dark:group-hover:text-brandSubColor transition-colors h-10">
                          {listing.title}
                        </p>
                        <div className="flex items-end justify-between pt-1 border-t border-border/50">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Price</p>
                            <p className="text-sm font-bold text-foreground">
                              ₹{listing.pricePerCredit.toFixed(0)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5 font-medium">Avail</p>
                            <p className="text-sm font-semibold text-foreground">
                              {listing.quantity > 1000 ? `${(listing.quantity/1000).toFixed(1)}k` : listing.quantity}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Listings Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Leaf className="h-6 w-6 text-brandMainColor dark:text-brandSubColor" />
                All Listings
              </h2>
            </div>
            {loading ? (
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Skeleton
                    key={`skeleton-${idx}`}
                    className="h-72 w-full rounded-lg"
                  />
                ))}
              </div>
            ) : error ? (
              <Card className="border border-destructive/40 bg-destructive/10 p-6 text-destructive">
                <CardContent className="p-0">{error}</CardContent>
              </Card>
            ) : filteredListings.length === 0 ? (
              <Card className="border border-border/70 bg-card/90 p-10 text-center shadow-xl">
                <CardContent className="space-y-3 p-0">
                  <h2 className="text-xl font-semibold text-foreground">
                    No listings found
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Adjust your filters or refresh the marketplace to view more
                    projects.
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                  {currentListings.map((listing) => (
                    <Card
                      key={listing._id}
                      className="group relative flex flex-col border border-border/70 bg-card/90 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl overflow-hidden"
                    >
                      <div className="h-1 w-full bg-gradient-to-r from-brandMainColor via-emerald-500 to-lime-400 dark:from-brandSubColor" />
                      
                      <CardHeader className="space-y-3 pb-3">
                        <CardTitle className="line-clamp-2 text-lg font-bold text-foreground">
                          {listing.title}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="flex flex-1 flex-col justify-between space-y-4 pb-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                            <MapPin className="h-5 w-5 flex-shrink-0 text-brandMainColor" />
                            <span className="truncate font-medium">{listing.location || "Not specified"}</span>
                          </div>
                          
                          <DynamicPriceDisplay
                            itemId={listing._id}
                            isProduct={false}
                            basePrice={listing.pricePerCredit}
                          />
                          
                          <div className="text-sm text-muted-foreground">
                            <span className="font-bold text-foreground text-base">
                              {Number(listing.quantity).toLocaleString()}
                            </span>
                            <span className="text-sm"> credits available</span>
                          </div>


                        </div>
                      </CardContent>
                      
                      <div className="flex gap-3 px-4 pb-4">
                        <Button
                          variant="outline"
                          className="h-10 flex-1 text-sm font-semibold"
                          onClick={() => {
                            setSelectedListing(listing);
                            setPricingData(null);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" /> Details
                        </Button>
                        <Button
                          variant="outline"
                          className="h-10 flex-1 text-sm font-semibold"
                          onClick={() => {
                            const sellerId = listing.seller?._id || listing.seller;
                            if (!sellerId) {
                              toast.error("Seller info not available for this listing");
                              return;
                            }

                            setChatParticipantId(sellerId);
                            setChatParticipantName(
                              listing.seller?.email || listing.seller?.name || "Seller"
                            );
                            setChatDialogOpen(true);
                          }}
                        >
                          <MessageCircle className="mr-2 h-4 w-4" /> Chat
                        </Button>
                        <Button
                          className="h-10 flex-1 bg-brandMainColor text-sm font-semibold text-white hover:bg-brandMainColor/90 dark:bg-brandSubColor dark:text-slate-950 dark:hover:bg-brandSubColor/90"
                          onClick={() => {
                            navigate(
                              `/payment?id=${listing._id}&price=${listing.pricePerCredit}&title=${encodeURIComponent(listing.title)}&maxQuantity=${listing.quantity}`,
                            );
                          }}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" /> Buy
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-lg sm:flex-row">
                  <p className="text-sm text-muted-foreground">
                    Showing {indexOfFirstItem}-{indexOfLastItem} of {totalItems}{" "}
                    listings
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <span className="text-sm font-semibold text-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </section>
        </section>
      </main>
      </div>
    </>
  );
};

export default Marketplace;
