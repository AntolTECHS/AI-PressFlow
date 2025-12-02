import { Link } from 'react-router-dom';
import { Calendar, Tag } from 'lucide-react';

function ArticleCard({ id, title, summary, category, source, publishDate, imageUrl }) {
  return (
    <Link to={`/article/${id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-3">
            <span className="inline-flex items-center space-x-1 text-sm text-blue-600 font-medium">
              <Tag className="w-4 h-4" />
              <span>{category}</span>
            </span>
            {publishDate && (
              <span className="inline-flex items-center space-x-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{new Date(publishDate).toLocaleDateString()}</span>
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3">{summary}</p>
          <p className="text-sm text-gray-500">Source: {source}</p>
        </div>
      </div>
    </Link>
  );
}

export default ArticleCard;
