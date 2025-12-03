import { useEffect, useState } from 'react';
import { articlesAPI } from "../../services/api";
import { AlertCircle, Pencil, CheckCircle, XCircle } from 'lucide-react';
import { Link } from "react-router-dom";

function MyArticles() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await articlesAPI.getMine();
        const myArticles = Array.isArray(res.data) ? res.data : [];
        setArticles(myArticles);
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
              <div key={article._id} className="p-4 bg-white rounded shadow hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold">{article.title}</h2>
                    <p className="text-gray-600 mt-1">
                      Status: <strong>{article.status}</strong>
                    </p>

                    {article.status === "rejected" && article.rejectionReason && (
                      <p className="text-red-600 text-sm mt-1">
                        Reason: {article.rejectionReason}
                      </p>
                    )}

                    {article.summary && (
                      <p className="text-gray-700 mt-3 line-clamp-3">{article.summary}</p>
                    )}
                  </div>

                  <Link to={`/journalist/edit/${article._id}`} className="flex items-center text-blue-600 hover:underline">
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Link>
                </div>

                <div className="mt-3 flex space-x-2">
                  {article.status === "approved" && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {article.status === "rejected" && <XCircle className="w-5 h-5 text-red-600" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyArticles;
