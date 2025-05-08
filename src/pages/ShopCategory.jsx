import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const FashionShop = () => {
  const navigate = useNavigate();
  const products = [
    {
      id: 7,
      name: 'BELLA MIDI DRESS',
      basePrice: 'GH₵85.00',
      variants: [
        { color: '#FF0000', image: "https://media.boohoo.com/i/boohoo/hzz16822_black_xl?w=900&qlt=default&fmt.jp2.qlt=70&fmt=auto&sm=fit", price: 'GH₵85.00' },
        { color: '#000000', image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80", price: 'GH₵85.00' },
        { color: '#FFC0CB', image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&q=80", price: 'GH₵85.00' },
      ]
    },
    {
      id: 10,
      name: 'STELLA EVENING GOWN',
      basePrice: 'GH₵120.00',
      variants: [
        { color: '#000000', image: "https://www.shopamericanthreads.com/cdn/shop/files/margot-black-cream-contrast-strapless-bubble-peplum-top-11.jpg?v=1735360860&width=700", price: 'GH₵120.00' },
        { color: '#FF0000', image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80", price: 'GH₵120.00' },
        { color: '#4169E1', image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", price: 'GH₵120.00' },
      ]
    },
    {
      id: 11,
      name: 'SOPHIA MAXI DRESS',
      basePrice: 'GH₵89.00',
      variants: [
        { color: '#FFB6C1', image: "https://i8.amplience.net//i/Quiz/202230450_XM?fmt=webp&layer0=[h=900&w=600]", price: 'GH₵89.00' },
        { color: '#000000', image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80", price: 'GH₵89.00' },
        { color: '#4169E1', image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", price: 'GH₵89.00' }
      ]
    },
    {
      id: 17,
      name: 'RUBY MINI DRESS',
      basePrice: 'GH₵85.00',
      variants: [
        { color: '#FF0000', image: "https://us.ohpolly.com/cdn/shop/files/8059-Black_Lorena_7.jpg?v=1704902551&width=920", price: 'GH₵85.00' },
        { color: '#000000', image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80", price: 'GH₵85.00' }
      ]
    },
    {
      id: 21,
      name: 'SUMMER BREEZE MAXI',
      basePrice: 'GH₵95.00',
      variants: [
        { color: '#FFB6C1', image: "https://cdn.shopify.com/s/files/1/0061/8627/0804/files/0-modelinfo-selina-us2_4b74d5cd-381f-4c49-b28f-06f010bb5094_350x350.jpg?v=1740701938", price: 'GH₵95.00' },
        { color: '#87CEEB', image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", price: 'GH₵95.00' },
        { color: '#98FB98', image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80", price: 'GH₵95.00' }
      ]
    },
    {
      id: 26,
      name: 'SUMMER BREEZE MAXI DRESS',
      basePrice: 'GH₵95.00',
      variants: [
        { color: '#FFB6C1', image: "https://cdn.shopify.com/s/files/1/0061/8627/0804/files/0-modelinfo-selina-us2_e3838b97-c57c-40e8-8f1a-8586e5370529_350x350.jpg?v=1740715482", price: 'GH₵95.00' },
        { color: '#87CEEB', image: "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&q=80", price: 'GH₵95.00' },
        { color: '#98FB98', image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", price: 'GH₵95.00' }
      ]
    },
    {
      id: 42,
      name: 'BELLA MIDI DRESS',
      basePrice: 'GH₵85.00',
      variants: [
        { color: '#FF0000', image: "https://us.princesspolly.com/cdn/shop/files/1-modelinfo-allie-us2_111bd5a5-2239-4762-a7e8-593d3082ad1b_450x610_crop_center.jpg?v=1722899681", price: 'GH₵85.00' },
        { color: '#000000', image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80", price: 'GH₵85.00' },
        { color: '#FFC0CB', image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&q=80", price: 'GH₵85.00' },
      ]
    },
    {
      id: 41,
      name: 'STELLA EVENING GOWN',
      basePrice: 'GH₵120.00',
      variants: [
        { color: '#000000', image: "https://cdn.shopify.com/s/files/1/0061/8627/0804/files/1-modelinfo-natalya-us2_eb449067-41c7-4e54-ba9e-79c26a8d92b8_350x350.jpg?v=1719460786", price: 'GH₵120.00' },
        { color: '#FF0000', image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80", price: 'GH₵120.00' },
        { color: '#4169E1', image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", price: 'GH₵120.00' },
      ]
    },
    {
      id: 40,
      name: 'SOPHIA MAXI DRESS',
      basePrice: 'GH₵89.00',
      variants: [
        { color: '#FFB6C1', image: "https://us.princesspolly.com/cdn/shop/files/0-modelinfo-selina-us2_be8d2155-9248-408f-bb88-c88684e8e8e1_450x610_crop_center.jpg?v=1740706782", price: 'GH₵89.00' },
        { color: '#000000', image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80", price: 'GH₵89.00' },
        { color: '#4169E1', image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", price: 'GH₵89.00' }
      ]
    },
    {
      id: 18,
      name: 'RUBY MINI DRESS',
      basePrice: 'GH₵85.00',
      variants: [
        { color: '#FF0000', image: "https://us.princesspolly.com/cdn/shop/files/0-modelinfo-selina-us2_e49b790a-8dc9-41b3-9515-cdc3e2e20a73_450x610_crop_center.jpg?v=1740716194", price: 'GH₵85.00' },
        { color: '#000000', image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80", price: 'GH₵85.00' }
      ]
    },
    {
      id: 28,
      name: 'SUMMER BREEZE MAXI',
      basePrice: 'GH₵95.00',
      variants: [
        { color: '#FFB6C1', image: "https://us.princesspolly.com/cdn/shop/files/0-modelinfo-selina-us2_7a2e741b-c4aa-4203-8525-49dce9e34a26_450x610_crop_center.jpg?v=1740707644", price: 'GH₵95.00' },
        { color: '#87CEEB', image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", price: 'GH₵95.00' },
        { color: '#98FB98', image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80", price: 'GH₵95.00' }
      ]
    },
    {
      id: 29,
      name: 'SUMMER BREEZE MAXI DRESS',
      basePrice: 'GH₵95.00',
      variants: [
        { color: '#FFB6C1', image: "https://us.princesspolly.com/cdn/shop/files/0-modelinfo-selina-us2_a3188fb2-b826-455d-9b23-f4b362157204_450x610_crop_center.jpg?v=1740707048", price: 'GH₵95.00' },
        { color: '#87CEEB', image: "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&q=80", price: 'GH₵95.00' },
        { color: '#98FB98', image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", price: 'GH₵95.00' }
      ]
    }
  ];

  const [selectedVariants, setSelectedVariants] = useState(
    Object.fromEntries(products.map(product => [product.id, 0]))
  );

  const handleColorSelect = (productId, variantIndex) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variantIndex,
    }));
  };

  const containerRef = useRef(null);

  const scroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollDistance = 200;
    const currentScroll = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    let newScroll;
    if (direction === 'left') {
      newScroll = Math.max(0, currentScroll - scrollDistance);
    } else {
      newScroll = Math.min(maxScroll, currentScroll + scrollDistance);
    }

    container.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  const handleProductClick = (product, selectedVariant) => {
    console.log('Clicked product:', {
      product,
      selectedVariant,
      image: selectedVariant.image
    });
    
    navigate(`/product/${product.id}`, {
      state: {
        productInfo: {
          id: product.id,
          name: product.name,
          price: selectedVariant.price,
          image: selectedVariant.image,
          selectedColor: selectedVariant.color,
          allVariants: product.variants,
          currentVariantIndex: product.variants.findIndex(v => v.image === selectedVariant.image)
        }
      }
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4">
      <h1 className="text-center text-2xl font-bold my-6">NEW ARRIVALS</h1>

      <div className="relative">
        <button 
          onClick={() => scroll('left')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
        >
          <FaChevronLeft className="text-xl" />
        </button>

        <div 
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth px-4 no-scrollbar"
          style={{ 
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {products.map((product) => {
            const variantIndex = selectedVariants[product.id] || 0;
            const selectedVariant = product.variants[variantIndex];
            
            if (!selectedVariant) {
              return null;
            }

            return (
              <div 
                key={product.id} 
                className="flex-none w-[200px] cursor-pointer"
                style={{ scrollSnapAlign: 'start' }}
                onClick={() => handleProductClick(product, selectedVariant)}
              >
                <div className="relative">
                  <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={selectedVariant.image}
                    alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  </div>
                  <div className="mt-2">
                    <h3 className="text-xs font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="mt-1 text-xs text-gray-500">{product.basePrice}</p>
                    <div className="mt-2 flex gap-1">
                      {product.variants.map((variant, index) => (
                        <button
                          key={index}
                          className={`w-3 h-3 rounded-full border border-gray-300 ${
                            variantIndex === index ? 'ring-1 ring-black ring-offset-1' : ''
                          }`}
                          style={{ backgroundColor: variant.color }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleColorSelect(product.id, index);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
        >
          <FaChevronRight className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default FashionShop;

