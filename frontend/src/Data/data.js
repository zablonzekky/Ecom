export function getDemoProducts() {
  return [
    {
      id: 1,
      name: "Luxe Leather Ankle Boots",
      slug: "luxe-leather-ankle-boots",
      product_type: "shoes",
      price: 12000,
      current_price: 12000,
      discount_percentage: 0,
      is_featured: true,
      category_name: "Footwear",
      average_rating: 4.6,
      review_count: 89,
      stock: 25,
      description:
        "Premium leather ankle boots with elegant design and comfortable fit. Perfect for both casual and formal occasions with superior craftsmanship.",
      primary_image:
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1605812860427-4024433a70fd?auto=format&fit=crop&w=800&q=80"
      ],
      thumbnail:
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&h=300&q=80",
      featured_image:
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&h=400&q=80",
      sizes: [
        { value: "38", stock: 6 },
        { value: "39", stock: 8 },
        { value: "40", stock: 7 },
        { value: "41", stock: 4 }
      ],
      features: [
        "Premium full-grain leather",
        "Comfortable cushioned insole",
        "Durable rubber outsole",
        "Elegant ankle height",
        "Classic versatile design"
      ],
      reviews: [
        {
          id: 1,
          user_name: "Sophia L.",
          rating: 5,
          comment:
            "Absolutely stunning boots! The leather quality is exceptional and they're surprisingly comfortable.",
          date: "2025-09-15",
          verified: true
        }
      ]
    },

    {
      id: 2,
      name: "Earthenware Relaxed Pants",
      slug: "earthenware-relaxed-pants",
      product_type: "clothing",
      price: 13000,
      current_price: 13000,
      discount_percentage: 0,
      is_featured: true,
      category_name: "Bottoms",
      average_rating: 4.4,
      review_count: 67,
      stock: 35,
      description:
        "Comfortable relaxed-fit pants in warm earth tones. Made from sustainable materials with perfect drape for everyday wear.",
      primary_image:
        "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1581952976147-5a2d15d1131e?auto=format&fit=crop&w=800&q=80"
      ],
      thumbnail:
        "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?auto=format&fit=crop&w=300&h=300&q=80",
      featured_image:
        "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?auto=format&fit=crop&w=600&h=400&q=80",
      sizes: [
        { value: "S", stock: 10 },
        { value: "M", stock: 12 },
        { value: "L", stock: 8 },
        { value: "XL", stock: 5 }
      ],
      features: [
        "Sustainable organic cotton",
        "Relaxed comfortable fit",
        "Earth tone colors",
        "Elastic waistband",
        "Perfect for casual wear"
      ],
      reviews: [
        {
          id: 2,
          user_name: "Marcus T.",
          rating: 4,
          comment:
            "Love the earthy colors and comfortable fit. Perfect for my weekend wardrobe.",
          date: "2025-09-12",
          verified: true
        }
      ]
    },

    {
      id: 3,
      name: "Woven Leather Tote Bag",
      slug: "woven-leather-tote-bag",
      product_type: "accessories",
      price: 18900,
      discount_price: 15120,
      current_price: 15120,
      discount_percentage: 20,
      is_featured: true,
      category_name: "Accessories",
      average_rating: 4.8,
      review_count: 124,
      stock: 15,
      description:
        "Handcrafted woven leather tote bag with spacious interior and elegant design. Perfect for work, travel, or everyday use.",
      primary_image:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
      ],
      thumbnail:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&h=300&q=80",
      featured_image:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&h=400&q=80",
      sizes: [{ value: "One Size", stock: 15 }],
      features: [
        "Hand-woven leather construction",
        "Spacious main compartment",
        "Inner zip pocket",
        "Comfortable shoulder straps",
        "Timeless elegant design"
      ],
      reviews: [
        {
          id: 3,
          user_name: "Isabella R.",
          rating: 5,
          comment:
            "This tote is absolutely beautiful! The craftsmanship is outstanding and it's so practical.",
          date: "2025-09-18",
          verified: true
        }
      ]
    },

    {
      id: 4,
      name: "Cashmere Blend Sweater",
      slug: "cashmere-blend-sweater",
      product_type: "clothing",
      price: 13800,
      current_price: 13800,
      discount_percentage: 0,
      is_featured: true,
      category_name: "Tops",
      average_rating: 4.7,
      review_count: 156,
      stock: 28,
      description:
        "Luxurious cashmere blend sweater with soft texture and comfortable fit. Perfect for cool weather with timeless style.",
      primary_image:
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1574180045827-681f8a1a9622?auto=format&fit=crop&w=800&q=80"
      ],
      thumbnail:
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=300&h=300&q=80",
      featured_image:
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&h=400&q=80",
      sizes: [
        { value: "S", stock: 8 },
        { value: "M", stock: 10 },
        { value: "L", stock: 6 },
        { value: "XL", stock: 4 }
      ],
      features: [
        "Premium cashmere blend",
        "Soft comfortable texture",
        "Classic crew neck",
        "Warm yet breathable",
        "Easy to care for"
      ],
      reviews: [
        {
          id: 4,
          user_name: "Emma K.",
          rating: 5,
          comment:
            "The softest sweater I've ever owned! Perfect for autumn days.",
          date: "2025-09-10",
          verified: true
        }
      ]
    },

    {
      id: 5,
      name: "Artisan Ceramic Dinner Set",
      slug: "artisan-ceramic-dinner-set",
      product_type: "home",
      price: 18000,
      discount_price: 14400,
      current_price: 14400,
      discount_percentage: 20,
      is_featured: true,
      category_name: "Home & Living",
      average_rating: 4.9,
      review_count: 78,
      stock: 12,
      description:
        "Handcrafted ceramic dinner set with warm earth tones. Each piece is uniquely made by skilled artisans for your dining table.",
      primary_image:
        "https://images.unsplash.com/photo-1581578024036-8a53975d23ad?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1581578024036-8a53975d23ad?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80"
      ],
      thumbnail:
        "https://images.unsplash.com/photo-1581578024036-8a53975d23ad?auto=format&fit=crop&w=300&h=300&q=80",
      featured_image:
        "https://images.unsplash.com/photo-1581578024036-8a53975d23ad?auto=format&fit=crop&w=600&h=400&q=80",
      sizes: [{ value: "4-Piece Set", stock: 12 }],
      features: [
        "Handcrafted by artisans",
        "Warm earth tone glazes",
        "Microwave and dishwasher safe",
        "Set includes 4 dinner plates",
        "Unique variations in each piece"
      ],
      reviews: [
        {
          id: 5,
          user_name: "David & Sarah M.",
          rating: 5,
          comment:
            "Beautiful set that makes every meal special. The craftsmanship is incredible!",
          date: "2025-09-08",
          verified: true
        }
      ]
    },

    {
      id: 6,
      name: "Organic Linen Tablecloth",
      slug: "organic-linen-tablecloth",
      product_type: "home",
      price: 13600,
      current_price: 13600,
      discount_percentage: 0,
      is_featured: false,
      category_name: "Home & Living",
      average_rating: 4.5,
      review_count: 92,
      stock: 20,
      description:
        "Beautiful organic linen tablecloth in natural earth tones. Adds warmth and elegance to any dining setting.",
      primary_image:
        "https://images.unsplash.com/photo-1581578024036-8a53975d23ad?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1581578024036-8a53975d23ad?auto=format&fit=crop&w=800&q=80"
      ],
      thumbnail:
        "https://images.unsplash.com/photo-1581578024036-8a53975d23ad?auto=format&fit=crop&w=300&h=300&q=80",
      featured_image:
        "https://images.unsplash.com/photo-1581578024036-8a53975d23ad?auto=format&fit=crop&w=600&h=400&q=80",
      sizes: [
        { value: "Rectangular 60x90", stock: 8 },
        { value: "Rectangular 70x120", stock: 7 },
        { value: "Round 130cm", stock: 5 }
      ],
      features: [
        "100% organic linen",
        "Natural earth tone colors",
        "Eco-friendly production",
        "Soft textured feel",
        "Easy to care for"
      ],
      reviews: [
        {
          id: 6,
          user_name: "Grace N.",
          rating: 4,
          comment:
            "Love the natural texture and color. Perfect for our farmhouse table.",
          date: "2025-09-05",
          verified: true
        }
      ]
    },

    {
      id: 7,
      name: "Handwoven Wool Throw Blanket",
      slug: "handwoven-wool-throw-blanket",
      product_type: "home",
      price: 13000,
      discount_price: 10400,
      current_price: 10400,
      discount_percentage: 20,
      is_featured: false,
      category_name: "Home & Living",
      average_rating: 4.6,
      review_count: 145,
      stock: 18,
      description:
        "Cozy handwoven wool throw blanket in warm terracotta tones. Perfect for adding warmth and style to your living space.",
      primary_image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=800&q=80"
      ],
      thumbnail:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=300&h=300&q=80",
      featured_image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&h=400&q=80",
      sizes: [{ value: "130x180 cm", stock: 18 }],
      features: [
        "Handwoven wool construction",
        "Warm terracotta color palette",
        "Soft and cozy texture",
        "Perfect for sofa or bed",
        "Artisanal craftsmanship"
      ],
      reviews: [
        {
          id: 7,
          user_name: "Michael P.",
          rating: 5,
          comment:
            "Incredibly warm and beautiful. The colors are even better in person!",
          date: "2025-08-28",
          verified: true
        }
      ]
    },

    {
      id: 8,
      name: "Terracotta Plant Pot Set",
      slug: "terracotta-plant-pot-set",
      product_type: "home",
      price: 1300,
      current_price: 1300,
      discount_percentage: 0,
      is_featured: false,
      category_name: "Home & Living",
      average_rating: 4.3,
      review_count: 203,
      stock: 50,
      description:
        "Set of three classic terracotta plant pots in varying sizes. Perfect for indoor plants with natural breathable material.",
      primary_image:
        "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80"
      ],
      thumbnail:
        "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=300&h=300&q=80",
      featured_image:
        "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&h=400&q=80",
      sizes: [{ value: "3-Piece Set", stock: 50 }],
      features: [
        "Classic terracotta material",
        "Set of three sizes",
        "Natural breathable clay",
        "Drainage holes included",
        "Timeless rustic appeal"
      ],
      reviews: [
        {
          id: 8,
          user_name: "Lisa K.",
          rating: 4,
          comment:
            "Perfect for my succulent collection. Great value and quality!",
          date: "2025-09-03",
          verified: true
        }
      ]
    }
  ];
}

// Updated categories to match the warm theme
export function getDemoCategories() {
  return [
    {
      id: 1,
      name: "Footwear",
      slug: "footwear",
      description: "Comfortable and stylish shoes for every occasion",
      image:
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80",
      product_count: 15
    },
    {
      id: 2,
      name: "Tops",
      slug: "tops",
      description: "Beautiful tops and sweaters in warm tones",
      image:
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=400&q=80",
      product_count: 22
    },
    {
      id: 3,
      name: "Bottoms",
      slug: "bottoms",
      description: "Comfortable pants and bottoms in earth tones",
      image:
        "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?auto=format&fit=crop&w=400&q=80",
      product_count: 18
    },
    {
      id: 4,
      name: "Accessories",
      slug: "accessories",
      description: "Elegant accessories to complete your look",
      image:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80",
      product_count: 12
    },
    {
      id: 5,
      name: "Home & Living",
      slug: "home-living",
      description: "Warm and inviting home essentials",
      image:
        "https://images.unsplash.com/photo-1581578024036-8a53975d23ad?auto=format&fit=crop&w=400&q=80",
      product_count: 25
    }
  ];
}

// Get featured products
export function getFeaturedProducts() {
  return getDemoProducts().filter(product => product.is_featured);
}

// Get products by category
export function getProductsByCategory(categorySlug) {
  return getDemoProducts().filter(product => 
    product.category_name.toLowerCase().replace("'", "").replace(/ /g, "-").includes(categorySlug.toLowerCase())
  );
}

// Get product by ID
export function getProductById(id) {
  return getDemoProducts().find(product => product.id === parseInt(id));
}

// Get product by slug
export function getProductBySlug(slug) {
  return getDemoProducts().find(product => product.slug === slug);
}

// Get new arrivals (last 4 products)
export function getNewArrivals() {
  const products = getDemoProducts();
  return products.slice(-4);
}

// Get products on sale
export function getProductsOnSale() {
  return getDemoProducts().filter(product => product.discount_percentage > 0);
}

// Search products by name or description
export function searchProducts(query) {
  const lowerQuery = query.toLowerCase();
  return getDemoProducts().filter(product => 
    product.name.toLowerCase().includes(lowerQuery) || 
    product.description.toLowerCase().includes(lowerQuery) ||
    product.category_name.toLowerCase().includes(lowerQuery)
  );
}

// Get related products (same category, excluding current product)
export function getRelatedProducts(productId, limit = 4) {
  const product = getProductById(productId);
  if (!product) return [];
  
  return getDemoProducts()
    .filter(p => p.category_name === product.category_name && p.id !== productId)
    .slice(0, limit);
}

// Get price range for filtering
export function getPriceRange() {
  const products = getDemoProducts();
  const prices = products.map(p => p.current_price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}

// Filter products by price range
export function filterProductsByPrice(minPrice, maxPrice) {
  return getDemoProducts().filter(product => 
    product.current_price >= minPrice && product.current_price <= maxPrice
  );
}

// Sort products
export function sortProducts(products, sortBy) {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.current_price - b.current_price);
    case 'price-high':
      return sorted.sort((a, b) => b.current_price - a.current_price);
    case 'rating':
      return sorted.sort((a, b) => b.average_rating - a.average_rating);
    case 'popular':
      return sorted.sort((a, b) => b.review_count - a.review_count);
    case 'newest':
      return sorted.reverse();
    default:
      return sorted;
  }
}