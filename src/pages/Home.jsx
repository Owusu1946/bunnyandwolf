import  { useState } from 'react';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Navbar from '../components/Navbar';
import { FaShippingFast, FaUndo, FaHeadset, FaShieldAlt } from 'react-icons/fa';
import Footer from '../components/Footer';
import FashionShop from './FashionShop';
import ShopCategory from './ShopCategory';


const Home = () => {
  const [activeTab, setActiveTab] = useState('New Arrivals');

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

  const categoryProducts = {
    'New Arrivals': [
      {
        id: 1,
        name: "Summer Dress",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: 2,
        name: "Floral Blouse",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3"
      },
      {
        id: 3,
        name: "Trendy Jacket",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: 4,
        name: "Designer Bag",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: 5,
        name: "Elegant Watch",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: 6,
        name: "Casual Sneakers",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: 7,
        name: "Summer Hat",
        image: "https://images.unsplash.com/photo-1511231115599-3edad51208c1?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: 8,
        name: "Leather Belt",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80"
      }
    ],
    'Top Sellers': [
      {
        id: 9,
        name: "Classic Jeans",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: 10,
        name: "White Sneakers",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: 11,
        name: "Basic Tee",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: 12,
        name: "Sunglasses",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: 13,
        name: "Leather Wallet",
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: 14,
        name: "Crossbody Bag",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: 15,
        name: "Gold Necklace",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: 16,
        name: "Phone Case",
        image: "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=400&q=80"
      }
    ],
    'Dresses': [
      {
        id: 17,
        name: "Maxi Dress",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3"
      },
      {
        id: 18,
        name: "Party Dress",
        image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?ixlib=rb-4.0.3"
      },
      {
        id: 19,
        name: "Sundress",
        image: "https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?ixlib=rb-4.0.3"
      },
      {
        id: 20,
        name: "Evening Dress",
        image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3"
      },
      {
        id: 21,
        name: "Cocktail Dress",
        image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?ixlib=rb-4.0.3"
      },
      {
        id: 22,
        name: "Summer Dress",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: 23,
        name: "Floral Dress",
        image: "https://images.unsplash.com/photo-1495385794356-15371f348c31?ixlib=rb-4.0.3"
      },
      {
        id: 24,
        name: "Beach Dress",
        image: "https://images.unsplash.com/photo-1504703395950-b89145a5425b?ixlib=rb-4.0.3"
      }
    ],
    'Tops': [
      {
        id: 25,
        name: "Silk Blouse",
        image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?ixlib=rb-4.0.3"
      },
      {
        id: 26,
        name: "Sweater",
        image: "https://images.unsplash.com/photo-1434389677669-e382a71b716b?ixlib=rb-4.0.3"
      },
      {
        id: 27,
        name: "Casual Top",
        image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3"
      },
      {
        id: 28,
        name: "Tank Top",
        image: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?ixlib=rb-4.0.3"
      },
      {
        id: 29,
        name: "Crop Top",
        image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3"
      },
      {
        id: 30,
        name: "Off-Shoulder Top",
        image: "https://images.unsplash.com/photo-1503342250614-ca440786f637?ixlib=rb-4.0.3"
      },
      {
        id: 31,
        name: "Button-Up Shirt",
        image: "https://images.unsplash.com/photo-1603251579431-8041402bdeda?ixlib=rb-4.0.3"
      },
      {
        id: 32,
        name: "Lace Top",
        image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?ixlib=rb-4.0.3"
      }
    ]
  };

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
          <h2 className='font-bold text-3xl mb-7'>FEATURED SHOPS</h2>
        </div>
        <div className="w-full px-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="h-[400px] mb-">
                <img 
                  src="https://us.princesspolly.com/cdn/shop/files/Group_4341_128edd21-c0ce-4241-9d87-1c8a80d3874a_665x.progressive.jpg?v=1740628902"
                  alt="Fashion Model"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="mb-1 mt-4">SHOP PARTY LOOKS</h1>
                <a href="#" className="text-sm font-medium border-b-2 border-black hover:border-gray-500 transition-colors">
                  SHOP NOW
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="h-[400px] mb-4">
                <img 
                  src="https://us.princesspolly.com/cdn/shop/files/1-modelinfo-nika-us2_14a23d51-fcbc-4fdf-8aca-051bae50e83f_450x610_crop_center.jpg?v=1728428305"
                  alt="Fashion Shopping"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="mb-1 mt-4">BEACH DRESSES</h1>
                <a href="#" className="text-sm font-medium border-b-2 border-black hover:border-gray-500 transition-colors">
                  SHOP NOW
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="h-[400px] mb-4">
                <img 
                  src="https://www.princesspolly.com.au/cdn/shop/files/1-modelinfo-nat-us2_4fe34236-40a0-47e5-89b1-1315a0b2076f_450x610_crop_center.jpg?v=1739307217"
                  alt="Fashion Model"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="mb-1 mt-4">THE SPRING SHOP</h1>
                <a href="#" className="text-sm font-medium border-b-2 border-black hover:border-gray-500 transition-colors">
                  SHOP NOW
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="h-[400px] mb-4">
                <img 
                  src="https://us.princesspolly.com/cdn/shop/files/1-modelinfo-josephine-us2_3ec262cf-5af1-4637-a7c0-ce1ef00b3da3_450x610_crop_center.jpg?v=1722315009"
                  alt="Fashion Shopping"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="mb-1 mt-4">TRENDING DUO: BLUE & BROWN</h1>
                <a href="#" className="text-sm font-medium border-b-2 border-black hover:border-gray-500 transition-colors">
                  SHOP NOW
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">FEATURED COLLECTIONS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: 1, name: "Luxury Collection", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3", description: "Exclusive designer pieces" },
              { id: 2, name: "Sustainable Fashion", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3", description: "Eco-friendly clothing" },
              { id: 3, name: "Trending Now", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3", description: "Latest fashion trends" },
            ].map((collection) => (
              <div key={collection.id} className="relative group cursor-pointer">
                <div className="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden">
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
            ))}
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
    </div>
  );
};

export default Home;
