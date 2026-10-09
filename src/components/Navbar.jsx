import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Smartphone,
  User,
  LogOut,
  ShieldCheck,
} from "lucide-react";

function Navbar({
  search,
  setSearch,
  cartCount,
  onCartClick,
  mobileMenu,
  setMobileMenu,
  user,
  onLoginClick,
  onRegisterClick,
  onLogout,
  adminLoggedIn,
  onAdminClick,
}) {
  function closeMenu() {
    setMobileMenu(false);
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* LOGO */}
        <a
          href="#home"
          className="logo"
          onClick={closeMenu}
        >
          <span className="logo-icon">
            <Smartphone size={20} />
          </span>

          Mobile<span>Hub</span>
        </a>


        {/* NAVIGATION LINKS */}
        <nav
          className={`nav-links ${
            mobileMenu ? "nav-open" : ""
          }`}
        >

          <a
            href="#home"
            onClick={closeMenu}
          >
            Home
          </a>

          <a
            href="#products"
            onClick={closeMenu}
          >
            Products
          </a>

          <a
            href="#about"
            onClick={closeMenu}
          >
            About
          </a>

          <a
            href="#contact"
            onClick={closeMenu}
          >
            Contact
          </a>


          {/* MOBILE AUTH ACTIONS */}
          <div className="mobile-auth-actions">

            {user ? (

              <>
                <span className="mobile-user-name">
                  <User size={16} />
                  Hi, {user.name.split(" ")[0]}
                </span>

                <button
                  className="mobile-logout-button"
                  onClick={() => {
                    onLogout();
                    closeMenu();
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>

            ) : (

              <>
                <button
                  className="mobile-login-button"
                  onClick={() => {
                    onLoginClick();
                    closeMenu();
                  }}
                >
                  Login
                </button>

                <button
                  className="mobile-register-button"
                  onClick={() => {
                    onRegisterClick();
                    closeMenu();
                  }}
                >
                  Register
                </button>
              </>

            )}


            {/* MOBILE ADMIN BUTTON */}
            <button
              className="mobile-admin-button"
              onClick={() => {
                onAdminClick();
                closeMenu();
              }}
            >
              <ShieldCheck size={16} />

              {adminLoggedIn
                ? "Admin Dashboard"
                : "Admin Login"}
            </button>

          </div>

        </nav>


        {/* DESKTOP NAV ACTIONS */}
        <div className="nav-actions">


          {/* SEARCH */}
          <div className="search-box">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search accessories..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          {/* CART */}
          <button
            className="cart-button"
            onClick={onCartClick}
            title="Open cart"
          >

            <ShoppingCart size={21} />

            {cartCount > 0 && (
              <span className="cart-badge">
                {cartCount}
              </span>
            )}

          </button>


          {/* ADMIN BUTTON */}
          <button
            className="admin-nav-button"
            onClick={onAdminClick}
            title={
              adminLoggedIn
                ? "Open admin dashboard"
                : "Admin login"
            }
          >

            <ShieldCheck size={16} />

            Admin

          </button>


          {/* USER LOGGED IN */}
          {user ? (

            <div className="user-menu">

              <div
                className="user-info"
                title={user.email}
              >

                <span className="user-avatar">
                  {user.name
                    .charAt(0)
                    .toUpperCase()}
                </span>

                <span className="user-name">
                  {user.name.split(" ")[0]}
                </span>

              </div>


              <button
                className="logout-button"
                onClick={onLogout}
                title="Logout"
              >
                <LogOut size={17} />
              </button>

            </div>

          ) : (

            /* USER NOT LOGGED IN */
            <div className="auth-nav-buttons">

              <button
                className="login-nav-button"
                onClick={onLoginClick}
              >
                Login
              </button>

              <button
                className="register-nav-button"
                onClick={onRegisterClick}
              >
                Register
              </button>

            </div>

          )}

        </div>


        {/* MOBILE MENU BUTTON */}
        <button
          className="mobile-menu-button"
          onClick={() =>
            setMobileMenu(!mobileMenu)
          }
          aria-label="Toggle menu"
        >

          {mobileMenu ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}

        </button>

      </div>
    </header>
  );
}

export default Navbar;