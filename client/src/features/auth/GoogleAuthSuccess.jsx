import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GOOGLE_AUTH_MESSAGE_TYPE } from "@/constants/oauth";

/**
 * OAuth redirect lands here (same tab or popup).
 * URL: /auth/google/success?token=...&role=...
 */
const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error || !token) {
      toast.error("Google sign-in failed. Please try again.");
      if (window.opener) {
        window.close();
      } else {
        navigate("/login");
      }
      return;
    }

    const user = {
      id: searchParams.get("id"),
      name: searchParams.get("name"),
      email: searchParams.get("email"),
      role: searchParams.get("role"),
      avatar: searchParams.get("avatar"),
    };

    // Opened as popup: tell parent window and close (parent stays on /login)
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(
          {
            type: GOOGLE_AUTH_MESSAGE_TYPE,
            payload: { token, user },
          },
          window.location.origin,
        );
      } catch (e) {
        console.error("postMessage to opener failed:", e);
      }
      toast.success("Signed in. You can close this tab.");
      window.close();
      return;
    }

    // Same-tab flow
    localStorage.setItem("authToken", token);
    setUser(user);
    toast.success(`Welcome, ${user.name || user.email}!`);

    setTimeout(() => {
      const role = user.role;
      if (role === "PRODUCER") navigate("/dashboard/producer");
      else if (role === "CONSUMER") navigate("/dashboard/consumer");
      else if (role === "admin") navigate("/admin");
      else navigate("/");
    }, 400);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center px-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">Signing you in with Google…</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          If this opened in a small window, it should close on its own and you&apos;ll be signed
          in on the main tab. Otherwise you&apos;ll be redirected to your dashboard here.
        </p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;
