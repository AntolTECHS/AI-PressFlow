import { useState, useEffect } from 'react';
import { editorAPI } from '../services/api';
import { Check, X, Edit, AlertCircle } from 'lucide-react';

function EditorDashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchStagedArticles();
  }, []);

  const fetchStagedArticles = async () => {
    try {
      const response = await editorAPI.getStagedArticles();
      setArticles(response.data);
    } catch (err) {
      setError('Failed to load staged articles.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await editorAPI.approveArticle(id);
      setArticles(articles.filter(article => article.id !== id));
    } catch (err) {
      alert('Failed to approve article.');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await editorAPI.rejectArticle(id);
      setArticles(articles.filter(article => article.id !== id));
    } catch (err) {
      alert('Failed to reject article.');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (id) => {
    console.log('Edit article:', id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading editor dashboard...</div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Editor Dashboard</h1>

        {articles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">No staged articles to review.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{article.summary}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>Category: <span className="font-medium">{article.category}</span></span>
                      <span>Source: <span className="font-medium">{article.source}</span></span>
                      <span>Status: <span className="font-medium">{article.status}</span></span>
                      <span>Submitted: {new Date(article.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(article.id)}
                      disabled={actionLoading === article.id}
                      className="flex items-center space-x-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleApprove(article.id)}
                      disabled={actionLoading === article.id}
                      className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(article.id)}
                      disabled={actionLoading === article.id}
                      className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
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
