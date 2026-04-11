import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/constants/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ClipboardList } from "lucide-react";

const AdminProducerRequests = () => {
  const { token, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/producer-requests`, {
        params: { status: "pending", limit: 50 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows(res.data.data || []);
    } catch {
      toast({ title: "Error", description: "Failed to load requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [token, user]);

  const review = async (id, action) => {
    setBusyId(id);
    try {
      await axios.patch(
        `${API_BASE_URL}/admin/producer-requests/${id}`,
        { action, adminNote: note[id] || "" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast({
        title: action === "approve" ? "Approved" : "Rejected",
        description:
          action === "approve"
            ? "User is now a producer."
            : "Request marked as rejected.",
      });
      setRows((prev) => prev.filter((r) => r._id !== id));
    } catch (e) {
      toast({
        title: "Error",
        description: e.response?.data?.message || "Action failed",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <p className="text-muted-foreground">Admin only</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 lg:pt-28">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/admin" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Admin home
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardList className="h-6 w-6" />
              Producer requests
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Approve to grant <Badge variant="outline">PRODUCER</Badge> role (sell listings).
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : rows.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No pending requests.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r._id}>
                        <TableCell className="font-medium">
                          {r.userId?.email || "—"}
                          <div className="text-xs text-muted-foreground">{r.userId?.name}</div>
                        </TableCell>
                        <TableCell>{r.company || "—"}</TableCell>
                        <TableCell>{r.phone || "—"}</TableCell>
                        <TableCell className="max-w-xs truncate">{r.message || "—"}</TableCell>
                        <TableCell className="text-right space-y-2">
                          <Textarea
                            placeholder="Optional note (internal)"
                            className="min-h-[60px] text-sm"
                            value={note[r._id] || ""}
                            onChange={(e) => setNote((n) => ({ ...n, [r._id]: e.target.value }))}
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === r._id}
                              onClick={() => review(r._id, "reject")}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              disabled={busyId === r._id}
                              onClick={() => review(r._id, "approve")}
                            >
                              {busyId === r._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Approve"
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProducerRequests;
