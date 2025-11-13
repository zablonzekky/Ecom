// demoProducts.js

// 🌟 Demo Shoe Data (10 realistic entries)
export function getDemoShoeProducts() {
  return [
    {
      id: 1,
      name: "AirFlex Pro Sneakers",
      slug: "airflex-pro-sneakers",
      product_type: "shoes",
      brand: "Nike",
      price: 14500,
      current_price: 12900,
      discount_percentage: 11,
      is_featured: true,
      category_name: "Footwear",
      average_rating: 4.7,
      review_count: 243,
      stock: 20,
      description:
        "Experience lightweight performance and breathable comfort with the AirFlex Pro — designed for all-day wear and agility.",
      primary_image:
        "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
      ],
      sizes: [
        { value: "38", stock: 6 },
        { value: "39", stock: 8 },
        { value: "40", stock: 7 },
        { value: "41", stock: 4 },
      ],
      features: [
        "Breathable knit upper",
        "Ultra-light midsole",
        "Flexible traction sole",
        "Seamless design",
      ],
      reviews: [
        {
          id: 1,
          user_name: "Daniel M.",
          rating: 5,
          comment: "Super light and comfortable. Perfect for daily running!",
          date: "2025-09-18",
          verified: true,
        },
      ],
    },
    {
      id: 2,
      name: "Adidas SwiftRun X",
      slug: "adidas-swiftrun-x",
      product_type: "shoes",
      brand: "Adidas",
      price: 12500,
      current_price: 11200,
      discount_percentage: 10,
      is_featured: true,
      category_name: "Footwear",
      average_rating: 4.5,
      review_count: 187,
      stock: 30,
      description:
        "Classic streetwear comfort meets modern performance — the SwiftRun X is your go-to sneaker for any outfit.",
      primary_image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1606813908785-05c07e0d92e6?auto=format&fit=crop&w=800&q=80",
      ],
      sizes: [
        { value: "37", stock: 5 },
        { value: "38", stock: 10 },
        { value: "39", stock: 8 },
        { value: "40", stock: 7 },
      ],
      features: [
        "Cushioned EVA sole",
        "Iconic 3-stripe design",
        "Knit mesh upper",
        "Everyday comfort fit",
      ],
      reviews: [
        {
          id: 2,
          user_name: "Lisa G.",
          rating: 4,
          comment: "Stylish and very comfy for walking.",
          date: "2025-08-22",
          verified: true,
        },
      ],
    },
    {
      id: 3,
      name: "Puma RS-X³ Future",
      slug: "puma-rs-x3-future",
      product_type: "shoes",
      brand: "Puma",
      price: 14800,
      current_price: 13200,
      discount_percentage: 11,
      is_featured: true,
      category_name: "Footwear",
      average_rating: 4.6,
      review_count: 134,
      stock: 14,
      description:
        "Bold design and futuristic comfort — RS-X³ Future blends retro inspiration with cutting-edge materials.",
      primary_image:
        "https://images.unsplash.com/photo-1606813895333-0c651b7e9a3f?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1606813895333-0c651b7e9a3f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1584735174644-d4dbf9c9c6b1?auto=format&fit=crop&w=800&q=80",
      ],
      sizes: [
        { value: "39", stock: 6 },
        { value: "40", stock: 4 },
        { value: "41", stock: 4 },
      ],
      features: [
        "Futuristic layered design",
        "Enhanced heel support",
        "Softfoam+ cushioning",
        "Rubberized outsole",
      ],
      reviews: [
        {
          id: 3,
          user_name: "Kevin O.",
          rating: 5,
          comment: "Best sneaker I’ve bought this year. Sturdy and stylish.",
          date: "2025-09-05",
          verified: true,
        },
      ],
    },
    {
      id: 4,
      name: "Timberland Premium 6-Inch Boot",
      slug: "timberland-premium-boot",
      product_type: "shoes",
      brand: "Timberland",
      price: 22000,
      current_price: 19900,
      discount_percentage: 9,
      is_featured: true,
      category_name: "Footwear",
      average_rating: 4.8,
      review_count: 312,
      stock: 12,
      description:
        "Built tough for every season — the classic Timberland Premium boot delivers rugged durability and timeless appeal.",
      primary_image:
        "https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
      ],
      sizes: [
        { value: "40", stock: 5 },
        { value: "41", stock: 4 },
        { value: "42", stock: 3 },
      ],
      features: [
        "Waterproof premium leather",
        "Anti-fatigue comfort sole",
        "Rustproof hardware",
        "Padded collar",
      ],
      reviews: [
        {
          id: 4,
          user_name: "Eric K.",
          rating: 5,
          comment: "Legendary boots. Feels indestructible and looks great.",
          date: "2025-07-29",
          verified: true,
        },
      ],
    },
    {
      id: 5,
      name: "Vans Old Skool Classic",
      slug: "vans-old-skool-classic",
      product_type: "shoes",
      brand: "Vans",
      price: 8900,
      current_price: 8900,
      discount_percentage: 0,
      is_featured: false,
      category_name: "Footwear",
      average_rating: 4.4,
      review_count: 155,
      stock: 25,
      description:
        "Timeless style meets everyday versatility — Vans Old Skool remains an icon for casual comfort and street style.",
      primary_image:
        "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
      ],
      sizes: [
        { value: "38", stock: 10 },
        { value: "39", stock: 8 },
        { value: "40", stock: 7 },
      ],
      features: [
        "Durable canvas & suede",
        "Signature waffle sole",
        "Low-top silhouette",
        "Classic side stripe",
      ],
      reviews: [
        {
          id: 5,
          user_name: "Grace M.",
          rating: 4,
          comment: "Classic sneakers. Go with everything!",
          date: "2025-06-12",
          verified: true,
        },
      ],
    },
  ];
}

// ✅ Helper for sorting, filtering, searching etc.
export function searchShoes(query) {
  const lowerQuery = query.toLowerCase();
  return getDemoShoeProducts().filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.brand.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
  );
}

export function sortShoes(products, sortBy) {
  const sorted = [...products];
  switch (sortBy) {
    case "price-low":
      return sorted.sort((a, b) => a.current_price - b.current_price);
    case "price-high":
      return sorted.sort((a, b) => b.current_price - a.current_price);
    case "rating":
      return sorted.sort((a, b) => b.average_rating - a.average_rating);
    default:
      return sorted;
  }
}
