"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Get the current pathname to determine if we're on the home page
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Use the auth context instead of local state
  const { user, logout } = useAuth();

  // Listen to scroll events and update state
  const handleScroll = () => {
    const scrollThreshold = 50;
    if (window.scrollY > scrollThreshold && !isScrolled) {
      setIsScrolled(true);
    } else if (window.scrollY <= scrollThreshold && isScrolled) {
      setIsScrolled(false);
    }
  };

  // Determine the header background class based on page and scroll position
  const headerBgClass = isHomePage
    ? isScrolled
      ? "bg-gradient-to-r from-gray-800 to-gray-900 shadow-md"
      : "bg-transparent"
    : "bg-gradient-to-r from-gray-800 to-gray-900 shadow-md";

  // Use absolute positioning for homepage to overlay the hero section, change to fixed when scrolled, sticky for other pages
  const positionClass = isHomePage
    ? isScrolled ? "fixed w-full" : "absolute w-full"
    : "sticky";

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  return (
    <header
      className={`${headerBgClass} ${positionClass} top-0 z-[100] transition-colors duration-300`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Image
          src={"/images/logo.svg"}
          alt="Platinum Square"
          width={200}
          height={42}
          className="object-contain"
          style={{ width: 'auto', height: 'auto', maxWidth: '200px', maxHeight: '42px' }}
        />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link
            href="/"
            className={`${isHomePage && !isScrolled ? 'text-white' : 'text-gray-300'} hover:text-white transition duration-300`}
          >
            Home
          </Link>
          <Link
            href="/properties"
            className={`${isHomePage && !isScrolled ? 'text-white' : 'text-gray-300'} hover:text-white transition duration-300`}
          >
            Properties
          </Link>
          <Link
            href="/properties/offplan"
            className={`${isHomePage && !isScrolled ? 'text-white' : 'text-gray-300'} hover:text-white transition duration-300`}
          >
            Off Plan
          </Link>
          <Link
            href="/developers"
            className={`${isHomePage && !isScrolled ? 'text-white' : 'text-gray-300'} hover:text-white transition duration-300`}
          >
            Developers
          </Link>
          <Link
            href="/blog"
            className={`${isHomePage && !isScrolled ? 'text-white' : 'text-gray-300'} hover:text-white transition duration-300`}
          >
            Blog
          </Link>
          <Link
            href="/about"
            className={`${isHomePage && !isScrolled ? 'text-white' : 'text-gray-300'} hover:text-white transition duration-300`}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`${isHomePage && !isScrolled ? 'text-white' : 'text-gray-300'} hover:text-white transition duration-300`}
          >
            Contact
          </Link>
        </nav>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex space-x-4">
          {user ? (
            <div className="relative">
              <div className="flex items-center space-x-4">

                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white transition duration-300"
                >
                  <span>{user.firstName}</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>

                  <Link
                    href="/saved-properties"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Saved Properties
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  {user.role === 'agent' && (
                    <Link
                      href="/agent/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Agent Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={`px-4 py-2 text-white border ${isHomePage && !isScrolled ? 'border-white/50' : 'border-gray-400'} rounded hover:bg-gray-700 hover:text-white transition duration-300`}
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className={`px-4 py-2 ${isHomePage && !isScrolled ? 'bg-white/20 backdrop-blur-sm text-white' : 'bg-gradient-to-r from-gray-600 to-gray-800 text-white'} rounded hover:bg-gray-700 hover:text-white transition duration-300`}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-700'}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 px-4 py-2 shadow-md">
          <nav className="flex flex-col space-y-3 pb-3">
            <Link href="/" className="text-gray-300 hover:text-white transition duration-300">
              Home
            </Link>
            <Link href="/properties" className="text-gray-300 hover:text-white transition duration-300">
              Properties
            </Link>
            <Link href="/properties/offplan" className="text-gray-300 hover:text-white transition duration-300">
              Off Plan
            </Link>
            <Link href="/developers" className="text-gray-300 hover:text-white transition duration-300">
              Developers
            </Link>
            <Link href="/blog" className="text-gray-300 hover:text-white transition duration-300">
              Blog
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition duration-300">
              About
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition duration-300">
              Contact
            </Link>
            <div className="flex flex-col space-y-2 pt-2 border-t border-gray-700">
              {user ? (
                <>
                  <Link href="/profile" className="text-gray-300 hover:text-white transition duration-300">
                    Profile
                  </Link>
                  <Link href="/messages" className="text-gray-300 hover:text-white transition duration-300">
                    Messages
                  </Link>
                  <Link href="/saved-properties" className="text-gray-300 hover:text-white transition duration-300">
                    Saved Properties
                  </Link>

                  {user.role === 'admin' && (
                    <Link href="/admin/dashboard" className="text-gray-300 hover:text-white transition duration-300">
                      Admin Dashboard
                    </Link>
                  )}

                  {user.role === 'agent' && (
                    <Link href="/agent/dashboard" className="text-gray-300 hover:text-white transition duration-300">
                      Agent Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-red-400 hover:text-red-300 transition duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="px-4 py-2 text-center text-white border border-gray-500 rounded hover:bg-gray-700 hover:text-white transition duration-300">
                    Login
                  </Link>
                  <Link href="/auth/register" className="px-4 py-2 text-center bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded hover:from-gray-700 hover:to-gray-900 transition duration-300">
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
