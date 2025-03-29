import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Importing better-looking arrows from react-icons

const FashionShop = () => {
  const navigate = useNavigate();
  const categories = [
    'NEW ARRIVALS',
    'BEST SELLERS', 
    'DRESSES',
    'TOPS',
    'BOTTOMS',
    'BACK IN STOCK'
  ];

  const products = [
    {
      id: 1,
      name: 'DAFNIE LONG SLEEVE MINI DRESS BLACK',
      basePrice: '€63.00',
      category: 'DRESSES',
      variants: [
        { color: '#000000', image: "https://us.princesspolly.com/cdn/shop/files/0-modelinfo-melita-us4_8293541d-9e52-40c0-9f60-125daf7fded5.jpg?v=1722399607", price: '€63.00' },
        { color: '#8B4513', image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", price: '€63.00' },
      ]
    },
    {
      id: 2,
      name: 'IRRESISTIBLE STRAPLESS TOP CHOCOLATE',
      basePrice: '€49.00',
      category: 'TOPS',
      variants: [
        { color: '#8B4513', image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80", price: '€49.00' },
        { color: '#FFFFFF', image: "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=400&q=80", price: '€49.00' },
      ]
    },
    {
      id: 3,
      name: 'KINKRIK FLARED PANTS CHOCOLATE',
      basePrice: '€63.00',
      category: 'BOTTOMS',
      variants: [
        { color: '#8B4513', image: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=400&q=80", price: '€63.00' },
        { color: '#000000', image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=400&q=80", price: '€63.00' },
        { color: '#D2B48C', image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", price: '€63.00' },
      ]
    },
    {
      id: 4,
      name: 'MORDECAI HALTER MAXI DRESS BURGUNDY',
      basePrice: '€77.00',
      category: 'DRESSES',
      variants: [
        { color: '#800000', image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80", price: '€77.00' },
      ]
    },
    {
      id: 5,
      name: 'XANDI LONG SLEEVE TOP BLACK/LEOPARD',
      basePrice: '€49.00',
      category: 'TOPS',
      variants: [
        { color: '#000000', image: "https://images.unsplash.com/photo-1551799517-eb8f03cb5e6a?w=400&q=80", price: '€49.00' },
      ]
    },
    {
      id: 6,
      name: 'LUELUE LONG SLEEVE SHIRT MULTI',
      basePrice: '€93.00',
      category: 'TOPS',
      variants: [
        { color: '#8B4513', image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&q=80", price: '€93.00' },
      ]
    },
    {
      id: 7,
      name: 'BELLA MIDI DRESS',
      basePrice: '€85.00',
      category: 'NEW ARRIVALS',
      variants: [
        { color: '#FF0000', image: "https://www.princesspolly.com.au/cdn/shop/files/1-modelinfo-kiele-us4_982735fc-5808-466b-b6f8-0d7a9ee892b0.jpg?v=1728577156", price: '€85.00' },
        { color: '#000000', image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80", price: '€85.00' },
        { color: '#FFC0CB', image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&q=80", price: '€85.00' },
      ]
    },
    {
      id: 8,
      name: 'AURORA SILK BLOUSE',
      basePrice: '€69.00',
      category: 'BEST SELLERS',
      variants: [
        { color: '#FFFFFF', image: "https://us.princesspolly.com/cdn/shop/files/2-modelinfo-adison-us4_307b9d0f-bb48-4395-bb1f-c9b2b4cd1ab1_450x610_crop_center.jpg?v=1683602368", price: '€69.00' },
        { color: '#87CEEB', image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&q=80", price: '€69.00' },
        { color: '#FFD700', image: "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=400&q=80", price: '€69.00' },
      ]
    },
    {
      id: 9,
      name: 'LUNA WIDE LEG PANTS',
      basePrice: '€75.00',
      category: 'BACK IN STOCK',
      variants: [
        { color: '#000000', image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=400&q=80", price: '€75.00' },
        { color: '#8B4513', image: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=400&q=80", price: '€75.00' },
        { color: '#808080', image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", price: '€75.00' },
      ]
    },
    {
      id: 10,
      name: 'STELLA EVENING GOWN',
      basePrice: '€120.00',
      category: 'NEW ARRIVALS',
      variants: [
        { color: '#000000', image: "https://www.princesspolly.com.au/cdn/shop/files/1-modelinfo-mia-us4_38c1e8e1-9142-4b17-9c3b-62021236e415_450x610_crop_center.jpg?v=1737758715", price: '€120.00' },
        { color: '#FF0000', image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80", price: '€120.00' },
        { color: '#4169E1', image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", price: '€120.00' },
      ]
    },
    {
      id: 11,
      name: 'SOPHIA MAXI DRESS',
      basePrice: '€89.00',
      category: 'NEW ARRIVALS',
      variants: [
        { color: '#FFB6C1', image: "https://www.princesspolly.com.au/cdn/shop/files/1-modelinfo-leona-us2_b33a6d2f-898e-416f-9590-013998e0104e.jpg?v=1731444466", price: '€89.00' },
        { color: '#000000', image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80", price: '€89.00' },
        { color: '#4169E1', image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", price: '€89.00' }
      ]
    },
    {
      id: 12,
      name: 'HARPER BLAZER',
      basePrice: '€110.00',
      category: 'BEST SELLERS',
      variants: [
        { color: '#000000', image: "https://us.princesspolly.com/cdn/shop/files/0-modelinfo-ashley-us2_d5ef311b-a02f-4b8c-83f6-6480202a56ba_450x610_crop_center.jpg?v=1715232696", price: '€110.00' },
        { color: '#F5F5DC', image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80", price: '€110.00' }
      ]
    },
    {
      id: 13,
      name: 'ARIA SILK CAMI',
      basePrice: '€45.00',
      category: 'TOPS',
      variants: [
        { color: '#FFD700', image: "https://images.unsplash.com/photo-1602573991155-21f0143bb45c?w=400&q=80", price: '€45.00' },
        { color: '#FF69B4', image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&q=80", price: '€45.00' },
        { color: '#000000', image: "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=400&q=80", price: '€45.00' }
      ]
    },
    {
      id: 14,
      name: 'LILY WRAP DRESS',
      basePrice: '€79.00',
      category: 'DRESSES',
      variants: [
        { color: '#90EE90', image: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&q=80", price: '€79.00' },
        { color: '#DDA0DD', image: "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&q=80", price: '€79.00' }
      ]
    },
    {
      id: 15,
      name: 'EMMA LEATHER PANTS',
      basePrice: '€129.00',
      category: 'BOTTOMS',
      variants: [
        { color: '#8B4513', image: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=400&q=80", price: '€129.00' },
        { color: '#000000', image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=400&q=80", price: '€129.00' }
      ]
    },
    {
      id: 16,
      name: 'VICTORIA SEQUIN TOP',
      basePrice: '€69.00',
      category: 'BACK IN STOCK',
      variants: [
        { color: '#FFD700', image: "https://images.unsplash.com/photo-1559127452-6b6f76b5c690?w=400&q=80", price: '€69.00' },
        { color: '#C0C0C0', image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&q=80", price: '€69.00' }
      ]
    },
    {
      id: 17,
      name: 'RUBY MINI DRESS',
      basePrice: '€85.00',
      category: 'NEW ARRIVALS',
      variants: [
        { color: '#FF0000', image: "https://us.princesspolly.com/cdn/shop/files/1-modelinfo-natalya-us2_b42cca63-08ff-4834-8df0-6d0388fbd998.jpg?v=1737510316", price: '€85.00' },
        { color: '#000000', image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80", price: '€85.00' }
      ]
    },
    {
      id: 18,
      name: 'CHLOE WIDE LEG JUMPSUIT',
      basePrice: '€95.00',
      category: 'BEST SELLERS',
      variants: [
        { color: '#000000', image: "https://us.princesspolly.com/cdn/shop/products/0-modelinfo-kiele-us4_2dd2166f-87c4-4935-8f26-f0ea40cd5d27_450x610_crop_center.jpg?v=1674453878", price: '€95.00' },
        { color: '#8B4513', image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", price: '€95.00' }
      ]
    },
    {
      id: 19,
      name: 'ISLA RUFFLE BLOUSE',
      basePrice: '€59.00',
      category: 'TOPS',
      variants: [
        { color: '#FFFFFF', image: "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=400&q=80", price: '€59.00' },
        { color: '#FFB6C1', image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&q=80", price: '€59.00' }
      ]
    },
    {
      id: 20,
      name: 'MIA CARGO PANTS',
      basePrice: '€75.00',
      category: 'BOTTOMS',
      variants: [
        { color: '#808080', image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", price: '€75.00' },
        { color: '#000000', image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=400&q=80", price: '€75.00' }
      ]
    },
    {
      id: 21,
      name: 'SUMMER BREEZE MAXI',
      basePrice: '€95.00',
      category: 'NEW ARRIVALS',
      variants: [
        { color: '#FFB6C1', image: "https://us.princesspolly.com/cdn/shop/files/0-modelinfo-elise-us2_f7b9b3af-3e50-44fc-93bd-66c34c33e80d.jpg?v=1738640825", price: '€95.00' },
        { color: '#87CEEB', image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", price: '€95.00' },
        { color: '#98FB98', image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80", price: '€95.00' },
        { color: '#DDA0DD', image: "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&q=80", price: '€95.00' },
        { color: '#F4A460', image: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=400&q=80", price: '€95.00' }
      ]
    },
    {
      id: 22,
      name: 'CRYSTAL EVENING SET',
      basePrice: '€150.00',
      category: 'BEST SELLERS',
      variants: [
        { color: '#FFD700', image: "https://us.princesspolly.com/cdn/shop/files/July-Scarf-Cream_b2bcee76-7497-44f8-9fae-b5425639c1a4_450x610_crop_center.jpg?v=1738178678", price: '€150.00' },
        { color: '#C0C0C0', image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&q=80", price: '€150.00' },
        { color: '#000000', image: "https://images.unsplash.com/photo-1548133650-7e2b96ebe5e6?w=400&q=80", price: '€150.00' },
        { color: '#CD5C5C', image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80", price: '€150.00' }
      ]
    },
    {
      id: 23,
      name: 'BOHEMIAN DREAM DRESS',
      basePrice: '€89.00',
      category: 'DRESSES',
      variants: [
        { color: '#E6E6FA', image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80", price: '€89.00' },
        { color: '#F0E68C', image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&q=80", price: '€89.00' },
        { color: '#20B2AA', image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80", price: '€89.00' },
        { color: '#FF69B4', image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&q=80", price: '€89.00' },
        { color: '#DEB887', image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", price: '€89.00' }
      ]
    },
    {
      id: 24,
      name: 'SUNSET PALAZZO PANTS',
      basePrice: '€79.00',
      category: 'BOTTOMS',
      variants: [
        { color: '#FF4500', image: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=400&q=80", price: '€79.00' },
        { color: '#4B0082', image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=400&q=80", price: '€79.00' },
        { color: '#006400', image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", price: '€79.00' },
        { color: '#8B4513', image: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=400&q=80", price: '€79.00' }
      ]
    },
    {
      id: 25,
      name: 'RAINBOW SILK BLOUSE',
      basePrice: '€65.00',
      category: 'TOPS',
      variants: [
        { color: '#FF0000', image: "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=400&q=80", price: '€65.00' },
        { color: '#FFA500', image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&q=80", price: '€65.00' },
        { color: '#FFFF00', image: "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=400&q=80", price: '€65.00' },
        { color: '#008000', image: "https://images.unsplash.com/photo-1602573991155-21f0143bb45c?w=400&q=80", price: '€65.00' },
        { color: '#0000FF', image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&q=80", price: '€65.00' },
        { color: '#4B0082', image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&q=80", price: '€65.00' }
      ]
    },
    {
      id: 26,
      name: 'SUMMER BREEZE MAXI DRESS',
      basePrice: '€95.00',
      category: 'NEW ARRIVALS',
      variants: [
        { color: '#FFB6C1', image: "https://us.princesspolly.com/cdn/shop/products/0-modelinfo-Alexis-us2_0e3e44ae-9e2d-40f0-ba5c-dd4ab61a907e.jpg?v=1680147908", price: '€95.00' },
        { color: '#87CEEB', image: "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&q=80", price: '€95.00' },
        { color: '#98FB98', image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", price: '€95.00' }
      ]
    },
    {
      id: 27,
      name: 'ELEGANT EVENING GOWN',
      basePrice: '€150.00',
      category: 'BEST SELLERS',
      variants: [
        { color: '#000000', image: "https://us.princesspolly.com/cdn/shop/files/1-modelinfo-bianca-us4_f2d9dc5a-1efd-4cc5-891d-bee0b7a9de63_450x610_crop_center.jpg?v=1721131928", price: '€150.00' },
        { color: '#800000', image: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&q=80", price: '€150.00' },
        { color: '#4169E1', image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80", price: '€150.00' }
      ]
    },
    {
      id: 28,
      name: 'FLORAL SUMMER DRESS',
      basePrice: '€85.00',
      category: 'DRESSES',
      variants: [
        { color: '#FF69B4', image: "https://cld.accentuate.io/6740426391636/1669852540709/1-modelinfo-eva-us2_17fa85ee-e131-453d-8f09-f8e479bc3025.jpg?v=1690323281322&options=w_450,h_610", price: '€85.00' },
        { color: '#98FB98', image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80", price: '€85.00' }
      ]
    },
    {
      id: 29,
      name: 'CLASSIC DENIM JEANS',
      basePrice: '€75.00',
      category: 'BOTTOMS',
      variants: [
        { color: '#000080', image: "https://us.princesspolly.com/cdn/shop/files/2-modelinfo-summer-us2_75e8ff41-9981-425c-a9e2-07a753d0a968_450x610_crop_center.jpg?v=1739299677", price: '€75.00' },
        { color: '#4682B4', image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80", price: '€75.00' }
      ]
    },
    {
      id: 30,
      name: 'SILK CAMISOLE',
      basePrice: '€55.00',
      category: 'TOPS',
      variants: [
        { color: '#FFD700', image: "https://us.princesspolly.com/cdn/shop/files/0-modelinfo-kiana-us2_695501c8-a518-4689-8887-91d118228bcc_450x610_crop_center.jpg?v=1687837999", price: '€55.00' },
        { color: '#FF69B4', image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&q=80", price: '€55.00' },
        { color: '#000000', image: "https://images.unsplash.com/photo-1551799517-eb8f03cb5e6a?w=400&q=80", price: '€55.00' }
      ]
    },
    {
      id: 31,
      name: 'BOHO MAXI SKIRT',
      basePrice: '€70.00',
      category: 'BOTTOMS',
      variants: [
        { color: '#DEB887', image: "https://us.princesspolly.com/cdn/shop/files/1-modelinfo-natalia-us4_5b9e8b60-20e5-4a15-9799-a253afb16411_450x610_crop_center.jpg?v=1717042588", price: '€70.00' },
        { color: '#8B4513', image: "https://images.unsplash.com/photo-1583496661263-bc2c00a5b2b8?w=400&q=80", price: '€70.00' }
      ]
    },
    {
      id: 32,
      name: 'SUMMER BREEZE MAXI DRESS',
      basePrice: '€95.00',
      category: 'NEW ARRIVALS',
      variants: [
        { color: '#FFB6C1', image: "https://us.princesspolly.com/cdn/shop/files/0-modelinfo-hailey-us4_c30bb36f-e124-422c-9a3e-f22d7d8cc072_450x610_crop_center.jpg?v=1700439830", price: '€95.00' },
        { color: '#87CEEB', image: "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&q=80", price: '€95.00' },
        { color: '#98FB98', image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80", price: '€95.00' }
      ]
    },
    {
      id: 33,
      name: 'CASUAL LINEN SHIRT',
      basePrice: '€60.00',
      category: 'TOPS',
      variants: [
        { color: '#FFFFFF', image: "https://us.princesspolly.com/cdn/shop/products/1-model-info-Josephine-us2_c3b27c5c-dde7-4940-a969-babc49c9b35d_450x610_crop_center.jpg?v=1690585654", price: '€60.00' },
        { color: '#87CEEB', image: "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=400&q=80", price: '€60.00' },
        { color: '#F5DEB3', image: "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=400&q=80", price: '€60.00' }
      ]
    }
  ];

  // Modify the scroll function to use actual product count
  const scroll = (direction) => {
    const container = document.getElementById('product-carousel');
    if (container) {
      const cardWidth = 220;
      const gap = 24;
      const scrollAmount = (cardWidth + gap) * 5;
      
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Update the products state to use the original products list
  const [selectedCategory, setSelectedCategory] = useState('NEW ARRIVALS');
  const [selectedVariants, setSelectedVariants] = useState(
    // Initialize with first variant (index 0) for each product
    Object.fromEntries(products.map(product => [product.id, 0]))
  );

  const handleColorSelect = (productId, variantIndex) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variantIndex,
    }));
  };

  // Update filtered products to use the original products list
  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter((product) => product.category === selectedCategory);

  const handleProductClick = (product) => {
    const selectedVariant = product.variants[selectedVariants[product.id]];
    navigate(`/product/${product.id}`, { 
      state: { 
        productInfo: {
          id: product.id,
          name: product.name,
          price: selectedVariant.price,
          image: selectedVariant.image,
          selectedColor: selectedVariant.color,
          allVariants: product.variants,
          currentVariantIndex: selectedVariants[product.id]
        }
      }
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4">
      <h1 className="text-center text-2xl font-bold my-6">NEW ARRIVALS</h1>

      <div className="flex justify-center gap-4 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-1 text-sm ${
              selectedCategory === category
                ? 'bg-black text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="relative">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
        >
          <FaChevronLeft className="text-xl" />
        </button>

        <div 
          id="product-carousel"
          className="flex gap-6 overflow-x-auto hide-scrollbar scroll-smooth px-8"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {filteredProducts.map((product) => {
            const selectedVariant = product.variants[selectedVariants[product.id]];
            return (
              <div 
                key={product.id} 
                className="flex-none w-[220px] cursor-pointer"
                style={{ scrollSnapAlign: 'start' }}
                onClick={() => handleProductClick(product)}
              >
                <div className="relative">
                  <img
                    src={selectedVariant.image}
                    alt={product.name}
                    className="w-full aspect-[3/4] object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="mt-2">
                    <h3 className="text-xs font-medium">{product.name}</h3>
                    <p className="text-xs mt-1">{selectedVariant.price}</p>
                    
                    <div className="flex gap-1.5 mt-2">
                      {product.variants.map((variant, index) => (
                        <button
                          key={index}
                          style={{ backgroundColor: variant.color }}
                          className={`w-4 h-4 rounded-full ${
                            selectedVariants[product.id] === index
                              ? 'ring-1 ring-black ring-offset-1'
                              : ''
                          }`}
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
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
        >
          <FaChevronRight className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default FashionShop;
