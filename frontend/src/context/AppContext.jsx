import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AppContext = createContext();
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within an AppProvider");
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
  const [userAddresses, setUserAddresses] = useState([]);

  // API base URL - make sure this matches your Django server
  const API_BASE_URL = "https://ecom-426a.onrender.com/api";

  // Helper function to handle API responses
  const handleApiResponse = async (response) => {
    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response received:", text.substring(0, 200));
      throw new Error(
        `Server returned non-JSON response: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  };

  // Check for existing tokens on app start
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user_data");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Fetch user data after login
        fetchUserOrders();
        fetchUserAddresses();
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user_data");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
  }, []);

  // ----- ADDRESS FUNCTIONS -----
  const createAddress = async (addressData) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      console.log("Creating address with data:", addressData);

      const response = await fetch(`${API_BASE_URL}/orders/addresses/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const errorData = await handleApiResponse(response);
        throw new Error(
          errorData.detail ||
            errorData.error ||
            `Failed to create address: ${response.status}`
        );
      }

      const address = await handleApiResponse(response);
      console.log("Address created successfully:", address);
      setUserAddresses((prev) => [...prev, address]);
      return address;
    } catch (error) {
      console.error("Create address error:", error);
      throw error;
    }
  };

  const fetchUserAddresses = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/orders/addresses/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const addressesData = await handleApiResponse(response);
        setUserAddresses(addressesData.results || addressesData);
      } else {
        console.error("Failed to fetch addresses:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  // ----- FETCH PRODUCTS -----
  const fetchProductsByCategory = async (categorySlug) => {
    try {
      setIsLoading(true);
      setCurrentCategory(categorySlug);

      const data = await api.get(`/products/`, {
        category__slug: categorySlug,
      });

      console.log(`Fetched ${categorySlug} products:`, data);
      setProducts(data.results || data);
    } catch (err) {
      console.error(
        `Failed to fetch products for category "${categorySlug}":`,
        err
      );
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
        console.log("Fetched all products:", data);
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
        item.cartItemId === cartItemId
          ? { ...item, quantity: newQuantity }
          : item
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

// ----- ORDER FUNCTIONS -----
const placeOrder = async (orderData) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("Authentication required. Please login again.");
    }

    console.log("Starting order creation process...");
    console.log("Received order data:", orderData);

    // First create the address
    console.log("Creating address with data:", orderData.address);
    const address = await createAddress(orderData.address);
    console.log("Address created with ID:", address.id);

    // Then create the order with the address ID - Match CreateOrderSerializer exactly
    const orderPayload = {
      address_id: address.id, // Required by serializer
      items: orderData.items, // Required by serializer - list of {product_id, quantity}
      notes: orderData.notes || "", // Optional by serializer
      // NO phone_number field needed - it's in the Address
    };

    console.log("Creating order with final payload:", orderPayload);
    console.log("Items being sent:", orderPayload.items);

    const response = await fetch(`${API_BASE_URL}/orders/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const errorData = await handleApiResponse(response);
      console.error("Order creation error response:", errorData);
      throw new Error(
        errorData.error ||
          errorData.detail ||
          `Failed to create order: ${response.status}`
      );
    }

    const order = await handleApiResponse(response);
    console.log("Order created successfully:", order);

    // Add to local state for immediate UI update
    setOrders((prev) => [order, ...prev]);
    clearCart(); // Clear cart only after successful order creation

    return order;
  } catch (error) {
    console.error("Place order error:", error);
    throw error;
  }
};
  const getOrderById = (orderId) =>
    orders.find((order) => order.id === orderId);

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  // Fetch user orders from backend
  const fetchUserOrders = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/orders/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const ordersData = await handleApiResponse(response);
        setOrders(ordersData.results || ordersData);
      } else {
        console.error("Failed to fetch orders:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  // ----- AUTH FUNCTIONS -----
  const login = async (username, password) => {
    try {
      setIsLoading(true);

      console.log("Attempting login for user:", username);

      // Make direct API call to get tokens
      const response = await fetch(`${API_BASE_URL}/auth/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await handleApiResponse(response);

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Store tokens
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Create user data object
      const userData = {
        id: Date.now(),
        username,
        name: username,
        email: `${username}@example.com`,
        token: data.access,
        refreshToken: data.refresh,
      };

      // Store user data in localStorage and state
      localStorage.setItem("user_data", JSON.stringify(userData));
      setUser(userData);

      // Fetch user's data after login
      await fetchUserOrders();
      await fetchUserAddresses();

      console.log("Login successful");
      return { success: true, user: userData };
    } catch (err) {
      console.error("Login failed:", err);
      // Clear any stored tokens on failed login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear all stored data
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    setUser(null);
    setCart([]);
    setOrders([]);
    setUserAddresses([]);
  };

  const register = async (email, password, name) => {
    try {
      setIsLoading(true);

      console.log("Attempting registration for:", email);

      // You'll need to adjust this to match your registration endpoint
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          email,
          password,
          first_name: name.split(" ")[0],
          last_name: name.split(" ").slice(1).join(" ") || "",
        }),
      });

      const data = await handleApiResponse(response);

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Registration failed");
      }

      console.log("Registration successful");
      // Auto-login after successful registration
      return await login(email, password);
    } catch (err) {
      console.error("Registration failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = () =>
    !!user && !!localStorage.getItem("access_token");

  // Test API connectivity
  const testApiConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      const data = await response.text();
      console.log("API connection test:", data.substring(0, 100));
      return true;
    } catch (error) {
      console.error("API connection failed:", error);
      return false;
    }
  };

  // Test connection on startup
  useEffect(() => {
    testApiConnection();
  }, []);

  // ----- CONTEXT VALUE -----
  const contextValue = {
    // Cart
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,

    // Orders
    orders,
    placeOrder,
    getOrderById,
    updateOrderStatus,
    fetchUserOrders,

    // Addresses
    userAddresses,
    createAddress,
    fetchUserAddresses,

    // Auth
    user,
    setUser,
    login,
    logout,
    register,
    isAuthenticated,

    // Products
    products,
    setProducts,
    selectedProduct,
    setSelectedProduct,

    // Categories
    categories,
    setCategories,

    // Loading
    isLoading,
    setIsLoading,

    // Product fetching
    fetchProductsByCategory,
    currentCategory,

    // Debug
    testApiConnection,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
