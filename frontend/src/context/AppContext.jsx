import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { API_BASE_URL } from "../services/api";

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

  const BASE = `${API_BASE_URL}/api`;

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

  const fetchUserAddresses = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const response = await fetch(`${BASE}/orders/addresses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await handleApiResponse(response);
        setUserAddresses(data.results || data);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  }, [BASE]);

  const createAddress = async (addressData) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Authentication required");
      const response = await fetch(`${BASE}/orders/addresses/`, {
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
          errorData.detail || errorData.error || `Failed to create address: ${response.status}`
        );
      }
      const address = await handleApiResponse(response);
      setUserAddresses((prev) => [...prev, address]);
      return address;
    } catch (error) {
      console.error("Create address error:", error);
      throw error;
    }
  };

  const fetchUserOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const response = await fetch(`${BASE}/orders/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await handleApiResponse(response);
        setOrders(data.results || data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  }, [BASE]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user_data");
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchUserOrders();
        fetchUserAddresses();
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user_data");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
    setIsLoading(false);
  }, [fetchUserOrders, fetchUserAddresses]);

  const fetchProductsByCategory = async (categorySlug) => {
    try {
      setIsLoading(true);
      setCurrentCategory(categorySlug);
      const res = await api.get("/products/", { params: { category__slug: categorySlug } });
      setProducts(res.data.results || res.data);
    } catch (err) {
      console.error(`Failed to fetch products for category "${categorySlug}":`, err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/products/");
        setProducts(res.data.results || res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

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
        { ...product, selectedSize: size, quantity, cartItemId: Date.now() },
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

  const placeOrder = async (orderData) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Authentication required. Please login again.");
      const address = await createAddress(orderData.address);
      const orderPayload = {
        address_id: address.id,
        items: orderData.items,
        notes: orderData.notes || "",
      };
      const response = await fetch(`${BASE}/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });
      if (!response.ok) {
        const errorData = await handleApiResponse(response);
        throw new Error(
          errorData.error || errorData.detail || `Failed to create order: ${response.status}`
        );
      }
      const order = await handleApiResponse(response);
      setOrders((prev) => [order, ...prev]);
      clearCart();
      return order;
    } catch (error) {
      console.error("Place order error:", error);
      throw error;
    }
  };

  const getOrderById = (orderId) => orders.find((order) => order.id === orderId);

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await handleApiResponse(response);
      if (!response.ok) throw new Error(data.detail || "Login failed");

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      let userData = null;
      try {
        const profileResponse = await fetch(`${BASE}/accounts/profile/`, {  // ← fixed
          headers: { Authorization: `Bearer ${data.access}` },
        });
        if (profileResponse.ok) {
          userData = await handleApiResponse(profileResponse);
        }
      } catch (_) {}

      if (!userData) {
        userData = { email, token: data.access, refreshToken: data.refresh };
      }

      localStorage.setItem("user_data", JSON.stringify(userData));
      setUser(userData);
      await fetchUserOrders();
      await fetchUserAddresses();
      return { success: true, user: userData };
    } catch (err) {
      console.error("Login failed:", err);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithTokens = async (data) => {
    try {
      setIsLoading(true);
      if (!data?.access) throw new Error("No access token returned from social auth.");

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      let userData = data.user || null;
      if (!userData) {
        try {
          const profileResponse = await fetch(`${BASE}/accounts/profile/`, {  // ← fixed
            headers: { Authorization: `Bearer ${data.access}` },
          });
          if (profileResponse.ok) {
            userData = await handleApiResponse(profileResponse);
          }
        } catch (_) {}
      }

      if (!userData) {
        userData = { token: data.access, refreshToken: data.refresh };
      }

      localStorage.setItem("user_data", JSON.stringify(userData));
      setUser(userData);
      await fetchUserOrders();
      await fetchUserAddresses();
      return { success: true, user: userData };
    } catch (err) {
      console.error("Social login failed:", err);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
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
      const response = await fetch(`${BASE}/accounts/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          password2: password,
          first_name: name.split(" ")[0],
          last_name: name.split(" ").slice(1).join(" ") || "",
        }),
      });
      const data = await handleApiResponse(response);
      if (!response.ok) throw new Error(data.detail || data.error || "Registration failed");
      return await login(email, password);
    } catch (err) {
      console.error("Registration failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = () => !!user && !!localStorage.getItem("access_token");

  const fetchProductBySlug = async (slug) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/products/${slug}/`);
      setSelectedProduct(res.data);
    } catch (err) {
      console.error(`Failed to fetch product "${slug}":`, err);
      setSelectedProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart,
    getCartTotal, getCartItemsCount, orders, placeOrder, getOrderById,
    updateOrderStatus, fetchUserOrders, userAddresses, createAddress,
    fetchUserAddresses, user, setUser, login, loginWithTokens, logout,
    register, isAuthenticated, products, setProducts, selectedProduct,
    setSelectedProduct, categories, setCategories, isLoading, setIsLoading,
    fetchProductsByCategory, currentCategory, fetchProductBySlug,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};