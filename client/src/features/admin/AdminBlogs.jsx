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
  BookOpen,
  Eye,
  FileText,
  ArrowLeft,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogStats,
} from "@/services/blogService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const emptyForm = {
  title: "",
  slug: "",
  category: "",
  readTime: "5 min read",
  publishedOn: new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  tags: "",
  excerpt: "",
  content: "",
  imageUrl: "",
  status: "published",
};

const AdminBlogs = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [imageSource, setImageSource] = useState("url"); // "url" or "upload"
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAll();
    }
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [blogsRes, statsRes] = await Promise.all([
        getAllBlogs({ limit: 100, status: "" }),
        getBlogStats(),
      ]);
      setBlogs(blogsRes.data || []);
      setStats(statsRes.data || null);
    } catch (error) {
      console.error("Error fetching blog admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load blogs data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingBlog(null);
    setFormData(emptyForm);
    setImageSource("url");
    setSelectedImage(null);
    setFormOpen(true);
  };

  const openEditForm = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      category: blog.category,
      readTime: blog.readTime,
      publishedOn: blog.publishedOn,
      tags: (blog.tags || []).join(", "),
      excerpt: blog.excerpt,
      content: blog.content || "",
      imageUrl: blog.imageUrl || "",
      status: blog.status,
    });
    setImageSource("url");
    setSelectedImage(null);
    setFormOpen(true);
  };

  const handleImageUpload = (file) => {
    setSelectedImage(file);
    if (file) {
      // Create a temporary URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        slug:
          formData.slug ||
          formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        category: formData.category,
        readTime: formData.readTime,
        publishedOn: formData.publishedOn,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        excerpt: formData.excerpt,
        content: formData.content,
        imageUrl: formData.imageUrl,
        status: formData.status,
      };

      if (editingBlog) {
        await updateBlog(editingBlog._id, payload);
        toast({
          title: "Success",
          description: "Blog updated successfully",
        });
      } else {
        await createBlog(payload);
        toast({
          title: "Success",
          description: "Blog created successfully",
        });
      }

      setFormOpen(false);
      setFormData(emptyForm);
      setImageSource("url");
      setSelectedImage(null);
      setEditingBlog(null);
      fetchAll();
    } catch (error) {
      console.error("Error saving blog:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save blog",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await deleteBlog(id);
      toast({ title: "Deleted", description: "Blog deleted successfully" });
      fetchAll();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brandMainColor" />
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
                <BookOpen className="h-7 w-7 text-brandMainColor" />
                Blog Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Create, edit, and manage blog posts
              </p>
            </div>
          </div>
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreateForm}
                className="bg-brandMainColor hover:bg-brandMainColor/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Blog
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                {/* Basic Info */}
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    placeholder="Understanding the Carbon Credit Market"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="Auto-generated from title"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to auto-generate
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                      placeholder="Market Trends, Tutorial, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="readTime">Read Time</Label>
                    <Input
                      id="readTime"
                      value={formData.readTime}
                      onChange={(e) =>
                        setFormData({ ...formData, readTime: e.target.value })
                      }
                      placeholder="5 min read"
                    />
                  </div>
                  <div>
                    <Label htmlFor="publishedOn">Published Date *</Label>
                    <Input
                      id="publishedOn"
                      value={formData.publishedOn}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          publishedOn: e.target.value,
                        })
                      }
                      required
                      placeholder="Feb 19, 2026"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="Carbon Credits, Marketplace, ESG"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    required
                    rows={2}
                    placeholder="Brief description for blog listing (1-2 sentences)"
                  />
                </div>

                {/* Image Section */}
                <div className="border rounded-lg p-4 space-y-3">
                  <Label className="text-base font-semibold">Blog Image</Label>
                  <Tabs value={imageSource} onValueChange={setImageSource}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Image URL
                      </TabsTrigger>
                      <TabsTrigger value="upload">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Upload Image
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="space-y-2">
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, imageUrl: e.target.value })
                        }
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter a direct URL to an image
                      </p>
                    </TabsContent>
                    <TabsContent value="upload" className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files?.[0])}
                      />
                      <p className="text-xs text-muted-foreground">
                        Note: Image will be converted to base64. For better
                        performance, use Image URL.
                      </p>
                    </TabsContent>
                  </Tabs>
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-2">
                        Preview:
                      </p>
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded-lg border"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    required
                    rows={12}
                    placeholder="Write your blog content here... You can use paragraphs and bullet points.

Example:
This is the first paragraph with important information.

This is the second paragraph.

• Bullet point 1
• Bullet point 2
• Bullet point 3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tip: Use bullet points with • or - at the start of a line
                  </p>
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) =>
                      setFormData({ ...formData, status: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-brandMainColor hover:bg-brandMainColor/90"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>{editingBlog ? "Update Blog" : "Create Blog"}</>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Blogs
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBlogs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.publishedBlogs}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.draftBlogs}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Views
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Blogs Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {blogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No blogs found. Create your first blog post!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog) => (
                    <TableRow key={blog._id}>
                      <TableCell className="font-medium max-w-xs">
                        <div className="flex flex-col">
                          <span className="truncate">{blog.title}</span>
                          <span className="text-xs text-muted-foreground">
                            /{blog.slug}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{blog.category}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            blog.status === "published"
                              ? "default"
                              : blog.status === "draft"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {blog.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {blog.views}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {blog.publishedOn}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditForm(blog)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(blog._id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBlogs;
