// =====================================================
// 1. Import Modules
// =====================================================
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session"); // Middleware untuk session

// =====================================================
// 2. Konfigurasi Dasar
// =====================================================
dotenv.config(); // Load file .env
const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// 3. Setup View Engine (EJS)
// =====================================================
app.set("views", path.join(__dirname, "views")); // folder views
app.set("view engine", "ejs"); // pakai ejs sebagai templating engine

// =====================================================
// 4. Middleware Umum
// =====================================================
// Parsing request body (JSON & Form data)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static files (CSS, JS, Images di folder public)
app.use(express.static(path.join(__dirname, "public")));

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "hmsi_secret_key", // 🔑 ambil dari .env
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // kalau pakai HTTPS ubah ke true
  })
);

// =====================================================
// 4. public upload
// =====================================================
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));


// =====================================================
// 5. Routing
// =====================================================

// Auth routes (login, logout)
const authRouter = require("./routes/auth/auth");
app.use("/", authRouter);

// Default / Home
const indexRouter = require("./routes/index");
app.use("/", indexRouter);

// User Management
const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

// Dashboard HMSI
const hmsiRouter = require("./routes/hmsi/hmsi");
app.use("/hmsi", hmsiRouter);

// Dashboard Admin
const adminRouter = require("./routes/admin/admin");
app.use("/admin", adminRouter);

// Dashboard DPA
const dpaRouter = require("./routes/dpa/dpa");
app.use("/dpa", dpaRouter);


// =====================================================
// 7. Start Server
// =====================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
