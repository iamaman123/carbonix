import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast, Toaster } from "sonner";
import { CreditCard, ShieldCheck, CheckCircle2, Loader2, Leaf, FileText } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "motion/react";
import api from "@/lib/api";
import { loadRazorpayScript } from "@/lib/loadRazorpay";

// ─── Payment Success Dialog ───────────────────────────────────────────────────
const CreditPaymentSuccessDialog = ({ isOpen, onClose, txDetails, onViewReceipt }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-lg w-[90vw] max-h-[90vh] overflow-y-auto p-6">
      <div className="flex flex-col items-center text-center">
        {/* Animated checkmark — contained so ring doesn't overflow */}
        <div className="relative flex items-center justify-center mb-6" style={{ width: 80, height: 80 }}>
          <motion.div
            className="absolute rounded-full bg-green-400"
            style={{ width: 80, height: 80 }}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <CheckCircle2 className="h-20 w-20 text-green-600 dark:text-green-500 relative z-10" />
          </motion.div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DialogTitle className="text-xl font-bold text-green-700 dark:text-green-500 mb-1">
            Payment Successful! 🎉
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            Your carbon credits have been reserved successfully
          </p>
        </motion.div>

        {/* Transaction details */}
        {txDetails && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full mt-5 bg-green-50 dark:bg-green-950/30 rounded-lg p-3 space-y-2 text-left"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Leaf className="h-4 w-4 text-green-600 shrink-0" />
              Transaction Details
            </div>
            {txDetails.transactionHash && (
              <div className="text-xs">
                <p className="text-muted-foreground">Transaction ID</p>
                <p className="font-mono font-medium break-all">{txDetails.transactionHash}</p>
              </div>
            )}
            {txDetails.listingTitle && (
              <div className="flex justify-between gap-2 text-sm">
                <span className="text-muted-foreground shrink-0">Project</span>
                <span className="font-medium text-right truncate">{txDetails.listingTitle}</span>
              </div>
            )}
            {txDetails.quantity && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Credits</span>
                <span className="font-medium">{txDetails.quantity.toLocaleString()}</span>
              </div>
            )}
            {txDetails.totalAmount && (
              <div className="flex justify-between text-sm pt-2 border-t border-green-200 dark:border-green-800">
                <span className="font-semibold">Total Paid</span>
                <span className="font-bold text-green-700 dark:text-green-500">
                  ₹{txDetails.totalAmount.toLocaleString()}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full flex gap-3 mt-5"
        >
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Back to Market
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={onViewReceipt}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Receipt
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-muted-foreground mt-4"
        >
          A confirmation email has been sent to your registered email address
        </motion.p>
      </div>
    </DialogContent>
  </Dialog>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const TransactionPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const pricePerCredit = Number(searchParams.get("price")) || 0;
  const title = searchParams.get("title");
  const maxQuantity = Number(searchParams.get("maxQuantity")) || 1;
  const successTransactionId = searchParams.get("transactionId");
  const isSuccess = searchParams.get("success") === "true";
  const isCanceled = searchParams.get("canceled") === "true";

  const navigate = useNavigate();
  const minQuantity = pricePerCredit > 0 ? Math.ceil(50 / pricePerCredit) : 1;
  const [quantity, setQuantity] = useState(() =>
    pricePerCredit > 0 ? Math.ceil(50 / pricePerCredit) : 1
  );
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [txDetails, setTxDetails] = useState(null);
  const [polling, setPolling] = useState(false);

  const totalPrice = pricePerCredit * quantity;

  // Poll until the server marks the transaction as completed
  const pollTransaction = useCallback(async (txId) => {
    setPolling(true);
    const maxAttempts = 12; // 12 × 2.5s = 30s max
    let attempts = 0;

    const check = async () => {
      try {
        const res = await api.get(`/credits/transaction/${txId}`);
        const tx = res.data?.data;

        if (tx?.paymentStatus === "completed") {
          setTxDetails({
            transactionHash: tx.transactionHash,
            listingTitle: tx.listing?.title,
            quantity: tx.quantity,
            totalAmount: tx.totalAmount,
            transactionId: tx._id,
          });
          setPolling(false);
          setShowSuccessDialog(true);
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
      } catch (err) {
        console.error("Poll error:", err);
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(check, 2500);
      } else {
        // Confirmation may be delayed — still show success with basic info
        setPolling(false);
        setTxDetails(null);
        setShowSuccessDialog(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    check();
  }, []);

  useEffect(() => {
    if (isSuccess && successTransactionId) {
      pollTransaction(successTransactionId);
    }
    if (isCanceled) {
      toast.error("Payment was canceled.");
    }
  }, []);

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please log in to complete your purchase.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/credits/create-checkout-session", {
        listingId: id,
        quantity: Number(quantity),
      });
      const d = res.data?.data;
      if (!d?.orderId || !d?.keyId) {
        throw new Error("No Razorpay order received from server");
      }
      const RazorpayCtor = await loadRazorpayScript();
      const qp = new URLSearchParams({
        id: id || "",
        price: String(pricePerCredit),
        title: title || "",
        maxQuantity: String(maxQuantity),
      });
      const rzp = new RazorpayCtor({
        key: d.keyId,
        amount: d.amount,
        currency: d.currency || "INR",
        order_id: d.orderId,
        name: "Carbonix",
        description: d.listingTitle || title || "Carbon credits",
        prefill: user?.email ? { email: user.email } : {},
        theme: { color: "#0f766e" },
        handler(response) {
          void (async () => {
            try {
              await api.post("/credits/verify-razorpay-payment", {
                transactionId: d.transactionId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              navigate(`/payment?success=true&transactionId=${d.transactionId}&${qp.toString()}`);
            } catch (err) {
              toast.error(err.response?.data?.message || "Payment verification failed.");
            } finally {
              setLoading(false);
            }
          })();
        },
        modal: {
          ondismiss() {
            setLoading(false);
          },
        },
      });
      rzp.on("payment.failed", (response) => {
        toast.error(response?.error?.description || "Payment failed.");
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Payment failed. Please try again."
      );
      setLoading(false);
    }
  };

  // While polling after Razorpay checkout, show a loading state
  if (polling) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-green-400 rounded-full"
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <Loader2 className="h-16 w-16 text-green-600 animate-spin" />
          </div>
          <p className="text-xl font-semibold text-foreground">Confirming your payment...</p>
          <p className="text-sm text-muted-foreground">Please wait while we verify your transaction</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pt-24 lg:pt-28">
      <Toaster position="top-center" richColors />

      {/* Success Dialog */}
      <CreditPaymentSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          navigate("/marketplace");
        }}
        txDetails={txDetails}
        onViewReceipt={() => {
          setShowSuccessDialog(false);
          if (txDetails?.transactionId) {
            navigate(`/receipt/${txDetails.transactionId}`);
          } else if (successTransactionId) {
            navigate(`/receipt/${successTransactionId}`);
          }
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-brandMainColor/15 via-transparent to-transparent dark:from-brandSubColor/20" />
      <div className="absolute left-12 top-24 hidden h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-300/10 lg:block" />
      <div className="absolute right-24 bottom-16 hidden h-64 w-64 rounded-full bg-lime-300/20 blur-3xl dark:bg-lime-200/10 lg:block" />

      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16 lg:flex-row lg:px-0">
        {/* Left: Payment */}
        <section className="flex-1 space-y-6">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary dark:text-primary-foreground">
              <ShieldCheck className="h-4 w-4" /> Secure checkout via Razorpay
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Finalize your carbon credit purchase
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Complete payment to reserve credits from{" "}
              <span className="font-medium text-foreground">{title}</span>. A
              retirement certificate and transaction summary will be available
              instantly after confirmation.
            </p>
          </div>

          <Card className="border border-border/70 bg-card/90 shadow-2xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment via Razorpay
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Razorpay&apos;s secure window opens here — cards, UPI, netbanking, and wallets (test mode when using test keys).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
                <p>✓ Supports all major credit &amp; debit cards</p>
                <p>✓ UPI, net banking, and wallets available at checkout</p>
                <p>✓ 256-bit SSL encrypted &amp; PCI-DSS compliant</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                className="h-12 w-full rounded-xl bg-brandMainColor text-sm font-semibold text-white hover:bg-brandMainColor/90 dark:bg-brandSubColor dark:text-slate-950 dark:hover:bg-brandSubColor/90"
                onClick={handlePayment}
                disabled={loading || !id}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening Razorpay…
                  </span>
                ) : (
                  <>Pay ₹{totalPrice.toLocaleString()} with Razorpay</>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By paying, you acknowledge the purchase of verified carbon
                credits and agree to Carbonix&apos;s terms.
              </p>
            </CardFooter>
          </Card>
        </section>

        {/* Right: Order Summary */}
        <aside className="flex-1 space-y-6">
          <Card className="border border-border/70 bg-card/90 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                Order summary
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Review the project information, pricing, and quantity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Project
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {title || "Carbon credit listing"}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (credits)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={minQuantity}
                  max={maxQuantity}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.min(Math.max(minQuantity, Number(e.target.value)), maxQuantity))
                  }
                  className="text-lg font-semibold"
                />
                <p className="text-xs text-muted-foreground">
                  Min: {minQuantity} credit{minQuantity > 1 ? "s" : ""} (₹50 minimum) · Max: {maxQuantity.toLocaleString()}
                </p>
              </div>
              <div className="flex justify-between rounded-2xl border border-border/70 bg-background/80 p-4 text-sm">
                <span className="text-muted-foreground">Price per credit</span>
                <span className="font-semibold text-foreground">₹{pricePerCredit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between rounded-2xl border border-border/70 bg-background/80 p-4 text-sm">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-semibold text-foreground">{quantity.toLocaleString()} credits</span>
              </div>
              <div className="flex justify-between rounded-2xl border border-primary/30 bg-primary/10 p-4 text-lg font-bold">
                <span className="text-foreground">Total payable</span>
                <span className="text-foreground">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary dark:text-primary-foreground/90">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5" />
                  <p>
                    Secure receipt, project documents, and retirement certificate
                    will be emailed after payment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/70 bg-card/90 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Need help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Reach out to payments@example.com or your account manager for
                assisted procurement or invoicing requests.
              </p>
              <p>
                Refunds follow registry and project-specific terms. Credits are
                retired upon payment confirmation.
              </p>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
};

export default TransactionPage;
