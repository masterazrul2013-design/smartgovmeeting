// Modul 4: Pengurusan Ahli & Database Pegawai
export function initMembers(container, params) {
  const state = window.smartGovState;

  // Render main layout
  container.innerHTML = `
    <div class="page-title-section">
      <div>
        <h2 class="page-title">Pengurusan Ahli & Kakitangan</h2>
        <p class="page-subtitle">Pangkalan data pegawai, jawatan, unit dan peranan dalam mesyuarat PMTG</p>
      </div>
      <div>
        <button class="btn btn-primary" id="addNewMemberBtn">
          <i data-lucide="user-plus"></i> Tambah Ahli Baru
        </button>
      </div>
    </div>

    <!-- Category Stats widgets -->
    <div class="grid-cols-4" id="memberStatsGrid" style="margin-bottom: 24px;">
      <!-- Populated dynamically -->
    </div>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 16px;">
        <h3 class="card-title" style="margin-bottom: 0;"><i data-lucide="users"></i> Senarai Keahlian Jawatankuasa</h3>
        <input type="text" id="memberSearchInput" class="form-control" placeholder="Cari ahli berdasarkan nama, jawatan, atau unit..." style="max-width: 360px;">
      </div>
      
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Bil</th>
              <th>Nama Pegawai</th>
              <th>Jawatan / Gred</th>
              <th>Unit / Jabatan</th>
              <th>Hubungan (Emel/Tel)</th>
              <th>Kategori Keahlian</th>
              <th style="text-align: right;">Tindakan</th>
            </tr>
          </thead>
          <tbody id="membersTableBody">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Populate list & stats
  renderMembersData();

  // Attach search
  const searchInput = document.getElementById('memberSearchInput');
  searchInput.addEventListener('input', () => {
    renderMembersData(searchInput.value.trim());
  });

  // Attach new member button modal
  document.getElementById('addNewMemberBtn').addEventListener('click', () => {
    openMemberModal();
  });
}

function renderMembersData(searchFilter = '') {
  const state = window.smartGovState;
  const tableBody = document.getElementById('membersTableBody');
  const statsGrid = document.getElementById('memberStatsGrid');
  
  if (!tableBody) return;

  // Filter members
  const query = searchFilter.toLowerCase();
  const filtered = state.members.filter(m => 
    m.nama.toLowerCase().includes(query) || 
    m.jawatan.toLowerCase().includes(query) || 
    m.unit.toLowerCase().includes(query)
  );

  // Group stats
  const stats = { Tetap: 0, Jemputan: 0, Pemerhati: 0, VIP: 0 };
  state.members.forEach(m => {
    const cat = m.kategori || 'Tetap';
    if (stats.hasOwnProperty(cat)) {
      stats[cat]++;
    } else {
      stats['Tetap']++;
    }
  });

  // Render stats cards
  statsGrid.innerHTML = `
    <div class="card stat-card stat-primary" style="padding: 14px 20px;">
      <div class="stat-info">
        <span class="stat-value" style="font-size:22px;">${stats.Tetap}</span>
        <span class="stat-label" style="font-size:10px;">Ahli Tetap</span>
      </div>
      <div class="stat-icon" style="width:36px;height:36px;"><i data-lucide="user-check" style="width:18px;height:18px;"></i></div>
    </div>
    <div class="card stat-card stat-info" style="padding: 14px 20px;">
      <div class="stat-info">
        <span class="stat-value" style="font-size:22px;">${stats.Jemputan}</span>
        <span class="stat-label" style="font-size:10px;">Ahli Jemputan</span>
      </div>
      <div class="stat-icon" style="width:36px;height:36px;"><i data-lucide="user-plus" style="width:18px;height:18px;"></i></div>
    </div>
    <div class="card stat-card stat-warning" style="padding: 14px 20px;">
      <div class="stat-info">
        <span class="stat-value" style="font-size:22px;">${stats.Pemerhati}</span>
        <span class="stat-label" style="font-size:10px;">Pemerhati</span>
      </div>
      <div class="stat-icon" style="width:36px;height:36px;"><i data-lucide="eye" style="width:18px;height:18px;"></i></div>
    </div>
    <div class="card stat-card stat-success" style="padding: 14px 20px;">
      <div class="stat-info">
        <span class="stat-value" style="font-size:22px;">${stats.VIP}</span>
        <span class="stat-label" style="font-size:10px;">VIP / Khas</span>
      </div>
      <div class="stat-icon" style="width:36px;height:36px;"><i data-lucide="crown" style="width:18px;height:18px;"></i></div>
    </div>
  `;

  // Render table rows
  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px 0;">
          Tiada pegawai dijumpai sepadan dengan carian.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map((m, index) => {
    let catBadge = 'badge-primary';
    if (m.kategori === 'Jemputan') catBadge = 'badge-info';
    if (m.kategori === 'Pemerhati') catBadge = 'badge-warning';
    if (m.kategori === 'VIP') catBadge = 'badge-success';

    return `
      <tr data-id="${m.id}">
        <td>${index + 1}</td>
        <td><strong>${m.nama}</strong><br><span style="font-size:11px;color:var(--text-muted);">${m.peranan || 'Ahli'}</span></td>
        <td>${m.jawatan}</td>
        <td>${m.unit}</td>
        <td>
          <span style="font-size:12px;">${m.email || '—'}</span><br>
          <span style="font-size:11px;color:var(--text-muted);">${m.telefon || '—'}</span>
        </td>
        <td><span class="badge ${catBadge}">${m.kategori || 'Tetap'}</span></td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-icon edit-member-btn" style="padding: 6px 10px;" title="Edit Pegawai">
            <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();

  // Attach edit actions
  tableBody.querySelectorAll('.edit-member-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('tr').getAttribute('data-id');
      const m = state.members.find(x => x.id === id);
      if (m) openMemberModal(m);
    });
  });
}

function openMemberModal(member = null) {
  const isEdit = !!member;
  
  const modalHtml = `
    <form id="memberModalForm">
      <div class="form-group">
        <label class="form-label" for="mModalNama">Nama Pegawai</label>
        <input type="text" id="mModalNama" class="form-control" value="${isEdit ? member.nama : ''}" required placeholder="Contoh: En. Mohd Azrulnizam bin Mohd Kamarudin">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="mModalJawatan">Jawatan / Gred</label>
          <input type="text" id="mModalJawatan" class="form-control" value="${isEdit ? member.jawatan : ''}" required placeholder="Contoh: Ketua Unit Teknologi Maklumat">
        </div>
        <div class="form-group">
          <label class="form-label" for="mModalUnit">Unit / Jabatan</label>
          <input type="text" id="mModalUnit" class="form-control" value="${isEdit ? member.unit : ''}" required placeholder="Contoh: Unit ICT">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="mModalEmail">Emel Rasmi</label>
          <input type="email" id="mModalEmail" class="form-control" value="${isEdit ? member.email : ''}" placeholder="pegawai@pmtg.edu.my">
        </div>
        <div class="form-group">
          <label class="form-label" for="mModalTelefon">Telefon</label>
          <input type="text" id="mModalTelefon" class="form-control" value="${isEdit ? member.telefon : ''}" placeholder="019-XXXXXXX">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="mModalKategori">Kategori Keahlian</label>
          <select id="mModalKategori" class="form-control">
            <option value="Tetap" ${isEdit && member.kategori === 'Tetap' ? 'selected' : ''}>Tetap</option>
            <option value="Jemputan" ${isEdit && member.kategori === 'Jemputan' ? 'selected' : ''}>Jemputan</option>
            <option value="Pemerhati" ${isEdit && member.kategori === 'Pemerhati' ? 'selected' : ''}>Pemerhati</option>
            <option value="VIP" ${isEdit && member.kategori === 'VIP' ? 'selected' : ''}>VIP</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="mModalPeranan">Peranan Mesyuarat</label>
          <select id="mModalPeranan" class="form-control">
            <option value="Ahli" ${isEdit && member.peranan === 'Ahli' ? 'selected' : ''}>Ahli</option>
            <option value="Pengerusi" ${isEdit && member.peranan === 'Pengerusi' ? 'selected' : ''}>Pengerusi</option>
            <option value="Pencatat Minit" ${isEdit && member.peranan === 'Pencatat Minit' ? 'selected' : ''}>Pencatat Minit</option>
            <option value="Penyemak" ${isEdit && member.peranan === 'Penyemak' ? 'selected' : ''}>Penyemak</option>
          </select>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
        <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Batal</button>
        <button type="submit" class="btn btn-success">
          <i data-lucide="save"></i> ${isEdit ? 'Kemaskini' : 'Simpan Ahli'}
        </button>
      </div>
    </form>
  `;

  window.showModal(isEdit ? 'Kemaskini Butiran Pegawai' : 'Daftar Kakitangan Baru', modalHtml);

  // Handle modal submit
  document.getElementById('memberModalForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      nama: document.getElementById('mModalNama').value.trim(),
      jawatan: document.getElementById('mModalJawatan').value.trim(),
      unit: document.getElementById('mModalUnit').value.trim(),
      email: document.getElementById('mModalEmail').value.trim(),
      telefon: document.getElementById('mModalTelefon').value.trim(),
      kategori: document.getElementById('mModalKategori').value,
      peranan: document.getElementById('mModalPeranan').value,
      operator: window.smartGovState.currentOperator
    };

    if (isEdit) {
      payload.id = member.id;
    }

    try {
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(`${window.location.origin}/api/members`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        window.showToast(isEdit ? 'Butiran pegawai berjaya dikemaskini.' : 'Pegawai baru berjaya didaftarkan.', 'success');
        window.closeModal();
        
        // Refresh local cache and list view
        await window.refreshState();
        renderMembersData();
      } else {
        window.showToast('Gagal menyimpan: ' + data.message, 'danger');
      }
    } catch (err) {
      console.error(err);
      window.showToast('Ralat pelayan.', 'danger');
    }
  });
}
