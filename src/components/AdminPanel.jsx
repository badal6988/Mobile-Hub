
import { useEffect, useState } from "react";

import {
  Plus,
  Trash2,
  X,
  LogOut,
  Package,
  ShieldCheck,
  Image as ImageIcon,
} from "lucide-react";

// Import the existing product data and images.
import defaultProducts from "../data/products";

const API_BASE = "http://localhost:5000";

// Available images from your existing products.js file.
const productImageOptions = defaultProducts.map((product) => ({
  name: product.name,
  image: product.image,
}));

const emptyForm = {
  name: "",
  category: "",
  price: "",
  oldPrice: "",
  rating: "4.5",
  description: "",
  image: productImageOptions[0]?.image || "",
};

function AdminPanel({ onClose, onLogout, onProductsChange }) {
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const token = sessionStorage.getItem("mobilehub-admin-token");

  // Load products from the backend.
  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/products`);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load products."
        );
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // Update form fields.
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setMessage("");
  }

  // Add a new product.
  async function handleAdd(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const productToAdd = {
        ...form,
        price: Number(form.price),
        oldPrice:
          form.oldPrice === "" ? 0 : Number(form.oldPrice),
        rating: Number(form.rating),
      };

      const response = await fetch(`${API_BASE}/api/products`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(productToAdd),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to add product."
        );
      }

      setForm(emptyForm);

      setMessage("Product added successfully!");

      await loadProducts();

      if (onProductsChange) {
        onProductsChange();
      }
    } catch (err) {
      if (
        err.message.toLowerCase().includes("authentication") ||
        err.message.toLowerCase().includes("unauthorized")
      ) {
        logout();
        return;
      }

      setError(err.message || "Unable to add product.");
    } finally {
      setSaving(false);
    }
  }

  // Delete a product.
  async function handleDelete(id, name) {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${name}" from the store?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/products/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to remove product."
        );
      }

      setMessage("Product removed successfully!");

      await loadProducts();

      if (onProductsChange) {
        onProductsChange();
      }
    } catch (err) {
      if (
        err.message.toLowerCase().includes("authentication") ||
        err.message.toLowerCase().includes("unauthorized")
      ) {
        logout();
        return;
      }

      setError(err.message || "Unable to remove product.");
    }
  }

  // Log out the administrator.
  function logout() {
    sessionStorage.removeItem("mobilehub-admin-token");

    if (onLogout) {
      onLogout();
    }
  }

  // Find the name associated with the selected image.
  const selectedImage = productImageOptions.find(
    (item) => item.image === form.image
  );

  return (
    <div className="admin-panel-overlay">
      <div className="admin-panel">
        {/* Header */}
        <div className="admin-panel-header">
          <div>
            <p className="section-label">MOBILEHUB ADMIN</p>

            <h2>
              <ShieldCheck size={23} />
              Product Management
            </h2>

            <p>
              Add new products or remove products from your
              live catalogue.
            </p>
          </div>

          <div className="admin-panel-actions">
            <button
              type="button"
              className="admin-logout-button"
              onClick={logout}
            >
              <LogOut size={16} />
              Logout
            </button>

            <button
              type="button"
              className="admin-panel-close"
              onClick={onClose}
              aria-label="Close admin panel"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="admin-error admin-panel-message"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Success message */}
        {message && (
          <div
            className="admin-success admin-panel-message"
            role="status"
          >
            {message}
          </div>
        )}

        <div className="admin-panel-content">
          {/* Add Product Form */}
          <form
            className="admin-product-form"
            onSubmit={handleAdd}
          >
            <div className="admin-form-heading">
              <Package size={19} />
              <h3>Add Product</h3>
            </div>

            {/* Product name */}
            <label>
              Product Name

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. 30W Fast Charger"
                required
              />
            </label>

            {/* Category */}
            <label>
              Category

              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Chargers"
                required
              />
            </label>

            {/* Prices */}
            <div className="admin-form-row">
              <label>
                Price (₹)

                <input
                  type="number"
                  name="price"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="999"
                  required
                />
              </label>

              <label>
                Old Price (₹)

                <input
                  type="number"
                  name="oldPrice"
                  min="0"
                  value={form.oldPrice}
                  onChange={handleChange}
                  placeholder="1299"
                />
              </label>
            </div>

            {/* Rating */}
            <label>
              Rating

              <input
                type="number"
                name="rating"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={handleChange}
                required
              />
            </label>

            {/* Image selector */}
            <label className="admin-image-selector">
              <span className="admin-field-title">
                <ImageIcon size={16} />
                Select Product Image
              </span>

              <select
                name="image"
                value={form.image}
                onChange={handleChange}
                required
              >
                {productImageOptions.map((item, index) => (
                  <option
                    key={`${item.name}-${index}`}
                    value={item.image}
                  >
                    {item.name}
                  </option>
                ))}
              </select>

              {/* Image preview */}
              {form.image && (
                <div className="admin-image-preview">
                  <img
                    src={form.image}
                    alt={selectedImage?.name || "Selected product"}
                  />

                  <div className="admin-image-preview-details">
                    <strong>
                      {selectedImage?.name || "Product image"}
                    </strong>

                    <span>Selected image preview</span>
                  </div>
                </div>
              )}
            </label>

            {/* Description */}
            <label>
              Description

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the product..."
                rows={4}
                required
              />
            </label>

            {/* Submit */}
            <button
              className="admin-add-button"
              type="submit"
              disabled={saving}
            >
              <Plus size={18} />

              {saving ? "Adding Product..." : "Add Product"}
            </button>
          </form>

          {/* Existing Products */}
          <div className="admin-products-list">
            <div className="admin-list-heading">
              <h3>Current Products</h3>

              <span>
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </span>
            </div>

            {loading ? (
              <div className="admin-empty-state">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="admin-empty-state">
                No products in the catalogue.
              </div>
            ) : (
              <div className="admin-product-table">
                {products.map((product) => (
                  <div
                    className="admin-product-row"
                    key={product._id || product.id}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(event) => {
                        event.currentTarget.style.visibility =
                          "hidden";
                      }}
                    />

                    <div className="admin-product-details">
                      <strong>{product.name}</strong>

                      <span>
                        {product.category}
                        {" · "}
                        ₹
                        {Number(product.price).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="admin-delete-button"
                      onClick={() =>
                        handleDelete(
                          product._id || product.id,
                          product.name
                        )
                      }
                      title={`Remove ${product.name}`}
                      aria-label={`Remove ${product.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;

