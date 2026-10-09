import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
} from "lucide-react";

function Cart({
  cart,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
}) {

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const shipping =
    subtotal === 0 || subtotal >= 999
      ? 0
      : 79;

  const total = subtotal + shipping;

  return (
    <div className="cart-overlay">

      <div className="cart-drawer">

        {/* Header */}

        <div className="cart-header">

          <h2>
            Your Cart
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>


        {/* Empty Cart */}

        {cart.length === 0 ? (

          <div className="empty-cart">

            <ShoppingCart size={50} />

            <h3>
              Your cart is empty
            </h3>

            <p>
              Add some accessories to get started.
            </p>

            <button
              className="continue-shopping"
              onClick={onClose}
            >
              Continue Shopping
            </button>

          </div>

        ) : (

          <>

            {/* Cart Products */}

            <div className="cart-items">

              {cart.map((item) => (

                <div
                  className="cart-item"
                  key={item.id}
                >

                  <img
                    src={item.image}
                    alt={item.name}
                  />

                  <div className="cart-item-info">

                    <h4>
                      {item.name}
                    </h4>

                    <p>
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>


                    <div className="quantity-controls">

                      <button
                        onClick={() =>
                          onDecrease(item.id)
                        }
                      >
                        <Minus size={14} />
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          onIncrease(item.id)
                        }
                      >
                        <Plus size={14} />
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          onRemove(item.id)
                        }
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>


            {/* Summary */}

            <div className="cart-summary">

              <div>
                <span>Subtotal</span>
                <strong>
                  ₹{subtotal.toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Shipping</span>

                <strong>
                  {shipping === 0
                    ? "FREE"
                    : `₹${shipping}`}
                </strong>

              </div>

              <div className="cart-total">

                <span>Total</span>

                <strong>
                  ₹{total.toLocaleString("en-IN")}
                </strong>

              </div>


              <button
                className="checkout-button"
                onClick={onCheckout}
              >
                Proceed to Checkout
              </button>

            </div>

          </>

        )}

      </div>

    </div>
  );
}

export default Cart;