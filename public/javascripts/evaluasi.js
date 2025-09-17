// public/javascripts/evaluasi.js
document.addEventListener('DOMContentLoaded', () => {
    const btnTambah = document.getElementById('btn-tambah-komentar');
    const modal = document.getElementById('modal-komentar');
    const btnBatal = document.getElementById('btn-batal-komentar');
    const btnSimpan = document.getElementById('btn-simpan-komentar');
    const inputKomentar = document.getElementById('input-komentar');
    const komentarList = document.getElementById('komentar-list');
    const evaluasiId = window.__EVALUASI_ID;
  
    function openModal() {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      inputKomentar.focus();
    }
    function closeModal() {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      inputKomentar.value = '';
    }
  
    btnTambah?.addEventListener('click', openModal);
    btnBatal?.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });
  
    btnSimpan?.addEventListener('click', async (e) => {
      e.preventDefault();
      const isi = inputKomentar.value.trim();
      if (!isi) return alert('Komentar tidak boleh kosong');
  
      try {
        const res = await fetch(`/hmsi/evaluasi/${evaluasiId}/komentar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isi })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Server error');
  
        // Tambahkan komentar baru ke DOM (append)
        const k = data.komentar;
        const div = document.createElement('div');
        div.className = 'bg-white border-l-4 border-orange-500 p-4 rounded-lg shadow-sm';
        div.innerHTML = `<div class="flex items-start justify-between">
          <p class="text-gray-700 leading-relaxed m-0">${escapeHtml(k.isi)}</p>
          <span class="text-xs text-gray-400">${new Date(k.tanggal_komentar).toLocaleString('id-ID')}</span>
        </div>`;
        // jika sebelumnya pesan "Belum ada komentar" hapus
        if (komentarList.querySelector('.text-center')) komentarList.innerHTML = '';
        komentarList.appendChild(div);
        closeModal();
      } catch (err) {
        console.error(err);
        alert('Gagal menyimpan komentar');
      }
    });
  
    // Simple XSS escape
    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }
  });
  