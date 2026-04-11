import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { NumberTicker } from "@/components/magicui/number-ticker";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  Search,
  SlidersHorizontal,
  Grid,
  Leaf,
  TrendingUp,
  DollarSign,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusOptions = ["All", "Available", "Pending", "Sold"];

const ListingsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchListings = async () => {
      if (!token) {
        return;
      }

      setIsLoading(true);
      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "carbonix-me-1.vercel.app/api";
        const response = await axios.get(
          `${API_BASE_URL}/credits/posted-data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setListings(
          Array.isArray(response.data?.posted) ? response.data.posted : [],
        );
      } catch (error) {
        console.error("Error fetching listings:", error);
        toast({
          title: "Unable to load listings",
          description: "Please try refreshing the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [token]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesStatus =
        statusFilter === "All" ||
        (listing.status || "").toLowerCase() === statusFilter.toLowerCase();
      const matchesSearch = [
        listing.title,
        listing.description,
        listing.projectType,
      ]
        .filter(Boolean)
        .some((value) =>
          value.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      return matchesStatus && matchesSearch;
    });
  }, [listings, statusFilter, searchTerm]);

  const metrics = useMemo(() => {
    const activeListings = listings.filter(
      (listing) => listing.status === "Available",
    ).length;
    const totalVolume = listings.reduce(
      (sum, listing) => sum + (Number(listing.quantity) || 0),
      0,
    );
    const normalizePrice = (value) => {
      const cleaned = String(value ?? "").replace(/[^0-9.-]/g, "");
      const parsed = Number.parseFloat(cleaned);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const averagePrice = listings.length
      ? listings.reduce(
          (sum, listing) => sum + normalizePrice(listing.pricePerCredit),
          0,
        ) / listings.length
      : 0;

    return {
      totalListings: listings.length,
      activeListings,
      totalVolume,
      averagePrice,
    };
  }, [listings]);

  const handleStatusChange = async (id, status) => {
    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "carbonix-me-1.vercel.app/api";
      await axios.put(
        `${API_BASE_URL}/listings/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setListings((prevListings) =>
        prevListings.map((listing) =>
          listing._id === id
            ? {
                ...listing,
                status,
              }
            : listing,
        ),
      );
      toast({
        title: "Listing updated",
        description: `Status set to ${status}.`,
      });
    } catch (error) {
      console.error("Error updating listing status:", error);
      toast({
        title: "Update failed",
        description: "We could not update the status. Please retry.",
        variant: "destructive",
      });
    }
  };

  const statsCards = [
    {
      title: "Total Listings",
      value: metrics.totalListings,
      icon: Grid,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Active Listings",
      value: metrics.activeListings,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Total Credits",
      value: metrics.totalVolume,
      icon: Leaf,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      title: "Avg. Price",
      value: `₹${metrics.averagePrice.toFixed(0)}`,
      icon: DollarSign,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-brandMainColor/5 to-emerald-500/5 dark:via-brandSubColor/5 dark:to-lime-400/5 pt-24 lg:pt-28 relative">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 relative z-10">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-card/60 backdrop-blur-xl border border-border/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <SlidersHorizontal className="w-7 h-7 text-brandMainColor dark:text-brandSubColor" />
              Manage Listings
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Keep your projects accurate and up to date so buyers can quickly
              discover your credits.
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
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="group overflow-hidden border border-border/30 bg-card/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 rounded-2xl relative"
              >
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
                  {typeof stat.value === "number" ? (
                    <NumberTicker
                      value={stat.value}
                      className="text-3xl font-extrabold tracking-tight"
                    />
                  ) : (
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">
                      {stat.value}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Listings Table */}
        <Card className="border border-border/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Grid className="w-64 h-64 text-brandMainColor dark:text-brandSubColor" />
          </div>

          <CardHeader className="border-b border-border/20 bg-muted/10 pb-6 px-8 rounded-t-3xl relative z-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-2xl font-extrabold flex items-center gap-3">
                  <Grid className="w-7 h-7 text-brandMainColor dark:text-brandSubColor" />
                  Listings Overview
                </CardTitle>
                <CardDescription className="text-sm mt-1 text-muted-foreground">
                  Update status, pricing, and availability in real-time.
                </CardDescription>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search listings..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-60 pl-9 rounded-xl border-border/50 bg-background/60 backdrop-blur-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 rounded-xl border-border/50 bg-background/60 backdrop-blur-sm">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 relative z-10 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="font-bold text-foreground">
                    Project
                  </TableHead>
                  <TableHead className="hidden lg:table-cell font-bold text-foreground">
                    Description
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Quantity
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Price / Credit
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-right font-bold text-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brandMainColor border-t-transparent mx-auto mb-4"></div>
                      <p className="text-muted-foreground font-medium">
                        Loading your listings...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filteredListings.length ? (
                  filteredListings.map((listing) => {
                    const status = listing.status || "Available";
                    const badgeClasses =
                      status === "Available"
                        ? "text-green-600 border-green-600/30 bg-green-500/10 dark:text-green-400"
                        : status === "Sold"
                          ? "text-red-600 border-red-600/30 bg-red-500/10 dark:text-red-400"
                          : "text-amber-600 border-amber-600/30 bg-amber-500/10 dark:text-amber-400";
                    const rawPrice = String(listing.pricePerCredit ?? "");
                    const parsedPrice = Number.parseFloat(
                      rawPrice.replace(/[^0-9.-]/g, ""),
                    );
                    const priceLabel = Number.isFinite(parsedPrice)
                      ? parsedPrice.toLocaleString()
                      : "0";

                    return (
                      <TableRow
                        key={listing._id}
                        className="last:border-0 border-border/20 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-semibold text-foreground">
                          <div className="flex flex-col">
                            <span className="font-bold">{listing.title}</span>
                            <span className="text-xs font-medium text-muted-foreground">
                              {listing.projectType || "General"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden max-w-sm lg:table-cell">
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {listing.description || "No description provided."}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 font-bold text-foreground">
                            <Leaf className="w-4 h-4 text-green-600 dark:text-green-400" />
                            {Number(listing.quantity || 0).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-foreground">
                            ₹{priceLabel}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`capitalize font-bold border-2 rounded-xl py-1 px-3 ${badgeClasses}`}
                          >
                            {status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-border/50 font-semibold hover:bg-muted/80 transition-all"
                              onClick={() =>
                                handleStatusChange(listing._id, "Sold")
                              }
                            >
                              Mark sold
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Grid className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                      <p className="text-xl font-bold text-foreground mb-2">
                        No listings match your filters
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or status filter.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListingsPage;
