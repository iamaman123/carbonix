import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "@/services/authService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Mail, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await forgotPassword(email);
      setSuccess(true);
      toast.success("Reset instructions sent to your email!");
      
      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 2000);
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Failed to process your request. Please try again.");
      toast.error("Error sending reset instructions");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent dark:from-emerald-500/20" />
        <div className="absolute -left-16 top-32 hidden h-80 w-80 rounded-full bg-brandMainColor/20 blur-3xl dark:bg-brandSubColor/15 lg:block" />
        <div className="absolute right-12 top-10 h-32 w-32 rounded-full bg-lime-400/20 blur-3xl dark:bg-lime-300/10" />

        <div className="relative mx-auto flex min-h-screen max-w-2xl items-center px-6">
          <Card className="w-full border border-border/70 bg-card/90 shadow-2xl backdrop-blur-sm">
            <CardHeader className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                Check your email
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                We've sent password reset instructions to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                <p>If you don't see the email in a few minutes, check your spam folder.</p>
              </div>

              <div className="space-y-3 text-center text-sm">
                <p className="text-muted-foreground">
                  Once you receive the OTP, click the button below to reset your password.
                </p>
                <Button
                  onClick={() => navigate("/reset-password", { state: { email } })}
                  className="w-full h-12 rounded-xl bg-brandMainColor text-sm font-semibold text-white transition-colors hover:bg-brandMainColor/90 dark:bg-brandSubColor dark:text-slate-950 dark:hover:bg-brandSubColor/90"
                >
                  Go to Reset Password <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-medium text-brandMainColor transition-colors hover:text-brandMainColor/80 dark:text-brandSubColor dark:hover:text-brandSubColor/90"
                >
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent dark:from-emerald-500/20" />
      <div className="absolute -left-16 top-32 hidden h-80 w-80 rounded-full bg-brandMainColor/20 blur-3xl dark:bg-brandSubColor/15 lg:block" />
      <div className="absolute right-12 top-10 h-32 w-32 rounded-full bg-lime-400/20 blur-3xl dark:bg-lime-300/10" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16 lg:px-0">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary dark:text-primary-foreground">
              <CheckCircle className="h-4 w-4" />
              Account recovery
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Reset your password
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Forgot your password? No problem. Enter your email address and we'll send you a code to reset it.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-foreground">Enter your email</p>
                  <p>We'll send a verification code to your inbox</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-foreground">Verify the code</p>
                  <p>Enter the code you receive via email</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground">Create new password</p>
                  <p>Set a strong password for your account</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="border border-border/70 bg-card/90 shadow-2xl backdrop-blur-sm">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-semibold text-foreground">
                Forgot Password?
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Enter your email to receive a password reset code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    type="email"
                    className="h-12 rounded-xl border-border bg-background/[0.85] pl-11 text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="h-12 w-full rounded-xl bg-brandMainColor text-sm font-semibold text-white transition-colors hover:bg-brandMainColor/90 dark:bg-brandSubColor dark:text-slate-950 dark:hover:bg-brandSubColor/90"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    "Send Reset Code"
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-medium text-brandMainColor transition-colors hover:text-brandMainColor/80 dark:text-brandSubColor dark:hover:text-brandSubColor/90"
                >
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
