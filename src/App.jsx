import { useEffect, useMemo, useState } from "react";

import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Auth from "./components/Auth";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";

import staticProducts from "./data/products";

import "./App.css";


function App() {

  /* ==============================
     STATES
  ============================== */

  const [products, setProducts] = useState(staticProducts);

  const [adminLoggedIn, setAdminLoggedIn] = useState(() =>
    Boolean(sessionStorage.getItem("mobilehub-admin-token"))
  );

  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  const [cart, setCart] = useState(() => {
    const savedCart =
      localStorage.getItem("mobilehub-cart");

    return savedCart
      ? JSON.parse(savedCart)
      : [];
  });


  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist =
      localStorage.getItem("mobilehub-wishlist");

    return savedWishlist
      ? JSON.parse(savedWishlist)
      : [];
  });


  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [sort, setSort] = useState("default");

  const [cartOpen, setCartOpen] = useState(false);

  const [checkoutOpen, setCheckoutOpen] =
    useState(false);

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const [orderPlaced, setOrderPlaced] =
    useState(false);

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("mobilehub-user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");


  /*
     NEW STATE

     Stores the products that were in the cart
     when the customer placed the order.
  */

  const [orderedItems, setOrderedItems] =
    useState([]);


  /* ==============================
     LOAD PRODUCTS FROM BACKEND
  ============================== */

  async function loadProducts() {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (error) {
      console.warn("MobileHub backend is unavailable. Using local products.", error);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);


  /* ==============================
     SAVE CART
  ============================== */

  useEffect(() => {
    localStorage.setItem(
      "mobilehub-cart",
      JSON.stringify(cart)
    );
  }, [cart]);


  /* ==============================
     SAVE WISHLIST
  ============================== */

  useEffect(() => {
    localStorage.setItem(
      "mobilehub-wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);


  /* ==============================
     CATEGORIES
  ============================== */

  const categories = [
    "All",
    ...new Set(
      products.map(
        (product) => product.category
      )
    ),
  ];


  /* ==============================
     FILTER + SEARCH + SORT
  ============================== */

  const filteredProducts = useMemo(() => {

    let result = products.filter(
      (product) => {

        const matchesCategory =
          category === "All" ||
          product.category === category;


        const matchesSearch =
          product.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );


        return (
          matchesCategory &&
          matchesSearch
        );
      }
    );


    if (sort === "low") {
      result.sort(
        (a, b) =>
          a.price - b.price
      );
    }


    if (sort === "high") {
      result.sort(
        (a, b) =>
          b.price - a.price
      );
    }


    if (sort === "rating") {
      result.sort(
        (a, b) =>
          b.rating - a.rating
      );
    }


    return result;

  }, [
    search,
    category,
    sort,
  ]);


  /* ==============================
     CART COUNT
  ============================== */

  const cartCount =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );


  /* ==============================
     CART TOTAL
  ============================== */

  const subtotal =
    cart.reduce(
      (total, item) =>
        total +
        item.price *
          item.quantity,
      0
    );


  const shipping =
    subtotal === 0 ||
    subtotal >= 999
      ? 0
      : 79;


  const total =
    subtotal + shipping;


  /* ==============================
     ADD TO CART
  ============================== */

  function addToCart(product) {

    setCart((currentCart) => {

      const existing =
        currentCart.find(
          (item) =>
            item.id === product.id
        );


      if (existing) {

        return currentCart.map(
          (item) =>

            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item
        );
      }


      return [
        ...currentCart,

        {
          ...product,
          quantity: 1,
        },
      ];

    });


    setCartOpen(true);
  }


  /* ==============================
     INCREASE QUANTITY
  ============================== */

  function increaseQuantity(id) {

    setCart((currentCart) =>
      currentCart.map(
        (item) =>

          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
      )
    );
  }


  /* ==============================
     DECREASE QUANTITY
  ============================== */

  function decreaseQuantity(id) {

    setCart((currentCart) =>
      currentCart
        .map(
          (item) =>

            item.id === id
              ? {
                  ...item,
                  quantity:
                    item.quantity - 1,
                }
              : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }


  /* ==============================
     REMOVE FROM CART
  ============================== */

  function removeFromCart(id) {

    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.id !== id
      )
    );
  }


  /* ==============================
     WISHLIST
  ============================== */

  function toggleWishlist(id) {

    setWishlist(
      (currentWishlist) => {

        if (
          currentWishlist.includes(id)
        ) {

          return currentWishlist.filter(
            (itemId) =>
              itemId !== id
          );
        }


        return [
          ...currentWishlist,
          id,
        ];
      }
    );
  }


  /* ==============================
     AUTHENTICATION
  ============================== */

  function openLogin() {
    setAuthMode("login");
    setAuthOpen(true);
  }

  function openRegister() {
    setAuthMode("register");
    setAuthOpen(true);
  }

  function handleLogin(userData) {
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("mobilehub-user");
    setUser(null);
    setMobileMenu(false);
  }


  /* ==============================
     ADMIN
  ============================== */

  function handleAdminLogin(adminData) {
    setAdminLoggedIn(true);
    setAdminLoginOpen(false);
    setAdminPanelOpen(true);
  }

  function openAdmin() {
    if (adminLoggedIn) {
      setAdminPanelOpen(true);
    } else {
      setAdminLoginOpen(true);
    }
  }

  function logoutAdmin() {
    sessionStorage.removeItem("mobilehub-admin-token");
    setAdminLoggedIn(false);
    setAdminPanelOpen(false);
  }


  /* ==============================
     CHECKOUT ACCESS
  ============================== */

  function openCheckout() {
    if (!user) {
      setCartOpen(false);
      openLogin();
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setCheckoutOpen(true);
  }


  /* ==============================
     PLACE ORDER
  ============================== */

  function placeOrder() {

    /*
       IMPORTANT:

       First save the current cart into
       orderedItems.

       We use [...cart] so that the ordered
       products remain available even after
       the cart is cleared.
    */

    setOrderedItems([...cart]);


    /*
       Clear the shopping cart after
       successfully placing the order.
    */

    setCart([]);


    /*
       Close cart and checkout.
    */

    setCheckoutOpen(false);

    setCartOpen(false);


    /*
       Show order summary.
    */

    setOrderPlaced(true);
  }


  /* ==============================
     ORDER TOTAL
  ============================== */

  const orderedTotal =
    orderedItems.reduce(
      (total, item) =>
        total +
        item.price *
          item.quantity,
      0
    );


  /* ==============================
     APP
  ============================== */

  return (

    <div className="app">


      {/* ==============================
          NAVBAR
      ============================== */}

      <Navbar
        search={search}
        setSearch={setSearch}
        cartCount={cartCount}
        onCartClick={() =>
          setCartOpen(true)
        }
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
        user={user}
        onLoginClick={openLogin}
        onRegisterClick={openRegister}
        onLogout={logout}
        adminLoggedIn={adminLoggedIn}
        onAdminClick={openAdmin}
      />


      {/* ==============================
          HERO
      ============================== */}

      <section
        id="home"
        className="hero"
      >

        <div className="hero-content">

          <p className="hero-small">
            SMART ACCESSORIES
          </p>


          <h1>
            Everything your
            phone needs.
          </h1>


          <p className="hero-description">
            Cases, chargers, cables,
            earbuds and more.
            Everything you need
            for your everyday tech.
          </p>


          <a
            href="#products"
            className="hero-button"
          >
            Shop Now
          </a>

        </div>

      </section>


      {/* ==============================
          BENEFITS
      ============================== */}

      <section className="benefits">

        <div className="benefit">

          🚚

          <div>

            <strong>
              Fast Delivery
            </strong>

            <span>
              Across India
            </span>

          </div>

        </div>


        <div className="benefit">

          🛡️

          <div>

            <strong>
              Quality Products
            </strong>

            <span>
              Checked before dispatch
            </span>

          </div>

        </div>


        <div className="benefit">

          ↩️

          <div>

            <strong>
              Easy Returns
            </strong>

            <span>
              7-day return policy
            </span>

          </div>

        </div>

      </section>


      {/* ==============================
          PRODUCTS
      ============================== */}

      <section
        id="products"
        className="products-section"
      >

        <div className="products-header">

          <div>

            <p className="section-label">
              OUR COLLECTION
            </p>

            <h2>
              Shop Accessories
            </h2>

          </div>


          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
          >

            <option value="default">
              Featured
            </option>

            <option value="low">
              Price: Low to High
            </option>

            <option value="high">
              Price: High to Low
            </option>

            <option value="rating">
              Top Rated
            </option>

          </select>

        </div>


        {/* CATEGORY BUTTONS */}

        <div className="category-buttons">

          {categories.map(
            (item) => (

              <button
                key={item}
                className={
                  category === item
                    ? "category active"
                    : "category"
                }
                onClick={() =>
                  setCategory(item)
                }
              >
                {item}
              </button>

            )
          )}

        </div>


        {/* PRODUCT GRID */}

        {filteredProducts.length === 0 ? (

          <div className="no-products">

            <h3>
              No products found
            </h3>

            <p>
              Try another search.
            </p>

          </div>

        ) : (

          <div className="product-grid">

            {filteredProducts.map(
              (product) => (

                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  wishlist={wishlist}
                  onToggleWishlist={
                    toggleWishlist
                  }
                />

              )
            )}

          </div>

        )}

      </section>


      {/* ==============================
          ABOUT
      ============================== */}

      <section
        id="about"
        className="about-section"
      >

        <div>

          <p className="section-label">
            WHY MOBILEHUB?
          </p>

          <h2>
            Simple shopping
            for everyday tech.
          </h2>

          <p>
            MobileHub is your simple
            destination for useful
            mobile accessories.
            We focus on quality,
            value and an easy
            shopping experience.
          </p>

        </div>

      </section>


      {/* ==============================
          CONTACT
      ============================== */}

      <section
        id="contact"
        className="contact-section"
      >

        <div className="contact-box">

          <div>

            <p className="section-label">
              NEED HELP?
            </p>


            <h2>
              Have a question?
            </h2>


            <p>
              Our support team is
              happy to help.
            </p>


            {/* ==============================
                FUNCTIONAL CONTACT DETAILS
            ============================== */}

            <div className="support-contact">

              {/* Gmail */}

              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=badalpun2022@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="support-link"
                title="Open Gmail"
              >
                📧 badalpun2022@gmail.com
              </a>


              {/* Phone */}

              <a
                href="tel:+917666355343"
                className="support-link"
                title="Call MobileHub"
              >
                📞 +91 7666355343
              </a>

            </div>

          </div>

        </div>

      </section>


      {/* ==============================
          FOOTER
      ============================== */}

      <footer>

        <strong>
          MobileHub
        </strong>

        <span>
          © 2026 MobileHub
        </span>

      </footer>


      {/* ==============================
          CART
      ============================== */}

      {cartOpen && (

        <Cart
          cart={cart}

          onClose={() =>
            setCartOpen(false)
          }

          onIncrease={
            increaseQuantity
          }

          onDecrease={
            decreaseQuantity
          }

          onRemove={
            removeFromCart
          }

          onCheckout={openCheckout}
        />

      )}


      {/* ==============================
          CHECKOUT
      ============================== */}

      {checkoutOpen && (

        <Checkout
          total={total}

          onClose={() =>
            setCheckoutOpen(false)
          }

          onPlaceOrder={
            placeOrder
          }
        />

      )}


      {/* ==============================
          LOGIN / REGISTER
      ============================== */}

      {authOpen && (
        <Auth
          mode={authMode}
          onClose={() => setAuthOpen(false)}
          onLogin={handleLogin}
        />
      )}


      {/* ==============================
          ADMIN LOGIN
      ============================== */}

      {adminLoginOpen && (
        <AdminLogin
          onClose={() => setAdminLoginOpen(false)}
          onSuccess={handleAdminLogin}
        />
      )}


      {/* ==============================
          ADMIN PRODUCT PANEL
      ============================== */}

      {adminPanelOpen && adminLoggedIn && (
        <AdminPanel
          onClose={() => setAdminPanelOpen(false)}
          onLogout={logoutAdmin}
          onProductsChange={loadProducts}
        />
      )}


      {/* ==============================
          ORDER SUCCESS / ORDER DETAILS
      ============================== */}

      {orderPlaced && (

        <div className="order-overlay">

          <div className="order-summary-modal">


            {/* ==============================
                ORDER HEADER
            ============================== */}

            <div className="order-summary-header">

              <div className="order-header-left">

                <div className="success-icon">
                  ✓
                </div>


                <div>

                  <h2>
                    Order Placed Successfully!
                  </h2>

                  <p>
                    Thank you for shopping
                    with MobileHub.
                  </p>

                </div>

              </div>


              {/* CLOSE BUTTON */}

              <button
                className="order-close-button"
                onClick={() =>
                  setOrderPlaced(false)
                }
                aria-label="Close order summary"
              >
                ×
              </button>

            </div>


            {/* ==============================
                ORDERED ITEMS
            ============================== */}

            <div className="ordered-items-section">

              <h3>
                Your Ordered Items
              </h3>


              <div className="ordered-items">

                {orderedItems.map(
                  (item) => (

                    <div
                      className="ordered-item"
                      key={item.id}
                    >


                      {/* PRODUCT IMAGE */}

                      <img
                        src={item.image}
                        alt={item.name}
                      />


                      {/* PRODUCT INFORMATION */}

                      <div className="ordered-item-info">

                        <h4>
                          {item.name}
                        </h4>

                        <p>
                          {item.category}
                        </p>

                        <span>
                          Quantity:{" "}
                          {item.quantity}
                        </span>

                      </div>


                      {/* PRODUCT TOTAL */}

                      <strong>
                        ₹
                        {(
                          item.price *
                          item.quantity
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* ==============================
                TOTAL
            ============================== */}

            <div className="ordered-total">

              <span>
                Total Amount
              </span>

              <strong>
                ₹
                {orderedTotal.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>


            {/* ==============================
                CONTINUE SHOPPING
            ============================== */}

            <button
              className="continue-shopping-button"
              onClick={() =>
                setOrderPlaced(false)
              }
            >
              Continue Shopping
            </button>

          </div>

        </div>

      )}

    </div>

  );
}


export default App;