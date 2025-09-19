// =====================================================
// 1. Import Modules
// =====================================================
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");

// =====================================================
// 2. Konfigurasi Dasar
// =====================================================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// 3. Setup View Engine (EJS)
// =====================================================
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// =====================================================
// 4. Middleware Umum
// =====================================================
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "hmsi_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Uploads folder
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// =====================================================
// 5. Routing
// =====================================================

// Auth routes (login/logout)
const authRouter = require("./routes/auth"); // ✅ sudah benar
app.use("/auth", authRouter);

// Default / Home
const indexRouter = require("./routes/index");
app.use("/", indexRouter);

// User Management
const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

// HMSI
const hmsiRouter = require("./routes/hmsi/hmsi");
app.use("/hmsi", hmsiRouter);

// Admin
const adminRouter = require("./routes/admin/admin");
app.use("/admin", adminRouter);

// DPA
const dpaRouter = require("./routes/dpa/dpa");
app.use("/dpa", dpaRouter);

// =====================================================
// 6. Start Server
// =====================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
