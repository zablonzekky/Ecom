import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { ShoppingCart, User, X, Menu, Search } from "lucide-react";

function Navbar({ mobileMenuOpen, setMobileMenuOpen }) {
  const { user, cart, logout } = useAppContext();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const cartItemsCount = cart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/men", label: "Men" },
    { to: "/women", label: "Women" },
    { to: "/shoes", label: "Shoes" },
    { to: "/accessories", label: "Accessories" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#FDFBF9] shadow-md z-50 border-b border-[#EADBC8] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <span className="text-3xl font-semibold text-[#5A3E2B] tracking-tight">
              Ecom
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="relative text-[#5A3E2B] no-underline font-medium text-lg transition-all duration-200 hover:text-[#C07A46] after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-[#C07A46] hover:after:w-full after:transition-all after:duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-5">
            {/* Search */}
            {user && (
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-[#5A3E2B] hover:text-[#C07A46] transition-colors p-2 rounded-full"
              >
                <Search className="h-6 w-6" />
              </button>
            )}

            {/* User icon */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="text-[#5A3E2B] hover:text-[#C07A46] transition-colors p-2 rounded-full"
                >
                  <User className="h-6 w-6" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#EADBC8] rounded-xl shadow-lg py-2 z-50 animate-fadeIn">
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setUserMenuOpen(false);
                      }}
                      className="block px-4 py-2 text-[#5A3E2B] hover:bg-[#F7EFE7] w-full text-left"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate("/orders");
                        setUserMenuOpen(false);
                      }}
                      className="block px-4 py-2 text-[#5A3E2B] hover:bg-[#F7EFE7] w-full text-left"
                    >
                      Orders
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                        navigate("/");
                      }}
                      className="block px-4 py-2 text-[#5A3E2B] hover:bg-[#F7EFE7] border-t border-[#EADBC8] w-full text-left"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            {user && (
              <button
                onClick={() => navigate("/cart")}
                className="relative text-[#5A3E2B] hover:text-[#C07A46] transition-colors p-2 rounded-full"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C07A46] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#5A3E2B] p-2 rounded-full hover:text-[#C07A46] transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Search */}
        {searchOpen && user && (
          <div className="py-4 border-t border-[#EADBC8] animate-fadeIn">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C07A46] h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border border-[#EADBC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C07A46] bg-white text-[#5A3E2B] placeholder-[#A98565]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#EADBC8] shadow-inner animate-slideDown">
          <nav className="px-6 py-5 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-left py-3 px-4 text-[#5A3E2B] hover:bg-[#F7EFE7] rounded-md font-medium no-underline"
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <>
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-left py-3 px-4 text-[#5A3E2B] hover:bg-[#F7EFE7] rounded-md font-medium no-underline"
                >
                  Cart
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-left py-3 px-4 text-[#5A3E2B] hover:bg-[#F7EFE7] rounded-md font-medium no-underline"
                >
                  Profile
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-left py-3 px-4 text-[#5A3E2B] hover:bg-[#F7EFE7] rounded-md font-medium no-underline"
                >
                  Orders
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate("/");
                  }}
                  className="block w-full text-left py-3 px-4 text-[#5A3E2B] hover:bg-[#F7EFE7] rounded-md font-medium no-underline"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
