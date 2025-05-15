import  { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Navbar from '../components/Navbar';
import { FaShippingFast, FaUndo, FaHeadset, FaShieldAlt, FaArrowLeft, FaArrowRight, FaLongArrowAltRight, FaInstagram } from 'react-icons/fa';
import Footer from '../components/Footer';
import FashionShop from './FashionShop';
import ShopCategory from './ShopCategory';
import CustomerSupportChat from '../components/CustomerSupportChat';
import { useProductStore } from '../store/productStore';
import { useCollectionsStore } from '../store/collectionsStore';
import { usePlatformsStore } from '../store/platformsStore';
import { useSettingsStore } from '../store/settingsStore';
import { useInstagramStore } from '../store/instagramStore';
import { useNotificationStore } from '../store/notificationStore';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './heroSlider.css';
import '../styles/bannerOverlay.css';
import '../styles/Bunny.css';

// Custom arrow components for the carousel
const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white bg-opacity-40 hover:bg-opacity-80 p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
      onClick={onClick}
    >
      <FaArrowRight className="text-black text-xl" />
    </div>
  );
};

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white bg-opacity-40 hover:bg-opacity-80 p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
      onClick={onClick}
    >
      <FaArrowLeft className="text-black text-xl" />
    </div>
  );
};

// Custom dot indicator component
const CustomDot = ({ onClick, active }) => {
  return (
    <button
      onClick={onClick}
      className={`mx-1 h-2 w-12 rounded-full transition-all duration-300 ${
        active ? 'bg-white shadow-lg scale-110' : 'bg-gray-400 opacity-60'
      }`}
    />
  );
};

// Banner Overlay component
const BannerOverlay = ({ banner }) => {
  // Default position is center, but can be customized per banner
  const position = banner.overlayPosition || 'center';
  
  // Map position to appropriate CSS classes
  const positionClasses = {
    'center': 'justify-center items-center text-center',
    'left': 'justify-start items-center text-left pl-12 md:pl-24',
    'right': 'justify-end items-center text-right pr-12 md:pr-24',
    'top-left': 'justify-start items-start text-left p-12 md:p-24',
    'top-right': 'justify-end items-start text-right p-12 md:p-24',
    'bottom-left': 'justify-start items-end text-left p-12 md:p-24',
    'bottom-right': 'justify-end items-end text-right p-12 md:p-24',
    'bottom-center': 'justify-center items-end text-center pb-12 md:pb-24',
    'top-center': 'justify-center items-start text-center pt-12 md:pt-24',
  }[position];

  // Default overlay styles - can be customized per banner
  const textColor = banner.textColor || 'white';
  const overlayBg = banner.overlayBg === false ? '' : 'modern-overlay';
  const buttonStyle = banner.buttonStyle || 'primary';
  
  // Button styles
  const buttonStyles = {
    'primary': 'btn-primary banner-btn',
    'secondary': 'btn-secondary banner-btn',
    'outlined': 'btn-outlined banner-btn',
    'minimal': 'btn-minimal banner-btn',
  };

  return (
    <div className={`absolute inset-0 flex ${positionClasses} ${overlayBg} z-20 banner-overlay`}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-xl px-6 hero-content"
      >
        {banner.tagline && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`text-${textColor} text-sm md:text-base uppercase tracking-widest mb-3 font-medium hero-tagline`}
          >
            {banner.tagline}
          </motion.p>
        )}
        
        {banner.caption && (
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`text-${textColor} text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight hero-caption`}
          >
            {banner.caption}
          </motion.h2>
        )}
        
        {banner.subcaption && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={`text-${textColor} text-base md:text-xl mb-6 max-w-md mx-auto md:mx-0 hero-subcaption`}
          >
            {banner.subcaption}
          </motion.p>
        )}
        
        {banner.buttonText && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6"
          >
            <a 
              href={banner.buttonLink || banner.linkUrl || '#'} 
              className={`inline-flex items-center text-sm md:text-base font-medium transition-all duration-300 hero-button ${buttonStyles[buttonStyle]}`}
            >
              {banner.buttonText}
              <FaLongArrowAltRight className="ml-2 arrow-icon" />
            </a>
            
            {banner.secondaryButtonText && (
              <a 
                href={banner.secondaryButtonLink || '#'} 
                className={`inline-flex items-center text-sm md:text-base font-medium ml-4 transition-all duration-300 ${
                  buttonStyle === 'primary' ? buttonStyles.secondary : buttonStyles.primary
                }`}
              >
                {banner.secondaryButtonText}
              </a>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const BunnyAndWolf = () => {
  const [activeTab, setActiveTab] = useState('New Arrivals');
  const { fetchProductsFromAPI, products, featuredProducts, fetchFeaturedProducts } = useProductStore();
  const { fetchCollectionsFromAPI, featuredCollections } = useCollectionsStore();
  const { fetchPlatformsFromAPI, activePlatforms, loading: platformsLoading } = usePlatformsStore();
  const { fetchBanners, banners, getBannerByType } = useSettingsStore();
  const { fetchInstagramImages, instagramImages, loading: instagramLoading } = useInstagramStore();
  const { user } = useAuth();
  const { initOrderUpdateListeners, notifications } = useNotificationStore();
  
  console.log('[BunnyAndWolf] Component mounted, user:', user?.email);
  console.log('[BunnyAndWolf] Current notifications count:', notifications.length);
  
  // Initialize notification system for logged in users
  useEffect(() => {
    if (user) {
      console.log('[BunnyAndWolf] User is logged in, initializing notification system');
      
      // Initialize order update listeners for notifications
      const unsubscribe = initOrderUpdateListeners();
      
      // Load notification service
      try {
        // Replace require with dynamic import
        import('../services/NotificationService')
          .then(module => {
            const notificationService = module.default;
            console.log('[BunnyAndWolf] NotificationService loaded:', !!notificationService);
          })
          .catch(err => {
            console.error('[BunnyAndWolf] Error loading notification service:', err);
          });
      } catch (err) {
        console.error('[BunnyAndWolf] Error initializing NotificationService:', err);
      }
      
      return () => {
        console.log('[BunnyAndWolf] Cleaning up notification listeners');
        unsubscribe && unsubscribe();
      }
    } else {
      console.log('[BunnyAndWolf] User not logged in, skipping notification initialization');
    }
  }, [user, initOrderUpdateListeners]);
  
  // Fetch products when component mounts
  useEffect(() => {
    if (products.length === 0) {
      fetchProductsFromAPI();
    }
  }, [fetchProductsFromAPI, products.length]);
  
  // Specifically fetch featured products
  useEffect(() => {
    console.log('Home: Fetching featured products specifically');
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);
  
  // Log featured products when they change
  useEffect(() => {
    console.log(`Home: ${featuredProducts.length} featured products available`);
    featuredProducts.forEach(product => {
      console.log(`Featured product: ${product.name}, ID: ${product._id}, isFeatured: ${product.isFeatured}`);
      console.log(`Image URL: ${product.variants?.[0]?.additionalImages?.[0] || 'No image'}`);
    });
  }, [featuredProducts]);
  
  // Fetch collections when component mounts
  useEffect(() => {
    fetchCollectionsFromAPI();
  }, [fetchCollectionsFromAPI]);
  
  // Fetch platforms when component mounts
  useEffect(() => {
    fetchPlatformsFromAPI();
  }, [fetchPlatformsFromAPI]);
  
  // Fetch banners when component mounts
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Fetch Instagram images when component mounts
  useEffect(() => {
    fetchInstagramImages();
  }, [fetchInstagramImages]);

  // Get active banners
  const activeBanners = banners.filter(banner => banner.isActive) || [];
  
  // Get specific banner types
  const topBanner = activeBanners.find(banner => banner.type === 'topBanner') || {
    imageUrl: 'https://us.princesspolly.com/cdn/shop/files/UpTo70_OffShoes-Feb25-S_NH-HP-Strip-Banner_2_1599x.progressive.jpg?v=1740695249',
    alt: 'Sale Banner',
    linkUrl: '#'
  };
  
  // Get all hero banners
  const heroBanners = activeBanners
    .filter(banner => banner.type === 'heroBanner')
    .sort((a, b) => a.displayOrder - b.displayOrder);
  
  // Add default hero banner if none exist
  if (heroBanners.length === 0) {
    heroBanners.push({
      imageUrl: 'https://us.princesspolly.com/cdn/shop/files/Group_3312_6cf6ba2e-a5b6-4f66-94c7-70210e935b86_1599x.progressive.jpg?v=1740713873',
      alt: 'Hero Image',
      linkUrl: '#',
      type: 'heroBanner',
      isActive: true,
      caption: 'Spring Collection 2025',
      tagline: 'New Season',
      subcaption: 'Discover our latest styles for the new season',
      buttonText: 'Shop Now',
      buttonStyle: 'primary',
      overlayPosition: 'center'
    });

    // Add a second demo banner
    heroBanners.push({
      imageUrl: 'https://www.allmyfriendsaremodels.com/wp-content/uploads/2024/03/Black-Female-Models.jpg',
      alt: 'Summer Collection',
      linkUrl: '#',
      type: 'heroBanner',
      isActive: true,
      caption: 'Summer Essentials',
      tagline: 'Limited Edition',
      subcaption: 'Elevate your summer wardrobe with our exclusive pieces',
      buttonText: 'Explore Collection',
      buttonStyle: 'primary',
      overlayPosition: 'left'
    });
  }
  
  // Get promotional banners (if any)
  const promoBanners = activeBanners.filter(banner => banner.type === 'promoBanner');

  const heroSliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    fade: true,
    cssEase: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    customPaging: i => <CustomDot active={i === 0} />,
    responsive: [],
    accessibility: true,
    focusOnSelect: false,
    swipeToSlide: true,
    draggable: true,
    touchMove: true,
    useCSS: true,
    useTransform: true,
    waitForAnimate: true,
    zIndex: 1,
    appendDots: dots => (
      <div style={{ position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center', zIndex: 40 }}>
        <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'inline-block' }}>{dots}</ul>
      </div>
    ),
    beforeChange: (current, next) => {
      const activeElements = document.querySelectorAll('.slick-slide.slick-active [aria-hidden="true"]');
      activeElements.forEach(el => {
        el.setAttribute('aria-hidden', 'false');
      });
    },
    afterChange: current => {
      const overlays = document.querySelectorAll('.banner-overlay');
      overlays.forEach((overlay, index) => {
        if (index === current) {
          overlay.style.zIndex = '30';
        }
      });
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  // Fallback platforms data if no platforms are available from the store
  const fallbackPlatforms = [
    {
      _id: '1',
      name: 'SHOP PARTY LOOKS',
      logoUrl: 'https://us.princesspolly.com/cdn/shop/files/Group_4341_128edd21-c0ce-4241-9d87-1c8a80d3874a_665x.progressive.jpg?v=1740628902',
      domain: '#'
    },
    {
      _id: '2',
      name: 'BEACH DRESSES',
      logoUrl: 'https://us.princesspolly.com/cdn/shop/files/1-modelinfo-nika-us2_14a23d51-fcbc-4fdf-8aca-051bae50e83f_450x610_crop_center.jpg?v=1728428305',
      domain: '#'
      },
      {
      _id: '3',
      name: 'THE SPRING SHOP',
      logoUrl: 'https://www.princesspolly.com.au/cdn/shop/files/1-modelinfo-nat-us2_4fe34236-40a0-47e5-89b1-1315a0b2076f_450x610_crop_center.jpg?v=1739307217',
      domain: '#'
    },
    {
      _id: '4',
      name: 'TRENDING DUO: BLUE & BROWN',
      logoUrl: 'https://us.princesspolly.com/cdn/shop/files/1-modelinfo-josephine-us2_3ec262cf-5af1-4637-a7c0-ce1ef00b3da3_450x610_crop_center.jpg?v=1722315009',
      domain: '#'
    }
  ];
  
  // Display active platforms or fallback if none available
  const platformsToDisplay = activePlatforms.length > 0 ? activePlatforms : fallbackPlatforms;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section with Carousel */}
      <div className="w-full">
        {topBanner && topBanner.isActive && (
        <div className="relative w-full h-[25vh]">
            <a href={topBanner.linkUrl || '#'}>
          <img 
                src={topBanner.imageUrl}
                alt={topBanner.alt || "Sale Banner"}
            className="w-full h-full object-cover"
          />
            </a>
        </div>
        )}
        
        <div className="relative w-full h-[90vh] banner-container hero-slider-container">
          <Slider {...heroSliderSettings} className="h-full hero-slider">
            {heroBanners.map((banner, index) => (
              <div key={index} className="h-[90vh] relative outline-none slider-item" tabIndex="-1">
                <img 
                  src={banner.imageUrl}
                  alt={banner.alt || "Hero Image"}
                  className="w-full h-full object-cover hero-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/1920x1080?text=Banner+Image+Not+Found";
                  }}
                />
                
                {/* Enhanced banner overlay with text and buttons */}
                <BannerOverlay banner={{
                  ...banner,
                  buttonText: banner.buttonText || "Shop Now",
                  buttonLink: banner.linkUrl || "#",
                  buttonStyle: banner.buttonStyle || "primary",
                  tagline: banner.tagline || banner.subcaption || "New Collection",
                  caption: banner.caption || "Explore Our Products"
                }} />
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <FashionShop />

      <div className="flex justify-center items-center mt-12">
        <Link to="/new-arrivals" className="bg-white text-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors border-2 border-black hover:underline flex items-center">
          SHOP NEW ARRIVALS <FaLongArrowAltRight className="ml-2" />
        </Link>
      </div>

      {/* Promotional Banners Section - Only displayed if promo banners exist */}
      {promoBanners.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promoBanners.map((banner, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden group">
                  <a href={banner.linkUrl || '#'}>
                    <img 
                      src={banner.imageUrl}
                      alt={banner.alt || "Promotional Banner"}
                      className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/800x400?text=Banner+Image+Not+Found";
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col justify-center items-center text-white transition-opacity duration-300">
                      {banner.caption && (
                        <h3 className="text-xl md:text-2xl font-bold mb-2">{banner.caption}</h3>
                      )}
                      {banner.subcaption && (
                        <p className="text-sm md:text-base mb-4">{banner.subcaption}</p>
                      )}
                      {banner.buttonText && (
                        <span className="px-6 py-2 border-2 border-white hover:bg-white hover:text-black transition-colors duration-300">
                          {banner.buttonText}
                        </span>
                      )}
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Images Section */}
      <section className="py-12">
        <div className="w-full px-0.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredProducts.length > 0 ? (
              featuredProducts.slice(0, 2).map((product, index) => (
                <div key={product._id} className="relative h-[700px] group overflow-hidden">
                  <img 
                    src={product.variants && product.variants[0]?.additionalImages[0] || "https://via.placeholder.com/800x1200?text=Product+Image"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/800x1200?text=Product+Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col justify-end items-center pb-16 transition-opacity duration-300">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                      viewport={{ once: true }}
                      className="text-center"
                    >
                      <h3 className="text-white text-2xl font-bold mb-4">{product.name.toUpperCase()}</h3>
                      <Link to={`/product/${product.slug}`} className="bg-white text-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors border-2 border-black hover:underline flex items-center">
                        SHOP NOW <FaLongArrowAltRight className="ml-2" />
                      </Link>
                    </motion.div>
                  </div>
                </div>
              ))
            ) : (
              // Fallback if no featured products
              <>
                <div className="relative h-[700px] group overflow-hidden">
              <img 
                src="https://www.allmyfriendsaremodels.com/wp-content/uploads/2024/03/Black-Female-Models.jpg"
                alt="Fashion Model"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col justify-end items-center pb-16 transition-opacity duration-300">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                      className="text-center"
                    >
                      <h3 className="text-white text-2xl font-bold mb-4">NEW & ICONIC STYLES</h3>
                      <button className="bg-white text-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors border-2 border-black hover:underline flex items-center">
                        EXPLORE <FaLongArrowAltRight className="ml-2" />
                      </button>
                    </motion.div>
              </div>
            </div>
                <div className="relative h-[700px] group overflow-hidden">
              <img 
                src="https://debonairafrik.com/wp-content/uploads/2024/08/Naomi-Campbell.jpg"
                alt="Fashion Shopping"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col justify-end items-center pb-16 transition-opacity duration-300">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="text-center"
                    >
                      <h3 className="text-white text-2xl font-bold mb-4">SUMMER SWIM COLLECTION</h3>
                      <button className="bg-white text-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors border-2 border-black hover:underline flex items-center">
                        SHOP NOW <FaLongArrowAltRight className="ml-2" />
                      </button>
                    </motion.div>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </section>

      <ShopCategory />

       {/* Four Models Section */}
      <section className="py-12">
        <div className="flex justify-center items-center">
          <h2 className='font-bold text-3xl mb-7'>Sinosply Platforms</h2>
        </div>
        <div className="w-full px-8 md:px-16 lg:px-32">
          {platformsLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {platformsToDisplay.map((platform) => (
                <div key={platform._id} className="relative group">
                  <div className="h-[400px] mb-4 overflow-hidden">
                    <img 
                      src={platform.logoUrl || platform.bannerUrl}
                      alt={platform.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400x400?text=Sinosply";
                      }}
                />
              </div>
              <div>
                    <h1 className="mb-1 mt-4 uppercase font-medium">{platform.name}</h1>
                    {platform.description && (
                      <p className="text-sm text-gray-600 mb-2">{platform.description}</p>
                    )}
                    <a 
                      href={`https://${platform.domain}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center text-sm font-medium border-b-2 border-black hover:border-gray-500 transition-colors"
                    >
                      SHOP NOW <FaLongArrowAltRight className="ml-2" />
                </a>
              </div>
            </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">FEATURED COLLECTIONS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCollections.length > 0 ? (
              featuredCollections.map((collection) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  key={collection._id} 
                  className="relative group cursor-pointer h-[400px]"
                >
                  <div className="h-full w-full rounded-lg overflow-hidden">
                    <img
                      src={collection.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3"}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3";
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                      <h3 className="text-2xl font-bold text-center mb-2">{collection.name}</h3>
                      <p className="text-sm text-center mb-4">{collection.description || `Explore our ${collection.name}`}</p>
                      <Link to={`/collections/${collection._id}`} className="inline-flex items-center px-6 py-2 border-2 border-white hover:bg-white hover:text-black transition-colors duration-300">
                        EXPLORE <FaLongArrowAltRight className="ml-2" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              // Fallback collections if no featured collections are available
              [
              { id: 1, name: "Luxury Collection", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3", description: "Exclusive designer pieces" },
              { id: 2, name: "Sustainable Fashion", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3", description: "Eco-friendly clothing" },
              { id: 3, name: "Trending Now", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3", description: "Latest fashion trends" },
            ].map((collection) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  key={collection.id} 
                  className="relative group cursor-pointer h-[400px]"
                >
                  <div className="h-full w-full rounded-lg overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <h3 className="text-2xl font-bold text-center mb-2">{collection.name}</h3>
                    <p className="text-sm text-center mb-4">{collection.description}</p>
                      <button className="inline-flex items-center px-6 py-2 border-2 border-white hover:bg-white hover:text-black transition-colors duration-300">
                        EXPLORE <FaLongArrowAltRight className="ml-2" />
                    </button>
                  </div>
                </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <h2 className="text-3xl font-bold text-gray-900">FOLLOW US ON INSTAGRAM</h2>
              <div className="mt-2 flex justify-center">
                <div className="h-1 w-24 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-full"></div>
              </div>
              <p className="mt-4 text-gray-600">@sinosply</p>
            </motion.div>
          </div>
          
          {instagramLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : instagramImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {instagramImages
                .filter(image => image.isActive)
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((image, index) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    key={image._id || index} 
                    className="overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <a 
                      href={image.link || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="relative block w-full h-0 pb-[100%]" // Maintain aspect ratio
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.caption || `Instagram ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105 will-change-transform"
                        style={{ transform: 'scale(1.01)' }} // Slight initial scale to avoid white edges
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/400x400?text=Image+Error";
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 hover:opacity-100 transition-all duration-300 group">
                        {/* Overlay with gradient for better visibility */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Instagram icon at the center */}
                        <div className="relative z-10 self-center flex-grow flex items-center justify-center">
                          <div className="bg-white bg-opacity-90 p-3 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:bg-opacity-100 hover:shadow-lg">
                            <FaInstagram className="text-black text-2xl" />
                          </div>
                        </div>
                        
                        {/* Caption at the bottom */}
                        {image.caption && (
                          <div className="relative z-10 mt-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                            <p className="text-white text-sm font-medium line-clamp-2">{image.caption}</p>
                          </div>
                        )}
                      </div>
                    </a>
                  </motion.div>
                ))
              }
            </div>
          ) : (
            // Fallback for when no Instagram images are available
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?ixlib=rb-4.0.3",
              "https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3",
              "https://images.unsplash.com/photo-1495385794356-15371f348c31?ixlib=rb-4.0.3",
              "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3",
              "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?ixlib=rb-4.0.3",
              "https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3",
            ].map((image, index) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  key={index} 
                  className="overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative block w-full h-0 pb-[100%]">
                <img
                  src={image}
                  alt={`Instagram ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      style={{ transform: 'scale(1.01)' }}
                />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="bg-white bg-opacity-0 p-3 rounded-full transform scale-0 hover:scale-100 hover:bg-opacity-90 transition-all duration-300">
                        <FaInstagram className="text-white hover:text-black text-3xl transition-colors duration-300" />
                      </div>
                    </div>
              </div>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="mt-10 text-center">
            <a 
              href="https://instagram.com/sinosply" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 font-medium"
            >
              VIEW INSTAGRAM <FaLongArrowAltRight className="ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter Section
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">JOIN OUR NEWSLETTER</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button className="px-6 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors flex items-center">
              SUBSCRIBE <FaLongArrowAltRight className="ml-2" />
            </button>
          </form>
        </div>
      </section> */}
      <Footer />
      
      {/* Customer Support Chat Component */}
      <CustomerSupportChat />

      <style jsx="true">{`
        .hero-slider .slick-slide {
          position: relative !important;
          transform: scale(1.02);
          transition: transform 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) !important;
        }
        
        .hero-slider .slick-active {
          transform: scale(1);
          transition: transform 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        }
        
        .hero-slider .slick-slide > div {
          height: 100%;
        }
        
        .hero-slider .slick-track,
        .hero-slider .slick-list {
          height: 100%;
        }
        
        /* Fix accessibility issue by overriding aria-hidden on active slides */
        .hero-slider .slick-slide.slick-active {
          z-index: 1 !important;
          opacity: 1 !important;
        }
        
        .hero-slider .slick-slide.slick-active [aria-hidden="true"] {
          aria-hidden: false !important;
        }
        
        /* Fix overlay visibility */
        .hero-slider .slick-slide.slick-active {
          z-index: 10 !important;
        }
        
        .hero-slider .slick-arrow {
          z-index: 30 !important;
          opacity: 0;
          transform: translateY(-50%) scale(0.9);
          transition: all 0.3s ease-out;
        }
        
        .hero-slider-container:hover .slick-arrow {
          opacity: 1;
          transform: translateY(-50%) scale(1);
        }
        
        .slick-dots {
          z-index: 30 !important;
          position: relative;
          bottom: 40px !important;
        }
        
        /* Modern overlay styling */
        .modern-overlay {
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%);
        }
        
        /* Hero content animation overrides */
        .hero-tagline, .hero-caption, .hero-subcaption {
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .hero-caption {
          letter-spacing: -0.5px;
        }
        
        .hero-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease-out;
          backdrop-filter: blur(5px);
          letter-spacing: 0.5px;
        }
        
        .btn-primary.banner-btn {
          background-color: white;
          color: black;
          padding: 0.8rem 2rem;
          border-radius: 0px;
          border: 2px solid white;
          overflow: hidden;
        }
        
        .btn-primary.banner-btn:hover {
          background-color: transparent;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        
        .btn-secondary.banner-btn {
          background-color: transparent;
          color: white;
          padding: 0.8rem 2rem;
          border-radius: 0px;
          border: 2px solid white;
        }
        
        .btn-secondary.banner-btn:hover {
          background-color: white;
          color: black;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        
        .arrow-icon {
          transition: transform 0.3s ease-out;
        }
        
        .hero-button:hover .arrow-icon {
          transform: translateX(5px);
        }
        
        /* Ensure overlays are visible */
        .text-white {
          color: white !important;
        }
        
        /* Hero image animation */
        .hero-image {
          transform: scale(1.05);
          transition: transform 7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .slick-active .hero-image {
          transform: scale(1);
        }
      `}</style>
    </div>
  );
};

export default BunnyAndWolf;
