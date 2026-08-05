// Modul 12: Carian Pintar Multi-Kriteria
export function initSearch(container, params) {
  const state = window.smartGovState;

  // Retrieve initial query parameter from header search if passed
  const initialQuery = params.q ? decodeURIComponent(params.q) : '';

  container.innerHTML = `
    <div class="page-title-section no-print">
      <div>
        <h2 class="page-title">Carian Pintar Mesyuarat</h2>
        <p class="page-subtitle">Modul 12: Menggeledah maklumat mesyuarat, agenda, keputusan dan tindakan pegawai</p>
      </div>
    </div>

    <!-- Multi-criteria form -->
    <div class="card no-print" style="margin-bottom: 24px;">
      <h3 class="card-title"><i data-lucide="filter"></i> Tapis Kriteria Carian</h3>
      <form id="searchFilterForm">
        <div class="form-row">
          <div class="form-group" style="grid-column: span 2;">
            <label class="form-label" for="searchKeyword">Kata Kunci (Mesej/Agenda/Keputusan)</label>
            <input type="text" id="searchKeyword" class="form-control" value="${initialQuery}" placeholder="Contoh: selenggara, asrama, konvokesyen...">
          </div>
          <div class="form-group">
            <label class="form-label" for="searchUnit">Unit Bertanggungjawab</label>
            <select id="searchUnit" class="form-control">
              <option value="">-- Semua Unit --</option>
              ${[...new Set(state.members.map(m => m.unit))].map(u => `
                <option value="${u}">${u}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="searchPegawai">Pegawai Terlibat</label>
            <select id="searchPegawai" class="form-control">
              <option value="">-- Semua Pegawai --</option>
              ${state.members.map(m => `
                <option value="${m.id}">${m.nama}</option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="searchTarikhMula">Tarikh Mula</label>
            <input type="date" id="searchTarikhMula" class="form-control">
          </div>
          <div class="form-group">
            <label class="form-label" for="searchTarikhTamat">Tarikh Tamat</label>
            <input type="date" id="searchTarikhTamat" class="form-control">
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:8px;">
          <button type="reset" class="btn btn-secondary" id="resetSearchBtn">Set Semula</button>
          <button type="submit" class="btn btn-primary"><i data-lucide="search"></i> Cari Maklumat</button>
        </div>
      </form>
    </div>

    <!-- Search Results Section -->
    <div id="searchResultsWrapper">
      <!-- Generated dynamically -->
    </div>
  `;

  // Init Lucide
  if (window.lucide) window.lucide.createIcons();

  // Perform initial search if query exists
  if (initialQuery) {
    performSearch();
  } else {
    // Show empty prompt
    document.getElementById('searchResultsWrapper').innerHTML = `
      <div class="card" style="text-align:center; padding: 48px 0; color:var(--text-muted);">
        <i data-lucide="search" style="width:48px;height:48px;margin-bottom:12px;"></i>
        <p>Sila masukkan kata kunci atau pilih penapis di atas untuk memulakan carian.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  // Handle Form Submit
  const filterForm = document.getElementById('searchFilterForm');
  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    performSearch();
  });

  // Handle Reset
  document.getElementById('resetSearchBtn').addEventListener('click', () => {
    setTimeout(() => {
      performSearch();
    }, 10);
  });

  function performSearch() {
    const state = window.smartGovState;
    const keyword = document.getElementById('searchKeyword').value.trim().toLowerCase();
    const unit = document.getElementById('searchUnit').value;
    const pegawaiId = document.getElementById('searchPegawai').value;
    const dateStart = document.getElementById('searchTarikhMula').value;
    const dateEnd = document.getElementById('searchTarikhTamat').value;

    const resultsWrapper = document.getElementById('searchResultsWrapper');

    // 1. Filter Meetings
    const matchedMeetings = state.meetings.filter(m => {
      // Date filter
      if (dateStart && new Date(m.tarikh) < new Date(dateStart)) return false;
      if (dateEnd && new Date(m.tarikh) > new Date(dateEnd)) return false;

      // Keyword matches meeting name/place/category
      const matchesKeyword = !keyword || 
        m.nama.toLowerCase().includes(keyword) || 
        m.tempat.toLowerCase().includes(keyword) || 
        m.kategori.toLowerCase().includes(keyword);
      
      // Unit/Pegawai filter
      // Check if pengerusi or setiausaha matches
      let matchesPeople = true;
      if (pegawaiId) {
        matchesPeople = m.pengerusiId === pegawaiId || m.setiausahaId === pegawaiId || m.urusetiaIds.includes(pegawaiId);
      }

      return matchesKeyword && matchesPeople;
    });

    // 2. Filter Action Items
    const matchedActions = state.actions.filter(a => {
      // Date filter
      if (dateStart && new Date(a.tarikhSiap) < new Date(dateStart)) return false;
      if (dateEnd && new Date(a.tarikhSiap) > new Date(dateEnd)) return false;

      // Keyword matches task/agenda
      const matchesKeyword = !keyword || 
        a.keputusan.toLowerCase().includes(keyword) || 
        a.agendaTajuk.toLowerCase().includes(keyword) || 
        (a.catatan && a.catatan.toLowerCase().includes(keyword));

      // Unit filter
      const matchesUnit = !unit || a.pegawaiUnit === unit;

      // Pegawai filter
      const matchesPegawai = !pegawaiId || a.pegawaiId === pegawaiId;

      return matchesKeyword && matchesUnit && matchesPegawai;
    });

    // Render results
    let resultsHtml = '';

    if (matchedMeetings.length === 0 && matchedActions.length === 0) {
      resultsHtml = `
        <div class="card" style="text-align:center; padding:48px 0; color:var(--text-muted);">
          <i data-lucide="info" style="width:48px;height:48px;margin-bottom:12px;"></i>
          <p>Tiada padanan maklumat ditemui bagi kriteria carian anda. Sila cuba kata kunci lain.</p>
        </div>
      `;
    } else {
      resultsHtml = `
        <!-- Meetings Matched -->
        ${matchedMeetings.length > 0 ? `
          <div class="card" style="margin-bottom: 24px;">
            <h3 class="card-title" style="color:var(--color-primary);"><i data-lucide="calendar"></i> Mesyuarat Ditemui (${matchedMeetings.length})</h3>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Mesyuarat</th>
                    <th>Kategori</th>
                    <th>Tarikh & Masa</th>
                    <th>Tempat</th>
                    <th>Status</th>
                    <th style="text-align:right;">Pautan</th>
                  </tr>
                </thead>
                <tbody>
                  ${matchedMeetings.map(m => `
                    <tr>
                      <td><strong>${m.nama}</strong><br><span style="font-size:11px;color:var(--text-muted);">Bil. ${m.bilangan}/${m.tahun}</span></td>
                      <td>${m.kategori}</td>
                      <td>${new Date(m.tarikh).toLocaleDateString('ms-MY', { day:'numeric', month:'short', year:'numeric'})}<br><span style="font-size:11px;color:var(--text-muted);">${m.masa}</span></td>
                      <td>${m.tempat}</td>
                      <td><span class="badge badge-info">${m.status}</span></td>
                      <td style="text-align:right;">
                        <a href="#approval?id=${m.id}" class="btn btn-secondary" style="padding:4px 8px; font-size:11px;">Lihat Minit</a>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- Actions Matched -->
        ${matchedActions.length > 0 ? `
          <div class="card">
            <h3 class="card-title" style="color:var(--color-success);"><i data-lucide="check-square"></i> Keputusan & Tindakan Ditemui (${matchedActions.length})</h3>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Mesyuarat Rujukan</th>
                    <th>Tugasan / Tindakan</th>
                    <th>Pegawai & Unit</th>
                    <th>Tarikh Siap</th>
                    <th>Status</th>
                    <th style="text-align:right;">Pautan</th>
                  </tr>
                </thead>
                <tbody>
                  ${matchedActions.map(a => `
                    <tr>
                      <td><strong>${a.meetingNama}</strong><br><span style="font-size:11px;color:var(--text-muted);">Bil. ${a.meetingBilangan}/${a.meetingTahun}</span></td>
                      <td style="max-width:300px; text-align:justify;">
                        <strong>${a.agendaTajuk.replace(/^\d+\.\s*/, '')}</strong><br>
                        <span style="font-size:12px;color:var(--text-secondary);">${a.keputusan}</span>
                      </td>
                      <td><strong>${a.pegawaiNama}</strong><br><span style="font-size:11px;color:var(--text-muted);">${a.pegawaiUnit}</span></td>
                      <td>${a.tarikhSiap ? new Date(a.tarikhSiap).toLocaleDateString('ms-MY', { day:'numeric', month:'short', year:'numeric'}) : '—'}</td>
                      <td><span class="badge ${a.status === 'Selesai' ? 'badge-success' : 'badge-warning'}">${a.status}</span></td>
                      <td style="text-align:right;">
                        <a href="#monitoring" class="btn btn-secondary" style="padding:4px 8px; font-size:11px;">Urus</a>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
      `;
    }

    resultsWrapper.innerHTML = resultsHtml;
    if (window.lucide) window.lucide.createIcons();
  }
}
