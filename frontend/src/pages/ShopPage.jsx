import { useAppContext } from "../context/AppContext";
import React, { useState } from "react";
import { Star } from "lucide-react";
import ProductCard from "../components/ProductCard";


// Shop Page
function ShopPage() {
  const { products, categories } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'all' && product.product_type !== selectedCategory) return false;
    if (selectedGender !== 'all' && product.category_name && !product.category_name.toLowerCase().includes(selectedGender)) return false;
    
    if (priceRange !== 'all') {
      const price = product.current_price || product.price;
      if (priceRange === 'under-2000' && price >= 2000) return false;
      if (priceRange === '2000-5000' && (price < 2000 || price >= 5000)) return false;
      if (priceRange === 'over-5000' && price < 5000) return false;
    }
    
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop All Products</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Category</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === 'all'}
                  onChange={() => setSelectedCategory('all')}
                  className="mr-2"
                />
                All
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === 'shoes'}
                  onChange={() => setSelectedCategory('shoes')}
                  className="mr-2"
                />
                Shoes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === 'clothing'}
                  onChange={() => setSelectedCategory('clothing')}
                  className="mr-2"
                />
                Clothing
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Gender</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  checked={selectedGender === 'all'}
                  onChange={() => setSelectedGender('all')}
                  className="mr-2"
                />
                All
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  checked={selectedGender === 'men'}
                  onChange={() => setSelectedGender('men')}
                  className="mr-2"
                />
                Men
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  checked={selectedGender === 'women'}
                  onChange={() => setSelectedGender('women')}
                  className="mr-2"
                />
                Women
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Price Range</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange === 'all'}
                  onChange={() => setPriceRange('all')}
                  className="mr-2"
                />
                All Prices
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange === 'under-2000'}
                  onChange={() => setPriceRange('under-2000')}
                  className="mr-2"
                />
                Under KES 2,000
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange === '2000-5000'}
                  onChange={() => setPriceRange('2000-5000')}
                  className="mr-2"
                />
                KES 2,000 - 5,000
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange === 'over-5000'}
                  onChange={() => setPriceRange('over-5000')}
                  className="mr-2"
                />
                Over KES 5,000
              </label>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-4 text-gray-600">
            Showing {filteredProducts.length} products
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ShopPage;