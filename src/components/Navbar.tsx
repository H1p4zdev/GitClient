import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Search, Bell, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const Navbar = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Bell, label: 'Inbox', path: '/notifications' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-6 left-6 right-6 glass-nav px-6 py-4 flex justify-between items-center z-50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40">
      {navItems.map(({ icon: Icon, label, path }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
            )
          }
        >
          <Icon size={24} />
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar;
