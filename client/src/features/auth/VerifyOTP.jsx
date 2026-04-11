import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOTP } from "@/services/authService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.email) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No email provided. Please restart the process.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleVerify = async () => {
    setLoading(true);
    setError("");

    try {
      await verifyOTP(state.email, otp);
      toast({
        title: "OTP Verified",
        description: "Your account has been successfully verified! You can now log in.",
        variant: "default",
      });
      navigate("/login");
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg my-8">
      <h1 className="text-2xl font-bold text-center text-brandMainColor mb-2">OTP Verification</h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
        Enter the OTP sent to <span className="font-medium">{state.email}</span>
      </p>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* OTP Input */}
        <Input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          type="text"
          maxLength={6}
          className="text-center tracking-widest text-lg"
          required
        />

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={loading}
          className="w-full flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : "Verify OTP"}
        </Button>
      </div>
    </div>
  );
};

export default VerifyOTP;
