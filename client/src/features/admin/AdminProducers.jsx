import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/constants/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Loader2, ArrowLeft, Users } from "lucide-react";

const AdminProducers = () => {
  const { token, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") return;
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/users`, {
          params: { role: "PRODUCER", limit: 100, page: 1 },
          headers: { Authorization: `Bearer ${token}` },
        });
        setRows(res.data.data || []);
      } catch {
        toast({ title: "Error", description: "Failed to load producers", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [token, user]);

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
              <Users className="h-6 w-6" />
              Producers (sellers)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Accounts with role <Badge variant="outline">PRODUCER</Badge> can create listings.
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No producers yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((u) => (
                      <TableRow key={u._id}>
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>{u.name || "—"}</TableCell>
                        <TableCell>{u.company || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={u.isActive ? "default" : "destructive"}>
                            {u.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProducers;
