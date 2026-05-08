'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/useUserStore';

interface NavbarProps {
  currentPage?: string;
}

export default function Navbar({ currentPage = 'home' }: NavbarProps) {
  const { currentUser, logout } = useUserStore();

  const navItems = [
    { label: 'Home', href: '/home', id: 'home' },
    { label: 'Messages', href: '/chat', id: 'chat' },
    { label: 'Circles', href: '/circles', id: 'circles' },
    { label: 'Profile', href: '/profile', id: 'profile' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-md bg-card/80"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <span className="text-primary font-bold text-lg hidden sm:inline">Speaki</span>
          </Link>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.id} href={item.href}>
                <motion.span
                  className={`text-sm font-medium transition-colors duration-200 ${
                    currentPage === item.id
                      ? 'text-accent'
                      : 'text-secondary hover:text-primary'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                </motion.span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {currentUser && (
              <>
                <Link href="/profile">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={currentUser.avatar_url || ''}
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-full object-cover cursor-pointer"
                  />
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="text-secondary text-sm hover:text-primary transition-colors"
                >
                  Logout
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center justify-center gap-4 mt-4">
          {navItems.map((item) => (
            <Link key={item.id} href={item.href}>
              <span
                className={`text-xs font-medium transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'text-accent'
                    : 'text-secondary'
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
