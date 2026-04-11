import api from "@/lib/api";
import { API_ENDPOINTS } from "@/constants/api";

// ─── Public ──────────────────────────────────────────────
export const getAllBlogs = async (params = {}) => {
  const { data } = await api.get(API_ENDPOINTS.BLOGS.BASE, { params });
  return data;
};

export const getBlogBySlug = async (slug) => {
  const { data } = await api.get(API_ENDPOINTS.BLOGS.BY_SLUG(slug));
  return data;
};

// ─── Admin ───────────────────────────────────────────────
export const createBlog = async (blogData) => {
  const { data } = await api.post(API_ENDPOINTS.BLOGS.BASE, blogData);
  return data;
};

export const updateBlog = async (id, blogData) => {
  const { data } = await api.put(API_ENDPOINTS.BLOGS.BY_ID(id), blogData);
  return data;
};

export const deleteBlog = async (id) => {
  const { data } = await api.delete(API_ENDPOINTS.BLOGS.BY_ID(id));
  return data;
};

export const getBlogStats = async () => {
  const { data } = await api.get(API_ENDPOINTS.BLOGS.STATS);
  return data;
};
