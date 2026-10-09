import { useState } from "react";


function Checkout({
  total,
  onClose,
  onPlaceOrder,
}) {

  /* ==============================
     FORM STATE
  ============================== */

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });


  /* ==============================
     HANDLE INPUT
  ============================== */

  function handleChange(e) {

    const {
      name,
      value,
    } = e.target;


    setFormData((currentData) => ({
      ...currentData,

      [name]: value,
    }));
  }


  /* ==============================
     PLACE ORDER
  ============================== */

  function handleSubmit(e) {

    e.preventDefault();


    /*
      Basic validation
    */

    if (
      !formData.name ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {

      alert(
        "Please fill in all required fields."
      );

      return;
    }


    /*
      Phone validation
    */

    if (
      !/^[0-9]{10}$/.test(
        formData.phone
      )
    ) {

      alert(
        "Please enter a valid 10-digit phone number."
      );

      return;
    }


    /*
      Pincode validation
    */

    if (
      !/^[0-9]{6}$/.test(
        formData.pincode
      )
    ) {

      alert(
        "Please enter a valid 6-digit pincode."
      );

      return;
    }


    /*
      Order is placed.

      Your App.jsx will save the cart items,
      clear the cart and show the order
      summary.
    */

    onPlaceOrder();
  }


  /* ==============================
     CHECKOUT UI
  ============================== */

  return (

    <div className="checkout-overlay">

      <div className="checkout-modal">


        {/* ==============================
            HEADER
        ============================== */}

        <div className="checkout-header">

          <h2>
            Checkout
          </h2>


          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
          >
            ×
          </button>

        </div>


        {/* ==============================
            FORM
        ============================== */}

        <form
          onSubmit={handleSubmit}
        >


          {/* ==============================
              CUSTOMER INFORMATION
          ============================== */}

          <h3>
            Delivery Information
          </h3>


          {/* NAME */}

          <label>

            Full Name

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

          </label>


          {/* PHONE */}

          <label>

            Phone Number

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              maxLength="10"
              required
            />

          </label>


          {/* EMAIL */}

          <label>

            Email Address
            <span
              style={{
                fontWeight: "normal",
                color: "#888",
              }}
            >
              {" "}
              (Optional)
            </span>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

          </label>


          {/* ADDRESS */}

          <label>

            Delivery Address

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="House No., Street, Area"
              rows="3"
              required
            />

          </label>


          {/* CITY */}

          <label>

            City

            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter your city"
              required
            />

          </label>


          {/* STATE */}

          <label>

            State

            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter your state"
              required
            />

          </label>


          {/* PINCODE */}

          <label>

            Pincode

            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Enter 6-digit pincode"
              maxLength="6"
              required
            />

          </label>


          {/* ==============================
              PAYMENT METHOD
          ============================== */}

          <h3>
            Payment Method
          </h3>


          <label>

            Payment Method

            <select
              value="cod"
              disabled
            >

              <option value="cod">
                Cash on Delivery
              </option>

            </select>

          </label>


          {/* ==============================
              ORDER TOTAL
          ============================== */}

          <div className="checkout-total">

            <span>
              Order Total
            </span>

            <strong>
              ₹
              {Number(total).toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>


          {/* ==============================
              COD INFORMATION
          ============================== */}

          <div
            style={{
              marginTop: "12px",
              padding: "12px",
              background: "#f5f5f6",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#666",
              lineHeight: "1.5",
            }}
          >

            💵 You will pay the
            delivery person when
            your order is delivered.

          </div>


          {/* ==============================
              PLACE ORDER
          ============================== */}

          <button
            type="submit"
            className="place-order-button"
          >
            Place Order
          </button>


        </form>

      </div>

    </div>

  );
}


export default Checkout;