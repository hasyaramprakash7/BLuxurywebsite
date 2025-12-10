import React, { useState, useEffect } from "react"; // 👈 Import useEffect
import { useDispatch, useSelector } from "react-redux";
import { loginVendor } from "../features/vendor/vendorAuthSlice";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";

// Simple Modal Component
const Modal = ({ message, onClose }) => {
  const modalBg = "#FFFFFF";
  const modalTextColor = "#1a1a1a";
  const buttonBg = "#f0f0f0";
  const buttonHoverBg = "#e0e0e0";

  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg shadow-xl p-6 max-w-sm w-full text-center"
        style={{
          backgroundColor: modalBg,
          color: modalTextColor,
          border: "1px solid rgba(0, 0, 0, 0.1)",
          fontFamily: "'Playfair Display', serif"
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

export default function VendorLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Destructure 'vendor' along with 'loading' and 'error'
  const { vendor, loading, error } = useSelector((state) => state.vendorAuth);

  const primaryGreenDark = "#005612";
  const primaryGreenLight = "#009632";
  const logoTextColor = "#FFFFFF";

  const backgroundColor = "#FFFFFF";
  const textColor = "#1a1a1a";
  const inputBgColor = "#f0f0f0";
  const inputBorderColor = "#d1d5db";
  const inputFocusRingColor = "#2563eb";
  const buttonBgColor = `linear-gradient(to right, ${primaryGreenDark}, ${primaryGreenLight})`;
  const buttonTextColor = "#ffffff";
  const errorColor = "#ef4444";

  // 💡 NEW LOGIC: Check for existing login status and redirect
  useEffect(() => {
    // If loading is false (initial token check complete) AND vendor is present, redirect.
    if (!loading && vendor) {
      navigate("/vendorDashboard", { replace: true });
    }
  }, [vendor, loading, navigate]); // Depend on vendor, loading, and navigate

  const showModal = (message) => {
    setModalMessage(message);
  };

  const closeModal = () => {
    setModalMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!identifier || !password) {
      setLoginError("Please enter both email/phone and password.");
      return;
    }

    try {
      const resultAction = await dispatch(loginVendor({ identifier, password }));

      if (loginVendor.fulfilled.match(resultAction)) {
        // Only show modal/navigate if the initial login state check didn't redirect us
        if (!vendor) {
          showModal("Login successful! Redirecting to dashboard.");
          navigate("/vendorDashboard");
        }
      } else if (loginVendor.rejected.match(resultAction)) {
        const errorMessage = resultAction.payload || "Login failed. Please check your credentials.";
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
        background: backgroundColor,
        fontFamily: "'Playfair Display', serif"
      }}
    >
      <div className="w-full max-w-md p-8 flex-grow-0">
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
              className="pb-2 bg-gradient-to-r from-[#005612] to-[#009632] bg-clip-text text-transparent text-4xl sm:text-5xl font-extrabold ml-4 tracking-wider"
              style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              Luxury
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight mt-6" style={{ fontFamily: "'Playfair Display', serif", color: textColor }}>Vendor Login</h2>
          <p className="text-lg" style={{ fontFamily: "'Playfair Display', serif", color: textColor }}>Access your vendor dashboard</p>
        </div>

        {/* Conditional rendering for form/loading state */}
        {loading && !vendor ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin h-8 w-8 text-green-500 mx-auto" />
            <p className="mt-4 text-gray-700">Checking authentication...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium mb-1" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>Email or Phone</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  id="identifier"
                  placeholder="Enter your email or phone"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setLoginError(""); }}
                  required
                  className="pl-10 pr-4 py-2.5 w-full border rounded-lg focus:ring-2 focus:outline-none transition duration-200"
                  style={{
                    background: inputBgColor,
                    color: textColor,
                    borderColor: inputBorderColor,
                    boxShadow: `inset 0 1px 3px rgba(0,0,0,0.1)`,
                    "--tw-ring-color": inputFocusRingColor,
                    fontFamily: "'Playfair Display', serif"
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
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
                    color: textColor,
                    borderColor: inputBorderColor,
                    boxShadow: `inset 0 1px 3px rgba(0,0,0,0.1)`,
                    "--tw-ring-color": inputFocusRingColor,
                    fontFamily: "'Playfair Display', serif"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  style={{ top: '60%', transform: 'translateY(-50%)' }}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: buttonBgColor,
                color: buttonTextColor,
                boxShadow: `0px 4px 15px rgba(0, 0, 0, 0.2)`,
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

            {(loginError || error) && (
              <p className="text-sm font-medium mt-4 p-2 rounded-lg border text-center"
                style={{
                  color: errorColor,
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  borderColor: errorColor,
                  fontFamily: "'Playfair Display', serif"
                }}
              >
                {loginError || error}
              </p>
            )}
          </form>
        )}

        <p className="text-sm text-center mt-6" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>
          Don't have a vendor account?{" "}
          <Link to="/vendorsignup" className="font-semibold hover:underline" style={{ color: primaryGreenLight, fontFamily: "'Playfair Display', serif" }}>
            Register here
          </Link>
        </p>

        <p className="text-xs text-center mt-2" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>
          Not a vendor?{" "}
          <Link to="/login" className="underline hover:text-gray-700" style={{ color: textColor }}>
            Login as User
          </Link>
        </p>
      </div>
      <Modal message={modalMessage} onClose={closeModal} />
    </div>
  );
}