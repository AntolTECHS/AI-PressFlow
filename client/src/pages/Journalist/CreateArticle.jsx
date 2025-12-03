// src/pages/CreateArticle.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { articlesAPI } from "../../services/api";
import { AlertCircle } from 'lucide-react';

function CreateArticle() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitArticle = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await articlesAPI.create({ title, content });
      navigate('/editor/my-articles');
    } catch (error) {
      console.error(error);
      setError('Failed to create article.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6">Create New Article</h1>

        {error && (
          <div className="flex items-center bg-red-100 text-red-700 p-4 mb-6 rounded-lg">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={submitArticle} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Title</label>
            <input
              className="w-full border rounded px-4 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Content</label>
            <textarea
              className="w-full border rounded px-4 py-2 min-h-[200px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? 'Submitting...' : 'Submit Article'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateArticle;
