'use client' // :)

import React from "react";

const LogoutButton: React.FC = () => {
  const handleLogout = () => {
    setLoading(true);
    // Simulate an API call
    setTimeout(() => {
      // Perform logout logic here
      console.log("User logged out");
      setLoading(false);
    }, 2000); // Simulate a 2-second delay
  };
  const [loading, setLoading] = React.useState(false);
  return (
    <button onClick={handleLogout}>
      {loading ? (
        <span className="loader">Loading...</span>
      ) : (
        <span>Logout</span>
      )}
    </button>
  );
};

export default LogoutButton;