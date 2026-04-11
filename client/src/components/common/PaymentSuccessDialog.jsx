import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, X } from "lucide-react";
import { motion } from "motion/react";

const PaymentSuccessDialog = ({ isOpen, onClose, orderDetails }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" hideClose>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col items-center justify-center py-6 px-4">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-green-400 rounded-full"
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              />
              <CheckCircle2 className="h-24 w-24 text-green-600 dark:text-green-500" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-6"
          >
            <DialogTitle className="text-2xl font-bold text-green-700 dark:text-green-500 mb-2">
              Payment Successful! 🎉
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Your order has been placed successfully
            </DialogDescription>
          </motion.div>

          {/* Order Details */}
          {orderDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full mt-6 bg-green-50 dark:bg-green-950/30 rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-green-600" />
                <span className="font-medium">Order Details</span>
              </div>
              {orderDetails.orderHash && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono font-medium">
                    {orderDetails.orderHash}
                  </span>
                </div>
              )}
              {orderDetails.productName && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Product:</span>
                  <span className="font-medium">
                    {orderDetails.productName}
                  </span>
                </div>
              )}
              {orderDetails.quantity && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{orderDetails.quantity}</span>
                </div>
              )}
              {orderDetails.totalAmount && (
                <div className="flex justify-between text-sm pt-2 border-t border-green-200 dark:border-green-800">
                  <span className="font-semibold">Total Paid:</span>
                  <span className="font-bold text-green-700 dark:text-green-500">
                    ₹{orderDetails.totalAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full flex gap-3 mt-6"
          >
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Continue Shopping
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                window.location.href = "/eco-marketplace";
              }}
            >
              <Package className="h-4 w-4 mr-2" />
              View Orders
            </Button>
          </motion.div>

          {/* Additional Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-muted-foreground text-center mt-4"
          >
            A confirmation email has been sent to your registered email address
          </motion.p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccessDialog;
