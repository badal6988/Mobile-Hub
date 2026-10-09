import { useState } from "react";
import { Eye, EyeOff, LogIn, ShieldCheck, X } from "lucide-react";

const API_BASE = "http://localhost:5000";

function AdminLogin({ onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Admin login failed."
        );
      }

      sessionStorage.setItem(
        "mobilehub-admin-token",
        data.token
      );

      onSuccess(data.admin);
      onClose();

    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the backend."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="admin-overlay"
      onMouseDown={onClose}
    >
      <div
        className="admin-login-modal"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >

        <button
          className="admin-close-button"
          onClick={onClose}
          aria-label="Close admin login"
        >
          <X size={20} />
        </button>

        <div className="admin-icon">
          <ShieldCheck size={25} />
        </div>

        <p className="section-label">
          ADMINISTRATOR
        </p>

        <h2>Admin Login</h2>

        <p className="admin-login-description">
          Sign in to manage the MobileHub
          product catalogue.
        </p>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        <form
          className="admin-form"
          onSubmit={handleSubmit}
        >

          <label>
            Admin Email

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="admin@mobilehub.com"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password

            <div className="admin-password-input">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter admin password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </label>

          <button
            className="admin-submit-button"
            type="submit"
            disabled={loading}
          >

            <LogIn size={17} />

            {loading
              ? "Signing in..."
              : "Login as Admin"}

          </button>

        </form>

        <p className="admin-demo-note">
          Admin credentials are configured in{" "}
          <strong>backend/.env</strong>.
        </p>

      </div>
    </div>
  );
}

export default AdminLogin;