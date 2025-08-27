import React, { useState } from "react";
import {
  ShoppingCart,
  Star,
  MapPin,
  Heart,
  Filter,
  Grid,
  List,
  Eye,
  ShoppingBag,
  Package,
  Zap,
  Building,
} from "lucide-react";

// The ProductsSection component now takes props for managing cart and wishlist
const ProductsSection = ({ productsData, cartItems, setCartItems, wishlist, setWishlist }) => {
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Helper component for individual product cards
  const ProductCard = ({ product }) => (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
      <div className="relative p-6">
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => toggleWishlist(product)}
            className={`p-2 rounded-full transition-colors ${wishlist.find(item => item.id === product.id)
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-red-100'
              }`}
          >
            <Heart className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100">
            <Eye className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center mb-4">
          <div className="text-6xl mb-2">{product.image}</div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{product.vendor}</p>
          <p className="text-xs text-gray-400 flex items-center justify-center">
            <MapPin className="w-3 h-3 mr-1" />
            {product.location}
          </p>
        </div>

        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">
              {product.rating} ({product.reviews})
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 justify-center mb-4">
          {product.tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
            )}
          </div>
          {product.bulkPrice && (
            <p className="text-sm text-green-600 mt-1">
              Bulk: ₹{product.bulkPrice} (Min {product.minBulkQty} units)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${product.inStock
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>

          <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-all text-sm">
            Quick View
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section id="products" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Global Product Marketplace
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover millions of products from local groceries to industrial equipment
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {productsData.productCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all ${selectedCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-orange-50'
                }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'
                }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'
                }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <select className="bg-white px-4 py-2 rounded-lg border">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className={`grid gap-6 ${viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
          }`}>
          {productsData.products
            .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full hover:from-orange-600 hover:to-red-600 transition-all">
            Load More Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;

// Example of how you would use this component in your main Landing Page:
/*
import React, { useState } from "react";
// ... other imports ...
import ProductsSection from './ProductsSection'; // Assuming it's in the same directory

const SearchInversLandingPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const searchInversPageData = {
    // ... your other data (header, hero, userTypes, features, stats, testimonials, callToAction, footer)
    productCategories: [
      { id: "all", name: "All Products", icon: Grid },
      { id: "groceries", name: "Groceries", icon: ShoppingBag },
      { id: "beverages", name: "Beverages", icon: Package },
      { id: "snacks", name: "Snacks", icon: Package },
      { id: "electronics", name: "Electronics", icon: Zap },
      { id: "industrial", name: "Industrial", icon: Building },
    ],
    products: [
      { id: 1, name: "Premium Basmati Rice", price: 899, originalPrice: 1199, category: "groceries", rating: 4.8, reviews: 1250, image: "🌾", vendor: "Golden Grains Co.", location: "Punjab, India", inStock: true, bulkPrice: 750, minBulkQty: 10, description: "Premium quality basmati rice, aged for perfect aroma and taste", tags: ["Organic", "Premium", "Bulk Available"] },
      { id: 2, name: "Fresh Milk (1L)", price: 65, originalPrice: 70, category: "beverages", rating: 4.9, reviews: 890, image: "🥛", vendor: "Dairy Fresh Ltd.", location: "Maharashtra, India", inStock: true, bulkPrice: 55, minBulkQty: 24, description: "Farm-fresh milk delivered daily, rich in nutrients", tags: ["Fresh", "Daily", "Healthy"] },
      { id: 3, name: "Mixed Nuts Pack", price: 299, originalPrice: 399, category: "snacks", rating: 4.7, reviews: 650, image: "🥜", vendor: "Nutty Delights", location: "Delhi, India", inStock: true, bulkPrice: 249, minBulkQty: 20, description: "Premium mixed nuts, perfect for healthy snacking", tags: ["Healthy", "Premium", "Protein Rich"] },
      { id: 4, name: "Smartphone - Pro Max", price: 85999, originalPrice: 89999, category: "electronics", rating: 4.6, reviews: 2340, image: "📱", vendor: "Tech Solutions Inc.", location: "Karnataka, India", inStock: true, bulkPrice: 79999, minBulkQty: 5, description: "Latest smartphone with advanced features and premium design", tags: ["Latest", "Premium", "High-Tech"] },
      { id: 5, name: "Industrial Machinery Parts", price: 15999, originalPrice: 18999, category: "industrial", rating: 4.5, reviews: 120, image: "⚙️", vendor: "Industrial Solutions", location: "Gujarat, India", inStock: true, bulkPrice: 14999, minBulkQty: 2, description: "High-quality industrial machinery parts for manufacturing", tags: ["Industrial", "Durable", "Certified"] },
      { id: 6, name: "Energy Drink Pack", price: 120, originalPrice: 150, category: "beverages", rating: 4.4, reviews: 890, image: "⚡", vendor: "Energy Plus", location: "Tamil Nadu, India", inStock: true, bulkPrice: 100, minBulkQty: 12, description: "Refreshing energy drink for instant energy boost", tags: ["Energy", "Refreshing", "Sports"] }
    ],
  };

  return (
    <div>
      {/ * ... your other sections * /}
      <ProductsSection
        productsData={searchInversPageData}
        cartItems={cartItems}
        setCartItems={setCartItems}
        wishlist={wishlist}
        setWishlist={setWishlist}
      />
      {/ * ... your other sections * /}
    </div>
  );
};
*/