// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ role }) => {
  // Define navigation links for each role
  const navLinks = {
    admin: [
      { name: 'Publish Panel', path: '/admin/publish' },
      { name: 'Users Panel', path: '/admin/users' },
    ],
    editor: [
      { name: 'Dashboard', path: '/editor' },
      { name: 'Review Articles', path: '/editor/review-articles' },
    ],
    journalist: [
      { name: 'Dashboard', path: '/journalist' },
      { name: 'My Articles', path: '/journalist/my-articles' },
      { name: 'Create Article', path: '/journalist/create-article' },
    ],
  };

  // Common links for all users
  const commonLinks = [
    { name: 'Home', path: '/' },
    { name: 'Logout', path: '/login' }, // or trigger logout function
  ];

  const linksToRender = [...(navLinks[role] || []), ...commonLinks];

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <ul>
        {linksToRender.map((link) => (
          <li key={link.path} className="mb-2">
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                isActive ? 'font-bold text-yellow-400' : 'text-gray-200 hover:text-white'
              }
            >
              {link.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
