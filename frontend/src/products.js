// Demo data for when API is not available
export function getDemoProducts() {
  return [
    {
      id: 1,
      name: "Classic Leather Sneakers",
      slug: "classic-leather-sneakers",
      product_type: "shoes",
      price: 4500,
      discount_price: 3600,
      current_price: 3600,
      discount_percentage: 20,
      is_featured: true,
      category_name: "Men's Shoes",
      average_rating: 4.5,
      review_count: 24,
      stock: 50,
      description: "Premium leather sneakers with cushioned sole for all-day comfort."
    },
    {
      id: 2,
      name: "Women's Running Shoes",
      slug: "womens-running-shoes",
      product_type: "shoes",
      price: 5200,
      current_price: 5200,
      discount_percentage: 0,
      is_featured: true,
      category_name: "Women's Shoes",
      average_rating: 4.8,
      review_count: 45,
      stock: 30,
      description: "Lightweight running shoes with breathable mesh and excellent support."
    },
    {
      id: 3,
      name: "Cotton T-Shirt - Men",
      slug: "cotton-tshirt-men",
      product_type: "clothing",
      price: 1200,
      current_price: 1200,
      discount_percentage: 0,
      is_featured: true,
      category_name: "Men's Clothing",
      average_rating: 4.3,
      review_count: 67,
      stock: 100,
      description: "100% cotton t-shirt, soft and comfortable for everyday wear."
    },
    {
      id: 4,
      name: "Women's Summer Dress",
      slug: "womens-summer-dress",
      product_type: "clothing",
      price: 3500,
      discount_price: 2800,
      current_price: 2800,
      discount_percentage: 20,
      is_featured: true,
      category_name: "Women's Clothing",
      average_rating: 4.7,
      review_count: 32,
      stock: 25,
      description: "Elegant summer dress perfect for any occasion."
    }
  ];
}

function getDemoCategories() {
  return [
    { id: 1, name: "Men's Shoes", slug: "mens-shoes", gender: "M" },
    { id: 2, name: "Women's Shoes", slug: "womens-shoes", gender: "W" },
    { id: 3, name: "Men's Clothing", slug: "mens-clothing", gender: "M" },
    { id: 4, name: "Women's Clothing", slug: "womens-clothing", gender: "W" }
  ];
}