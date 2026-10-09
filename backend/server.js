const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const db = require("./db");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

// ============================================
// GOOGLE AUTHENTICATION
// ============================================

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ============================================
// ADMIN AUTHENTICATION
// ============================================

// Admin credentials are stored in .env
// Change them before using the project outside
// your local development environment.

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  "admin@mobilehub.com"
).toLowerCase();

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  "MobileHub@123";

const ADMIN_SECRET =
  process.env.ADMIN_SECRET ||
  "change-this-mobilehub-secret";

const ADMIN_TOKEN_TTL =
  8 * 60 * 60 * 1000;


// ============================================
// SAFE STRING COMPARISON
// ============================================

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));

  return (
    left.length === right.length &&
    crypto.timingSafeEqual(left, right)
  );
}


// ============================================
// CREATE ADMIN TOKEN
// ============================================

function createAdminToken() {
  const expiresAt =
    Date.now() + ADMIN_TOKEN_TTL;

  const payload = Buffer.from(
    JSON.stringify({
      role: "admin",
      expiresAt,
    })
  ).toString("base64url");

  const signature =
    crypto
      .createHmac(
        "sha256",
        ADMIN_SECRET
      )
      .update(payload)
      .digest("base64url");

  return `${payload}.${signature}`;
}


// ============================================
// VERIFY ADMIN TOKEN
// ============================================

function verifyAdminToken(token) {
  if (!token || !token.includes(".")) {
    return false;
  }

  const [payload, signature] =
    token.split(".");

  const expected =
    crypto
      .createHmac(
        "sha256",
        ADMIN_SECRET
      )
      .update(payload)
      .digest("base64url");

  if (!safeEqual(signature, expected)) {
    return false;
  }

  try {
    const data = JSON.parse(
      Buffer.from(
        payload,
        "base64url"
      ).toString("utf8")
    );

    return (
      data.role === "admin" &&
      Number(data.expiresAt) > Date.now()
    );

  } catch {
    return false;
  }
}


// ============================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ============================================

function requireAdmin(req, res, next) {
  const header =
    req.headers.authorization || "";

  const token =
    header.startsWith("Bearer ")
      ? header.slice(7)
      : "";

  if (!verifyAdminToken(token)) {
    return res.status(401).json({
      success: false,
      message:
        "Admin authentication required.",
    });
  }

  next();
}


// ============================================
// PRODUCT DATABASE SETUP
// ============================================

const seedProducts = [

  [
    "Braided USB-C Cable",
    "Cables",
    499,
    699,
    4.5,
    "Durable braided USB-C cable designed for fast charging and reliable data transfer.",
    "/products/cable.jpg",
  ],

  [
    "MagSafe Clear Case",
    "Cases",
    799,
    999,
    4.6,
    "Slim transparent protective case with MagSafe-compatible magnetic ring.",
    "/products/case.jpg",
  ],

  [
    "10,000mAh Power Bank",
    "Power Banks",
    1299,
    1599,
    4.7,
    "Portable 10,000mAh power bank with fast charging support.",
    "/products/powerbank.jpg",
  ],

  [
    "Magnetic Phone Stand",
    "Stands",
    699,
    899,
    4.6,
    "Adjustable magnetic phone stand for your desk or workspace.",
    "/products/stand.jpg",
  ],

  [
    "Car Phone Holder",
    "Car Accessories",
    899,
    1199,
    4.5,
    "Secure dashboard phone holder for convenient hands-free navigation.",
    "/products/car-holder.jpg",
  ],

  [
    "Smartwatch Strap",
    "Wearables",
    499,
    699,
    4.4,
    "Comfortable and durable replacement strap suitable for everyday smartwatch use.",
    "/products/strap.jpg",
  ],

  [
    "Wireless Earbuds",
    "Audio",
    1799,
    2299,
    4.4,
    "Lightweight wireless earbuds with touch controls and a compact charging case.",
    "/products/w-earbuds.jpg",
  ],

  [
    "20W Fast Charger",
    "Chargers",
    999,
    1299,
    4.7,
    "Compact 20W USB-C fast charger for phones and tablets.",
    "/products/charger.jpg",
  ],

];


// ============================================
// CREATE PRODUCTS TABLE
// ============================================

function setupProductsTable() {

  const createTable = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      old_price DECIMAL(10,2) NOT NULL DEFAULT 0,
      rating DECIMAL(2,1) NOT NULL DEFAULT 4.5,
      description TEXT NOT NULL,
      image VARCHAR(500) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ENGINE=InnoDB
    DEFAULT CHARSET=utf8mb4;
  `;

  db.query(createTable, (err) => {

    if (err) {
      console.error(
        "❌ Could not create products table:",
        err.message
      );

      return;
    }

    db.query(
      "SELECT COUNT(*) AS count FROM products",
      (countErr, rows) => {

        if (countErr) {

          console.error(
            "❌ Could not check products:",
            countErr.message
          );

          return;
        }

        // If products already exist,
        // don't insert duplicates.

        if (
          Number(rows[0].count) > 0
        ) {
          return;
        }

        const insert = `
          INSERT INTO products
            (
              name,
              category,
              price,
              old_price,
              rating,
              description,
              image
            )
          VALUES ?
        `;

        db.query(
          insert,
          [seedProducts],
          (seedErr) => {

            if (seedErr) {

              console.error(
                "❌ Could not seed products:",
                seedErr.message
              );

            } else {

              console.log(
                "✅ Seeded MobileHub products."
              );

            }

          }
        );

      }
    );

  });

}


// ============================================
// HOME ROUTE
// ============================================

app.get("/", (req, res) => {

  res.send(
    "MobileHub backend is running!"
  );

});


// ============================================
// GET ALL PRODUCTS
// ============================================

app.get(
  "/api/products",
  (req, res) => {

    db.query(
      `
      SELECT
        id,
        name,
        category,
        price,
        old_price AS oldPrice,
        rating,
        description,
        image
      FROM products
      ORDER BY id ASC
      `,
      (err, results) => {

        if (err) {

          console.error(
            "Product fetch error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Unable to fetch products.",
          });

        }

        res.json({
          success: true,
          products: results,
        });

      }
    );

  }
);


// ============================================
// ADD PRODUCT
// ADMIN ONLY
// ============================================

app.post(
  "/api/products",
  requireAdmin,
  (req, res) => {

    const {
      name,
      category,
      price,
      oldPrice,
      rating,
      description,
      image,
    } = req.body;


    const cleanName =
      String(name || "").trim();

    const cleanCategory =
      String(category || "").trim();

    const cleanDescription =
      String(
        description || ""
      ).trim();

    const cleanImage =
      String(image || "").trim();

    const cleanPrice =
      Number(price);

    const cleanOldPrice =
      Number(oldPrice || 0);

    const cleanRating =
      Number(rating || 4.5);


    // Validate required fields

    if (
      !cleanName ||
      !cleanCategory ||
      !cleanDescription ||
      !cleanImage ||
      !Number.isFinite(cleanPrice)
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Name, category, price, description and image are required.",
      });

    }


    // Validate numeric values

    if (
      cleanPrice < 0 ||
      cleanOldPrice < 0 ||
      cleanRating < 0 ||
      cleanRating > 5
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Please enter valid price and rating values.",
      });

    }


    // Insert product

    db.query(
      `
      INSERT INTO products
      (
        name,
        category,
        price,
        old_price,
        rating,
        description,
        image
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,

      [
        cleanName,
        cleanCategory,
        cleanPrice,
        cleanOldPrice,
        cleanRating,
        cleanDescription,
        cleanImage,
      ],

      (err, result) => {

        if (err) {

          console.error(
            "Product create error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Unable to add product.",
          });

        }


        res.status(201).json({

          success: true,

          product: {

            id: result.insertId,

            name: cleanName,

            category:
              cleanCategory,

            price:
              cleanPrice,

            oldPrice:
              cleanOldPrice,

            rating:
              cleanRating,

            description:
              cleanDescription,

            image:
              cleanImage,

          },

        });

      }
    );

  }
);


// ============================================
// DELETE PRODUCT
// ADMIN ONLY
// ============================================

app.delete(
  "/api/products/:id",
  requireAdmin,
  (req, res) => {

    const id =
      Number(req.params.id);


    if (!Number.isInteger(id)) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID.",
      });

    }


    db.query(
      "DELETE FROM products WHERE id = ?",
      [id],

      (err, result) => {

        if (err) {

          console.error(
            "Product delete error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Unable to remove product.",
          });

        }


        if (
          result.affectedRows === 0
        ) {

          return res.status(404).json({
            success: false,
            message:
              "Product not found.",
          });

        }


        res.json({
          success: true,
          message:
            "Product removed successfully.",
        });

      }
    );

  }
);


// ============================================
// ADMIN LOGIN
// ============================================

app.post(
  "/api/admin/login",
  (req, res) => {

    const email =
      String(
        req.body.email || ""
      )
        .trim()
        .toLowerCase();

    const password =
      String(
        req.body.password || ""
      );


    if (
      !safeEqual(
        email,
        ADMIN_EMAIL
      ) ||
      !safeEqual(
        password,
        ADMIN_PASSWORD
      )
    ) {

      return res.status(401).json({
        success: false,
        message:
          "Invalid admin email or password.",
      });

    }


    res.json({

      success: true,

      message:
        "Admin login successful.",

      token:
        createAdminToken(),

      admin: {

        email:
          ADMIN_EMAIL,

        name:
          "MobileHub Admin",

      },

    });

  }
);


// ============================================
// TEST MYSQL CONNECTION
// ============================================

app.get(
  "/api/test-db",
  (req, res) => {

    db.query(
      "SELECT 1 AS result",
      (err, results) => {

        if (err) {

          console.error(err);

          return res.status(500).json({
            success: false,
            message:
              "Database connection failed",
          });

        }


        res.json({

          success: true,

          message:
            "MySQL database is connected!",

          result:
            results,

        });

      }
    );

  }
);


// ============================================
// GOOGLE LOGIN
// ============================================

app.post(
  "/api/auth/google",
  async (req, res) => {

    try {

      const {
        credential,
      } = req.body;


      if (!credential) {

        return res.status(400).json({
          success: false,
          message:
            "Google credential is missing.",
        });

      }


      const ticket =
        await googleClient.verifyIdToken({

          idToken:
            credential,

          audience:
            process.env.GOOGLE_CLIENT_ID,

        });


      const payload =
        ticket.getPayload();


      const googleId =
        payload.sub;

      const name =
        payload.name;

      const email =
        payload.email;

      const profilePicture =
        payload.picture;


      if (
        !googleId ||
        !email
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Unable to get required Google account information.",
        });

      }


      // Find existing user

      const findUserQuery = `
        SELECT *
        FROM users
        WHERE google_id = ?
           OR email = ?
        LIMIT 1
      `;


      db.query(
        findUserQuery,
        [
          googleId,
          email,
        ],

        (err, results) => {

          if (err) {

            console.error(
              "Database error while finding user:",
              err
            );

            return res.status(500).json({
              success: false,
              message:
                "Database error.",
            });

          }


          // Existing user

          if (
            results.length > 0
          ) {

            const existingUser =
              results[0];


            return res.json({

              success: true,

              message:
                "Google login successful.",

              user: {

                id:
                  existingUser.id,

                name:
                  existingUser.name,

                email:
                  existingUser.email,

                profile_picture:
                  existingUser.profile_picture,

              },

            });

          }


          // Create new user

          const insertUserQuery = `
            INSERT INTO users
            (
              google_id,
              name,
              email,
              profile_picture
            )
            VALUES (?, ?, ?, ?)
          `;


          db.query(
            insertUserQuery,

            [
              googleId,
              name,
              email,
              profilePicture,
            ],

            (
              insertError,
              insertResult
            ) => {

              if (insertError) {

                console.error(
                  "Database error while creating user:",
                  insertError
                );

                return res.status(500).json({
                  success: false,
                  message:
                    "Unable to create user.",
                });

              }


              return res
                .status(201)
                .json({

                  success: true,

                  message:
                    "Google account created successfully.",

                  user: {

                    id:
                      insertResult.insertId,

                    name,

                    email,

                    profile_picture:
                      profilePicture,

                  },

                });

            }
          );

        }
      );

    } catch (error) {

      console.error(
        "Google authentication error:",
        error
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid Google credential.",
      });

    }

  }
);


// ============================================
// START SERVER
// ============================================

app.listen(
  PORT,
  () => {

    console.log(
      `🚀 Server running on http://localhost:${PORT}`
    );

    setupProductsTable();

  }
);