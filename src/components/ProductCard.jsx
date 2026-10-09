import { Heart } from "lucide-react";

function ProductCard({
  product,
  onAddToCart,
  wishlist,
  onToggleWishlist,
}) {
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="product-card">

      <div className="product-image">

        <img
          src={product.image}
          alt={product.name}
        />

        <button
          className={`wishlist-button ${
            isWishlisted ? "wishlisted" : ""
          }`}
          onClick={() => onToggleWishlist(product.id)}
          title="Add to wishlist"
        >
          <Heart
            size={19}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>

      </div>

      <div className="product-info">

        <span className="product-category">
          {product.category}
        </span>

        <h3>{product.name}</h3>

        <div className="rating">
          ★ {product.rating}
        </div>

        <p>{product.description}</p>

        <div className="price-row">

          <div>
            <strong>
              ₹{product.price.toLocaleString("en-IN")}
            </strong>

            <del>
              ₹{product.oldPrice.toLocaleString("en-IN")}
            </del>
          </div>

          <button
            className="add-button"
            onClick={() => onAddToCart(product)}
          >
            Add to Cart
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProductCard;