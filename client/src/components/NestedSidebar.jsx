// src/components/NestedSidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

const NestedSidebar = ({ role }) => {
  // State to manage open submenus
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Define navigation structure
  const navStructure = {
    admin: [
      {
        name: 'Panels',
        submenu: [
          { name: 'Publish Panel', path: '/admin/publish' },
          { name: 'Users Panel', path: '/admin/users' },
        ],
      },
    ],
    editor: [
      { name: 'Dashboard', path: '/editor' },
      { name: 'Review Articles', path: '/editor/review-articles' },
    ],
    journalist: [
      {
        name: 'Articles',
        submenu: [
          { name: 'My Articles', path: '/journalist/my-articles' },
          { name: 'Create Article', path: '/journalist/create-article' },
        ],
      },
      { name: 'Dashboard', path: '/journalist' },
    ],
  };

  // Common links
  const commonLinks = [
    { name: 'Home', path: '/' },
    { name: 'Logout', path: '/login' }, // replace with logout action
  ];

  const linksToRender = [...(navStructure[role] || []), ...commonLinks];

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <ul>
        {linksToRender.map((link, idx) => (
          <li key={idx} className="mb-2">
            {link.submenu ? (
              <div>
                <button
                  onClick={() => toggleMenu(link.name)}
                  className="flex items-center justify-between w-full text-left hover:text-yellow-400"
                >
                  <span>{link.name}</span>
                  {openMenus[link.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {openMenus[link.name] && (
                  <ul className="pl-4 mt-1">
                    {link.submenu.map((sub) => (
                      <li key={sub.path} className="mb-1">
                        <NavLink
                          to={sub.path}
                          className={({ isActive }) =>
                            isActive ? 'font-bold text-yellow-400' : 'text-gray-200 hover:text-white'
                          }
                        >
                          {sub.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  isActive ? 'font-bold text-yellow-400' : 'text-gray-200 hover:text-white'
                }
              >
                {link.name}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NestedSidebar;
