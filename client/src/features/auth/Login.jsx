import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import auth from "/auth.jpg";
import { toast } from "sonner";
import { absoluteApiUrl } from "@/constants/api";
import { GOOGLE_AUTH_MESSAGE_TYPE } from "@/constants/oauth";

const POPUP_FEATURES =
  "width=520,height=680,scrollbars=yes,resizable=yes,left=80,top=40";

const Login = () => {
  const [role, setRole] = useState("CONSUMER");
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const googleAuthUrl = useMemo(
    () => absoluteApiUrl(`/auth/google?role=${encodeURIComponent(role)}`),
    [role],
  );

  useEffect(() => {
    const err = searchParams.get("error");
    const reason = searchParams.get("reason");
    if (err === "google_auth_failed") {
      const detail =
        reason === "redirect_uri_mismatch"
          ? "Redirect URI mismatch — on your API host set GOOGLE_CALLBACK_URL to https://YOUR-API-HOST/api/auth/google/callback and add that exact URL in Google Cloud → Credentials → redirect URIs."
          : reason
            ? `Google error: ${reason}`
            : "Please try again.";
      toast.error(`Google sign-in failed. ${detail}`);
    }
    if (err === "google_not_configured") {
      toast.error(
        "Google OAuth is not configured on the server (missing GOOGLE_CLIENT_ID / SECRET).",
      );
    }
  }, [searchParams]);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== GOOGLE_AUTH_MESSAGE_TYPE) return;
      const { token, user } = event.data.payload || {};
      if (!token || !user?.role) return;

      localStorage.setItem("authToken", token);
      setUser(user);
      toast.success(`Welcome, ${user.name || user.email}!`);

      const r = user.role;
      if (r === "PRODUCER") navigate("/dashboard/producer");
      else if (r === "CONSUMER") navigate("/dashboard/consumer");
      else if (r === "BOTH") navigate("/dashboard");
      else if (r === "admin") navigate("/admin");
      else navigate("/");
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate, setUser]);

  const openGooglePopup = () => {
    const popup = window.open(googleAuthUrl, "carbonixGoogleOAuth", POPUP_FEATURES);
    if (!popup || popup.closed) {
      toast.error("Popup was blocked. Allow popups for this site, or try again.");
      return;
    }
    popup.focus();
  };

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
              Sign in with Google
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Welcome to Carbonix
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              A small window opens for Google — you pick your account there. This page
              stays open. New accounts choose producer or consumer once before
              continuing.
            </p>
            <div className="grid max-w-xl gap-4 sm:grid-cols-2">
              {[
                "Unified emissions dashboard",
                "Procurement-ready reports",
                "Real-time project diligence",
                "Collaborative task flows",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-muted-foreground"
                >
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 text-sm text-muted-foreground">
              <img
                src={auth}
                alt="Carbonix platform"
                className="h-12 w-12 rounded-full object-cover"
              />
              <p>
                Email and password sign-in is turned off — Google only, for a
                simpler and safer login.
              </p>
            </div>
          </div>

          <Card className="border border-border/70 bg-card/90 shadow-2xl backdrop-blur-sm">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-semibold text-foreground">
                Sign in
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Pick your role, then continue with Google. If you already have an
                account, your existing role is kept.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">
                  I am signing up / in as
                </Label>
                <RadioGroup
                  value={role}
                  onValueChange={setRole}
                  className="grid gap-3"
                >
                  <label
                    htmlFor="role-consumer"
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      role === "CONSUMER"
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:border-border"
                    }`}
                  >
                    <RadioGroupItem value="CONSUMER" id="role-consumer" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">Consumer</p>
                      <p className="text-xs text-muted-foreground">
                        Buy energy on the marketplace
                      </p>
                    </div>
                  </label>
                  <label
                    htmlFor="role-producer"
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      role === "PRODUCER"
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:border-border"
                    }`}
                  >
                    <RadioGroupItem value="PRODUCER" id="role-producer" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">Producer</p>
                      <p className="text-xs text-muted-foreground">
                        List and sell surplus energy
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              <Button
                type="button"
                className="h-12 w-full rounded-xl bg-background text-sm font-semibold text-foreground transition-all hover:bg-muted/50 hover:shadow-sm border border-border"
                onClick={openGooglePopup}
              >
                <svg
                  className="mr-3 h-5 w-5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>

              <p className="text-center text-xs text-muted-foreground leading-relaxed">
                First time? We create your account after Google approves. Returning
                users sign in with the same Google account; your dashboard role does
                not change based on this choice.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
