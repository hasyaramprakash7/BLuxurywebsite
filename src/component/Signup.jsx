import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaEye,
  FaEyeSlash,
  FaMapMarkerAlt,
  FaSpinner,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";

import {
  registerUser,
  registerWithOtp,
  sendOtp,
  clearError,
  resetOtp,
  selectAuthUser,
  selectOtpLoading,
} from "../features/user/authSlice";

/* ---------- small modal (replaces alert()) ---------- */
const Modal = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-lg shadow-xl p-6 max-w-sm w-full text-center"
        style={{
          backgroundColor: "#FFFFFF",
          color: "#1a1a1a",
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <FaCheckCircle className="mx-auto mb-3 text-green-600" size={34} />
        <p className="mb-6 text-lg font-medium">{message}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg font-semibold bg-gray-100 hover:bg-gray-200 transition"
        >
          OK
        </button>
      </div>
    </div>
  );
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: {
    latitude: null,
    longitude: null,
    pincode: "",
    state: "",
    district: "",
    country: "India",
  },
};

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  /* Where to go after successful registration (default = /feed) */
  const from = location.state?.from?.pathname || "/feed";

  const user = useSelector(selectAuthUser);
  const otpLoading = useSelector(selectOtpLoading);

  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(0);

  const primaryGreenDark = "#005612";
  const primaryGreenLight = "#009632";

  const showModal = (m) => setModalMessage(m);
  const closeModal = () => setModalMessage("");

  /* If user exists (register returned a token) → redirect to `from` or /feed */
  useEffect(() => {
    if (user) {
      console.log("[Signup] redirect →", from);
      const t = setTimeout(() => navigate(from, { replace: true }), 900);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [user, navigate, from]);

  useEffect(() => {
    if (!seconds) return undefined;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useEffect(
    () => () => {
      dispatch(clearError());
    },
    [dispatch]
  );

  /* -------------------- field handlers -------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  /* -------------------- geolocation -------------------- */
  const detectLocation = () => {
    if (!navigator.geolocation) {
      showModal(
        "Geolocation is not supported by your browser. Please enter the address manually."
      );
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        setForm((prev) => ({
          ...prev,
          address: { ...prev.address, latitude, longitude },
        }));

        try {
          const { data } = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: "json",
                addressdetails: 1,
              },
            }
          );
          const a = data.address || {};
          setForm((prev) => ({
            ...prev,
            address: {
              ...prev.address,
              pincode: a.postcode || prev.address.pincode,
              state: a.state || prev.address.state,
              district:
                a.county ||
                a.city_district ||
                a.city ||
                prev.address.district,
              country: a.country || prev.address.country,
            },
          }));
          showModal("Address auto-filled from your location.");
        } catch (err) {
          showModal(
            "Location captured, but address lookup failed. Please fill the fields manually."
          );
        } finally {
          setBusy(false);
        }
      },
      () => {
        setBusy(false);
        showModal(
          "Could not get your location. Please enter the address manually."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  /* -------------------- pincode autofill -------------------- */
  const handlePincodeBlur = async () => {
    const pincode = (form.address.pincode || "").trim();
    if (!/^\d{6}$/.test(pincode)) {
      if (pincode) setError("Please enter a valid 6-digit pincode.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const { data } = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            postalcode: pincode,
            format: "json",
            addressdetails: 1,
            countrycodes: "in",
          },
        }
      );
      if (data?.length) {
        const a = data[0].address || {};
        setForm((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            state: a.state || prev.address.state,
            district:
              a.county ||
              a.city_district ||
              a.city ||
              prev.address.district,
            country: a.country || prev.address.country || "India",
          },
        }));
      }
    } catch (err) {
      /* silent */
    } finally {
      setBusy(false);
    }
  };

  /* -------------------- validation -------------------- */
  const validateDetails = () => {
    const digits = form.phone.replace(/\D/g, "").slice(-10);
    if (!form.name.trim()) return "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      return "Please enter a valid email address.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    if (digits.length !== 10)
      return "Please enter a valid 10-digit phone number.";
    if (
      !form.address.pincode ||
      !form.address.state ||
      !form.address.district
    ) {
      return "Please complete your address (pincode, state, district).";
    }
    return "";
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password,
    phone: form.phone.replace(/\D/g, "").slice(-10),
    address: {
      latitude:
        form.address.latitude != null
          ? Number(form.address.latitude)
          : null,
      longitude:
        form.address.longitude != null
          ? Number(form.address.longitude)
          : null,
      pincode: form.address.pincode.trim(),
      state: form.address.state.trim(),
      district: form.address.district.trim(),
      country: form.address.country.trim() || "India",
    },
  });

  /* -------------------- step 1 -> send OTP -------------------- */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const v = validateDetails();
    if (v) return setError(v);

    setError("");
    const res = await dispatch(
      sendOtp({ phone: form.phone.replace(/\D/g, "").slice(-10) })
    );
    if (res.meta.requestStatus === "fulfilled") {
      setStep(2);
      setSeconds(30);
    } else {
      setError(res.payload || "Could not send OTP.");
    }
  };

  /* -------------------- step 2 -> verify + register -------------------- */
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (otp.replace(/\D/g, "").length < 4) {
      return setError("Please enter the OTP sent to your phone.");
    }

    setError("");
    const res = await dispatch(
      registerWithOtp({ ...buildPayload(), otp: otp.trim() })
    );

    if (res.meta.requestStatus === "fulfilled") {
      showModal("Account created successfully!");
      // Redirect handled by the `user` effect above
    } else {
      setError(res.payload || "Registration failed.");
    }
  };

  /* -------------------- register without OTP -------------------- */
  const handleRegisterWithoutOtp = async () => {
    const v = validateDetails();
    if (v) return setError(v);

    setError("");
    const res = await dispatch(registerUser(buildPayload()));
    if (res.meta.requestStatus === "fulfilled") {
      showModal("Account created successfully!");
    } else {
      setError(res.payload || "Registration failed.");
    }
  };

  const inputStyle = {
    background: "#f9fafb",
    color: "#111827",
    borderColor: "#d1d5db",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black font-serif">
      <div className="w-full max-w-xl p-8 flex-grow-0">
        {/* Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center group">
            <span
              className="w-14 h-14 flex items-center justify-center rounded-full transform transition-transform duration-200 group-hover:scale-105 shadow-lg"
              style={{
                background: `linear-gradient(to right, ${primaryGreenDark}, ${primaryGreenLight})`,
              }}
            >
              <span className="font-extrabold text-3xl text-white">B</span>
            </span>
            <span className="pb-2 bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent text-4xl sm:text-5xl font-extrabold ml-4 tracking-wider">
              Luxury
            </span>
          </Link>
          <p className="text-lg pt-4 text-white">
            {step === 1
              ? "Join us and explore amazing features!"
              : "Verify your phone number"}
          </p>
          {location.state?.from?.pathname && (
            <p className="text-xs text-gray-400 mt-2">
              Signing up to continue to{" "}
              <b className="text-green-400">
                {location.state.from.pathname}
              </b>
            </p>
          )}
        </div>

        {/* -------------------- STEP 1 -------------------- */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1 text-white"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1 text-white"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1 text-white"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full p-3 border rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-1 text-white"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xl font-semibold flex items-center text-white">
                  <FaMapMarkerAlt
                    className="mr-2"
                    style={{ color: primaryGreenLight }}
                  />
                  Your Address
                  {busy && (
                    <FaSpinner
                      className="animate-spin ml-3"
                      size={18}
                      style={{ color: primaryGreenLight }}
                    />
                  )}
                </h3>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={busy}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-green-500 text-green-400 hover:bg-green-500 hover:text-white transition disabled:opacity-50"
                >
                  Use my current location
                </button>
              </div>

              <p className="text-sm text-gray-300">
                Enter your pincode to auto-fill state/district, or fill
                manually.
              </p>

              <div>
                <label
                  htmlFor="pincode"
                  className="block text-sm font-medium mb-1 text-white"
                >
                  Pincode
                </label>
                <input
                  id="pincode"
                  name="address.pincode"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="e.g., 530003"
                  value={form.address.pincode}
                  onChange={handleChange}
                  onBlur={handlePincodeBlur}
                  required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium mb-1 text-white"
                  >
                    State
                  </label>
                  <input
                    id="state"
                    name="address.state"
                    placeholder="e.g., Andhra Pradesh"
                    value={form.address.state}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium mb-1 text-white"
                  >
                    District
                  </label>
                  <input
                    id="district"
                    name="address.district"
                    placeholder="e.g., Visakhapatnam"
                    value={form.address.district}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium mb-1 text-white"
                >
                  Country
                </label>
                <input
                  id="country"
                  name="address.country"
                  placeholder="e.g., India"
                  value={form.address.country}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  style={inputStyle}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm font-medium p-2 rounded-lg border text-center text-red-400 bg-red-500/10 border-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={otpLoading || busy}
              className="w-full py-3 rounded-lg font-semibold transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md"
              style={{
                background: `linear-gradient(to right, ${primaryGreenDark}, ${primaryGreenLight})`,
              }}
            >
              {otpLoading ? (
                <>
                  <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP & Continue"
              )}
            </button>

            <button
              type="button"
              onClick={handleRegisterWithoutOtp}
              disabled={busy}
              className="w-full py-2 text-sm font-medium text-gray-300 hover:text-white hover:underline disabled:opacity-50"
            >
              Skip OTP verification and create account
            </button>
          </form>
        )}

        {/* -------------------- STEP 2 (OTP) -------------------- */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndRegister} className="space-y-6">
            <p className="text-center text-sm text-gray-300">
              We sent a verification code to{" "}
              <span className="font-semibold text-white">
                +91 {form.phone.replace(/\D/g, "").slice(-10)}
              </span>
            </p>

            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium mb-1 text-white"
              >
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoFocus
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
                className="w-full p-3 border rounded-lg text-center text-xl tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-green-500"
                style={inputStyle}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-300">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                  dispatch(resetOtp());
                }}
                className="inline-flex items-center hover:underline"
              >
                <FaArrowLeft className="mr-1" size={10} /> Back to details
              </button>

              <button
                type="button"
                onClick={async () => {
                  const res = await dispatch(
                    sendOtp({
                      phone: form.phone.replace(/\D/g, "").slice(-10),
                    })
                  );
                  if (res.meta.requestStatus === "fulfilled")
                    setSeconds(30);
                }}
                disabled={seconds > 0 || otpLoading}
                className="font-semibold text-green-400 disabled:text-gray-500 disabled:cursor-not-allowed hover:underline"
              >
                {seconds > 0 ? `Resend in ${seconds}s` : "Resend OTP"}
              </button>
            </div>

            {error && (
              <p className="text-sm font-medium p-2 rounded-lg border text-center text-red-400 bg-red-500/10 border-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={otpLoading || busy}
              className="w-full py-3 rounded-lg font-semibold transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md"
              style={{
                background: `linear-gradient(to right, ${primaryGreenDark}, ${primaryGreenLight})`,
              }}
            >
              {otpLoading || busy ? (
                <>
                  <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Creating account...
                </>
              ) : (
                "Verify & Create Account"
              )}
            </button>
          </form>
        )}

        <p className="text-sm text-center mt-6 text-white">
          Already have an account?{" "}
          <Link
            to="/login"
            state={{ from: location.state?.from }}
            className="font-semibold hover:underline"
            style={{ color: primaryGreenLight }}
          >
            Log in here
          </Link>
        </p>
      </div>

      <Modal message={modalMessage} onClose={closeModal} />
    </div>
  );
}