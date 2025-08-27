import React from "react";
import { useSelector } from "react-redux";

export default function UserInfo() {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return (
            <div className="text-center text-gray-500 mt-4">
                No user data found. Please log in.
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-6 p-4 border rounded-lg shadow bg-white">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">User Information</h2>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
        </div>
    );
}
