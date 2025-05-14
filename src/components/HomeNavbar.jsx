import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaUserCircle, FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';

const HomeNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Navigation links
  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Products', path: '/products' },
    { title: 'Services', path: '/services' },
    { title: 'About', path: '/about' },
    { title: 'Contact', path: '/contact' }
  ];

  // Handle scroll event to change navbar style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Check if a navigation link should be active (handle nested routes)
  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className={`text-2xl font-bold ${isScrolled ? 'text-red-600' : 'text-white'}`}>
                Sinosply
              </span>
              <span className={`ml-1 text-sm font-medium ${isScrolled ? 'text-gray-600' : 'text-white/80'}`}>
                Connect
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Link
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveLink(link.path)
                      ? `${isScrolled ? 'text-red-600' : 'text-white font-bold'}`
                      : `${isScrolled ? 'text-gray-700 hover:text-red-600' : 'text-white/90 hover:text-white'}`
                  }`}
                >
                  {link.title}
                  {isActiveLink(link.path) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className={`absolute bottom-0 left-0 right-0 h-0.5 mx-4 ${isScrolled ? 'bg-red-600' : 'bg-white'}`}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="flex items-center"
            >
              <button className={`p-2 rounded-full transition-colors ${
                isScrolled ? 'text-gray-600 hover:text-red-600' : 'text-white/90 hover:text-white'
              }`}>
                <FaSearch className="w-5 h-5" />
              </button>
              <Link to="/cart" className={`p-2 rounded-full transition-colors ${
                isScrolled ? 'text-gray-600 hover:text-red-600' : 'text-white/90 hover:text-white'
              }`}>
                <FaShoppingCart className="w-5 h-5" />
              </Link>
              <Link to="/account" className={`p-2 rounded-full transition-colors ${
                isScrolled ? 'text-gray-600 hover:text-red-600' : 'text-white/90 hover:text-white'
              }`}>
                <FaUserCircle className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Link
                to="/quote"
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isScrolled
                    ? 'bg-gradient-to-r from-red-600 to-black text-white hover:shadow-md hover:shadow-red-500/20'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                Get a Quote
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className={`p-2 rounded-lg ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white shadow-lg overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.title}
                </Link>
              ))}
              <div className="pt-2 pb-1">
                <Link
                  to="/quote"
                  className="block w-full px-4 py-3 bg-gradient-to-r from-red-600 to-black text-white text-center rounded-lg font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get a Quote
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default HomeNavbar; 