import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Newspaper, LogOut } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
            <Newspaper className="w-8 h-8 text-blue-600" />
            <span>PressFlow</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Journalist link */}
                {(user.role === 'journalist' || user.role === 'admin') && (
                  <Link
                    to="/journalist"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Journalist Dashboard
                  </Link>
                )}

                {/* Editor link */}
                {(user.role === 'editor' || user.role === 'admin') && (
                  <Link
                    to="/editor"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Editor Dashboard
                  </Link>
                )}

                {/* Admin link */}
                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                    >
                      Admin Publish Panel
                    </Link>
                    {/* Optional Users Management link */}
                    {/* <Link
                      to="/admin/users"
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                    >
                      User Management
                    </Link> */}
                  </>
                )}

                <span className="text-gray-700">Hello, {user.name}</span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
