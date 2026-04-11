import React, { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Package,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  Leaf,
  Star,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  createEcoProduct,
  updateEcoProduct,
  deleteEcoProduct,
  getEcoProducts,
  getEcoStats,
  getEcoAdminOrders,
} from "@/services/ecoProductService";
import { ECO_PRODUCT_CATEGORIES } from "@/constants/api";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  imageUrl: "",
  ecoRating: "3",
  tags: "",
  specifications: "",
  carbonEmissionSaved: "",
};

const AdminEcoProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("products"); // products | orders

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAll();
    }
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [prodRes, statsRes, ordersRes] = await Promise.all([
        getEcoProducts({ limit: 100, status: "all" }),
        getEcoStats(),
        getEcoAdminOrders({ limit: 50 }),
      ]);
      setProducts(prodRes.data || []);
      setStats(statsRes.data || null);
      setOrders(ordersRes.data || []);
    } catch (error) {
      console.error("Error fetching eco product admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load eco products data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.imageUrl || "",
      ecoRating: String(product.ecoRating || 3),
      tags: (product.tags || []).join(", "),
      specifications: product.specifications || "",
      carbonEmissionSaved: product.carbonEmissionSaved != null ? String(product.carbonEmissionSaved) : "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        imageUrl: formData.imageUrl || "",
        ecoRating: Number(formData.ecoRating),
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        specifications: formData.specifications,
        carbonEmissionSaved: formData.carbonEmissionSaved !== "" ? Number(formData.carbonEmissionSaved) : undefined,
      };

      if (editingProduct) {
        await updateEcoProduct(editingProduct._id, payload);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await createEcoProduct(payload);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      setFormOpen(false);
      setFormData(emptyForm);
      setEditingProduct(null);
      fetchAll();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await deleteEcoProduct(id);
      toast({ title: "Deleted", description: "Product deleted successfully" });
      fetchAll();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 lg:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <Leaf className="h-7 w-7 text-green-600" />
                Eco Products Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Add and manage eco-friendly products for the marketplace
              </p>
            </div>
          </div>
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreateForm}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Eco Product"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="e.g. Portable Solar Panel 100W"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    required
                    rows={3}
                    placeholder="Describe the product..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(val) =>
                        setFormData({ ...formData, category: val })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {ECO_PRODUCT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ecoRating">Eco Rating (1-5)</Label>
                    <Select
                      value={formData.ecoRating}
                      onValueChange={(val) =>
                        setFormData({ ...formData, ecoRating: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((r) => (
                          <SelectItem key={r} value={String(r)}>
                            {"★".repeat(r)}
                            {"☆".repeat(5 - r)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      required
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="solar, portable, green"
                  />
                </div>
                <div>
                  <Label htmlFor="specifications">Specifications</Label>
                  <Textarea
                    id="specifications"
                    value={formData.specifications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specifications: e.target.value,
                      })
                    }
                    rows={2}
                    placeholder="Weight, dimensions, materials..."
                  />
                </div>
                <div>
                  <Label htmlFor="carbonEmissionSaved">
                    CO₂ Emission Prevented (grams per unit)
                  </Label>
                  <Input
                    id="carbonEmissionSaved"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.carbonEmissionSaved}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        carbonEmissionSaved: e.target.value,
                      })
                    }
                    placeholder="e.g. 250"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Estimated grams of CO₂ prevented per unit purchased
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeProducts} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{stats.totalRevenue?.toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Top Product
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold truncate">
                  {stats.topProducts?.[0]?.name || "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.topProducts?.[0]?.totalSold || 0} sold
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "products" ? "default" : "outline"}
            onClick={() => setActiveTab("products")}
            className={
              activeTab === "products"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : ""
            }
          >
            <Package className="h-4 w-4 mr-2" /> Products ({products.length})
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "outline"}
            onClick={() => setActiveTab("orders")}
            className={
              activeTab === "orders"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : ""
            }
          >
            <ShoppingBag className="h-4 w-4 mr-2" /> Orders ({orders.length})
          </Button>
        </div>

        {/* Products Table */}
        {activeTab === "products" && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Eco Rating</TableHead>
                      <TableHead>CO₂ Prevented</TableHead>
                      <TableHead>Sold</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No products yet. Click "Add Product" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                  <Leaf className="h-5 w-5 text-green-600" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-sm">
                                  {product.name}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category}</Badge>
                          </TableCell>
                          <TableCell>
                            ₹{product.price?.toLocaleString()}
                          </TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <span className="text-yellow-500">
                              {"★".repeat(product.ecoRating || 0)}
                              {"☆".repeat(5 - (product.ecoRating || 0))}
                            </span>
                          </TableCell>
                          <TableCell>
                            {product.carbonEmissionSaved != null ? (
                              <span className="text-green-700 dark:text-green-400 font-medium text-sm">
                                {product.carbonEmissionSaved} g
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell>{product.totalSold}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.status === "Active"
                                  ? "default"
                                  : product.status === "OutOfStock"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className={
                                product.status === "Active"
                                  ? "bg-green-600"
                                  : ""
                              }
                            >
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditForm(product)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(product._id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders Table */}
        {activeTab === "orders" && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No orders yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-mono text-xs">
                            {order.orderHash || order._id.slice(-8)}
                          </TableCell>
                          <TableCell>
                            {order.product?.name || "Deleted product"}
                          </TableCell>
                          <TableCell>
                            {order.buyer?.email || "Unknown"}
                          </TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>
                            ₹{order.totalAmount?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.paymentStatus === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                order.paymentStatus === "completed"
                                  ? "bg-green-600"
                                  : ""
                              }
                            >
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminEcoProducts;
