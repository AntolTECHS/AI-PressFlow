// src/pages/JournalistDashboard.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { PlusCircle, Pencil, CheckCircle, XCircle } from "lucide-react";

function JournalistDashboard() {
  const { token } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "",
    tags: "",
  });
  const [error, setError] = useState("");

  const fetchArticles = async () => {
    try {
      const res = await axios.get("/api/articles/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("/api/articles", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ title: "", summary: "", content: "", category: "", tags: "" });
      setFormOpen(false);
      fetchArticles();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to submit article");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Articles</h1>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{formOpen ? "Close Form" : "New Article"}</span>
          </button>
        </div>

        {formOpen && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 space-y-4">
            {error && <div className="text-red-600">{error}</div>}
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
              Submit
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-600">You have no articles yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((a) => (
              <div key={a._id} className="bg-white p-4 rounded-lg shadow flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{a.title}</h2>
                  <p className="text-gray-600 text-sm">Status: {a.status}</p>
                  <p className="text-gray-700 mt-2 line-clamp-3">{a.summary}</p>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
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
