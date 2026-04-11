import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { getProfile } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Factory, ArrowLeft } from "lucide-react";

const RequestProducer = () => {
  const { setUser } = useAuth();
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/producer-requests/me");
        setExisting(data.data);
      } catch {
        setExisting(null);
      } finally {
        setLoadingMe(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (existing?.status !== "approved") return;
    getProfile()
      .then(({ data }) => {
        const u = data?.user;
        if (u) setUser(u);
      })
      .catch(() => {});
  }, [existing?.status, setUser]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/producer-requests", { company, phone, message });
      toast.success("Request submitted. An admin will review it.");
      const { data } = await api.get("/producer-requests/me");
      setExisting(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit request");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (s) => {
    if (s === "pending") return <Badge variant="secondary">Pending review</Badge>;
    if (s === "approved") return <Badge>Approved — you can list energy</Badge>;
    if (s === "rejected") return <Badge variant="destructive">Rejected</Badge>;
    return null;
  };

  return (
    <div className="min-h-screen bg-background pt-24 lg:pt-28">
      <div className="mx-auto max-w-lg px-4 py-10">
        <Button variant="ghost" asChild className="mb-6 -ml-2">
          <Link to="/dashboard/consumer" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>

        <Card className="border-border/60 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Factory className="h-6 w-6" />
              <CardTitle className="text-2xl">Request producer (seller) access</CardTitle>
            </div>
            <CardDescription>
              All new accounts are <strong>consumers</strong> (buyers). To sell surplus energy or
              credits, submit this form. An admin will approve your account as a producer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingMe ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : existing?.status === "pending" ? (
              <div className="space-y-2 rounded-xl border bg-muted/30 p-4">
                <p className="font-medium">Your request is waiting for admin review.</p>
                {statusBadge("pending")}
                <p className="text-sm text-muted-foreground">
                  You will need to sign out and back in after approval to refresh your permissions.
                </p>
              </div>
            ) : existing?.status === "approved" ? (
              <div className="space-y-3">
                {statusBadge("approved")}
                <Button asChild className="w-full">
                  <Link to="/dashboard/producer">Go to producer dashboard</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company / project name</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Solar Farm Co."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 …"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="msg">What will you sell? (optional)</Label>
                  <Textarea
                    id="msg"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Briefly describe your generation capacity, location, or credits."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit request"}
                </Button>
                {existing?.status === "rejected" && (
                  <p className="text-sm text-muted-foreground">
                    A previous request was rejected. You can submit again with updated details.
                  </p>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestProducer;
