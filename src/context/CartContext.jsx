import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const CartContext = createContext();

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage if available
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [cartCount, setCartCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Calculate cart count and total amount
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
    
    const amount = cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace('€', ''));
      return total + (price * item.quantity);
    }, 0);
    setTotalAmount(amount);
  }, [cartItems]);
  
  // Add item to cart
  const addToCart = (product) => {
    try {
      setCartItems(prevItems => {
        // Handle different product formats (from WishlistPage vs from ProductDetailsPage)
        const productId = product.id;
        const productSize = product.size;
        const productColor = product.selectedColor || product.color;
        const productQuantity = product.quantity || 1;
        
        // Get price and image based on available properties
        let productPrice, productImage, productName, productColorName;
        
        if (product.variants && product.currentVariantIndex !== undefined) {
          // Format from ProductDetailsPage
          productPrice = product.variants[product.currentVariantIndex].price;
          productImage = product.variants[product.currentVariantIndex].image;
          productName = product.name;
          productColorName = product.variants[product.currentVariantIndex].colorName;
        } else {
          // Format from WishlistPage or elsewhere
          productPrice = product.price;
          productImage = product.image;
          productName = product.name;
          productColorName = product.colorName;
        }
        
        // Check if item already exists in cart
        const existingItemIndex = prevItems.findIndex(
          item => item.id === productId && item.size === productSize && item.color === productColor
        );
        
        if (existingItemIndex > -1) {
          // Update quantity of existing item
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex].quantity += productQuantity;
          return updatedItems;
        } else {
          // Add new item to cart
          return [...prevItems, {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            color: productColor,
            colorName: productColorName,
            size: productSize,
            quantity: productQuantity
          }];
        }
      });
      
      return true; // Return success state that can be used to trigger notifications
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };
  
  // Update item quantity
  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => {
      const updatedItems = [...prevItems];
      updatedItems[index].quantity = newQuantity;
      return updatedItems;
    });
  };
  
  // Remove item from cart
  const removeFromCart = (index) => {
    setCartItems(prevItems => {
      const updatedItems = [...prevItems];
      updatedItems.splice(index, 1);
      return updatedItems;
    });
  };
  
  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };
  
  // Check if product exists in cart
  const isInCart = (id, size, color) => {
    return cartItems.some(item => 
      item.id === id && item.size === size && item.color === color
    );
  };
  
  // Values for the context provider
  const value = {
    cartItems,
    cartCount,
    totalAmount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 