// src/pages/Editor/EditorDashboard.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { articlesAPI } from "../../services/api";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function EditorDashboard() {
  const { token } = useAuth();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [notes, setNotes] = useState({});
  const [message, setMessage] = useState("");

  const fetchPending = async () => {
    try {
      const res = await articlesAPI.getPending(token);
      setArticles(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load pending articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    setMessage("");

    try {
      await articlesAPI.approve(id, { editorNotes: notes[id] || "" }, token);
      setMessage("Article approved successfully.");
      fetchPending();
    } catch (err) {
      console.error(err);
      setMessage("Approval failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    setMessage("");

    try {
      await articlesAPI.reject(id, { editorNotes: notes[id] || "" }, token);
      setMessage("Article rejected.");
      fetchPending();
    } catch (err) {
      console.error(err);
      setMessage("Rejection failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleNoteChange = (id, value) => {
    setNotes({ ...notes, [id]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Pending Articles</h1>

        {message && (
          <div className="p-3 mb-4 bg-blue-100 text-blue-800 rounded">
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-600">No pending articles.</div>
        ) : (
          <div className="space-y-4">
            {articles.map((a) => (
              <div key={a._id} className="bg-white p-5 rounded-lg shadow">

                <h2 className="text-xl font-semibold">{a.title}</h2>
                <p className="text-gray-600 text-sm">
                  By: {a.author?.name || a.authorName || "Unknown"}
                </p>

                {a.summary && (
                  <p className="text-gray-700 mt-3 line-clamp-3">{a.summary}</p>
                )}

                {!a.summary && a.content && (
                  <p className="text-gray-700 mt-3 line-clamp-3">
                    {a.content.substring(0, 200)}...
                  </p>
                )}

                {/* Editor Notes */}
                <textarea
                  placeholder="Editor notes..."
                  value={notes[a._id] || ""}
                  onChange={(e) => handleNoteChange(a._id, e.target.value)}
                  className="w-full border mt-3 p-2 rounded focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />

                {/* Action Buttons */}
                <div className="mt-3 flex space-x-3">
                  <button
                    onClick={() => handleApprove(a._id)}
                    disabled={actionLoading === a._id}
                    className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === a._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => handleReject(a._id)}
                    disabled={actionLoading === a._id}
                    className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === a._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span>Reject</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EditorDashboard;
