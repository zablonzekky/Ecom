// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { getDemoProducts, getDemoCategories } from "../Data/data";

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState(getDemoProducts());
  const [categories, setCategories] = useState(getDemoCategories());

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedCart = localStorage.getItem("cart");
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage");
      }
    }
    
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage");
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, size, quantity = 1) => {
    const existingItemIndex = cart.findIndex(
      (item) => item.id === product.id && item.selectedSize === size
    );

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      // Add new item
      setCart((prev) => [
        ...prev,
        {
          ...product,
          selectedSize: size,
          quantity: quantity,
          cartItemId: Date.now(), // Unique ID for cart item
        },
      ]);
    }
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateCartItemQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.current_price || item.price;
      return total + price * item.quantity;
    }, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
  };

  const contextValue = {
    // Cart
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    
    // User
    user,
    setUser,
    login,
    logout,
    
    // Products
    products,
    setProducts,
    selectedProduct,
    setSelectedProduct,
    
    // Categories
    categories,
    setCategories,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};