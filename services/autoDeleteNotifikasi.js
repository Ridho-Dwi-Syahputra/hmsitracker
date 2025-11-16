// =====================================================
// services/autoDeleteNotifikasi.js
// Service untuk menghapus notifikasi dengan referensi tidak valid setiap 30 detik
// =====================================================

const db = require("../config/db");
const fs = require('fs');
const path = require('path');

let intervalId = null;

// =====================================================
// Setup logging
// =====================================================
const LOG_DIR = path.join(__dirname, '../logs/services');
const LOG_FILE = path.join(LOG_DIR, 'autoDeleteNotifikasi.log');
const MAX_LOG_LINES = 100; // Maksimal 100 baris log

// Pastikan direktori log ada
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Fungsi untuk membatasi jumlah baris dalam file log
function trimLogFile() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return;
    }

    const logContent = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length > MAX_LOG_LINES) {
      // Ambil hanya 100 baris terakhir
      const trimmedLines = lines.slice(-MAX_LOG_LINES);
      fs.writeFileSync(LOG_FILE, trimmedLines.join('\n') + '\n');
    }
  } catch (error) {
    console.error('Gagal memangkas file log:', error.message);
  }
}

// Fungsi untuk menulis log ke file
function writeLog(level, message) {
  // Format waktu Indonesia (WIB)
  const now = new Date();
  const timestamp = now.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const logEntry = `[${timestamp} WIB] [${level}] ${message}\n`;
  
  try {
    fs.appendFileSync(LOG_FILE, logEntry);
    
    // Trim file setelah menulis log baru
    trimLogFile();
  } catch (error) {
    console.error('Gagal menulis ke file log:', error.message);
    console.log(logEntry.trim()); // Fallback to console
  }
}

// =====================================================
// Fungsi untuk memeriksa notifikasi dengan referensi tidak valid (dry-run)
// =====================================================
async function checkOrphanedNotifications() {
  try {
    writeLog('INFO', 'Memeriksa notifikasi tanpa referensi valid (mode dry-run)...');

    // Query yang sama seperti di cleanupOrphanedNotifications tapi tidak menghapus
    const [orphanedNotifs] = await db.query(`
      SELECT 
        n.id_notifikasi,
        n.pesan,
        n.id_ProgramKerja,
        n.id_laporan, 
        n.id_evaluasi,
        n.created_at,
        CASE 
          WHEN (n.id_ProgramKerja IS NULL AND n.id_laporan IS NULL AND n.id_evaluasi IS NULL) THEN 'no_reference'
          WHEN (n.id_evaluasi IS NOT NULL AND e.id_evaluasi IS NULL) THEN 'evaluasi_deleted'
          WHEN (n.id_laporan IS NOT NULL AND l.id_laporan IS NULL) THEN 'laporan_deleted'
          WHEN (n.id_ProgramKerja IS NOT NULL AND p.id_ProgramKerja IS NULL) THEN 'program_kerja_deleted'
          ELSE 'unknown'
        END AS orphan_type
      FROM Notifikasi n
      LEFT JOIN Program_kerja p ON n.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN Laporan l ON n.id_laporan = l.id_laporan
      LEFT JOIN Evaluasi e ON n.id_evaluasi = e.id_evaluasi
      WHERE (
        (n.id_ProgramKerja IS NULL AND n.id_laporan IS NULL AND n.id_evaluasi IS NULL)
        OR
        (n.id_evaluasi IS NOT NULL AND e.id_evaluasi IS NULL) OR
        (n.id_laporan IS NOT NULL AND l.id_laporan IS NULL) OR
        (n.id_ProgramKerja IS NOT NULL AND p.id_ProgramKerja IS NULL)
      )
      ORDER BY n.created_at DESC
    `);

    writeLog('INFO', `Hasil pemeriksaan: ${orphanedNotifs.length} notifikasi dengan referensi tidak valid`);
    
    return {
      success: true,
      orphanedCount: orphanedNotifs.length,
      message: `Ditemukan ${orphanedNotifs.length} notifikasi dengan referensi tidak valid`,
      orphanedNotifications: orphanedNotifs.map(n => ({
        id: n.id_notifikasi,
        message: n.pesan,
        type: n.orphan_type,
        references: {
          programKerja: n.id_ProgramKerja,
          laporan: n.id_laporan,
          evaluasi: n.id_evaluasi
        },
        createdAt: n.created_at
      }))
    };

  } catch (error) {
    writeLog('ERROR', `Kesalahan saat memeriksa notifikasi: ${error.message}`);
    throw error;
  }
}

// =====================================================
// Fungsi untuk menghapus notifikasi dengan referensi tidak valid
// =====================================================
async function cleanupOrphanedNotifications() {
  try {
    writeLog('INFO', 'Memeriksa notifikasi tanpa referensi valid (laporan/proker/evaluasi)...');

    // Query untuk mencari notifikasi yang TIDAK memiliki setidaknya salah satu referensi
    // ATAU yang referensinya tidak valid (data sudah dihapus)
    const [orphanedNotifs] = await db.query(`
      SELECT 
        n.id_notifikasi,
        n.pesan,
        n.id_ProgramKerja,
        n.id_laporan, 
        n.id_evaluasi,
        CASE 
          WHEN (n.id_ProgramKerja IS NULL AND n.id_laporan IS NULL AND n.id_evaluasi IS NULL) THEN 'no_reference'
          WHEN (n.id_evaluasi IS NOT NULL AND e.id_evaluasi IS NULL) THEN 'evaluasi_deleted'
          WHEN (n.id_laporan IS NOT NULL AND l.id_laporan IS NULL) THEN 'laporan_deleted'
          WHEN (n.id_ProgramKerja IS NOT NULL AND p.id_ProgramKerja IS NULL) THEN 'program_kerja_deleted'
          ELSE 'unknown'
        END AS orphan_type
      FROM Notifikasi n
      LEFT JOIN Program_kerja p ON n.id_ProgramKerja = p.id_ProgramKerja
      LEFT JOIN Laporan l ON n.id_laporan = l.id_laporan
      LEFT JOIN Evaluasi e ON n.id_evaluasi = e.id_evaluasi
      WHERE (
        -- Tidak memiliki setidaknya salah satu referensi
        (n.id_ProgramKerja IS NULL AND n.id_laporan IS NULL AND n.id_evaluasi IS NULL)
        OR
        -- Atau referensinya sudah tidak valid (data dihapus)
        (n.id_evaluasi IS NOT NULL AND e.id_evaluasi IS NULL) OR
        (n.id_laporan IS NOT NULL AND l.id_laporan IS NULL) OR
        (n.id_ProgramKerja IS NOT NULL AND p.id_ProgramKerja IS NULL)
      )
    `);

    if (orphanedNotifs.length === 0) {
      writeLog('INFO', 'Tidak ada notifikasi dengan referensi tidak valid yang ditemukan');
      return { deletedCount: 0, orphanedNotifications: [] };
    }

    writeLog('INFO', `Ditemukan ${orphanedNotifs.length} notifikasi dengan referensi tidak valid`);
    
    // Log detail notifikasi yang akan dihapus
    orphanedNotifs.forEach(notif => {
      const refs = [];
      if (notif.id_ProgramKerja) refs.push(`ProgramKerja:${notif.id_ProgramKerja}`);
      if (notif.id_laporan) refs.push(`Laporan:${notif.id_laporan}`);
      if (notif.id_evaluasi) refs.push(`Evaluasi:${notif.id_evaluasi}`);
      const refString = refs.length > 0 ? refs.join(', ') : 'TIDAK_ADA_REFERENSI';
      
      writeLog('INFO', `Notifikasi referensi tidak valid - ID: ${notif.id_notifikasi}, Tipe: ${notif.orphan_type}, Referensi: [${refString}], Pesan: ${notif.pesan.substring(0, 50)}...`);
    });

    // Hapus notifikasi orphaned
    const orphanedIds = orphanedNotifs.map(n => n.id_notifikasi);
    const placeholders = orphanedIds.map(() => '?').join(',');
    
    const [result] = await db.query(
      `DELETE FROM Notifikasi WHERE id_notifikasi IN (${placeholders})`,
      orphanedIds
    );

    writeLog('SUCCESS', `Berhasil menghapus ${result.affectedRows} notifikasi dengan referensi tidak valid`);

    return {
      deletedCount: result.affectedRows,
      orphanedNotifications: orphanedNotifs.map(n => ({
        id: n.id_notifikasi,
        type: n.orphan_type,
        message: n.pesan
      }))
    };

  } catch (error) {
    writeLog('ERROR', `Kesalahan saat membersihkan notifikasi dengan referensi tidak valid: ${error.message}`);
    throw error;
  }
}

// =====================================================
// Fungsi untuk memulai service
// =====================================================
function startAutoCleanup() {
  if (intervalId) {
    writeLog('WARN', 'Layanan pembersihan otomatis sudah berjalan');
    return;
  }

  writeLog('INFO', 'Memulai layanan pembersihan otomatis (setiap 30 detik)');
  
  // Jalankan sekali saat startup
  cleanupOrphanedNotifications();
  
  // Set interval untuk menjalankan setiap 30 detik
  intervalId = setInterval(cleanupOrphanedNotifications, 30000);
}

// =====================================================
// Fungsi untuk menghentikan service
// =====================================================
function stopAutoCleanup() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    writeLog('INFO', 'Layanan pembersihan otomatis dihentikan');
  }
}

// =====================================================
// Fungsi untuk cleanup manual (untuk testing)
// =====================================================
async function manualCleanup() {
  writeLog('INFO', 'Menjalankan pembersihan manual...');
  const result = await cleanupOrphanedNotifications();
  return result;
}

// =====================================================
// Fungsi untuk mendapatkan info log file
// =====================================================
function getLogInfo() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return { exists: false, lines: 0, size: 0 };
    }

    const logContent = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim() !== '');
    const stats = fs.statSync(LOG_FILE);
    
    return {
      exists: true,
      lines: lines.length,
      maxLines: MAX_LOG_LINES,
      size: stats.size,
      lastModified: stats.mtime
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

// =====================================================
// Export functions
// =====================================================
module.exports = {
  startAutoCleanup,
  stopAutoCleanup,
  manualCleanup,
  cleanupOrphanedNotifications,
  checkOrphanedNotifications,
  getLogInfo
};
