import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  UserPlus,
  LogIn,
  X,
} from "lucide-react";

function Auth({ mode = "login", onClose, onLogin }) {
  const [currentMode, setCurrentMode] = useState(mode);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");

  // ============================================
  // SWITCH LOGIN / REGISTER MODE
  // ============================================

  function switchMode(nextMode) {
    setError("");
    setCurrentMode(nextMode);
  }

  // ============================================
  // GOOGLE LOGIN
  // ============================================

  async function handleGoogleSuccess(credentialResponse) {
    try {
      setError("");

      // Make sure Google returned a credential
      if (!credentialResponse?.credential) {
        setError("Google did not return a valid credential.");
        return;
      }

      // Send Google credential to our backend
      const response = await fetch(
        "http://localhost:5000/api/auth/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        }
      );

      const data = await response.json();

      // Check backend response
      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Google authentication failed."
        );
      }

      // Create logged-in user object
      const loggedInUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        profile_picture: data.user.profile_picture || "",
      };

      // Save current logged-in user
      localStorage.setItem(
        "mobilehub-user",
        JSON.stringify(loggedInUser)
      );

      // Tell App.jsx that login was successful
      onLogin(loggedInUser);

      // Close authentication popup
      onClose();

    } catch (error) {
      console.error("Google Login Error:", error);

      setError(
        error.message ||
          "Unable to login with Google. Please try again."
      );
    }
  }

  // ============================================
  // GOOGLE LOGIN ERROR
  // ============================================

  function handleGoogleError() {
    setError(
      "Google Login failed. Please try again."
    );
  }

  // ============================================
  // LOGIN INPUT CHANGES
  // ============================================

  function handleLoginChange(e) {
    setLoginData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));

    setError("");
  }

  // ============================================
  // REGISTER INPUT CHANGES
  // ============================================

  function handleRegisterChange(e) {
    setRegisterData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));

    setError("");
  }

  // ============================================
  // GET LOCAL USERS
  // ============================================

  function getUsers() {
    try {
      return (
        JSON.parse(
          localStorage.getItem("mobilehub-users")
        ) || []
      );
    } catch {
      return [];
    }
  }

  // ============================================
  // NORMAL EMAIL/PASSWORD LOGIN
  // ============================================

  function handleLogin(e) {
    e.preventDefault();

    const email =
      loginData.email.trim().toLowerCase();

    const password = loginData.password;

    if (!email || !password) {
      setError(
        "Please enter your email and password."
      );

      return;
    }

    const users = getUsers();

    const user = users.find(
      (item) =>
        item.email.toLowerCase() === email &&
        item.password === password
    );

    if (!user) {
      setError("Invalid email or password.");
      return;
    }

    const loggedInUser = {
      name: user.name,
      email: user.email,
    };

    localStorage.setItem(
      "mobilehub-user",
      JSON.stringify(loggedInUser)
    );

    onLogin(loggedInUser);
    onClose();
  }

  // ============================================
  // NORMAL ACCOUNT REGISTRATION
  // ============================================

  function handleRegister(e) {
    e.preventDefault();

    const name =
      registerData.name.trim();

    const email =
      registerData.email.trim().toLowerCase();

    const password =
      registerData.password;

    const confirmPassword =
      registerData.confirmPassword;

    // Check all fields
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Please fill in all fields."
      );

      return;
    }

    // Check password length
    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }

    // Check passwords
    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    const users = getUsers();

    // Check duplicate email
    if (
      users.some(
        (item) =>
          item.email.toLowerCase() === email
      )
    ) {
      setError(
        "An account with this email already exists."
      );

      return;
    }

    // Create new local user
    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
    };

    localStorage.setItem(
      "mobilehub-users",
      JSON.stringify([
        ...users,
        newUser,
      ])
    );

    const loggedInUser = {
      name: newUser.name,
      email: newUser.email,
    };

    localStorage.setItem(
      "mobilehub-user",
      JSON.stringify(loggedInUser)
    );

    onLogin(loggedInUser);
    onClose();
  }

  // ============================================
  // UI
  // ============================================

  return (
    <div
      className="auth-overlay"
      onMouseDown={onClose}
    >
      <div
        className="auth-modal"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >

        {/* CLOSE BUTTON */}

        <button
          className="auth-close-button"
          onClick={onClose}
          aria-label="Close authentication"
        >
          <X size={20} />
        </button>


        {/* AUTH ICON */}

        <div className="auth-icon">
          {currentMode === "login" ? (
            <LogIn size={23} />
          ) : (
            <UserPlus size={23} />
          )}
        </div>


        {/* HEADING */}

        <div className="auth-heading">

          <p className="section-label">
            {currentMode === "login"
              ? "WELCOME BACK"
              : "JOIN MOBILEHUB"}
          </p>

          <h2>
            {currentMode === "login"
              ? "Login to your account"
              : "Create your account"}
          </h2>

          <p>
            {currentMode === "login"
              ? "Login to continue shopping and checkout."
              : "Create an account to manage your shopping experience."}
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        {/* ====================================== */}
        {/* LOGIN */}
        {/* ====================================== */}

        {currentMode === "login" ? (

          <form
            className="auth-form"
            onSubmit={handleLogin}
          >

            {/* EMAIL */}

            <label>
              Email Address

              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </label>


            {/* PASSWORD */}

            <label>
              Password

              <div className="auth-password-input">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
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


            {/* LOGIN BUTTON */}

            <button
              className="auth-submit-button"
              type="submit"
            >
              <LockKeyhole size={17} />
              Login
            </button>


            {/* GOOGLE LOGIN */}

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <div className="google-login-button">

              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
              />

            </div>


            {/* SWITCH TO REGISTER */}

            <p className="auth-switch">
              Don't have an account?

              <button
                type="button"
                onClick={() =>
                  switchMode("register")
                }
              >
                Create Account
              </button>
            </p>

          </form>

        ) : (

          /* ====================================== */
          /* REGISTER */
          /* ====================================== */

          <form
            className="auth-form"
            onSubmit={handleRegister}
          >

            {/* NAME */}

            <label>
              Full Name

              <input
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </label>


            {/* EMAIL */}

            <label>
              Email Address

              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </label>


            {/* PASSWORD */}

            <label>
              Password

              <div className="auth-password-input">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
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


            {/* CONFIRM PASSWORD */}

            <label>
              Confirm Password

              <div className="auth-password-input">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={
                    registerData.confirmPassword
                  }
                  onChange={
                    handleRegisterChange
                  }
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>
            </label>


            {/* REGISTER BUTTON */}

            <button
              className="auth-submit-button"
              type="submit"
            >
              <UserPlus size={17} />
              Create Account
            </button>


            {/* SWITCH TO LOGIN */}

            <p className="auth-switch">
              Already have an account?

              <button
                type="button"
                onClick={() =>
                  switchMode("login")
                }
              >
                Login
              </button>
            </p>

          </form>

        )}


        {/* DEMO NOTE */}

        <p className="auth-demo-note">
          Email/password accounts are currently
          stored in your browser's localStorage.
          Google accounts are verified through
          Google and stored in MySQL.
        </p>

      </div>
    </div>
  );
}

export default Auth;