import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const categories = [
    {
      name: 'NEW',
      path: '/new',
      subcategories: ['New Arrivals', 'Coming Soon', 'New Dresses', 'New Tops', 'New Bottoms']
    },
    {
      name: 'BESTSELLERS',
      path: '/bestsellers',
      subcategories: ['Top Rated', 'Most Popular', 'Staff Picks', 'Customer Favorites']
    },
    {
      name: 'CLOTHING',
      path: '/clothing',
      subcategories: ['All Clothing', 'Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Activewear']
    },
    {
      name: 'DRESSES',
      path: '/dresses',
      subcategories: ['All Dresses', 'Mini Dresses', 'Midi Dresses', 'Maxi Dresses', 'Party Dresses']
    },
    {
      name: 'TOPS',
      path: '/tops',
      subcategories: ['All Tops', 'T-Shirts', 'Blouses', 'Sweaters', 'Bodysuits']
    },
    {
      name: 'BOTTOMS',
      path: '/bottoms',
      subcategories: ['All Bottoms', 'Pants', 'Jeans', 'Skirts', 'Shorts']
    },
    {
      name: 'OUTERWEAR',
      path: '/outerwear',
      subcategories: ['All Outerwear', 'Jackets', 'Coats', 'Blazers', 'Cardigans']
    },
    {
      name: 'WINTER SHOP',
      path: '/winter-shop',
      subcategories: ['Winter Collection', 'Sweaters', 'Coats', 'Boots', 'Accessories']
    },
    {
      name: 'ACCESSORIES',
      path: '/accessories',
      subcategories: ['All Accessories', 'Jewelry', 'Bags', 'Hats', 'Scarves']
    },
    {
      name: 'SHOES',
      path: '/shoes',
      subcategories: ['All Shoes', 'Boots', 'Heels', 'Sneakers', 'Sandals']
    },
    {
      name: 'LOWER IMPACT',
      path: '/lower-impact',
      subcategories: ['Sustainable', 'Eco-Friendly', 'Recycled', 'Organic']
    },
    {
      name: 'TRENDING',
      path: '/trending',
      subcategories: ['Current Trends', 'Most Wanted', 'Style Guide', 'Influencer Picks']
    },
    {
      name: 'SALE',
      path: '/sale',
      subcategories: ['All Sale', 'Dresses', 'Tops', 'Bottoms', 'Final Sale'],
      isRed: true
    }
  ];

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
  React.useEffect(() => {
    const closeDropdown = () => setIsProfileDropdownOpen(false);
    if (isProfileDropdownOpen) {
      document.addEventListener('click', closeDropdown);
    }
    return () => document.removeEventListener('click', closeDropdown);
  }, [isProfileDropdownOpen]);

  return (
    <>
      {isLoggingOut && <LoadingOverlay message="Signing out..." />}
      <nav className="navbar">
        {/* <div className="announcement-bar">
          <div className="announcement-item">STUDENT DISCOUNT</div>
          <div className="announcement-item">FREE SHIPPING ORDERS $50+</div>
          <div className="announcement-item">BUY NOW, PAY LATER <img src="/afterpay.png" alt="Afterpay" className="afterpay-logo" /></div>
        </div> */}

        <div className="main-nav">
          <div className="nav-left">
            {/* <div className="currency-selector">
              {currency} <FaChevronDown className="dropdown-arrow" />
            </div>
            <div className="rewards-link">
              REWARDS <BsStar className="star-icon" />
            </div> */}
            <div className="discover-link">
              DISCOVER <BiHomeAlt className="discover-icon" /> <RiArrowRightSLine className="arrow-icon" />
            </div>
          </div>

          <div className="nav-center">
            <Link to="/" className="logo">
              BUNNY & WOLF
            </Link>
          </div>

          <div className="nav-right">
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="SEARCH" 
                className="border-0 text-gray-900 text-sm focus:ring-0 focus:outline-none"
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
              <Link to="/wishlist" className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Wishlist">
                <FaRegHeart className="text-gray-700" />
              </Link>
              
              {user ? (
                <div className="relative" onClick={toggleProfileDropdown}>
                  <button className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors" aria-label="Profile">
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
                        {/* <Link 
                          to="/orders" 
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <FaShoppingBag className="w-4 h-4 mr-3 text-gray-500" />
                          <span>Order History</span>
                        </Link> */}
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
                <Link to="/login" className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Account">
                  <FaRegUser className="text-gray-700" />
                </Link>
              )}
              
              <Link to="/cart" className="cart-icon p-2 rounded-full hover:bg-gray-100 transition-colors relative" aria-label="Shopping Bag">
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

        <div className={`nav-categories ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <button className="mobile-close-button" onClick={toggleMobileMenu} aria-label="Close Menu">
            <FaTimes />
          </button>
          {categories.map((category, index) => (
            <div
              key={category.path}
              className="category-item"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <Link 
                to={category.path}
                className={category.isRed ? 'sale-link' : ''}
                onClick={() => isMobileMenuOpen && toggleMobileMenu()}
              >
                {category.name} <FaChevronDown className="category-arrow" />
              </Link>
              {activeDropdown === index && (
                <div className="dropdown-menu">
                  {category.subcategories.map((sub) => (
                    <Link 
                      key={sub} 
                      to={`${category.path}/${sub.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => isMobileMenuOpen && toggleMobileMenu()}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
