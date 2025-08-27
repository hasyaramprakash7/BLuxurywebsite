import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, updateUserProfile } from "../features/user/authSlice";
import { Link } from "react-router-dom";

// Import Lucide-React icons
import {
  User,
  Edit3,
  LogOut,
  Store,
  Package,
  MapPin,
  Phone,
  Mail,
  Save,
  X,
  CheckCircle,
  ShieldCheck, // For a more luxurious "account active" icon
} from "lucide-react";
import Navbar from "./Home/Navbar"; // Assuming Navbar is correctly styled for the theme

export default function Main1() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false); // State for the success message
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: { district: "", state: "", country: "", pincode: "" },
  });

  useEffect(() => {
    if (user) {
      console.log("[Main1] Syncing formData from Redux user:", user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: {
          district: user.address?.district || "",
          state: user.address?.state || "",
          country: user.address?.country || "",
          pincode: user.address?.pincode || "",
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    console.log("[Main1] Dispatching updateUserProfile:", formData);
    const result = await dispatch(updateUserProfile(formData));

    if (result.meta.requestStatus === "fulfilled") {
      console.log("[Main1] Profile updated. Re-syncing formData...");
      const updated = result.payload.user;

      setFormData({
        name: updated.name || "",
        email: updated.email || "",
        phone: updated.phone || "",
        address: {
          district: updated.address?.district || "",
          state: updated.address?.state || "",
          country: updated.address?.country || "",
          pincode: updated.address?.pincode || "",
        },
      });

      setIsEditing(false);
      setSaveSuccess(true); // Show success message
      setTimeout(() => setSaveSuccess(false), 3000); // Hide after 3 seconds
    } else if (result.meta.requestStatus === "rejected") {
      alert("Failed to update: " + result.payload);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-500">Please login to access your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-800 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                <User className="w-5 h-5 text-yellow-300" /> {/* Gold accent */}
              </div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
            {/* <UserInfo /> - This was commented out, keep it that way if not needed */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-green-900 to-green-700 px-6 py-6 md:py-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-10 rounded-xl flex items-center justify-center shadow-inner">
                      <User className="w-6 h-6 text-yellow-300" /> {/* Gold accent */}
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
                        Account Settings
                      </h2>
                      <p className="text-green-100 text-sm md:text-base">
                        Manage your personal information
                      </p>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm md:text-base font-semibold border border-white border-opacity-20"
                    >
                      <Edit3 className="w-4 h-4 text-yellow-300" /> {/* Gold accent */}
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Success Message */}
              {saveSuccess && (
                <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Profile updated successfully!
                  </span>
                </div>
              )}

              {/* Card Content */}
              <div className="p-6 md:p-8">
                {isEditing ? (
                  <div className="space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                          <User className="w-4 h-4 text-gray-600" />
                          <span>Full Name</span>
                        </label>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200 text-gray-800 text-lg"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <span>Email</span>
                        </label>
                        <input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-600 text-lg"
                          placeholder="Email address"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <span>Phone Number</span>
                      </label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200 text-gray-800 text-lg"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="space-y-4 pt-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-700" />
                        <span className="text-sm font-medium text-gray-700">
                          Address Information
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {[
                          { field: "district", label: "District" },
                          { field: "state", label: "State" },
                          { field: "country", label: "Country" },
                          { field: "pincode", label: "Pincode" },
                        ].map(({ field, label }) => (
                          <div key={field} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {label}
                            </label>
                            <input
                              name={`address.${field}`}
                              value={formData.address[field]}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200 text-gray-800 text-lg"
                              placeholder={`Enter ${label.toLowerCase()}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={loading}
                        className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 font-medium"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-800 to-green-600 text-white rounded-lg hover:from-green-700 hover:to-green-500 transition-all duration-200 disabled:opacity-50 font-semibold shadow-md"
                      >
                        <Save className="w-4 h-4 text-yellow-300" />{" "}
                        {/* Gold accent */}
                        <span>{loading ? "Saving..." : "Save Changes"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                          <User className="w-5 h-5 text-green-700" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Name
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {user.name || "Not provided"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                          <Mail className="w-5 h-5 text-green-700" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Email
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                          <Phone className="w-5 h-5 text-green-700" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Phone
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {user.phone || "Not provided"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                          <MapPin className="w-5 h-5 text-green-700 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Address
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {user.address?.district ||
                                user.address?.state ||
                                user.address?.country ||
                                user.address?.pincode
                                ? `${user.address?.district || ""}, ${user.address?.state || ""
                                  }, ${user.address?.country || ""} ${user.address?.pincode || ""
                                  }`.replace(/^,\s*|,\s*$/, "").replace(/,\s*,/g, ",")
                                : "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 md:space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => dispatch(logout())}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-all duration-200 font-medium border border-red-100"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Vendor Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Vendor Services
              </h3>
              <div className="space-y-3">
                <Link
                  to="/vendorsignup"
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-all duration-200 font-medium border border-green-100"
                >
                  <Store className="w-5 h-5" />
                  <span>Become a Vendor</span>
                </Link>
                <Link
                  to="/vendorlogin"
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-all duration-200 font-medium border border-green-100"
                >
                  <Package className="w-5 h-5" />
                  <span> Vendor Login</span>
                </Link>
              </div>
            </div>

            {/* Stats Card (themed as a "Welcome Back" message) */}
            <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-2xl shadow-xl p-6 text-white border border-green-700">
              <h3 className="text-lg font-semibold mb-2 tracking-wide">
                Welcome Back!
              </h3>
              <p className="text-green-100 mb-4">
                {user.name
                  ? `Hello, ${user.name}!`
                  : "Complete your profile to get started."}
              </p>
              <div className="flex items-center space-x-2 text-sm font-medium">
                <ShieldCheck className="w-5 h-5 text-yellow-300" />{" "}
                {/* More premium icon */}
                <span>Account Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional rendering for other components if needed */}
      {/* <OrderScreen /> */}
      {/* <OrdersPage /> */}
      {/* <Cart /> */}
      {/* <AllVendorProducts /> */}
      <Navbar /> {/* Ensure your Navbar also aligns with the new theme */}
    </div>
  );
}