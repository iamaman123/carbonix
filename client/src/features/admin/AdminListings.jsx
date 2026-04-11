import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getPendingListings, reviewListing } from "@/services/listingService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Shield,
  ShieldAlert,
  XCircle,
} from "lucide-react";

const riskBadgeClass = (riskLevel) => {
  if (riskLevel === "low") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  if (riskLevel === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
  return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300";
};

const AdminListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reasonMap, setReasonMap] = useState({});
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const API_EMPTY_STATE = useMemo(
    () => ({
      title: "No listings awaiting approval",
      description: "New seller submissions will appear here after AI validation.",
    }),
    [],
  );

  const fetchPendingListings = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await getPendingListings({ page, limit: 12 });
      setListings(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error loading pending listings:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load pending listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => {
    if (user?.role !== "admin") {
      toast({
        title: "Access denied",
        description: "Admin access is required to review listings.",
        variant: "destructive",
      });
      navigate("/admin", { replace: true });
      return;
    }

    fetchPendingListings();
  }, [user, navigate, fetchPendingListings]);

  const handleReview = async (listingId, action) => {
    const rejectionReason = reasonMap[listingId]?.trim();

    if (action === "reject" && !rejectionReason) {
      toast({
        title: "Rejection reason required",
        description: "Enter a reason before rejecting the listing.",
        variant: "destructive",
      });
      return;
    }

    setActionLoadingId(listingId);
    try {
      await reviewListing(listingId, {
        action,
        rejectionReason: action === "reject" ? rejectionReason : undefined,
      });

      setListings((prev) => prev.filter((listing) => listing._id !== listingId));
      setReasonMap((prev) => {
        const next = { ...prev };
        delete next[listingId];
        return next;
      });

      toast({
        title: action === "approve" ? "Listing approved" : "Listing rejected",
        description:
          action === "approve"
            ? "The listing is now live in the marketplace."
            : "The seller has been notified of the rejection.",
      });
    } catch (error) {
      console.error("Error reviewing listing:", error);
      toast({
        title: "Review failed",
        description: error.response?.data?.message || "Could not update listing status.",
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <Card className="w-full max-w-md border border-border/60 bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Access denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You need admin access to review listings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 lg:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-7 w-7 text-primary" />
                Listing Approvals
              </h1>
              <p className="text-muted-foreground mt-1">
                Review seller submissions and approve only verified listings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fetchPendingListings({ silent: true })}
              disabled={refreshing}
            >
              {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-8">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse border border-border/60">
                <CardHeader>
                  <div className="h-4 w-1/2 rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-3 rounded bg-muted" />
                  <div className="h-3 rounded bg-muted" />
                  <div className="h-3 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <Card className="border border-border/60 bg-card shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Clock3 className="mb-3 h-10 w-10 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">{API_EMPTY_STATE.title}</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">{API_EMPTY_STATE.description}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => {
              const moderation = listing.moderation?.aiValidation || {};
              const riskLevel = moderation.riskLevel || "medium";
              const reasons = Array.isArray(moderation.reasons) ? moderation.reasons : [];
              const errorFields = Array.isArray(moderation.errorFields) ? moderation.errorFields : [];

              return (
                <Card key={listing._id} className="border border-border/60 bg-card shadow-lg">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base font-semibold text-foreground">
                          {listing.title}
                        </CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {listing.projectType} • {listing.location}
                        </p>
                      </div>
                      <Badge className={riskBadgeClass(riskLevel)}>
                        Risk {riskLevel}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">{listing.quantity} credits</Badge>
                      <Badge variant="outline">₹{listing.pricePerCredit}/credit</Badge>
                      <Badge variant="outline">{listing.verification?.verifiedBy || "Unverified"}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {listing.description}
                    </p>

                    <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
                      <div className="mb-2 flex items-center gap-2 text-foreground">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        AI review notes
                      </div>
                      {reasons.length > 0 ? (
                        <ul className="list-inside list-disc space-y-1">
                          {reasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No AI concerns reported.</p>
                      )}
                      {errorFields.length > 0 && (
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          Fields: {errorFields.join(", ")}
                        </p>
                      )}
                    </div>

                    {listing.moderation?.aiValidation?.checkedAt && (
                      <p className="text-[11px] text-muted-foreground">
                        Checked at {new Date(listing.moderation.aiValidation.checkedAt).toLocaleString()}
                      </p>
                    )}

                    <div className="space-y-2">
                      <Textarea
                        value={reasonMap[listing._id] || ""}
                        onChange={(event) =>
                          setReasonMap((prev) => ({
                            ...prev,
                            [listing._id]: event.target.value,
                          }))
                        }
                        placeholder="Add rejection reason if needed"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleReview(listing._id, "approve")}
                          disabled={actionLoadingId === listing._id}
                        >
                          {actionLoadingId === listing._id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleReview(listing._id, "reject")}
                          disabled={actionLoadingId === listing._id}
                        >
                          {actionLoadingId === listing._id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="mr-2 h-4 w-4" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminListings;
