import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronRight, Menu, X } from "lucide-react";

const ResponsiveNestedSidebar = ({ role }) => {
  const [openMenus, setOpenMenus] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Role-based links
  const navStructure = {
    admin: [
      {
        name: "Panels",
        submenu: [
          { name: "Publish Panel", path: "/admin/publish" },
          { name: "Users Panel", path: "/admin/users" },
        ],
      },
      { name: "Journalist Dashboard", path: "/journalist" },
      { name: "Editor Dashboard", path: "/editor" },
    ],
    editor: [
      { name: "Review Articles", path: "/editor/review-articles" },
    ],
    journalist: [
      {
        name: "Articles",
        submenu: [
          { name: "My Articles", path: "/journalist/my-articles" },
          { name: "Create Article", path: "/journalist/create-article" },
        ],
      },
    ],
  };

  // Dashboard always at the top
  const dashboardLink = {
    admin: { name: "Dashboard", path: "/admin" },
    editor: { name: "Dashboard", path: "/editor" },
    journalist: { name: "Dashboard", path: "/journalist" },
  };

  const links = [dashboardLink[role], ...(navStructure[role] || [])];

  return (
    <>
      {/* Mobile hamburger button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-gray-900 text-white rounded-md shadow-lg"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white z-40
          transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:relative transition-transform duration-300
          flex flex-col
        `}
      >
        <nav className="flex flex-col h-full p-2 overflow-y-auto">
          {links.map((link) => (
            <div key={link.name} className="mb-2">
              {link.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(link.name)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    <span>{link.name}</span>
                    <ChevronRight
                      size={16}
                      className={`transition-transform ${
                        openMenus[link.name] ? "rotate-90" : "rotate-0"
                      }`}
                    />
                  </button>

                  {openMenus[link.name] && (
                    <div className="ml-2 mt-1 flex flex-col">
                      {link.submenu.map((sub) => (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          end // <-- exact match
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            `px-3 py-1 rounded transition-colors ${
                              isActive
                                ? "bg-yellow-500 text-white font-semibold"
                                : "hover:bg-gray-800"
                            }`
                          }
                        >
                          {sub.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={link.path}
                  end // <-- exact match
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded transition-colors ${
                      isActive ? "bg-yellow-500 text-white font-semibold" : "hover:bg-gray-800"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default ResponsiveNestedSidebar;
