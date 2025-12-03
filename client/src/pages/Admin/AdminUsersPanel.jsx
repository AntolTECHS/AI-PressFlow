// src/pages/AdminUsersPanel.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Trash2, UserCheck, UserX, Search } from "lucide-react";

const ROLES = ["journalist", "editor", "admin"];

function AdminUsersPanel() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null); // for delete
  const [roleUpdatingId, setRoleUpdatingId] = useState(null); // for role change
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);

  const apiHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const fetchUsers = async (opts = {}) => {
    setLoading(true);
    setError("");
    try {
      const q = opts.q ?? search ?? "";
      const p = opts.page ?? page;
      const res = await axios.get(`/api/admin/users?page=${p}&limit=${limit}&q=${encodeURIComponent(q)}`, apiHeaders());
      // expected response: { users: [...], total: N }
      // fallback if API returns array directly
      if (Array.isArray(res.data)) {
        setUsers(res.data);
        setTotal(res.data.length);
      } else {
        setUsers(res.data.users || res.data);
        setTotal(res.data.total ?? (res.data.users?.length ?? 0));
      }
      setPage(p);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchUsers({ page: 1, q: search });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    if (id === currentUser?._id || id === currentUser?.id) {
      alert("You cannot delete your own admin account from here.");
      return;
    }

    try {
      setProcessingId(id);
      await axios.delete(`/api/admin/users/${id}`, apiHeaders());
      // Optimistic remove
      setUsers((prev) => prev.filter((u) => u._id !== id && u.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    if (id === currentUser?._id || id === currentUser?.id) {
      alert("You cannot change your own role from here.");
      return;
    }
    if (!ROLES.includes(newRole)) {
      alert("Invalid role");
      return;
    }

    try {
      setRoleUpdatingId(id);
      // backend should accept PATCH /api/admin/users/:id { role }
      await axios.patch(`/api/admin/users/${id}`, { role: newRole }, apiHeaders());
      setUsers((prev) => prev.map((u) => (u._id === id || u.id === id ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update role");
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const handlePrev = () => {
    if (page > 1) fetchUsers({ page: page - 1 });
  };
  const handleNext = () => {
    const maxPage = Math.max(1, Math.ceil(total / limit));
    if (page < maxPage) fetchUsers({ page: page + 1 });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-600">View, change roles, or delete users (admin only).</p>
          </div>

          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-10 pr-3 py-2 border rounded-lg w-72 focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search className="w-4 h-4" />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => { setSearch(""); fetchUsers({ page: 1, q: "" }); }}
              className="bg-white border px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-600">Loading users...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No users found.</div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Joined</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const id = u._id ?? u.id;
                  const isMe = id === (currentUser?._id ?? currentUser?.id);
                  return (
                    <tr key={id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{u.name || "—"}</div>
                        <div className="text-xs text-gray-500">{u.username || ""}</div>
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700">{u.email}</td>

                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(id, e.target.value)}
                            disabled={isMe || roleUpdatingId === id}
                            className="border rounded px-2 py-1"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                          {roleUpdatingId === id && (
                            <span className="ml-2 text-xs text-gray-500">Updating...</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(u.createdAt || u.created_at || u.joinedAt || u.createdAt).toLocaleString?.() ?? "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            title="Delete user"
                            onClick={() => handleDelete(id)}
                            disabled={isMe || processingId === id}
                            className={`flex items-center space-x-2 px-3 py-1 rounded text-sm transition-colors
                              ${isMe ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"}`}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>{processingId === id ? "Deleting..." : "Delete"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing page {page} — {total} users
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrev}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={handleNext}
                  disabled={page >= Math.ceil(total / limit)}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsersPanel;
