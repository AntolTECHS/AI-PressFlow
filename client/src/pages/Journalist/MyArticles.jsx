// src/pages/MyArticles.jsx
import { useEffect, useState } from 'react';
import { articlesAPI } from "../../services/api";
import { AlertCircle } from 'lucide-react';

function MyArticles() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await articlesAPI.getMine();
        setArticles(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load your articles.');
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6">My Articles</h1>

        {error && (
          <div className="flex items-center bg-red-100 text-red-700 p-4 mb-6 rounded-lg">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {articles.length === 0 ? (
          <p className="text-gray-600">You have not submitted any articles yet.</p>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="p-4 bg-white rounded shadow hover:shadow-lg transition"
              >
                <h2 className="text-2xl font-semibold">{article.title}</h2>
                <p className="text-gray-600 mt-2">
                  Status: <strong>{article.status}</strong>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyArticles;
