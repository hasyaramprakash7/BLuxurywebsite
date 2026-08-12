// src/pages/AdminRegister.jsx
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerAdmin, clearAdminError } from "../features/admin/adminSlice";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";

export default function AdminRegister() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("admin");
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.admin);

    // Clear error on component mount or unmount
    useEffect(() => {
        dispatch(clearAdminError());
        return () => {
            dispatch(clearAdminError());
        };
    }, [dispatch]);

    // Color theme variables matching AdminLogin.jsx
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

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        // Clear previous errors before a new registration attempt
        dispatch(clearAdminError());

        // Dispatch registration action with full payload
        const resultAction = await dispatch(registerAdmin({ name, email, password, phone, role }));

        if (registerAdmin.fulfilled.match(resultAction)) {
            // Navigate to admin login page upon successful registration
            navigate("/admin/login");
        }
    }, [name, email, password, phone, role, dispatch, navigate]);

    return (
        <div 
            className="min-h-screen flex flex-col items-center justify-center relative px-4" 
            style={{ background: backgroundColor, fontFamily: "'Playfair Display', serif" }}
        >
            <div 
                className="w-full max-w-md mx-auto py-12 px-8 rounded-2xl flex-grow-0 border border-gray-800"
                style={{ backgroundColor: "black", borderRadius: "16px" }}
            >
                {/* Brand Logo & Heading */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center group">
                        <span 
                            className="w-14 h-14 flex items-center justify-center rounded-full transform transition-transform duration-200 group-hover:scale-105 shadow-lg"
                            style={{ background: `linear-gradient(to right, ${primaryGreenDark}, ${primaryGreenLight})` }}
                        >
                            <span className="font-extrabold text-3xl" style={{ color: logoTextColor }}>B</span>
                        </span>
                        <span 
                            className="pb-2 bg-gradient-to-r from-[#005612] to-[#009632] bg-clip-text text-transparent text-4xl sm:text-5xl font-extrabold ml-4 tracking-wider"
                            style={{ fontFamily: "'Playfair Display', serif", textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}
                        >
                            Admin Register
                        </span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 font-sans">
                    {/* Global Error Alert Banner */}
                    {error && (
                        <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Full Name Input */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: textColor }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            style={{
                                background: inputBgColor,
                                color: textColor,
                                borderColor: inputBorderColor,
                                "--tw-ring-color": inputFocusRingColor,
                            }}
                        />
                    </div>

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: textColor }}>
                            Admin Email
                        </label>
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
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: textColor }}>
                            Password
                        </label>
                        <div className="relative">
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
                                    "--tw-ring-color": inputFocusRingColor,
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Phone Number Input */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1" style={{ color: textColor }}>
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            style={{
                                background: inputBgColor,
                                color: textColor,
                                borderColor: inputBorderColor,
                                "--tw-ring-color": inputFocusRingColor,
                            }}
                        />
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium mb-1" style={{ color: textColor }}>
                            Role
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 cursor-pointer"
                            style={{
                                background: inputBgColor,
                                color: textColor,
                                borderColor: inputBorderColor,
                                "--tw-ring-color": inputFocusRingColor,
                            }}
                        >
                            <option value="admin" className="bg-black text-white">Admin</option>
                            <option value="superadmin" className="bg-black text-white">Super Admin</option>
                        </select>
                    </div>

                    {/* Submit Button */}
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
                                <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" style={{ color: buttonTextColor }} />
                                Registering...
                            </>
                        ) : (
                            "Register as Admin"
                        )}
                    </button>
                </form>

                {/* Footer Redirection */}
                <p className="text-sm text-center mt-6 font-sans" style={{ color: textColor }}>
                    Already an admin?{" "}
                    <Link to="/admin/login" className="font-semibold hover:underline" style={{ color: primaryGreenLight }}>
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}