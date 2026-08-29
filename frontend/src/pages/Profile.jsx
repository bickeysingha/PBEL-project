import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import authService from "../services/authService";

function Profile() {
  const { token, logout } = useAuth();  
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load profile from backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await authService.getProfile(token);

        setFormData({
          name: data.user.name,
          email: data.user.email,
        });
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadProfile();
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      setSaving(true);

      const data = await authService.updateProfile(
        formData,
        token
      );

      setMessage(data.message);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card profile-loading">
          <div className="profile-loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">

        {/* Profile Header */}
        <div className="profile-header">

          <div className="profile-avatar">
            {formData.name
              ? formData.name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <h1>My Profile</h1>

          <p>
            Manage your personal information and account
            settings.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="profile-alert profile-alert-error">
            <span className="profile-alert-icon">!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="profile-alert profile-alert-success">
            <span className="profile-alert-icon">✓</span>
            <span>{message}</span>
          </div>
        )}

        {/* Profile Form */}
        <form
          className="profile-form"
          onSubmit={handleSubmit}
        >

          {/* Name */}
          <div className="profile-form-group">
            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email */}
          <div className="profile-form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
            />
          </div>

          {/* Update Button */}
          <button
            type="submit"
            className="profile-update-button"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="profile-button-spinner"></span>
                Saving Changes...
              </>
            ) : (
              "Update Profile"
            )}
          </button>

        </form>

        {/* Divider */}
        <div className="profile-divider"></div>

        {/* Actions */}
        <div className="profile-actions">

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>

        </div>

      </div>
    </div>
  );
}

export default Profile;
