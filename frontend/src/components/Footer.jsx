import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  Heart,
} from "lucide-react";

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}

      {/* Main Footer Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 max-w-7xl mx-auto mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-3xl font-bold text-white">
                Ecom
              </span>
            </Link>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              Premium fashion destination for style-conscious shoppers. Quality,
              comfort, and timeless design.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <MapPin size={18} className="text-blue-400 flex-shrink-0" />
                <span>Nairobi, Kenya</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone size={18} className="text-blue-400 flex-shrink-0" />
                <span>+254 (0) 700 000 000</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail size={18} className="text-blue-400 flex-shrink-0" />
                <span>support@ecom.com</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-bold text-lg mb-5 text-white">Shop</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/men"
                  className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Men
                </Link>
              </li>
              <li>
                <Link
                  to="/women"
                  className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Women
                </Link>
              </li>
              <li>
                <Link
                  to="/shoes"
                  className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Shoes
                </Link>
              </li>
              <li>
                <Link
                  to="/accessories"
                  className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Accessories
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group font-semibold"
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-lg mb-5 text-white">Support</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Contact Us
                </Link>
          
                <Link
                  to="/orders"
                  className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  to="/FAQs"
                  className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-lg mb-5 text-white">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="https://ezekielwekesa.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Blog
                </a>
              </li>

              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Careers
                </Link>
              </li>
           
            </ul>
          </div>

          {/* Social & Legal */}
          <div>
            <h4 className="font-bold text-lg mb-5 text-white">Connect</h4>
            <div className="flex gap-4 mb-8">
              <a
                href="https://www.facebook.com/zablon.zekky/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-blue-600 transition p-3 rounded-lg text-white"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.instagram.com%2Fez.ekiel1121%3Ffbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExbjVzd2FiV0ZTU1Yxd2E1cHNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR5vUtyJJob73xC-WsVOFzezIle9p8inAylEgPWdMqcGVWviseYmmGLiBspA4w_aem_gH_3oKTuorjDhLO_4OW_bA&h=AT2SqHoaAcQAtcfDsBtbjrirgMb5RWKNij_3l_Ps9EyRnUmtTmYNwBc1zaDoVRhg1icEQ4pSdTn1tDuCx6Qnul9w0hzB80NV9Y-UiOar90RROYwyc8f1ho5UpwAId7GM7vMW"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-pink-600 transition p-3 rounded-lg text-white"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://x.com/Ezekiel1Zablon"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-blue-500 transition p-3 rounded-lg text-white"
              >
                <Twitter size={20} />
              </a>
            </div>

            <h4 className="font-bold text-lg mb-5 text-white">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group text-sm"
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group text-sm"
                >
                  <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 max-w-7xl mx-auto"></div>

        {/* Bottom Section */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Copyright */}
              <div className="text-gray-400 text-sm text-center md:text-left">
                <p>&copy; {currentYear} Ecom. All rights reserved.</p>
              </div>

              {/* Payment Methods */}
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">
                  Secure Payment Methods
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="bg-gray-800 px-2 py-1 rounded text-xs font-semibold">
                    M-PESA
                  </div>
                  <div className="bg-gray-800 px-2 py-1 rounded text-xs font-semibold">
                    Card
                  </div>
                  <div className="bg-gray-800 px-2 py-1 rounded text-xs font-semibold">
                    Bank
                  </div>
                </div>
              </div>

              {/* Made with Love */}
              <div className="text-gray-400 text-sm text-center md:text-right flex items-center justify-center md:justify-end gap-2">
                <span>Made with</span>
                <Heart size={16} className="text-red-500 fill-red-500" />
                <span>in Kenya</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
