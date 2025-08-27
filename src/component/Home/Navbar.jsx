import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Menu,
    X,
    ShoppingCart,
    Search,
    Package,
    User,
    Home,
    ShoppingBag
} from "lucide-react";
import { useSelector } from "react-redux";
import img from "../../../assert/Gemini_Generated_Image_acwc6oacwc6oacwc.png"
const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true); // New state to control visibility
    const [lastScrollY, setLastScrollY] = useState(0); // To track scroll direction
    const location = useLocation();

    // Redux state
    const cartItems = useSelector((state) => state.cart.items);
    const cartItemCount = cartItems.reduce(
        (total, item) => total + (item.quantity || 0),
        0
    );

    // --- Handle scroll to hide/show effect ---
    const handleScroll = useCallback(() => {
        if (typeof window !== 'undefined') {
            if (window.scrollY > lastScrollY && window.scrollY > 100) { // Scrolled down more than 100px
                setIsVisible(false);
            } else if (window.scrollY < lastScrollY) { // Scrolled up
                setIsVisible(true);
            }
            setLastScrollY(window.scrollY); // Update last scroll position
        }
    }, [lastScrollY]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', handleScroll);

            // Clean up event listener
            return () => {
                window.removeEventListener('scroll', handleScroll);
            };
        }
    }, [handleScroll]); // Re-run if handleScroll changes

    // --- Close mobile menu when route changes ---
    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    // --- Check if current route is active ---
    const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

    const navItems = [
        { path: "/search", label: "Search", icon: Search },
        { path: "/order", label: "Orders", icon: Package },
    ];

    const bottomNavItems = [
        { path: "/main", icon: Home, label: "Home" },
        { path: "/search", icon: Search, label: "Search" },
        { path: "/cart", icon: ShoppingCart, label: "Cart", badge: cartItemCount },
        { path: "/order", label: "Orders", icon: Package },
        { path: "/profile", icon: User, label: "Profile" },
    ];

    // Define the Royal Green Gradient and associated colors
    const royalGreenGradientClass = "bg-gradient-to-r from-[#005612] to-[#009632]";
    const activeTextWhiteClass = "text-white";

    // Default text colors based on screen size
    const defaultTextLgScreenClass = "text-white";
    const defaultTextSmScreenClass = "text-black";

    // Hover styles
    const hoverLgScreenClass = "hover:bg-white/20 hover:text-white";
    const hoverLgScreenIconClass = "hover:text-white";

    const hoverSmScreenClass = "hover:bg-gray-100 hover:text-[#005612]";
    const hoverSmScreenIconClass = "hover:text-[#005612]";

    return (
        <>
            {/* Main (Top) Navigation Bar - Hidden on small screens (md:hidden) */}
            {/* Added 'transform' and 'translate-y-full' for the hide/show animation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 md:block hidden bg-green-800 shadow-sm border-b border-gray-100
                ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link
                            to="/main"
                            className="ml-9 flex items-center space-x-2 group"
                        >
                            <div className={`w-30 h-30 ${royalGreenGradientClass} rounded-full  flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200`}>
                                <img src={img} alt="" className="w-30  h-30 rounded-full" />
                            </div>
                            
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive(item.path)
                                        ? `${royalGreenGradientClass} ${activeTextWhiteClass} shadow-sm`
                                        : `${defaultTextLgScreenClass} ${hoverLgScreenClass}`
                                        }`}
                                >
                                    <item.icon size={18} className={`${isActive(item.path) ? activeTextWhiteClass : defaultTextLgScreenClass} ${hoverLgScreenIconClass}`} />
                                    <span>{item.label}</span>
                                </Link>
                            ))}

                            {/* Cart Link with Enhanced Badge */}
                            <Link
                                to="/cart"
                                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive('/cart')
                                    ? `${royalGreenGradientClass} ${activeTextWhiteClass} shadow-sm`
                                    : `${defaultTextLgScreenClass} ${hoverLgScreenClass}`
                                    }`}
                            >
                                <div className="relative">
                                    <ShoppingCart size={18} className={`${isActive('/cart') ? activeTextWhiteClass : defaultTextLgScreenClass} ${hoverLgScreenIconClass}`} />
                                    <span className={`absolute -top-2 -right-2 text-white text-xs min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold shadow-lg transition-all duration-200
                                        ${cartItemCount > 0
                                            ? `${royalGreenGradientClass} animate-pulse`
                                            : 'scale-0 opacity-0'
                                        }
                                    `}>
                                        {cartItemCount > 99 ? '99+' : cartItemCount}
                                    </span>
                                </div>
                                <span>Cart</span>
                            </Link>
                        </div>

                        {/* Profile Section */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                to="/profile"
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive('/profile')
                                    ? `${royalGreenGradientClass} ${activeTextWhiteClass} shadow-sm`
                                    : `${defaultTextLgScreenClass} ${hoverLgScreenClass}`
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full ${royalGreenGradientClass} flex items-center justify-center text-white font-bold text-sm`}>
                                    <User size={18} />
                                </div>
                                <span>Profile</span>
                            </Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-controls="mobile-menu"
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation (Dropdown) */}
                <div id="mobile-menu" className={`md:hidden transition-all duration-300 ease-in-out ${menuOpen
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0 overflow-hidden'
                    }`}>
                    <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/50 px-4 py-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive(item.path)
                                    ? `${royalGreenGradientClass} ${activeTextWhiteClass} shadow-sm`
                                    : `${defaultTextSmScreenClass} ${hoverSmScreenClass}`
                                    }`}
                            >
                                <item.icon size={20} className={`${isActive(item.path) ? activeTextWhiteClass : defaultTextSmScreenClass} ${hoverSmScreenIconClass}`} />
                                <span>{item.label}</span>
                            </Link>
                        ))}

                        {/* Mobile Cart Link */}
                        <Link
                            to="/cart"
                            className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive('/cart')
                                ? `${royalGreenGradientClass} ${activeTextWhiteClass} shadow-sm`
                                : `${defaultTextSmScreenClass} ${hoverSmScreenClass}`
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <ShoppingCart size={20} className={`${isActive('/cart') ? activeTextWhiteClass : defaultTextSmScreenClass} ${hoverSmScreenIconClass}`} />
                                <span>Cart</span>
                            </div>
                            <span className={`text-white text-xs min-w-[20px] h-[20px] rounded-full flex items-center justify-center font-bold transition-all duration-200
                                ${cartItemCount > 0
                                    ? `${royalGreenGradientClass}`
                                    : 'scale-0 opacity-0'
                                }
                            `}>
                                {cartItemCount > 99 ? '99+' : cartItemCount}
                            </span>
                        </Link>

                        {/* Mobile Profile Link */}
                        <Link
                            to="/profile"
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive('/profile')
                                ? `${royalGreenGradientClass} ${activeTextWhiteClass} shadow-sm`
                                : `${defaultTextSmScreenClass} ${hoverSmScreenClass}`
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full ${royalGreenGradientClass} flex items-center justify-center text-white font-bold text-xs`}>
                                <User size={14} />
                            </div>
                            <span>Profile</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Spacer to prevent content from going under fixed navbar */}
            <div className="h-16 md:block hidden"></div>

            {/* Mobile Bottom Navigation - Only visible on small screens */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
                <div className="flex items-center justify-around py-1">
                    {bottomNavItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                                ? `${activeTextWhiteClass} ${royalGreenGradientClass}`
                                : `${defaultTextSmScreenClass} ${hoverSmScreenClass}`
                                }`}
                        >
                            <div className="relative">
                                <item.icon size={20} className={`${isActive(item.path) ? activeTextWhiteClass : defaultTextSmScreenClass} ${hoverSmScreenIconClass}`} />
                                {/* Mobile bottom nav badge */}
                                {item.path === "/cart" && (
                                    <span className={`absolute -top-1 -right-1 text-white text-xs min-w-[14px] h-[14px] rounded-full flex items-center justify-center font-bold transition-all duration-200
                                        ${item.badge && item.badge > 0
                                            ? `${royalGreenGradientClass}`
                                            : 'scale-0 opacity-0'
                                        }
                                    `}>
                                        {item.badge && item.badge > 0 ? (item.badge > 9 ? '9+' : item.badge) : ''}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-medium mt-1">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Navbar;