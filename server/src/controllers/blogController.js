import Blog from "../models/Blog.js";
import logger from "../utils/logger.js";

// Get all blogs (public)
export const getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      status = "published",
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    // Public endpoint only shows published blogs
    if (!req.user || req.user.role !== "admin") {
      query.status = "published";
    } else if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    logger.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
    });
  }
};

// Get single blog by slug (public)
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug }).populate("author", "name email");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Only show published blogs to non-admin users
    if (
      blog.status !== "published" &&
      (!req.user || req.user.role !== "admin")
    ) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    logger.error("Error fetching blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
    });
  }
};

// Create blog (admin only)
export const createBlog = async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      author: req.user.userId,
    };

    // Generate slug if not provided
    if (!blogData.slug) {
      blogData.slug = blogData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug: blogData.slug });
    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: "A blog with this slug already exists",
      });
    }

    const blog = new Blog(blogData);
    await blog.save();

    const populatedBlog = await Blog.findById(blog._id).populate(
      "author",
      "name email",
    );

    logger.info(`Blog created: ${blog.title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: populatedBlog,
      message: "Blog created successfully",
    });
  } catch (error) {
    logger.error("Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create blog",
      error: error.message,
    });
  }
};

// Update blog (admin only)
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If slug is being updated, check if it's unique
    if (updateData.slug) {
      const existingBlog = await Blog.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      });
      if (existingBlog) {
        return res.status(400).json({
          success: false,
          message: "A blog with this slug already exists",
        });
      }
    }

    const blog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("author", "name email");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    logger.info(`Blog updated: ${blog.title} by ${req.user.email}`);

    res.json({
      success: true,
      data: blog,
      message: "Blog updated successfully",
    });
  } catch (error) {
    logger.error("Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update blog",
      error: error.message,
    });
  }
};

// Delete blog (admin only)
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    logger.info(`Blog deleted: ${blog.title} by ${req.user.email}`);

    res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete blog",
    });
  }
};

// Get blog statistics (admin only)
export const getBlogStats = async (req, res) => {
  try {
    const [totalBlogs, publishedBlogs, draftBlogs, totalViews, categories] =
      await Promise.all([
        Blog.countDocuments(),
        Blog.countDocuments({ status: "published" }),
        Blog.countDocuments({ status: "draft" }),
        Blog.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
        Blog.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

    const viewsData = totalViews[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalViews: viewsData,
        categories: categories.map((cat) => ({
          name: cat._id,
          count: cat.count,
        })),
      },
    });
  } catch (error) {
    logger.error("Error fetching blog stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog statistics",
    });
  }
};
