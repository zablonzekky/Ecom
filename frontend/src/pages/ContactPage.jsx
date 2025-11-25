import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-2xl p-8">
        
        {/* Header */}
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Contact Us</h1>
        <p className="text-gray-500 mb-8">
          We’d love to hear from you. Fill out the form or reach us directly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Contact Form */}
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Message</label>
              <textarea
                rows="4"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Write your message..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg font-semibold"
            >
              Send Message
            </button>
          </form>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <MapPin className="text-blue-600" />
              <p className="text-gray-700">Nairobi, Kenya</p>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="text-blue-600" />
              <p className="text-gray-700">+254 700 000 000</p>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-blue-600" />
              <p className="text-gray-700">support@ecom.com</p>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Our support team will get back to you within 24 hours.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default ContactPage;
