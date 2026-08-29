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

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await authService.getProfile(token);

        setFormData({
          name: data.user?.name || "",
          email: data.user?.email || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
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

      setMessage(
        data.message || "Profile updated successfully"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
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
          <div className="profile-avatar">P</div>

          <h1>My Profile</h1>

          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">

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

        {error && (
          <div className="profile-message profile-error">
            {error}
          </div>
        )}

        {message && (
          <div className="profile-message profile-success">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="profile-form"
        >
          <div className="form-group">
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

          <div className="form-group">
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

          <button
            type="submit"
            className="profile-update-button"
            disabled={saving}
          >
            {saving
              ? "Saving Changes..."
              : "Update Profile"}
          </button>
        </form>

        <div className="profile-divider" />

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
  );
}

export default Profile;