// src/pages/EditorDashboard.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react";

function EditorDashboard() {
  const { token } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({}); // store editor notes per article

  const fetchPending = async () => {
    try {
      const res = await axios.get("/api/articles/pending", {
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
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(
        `/api/articles/${id}/approve`,
        { editorNotes: notes[id] || "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPending();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(
        `/api/articles/${id}/reject`,
        { editorNotes: notes[id] || "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPending();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNoteChange = (id, value) => {
    setNotes({ ...notes, [id]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Pending Articles</h1>

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-600">No pending articles.</div>
        ) : (
          <div className="space-y-4">
            {articles.map((a) => (
              <div key={a._id} className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold">{a.title}</h2>
                <p className="text-gray-600 text-sm">By: {a.authorName}</p>
                <p className="text-gray-700 mt-2">{a.summary}</p>

                <textarea
                  placeholder="Editor notes..."
                  value={notes[a._id] || ""}
                  onChange={(e) => handleNoteChange(a._id, e.target.value)}
                  className="w-full border mt-2 p-2 rounded focus:ring-2 focus:ring-blue-500"
                />

                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleApprove(a._id)}
                    className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => handleReject(a._id)}
                    className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
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
