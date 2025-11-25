import React from "react";
import { Award, Users, Zap, Heart, TrendingUp, Globe } from "lucide-react";

function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="w-screen bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Our Story
            </h1>
            <p className="text-xl text-blue-100">
              From passion to fashion – delivering quality style to Kenya and beyond.
            </p>
          </div>
        </div>
      </div>

      {/* Mission, Vision, Values */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition">
            <div className="flex justify-center mb-4">
              <Heart className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Our Mission</h3>
            <p className="text-gray-600 text-center">
              To provide affordable, high-quality fashion that empowers individuals to express their unique style and personality.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition">
            <div className="flex justify-center mb-4">
              <Zap className="h-12 w-12 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Our Vision</h3>
            <p className="text-gray-600 text-center">
              To become East Africa's most trusted and innovative fashion e-commerce platform, setting industry standards for quality and customer experience.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition">
            <div className="flex justify-center mb-4">
              <Globe className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Our Values</h3>
            <p className="text-gray-600 text-center">
              Quality, integrity, sustainability, and customer satisfaction drive every decision we make every single day.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Who We Are</h2>
          <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
            <p>
              Ecom was founded with a simple mission: to make quality fashion accessible to everyone in Kenya and beyond. What started as a dream in 2020 has grown into a thriving online fashion destination trusted by thousands of customers.
            </p>
            <p>
              We believe that fashion is not just about clothes – it's about self-expression, confidence, and feeling good. That's why we carefully curate our collection of men's and women's apparel, shoes, and accessories to ensure every item meets our strict quality standards.
            </p>
            <p>
              From sustainable sourcing to rapid delivery, we're committed to making your shopping experience seamless and enjoyable. Our dedicated team works tirelessly behind the scenes to bring you the latest trends while maintaining the timeless classics you love.
            </p>
            <p>
              Whether you're looking for the perfect casual outfit, professional attire, or that special occasion dress, we've got you covered. Join our growing community and discover why thousands of Kenyans choose Ecom for their fashion needs.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">10K+</div>
            <p className="text-gray-600 font-semibold">Happy Customers</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-purple-600 mb-2">5K+</div>
            <p className="text-gray-600 font-semibold">Products</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-green-600 mb-2">98%</div>
            <p className="text-gray-600 font-semibold">Satisfaction Rate</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-600 mb-2">24/7</div>
            <p className="text-gray-600 font-semibold">Customer Support</p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <Award className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Quality</h3>
                <p className="text-gray-600">Every item is carefully selected and quality-tested to ensure durability and style.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <TrendingUp className="h-8 w-8 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Latest Trends</h3>
                <p className="text-gray-600">Stay fashionable with our constantly updated collection of trendy and timeless pieces.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Users className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Team</h3>
                <p className="text-gray-600">Our fashion experts are always ready to help you find the perfect outfit.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Heart className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Customer First</h3>
                <p className="text-gray-600">Your satisfaction is our priority. Easy returns and responsive support guaranteed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Discover our latest collection and find your perfect style today.
          </p>
          <a
            href="/shop"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition"
          >
            Start Shopping
          </a>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;