// src/pages/JournalistDashboard.jsx
import { useState, useEffect } from "react";
import { articlesAPI } from "../../services/api";
import { PlusCircle, Pencil, CheckCircle, XCircle } from "lucide-react";

function JournalistDashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "",
    tags: "",
  });

  // Fetch journalist's articles
  const fetchArticles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await articlesAPI.getMine();
      // Ensure it's always an array
      const data = Array.isArray(res.data) ? res.data : res.data.articles ?? [];
      setArticles(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load your articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Reset form
  const resetForm = () => {
    setEditingArticle(null);
    setFormData({ title: "", summary: "", content: "", category: "", tags: "" });
    setFormOpen(false);
    setSuccess("");
    setError("");
  };

  // Submit or update article
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      ...formData,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (editingArticle) {
        // UPDATE
        await articlesAPI.updateArticle(editingArticle._id, payload);
        setSuccess("Article updated successfully!");
      } else {
        // CREATE
        await articlesAPI.create(payload); // Make sure you add `create` in articlesAPI
        setSuccess("Article submitted!");
      }
      resetForm();
      fetchArticles();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save article.");
    }
  };

  const startEditing = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      summary: article.summary || "",
      content: article.content || "",
      category: article.category || "",
      tags: article.tags?.join(", ") || "",
    });
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Articles</h1>
          <button
            onClick={() => {
              if (formOpen && editingArticle) resetForm();
              setFormOpen(!formOpen);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{formOpen ? "Close Form" : "New Article"}</span>
          </button>
        </div>

        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow mb-8 space-y-4"
          >
            <h2 className="text-xl font-semibold mb-2">
              {editingArticle ? "Edit Article" : "Create Article"}
            </h2>

            {error && <div className="text-red-600">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}

            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Title"
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
              required
            />

            <input
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              placeholder="Summary"
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Content"
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
              rows={6}
              required
            />

            <input
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="Category"
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            />

            <input
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Tags (comma separated)"
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              {editingArticle ? "Update Article" : "Submit Article"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-600">
            You have no articles yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((a) => (
              <div
                key={a._id}
                className="bg-white p-4 rounded-lg shadow flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold">{a.title}</h2>
                  <p className="text-gray-600 text-sm">Status: {a.status}</p>

                  {a.status === "rejected" && a.rejectionReason && (
                    <p className="text-red-600 text-sm mt-1">
                      Reason: {a.rejectionReason}
                    </p>
                  )}

                  <p className="text-gray-700 mt-2 line-clamp-3">
                    {a.summary}
                  </p>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => startEditing(a)}
                    className="flex items-center space-x-1 text-blue-600 hover:underline"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Edit</span>
                  </button>

                  {a.status === "approved" && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {a.status === "rejected" && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JournalistDashboard;
