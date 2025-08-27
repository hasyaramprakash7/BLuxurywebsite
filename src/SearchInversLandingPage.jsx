import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Search,
  User,
  ShoppingCart,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  Play,
  Star,
  MapPin,
  Shield,
  Zap,
  Truck,
  Package,
  CheckCircle,
  Menu,
  X,
  Heart,
  Filter,
  Grid,
  List,
  Plus,
  Minus,
  Eye,
  Globe,
  Users,
  Building,
  Store,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  Percent,
  ShoppingBag,
  UserPlus,
  LogIn,
  Palette, // New icon for the color picker
} from "lucide-react";
import img from "../assert/Gemini_Generated_Image_acwc6oacwc6oacwc.png"
// Assuming react-router-dom is set up in the parent application
import { Link } from 'react-router-dom';
// Assuming these are external components and will be styled consistently
import VendorOrderList from "./VendorComponents/VendorOrderList";
import AllVendorProducts from "./VendorComponents/AllVendorProducts";
import VendorShopProducts from "./VendorComponents/VendorShopProducts";
import VenderProduct from "./VendorComponents/VenderProduct";
import SearchInversPitchDeck from "./SearchInversPitchDeck";
import CategoryGrid from "./CategoryGrid";

// Launch date: 3 months from now
const LAUNCH_DATE = new Date("2025-10-14T00:00:00");

// Define color themes
const themes = {
  royalGreen: {
    primaryDark: "#005612", // Deep Royal Green (from user's gradient)
    primaryLight: "#009632", // Medium Royal Green (from user's gradient)
    accent: "#FFD700", // Gold
    secondaryAccent: "#4169E1", // Royal Blue for contrast/highlights
    background: "#F8F8F8", // Light background for main content (was white)
    cardBg: "#FFFFFF", // White for cards/modals
    text: "#1A1A1A", // Dark text (for elements not getting gradient)
    lightText: "#4A4A4A", // Slightly lighter dark text (for elements not getting gradient)
    inputBg: "#EEEEEE", // Light grey for inputs
    inputBorder: "#CCCCCC", // Medium grey for input borders
    inputFocusRing: "#009632", // Green for focus
    error: "#DC2626", // Red
    gradientFrom: "#009632", // Green for gradients
    gradientTo: "#005612", // Deep Forest Green for gradients
    heroGradientFrom: "#005612", // Deep Royal Green for hero
    heroGradientVia: "#009632", // Medium Royal Green for hero
    heroGradientTo: "#003300", // Even deeper green for hero background
    heroText: "#FFFFFF", // White text for hero section
  },
  emeraldKingdom: {
    primaryDark: "#006400", // Dark Green
    primaryLight: "#008000", // Green
    accent: "#FFD700", // Gold
    secondaryAccent: "#4169E1", // Royal Blue for highlights
    background: "#F8F8F8", // Light background
    cardBg: "#FFFFFF", // White
    text: "#1A1A1A",
    lightText: "#4A4A4A",
    inputBg: "#EEEEEE",
    inputBorder: "#CCCCCC",
    inputFocusRing: "#008000",
    error: "#DC2626",
    gradientFrom: "#008000",
    gradientTo: "#006400",
    heroGradientFrom: "#006400",
    heroGradientVia: "#008000",
    heroGradientTo: "#228B22", // Forest Green
    heroText: "#FFFFFF",
  },
  deepAmethyst: {
    primaryDark: "#4B0082", // Indigo
    primaryLight: "#8A2BE2", // Blue Violet
    accent: "#FFD700", // Gold
    secondaryAccent: "#006400", // Dark Green for highlights
    background: "#F8F8F8", // Light background
    cardBg: "#FFFFFF", // White
    text: "#1A1A1A",
    lightText: "#4A4A4A",
    inputBg: "#EEEEEE",
    inputBorder: "#CCCCCC",
    inputFocusRing: "#8A2BE2",
    error: "#DC2626",
    gradientFrom: "#8A2BE2",
    gradientTo: "#4B0082",
    heroGradientFrom: "#4B0082",
    heroGradientVia: "#8A2BE2",
    heroGradientTo: "#9932CC", // Dark Orchid
    heroText: "#FFFFFF",
  },
  // Added a dark theme for contrast and luxury feel
  midnightSapphire: {
    primaryDark: "#1A202C", // Dark Slate Gray
    primaryLight: "#2D3748", // Darker Gray
    accent: "#FFD700", // Gold
    secondaryAccent: "#4169E1", // Royal Blue
    background: "#0F172A", // Dark background
    cardBg: "#1E293B", // Darker card background
    text: "#E2E8F0", // Light text
    lightText: "#A0AEC0", // Lighter gray text
    inputBg: "#2D3748", // Dark input background
    inputBorder: "#4A5568", // Dark input border
    inputFocusRing: "#FFD700", // Gold for focus
    error: "#EF4444", // Red
    gradientFrom: "#4A5568", // Gray for gradient
    gradientTo: "#2D3748", // Darker Gray for gradient
    heroGradientFrom: "#0F172A", // Dark background
    heroGradientVia: "#1E293B", // Darker background
    heroGradientTo: "#2D3748", // Even darker background
    heroText: "#FFD700", // Gold text for hero section
  },
  // New theme for black background, white text, and green-white mix for highlights
  darkGreenWhite: {
    primaryDark: "#004D00", // Darker Green
    primaryLight: "#008000", // Medium Green
    accent: "#FFFFFF", // White as accent
    secondaryAccent: "#90EE90", // Light Green for secondary accent
    background: "#000000", // Fully Black background
    cardBg: "#111111", // Very dark grey for cards
    text: "#FFFFFF", // White text
    lightText: "#CCCCCC", // Lighter white text
    inputBg: "#333333", // Dark grey for inputs
    inputBorder: "#555555", // Medium grey for input borders
    inputFocusRing: "#00CC00", // Bright Green for focus
    error: "#FF4444", // Red for errors
    gradientFrom: "#00CC00", // Bright Green for gradients
    gradientTo: "#FFFFFF", // White for gradients
    heroGradientFrom: "#004D00", // Dark Green for hero start
    heroGradientVia: "#008000", // Medium Green for hero middle
    heroGradientTo: "#002200", // Even darker green for hero end
    heroText: "#FFFFFF", // White text for hero section
  }
};

const SearchInversLandingPage = () => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [currentTheme, setCurrentTheme] = useState("darkGreenWhite"); // Default theme set to new darkGreenWhite
  const [showColorPanel, setShowColorPanel] = useState(false); // Declare showColorPanel state

  const colors = themes[currentTheme]; // Get current theme colors

  // Define a general text shadow style (subtler for quiet luxury)
  const subtleTextShadowStyle = { textShadow: '1px 1px 2px rgba(0,0,0,0.3)' };

  // Define gradient text style
  const gradientTextStyle = {
    background: `linear-gradient(to right, ${colors.gradientFrom}, ${colors.gradientTo})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent', // Fallback for non-webkit browsers
    fontWeight: 'bold',
  };

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = LAUNCH_DATE.getTime() - now;

      if (distance < 0) {
        setTimeLeft("App Launched!");
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const searchInversPageData = {
    header: {
      logoText: "Search Invers",
      navLinks: ["Home", "Products", "Features", "How It Works", "Download", "Contact"],
    },
    hero: {
      title: "Global Commerce Hub for Everyone!",
      description:
        "Search Invers connects retailers, wholesalers, consumers, and industries worldwide. From local groceries to global trade - experience seamless commerce at every scale.",
      buttons: [
        { text: "Start Shopping", type: "primary" },
        { text: "Watch Demo", type: "primary" },
      ],
    },
    userTypes: [
      {
        title: "Consumers",
        description: "Shop groceries, daily essentials, and more with real-time tracking",
        icon: User,
        features: ["Home Delivery", "Live Tracking", "Combo Deals", "Secure Payment"]
      },
      {
        title: "Retailers",
        description: "Manage inventory, bulk orders, and supplier relationships",
        icon: Store,
        features: ["Bulk Ordering", "Inventory Management", "Supplier Network", "Analytics"]
      },
      {
        title: "Wholesalers",
        description: "Reach more customers, manage large orders, and scale business",
        icon: Building,
        features: ["Order Management", "Customer Network", "Bulk Discounts", "Distribution"]
      },
      {
        title: "Industries",
        description: "B2B commerce, supply chain management, and global trade",
        icon: Globe,
        features: ["Supply Chain", "Global Trade", "B2B Solutions", "Enterprise Tools"]
      }
    ],
    productCategories: [
      { id: "all", name: "All Products", icon: Grid },
      { id: "groceries", name: "Groceries", icon: ShoppingBag },
      { id: "beverages", name: "Beverages", icon: Package },
      { id: "snacks", name: "Snacks", icon: Package },
      { id: "electronics", name: "Electronics", icon: Zap },
      { id: "industrial", name: "Industrial", icon: Building },
    ],
    products: [
      {
        id: 1,
        name: "Premium Basmati Rice",
        price: 899,
        originalPrice: 1199,
        category: "groceries",
        rating: 4.8,
        reviews: 1250,
        image: "🌾",
        vendor: "Golden Grains Co.",
        location: "Punjab, India",
        inStock: true,
        bulkPrice: 750,
        minBulkQty: 10,
        description: "Premium quality basmati rice, aged for perfect aroma and taste",
        tags: ["Organic", "Premium", "Bulk Available"]
      },
      {
        id: 2,
        name: "Fresh Milk (1L)",
        price: 65,
        originalPrice: 70,
        category: "beverages",
        rating: 4.9,
        reviews: 890,
        image: "🥛",
        vendor: "Dairy Fresh Ltd.",
        location: "Maharashtra, India",
        inStock: true,
        bulkPrice: 55,
        minBulkQty: 24,
        description: "Farm-fresh milk delivered daily, rich in nutrients",
        tags: ["Fresh", "Daily", "Healthy"]
      },
      {
        id: 3,
        name: "Mixed Nuts Pack",
        price: 299,
        originalPrice: 399,
        category: "snacks",
        rating: 4.7,
        reviews: 650,
        image: "🌰", // Corrected emoji
        vendor: "Nutty Delights",
        location: "Delhi, India",
        inStock: true,
        bulkPrice: 249,
        minBulkQty: 20,
        description: "Premium mixed nuts, perfect for healthy snacking",
        tags: ["Healthy", "Premium", "Protein Rich"]
      },
      {
        id: 4,
        name: "Smartphone - Pro Max",
        price: 85999,
        originalPrice: 89999,
        category: "electronics",
        rating: 4.6,
        reviews: 2340,
        image: "📱",
        vendor: "Tech Solutions Inc.",
        location: "Karnataka, India",
        inStock: true,
        bulkPrice: 79999,
        minBulkQty: 5,
        description: "Latest smartphone with advanced features and premium design",
        tags: ["Latest", "Premium", "High-Tech"]
      },
      {
        id: 5,
        name: "Industrial Machinery Parts",
        price: 15999,
        originalPrice: 18999,
        category: "industrial",
        rating: 4.5,
        reviews: 120,
        image: "⚙️",
        vendor: "Industrial Solutions",
        location: "Gujarat, India",
        inStock: true,
        bulkPrice: 14999,
        minBulkQty: 2,
        description: "High-quality industrial machinery parts for manufacturing",
        tags: ["Industrial", "Durable", "Certified"]
      },
      {
        id: 6,
        name: "Energy Drink Pack",
        price: 120,
        originalPrice: 150,
        category: "beverages",
        rating: 4.4,
        reviews: 890,
        image: "⚡",
        vendor: "Energy Plus",
        location: "Tamil Nadu, India",
        inStock: true,
        bulkPrice: 100,
        minBulkQty: 12,
        description: "Refreshing energy drink for instant energy boost",
        tags: ["Energy", "Refreshing", "Sports"]
      }
    ],
    features: [
      {
        icon: Globe,
        title: "Global Marketplace",
        description: "Connect with vendors and customers worldwide across all industries.",
      },
      {
        icon: MapPin,
        title: "Real-Time Tracking",
        description: "Track orders from local deliveries to international shipments.",
      },
      {
        icon: Users,
        title: "Multi-User Platform",
        description: "Designed for consumers, retailers, wholesalers, and industries.",
      },
      {
        icon: Shield,
        title: "Secure Trading",
        description: "Advanced security for all transaction types and user levels.",
      },
    ],
    stats: [
      { number: "1M+", label: "Global Users" },
      { number: "50K+", label: "Vendor Partners" },
      { number: "200+", label: "Countries" },
      { number: "99.9%", label: "Uptime" },
    ],
    testimonials: [
      {
        name: "Rajesh Kumar",
        role: "Retail Chain Owner",
        content: "Search Invers transformed our supply chain. We now source from global suppliers with complete transparency and tracking.",
        rating: 5,
        avatar: "👨‍💼",
      },
      {
        name: "Sarah Johnson",
        role: "Home Customer - USA",
        content: "Amazing platform! I can get authentic Indian groceries delivered to my doorstep in New York with real-time tracking.",
        rating: 5,
        avatar: "👩‍🦳",
      },
      {
        name: "Ahmed Hassan",
        role: "Industrial Supplier - UAE",
        content: "The B2B features are incredible. Managing international orders and payments has never been easier.",
        rating: 5,
        avatar: "👨‍💻",
      },
    ],
    callToAction: {
      title: "Join the Global Commerce Revolution!",
      description: "Whether you're a consumer, retailer, wholesaler, or industry player - there's a place for you in our global marketplace.",
      appStoreLinks: [
        { text: "📱 Google Play", url: "#" },
        { text: "🍎 App Store", url: "#" },
        { text: "🌐 Web Platform", url: "#" },
      ],
    },
    footer: {
      copyright: `© ${new Date().getFullYear()} Search Invers. All rights reserved.`,
      socialIcons: [Instagram, Facebook, Twitter],
      contactInfo: [
        { icon: Mail, text: "global@searchinvers.com" },
        { icon: Phone, text: "+91 98765 43210" },
      ],
    },
  };

  const AuthModal = () => (
    showAuthModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="rounded-2xl p-8 max-w-md w-full" style={{ backgroundColor: colors.cardBg, color: colors.text }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ ...gradientTextStyle }}>
              {authMode === "login" ? "Login" : "Sign Up"}
            </h2>
            <button
              onClick={() => setShowAuthModal(false)}
              className="text-gray-500 hover:text-gray-700"
              style={{ color: colors.lightText }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form className="space-y-4">
            {authMode === "signup" && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.lightText }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  placeholder="Enter your full name"
                  style={{
                    background: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                    "--tw-ring-color": colors.inputFocusRing,
                  }}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.lightText }}>
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="+91 98765 43210"
                style={{
                  background: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                  "--tw-ring-color": colors.inputFocusRing,
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.lightText }}>
                User Type
              </label>
              <select
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  background: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                  "--tw-ring-color": colors.inputFocusRing,
                }}
              >
                <option value="consumer">Consumer</option>
                <option value="retailer">Retailer</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="industry">Industry</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-90"
              style={{
                background: `linear-gradient(to right, ${colors.gradientFrom}, ${colors.gradientTo})`,
                color: colors.heroText,
                boxShadow: `0px 4px 15px rgba(0, 0, 0, 0.2)`,
                ...subtleTextShadowStyle
              }}
            >
              {authMode === "login" ? "Send OTP" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p style={{ color: colors.lightText }}>
              {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                className="ml-1 font-semibold hover:underline"
                style={{ color: colors.primaryLight }}
              >
                {authMode === "login" ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  );

  const NavBar = () => (
    <nav className={`fixed w-full z-50 transition-all duration-300 'bg-transparent'
      `} style={{ backgroundColor: 'transparent' }}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="text-center">
            <Link to="/main" className="inline-flex items-center group">
              <span
                className={`w-14 h-14 flex items-center justify-center rounded-full transform transition-transform duration-200 group-hover:scale-105 shadow-lg`}
                style={{
                  background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`,
                }}
              >
                <img src={img} alt="" className="rounded-full" />
              </span>
              {/* <span
                className="pb-2 bg-gradient-to-r bg-clip-text text-transparent text-3xl p-1 pt-3 sm:text-3xl font-extrabold tracking-wider"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  backgroundImage: `linear-gradient(to right, ${colors.gradientFrom}, ${colors.gradientTo})`,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                Luxury
              </span> */}
            </Link>
          </div>

          {/* Desktop Menu */}


          {/* Auth Buttons & Cart */}
          <div className="hidden md:flex items-center mt-20 space-x-4">
            <div className="relative">
              <button className={`p-2 rounded-full transition-colors hover:bg-opacity-20`}
                style={{ color: colors.text, backgroundColor: `${colors.accent}10` }}>
                <ShoppingCart className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    style={{ backgroundColor: colors.error, color: colors.heroText, ...subtleTextShadowStyle }}>
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>

            <Link
              to="/login"
              onClick={() => {
                setAuthMode("login");
                setShowAuthModal(true);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all hover:bg-opacity-10`}
              style={{
                background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`,
                color: colors.text,
                backgroundColor: 'transparent',
              }}
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>

            <Link
              to="/signup"
              onClick={() => {
                setAuthMode("signup");
                setShowAuthModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all hover:opacity-90"
              style={{
                background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`
                , color: colors.heroText, ...subtleTextShadowStyle
              }}
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ?
              <X className={`w-6 h-6`} style={{ color: colors.text }} /> :
              <Menu className={`w-6 h-6`} style={{ color: colors.text }} />
            }
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full shadow-lg"
            style={{ backgroundColor: colors.cardBg }}>
            <div className="px-6 py-4 space-y-4">
              {searchInversPageData.header.navLinks.map((link, index) => (
                <a
                  key={index}
                  href={`#${link.toLowerCase().replace(' ', '-')}`}
                  className="block transition-colors font-medium hover:text-opacity-80"
                  style={{ color: colors.text }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link}
                </a>
              ))}
              <div className="border-t pt-4 space-y-2" style={{ borderColor: colors.inputBorder }}>
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuthModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border rounded-full transition-all hover:bg-opacity-10"
                  style={{ borderColor: colors.inputBorder, color: colors.text, backgroundColor: 'transparent' }}
                >
                  <LogIn className="w-4 h-4" style={{
                    background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`,
                  }} />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => {
                    setAuthMode("signup");
                    setShowAuthModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-full hover:opacity-90"
                  style={{ background: `linear-gradient(to right, ${colors.gradientFrom}, ${colors.gradientTo})`, color: colors.heroText, ...subtleTextShadowStyle }}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav >
  );

  const HeroSection = () => (
    <section id="home" className="relative h-full  pt-10 overflow-hidden  flex  items-center justify-center"
      style={{
        background: `
        
black        
        `,
      }}>

      {/* Animated Background Elements (subtler) */}
      <div
        className="absolute top-20 left-10 w-20 h-20 rounded-full animate-bounce-slow opacity-10"
        style={{ backgroundColor: colors.heroText, animationDelay: "0s" }}
      />
      <div
        className="absolute top-40 right-20 w-16 h-16 rounded-full animate-bounce-slow opacity-10"
        style={{ backgroundColor: colors.heroText, animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-20 left-1/4 w-12 h-12 rounded-full animate-bounce-slow opacity-10"
        style={{ backgroundColor: colors.heroText, animationDelay: "2s" }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Logo in Hero */}
          <div className="text-center mb-8">
            <Link to="/main" className="inline-flex items-center group">
              <span
                className={`w-64 h-64 flex items-center justify-center rounded-full transform transition-transform duration-200 group-hover:scale-105 shadow-lg`}
                style={{
                  background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`,
                }}
              >
                <img src={img} alt="" className="rounded-full" />
              </span>
              {/* <span
                className="pb-2 bg-gradient-to-r bg-clip-text text-transparent text-4xl sm:text-5xl font-extrabold ml-4 tracking-wider"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  backgroundImage: `linear-gradient(to right, ${colors.gradientFrom}, ${colors.gradientTo})`,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',

                }}
              >
                Luxury
              </span> */}
            </Link>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{ color: colors.heroText, ...subtleTextShadowStyle }}>
            {searchInversPageData.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 tracking-wider" style={{ color: colors.heroText, ...subtleTextShadowStyle }}>
            {searchInversPageData.hero.description}
          </p>

          {/* Buttons */}
          <div className="flex gap-4 flex-wrap justify-center mb-8">
            <button className="group px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2 hover:opacity-90"
              style={{ backgroundColor: colors.cardBg, color: colors.text, ...subtleTextShadowStyle }}>
              <span className="font-semibold">
                {searchInversPageData.hero.buttons[0].text}
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2 hover:opacity-90"
              style={{
                background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`,
                color: colors.heroText, ...subtleTextShadowStyle
              }}>
              <span className="font-semibold">
                {searchInversPageData.hero.buttons[1].text}
              </span>
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* User Types Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {searchInversPageData.userTypes.map((type, index) => (
              <div
                key={index}
                className="backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${colors.heroText}20`, color: colors.heroText, ...subtleTextShadowStyle
                }}
              >
                <type.icon className="w-4 h-4 inline mr-2" />
                {type.title}
              </div>
            ))}
          </div>



          {/* Countdown Timer */}
          {timeLeft && (
            <div className="inline-block backdrop-blur-sm px-6 py-3 rounded-full" style={{ backgroundColor: `${colors.heroText}20` }}>
              <p className="text-sm font-medium" style={{ color: colors.heroText, ...subtleTextShadowStyle }}>
                🚀 Global Launch In:{" "}
                <span className="font-bold" style={{ color: colors.heroText, ...subtleTextShadowStyle }}>{timeLeft}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const UserTypesSection = () => (
    <section className="py-20" style={{ backgroundColor: colors.background }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{
            ...gradientTextStyle, background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`
          }}>
            Built for Everyone, Everywhere
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: colors.lightText }}>
            From individual consumers to global industries - our platform scales with your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {searchInversPageData.userTypes.map((type, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border"
              style={{ backgroundColor: "black", borderColor: colors.inputBorder }}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                style={{
                  background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`,
                }}
              >
                <type.icon className="w-8 h-8" style={{ color: colors.heroText }} />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "white" }}>
                {type.title}
              </h3>
              <p className="mb-4" style={{ color: "white" }}>{type.description}</p>
              <div className="space-y-2">
                {type.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm" style={{ color: "white", }}>
                    <CheckCircle className="w-4 h-4 mr-2" style={{ color: colors.secondaryAccent }} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const ProductCard = ({ product }) => (
    <div className="group rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
      style={{ backgroundColor: colors.cardBg }}>
      <div className="relative p-6">
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => toggleWishlist(product)}
            className={`p-2 rounded-full transition-colors hover:bg-opacity-20`}
            style={{ backgroundColor: wishlist.find(item => item.id === product.id) ? colors.error : colors.inputBg, color: wishlist.find(item => item.id === product.id) ? colors.heroText : colors.lightText }}
          >
            <Heart className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-full hover:bg-opacity-20"
            style={{ backgroundColor: colors.inputBg, color: colors.lightText }}>
            <Eye className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center mb-4">
          <div className="text-6xl mb-2" style={{ color: colors.text }}>{product.image}</div>
          <h3 className="font-bold text-lg mb-1" style={{ color: colors.text }}>{product.name}</h3>
          <p className="text-sm mb-2" style={{ color: colors.lightText }}>{product.vendor}</p>
          <p className="text-xs flex items-center justify-center" style={{ color: colors.lightText }}>
            <MapPin className="w-3 h-3 mr-1" style={{ color: colors.lightText }} />
            {product.location}
          </p>
        </div>

        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-current" style={{ color: colors.accent }} />
            <span className="text-sm ml-1" style={{ color: colors.lightText }}>
              {product.rating} ({product.reviews})
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 justify-center mb-4">
          {product.tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-1 text-xs rounded-full"
              style={{ backgroundColor: `${colors.accent}20`, color: colors.accent }}>
              {tag}
            </span>
          ))}
        </div>

        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl font-bold" style={{ color: colors.text }}>₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm line-through" style={{ color: colors.lightText }}>₹{product.originalPrice}</span>
            )}
          </div>
          {product.bulkPrice && (
            <p className="text-sm mt-1" style={{ color: colors.lightText }}>
              Bulk: ₹{product.bulkPrice} (Min {product.minBulkQty} units)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 hover:opacity-90 ${product.inStock
              ? ''
              : 'cursor-not-allowed'
              }`}
            style={{ background: `linear-gradient(to right, ${colors.gradientFrom}, ${colors.gradientTo})`, color: colors.heroText, ...subtleTextShadowStyle }}
          >
            <ShoppingCart className="w-4 h-4" style={{ color: colors.heroText }} />
            <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>

          <button className="w-full border py-2 rounded-lg hover:bg-opacity-10 transition-all text-sm"
            style={{ borderColor: colors.inputBorder, color: colors.text, backgroundColor: 'transparent' }}>
            Quick View
          </button>
        </div>
      </div>
    </div>
  );

  const ProductsSection = () => (
    <section id="products" className="py-20" style={{ backgroundColor: colors.background }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ ...gradientTextStyle }}>
            Global Product Marketplace
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: colors.lightText }}>
            Discover millions of products from local groceries to industrial equipment
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {searchInversPageData.productCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all hover:opacity-90 ${selectedCategory === category.id
                ? ''
                : ''
                }`}
              style={{
                background: selectedCategory === category.id
                  ? `linear-gradient(to right, ${colors.gradientFrom}, ${colors.gradientTo})`
                  : colors.cardBg,
                color: selectedCategory === category.id ? colors.heroText : colors.lightText,
                ...subtleTextShadowStyle
              }}
            >
              <category.icon className="w-4 h-4" style={{ color: selectedCategory === category.id ? colors.heroText : colors.lightText }} />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors hover:opacity-90`}
              style={{
                backgroundColor: viewMode === 'grid' ? colors.primaryLight : colors.cardBg,
                color: viewMode === 'grid' ? colors.heroText : colors.lightText,
                ...subtleTextShadowStyle
              }}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors hover:opacity-90`}
              style={{
                backgroundColor: viewMode === 'list' ? colors.primaryLight : colors.cardBg,
                color: viewMode === 'list' ? colors.heroText : colors.lightText,
                ...subtleTextShadowStyle
              }}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border hover:bg-opacity-10"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.inputBorder, color: colors.text }}>
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <select className="px-4 py-2 rounded-lg border"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.inputBorder, color: colors.text }}>
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${viewMode === 'grid'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1'
          }`}>
          {searchInversPageData.products
            .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 rounded-full transition-all hover:opacity-90"
            style={{ background: `linear-gradient(to right, ${colors.gradientFrom}, ${colors.gradientTo})`, color: colors.heroText, ...subtleTextShadowStyle }}>
            Load More Products
          </button>
        </div>
      </div>
    </section>
  );

  const StatsSection = () => (
    <section className="py-20" style={{ backgroundColor: colors.cardBg }}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {searchInversPageData.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ ...gradientTextStyle }}>
                {stat.number}
              </div>
              <div style={{ color: colors.lightText }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const FeaturesSection = () => (
    <section id="features" className="py-20" style={{ backgroundColor: colors.background }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{
            ...gradientTextStyle, background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`,
          }}>
            Why Choose Search Invers?
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: colors.lightText }}>
            Experience the future of global commerce with our cutting-edge platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {searchInversPageData.features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              style={{ backgroundColor: colors.cardBg }}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                style={{
                  background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`,
                }}
              >
                <feature.icon className="w-8 h-8" style={{ color: colors.heroText }} />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: colors.text }}>
                {feature.title}
              </h3>
              <p style={{ color: colors.lightText }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const HowItWorksSection = () => (
    <section id="how-it-works" className="py-20" style={{ backgroundColor: colors.cardBg }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{
            ...gradientTextStyle, background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`,
          }}>
            How It Works
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: colors.lightText }}>
            Simple steps to connect with global commerce
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Sign Up & Choose Type",
              description: "Create account as consumer, retailer, wholesaler, or industry player",
              icon: UserPlus,
            },
            {
              step: "2",
              title: "Browse & Connect",
              description: "Explore global marketplace and connect with verified vendors",
              icon: Search,
            },
            {
              step: "3",
              title: "Trade & Track",
              description: "Make secure transactions and track orders worldwide",
              icon: Truck,
            },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`,
                  }}>
                  <item.icon className="w-10 h-10" style={{ color: colors.heroText, }} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`, color: colors.heroText, ...subtleTextShadowStyle }}>
                  {item.step}
                </div>
              </div>
              <h3 className="font-bold text-xl mb-2" style={{ color: colors.text }}>
                {item.title}
              </h3>
              <p style={{ color: colors.lightText }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const TestimonialsSection = () => (
    <section className="py-20" style={{ backgroundColor: colors.background }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{
            ...gradientTextStyle, background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`,
          }}>
            Global Success Stories
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: colors.lightText }}>
            Hear from our users across the world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {searchInversPageData.testimonials.map((testimonial, index) => (
            <div key={index} className="p-6 rounded-2xl shadow-lg" style={{
              background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`,
            }}>
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-current"
                    style={{ color: colors.accent }}
                  />
                ))}
              </div>
              <p className="mb-4" style={{ color: colors.text }}>"{testimonial.content}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3"
                  style={{ backgroundColor: colors.inputBg, color: colors.text }}>
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold" style={{ color: colors.text }}>
                    {testimonial.name}
                  </div>
                  <div className="text-sm" style={{ color: colors.lightText }}>
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const DownloadSection = () => (
    <section
      id="download"
      className="py-20"
      style={{ backgroundColor: colors.background }}
    >
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ ...gradientTextStyle, ...subtleTextShadowStyle }}>
          {searchInversPageData.callToAction.title}
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90" style={{ color: colors.lightText, ...subtleTextShadowStyle }}>
          {searchInversPageData.callToAction.description}
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          {searchInversPageData.callToAction.appStoreLinks.map(
            (link, index) => (
              <a
                key={index}
                href={link.url}
                className="backdrop-blur-sm px-8 py-4 rounded-full transition-all transform hover:scale-105 flex items-center space-x-2 hover:opacity-90"
                style={{ backgroundColor: `${colors.primaryDark}20`, color: colors.text, ...subtleTextShadowStyle }}
              >
                <span className="font-semibold">{link.text}</span>
              </a>
            )
          )}
        </div>
      </div>
    </section>
  );

  const FooterSection = () => (
    <footer id="contact" className="py-12" style={{ backgroundColor: colors.cardBg }}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            {/* Logo */}
            <div className="text-center mb-10">
              <Link to="/main" className="inline-flex items-center group">
                <span
                  className={`w-24 h-14 flex items-center justify-center rounded-full transform transition-transform duration-200 group-hover:scale-105 shadow-lg`}
                  style={{
                    background: `linear-gradient(to right, ${colors.primaryDark}, ${colors.primaryLight})`,
                  }}
                >
                  <img src={img} alt="" className="rounded-full" />
                </span>
                {/* <span
                  className="pb-2 bg-gradient-to-r bg-clip-text text-transparent text-3xl p-1 pt-3 sm:text-3xl font-extrabold tracking-wider"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    backgroundImage: `linear-gradient(to right, ${colors.gradientFrom}, ${colors.gradientTo})`,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  Luxury
                </span> */}
              </Link>
            </div>
            <p className="mb-4" style={{ color: colors.lightText }}>
              Your global commerce partner connecting consumers, retailers, wholesalers, and industries worldwide.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{ color: colors.text }}>Quick Links</h3>
            <div className="space-y-2 text-sm">
              <a href="#home" className="block hover:underline" style={{ color: colors.lightText, '&:hover': { color: colors.accent } }}>Home</a>
              <a href="#products" className="block hover:underline" style={{ color: colors.lightText, '&:hover': { color: colors.accent } }}>Products</a>
              <a href="#features" className="block hover:underline" style={{ color: colors.lightText, '&:hover': { color: colors.accent } }}>Features</a>
              <a href="#download" className="block hover:underline" style={{ color: colors.lightText, '&:hover': { color: colors.accent } }}>Download</a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{ color: colors.text }}>Contact Info</h3>
            <div className="space-y-2">
              {searchInversPageData.footer.contactInfo.map((info, index) => (
                <p key={index} className="flex items-center text-sm" style={{ color: colors.lightText }}>
                  <info.icon className="w-4 h-4 mr-2" style={{ color: colors.inputBorder }} />
                  {info.text}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{ color: colors.text }}>Follow Us</h3>
            <div className="flex space-x-4">
              {searchInversPageData.footer.socialIcons.map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-90"
                  style={{ backgroundColor: colors.inputBg, color: colors.lightText }}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center" style={{ borderColor: colors.inputBorder }}>
          <p style={{ color: colors.lightText }}>
            {searchInversPageData.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="font-inter" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Global CSS for fonts and transitions */}
      <style>
        {`
          /* Custom scrollbar for a refined look */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: ${colors.background};
          }
          ::-webkit-scrollbar-thumb {
            background: ${colors.lightText};
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: ${colors.text};
          }

          /* Smooth transitions for all elements */
          * {
            transition: all 0.3s ease-in-out;
          }

          /* Playfair Display for serif headings */
          .font-playfair {
            font-family: 'Playfair Display', serif;
          }

          /* Inter for sans-serif body text */
          .font-inter {
            font-family: 'Inter', sans-serif;
          }

          /* Custom glow effect for search bar focus */
          .input-focus-glow:focus {
            box-shadow: 0 0 0 2px ${colors.inputFocusRing}80; /* Theme-based glow */
            border-color: ${colors.inputFocusRing}; /* Theme-based border */
          }

          /* Custom button hover effect */
          .btn-hover-effect:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          }

          /* Custom loading spinner animation */
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin 1.5s linear infinite;
          }

          /* Custom bounce animation for hero elements */
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 4s infinite ease-in-out;
          }
        `}
      </style>

      <AuthModal />
      <NavBar />
      <HeroSection />
      <SearchInversPitchDeck />
      {/* Uncomment the desired product display component */}
      {/* <AllVendorProducts /> */}
      <VenderProduct /> {/* Using VenderProduct as it was uncommented in your provided code */}
      {/* <VendorShopProducts /> */}
      <CategoryGrid />

      <UserTypesSection />
      <StatsSection />

      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <DownloadSection />
      <FooterSection />

      {/* Color Panel */}
      <div className={`fixed right-0 top-1/3 z-50 transition-transform duration-300 ${showColorPanel ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex">
          <button
            onClick={() => setShowColorPanel(!showColorPanel)}
            className="p-3 rounded-l-lg shadow-lg flex items-center justify-center"
            style={{ backgroundColor: colors.primaryDark, color: colors.heroText }}
          >
            <Palette className="w-6 h-6" />
          </button>
          <div className="p-4 rounded-l-lg shadow-lg space-y-3" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.inputBorder}` }}>
            <h4 className="font-bold mb-2" style={{ color: colors.text }}>Choose Theme</h4>
            {Object.keys(themes).map((themeName) => (
              <button
                key={themeName}
                onClick={() => setCurrentTheme(themeName)}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
                style={{
                  backgroundColor: currentTheme === themeName ? colors.inputBg : 'transparent',
                  color: colors.text,
                  border: `1px solid ${currentTheme === themeName ? colors.primaryLight : 'transparent'}`,
                }}
              >
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: themes[themeName].primaryLight }}></span>
                <span>{themeName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchInversLandingPage;
