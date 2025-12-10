import React, { useState, useEffect } from "react"; // 👈 Import useEffect
import { useDispatch, useSelector } from "react-redux";
import { loginDeliveryBoy } from "../features/delivery/deliveryBoySlice";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Bike } from "lucide-react"; // Using Bike icon for delivery boy
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa"; // For password toggle and spinner

// Simple Modal Component (replaces alert())
const Modal = ({ message, onClose }) => {
    // Light theme colors for the modal, consistent with the main form
    const modalBg = "#FFFFFF"; // White background for modal content
    const modalTextColor = "#1a1a1a"; // Dark text
    const buttonBg = "#f0f0f0"; // Light grey button
    const buttonHoverBg = "#e0e0e0"; // Slightly darker hover

    if (!message) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="rounded-lg shadow-xl p-6 max-w-sm w-full text-center"
                style={{
                    backgroundColor: modalBg,
                    color: modalTextColor,
                    border: "1px solid rgba(0, 0, 0, 0.1)", // Subtle border
                    fontFamily: "'Playfair Display', serif" // Apply Playfair Display
                }}
            >
                <p className="mb-6 text-lg font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className="px-6 py-2 rounded-lg font-semibold transition duration-200"
                    style={{
                        backgroundColor: buttonBg,
                        color: modalTextColor,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = buttonHoverBg}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = buttonBg}
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default function DeliveryBoyLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility
    const [loginError, setLoginError] = useState(""); // State for login error messages
    const [modalMessage, setModalMessage] = useState(""); // State for modal messages

    const dispatch = useDispatch();
    const navigate = useNavigate();
    // Destructure 'token' (or deliveryBoy profile) along with 'loading' and 'error'
    const { token, loading, error } = useSelector((state) => state.deliveryBoyAuth);

    // 💡 NEW LOGIC: Check for existing login status and redirect
    useEffect(() => {
        // If loading is false (initial token check complete in App.js) AND token is present, redirect.
        if (!loading && token) {
            navigate("/delivery-dashboard", { replace: true });
        }
    }, [token, loading, navigate]); // Depend on token, loading, and navigate

    // Define colors for consistency - Matching Login.jsx
    const primaryGreenDark = "#005612"; // Darker royal green
    const primaryGreenLight = "#009632"; // Lighter royal green
    const logoTextColor = "#FFFFFF"; // White for the 'B' in the logo circle

    // Light theme colors (copied from Login.jsx)
    const backgroundColor = "#FFFFFF"; // White page background
    const textColor = "#1a1a1a"; // Dark text for general content
    const inputBgColor = "#f0f0f0"; // Very light grey for inputs
    const inputBorderColor = "#d1d5db"; // Light grey border for inputs
    const inputFocusRingColor = "#2563eb"; // A standard blue for focus
    const buttonBgColor = `linear-gradient(to right, ${primaryGreenDark}, ${primaryGreenLight})`; // Main button gradient
    const buttonTextColor = "#ffffff"; // White button text
    const errorColor = "#ef4444"; // Red for errors

    // Function to show modal messages
    const showModal = (message) => {
        setModalMessage(message);
    };

    // Close modal
    const closeModal = () => {
        setModalMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError(""); // Clear previous errors

        // Basic client-side validation
        if (!email || !password) {
            setLoginError("Please enter both email and password.");
            return;
        }

        try {
            const res = await dispatch(loginDeliveryBoy({ email, password }));
            if (loginDeliveryBoy.fulfilled.match(res)) {
                // Check if the user was already redirected by the useEffect (unlikely here, but safe)
                if (!token) {
                    showModal("Login successful! Redirecting to dashboard.");
                    navigate("/delivery-dashboard");
                }
            } else if (loginDeliveryBoy.rejected.match(res)) {
                // Use the error message from the payload if available
                const errorMessage = res.payload?.message || "Login failed. Please check your credentials.";
                setLoginError(errorMessage);
            }
        } catch (err) {
            console.error("Login error:", err);
            setLoginError("An unexpected error occurred during login.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{
                background: backgroundColor, // White background
                fontFamily: "'Playfair Display', serif" // Apply Playfair Display globally
            }}
        >
            {/* The main content container, now without card styling */}
            <div className="w-full max-w-md p-8 flex-grow-0">
                {/* Branding/Logo Section - Replicated from Login.jsx */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center group">
                        <span
                            className={`w-14 h-14 flex items-center justify-center rounded-full transform transition-transform duration-200 group-hover:scale-105 shadow-lg`}
                            style={{
                                background: `linear-gradient(to right, ${primaryGreenDark}, ${primaryGreenLight})`,
                            }}
                        >
                            <span className="font-extrabold text-3xl" style={{ color: logoTextColor }}>B</span>
                        </span>
                        <span
                            className="pb-2 bg-gradient-to-r from-[#005612] to-[#009632] bg-clip-text text-transparent text-4xl sm:text-5xl font-extrabold ml-4 tracking-wider" // Adjusted font size for consistency
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                textShadow: '2px 2px 4px rgba(0,0,0,0.1)', // Added text shadow for consistency
                            }}
                        >
                            Luxury
                        </span>
                    </Link>
                    {/* Delivery Partner specific title and subtitle */}
                    <h2 className="text-3xl font-extrabold mb-2 tracking-tight mt-6" style={{ fontFamily: "'Playfair Display', serif", color: textColor }}>Delivery Partner Login</h2> {/* Adjusted font size */}
                    <p className="text-lg" style={{ fontFamily: "'Playfair Display', serif", color: textColor }}>Access your delivery dashboard</p>
                </div>

                {/* Conditional rendering for form/loading state */}
                {loading && !token ? (
                    <div className="text-center py-12">
                        <FaSpinner className="animate-spin h-8 w-8 text-green-500 mx-auto" />
                        <p className="mt-4 text-gray-700">Checking authentication...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6"> {/* Increased spacing */}
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} /> {/* Icon color adjusted for light theme */}
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setLoginError(""); }}
                                    required
                                    className="pl-10 pr-4 py-2.5 w-full border rounded-lg focus:ring-2 focus:outline-none transition duration-200"
                                    style={{
                                        background: inputBgColor,
                                        color: textColor, // Changed text color to dark
                                        borderColor: inputBorderColor,
                                        boxShadow: `inset 0 1px 3px rgba(0,0,0,0.1)`, // Subtle inset shadow for inputs
                                        "--tw-ring-color": inputFocusRingColor,
                                        fontFamily: "'Playfair Display', serif"
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} /> {/* Icon color adjusted for light theme */}
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
                                    required
                                    className="pl-10 pr-10 py-2.5 w-full border rounded-lg focus:ring-2 focus:outline-none transition duration-200"
                                    style={{
                                        background: inputBgColor,
                                        color: textColor, // Changed text color to dark
                                        borderColor: inputBorderColor,
                                        boxShadow: `inset 0 1px 3px rgba(0,0,0,0.1)`, // Subtle inset shadow for inputs
                                        "--tw-ring-color": inputFocusRingColor,
                                        fontFamily: "'Playfair Display', serif"
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none" // Adjusted icon color for light theme
                                    style={{ top: '60%', transform: 'translateY(-50%)' }}
                                >
                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg font-semibold transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: buttonBgColor, // Royal green gradient
                                color: buttonTextColor,
                                boxShadow: `0px 4px 15px rgba(0, 0, 0, 0.2)`, // Subtle shadow for button lift, matching Login.jsx
                                fontFamily: "'Playfair Display', serif"
                            }}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" style={{ color: buttonTextColor }} />
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>

                        {/* Error Message */}
                        {(loginError || error) && ( // Display local error or Redux error
                            <p className="text-sm font-medium mt-4 p-2 rounded-lg border text-center"
                                style={{
                                    color: errorColor, // Red error text
                                    backgroundColor: "rgba(239, 68, 68, 0.1)", // Light red transparent background
                                    borderColor: errorColor,
                                    fontFamily: "'Playfair Display', serif"
                                }}
                            >
                                {loginError || error}
                            </p>
                        )}
                    </form>
                )}

                {/* Link to Register */}
                <p className="text-sm text-center mt-6" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>
                    Don’t have a delivery account?{" "}
                    <Link to="/delivery-register" className="font-semibold hover:underline" style={{ color: primaryGreenLight, fontFamily: "'Playfair Display', serif" }}>
                        Register here
                    </Link>
                </p>

                {/* Link to User Login (optional) */}
                <p className="text-xs text-center mt-2" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>
                    Not a delivery partner?{" "}
                    <Link to="/login" className="underline hover:text-gray-700" style={{ color: textColor }}> {/* Adjusted hover color for light theme */}
                        Login as User
                    </Link>
                </p>
            </div>
            <Modal message={modalMessage} onClose={closeModal} />
        </div>
    );
}