import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AppContext = createContext();
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
};

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);

  // ----- FETCH PRODUCTS -----
  const fetchProductsByCategory = async (categorySlug) => {
    try {
      setIsLoading(true);
      setCurrentCategory(categorySlug);
      
      // Backend expects 'category__slug' parameter (Django filter)
      const data = await api.get(`/products/`, { 
        category__slug: categorySlug 
      });
      
      console.log(`✅ Fetched ${categorySlug} products:`, data);
      setProducts(data.results || data);
    } catch (err) {
      console.error(`Failed to fetch products for category "${categorySlug}":`, err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all products initially
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const data = await api.get("/products/");
        console.log("✅ Fetched all products:", data);
        setProducts(data.results || data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ----- CART FUNCTIONS -----
  const addToCart = (product, size, quantity = 1) => {
    const existingItemIndex = cart.findIndex(
      (item) => item.id === product.id && item.selectedSize === size
    );
    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      setCart((prev) => [
        ...prev,
        {
          ...product,
          selectedSize: size,
          quantity,
          cartItemId: Date.now(),
        },
      ]);
    }
  };

  const removeFromCart = (cartItemId) =>
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));

  const updateCartItemQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () =>
    cart.reduce((total, item) => {
      const price = item.current_price || item.price;
      return total + price * item.quantity;
    }, 0);

  const getCartItemsCount = () =>
    cart.reduce((count, item) => count + item.quantity, 0);

  // ----- ORDER FUNCTIONS -----
  const placeOrder = (orderData) => {
    const newOrder = {
      id: "ORD-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      status: "Processing",
      items: [...cart],
      total: getCartTotal() + 200,
      shippingAddress: { ...orderData.address },
      phoneNumber: orderData.phoneNumber,
      orderDate: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const getOrderById = (orderId) => orders.find((order) => order.id === orderId);

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  // ----- AUTH FUNCTIONS -----
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (!email || !password) throw new Error("Email and password are required");
      const userData = {
        id: Date.now(),
        email,
        name: email.split("@")[0],
        username: email.split("@")[0],
        firstName: email.split("@")[0],
        lastName: "",
        createdAt: new Date().toISOString(),
      };
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    setOrders([]);
  };

  const register = async (email, password, name) => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (!email || !password || !name) throw new Error("All fields are required");
      const [firstName, ...lastNameParts] = name.split(" ");
      const userData = {
        id: Date.now(),
        email,
        name,
        username: name.toLowerCase().replace(/\s+/g, ""),
        firstName,
        lastName: lastNameParts.join(" "),
        createdAt: new Date().toISOString(),
      };
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      console.error("Registration failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = () => !!user;

  // ----- CONTEXT VALUE -----
  const contextValue = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,

    orders,
    placeOrder,
    getOrderById,
    updateOrderStatus,

    user,
    setUser,
    login,
    logout,
    register,
    isAuthenticated,

    products,
    setProducts,
    selectedProduct,
    setSelectedProduct,

    categories,
    setCategories,

    isLoading,
    setIsLoading,

    fetchProductsByCategory,
    currentCategory,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};