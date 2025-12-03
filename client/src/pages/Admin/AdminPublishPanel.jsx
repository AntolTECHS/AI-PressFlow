// src/pages/AdminPublishPanel.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle, AlertCircle } from "lucide-react";

function AdminPublishPanel() {
  const { token } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch approved articles
  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/api/admin/articles/approved", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Publish article
  const handlePublish = async (id) => {
    try {
      await axios.put(
        `/api/admin/articles/${id}/publish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchArticles(); // refresh list after publishing
    } catch (err) {
      console.error(err);
      alert("Failed to publish article.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading approved articles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Publish Panel</h1>

        {articles.length === 0 ? (
          <p className="text-center text-gray-600">No approved articles to publish.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Author</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article._id} className="border-t">
                    <td className="px-4 py-2">{article.title}</td>
                    <td className="px-4 py-2">{article.authorName || "Auto-feed"}</td>
                    <td className="px-4 py-2">{article.category || "N/A"}</td>
                    <td className="px-4 py-2">
                      {article.status === "approved" ? (
                        <span className="text-green-600 font-medium flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" /> Approved
                        </span>
                      ) : (
                        article.status
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handlePublish(article._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Publish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPublishPanel;
