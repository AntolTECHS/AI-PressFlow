// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // must match your backend
});

// Automatically attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const articlesAPI = {
  getAll: () => api.get("/articles"),          // public published articles
  getById: (id) => api.get(`/articles/${id}`),
  getMine: () => api.get("/articles/mine"),   // logged-in journalist
  create: (data) => api.post("/articles", data),
  updateArticle: (id, data) => api.put(`/articles/${id}`, data),
  deleteArticle: (id) => api.delete(`/articles/${id}`),
};

export default api;
