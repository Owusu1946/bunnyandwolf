import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaRegHeart, FaRegUser, FaShoppingBag, FaChevronDown, FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import { RiArrowRightSLine, RiLogoutBoxRLine, RiUserSettingsLine } from 'react-icons/ri';
import { BsStar } from 'react-icons/bs';
import { BiHomeAlt } from 'react-icons/bi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/Navbar.css';
import LoadingOverlay from './LoadingOverlay';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [currency, setCurrency] = useState('$USD');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    {
      name: 'NEW ARRIVALS',
      path: '/new-arrivals',
    },
    {
      name: 'BESTSELLERS',
      path: '/best-sellers',
    },
    {
      name: 'TOPS',
      path: '/tops',
    },
    {
      name: 'DRESSES',
      path: '/dresses',
    },
    {
      name: 'BOTTOMS',
      path: '/bottoms',
    },
    {
      name: 'BACK IN STOCK',
      path: '/back-in-stock',
    }
  ];

  // Listen for scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'auto';
  }, [location.pathname]);

  const handleMouseEnter = (index) => {
    if (window.innerWidth > 768) {
      setActiveDropdown(index);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > 768) {
      setActiveDropdown(null);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = isMobileMenuOpen ? 'auto' : 'hidden';
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsProfileDropdownOpen(false);
    
    try {
      // Simulate logout delay for better UX (remove in production)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const closeDropdown = () => setIsProfileDropdownOpen(false);
    if (isProfileDropdownOpen) {
      document.addEventListener('click', closeDropdown);
    }
    return () => document.removeEventListener('click', closeDropdown);
  }, [isProfileDropdownOpen]);

  // Handle mobile category toggle
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  const toggleMobileCategory = (index) => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };

  return (
    <>
      {isLoggingOut && <LoadingOverlay message="Signing out..." />}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="main-nav">
          <div className="nav-left">
            <div className="discover-link hidden md:flex items-center">
              DISCOVER <BiHomeAlt className="discover-icon ml-1" /> <RiArrowRightSLine className="arrow-icon" />
            </div>
          </div>

          <div className="nav-center">
            <Link to="/" className="logo">
              Bunny & Wolf
            </Link>
          </div>

          <div className="nav-right">
            <div className="search-bar hidden md:flex">
              <input 
                type="text" 
                placeholder="SEARCH" 
                className="border-0 text-gray-900 text-sm focus:ring-0 focus:outline-none bg-transparent"
              />
              <button 
                type="submit" 
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Search"
              >
                <FaSearch />
              </button>
            </div>
            <div className="nav-icons">
              <Link to="/wishlist" className="icon-button" aria-label="Wishlist">
                <FaRegHeart className="text-gray-700" />
              </Link>
              
              {user ? (
                <div className="relative" onClick={toggleProfileDropdown}>
                  <button className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors icon-button" aria-label="Profile">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 overflow-hidden">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                    <span className="ml-1 text-sm hidden md:inline text-gray-700">{user.firstName}</span>
                    <FaChevronDown className={`text-xs text-gray-500 transform transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="profile-dropdown absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-50 transform origin-top-right transition-all duration-200 animate-slideIn" style={{backgroundColor: '#ffffff'}}>
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                            {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{`${user.firstName} ${user.lastName}`}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <Link 
                          to="/profile" 
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <RiUserSettingsLine className="w-4 h-4 mr-3 text-gray-500" />
                          <span>My Profile</span>
                        </Link>
                        <Link 
                          to="/wishlist" 
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <FaRegHeart className="w-4 h-4 mr-3 text-gray-500" />
                          <span>My Wishlist</span>
                        </Link>
                      </div>
                      
                      <div className="p-3 border-t border-gray-100">
                        <button 
                          onClick={handleLogout} 
                          className="flex items-center w-full px-4 py-2 text-left rounded-md text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <RiLogoutBoxRLine className="w-4 h-4 mr-3" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="icon-button" aria-label="Account">
                  <FaRegUser className="text-gray-700" />
                </Link>
              )}
              
              <Link to="/cart" className="cart-icon icon-button relative" aria-label="Shopping Bag">
                <FaShoppingBag className="text-gray-700" />
                {cartCount > 0 && (
                  <span className="cart-count absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
            <button className="hamburger-menu" onClick={toggleMobileMenu} aria-label="Toggle Menu">
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Desktop categories navigation - completely hidden on mobile */}
        <div className="desktop-categories">
          {categories.map((category, index) => (
            <div
              key={category.path}
              className="category-item"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <Link 
                to={category.path}
                className={`nav-link ${location.pathname === category.path ? 'active' : ''}`}
              >
                {category.name}
              </Link>
              {activeDropdown === index && category.subcategories && category.subcategories.length > 0 && (
                <div className="dropdown-menu">
                  {category.subcategories.map((sub) => (
                    <Link 
                      key={sub} 
                      to={`${category.path}/${sub.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Mobile menu overlay */}
        <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu}></div>
        
        {/* Mobile navigation menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <Link to="/" className="mobile-logo" onClick={toggleMobileMenu}>
              SINOSPLY
            </Link>
            <button className="mobile-close" onClick={toggleMobileMenu}>
              <FaTimes />
            </button>
          </div>
          
          <div className="mobile-search">
            <div className="search-form">
              <input type="text" placeholder="Search for products..." />
              <button type="submit">
                <FaSearch />
              </button>
            </div>
          </div>
          
          <div className="mobile-nav-items">
            {categories.map((category, index) => (
              <div key={category.path} className="mobile-nav-item">
                <div className="mobile-nav-link-wrapper">
                  <Link 
                    to={category.path} 
                    className="mobile-nav-link"
                    onClick={toggleMobileMenu}
                  >
                    {category.name}
                  </Link>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <button 
                      className={`mobile-dropdown-toggle ${expandedCategory === index ? 'expanded' : ''}`}
                      onClick={() => toggleMobileCategory(index)}
                    >
                      <FaChevronDown />
                    </button>
                  )}
                </div>
                
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className={`mobile-dropdown ${expandedCategory === index ? 'expanded' : ''}`}>
                    {category.subcategories.map((sub) => (
                      <Link 
                        key={sub} 
                        to={`${category.path}/${sub.toLowerCase().replace(/\s+/g, '-')}`}
                        className="mobile-dropdown-link"
                        onClick={toggleMobileMenu}
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mobile-menu-footer">
            {user ? (
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="mobile-user-details">
                  <p className="mobile-user-name">{`${user.firstName} ${user.lastName}`}</p>
                  <p className="mobile-user-email">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="mobile-auth-links">
                <Link to="/login" className="mobile-login-link" onClick={toggleMobileMenu}>
                  Sign In
                </Link>
                <Link to="/register" className="mobile-register-link" onClick={toggleMobileMenu}>
                  Create Account
                </Link>
              </div>
            )}
            
            {user && (
              <button onClick={handleLogout} className="mobile-logout-button">
                <RiLogoutBoxRLine className="logout-icon" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
