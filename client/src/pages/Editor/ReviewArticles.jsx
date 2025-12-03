// src/pages/ReviewArticles.jsx
import { useEffect, useState } from 'react';
import { articlesAPI } from "../../services/api";
import { Check, X, AlertCircle } from 'lucide-react';

function ReviewArticles() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await articlesAPI.getPending();
      setArticles(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load pending articles.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    await articlesAPI.approve(id);
    load();
  };

  const reject = async (id) => {
    await articlesAPI.reject(id);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6">Review Pending Articles</h1>

        {error && (
          <div className="flex items-center bg-red-100 text-red-700 p-4 mb-6 rounded-lg">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {articles.length === 0 ? (
          <p className="text-gray-600">No articles pending review.</p>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="p-6 bg-white rounded-xl shadow flex justify-between"
              >
                <div>
                  <h2 className="text-2xl font-semibold">{article.title}</h2>
                  <p className="text-gray-600 mt-1">Author: {article.authorName}</p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => approve(article.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded flex items-center space-x-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => reject(article.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded flex items-center space-x-2"
                  >
                    <X className="w-5 h-5" />
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

export default ReviewArticles;
