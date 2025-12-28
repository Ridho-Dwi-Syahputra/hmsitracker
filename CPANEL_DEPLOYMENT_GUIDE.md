# 🌐 Deploy HMSI Tracker ke Jagoan Hosting (cPanel)

## 📋 Prerequisites

✅ Domain sudah terdaftar (contoh: `hmsitracker.my.id`)  
✅ Akses cPanel dari Jagoan Hosting  
✅ MySQL database sudah tersedia  
✅ Node.js support di hosting (pastikan paket hosting support Node.js)

---

## 🚀 Step-by-Step Deployment

### Step 1: Setup Database di cPanel

#### 1.1 Buat Database MySQL

1. Login ke **cPanel**
2. Cari **MySQL® Databases**
3. Di bagian **Create New Database:**
   - Database Name: `hmsitracker` (atau nama lain)
   - Klik **Create Database**

#### 1.2 Buat User Database

Di bagian **MySQL Users** → **Add New User:**
- Username: `hmsiuser` (atau nama lain)
- Password: (generate strong password)
- Klik **Create User**

#### 1.3 Tambahkan User ke Database

Di bagian **Add User To Database:**
- User: pilih user yang tadi dibuat
- Database: pilih database yang tadi dibuat
- Klik **Add**
- Centang **ALL PRIVILEGES**
- Klik **Make Changes**

#### 1.4 Import Database

1. Buka **phpMyAdmin** dari cPanel
2. Pilih database `hmsitracker`
3. Klik tab **Import**
4. **Choose File** → pilih `hmsi_tracker.sql`
5. Klik **Go** / **Import**
6. Tunggu sampai selesai
7. Verify: Cek tabel `User`, `Divisi`, `Program_kerja`, `Laporan`, `Evaluasi`, `Notifikasi` sudah ada

---

### Step 2: Upload Files ke Hosting

#### Option A: Via File Manager cPanel

1. Buka **File Manager** di cPanel
2. Navigate ke **Document Root** (biasanya `/home/username/public_html` atau `/home/username/hmsitracker.my.id`)
3. **Upload** semua file project KECUALI:
   - ❌ `node_modules/` (jangan upload, akan di-install via npm)
   - ❌ `.git/` (opsional, bisa skip)
   - ❌ `public/uploads/` dengan file lama (optional)
4. Extract jika upload dalam bentuk ZIP

#### Option B: Via FTP (Recommended)

1. Download FTP client: [FileZilla](https://filezilla-project.org/)
2. Connect ke FTP:
   - Host: `ftp.yourdomain.com` atau IP dari cPanel
   - Username: cPanel username
   - Password: cPanel password
   - Port: 21
3. Upload semua file ke folder domain root

**File/folder yang HARUS diupload:**
```
✅ controllers/
✅ config/
✅ middleware/
✅ routes/
✅ views/
✅ services/
✅ public/ (kecuali uploads dengan data lama)
✅ server.js
✅ package.json
✅ .env (buat manual, lihat Step 3)
```

---

### Step 3: Setup Environment Variables

#### 3.1 Buat File `.env`

Di **File Manager** cPanel atau via FTP, buat file `.env` di root project:

```bash
# Database Configuration (dari Step 1)
DB_HOST=localhost
DB_USER=hmsiuser
DB_PASSWORD=your_database_password_here
DB_NAME=hmsitracker
DB_PORT=3306

# Session Secret (generate random string min 32 karakter)
SESSION_SECRET=hmsi_secret_key_production_2024_min_32_chars

# Environment
NODE_ENV=production

# Port (cPanel biasanya assign otomatis, tapi backup)
PORT=3000
```

**⚠️ PENTING:**
- Ganti `DB_USER`, `DB_PASSWORD`, `DB_NAME` sesuai yang kamu buat di Step 1.4
- `DB_HOST` hampir selalu `localhost` di shared hosting
- `SESSION_SECRET` harus random dan panjang (min 32 karakter)

#### 3.2 Protect File `.env`

Di file `.htaccess` (buat jika belum ada), tambahkan:

```apache
# Protect .env file
<Files .env>
    Order allow,deny
    Deny from all
</Files>
```

---

### Step 4: Install Dependencies

#### Via Terminal cPanel (jika tersedia)

1. Buka **Terminal** di cPanel
2. Navigate ke folder project:
   ```bash
   cd ~/public_html/hmsitracker
   ```
3. Install dependencies:
   ```bash
   npm install --production
   ```
4. Tunggu sampai selesai

#### Via SSH (jika akses SSH aktif)

```bash
ssh username@yourdomain.com
cd ~/public_html/hmsitracker
npm install --production
```

**Catatan:** Jika hosting tidak support terminal/SSH, contact support Jagoan Hosting untuk install dependencies.

---

### Step 5: Setup Node.js App di cPanel

#### 5.1 Buka Setup Node.js Application

1. Di cPanel, cari **Setup Node.js App** atau **Node.js Selector**
2. Klik **Create Application**

#### 5.2 Konfigurasi Aplikasi

**Application root:**
```
hmsitracker (atau nama folder project kamu)
```

**Application URL:**
```
https://hmsitracker.my.id (atau domain/subdomain kamu)
```

**Application startup file:**
```
server.js
```

**Node.js version:**
- Pilih versi terbaru (minimal 14.x, recommended 18.x atau 20.x)

**Application mode:**
- Production

**Environment variables** (jika ada kolom):
- Tambahkan semua variable dari `.env` di sini juga (backup)

#### 5.3 Start Application

1. Klik **Create** atau **Save**
2. Klik **Start App** atau **Run NPM Install**
3. Tunggu sampai status **Running**

---

### Step 6: Setup Domain & Document Root

#### Option A: Domain Utama (hmsitracker.my.id)

1. Di cPanel, buka **Domains** atau **Addon Domains**
2. Pastikan domain sudah pointing ke document root yang benar
3. Document root: `/home/username/public_html/hmsitracker`

#### Option B: Subdomain (app.hmsitracker.my.id)

1. Buka **Subdomains**
2. **Subdomain:** `app`
3. **Document Root:** otomatis atau manual ke `/home/username/hmsitracker`

#### Shared Document Root (Screenshot kamu)

Jika mau share document root dengan domain lain:
- ✅ Centang: **"Share document root (/home/hmsitrack/public_html) with "hmsitracker.my.id""**
- Ini artinya domain baru akan serve konten yang sama

---

### Step 7: Verify & Test

#### 7.1 Cek Status App

1. Di **Setup Node.js App**, cek status: **Running** ✅
2. Lihat **Restart** button tersedia (artinya app running)

#### 7.2 Test Database Connection

Buka browser, akses:
```
https://hmsitracker.my.id
```

**Expected:** Login page muncul tanpa error

#### 7.3 Test Login

1. Gunakan kredensial admin dari database
2. Jika berhasil login → **Deployment sukses!** 🎉

---

## 🐛 Troubleshooting

### Error 1: "Application failed to start"

**Penyebab:**
- Port conflict
- Dependencies belum ter-install
- Syntax error di code

**Solusi:**
1. Cek logs di **Setup Node.js App** → **Log**
2. Pastikan `npm install` sudah dijalankan
3. Cek file `.env` format benar (no trailing spaces)
4. Restart application

---

### Error 2: "Can't connect to MySQL server"

**Error message:** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Penyebab:**
- DB_HOST salah
- Database belum dibuat
- User belum diberi privileges

**Solusi:**
1. Cek `.env`:
   ```bash
   DB_HOST=localhost  # BUKAN 127.0.0.1 di cPanel!
   ```
2. Verify database exist di phpMyAdmin
3. Verify user punya ALL PRIVILEGES

---

### Error 3: "Table doesn't exist"

**Error:** `ER_NO_SUCH_TABLE: Table 'hmsitracker.User' doesn't exist`

**Penyebab:**
- Database belum di-import
- Import gagal
- Nama database salah

**Solusi:**
1. Re-import `hmsi_tracker.sql` via phpMyAdmin
2. Cek nama database di `.env` sama dengan di cPanel
3. Case-sensitive check: `hmsitracker` vs `hmsi_tracker`

---

### Error 4: "Session secret required"

**Error:** `Error: secret option required for sessions`

**Penyebab:**
- `SESSION_SECRET` tidak di-set di `.env`

**Solusi:**
1. Buka `.env`, pastikan ada:
   ```bash
   SESSION_SECRET=your_random_secret_min_32_characters
   ```
2. Generate random string:
   ```javascript
   // Di browser console:
   Array.from({length:32}, () => Math.random().toString(36)[2]).join('')
   ```

---

### Error 5: "Cannot find module 'xyz'"

**Error:** `Error: Cannot find module 'express'` atau module lain

**Penyebab:**
- `node_modules/` tidak ter-install
- Dependencies corrupt

**Solusi:**
1. Via Terminal cPanel:
   ```bash
   cd ~/public_html/hmsitracker
   rm -rf node_modules package-lock.json
   npm install --production
   ```
2. Restart Node.js application di cPanel

---

### Error 6: Static files (CSS/JS/Images) 404

**Penyebab:**
- Document root salah
- Path public/ tidak ter-serve

**Solusi:**
1. Cek di `server.js`:
   ```javascript
   app.use(express.static(path.join(__dirname, "public")));
   ```
2. Verify folder structure:
   ```
   /home/username/hmsitracker/
   ├── server.js
   ├── public/
   │   ├── stylesheets/
   │   ├── javascripts/
   │   └── images/
   ```
3. Clear browser cache

---

### Error 7: "Address already in use"

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Penyebab:**
- Port 3000 sudah dipakai app lain
- cPanel assign port otomatis

**Solusi:**
1. Di cPanel Node.js setup, port biasanya auto-assigned
2. Pastikan `server.js` pakai:
   ```javascript
   const PORT = process.env.PORT || 3000;
   ```
3. Restart application

---

## 📊 Monitoring & Maintenance

### View Application Logs

1. Di **Setup Node.js App**
2. Klik **Log** atau **Show Logs**
3. Monitor errors real-time

### Restart Application

Setelah update code:
1. Upload file baru via FTP
2. Di **Setup Node.js App** → klik **Restart**

### Update Dependencies

```bash
cd ~/public_html/hmsitracker
npm update
```

### Database Backup

1. phpMyAdmin → database `hmsitracker`
2. Tab **Export**
3. Format: **SQL**
4. Klik **Go** → save file
5. Backup berkala (weekly/monthly)

---

## 🔐 Security Best Practices

### 1. Protect `.env` File

`.htaccess`:
```apache
<Files .env>
    Order allow,deny
    Deny from all
</Files>
```

### 2. Enable HTTPS/SSL

1. Di cPanel, cari **SSL/TLS Status**
2. Install **Let's Encrypt** SSL (gratis)
3. Update `server.js` jika perlu:
   ```javascript
   cookie: { 
     secure: process.env.NODE_ENV === 'production', // HTTPS only
     httpOnly: true 
   }
   ```

### 3. Strong Database Password

- Min 16 karakter
- Kombinasi uppercase, lowercase, angka, symbol
- Jangan pakai password default

### 4. File Permissions

Via Terminal atau File Manager:
```bash
chmod 644 .env          # Read-only for owner
chmod 755 public/       # Executable directory
chmod 644 public/*      # Read-only files
```

---

## 📈 Performance Optimization

### 1. Enable Compression

`.htaccess`:
```apache
# Enable Gzip Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

### 2. Cache Static Assets

`.htaccess`:
```apache
# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 3. Connection Pooling (sudah ada)

`config/db.js` sudah optimal:
```javascript
connectionLimit: 10,  // Max 10 concurrent connections
queueLimit: 0         // Unlimited queue
```

---

## 🎯 Quick Checklist

**Sebelum deploy, pastikan:**

- [ ] ✅ Database MySQL sudah dibuat di cPanel
- [ ] ✅ User database sudah punya ALL PRIVILEGES
- [ ] ✅ File `hmsi_tracker.sql` sudah di-import
- [ ] ✅ Semua file project sudah diupload (kecuali `node_modules`)
- [ ] ✅ File `.env` sudah dibuat dengan kredensial benar
- [ ] ✅ `npm install` sudah dijalankan via Terminal
- [ ] ✅ Node.js App sudah di-setup dan running
- [ ] ✅ Domain sudah pointing ke document root
- [ ] ✅ SSL certificate active (HTTPS)
- [ ] ✅ Test login berhasil

---

## 📞 Bantuan Lebih Lanjut

### Jika Masih Error:

1. **Screenshot error message** dari browser
2. **Copy log dari Setup Node.js App**
3. **Share file `.env`** (CENSORED password)
4. **Cek phpMyAdmin** → apakah tabel ada?

### Contact Jagoan Hosting Support:

- Live Chat di website
- Email support
- Tanya tentang:
  - Node.js version support
  - Port configuration
  - npm install permission

---

**Good luck dengan deployment! 🚀**

Kalau ada error, share screenshot error + logs, kita debug bareng 👍
