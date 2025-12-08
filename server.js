// =====================================================
// 1. Import Modules
// =====================================================
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");
const flash = require("connect-flash");

// Middleware custom
const unreadNotif = require("./middleware/unreadNotif"); // ⬅️ Tambahan

// Services
const autoDeleteNotifikasi = require("./services/autoDeleteNotifikasi"); // ⬅️ Auto cleanup service

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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use(express.static(path.join(__dirname, "public")));
// ✅ Pastikan route /uploads langsung mengarah ke folder yang sama (fix 404 image)
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "hmsi_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, 
  })
);

// Flash middleware
app.use(flash());

// Inject flash + user ke locals (biar bisa langsung dipakai di EJS)
app.use((req, res, next) => {
  res.locals.errorMsg = req.flash("error");
  res.locals.successMsg = req.flash("success");
  res.locals.user = req.session.user || null;
  next();
});

// Middleware global notifikasi HMSI
app.use(unreadNotif); // ⬅️ Sekarang unreadCount otomatis ada di semua view

// =====================================================
// 5. Routing
// =====================================================

// Auth routes (login/logout)
const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

// // Default / Home
// const indexRouter = require("./routes/index");
// app.use("/", indexRouter);

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
// 5.1. Admin/Debug Routes (opsional untuk testing)
// =====================================================
if (process.env.NODE_ENV !== 'production') {
  // Manual cleanup endpoint untuk testing
  // Endpoint untuk pembersihan manual notifikasi dengan referensi tidak valid
  app.get("/debug/cleanup-notifications", async (req, res) => {
    try {
      const result = await autoDeleteNotifikasi.manualCleanup();
      res.json({ 
        success: true, 
        message: 'Pembersihan manual berhasil dijalankan',
        result: result,
        logFile: "logs/services/autoDeleteNotifikasi.log" 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Endpoint untuk melihat notifikasi dengan referensi tidak valid (dry-run)
  app.get("/debug/check-orphaned-notifications", async (req, res) => {
    try {
      const result = await autoDeleteNotifikasi.checkOrphanedNotifications();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Endpoint untuk melihat status log file
  app.get("/debug/log-status", (req, res) => {
    try {
      const logInfo = autoDeleteNotifikasi.getLogInfo();
      res.json({ 
        success: true, 
        logInfo: logInfo,
        logPath: "logs/services/autoDeleteNotifikasi.log"
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
}

// =====================================================
// 6. Auto Services
// =====================================================

// Start auto cleanup service untuk notifikasi orphaned
autoDeleteNotifikasi.startAutoCleanup();

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  autoDeleteNotifikasi.stopAutoCleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  autoDeleteNotifikasi.stopAutoCleanup();
  process.exit(0);
});

// =====================================================
// 7. Start Server
// =====================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}/auth/login`);
  console.log(`📁 Auto-cleanup service logs: logs/services/autoDeleteNotifikasi.log`);
});
