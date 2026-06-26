import React from "react";

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">📅</div>
        <h1>Meeting Overload Detector</h1>
        <p className="login-copy">Find where your week went. Get your focus time back.</p>
        <button className="primary-button" onClick={handleLogin}>
          <span className="google-icon">G</span>
          Connect Google Calendar
        </button>
        <p className="login-note">Read-only access · No data stored</p>
      </div>
    </div>
  );
}
