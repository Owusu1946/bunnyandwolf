import  { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Navbar from '../components/Navbar';
import { FaShippingFast, FaUndo, FaHeadset, FaShieldAlt } from 'react-icons/fa';
import Footer from '../components/Footer';
import FashionShop from './FashionShop';
import ShopCategory from './ShopCategory';
import CustomerSupportChat from '../components/CustomerSupportChat';
import { useProductStore } from '../store/productStore';
import { useCollectionsStore } from '../store/collectionsStore';
import { usePlatformsStore } from '../store/platformsStore';


const Home = () => {
  const [activeTab, setActiveTab] = useState('New Arrivals');
  const { fetchProductsFromAPI, products, featuredProducts } = useProductStore();
  const { fetchCollectionsFromAPI, featuredCollections } = useCollectionsStore();
  const { fetchPlatformsFromAPI, activePlatforms, loading: platformsLoading } = usePlatformsStore();
  
  // Fetch products when component mounts
  useEffect(() => {
    if (products.length === 0) {
      fetchProductsFromAPI();
    }
  }, [fetchProductsFromAPI, products.length]);
  
  // Fetch collections when component mounts
  useEffect(() => {
    fetchCollectionsFromAPI();
  }, [fetchCollectionsFromAPI]);
  
  // Fetch platforms when component mounts
  useEffect(() => {
    fetchPlatformsFromAPI();
  }, [fetchPlatformsFromAPI]);

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

  const heroSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    fade: true,
    responsive: []
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

  // We'll use product store data instead of hardcoded data
  // The components will handle their own data fetching from the store
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* New Hero Section */}
      <div className="w-full">
        <div className="relative w-full h-[25vh]">
          <img 
            src="https://us.princesspolly.com/cdn/shop/files/UpTo70_OffShoes-Feb25-S_NH-HP-Strip-Banner_2_1599x.progressive.jpg?v=1740695249"
            alt="Sale Banner"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative w-full h-[90vh]">
          <img 
            src="https://us.princesspolly.com/cdn/shop/files/Group_3312_6cf6ba2e-a5b6-4f66-94c7-70210e935b86_1599x.progressive.jpg?v=1740713873"
            alt="Hero Image"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <FashionShop />

      <div className="flex justify-center items-center mt-12">
        <button className="bg-white text-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors border-2 border-black hover:underline"> SHOP NEW ARRIVALS {'>>'} </button>
      </div>

      {/* Featured Images Section */}
      <section className="py-12">
        <div className="w-full px-0.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative h-[700px]">
              <img 
                src="https://www.allmyfriendsaremodels.com/wp-content/uploads/2024/03/Black-Female-Models.jpg"
                alt="Fashion Model"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button className="bg-white text-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors border-2 border-black hover:underline"> NEW {'&&'} ICONIC {'>'} </button>
              </div>
            </div>
            <div className="relative h-[700px]">
              <img 
                src="https://debonairafrik.com/wp-content/uploads/2024/08/Naomi-Campbell.jpg"
                alt="Fashion Shopping"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button className="bg-white text-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors border-2 border-black hover:underline"> HOT NEW SWIMS {'>'} </button>
              </div>
            </div>
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
                <div key={platform._id} className="relative">
                  <div className="h-[400px] mb-4">
                    <img 
                      src={platform.logoUrl || platform.bannerUrl}
                      alt={platform.name}
                      className="w-full h-full object-cover"
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
                      className="text-sm font-medium border-b-2 border-black hover:border-gray-500 transition-colors"
                    >
                      SHOP NOW
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
                <div key={collection._id} className="relative group cursor-pointer h-[400px]">
                  <div className="h-full w-full rounded-lg overflow-hidden">
                    <img
                      src={collection.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3"}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3";
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                      <h3 className="text-2xl font-bold text-center mb-2">{collection.name}</h3>
                      <p className="text-sm text-center mb-4">{collection.description || `Explore our ${collection.name}`}</p>
                      <button className="px-6 py-2 border-2 border-white hover:bg-white hover:text-black transition-colors duration-300">
                        EXPLORE
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Fallback collections if no featured collections are available
              [
                { id: 1, name: "Luxury Collection", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3", description: "Exclusive designer pieces" },
                { id: 2, name: "Sustainable Fashion", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3", description: "Eco-friendly clothing" },
                { id: 3, name: "Trending Now", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3", description: "Latest fashion trends" },
              ].map((collection) => (
                <div key={collection.id} className="relative group cursor-pointer h-[400px]">
                  <div className="h-full w-full rounded-lg overflow-hidden">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                      <h3 className="text-2xl font-bold text-center mb-2">{collection.name}</h3>
                      <p className="text-sm text-center mb-4">{collection.description}</p>
                      <button className="px-6 py-2 border-2 border-white hover:bg-white hover:text-black transition-colors duration-300">
                        EXPLORE
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">FOLLOW US ON INSTAGRAM</h2>
          <p className="text-gray-600 text-center mb-8">@sinosply</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?ixlib=rb-4.0.3",
              "https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3",
              "https://images.unsplash.com/photo-1495385794356-15371f348c31?ixlib=rb-4.0.3",
              "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3",
              "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?ixlib=rb-4.0.3",
              "https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3",
            ].map((image, index) => (
              <div key={index} className="aspect-w-1 aspect-h-1">
                <img
                  src={image}
                  alt={`Instagram ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
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
            <button className="px-6 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors">
              SUBSCRIBE
            </button>
          </form>
        </div>
      </section>
      <Footer />
      
      {/* Customer Support Chat Component */}
      <CustomerSupportChat />
    </div>
  );
};

export default Home;
