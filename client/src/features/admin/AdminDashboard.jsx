import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  Search,
  Users,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Shield,
  AlertCircle,
  Leaf,
  BookOpen,
  ClipboardCheck,
} from "lucide-react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://carbonix-me-1.vercel.app/api";

  useEffect(() => {
    if (user?.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page",
        variant: "destructive",
      });
      return;
    }

    fetchDashboardData();
  }, [token, user, currentPage, searchTerm, roleFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, transactionsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/admin/users`, {
          params: {
            page: currentPage,
            limit: 10,
            search: searchTerm,
            role: roleFilter === "all" ? "" : roleFilter,
          },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/admin/transactions`, {
          params: { limit: 5 },
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setTotalPages(usersRes.data.pagination.totalPages);
      setTransactions(transactionsRes.data.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/admin/users/${userId}/status`,
        { isActive },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive } : u)),
      );

      toast({
        title: "Success",
        description: `User ${isActive ? "activated" : "deactivated"} successfully`,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/admin/users/${userId}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role } : u)),
      );

      toast({
        title: "Success",
        description: `User role updated to ${role}`,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to view this page. Admin access
              required.
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
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-7 w-7 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage users, monitor transactions, and oversee platform operations
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="border-b border-border/60 bg-card/40 px-8 py-6">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 w-24 rounded bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="border border-border/60 bg-card shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NumberTicker
                    value={stats.totalUsers}
                    className="text-3xl font-bold"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stats.verifiedUsers} verified
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border/60 bg-card shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <ShoppingBag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Active Listings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NumberTicker
                    value={stats.activeListings}
                    className="text-3xl font-bold"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    of {stats.totalListings} total
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border/60 bg-card shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NumberTicker
                    value={stats.totalTransactions}
                    className="text-3xl font-bold"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    completed
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border/60 bg-card shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NumberTicker
                    value={stats.totalRevenue}
                    className="text-3xl font-bold"
                    prefix="₹"
                    decimalPlaces={0}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    platform revenue
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-8 py-8">
        <Card className="border border-border/60 bg-card shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">
                  User Management
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage user accounts and permissions
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full sm:w-60"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="CONSUMER">Consumer</SelectItem>
                    <SelectItem value="PRODUCER">Producer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u._id}>
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>{u.name || "—"}</TableCell>
                        <TableCell>
                          <Select
                            value={u.role || "CONSUMER"}
                            onValueChange={(value) =>
                              updateUserRole(u._id, value)
                            }
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CONSUMER">Consumer</SelectItem>
                              <SelectItem value="PRODUCER">Producer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.isActive ? "default" : "destructive"}
                          >
                            {u.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.isVerified ? "outline" : "secondary"}
                          >
                            {u.isVerified ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={u.isActive ? "destructive" : "default"}
                            size="sm"
                            onClick={() => updateUserStatus(u._id, !u.isActive)}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Recent Transactions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest platform transactions
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Listing</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((txn) => (
                      <TableRow key={txn._id}>
                        <TableCell>{txn.buyer?.email || "—"}</TableCell>
                        <TableCell>{txn.seller?.email || "—"}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {txn.listing?.title || "—"}
                        </TableCell>
                        <TableCell>{txn.quantity}</TableCell>
                        <TableCell>
                          ₹{txn.totalAmount?.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              txn.paymentStatus === "completed"
                                ? "default"
                                : txn.paymentStatus === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {txn.paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default AdminDashboard;
