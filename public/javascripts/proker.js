// =====================================================
// proker.js
// Script reusable untuk Tambah & Edit Program Kerja (Proker)
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    // =====================================================
    // 1. Tombol Simpan → Loading State
    // =====================================================
    const form = document.querySelector("form");
    const submitBtn = document.getElementById("submitBtn");
    const btnText = document.getElementById("btnText");
    const btnSpinner = document.getElementById("btnSpinner");
  
    if (form) {
      form.addEventListener("submit", () => {
        // Deteksi apakah halaman "Tambah" atau "Edit"
        const isEdit = form.getAttribute("data-mode") === "edit";
  
        btnText.textContent = isEdit ? "Mengupdate..." : "Menyimpan...";
        btnSpinner.classList.remove("hidden");
        submitBtn.disabled = true;
      });
    }
  
    // =====================================================
    // 2. Upload Dropzone
    // =====================================================
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("fileUpload");
    const fileName = document.getElementById("fileName");
  
    if (dropzone && fileInput) {
      // Drag Over
      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("bg-orange-100", "border-orange-500");
      });
  
      // Drag Leave
      dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("bg-orange-100", "border-orange-500");
      });
  
      // Drop File
      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        fileInput.files = e.dataTransfer.files;
        handleFile(fileInput.files[0]);
      });
  
      // Pilih File via Klik
      fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 1) {
          alert("❌ Hanya bisa upload 1 file.");
          fileInput.value = "";
          return;
        }
        handleFile(fileInput.files[0]);
      });
    }
  
    // =====================================================
    // 3. Fungsi Validasi File
    // =====================================================
    function handleFile(file) {
      if (!file) return;
  
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png"
      ];
  
      if (!allowedTypes.includes(file.type)) {
        alert("❌ Format file tidak didukung. Hanya PDF, JPG, PNG.");
        fileInput.value = "";
        return;
      }
  
      if (file.size > 5 * 1024 * 1024) {
        alert("❌ Ukuran file tidak boleh lebih dari 5MB.");
        fileInput.value = "";
        return;
      }
  
      fileName.textContent = `✅ ${file.name} berhasil dipilih.`;
    }
  
    // =====================================================
    // 4. Auto-hide Alert / Popup Message
    // =====================================================
    const popup = document.getElementById("popupMessage");
    if (popup) {
      setTimeout(() => {
        popup.classList.add("hidden");
      }, 4000); // auto-hide 4 detik
    }
  });
  