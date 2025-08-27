import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/user/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      alert("Please enter your email/phone and password.");
      return;
    }

    const res = await dispatch(loginUser({ identifier, password }));
    if (res.meta.requestStatus === "fulfilled") {
      navigate("/main");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-black font-serif">
      <div className="w-full max-w-md mx-auto py-12 px-8 rounded-2xl flex-grow-0 bg-white">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center group">
            <span className="w-14 h-14 flex items-center justify-center rounded-full transform transition-transform duration-200 group-hover:scale-105 shadow-lg bg-gradient-to-r from-green-800 to-green-500">
              <span className="font-extrabold text-3xl text-white">B</span>
            </span>
            <span className="pb-2 bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent text-4xl sm:text-5xl font-extrabold ml-4 tracking-wider">
              Luxury
            </span>
          </Link>
        </div>

        {/* Main Customer Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-black">
              Email or Phone Number
            </label>
            <input
              type="text"
              id="identifier"
              placeholder="Enter your email or phone"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-black bg-gray-100 border-gray-300"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-black">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 pr-10 text-black bg-gray-100 border-gray-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          <div className="text-right text-sm">
            <Link to="/forgot-password" className="font-medium text-gray-700 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-white bg-gradient-to-r from-green-800 to-green-500 shadow-md"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}

        <p className="text-sm text-center mt-6 text-black">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-semibold hover:underline text-green-500">
            Sign up here
          </Link>
        </p>
      </div>

      {/* Vendor/Delivery Partner links at the bottom of the screen */}
      <div className="w-80 py-4 border-t border-gray-300 text-center text-white">
        <p className="text-sm mb-3">Are you a vendor or delivery partner?</p>
        <div className="flex justify-center space-x-6">
          <Link to="/vendorlogin" className="text-sm font-medium hover:underline text-green-500">
            Vendor Sign-in
          </Link>
          <Link to="/delivery-login" className="text-sm font-medium hover:underline text-green-500">
            Delivery Partner Sign-in
          </Link>
        </div>
      </div>
    </div>
  );
}