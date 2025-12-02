import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const articlesAPI = {
  getAll: () => api.get('/articles'),
  getById: (id) => api.get(`/articles/${id}`),
};

export const editorAPI = {
  getStagedArticles: () => api.get('/editor/staged'),
  approveArticle: (id) => api.post(`/editor/approve/${id}`),
  rejectArticle: (id) => api.post(`/editor/reject/${id}`),
  updateArticle: (id, data) => api.put(`/editor/articles/${id}`, data),
};

export default api;
