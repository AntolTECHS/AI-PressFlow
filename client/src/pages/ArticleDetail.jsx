import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articlesAPI } from '../services/api';
import { Calendar, Tag, ExternalLink, ArrowLeft, AlertCircle } from 'lucide-react';

function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;

      try {
        const response = await articlesAPI.getById(id);
        setArticle(response.data);
      } catch (err) {
        setError('Failed to load article. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading article...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <span>{error || 'Article not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-96 object-cover"
            />
          )}

          <div className="p-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="inline-flex items-center space-x-1 text-sm text-blue-600 font-medium">
                <Tag className="w-4 h-4" />
                <span>{article.category}</span>
              </span>
              <span className="inline-flex items-center space-x-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{new Date(article.publishDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </span>
              <span className="inline-flex items-center space-x-1 text-sm text-gray-500">
                <ExternalLink className="w-4 h-4" />
                <span>{article.source}</span>
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            {article.author && (
              <p className="text-gray-600 mb-6">By {article.author}</p>
            )}

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {article.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default ArticleDetail;
