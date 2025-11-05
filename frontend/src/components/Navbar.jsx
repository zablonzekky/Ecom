import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { ShoppingCart, User, X, Menu, Search } from "lucide-react";

function Navbar({ mobileMenuOpen, setMobileMenuOpen }) {
  const { user, cart, logout } = useAppContext();
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const cartItemsCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#F4EDE4] shadow-md z-50 border-b border-[#DCC7AA]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <span className="text-3xl font-semibold text-[#6B4F3B] tracking-tight">
              StyleHub
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <Link
              to="/"
              className="text-[#6B4F3B] hover:text-[#A6754D] transition-colors font-medium text-lg"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-[#6B4F3B] hover:text-[#A6754D] transition-colors font-medium text-lg"
            >
              Women
            </Link>
            <Link
              to="/men"
              className="text-[#6B4F3B] hover:text-[#A6754D] transition-colors font-medium text-lg"
            >
              Men
            </Link>
            <Link
              to="/shoes"
              className="text-[#6B4F3B] hover:text-[#A6754D] transition-colors font-medium text-lg"
            >
              Shoes
            </Link>
            <Link
              to="/accessories"
              className="text-[#6B4F3B] hover:text-[#A6754D] transition-colors font-medium text-lg"
            >
              Accessories
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-[#6B4F3B] hover:text-[#A6754D] transition-colors p-2 rounded-full"
            >
              <Search className="h-6 w-6" />
            </button>

            {user ? (
              <div className="relative group">
                <button className="text-[#6B4F3B] hover:text-[#A6754D] transition-colors p-2 rounded-full">
                  <User className="h-6 w-6" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-[#FAF6F0] border border-[#DCC7AA] rounded-lg shadow-lg py-2 hidden group-hover:block">
                  <button
                    onClick={() => navigate("/profile")}
                    className="block px-4 py-2 text-[#6B4F3B] hover:bg-[#EFE4D5] w-full text-left"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => navigate("/orders")}
                    className="block px-4 py-2 text-[#6B4F3B] hover:bg-[#EFE4D5] w-full text-left"
                  >
                    Orders
                  </button>
                  <button
                    onClick={logout}
                    className="block px-4 py-2 text-[#6B4F3B] hover:bg-[#EFE4D5] border-t border-[#DCC7AA] w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="text-[#6B4F3B] hover:text-[#A6754D] transition-colors p-2 rounded-full"
              >
                <User className="h-6 w-6" />
              </button>
            )}

            <button
              onClick={() => navigate("/cart")}
              className="relative text-[#6B4F3B] hover:text-[#A6754D] transition-colors p-2 rounded-full"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#A6754D] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#6B4F3B] p-2 rounded-full"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="py-4 border-t border-[#DCC7AA]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A6754D] h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border border-[#DCC7AA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A6754D] bg-[#FAF6F0] text-[#6B4F3B] placeholder-[#B99976]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF6F0] border-t border-[#DCC7AA] shadow-inner">
          <nav className="px-6 py-6 space-y-2">
            {["Home", "Women", "Men", "Shoes", "Accessories"].map((label) => (
              <Link
                key={label}
                to={`/${label.toLowerCase() === "home" ? "" : label.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-left py-3 px-4 text-[#6B4F3B] hover:bg-[#EFE4D5] rounded-md font-medium"
              >
                {label}
              </Link>
            ))}
            {!user && (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-left py-3 px-4 text-[#6B4F3B] hover:bg-[#EFE4D5] rounded-md font-medium"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
