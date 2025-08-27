// src/pages/AdminLogin.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginAdmin, clearAdminError } from "../features/admin/adminSlice"; // Added clearAdminError
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useEffect } from "react"; // Import useEffect

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.admin); // Destructure directly

    // Clear error on component mount or unmount
    useEffect(() => {
        dispatch(clearAdminError());
        return () => {
            dispatch(clearAdminError());
        };
    }, [dispatch]);

    const primaryGreenDark = "#005612";
    const primaryGreenLight = "#009632";
    const logoTextColor = "#FFFFFF";
    const backgroundColor = "black";
    const textColor = "white";
    const inputBgColor = "black";
    const inputBorderColor = "#d1d5db";
    const inputFocusRingColor = "#2563eb";
    const buttonBgColor = `linear-gradient(to right, ${primaryGreenDark}, ${primaryGreenLight})`;
    const buttonTextColor = "#ffffff";

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous errors before a new login attempt
        dispatch(clearAdminError());

        const resultAction = await dispatch(loginAdmin({ email, password }));

        if (loginAdmin.fulfilled.match(resultAction)) {
            navigate("/admin/dashboard");
        }
        // Error handling is now managed by the extraReducers in adminSlice
        // and displayed via the `error` state.
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative" style={{ background: backgroundColor, fontFamily: "'Playfair Display', serif" }}>
            <div className="w-full max-w-md mx-auto py-12 px-8 rounded-2xl flex-grow-0"
                style={{ backgroundColor: "black", borderRadius: "16px" }}
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center group">
                        <span className="w-14 h-14 flex items-center justify-center rounded-full transform transition-transform duration-200 group-hover:scale-105 shadow-lg"
                            style={{ background: `linear-gradient(to right, ${primaryGreenDark}, ${primaryGreenLight})` }}>
                            <span className="font-extrabold text-3xl" style={{ color: logoTextColor }}>B</span>
                        </span>
                        <span className="pb-2 bg-gradient-to-r from-[#005612] to-[#009632] bg-clip-text text-transparent text-4xl sm:text-5xl font-extrabold ml-4 tracking-wider"
                            style={{ fontFamily: "'Playfair Display', serif", textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                            Admin
                        </span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium" style={{ color: textColor }}>Admin Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            style={{
                                background: inputBgColor,
                                color: textColor,
                                borderColor: inputBorderColor,
                                "--tw-ring-color": inputFocusRingColor,
                            }}
                        />
                        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
                    </div>

                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium" style={{ color: textColor }}>Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 pr-10"
                            style={{
                                background: inputBgColor,
                                color: textColor,
                                borderColor: inputBorderColor,
                                "--tw-ring-color": inputFocusRingColor
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                            style={{ top: '60%', transform: 'translateY(-50%)' }}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>

                    <div className="text-right text-sm">
                        <Link to="/admin/forgot-password" className="font-medium text-gray-400 hover:text-white hover:underline">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg font-semibold transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: buttonBgColor,
                            color: buttonTextColor,
                            boxShadow: `0px 4px 15px rgba(0, 0, 0, 0.2)`
                        }}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </>
                        ) : (
                            "Login as Admin"
                        )}
                    </button>
                </form>

                <p className="text-sm text-center mt-6" style={{ color: textColor }}>
                    Not an admin?{" "}
                    <Link to="/login" className="font-semibold hover:underline" style={{ color: primaryGreenLight }}>
                        Go to user login
                    </Link>
                </p>
            </div>
        </div>
    );
}
