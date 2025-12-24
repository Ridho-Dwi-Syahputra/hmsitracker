# 🚂 PANDUAN DEPLOYMENT RAILWAY - HMSI TRACKER

## 📋 PERSIAPAN

### 1. Buat Akun Railway
- Kunjungi: https://railway.app
- Sign up dengan GitHub (REKOMENDASI - paling mudah)
- Atau gunakan email

### 2. Install Railway CLI (Opsional)
```bash
npm install -g @railway/cli
railway login
```

---

## 🗄️ LANGKAH 1: SETUP DATABASE MYSQL

### A. Buat Database Service

1. **Di Railway Dashboard:**
   - Klik "New Project"
   - Pilih "Provision MySQL"
   - Database akan otomatis dibuat

2. **Salin Connection Details:**
   - Klik service MySQL yang baru dibuat
   - Pergi ke tab "Variables"
   - Catat informasi berikut:
     ```
     MYSQLHOST=<host-railway>
     MYSQLPORT=<port>
     MYSQLUSER=root
     MYSQLPASSWORD=<password>
     MYSQLDATABASE=railway
     ```

### B. Import Database

**Metode 1: Via Railway CLI**
```bash
# Login ke Railway
railway login

# Link ke project
railway link

# Connect ke MySQL
railway run mysql -h ${{MYSQLHOST}} -P ${{MYSQLPORT}} -u ${{MYSQLUSER}} -p${{MYSQLPASSWORD}} ${{MYSQLDATABASE}}

# Import database
mysql -h <MYSQLHOST> -P <MYSQLPORT> -u root -p<MYSQLPASSWORD> railway < hmsi_tracker.sql
```

**Metode 2: Via MySQL Workbench** (LEBIH MUDAH)
1. Buka MySQL Workbench
2. Create New Connection:
   - **Hostname:** `MYSQLHOST` dari Railway
   - **Port:** `MYSQLPORT` dari Railway
   - **Username:** `root`
   - **Password:** `MYSQLPASSWORD` dari Railway
3. Test Connection
4. Import SQL file: `File > Run SQL Script > hmsi_tracker.sql`

**Metode 3: Via phpMyAdmin Railway Plugin**
1. Di Railway project, klik "New"
2. Search "phpMyAdmin"
3. Deploy phpMyAdmin service
4. Connect ke MySQL service
5. Import `hmsi_tracker.sql` via phpMyAdmin interface

---

## 🚀 LANGKAH 2: DEPLOY APLIKASI NODE.JS

### A. Deploy via GitHub (REKOMENDASI)

1. **Push Code ke GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Di Railway Dashboard:**
   - Klik "New" > "GitHub Repo"
   - Pilih repository `hmsitracker`
   - Railway akan auto-detect Express app
   - Klik "Deploy"

### B. Deploy via Railway CLI

```bash
# Di folder project
cd c:\xampp\htdocs\hmsitracker

# Login Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

---

## ⚙️ LANGKAH 3: SETUP ENVIRONMENT VARIABLES

Di Railway Dashboard > Project > Service App > **Variables Tab**

Tambahkan variable berikut:

### **Variables Required:**

```env
# Database Connection (dari MySQL service Railway)
DB_HOST=${{MYSQLHOST}}
DB_PORT=${{MYSQLPORT}}
DB_USER=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}
DB_NAME=${{MYSQLDATABASE}}

# Alternative: Gunakan DATABASE_URL (Railway auto-generate)
# DATABASE_URL=${{MySQL.DATABASE_URL}}

# Application
PORT=3000
NODE_ENV=production

# Session Secret (GENERATE BARU - lebih aman!)
SESSION_SECRET=your-super-secret-key-min-32-characters-here

# Optional: Jika gunakan Redis untuk session
# REDIS_URL=${{Redis.REDIS_URL}}
```

### **Cara Mudah Link Database Variables:**

Railway bisa auto-link variables antar services:

1. Pastikan MySQL service dan App service dalam project yang sama
2. Di App Variables, gunakan syntax:
   ```
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_USER=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   DB_NAME=${{MySQL.MYSQLDATABASE}}
   DB_PORT=${{MySQL.MYSQLPORT}}
   ```
3. Railway otomatis inject nilai dari MySQL service

---

## 🔧 LANGKAH 4: KONFIGURASI TAMBAHAN

### A. Update config/db.js (Opsional - untuk Railway Database URL)

Jika ingin gunakan `DATABASE_URL` langsung:

```javascript
// config/db.js
const mysql = require('mysql2');
require('dotenv').config();

let pool;

if (process.env.DATABASE_URL) {
  // Railway menggunakan DATABASE_URL format
  pool = mysql.createPool(process.env.DATABASE_URL);
} else {
  // Development menggunakan individual credentials
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hmsi_tracker',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

module.exports = pool.promise();
```

### B. Setup Custom Domain (Opsional)

1. Di Railway Dashboard > Settings > Domains
2. Klik "Generate Domain" (gratis subdomain `.railway.app`)
3. Atau tambahkan custom domain Anda:
   - Masukkan domain: `hmsitracker.ridhodwisyahputra.my.id`
   - Railway akan berikan DNS record untuk diset di registrar
   - Biasanya CNAME record pointing ke Railway

---

## 📁 LANGKAH 5: HANDLE FILE UPLOADS

Railway memiliki **ephemeral filesystem** - file upload hilang saat redeploy.

### **Solusi: Gunakan Railway Volumes (Persistent Storage)**

1. **Di Railway Dashboard > Service > Settings:**
   - Scroll ke "Volumes"
   - Klik "Add Volume"
   - **Mount Path:** `/app/public/uploads`
   - **Size:** 1GB (sesuai kebutuhan)

2. **Volumes akan persist** file uploads bahkan setelah redeploy

### **Alternative: Cloud Storage (untuk production besar)**

- **Cloudinary** (gratis 25GB/bulan): https://cloudinary.com
- **AWS S3** (pay as you go)
- **ImageKit** (gratis 20GB bandwidth/bulan)

---

## 🔍 MONITORING & DEBUGGING

### A. Cek Logs

**Via Dashboard:**
- Railway Dashboard > Service > Deployments
- Klik deployment terbaru
- Tab "Logs" - realtime logs

**Via CLI:**
```bash
railway logs
```

### B. Cek Health

**Test Database Connection:**
```bash
railway run node -e "require('./config/db').query('SELECT 1', (err) => console.log(err ? 'DB Error' : 'DB OK'))"
```

**Test App:**
- Buka URL Railway: `https://your-app.railway.app/auth/login`

### C. Common Issues

**Issue 1: Database Connection Failed**
```
Solution: 
- Cek DB_HOST, DB_USER, DB_PASSWORD di Variables
- Pastikan MySQL service running
- Test koneksi via MySQL Workbench dulu
```

**Issue 2: 502 Bad Gateway**
```
Solution:
- Cek logs untuk error
- Pastikan PORT sudah di-set di variables
- Pastikan server.js listen di 0.0.0.0 (bukan localhost)
```

**Issue 3: File Uploads Hilang**
```
Solution:
- Setup Railway Volume untuk /app/public/uploads
- Atau migrate ke Cloudinary
```

**Issue 4: Session Hilang Setiap Redeploy**
```
Solution:
- Gunakan Redis untuk session store
- Railway punya Redis template (tinggal provision)
```

---

## 💰 PRICING

### **Hobby Plan (GRATIS)**
- $5 free credit/bulan
- Bisa jalankan:
  - 1x MySQL database
  - 1x Node.js app
  - Optional: 1x Redis (jika masih dalam budget)
- Cukup untuk development & testing

### **Usage Plan** 
- $5/bulan (jika exceed free credit)
- Pay per usage
- Cocok untuk production kecil-menengah

### **Developer Plan ($20/bulan)**
- Unlimited services
- Priority support
- Cocok untuk production besar

---

## ✅ CHECKLIST DEPLOYMENT

- [ ] Buat akun Railway
- [ ] Provision MySQL database
- [ ] Import `hmsi_tracker.sql` ke MySQL Railway
- [ ] Push code ke GitHub
- [ ] Deploy app dari GitHub repo
- [ ] Set environment variables (DB connection, SESSION_SECRET, etc.)
- [ ] Link MySQL variables ke App
- [ ] Setup Railway Volume untuk uploads (opsional)
- [ ] Generate Railway domain atau setup custom domain
- [ ] Test login dan semua fitur
- [ ] Monitor logs untuk error

---

## 🎯 QUICK START (PALING CEPAT)

```bash
# 1. Push ke GitHub
git add .
git commit -m "Railway deployment"
git push origin main

# 2. Buka Railway Dashboard
# - New Project > Deploy from GitHub Repo
# - Pilih repository hmsitracker

# 3. Add MySQL
# - New > Database > MySQL

# 4. Set Variables di App Service
DB_HOST=${{MySQL.MYSQLHOST}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_PORT=${{MySQL.MYSQLPORT}}
NODE_ENV=production
SESSION_SECRET=generate-random-32-chars-here

# 5. Import Database via MySQL Workbench
# - Connect ke Railway MySQL
# - Run hmsi_tracker.sql

# 6. Redeploy App (otomatis setelah set variables)

# 7. Test app di URL Railway
```

---

## 🆘 SUPPORT

**Railway Documentation:**
- https://docs.railway.app

**Railway Discord:**
- https://discord.gg/railway

**Troubleshooting:**
- Cek Railway Logs (paling penting!)
- Test database connection manual
- Pastikan environment variables benar
- Cek Railway status page: https://railway.statuspage.io

---

## 📊 PERBANDINGAN HOSTING

| Feature | Railway | Vercel | CariHosting |
|---------|---------|--------|-------------|
| **MySQL Built-in** | ✅ Yes | ❌ No | ✅ Yes |
| **Node.js Support** | ✅ Full | ⚠️ Serverless only | ✅ Full |
| **File Upload Persist** | ✅ With Volumes | ❌ No | ✅ Yes |
| **Free Tier** | ✅ $5/mo credit | ✅ Unlimited | ❌ Paid only |
| **Auto Deploy** | ✅ GitHub integration | ✅ GitHub integration | ❌ Manual |
| **Logs & Monitoring** | ✅ Excellent | ✅ Good | ⚠️ Basic |
| **Setup Complexity** | ⭐⭐ Easy | ⭐⭐⭐ Medium | ⭐⭐⭐⭐ Hard |
| **Best For** | Full-stack apps | Frontend + API | Traditional hosting |

---

**Kesimpulan:** Railway adalah pilihan terbaik untuk HMSI Tracker karena:
- ✅ Support MySQL langsung
- ✅ Easy deployment via GitHub
- ✅ Free tier cukup untuk testing
- ✅ File uploads bisa persist dengan Volumes
- ✅ Logs dan monitoring excellent
- ✅ Auto-deploy dari git push

**Siap deploy? Ikuti checklist di atas! 🚀**
