// Modul 17: Repositori Dokumen Setempat (PDF, PPT, Excel, Gambar, Lampiran)
export function initRepository(container, params) {
  const state = window.smartGovState;

  container.innerHTML = `
    <div class="page-title-section no-print">
      <div>
        <h2 class="page-title">Repositori Fail & Lampiran</h2>
        <p class="page-subtitle">Modul 17: Pusat penyimpanan fail PDF, Gambar, PowerPoint, Excel dan Surat Rasmi dalam satu tempat</p>
      </div>
      <div>
        <button class="btn btn-primary" id="openUploadModalBtn">
          <i data-lucide="upload-cloud"></i> Muat Naik Fail Baru
        </button>
      </div>
    </div>

    <!-- Repository File Grid Section -->
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; gap:16px;">
        <h3 class="card-title" style="margin-bottom:0;"><i data-lucide="folder-open"></i> Semua Fail Simpanan</h3>
        <input type="text" id="repoSearchInput" class="form-control" placeholder="Cari fail berdasarkan tajuk..." style="max-width:320px;">
      </div>

      <div class="repo-grid" id="repoGridContainer">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  // Init Lucide
  if (window.lucide) window.lucide.createIcons();

  // Populate files
  renderRepoGrid();

  // Attach search
  const searchInput = document.getElementById('repoSearchInput');
  searchInput.addEventListener('input', () => {
    renderRepoGrid(searchInput.value.trim());
  });

  // Attach upload modal
  document.getElementById('openUploadModalBtn').addEventListener('click', () => {
    openUploadModal();
  });
}

function renderRepoGrid(searchFilter = '') {
  const state = window.smartGovState;
  const grid = document.getElementById('repoGridContainer');
  if (!grid) return;

  const query = searchFilter.toLowerCase();
  const filtered = state.repository.filter(doc => 
    doc.tajuk.toLowerCase().includes(query) ||
    doc.namaFail.toLowerCase().includes(query) ||
    doc.jenis.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding: 48px 0; color:var(--text-muted);">
        <i data-lucide="folder" style="width:48px;height:48px;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;"></i>
        <p>Tiada fail ditemui. Sila muat naik fail pertama anda.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(doc => {
    let iconClass = 'pdf';
    let fileIcon = 'file-text';
    
    if (doc.jenis === 'PDF') { iconClass = 'pdf'; fileIcon = 'file-text'; }
    else if (doc.jenis === 'Excel') { iconClass = 'excel'; fileIcon = 'file-spreadsheet'; }
    else if (doc.jenis === 'PowerPoint') { iconClass = 'ppt'; fileIcon = 'presentation'; }
    else if (doc.jenis === 'Gambar') { iconClass = 'image'; fileIcon = 'image'; }
    else if (doc.jenis === 'Surat') { iconClass = 'surat'; fileIcon = 'mail'; }

    const dateFormatted = new Date(doc.tarikhMuatNaik).toLocaleDateString('ms-MY', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    return `
      <div class="repo-card" data-doc-id="${doc.id}">
        <div class="repo-card-actions">
          <button class="btn btn-secondary btn-icon delete-doc-btn" style="padding:4px 6px; border:none; background:rgba(0,0,0,0.05); color:var(--color-danger);" title="Padam Fail">
            <i data-lucide="trash-2" style="width:12px;height:12px;"></i>
          </button>
        </div>

        <div class="repo-icon-wrapper ${iconClass}">
          <i data-lucide="${fileIcon}"></i>
        </div>

        <div class="repo-title" title="${doc.tajuk}">${doc.tajuk}</div>
        
        <span class="badge ${
          doc.jenis === 'PDF' ? 'badge-danger' : 
          doc.jenis === 'Excel' ? 'badge-success' : 
          doc.jenis === 'PowerPoint' ? 'badge-warning' : 'badge-info'
        }" style="font-size:8px;">${doc.jenis}</span>

        <div class="repo-meta">
          <span>${doc.saiz}</span> &bull; <span>${dateFormatted}</span>
        </div>

        <a href="${doc.dataUrl}" download="${doc.namaFail}" class="btn btn-secondary" style="width:100%; padding:6px 10px; font-size:11px; margin-top:8px;">
          <i data-lucide="download" style="width:12px;height:12px;"></i> Muat Turun
        </a>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();

  // Attach delete buttons
  grid.querySelectorAll('.delete-doc-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = btn.closest('.repo-card').getAttribute('data-id') || btn.closest('.repo-card').getAttribute('data-doc-id');
      
      if (confirm('Adakah anda pasti mahu memadam fail ini daripada repositori?')) {
        try {
          const res = await fetch(`${window.location.origin}/api/repository`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, operator: state.currentOperator })
          });
          const data = await res.json();
          if (data.success) {
            window.showToast('Fail berjaya dipadam.', 'success');
            // Refresh
            await window.refreshState();
            renderRepoGrid(document.getElementById('repoSearchInput').value.trim());
          } else {
            window.showToast('Gagal memadam fail: ' + data.message, 'danger');
          }
        } catch (err) {
          console.error(err);
          window.showToast('Ralat server.', 'danger');
        }
      }
    });
  });
}

function openUploadModal() {
  const state = window.smartGovState;

  const modalHtml = `
    <form id="repoUploadForm">
      <div class="form-group">
        <label class="form-label" for="docTajuk">Tajuk Fail / Keterangan</label>
        <input type="text" id="docTajuk" class="form-control" required placeholder="Contoh: Slaid Pembentangan Unit ICT Sesi Jun 2026">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="docJenis">Kategori Fail</label>
          <select id="docJenis" class="form-control">
            <option value="PDF">PDF (Dokumen)</option>
            <option value="PowerPoint">PowerPoint (Slaid)</option>
            <option value="Excel">Excel (Helaian Kerja)</option>
            <option value="Gambar">Gambar (Foto/Infografik)</option>
            <option value="Surat">Surat Rasmi / Memo</option>
            <option value="Lampiran">Lampiran Lain</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="docFileInput">Pilih Fail</label>
          <input type="file" id="docFileInput" class="form-control" required style="padding:6px 10px;">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="docCatatan">Catatan Tambahan (Opsional)</label>
        <textarea id="docCatatan" class="form-control" rows="2" placeholder="Masukkan ulasan ringkas mengenai fail ini..."></textarea>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px;">
        <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Batal</button>
        <button type="submit" class="btn btn-success" id="btnUploadSubmit"><i data-lucide="upload"></i> Muat Naik Fail</button>
      </div>
    </form>
  `;

  window.showModal('Muat Naik Dokumen Ke Repositori', modalHtml);

  // File Upload Logic using FileReader
  let fileDataUrl = '';
  let filename = '';
  let filesizeStr = '0 KB';

  const fileInput = document.getElementById('docFileInput');
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    filename = file.name;
    
    // Format size
    const sizeBytes = file.size;
    if (sizeBytes > 1024 * 1024) {
      filesizeStr = (sizeBytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
      filesizeStr = (sizeBytes / 1024).toFixed(0) + ' KB';
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
      fileDataUrl = evt.target.result; // Base64 Data URL
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('repoUploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!fileDataUrl) {
      window.showToast('Sila tunggu sehingga fail selesai dibaca oleh pelayar.', 'warning');
      return;
    }

    const payload = {
      tajuk: document.getElementById('docTajuk').value.trim(),
      jenis: document.getElementById('docJenis').value,
      namaFail: filename,
      saiz: filesizeStr,
      dataUrl: fileDataUrl,
      catatan: document.getElementById('docCatatan').value.trim(),
      muatNaikOleh: state.currentOperator,
      operator: state.currentOperator
    };

    const submitBtn = document.getElementById('btnUploadSubmit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner" style="width:12px;height:12px;border-width:2px;display:inline-block;margin-right:4px;"></span> Memuat naik...';

    try {
      const res = await fetch(`${window.location.origin}/api/repository`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        window.showToast('Fail berjaya dimuat naik ke repositori.', 'success');
        window.closeModal();
        
        // Refresh grid
        await window.refreshState();
        renderRepoGrid();
      } else {
        window.showToast('Gagal memuat naik: ' + data.message, 'danger');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Muat Naik Fail';
      }
    } catch (err) {
      console.error(err);
      window.showToast('Ralat server.', 'danger');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Muat Naik Fail';
    }
  });
}
