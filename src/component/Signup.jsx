import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaMapMarkerAlt, FaSpinner } from "react-icons/fa"; // For icons (install react-icons)

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

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: {
      latitude: "",
      longitude: "",
      pincode: "",
      state: "",
      district: "",
      country: "",
    },
  });

  const [loadingAddress, setLoadingAddress] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [signupError, setSignupError] = useState(""); // State for signup error messages
  const [modalMessage, setModalMessage] = useState(""); // State for modal messages

  const navigate = useNavigate();

  // Define colors for consistency - Matching Login.jsx
  const primaryGreenDark = "#005612"; // Darker royal green
  const primaryGreenLight = "#009632"; // Lighter royal green
  const logoTextColor = "#FFFFFF"; // White for the 'B' in the logo circle

  // Light theme colors (copied from Login.jsx)
  const backgroundColor = "black"; // White page background
  const cardBgColor = "#FFFFFF"; // White card background (no longer used for the main form div)
  const cardBorderColor = "rgba(0, 0, 0, 0.1)"; // Subtle grey border for definition (no longer used for the main form div)
  const textColor = "white"; // Dark text for general content
  const inputBgColor = "black"; // Very light grey for inputs
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

  useEffect(() => {
    console.log("useEffect triggered: Attempting to get geolocation...");
    if (!navigator.geolocation) {
      showModal("Geolocation is not supported by your browser. Please enter address manually.");
      return;
    }

    setLoadingAddress(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Geolocation success:", { latitude, longitude });

        setForm((prev) => ({
          ...prev,
          address: { ...prev.address, latitude, longitude },
        }));

        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`,
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: "json",
                addressdetails: 1,
              },
            }
          );

          console.log("Reverse geocoding success:", response.data);

          const address = response.data.address || {};

          setForm((prev) => ({
            ...prev,
            address: {
              ...prev.address,
              pincode: address.postcode || "",
              state: address.state || "",
              district: address.county || address.city_district || "",
              country: address.country || "",
            },
          }));
          showModal("Address auto-filled from your location.");
        } catch (error) {
          console.error("Error fetching address from coordinates:", error);
          showModal("Could not fetch address details automatically. Please enter manually.");
        } finally {
          setLoadingAddress(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        showModal("Could not get your location. Please enter address manually.");
        setLoadingAddress(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Geolocation options
    );
  }, []);

  const handlePincodeBlur = async () => {
    const { pincode } = form.address;
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) { // Basic pincode validation
      setSignupError("Please enter a valid 6-digit pincode.");
      return;
    }
    setSignupError(""); // Clear previous errors

    try {
      setLoadingAddress(true);
      console.log("Fetching address using pincode:", pincode);

      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          postalcode: pincode,
          format: "json",
          addressdetails: 1,
          countrycodes: "in", // Assuming India for pincodes
        },
      });

      console.log("Pincode search response:", res.data);

      if (res.data.length > 0) {
        const address = res.data[0].address;

        setForm((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            state: address.state || "",
            district: address.county || address.city_district || "",
            country: address.country || "",
          },
        }));
        showModal("Address details updated based on pincode.");
      } else {
        showModal("No address found for this pincode.");
      }
    } catch (err) {
      console.error("Error fetching address from pincode:", err);
      showModal("Failed to fetch address from pincode. Please check the pincode or enter details manually.");
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("Input change:", { name, value });
    setSignupError(""); // Clear errors on input change

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSignupError(""); // Clear previous signup errors

    // Basic client-side validation (can be expanded)
    if (!form.name || !form.email || !form.password || !form.phone ||
      !form.address.pincode || !form.address.state || !form.address.district || !form.address.country) {
      setSignupError("Please fill in all required fields.");
      return;
    }

    const payload = {
      ...form,
      address: {
        ...form.address,
        latitude: form.address.latitude ? parseFloat(form.address.latitude) : null,
        longitude: form.address.longitude ? parseFloat(form.address.longitude) : null,
      },
    };

    console.log("Submitting form with payload:", payload);

    try {
      // Simulate API call loading
      setLoadingAddress(true); // Reusing loadingAddress for form submission
      const res = await axios.post("/api/auth/register", payload); // Replace with your actual API endpoint
      console.log("Signup success response:", res.data);
      showModal("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error("Signup failed:", err);
      const errorMessage = err.response?.data?.message || "Signup failed. Please try again.";
      setSignupError(errorMessage);
    } finally {
      setLoadingAddress(false);
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
      <div className="w-full max-w-xl p-8 flex-grow-0" // Removed rounded-2xl, shadow-lg
        style={{
          // Removed backgroundColor, border, borderRadius, boxShadow to remove card effect
        }}
      >
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
          <p className="text-lg pt-4" style={{ fontFamily: "'Playfair Display', serif", color: textColor }}>Join us and explore amazing features!</p> {/* Increased font size */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6"> {/* Increased spacing */}
          {/* Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>Full Name</label>
              <input
                name="name"
                id="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
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
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>Email</label>
              <input
                name="email"
                id="email"
                placeholder="you@example.com"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>Password</label>
              <input
                name="password"
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 pr-10"
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
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>Phone Number</label>
              <input
                name="phone"
                id="phone"
                placeholder="+91 9876543210"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
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

          {/* Address Details */}
          <div className="space-y-4 pt-4 border-t" style={{ borderColor: cardBorderColor }}>
            <h3 className="text-xl font-semibold flex items-center" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>
              <FaMapMarkerAlt className="mr-2" style={{ color: primaryGreenLight }} /> Your Address
              {loadingAddress && (
                <FaSpinner className="animate-spin ml-3" size={20} style={{ color: primaryGreenLight }} />
              )}
            </h3>
            <p className="text-sm" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>
              {loadingAddress ? "Auto-detecting your location..." : "Enter your pincode to auto-fill address details, or fill manually."}
            </p>

            <input type="hidden" name="address.latitude" value={form.address.latitude} />
            <input type="hidden" name="address.longitude" value={form.address.longitude} />

            <div>
              <label htmlFor="pincode" className="block text-sm font-medium mb-1" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>Pincode</label>
              <input
                name="address.pincode"
                id="pincode"
                placeholder="e.g., 530003"
                value={form.address.pincode}
                onChange={handleChange}
                onBlur={handlePincodeBlur}
                required
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className="block text-sm font-medium mb-1" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>State</label>
                <input
                  name="address.state"
                  id="state"
                  placeholder="e.g., Andhra Pradesh"
                  value={form.address.state}
                  onChange={handleChange}
                  required
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
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
              <div>
                <label htmlFor="district" className="block text-sm font-medium mb-1" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>District</label>
                <input
                  name="address.district"
                  id="district"
                  placeholder="e.g., Visakhapatnam"
                  value={form.address.district}
                  onChange={handleChange}
                  required
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
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
            <div>
              <label htmlFor="country" className="block text-sm font-medium mb-1" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>Country</label>
              <input
                name="address.country"
                id="country"
                placeholder="e.g., India"
                value={form.address.country}
                onChange={handleChange}
                required
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200`}
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

          {signupError && (
            <p className="text-sm font-medium mt-4 p-2 rounded-lg border text-center"
              style={{
                color: errorColor, // Red error text
                backgroundColor: "rgba(239, 68, 68, 0.1)", // Light red transparent background
                borderColor: errorColor,
                fontFamily: "'Playfair Display', serif"
              }}
            >
              {signupError}
            </p>
          )}

          <button
            type="submit"
            disabled={loadingAddress} // Disable button if address is loading or form is submitting
            className="w-full py-3 rounded-lg font-semibold transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: buttonBgColor, // Royal green gradient
              color: buttonTextColor,
              boxShadow: `0px 4px 15px rgba(0, 0, 0, 0.2)`, // Subtle shadow for button lift, matching Login.jsx
              fontFamily: "'Playfair Display', serif"
            }}
          >
            {loadingAddress ? (
              <>
                <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" style={{ color: buttonTextColor }} />
                Processing...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: textColor, fontFamily: "'Playfair Display', serif" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: primaryGreenLight, fontFamily: "'Playfair Display', serif" }}>
            Log in here
          </Link>
        </p>
      </div>
      <Modal message={modalMessage} onClose={closeModal} />
    </div>
  );
}
