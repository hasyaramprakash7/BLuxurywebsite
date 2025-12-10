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
} from "lucide-react";
import { useSelector } from "react-redux";
import img from "../../../assert/Gemini_Generated_Image_acwc6oacwc6oacwc.png"

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
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
            if (window.scrollY > lastScrollY && window.scrollY > 100) {
                setIsVisible(false);
            } else if (window.scrollY < lastScrollY) {
                setIsVisible(true);
            }
            setLastScrollY(window.scrollY);
        }
    }, [lastScrollY]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', handleScroll);
            return () => {
                window.removeEventListener('scroll', handleScroll);
            };
        }
    }, [handleScroll]);

    // --- Close mobile menu when route changes ---
    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    // --- Check if current route is active ---
    const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

    // Combined Nav Items (for desktop and mobile dropdown)
    const navItems = [
        { path: "/main", label: "Home", icon: Home },
        { path: "/insP", label: "Search", icon: Search },
        { path: "/order", label: "Orders", icon: Package },
        // Cart is now REMOVED from the dropdown list but remains in the desktop view
        { path: "/profile", label: "Profile", icon: User },
    ].filter(item => item.path !== "/");

    // Define the Royal Green Gradient and associated colors
    const royalGreenGradientClass = "bg-gradient-to-r from-[#005612] to-[#009632]";
    const activeTextWhiteClass = "text-white";
    const defaultTextClass = "text-white";
    const hoverClass = "hover:bg-white/20 hover:text-white";
    const hoverIconClass = "hover:text-white";

    const renderCartBadge = (sizeClass, iconSize) => (
        <div className="relative">
            <ShoppingCart size={iconSize} className={`${isActive('/cart') ? activeTextWhiteClass : defaultTextClass} ${hoverIconClass}`} />
            <span className={`absolute -top-2 -right-2 text-white text-xs ${sizeClass} rounded-full flex items-center justify-center font-bold shadow-lg transition-all duration-200
                ${cartItemCount > 0
                    ? `${royalGreenGradientClass} animate-pulse`
                    : 'scale-0 opacity-0'
                }
            `}>
                {cartItemCount > 99 ? '99+' : cartItemCount}
            </span>
        </div>
    );

    return (
        <>
            {/* UNIFIED Navigation Bar for all screens */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-green-800 shadow-sm border-b border-gray-100
                ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>

                <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <Link
                            to="/main"
                            className="flex items-center space-x-2 group"
                        >
                            <div className={`w-30 h-30 ${royalGreenGradientClass} rounded-full flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200`}>
                                <img src={img} alt="" className="w-30 h-30 rounded-full" />
                            </div>
                        </Link>

                        {/* Desktop/Wide Screen Navigation (Hidden on small screens) */}
                        <div className="hidden md:flex items-center space-x-1">
                            {navItems.filter(item => item.path !== "/profile").map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive(item.path)
                                        ? `${royalGreenGradientClass} ${activeTextWhiteClass} shadow-sm`
                                        : `${defaultTextClass} ${hoverClass}`
                                        }`}
                                >
                                    <item.icon size={18} className={`${isActive(item.path) ? activeTextWhiteClass : defaultTextClass} ${hoverIconClass}`} />
                                    <span>{item.label}</span>
                                </Link>
                            ))}

                            {/* Desktop Cart Link with Badge (Full text) */}
                            <Link
                                to="/cart"
                                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive('/cart')
                                    ? `${royalGreenGradientClass} ${activeTextWhiteClass} shadow-sm`
                                    : `${defaultTextClass} ${hoverClass}`
                                    }`}
                            >
                                {renderCartBadge('min-w-[18px] h-[18px]', 18)}
                                <span>Cart</span>
                            </Link>

                            {/* Desktop Profile Section */}
                            <Link
                                to="/profile"
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive('/profile')
                                    ? `${royalGreenGradientClass} ${activeTextWhiteClass} shadow-sm`
                                    : `${defaultTextClass} ${hoverClass}`
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full ${royalGreenGradientClass} flex items-center justify-center text-white font-bold text-sm`}>
                                    <User size={18} />
                                </div>
                                <span>Profile</span>
                            </Link>
                        </div>

                        {/* Mobile Action Icons (Visible only on small screens) */}
                        <div className="md:hidden flex items-center space-x-2">
                            {/* **SEPARATE MOBILE CART ICON** */}
                            <Link
                                to="/cart"
                                className={`relative p-2 rounded-lg transition-colors duration-200 ${isActive('/cart')
                                    ? `text-white ${royalGreenGradientClass}`
                                    : `text-white hover:bg-white/20`
                                    }`}
                            >
                                {renderCartBadge('min-w-[14px] h-[14px]', 24)}
                            </Link>

                            {/* Mobile Menu Toggle */}
                            <button
                                className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors duration-200"
                                onClick={() => setMenuOpen(!menuOpen)}
                                aria-controls="mobile-menu"
                                aria-expanded={menuOpen}
                            >
                                {menuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown Navigation */}
                <div id="mobile-menu" className={`md:hidden transition-all duration-300 ease-in-out ${menuOpen
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0 overflow-hidden'
                    }`}>
                    <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/50 px-4 py-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 
                                    ${isActive(item.path)
                                        ? `${royalGreenGradientClass} ${activeTextWhiteClass} shadow-sm`
                                        : `text-gray-700 hover:bg-gray-100 hover:text-[#005612]`
                                    }`}
                            >
                                <item.icon size={20} className={`${isActive(item.path) ? activeTextWhiteClass : 'text-gray-700'} hover:text-[#005612]`} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Spacer to prevent content from going under fixed navbar */}
            <div className="h-16"></div>
        </>
    );
};

export default Navbar;