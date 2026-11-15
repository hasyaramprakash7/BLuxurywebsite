import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash, FaSpinner, FaArrowLeft } from "react-icons/fa";

import {
  loginUser,
  loginWithOtp,
  sendOtp,
  clearError,
  resetOtp,
  selectAuthUser,
  selectAuthLoading,
  selectAuthError,
  selectOtpLoading,
} from "../features/user/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  /* Where to go after successful login (default = /feed) */
  const from = location.state?.from?.pathname || "/feed";

  const user = useSelector(selectAuthUser);
  const loading = useSelector(selectAuthLoading);
  const otpLoading = useSelector(selectOtpLoading);
  const error = useSelector(selectAuthError);

  const [mode, setMode] = useState("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (user) {
      console.log("[Login] redirect →", from);
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  useEffect(() => {
    if (!seconds) return undefined;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const switchMode = (next) => {
    setMode(next);
    setLocalError("");
    dispatch(clearError());
    dispatch(resetOtp());
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!identifier.trim() || !password) {
      setLocalError("Please enter your email/phone and password.");
      return;
    }
    const res = await dispatch(loginUser({ identifier: identifier.trim(), password }));
    if (res.meta.requestStatus === "fulfilled") {
      navigate(from, { replace: true });
    }
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setLocalError("");
    const digits = phone.replace(/\D/g, "").slice(-10);
    if (digits.length !== 10) {
      setLocalError("Please enter a valid 10-digit phone number.");
      return;
    }
    const res = await dispatch(sendOtp({ phone: digits }));
    if (res.meta.requestStatus === "fulfilled") {
      setOtpSent(true);
      setSeconds(30);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (otp.replace(/\D/g, "").length < 4) {
      setLocalError("Please enter the OTP sent to your phone.");
      return;
    }
    const res = await dispatch(
      loginWithOtp({ phone: phone.replace(/\D/g, "").slice(-10), otp: otp.trim() })
    );
    if (res.meta.requestStatus === "fulfilled") {
      navigate(from, { replace: true });
    }
  };

  const shownError = localError || error;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-black font-serif px-4">
      <div className="w-full max-w-md mx-auto py-10 px-8 rounded-2xl flex-grow-0 bg-white">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center group">
            <span className="w-14 h-14 flex items-center justify-center rounded-full transform transition-transform duration-200 group-hover:scale-105 shadow-lg bg-gradient-to-r from-green-800 to-green-500">
              <span className="font-extrabold text-3xl text-white">B</span>
            </span>
            <span className="pb-2 bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent text-4xl sm:text-5xl font-extrabold ml-4 tracking-wider">
              Luxury
            </span>
          </Link>
          {location.state?.from?.pathname && (
            <p className="text-xs text-gray-500 mt-2">
              Sign in to continue to <b>{location.state.from.pathname}</b>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-lg bg-gray-100">
          <button
            type="button"
            onClick={() => switchMode("password")}
            className={`py-2 rounded-md text-sm font-semibold transition ${
              mode === "password"
                ? "bg-gradient-to-r from-green-800 to-green-500 text-white shadow"
                : "text-gray-700"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => switchMode("otp")}
            className={`py-2 rounded-md text-sm font-semibold transition ${
              mode === "otp"
                ? "bg-gradient-to-r from-green-800 to-green-500 text-white shadow"
                : "text-gray-700"
            }`}
          >
            OTP
          </button>
        </div>

        {mode === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-black">
                Email or Phone Number
              </label>
              <input
                id="identifier"
                type="text"
                placeholder="Enter your email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 text-black bg-gray-100 border-gray-300"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-black">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 pr-10 text-black bg-gray-100 border-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
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
              className="w-full py-3 rounded-lg font-semibold transition duration-300 flex items-center justify-center disabled:opacity-50 text-white bg-gradient-to-r from-green-800 to-green-500 shadow-md"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        )}

        {mode === "otp" && (
          <div className="space-y-6">
            <div>
              <label htmlFor="otp-phone" className="block text-sm font-medium text-black">
                Phone Number
              </label>
              <input
                id="otp-phone"
                type="tel"
                inputMode="numeric"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={otpSent}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 text-black bg-gray-100 border-gray-300 disabled:opacity-70"
              />
            </div>
            {otpSent && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-black">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full p-3 border rounded-lg tracking-[0.4em] text-center text-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 text-black bg-gray-100 border-gray-300"
                />
                <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(""); dispatch(resetOtp()); }}
                    className="inline-flex items-center hover:underline"
                  >
                    <FaArrowLeft className="mr-1" size={10} /> Change number
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={seconds > 0 || otpLoading}
                    className="font-semibold text-green-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:underline"
                  >
                    {seconds > 0 ? `Resend in ${seconds}s` : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={otpSent ? handleOtpSubmit : handleSendOtp}
              disabled={otpLoading}
              className="w-full py-3 rounded-lg font-semibold transition duration-300 flex items-center justify-center disabled:opacity-50 text-white bg-gradient-to-r from-green-800 to-green-500 shadow-md"
            >
              {otpLoading ? (
                <>
                  <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  {otpSent ? "Verifying..." : "Sending OTP..."}
                </>
              ) : otpSent ? (
                "Verify & Login"
              ) : (
                "Send OTP"
              )}
            </button>
          </div>
        )}

        {shownError && <p className="text-red-600 text-sm mt-4 text-center">{shownError}</p>}

        <p className="text-sm text-center mt-6 text-black">
          Don&apos;t have an account?{" "}
          <Link to="/signup" state={{ from: location.state?.from }} className="font-semibold hover:underline text-green-600">
            Sign up here
          </Link>
        </p>
      </div>

      <div className="w-80 py-4 border-t border-gray-700 text-center text-white">
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