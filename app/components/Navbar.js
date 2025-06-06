'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FaMusic, FaUserCircle } from 'react-icons/fa';
import Image from 'next/image';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Handle initial mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      checkAuth();
    }
  }, [mounted, pathname]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        //console.log(data)
        setUser(data.user);
        //console.log(data.user)
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setIsLoggedIn(false);
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Image
                  src="/Musicoul_logo.jpg"
                  alt="Musicoul Logo"
                  width={40}
                  height={40}
                  className="rounded-md"
                />
                <span className="ml-2 text-2xl font-bold text-black">Musicoul</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/signup';

  // useEffect(() => {
  //   if (!isLoggedIn && !isPublicRoute) {
  //     router.push('/login');
  //   }
  // }, [isLoggedIn, isPublicRoute]);
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/Musicoul_logo.jpg"
                alt="Musicoul Logo"
                width={40}
                height={40}
                className="rounded-md"
              />
              <span className="ml-2 text-2xl font-bold text-black">Musicoul</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {isLoggedIn ? (
              <>
               {user.role=="admin" && <Link href="/admin" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md transition-colors">
                  Admin
                </Link>}
                <Link href="/m-class" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md transition-colors">
                  M-Class
                </Link>
                <Link href="/m-youtube" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md transition-colors">
                  M-Youtube
                </Link>
                <Link href="/my-batches" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md transition-colors">
                  My Batches
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center text-gray-700 hover:text-primary px-3 py-2 rounded-md transition-colors"
                  >
                    <FaUserCircle className="h-6 w-6" />
                    <span className="ml-2">{user?.name}</span>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md transition-colors">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary text-black px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isLoggedIn ? (
              <>
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                  <FaUserCircle className="h-6 w-6 inline-block" />
                  <span className="ml-2">{user?.name}</span>
                </div>
                <Link
                  href="/m-class"
                  className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  M-Class
                </Link>
                <Link
                  href="/m-youtube"
                  className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  M-Youtube
                </Link>
                <Link
                  href="/my-batches"
                  className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Batches
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-primary px-3 py-2 rounded-md transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 