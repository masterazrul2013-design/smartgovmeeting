// ==========================================================================
// SmartGovMeeting Frontend Controller & Modules (Combined Standard Script)
// ==========================================================================

// Global Application State Cache
window.smartGovState = {
  members: [],
  meetings: [],
  actions: [],
  repository: [],
  auditLogs: [],
  currentOperator: 'Pn. Mashitah binti Osman',
  theme: 'light'
};

// API Base URL - Intelligent Fallback for Local File Access
const API_URL = (window.location.origin && window.location.origin.startsWith('http')) 
  ? `${window.location.origin}/api` 
  : 'http://localhost:8092/api';

const PMTG_UNITS = [
  "Jabatan Akademik",
  "Jabatan Sokongan Akademik",
  "Unit Khidmat Pengurusan",
  "Unit Pembangunan & Senggaraan",
  "Unit Hal Ehwal Pelajar",
  "Unit Jaminan Kualiti",
  "Unit Instruksional dan Multimedia",
  "Unit Pengurusan Psikologi",
  "Unit Pengurusan Strategik, Prestasi & Risiko",
  "Unit Perpustakaan",
  "Industry Education Centre (IEC)",
  "Unit Keusahawanan",
  "Unit Pengurusan Aset",
  "Unit Peperiksaan",
  "Unit Latihan & Pendidikan Lanjutan",
  "Unit Perhubungan & Latihan Industri",
  "Unit Pembelajaran Digital",
  "Unit Penyelidikan, Inovasi dan Komersialan",
  "Unit Pengurusan Keselamatan",
  "Unit Kebajikan, Kerohanian & Kebersihan",
  "Unit Pengurusan Perolehan",
  "CISEC",
  "Unit Hubungan & Komunikasi Korporat",
  "Unit Sukan, Kokurikulum & Kebudayaan",
  "Unit Teknologi Maklumat & Komunikasi",
  "Unit Kewangan"
];

function renderUnitReportCard(uData = null, isLocked = false, members = []) {
  const selectedUnit = uData ? uData.unitNama : '';
  const textVal = uData ? uData.text : '';
  const hasTindakan = uData && uData.tindakan && uData.tindakan.length > 0;
  
  const isCustomUnit = selectedUnit && !PMTG_UNITS.includes(selectedUnit);

  let optionsHtml = PMTG_UNITS.map(unit => {
    return `<option value="${unit}" ${selectedUnit === unit ? 'selected' : ''}>${unit}</option>`;
  }).join('');

  return `
    <div class="unit-report-card" style="border: 1px solid var(--border-color); padding: 16px; margin-bottom: 16px; border-radius: var(--border-radius-md); background: var(--bg-primary);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <label class="form-label" style="margin: 0; font-weight: bold; font-size: 12px;">Nama Unit:</label>
          <select class="form-control unit-name-select" style="width: 250px; font-size: 12px; padding: 2px 6px;" ${isLocked ? 'disabled' : ''}>
            <option value="">-- Pilih Unit --</option>
            ${optionsHtml}
            <option value="NEW_UNIT" ${isCustomUnit ? 'selected' : ''}>-- Tambah Unit Baru... --</option>
          </select>
          <input type="text" class="form-control new-unit-name-input ${isCustomUnit ? '' : 'hidden'}" placeholder="Nama Unit Baru" value="${isCustomUnit ? selectedUnit : ''}" style="width: 200px; font-size: 12px; padding: 2px 6px;" ${isLocked ? 'disabled' : ''}>
        </div>
        <button type="button" class="btn btn-danger btn-icon remove-unit-report-btn" style="padding: 2px 6px;" ${isLocked ? 'disabled' : ''}>x</button>
      </div>
      <div class="form-group">
        <textarea class="form-control unit-text-input" rows="3" placeholder="Ulasan minit bagi unit ini..." required ${isLocked ? 'disabled' : ''}>${textVal}</textarea>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
        <label class="checkbox-label" style="font-size: 11px;">
          <input type="checkbox" class="unit-tindakan-trigger checkbox-input" ${hasTindakan ? 'checked' : ''} ${isLocked ? 'disabled' : ''}> Ada Tindakan Pegawai
        </label>
        <button type="button" class="btn btn-secondary btn-icon add-unit-tindakan-btn ${hasTindakan ? '' : 'hidden'}" style="padding: 2px 6px; font-size: 10px;" ${isLocked ? 'disabled' : ''}>+ Tambah Tindakan</button>
      </div>
      <div class="unit-tindakan-rows-wrapper ${hasTindakan ? '' : 'hidden'}" style="margin-top: 10px; padding-left: 12px; border-left: 2px solid var(--color-primary);">
        <div class="unit-tindakan-rows">
          ${hasTindakan ? uData.tindakan.map(t => MinutesModule.renderTindakanRow(t, isLocked, members)).join('') : ''}
        </div>
      </div>
    </div>
  `;
}

function attachUnitReportListeners(card, isLocked, members) {
  const select = card.querySelector('.unit-name-select');
  const newInput = card.querySelector('.new-unit-name-input');
  const removeBtn = card.querySelector('.remove-unit-report-btn');
  const trigger = card.querySelector('.unit-tindakan-trigger');
  const addTindakanBtn = card.querySelector('.add-unit-tindakan-btn');
  const wrapper = card.querySelector('.unit-tindakan-rows-wrapper');
  const rows = card.querySelector('.unit-tindakan-rows');

  if (select && newInput) {
    select.addEventListener('change', (e) => {
      if (e.target.value === 'NEW_UNIT') {
        newInput.classList.remove('hidden');
        newInput.required = true;
      } else {
        newInput.classList.add('hidden');
        newInput.required = false;
      }
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', () => card.remove());
  }

  if (trigger) {
    trigger.addEventListener('change', () => {
      if (trigger.checked) {
        wrapper.classList.remove('hidden');
        addTindakanBtn.classList.remove('hidden');
        if (rows.children.length === 0) {
          const rowHtml = MinutesModule.renderTindakanRow(null, isLocked, members);
          const div = document.createElement('div');
          div.innerHTML = rowHtml;
          const el = div.firstElementChild;
          rows.appendChild(el);
          MinutesModule.attachRowDelete(el);
        }
      } else {
        wrapper.classList.add('hidden');
        addTindakanBtn.classList.add('hidden');
        rows.innerHTML = '';
      }
    });
  }

  if (addTindakanBtn) {
    addTindakanBtn.addEventListener('click', () => {
      const rowHtml = MinutesModule.renderTindakanRow(null, isLocked, members);
      const div = document.createElement('div');
      div.innerHTML = rowHtml;
      const el = div.firstElementChild;
      rows.appendChild(el);
      MinutesModule.attachRowDelete(el);
    });
  }

  rows.querySelectorAll('.tindakan-row').forEach(MinutesModule.attachRowDelete);
}

// Fetch all database state
async function refreshState() {
  try {
    const res = await fetch(`${API_URL}/data`);
    const data = await res.json();
    window.smartGovState.members = data.members || [];
    window.smartGovState.meetings = data.meetings || [];
    window.smartGovState.actions = data.actions || [];
    window.smartGovState.repository = data.repository || [];
    window.smartGovState.auditLogs = data.auditLogs || [];
    window.smartGovState.localIP = data.localIP || 'localhost';
    return true;
  } catch (err) {
    console.error('Error fetching system state:', err);
    showToast('Gagal menyambung ke pelayan API. Pastikan pelayan dihidupkan.', 'danger');
    return false;
  }
}
window.refreshState = refreshState;

// Toast Notification Manager
function showToast(message, type = 'primary') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'warning') iconName = 'alert-triangle';
  if (type === 'danger') iconName = 'x-circle';

  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <div class="toast-message">${message}</div>
  `;
  container.appendChild(toast);
  
  if (window.lucide) {
    window.lucide.createIcons();
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
window.showToast = showToast;

// Modal Manager
let modalOnCloseCallback = null;
function showModal(title, bodyHtml, onClose = null) {
  const backdrop = document.getElementById('globalModalBackdrop');
  const titleEl = document.getElementById('globalModalTitle');
  const bodyEl = document.getElementById('globalModalBody');
  
  if (!backdrop || !titleEl || !bodyEl) return;
  
  titleEl.textContent = title;
  bodyEl.innerHTML = bodyHtml;
  backdrop.classList.remove('hidden');
  modalOnCloseCallback = onClose;
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
window.showModal = showModal;

function closeModal() {
  const backdrop = document.getElementById('globalModalBackdrop');
  if (backdrop) {
    backdrop.classList.add('hidden');
  }
  if (modalOnCloseCallback) {
    modalOnCloseCallback();
    modalOnCloseCallback = null;
  }
}
window.closeModal = closeModal;


// ==========================================================================
// MODUL 1 & 14: Dashboard KPI & Analisis Visual
// ==========================================================================
const DashboardModule = {
  init(container, params) {
    const state = window.smartGovState;
    const totalMeetings = state.meetings.length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const meetingsThisMonth = state.meetings.filter(m => {
      const d = new Date(m.tarikh);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const totalActions = state.actions.length;
    const actionsDone = state.actions.filter(a => a.status === 'Selesai').length;
    const actionsPending = state.actions.filter(a => a.status === 'Dalam tindakan').length;
    const actionsOverdue = state.actions.filter(a => {
      if (a.status === 'Selesai') return false;
      if (!a.tarikhSiap) return false;
      return new Date(a.tarikhSiap) < new Date();
    }).length;

    const totalMemos = state.meetings.filter(m => m.status !== 'Draf').length;
    let completedDiffSum = 0;
    let completedCount = 0;
    state.actions.forEach(a => {
      if (a.status === 'Selesai' && a.createdAt && a.updatedAt) {
        const start = new Date(a.createdAt);
        const end = new Date(a.updatedAt);
        const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
        completedDiffSum += diffDays;
        completedCount++;
      }
    });
    const avgDays = completedCount > 0 ? (completedDiffSum / completedCount).toFixed(1) : "5.2";

    const upcomingMeetings = state.meetings
      .filter(m => new Date(m.tarikh) >= new Date().setHours(0,0,0,0))
      .sort((a,b) => new Date(a.tarikh) - new Date(b.tarikh))
      .slice(0, 4);

    const actionsByUnit = {};
    state.actions.forEach(a => {
      const unit = a.pegawaiUnit || 'Lain-lain';
      actionsByUnit[unit] = (actionsByUnit[unit] || 0) + 1;
    });

    const actionsByOfficer = {};
    state.actions.forEach(a => {
      const name = a.pegawaiNama || 'Tiada Nama';
      actionsByOfficer[name] = (actionsByOfficer[name] || 0) + 1;
    });

    container.innerHTML = `
      <div class="page-title-section">
        <div>
          <h2 class="page-title">Dashboard KPI Pengurusan</h2>
          <p class="page-subtitle">Sistem Pemantauan Status & Prestasi Mesyuarat PMTG</p>
        </div>
        <div class="no-print">
          <button class="btn btn-primary" onclick="window.print()">
            <i data-lucide="printer"></i> Cetak Dashboard
          </button>
        </div>
      </div>

      <div class="grid-cols-4">
        <div class="card stat-card stat-primary">
          <div class="stat-info">
            <span class="stat-value">${meetingsThisMonth}</span>
            <span class="stat-label">Mesyuarat Bulan Ini</span>
          </div>
          <div class="stat-icon"><i data-lucide="calendar"></i></div>
        </div>
        <div class="card stat-card stat-danger">
          <div class="stat-info">
            <span class="stat-value">${actionsPending}</span>
            <span class="stat-label">Tindakan Belum Selesai</span>
          </div>
          <div class="stat-icon"><i data-lucide="alert-circle"></i></div>
        </div>
        <div class="card stat-card stat-success">
          <div class="stat-info">
            <span class="stat-value">${actionsDone}</span>
            <span class="stat-label">Tindakan Selesai</span>
          </div>
          <div class="stat-icon"><i data-lucide="check-circle-2"></i></div>
        </div>
        <div class="card stat-card stat-info">
          <div class="stat-info">
            <span class="stat-value">${totalMemos}</span>
            <span class="stat-label">Memo Dijana</span>
          </div>
          <div class="stat-icon"><i data-lucide="file-check"></i></div>
        </div>
      </div>

      <div class="grid-cols-4" style="margin-bottom: 24px;">
        <div class="card stat-card stat-info">
          <div class="stat-info">
            <span class="stat-value">${totalMeetings}</span>
            <span class="stat-label">Jumlah Mesyuarat (YTD)</span>
          </div>
          <div class="stat-icon"><i data-lucide="folder"></i></div>
        </div>
        <div class="card stat-card stat-primary">
          <div class="stat-info">
            <span class="stat-value">${totalActions}</span>
            <span class="stat-label">Jumlah Tindakan</span>
          </div>
          <div class="stat-icon"><i data-lucide="clipboard-list"></i></div>
        </div>
        <div class="card stat-card stat-danger">
          <div class="stat-info">
            <span class="stat-value">${actionsOverdue}</span>
            <span class="stat-label">Tindakan Overdue</span>
          </div>
          <div class="stat-icon"><i data-lucide="clock"></i></div>
        </div>
        <div class="card stat-card stat-success">
          <div class="stat-info">
            <span class="stat-value">${avgDays} hari</span>
            <span class="stat-label">Purata Selesai</span>
          </div>
          <div class="stat-icon"><i data-lucide="zap"></i></div>
        </div>
      </div>

      <div class="dashboard-actions-grid">
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 class="card-title"><i data-lucide="hourglass"></i> Mesyuarat Akan Datang</h3>
            <div class="upcoming-list">
              ${upcomingMeetings.length === 0 ? `
                <div class="loading-spinner-wrapper" style="padding: 24px 0;"><p>Tiada mesyuarat berjadual.</p></div>
              ` : upcomingMeetings.map(m => {
                const dateFormatted = new Date(m.tarikh).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
                return `
                  <div class="upcoming-item">
                    <span class="upcoming-title">${m.nama} (Bil. ${m.bilangan}/${m.tahun})</span>
                    <div class="upcoming-meta">
                      <span><i data-lucide="calendar" style="width:10px;height:10px;"></i> ${dateFormatted}</span>
                      <span><i data-lucide="clock" style="width:10px;height:10px;"></i> ${m.masa}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          <div class="no-print" style="margin-top: 16px;">
            <button class="btn btn-secondary" style="width:100%" onclick="window.location.hash='meetings'">
              Urus Mesyuarat <i data-lucide="arrow-right"></i>
            </button>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title"><i data-lucide="bar-chart-3"></i> Analisis Prestasi Unit & Pegawai</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div><canvas id="unitChart" style="max-height: 250px;"></canvas></div>
            <div><canvas id="statusChart" style="max-height: 250px;"></canvas></div>
          </div>
        </div>
      </div>

      <div class="grid-cols-2">
        <div class="card">
          <h3 class="card-title"><i data-lucide="award"></i> Tindakan Mengikut Unit</h3>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Selesai</th>
                  <th>Dalam Tindakan</th>
                  <th>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(actionsByUnit).length === 0 ? `
                  <tr><td colspan="4" style="text-align:center;">Tiada data tindakan.</td></tr>
                ` : Object.keys(actionsByUnit).slice(0, 5).map(unit => {
                  const total = actionsByUnit[unit];
                  const done = state.actions.filter(a => a.pegawaiUnit === unit && a.status === 'Selesai').length;
                  const pending = total - done;
                  return `
                    <tr>
                      <td><strong>${unit}</strong></td>
                      <td class="text-success">${done}</td>
                      <td class="text-warning">${pending}</td>
                      <td>${total}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title"><i data-lucide="user-check"></i> Tugasan Mengikut Pegawai (Top 5)</h3>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Pegawai</th>
                  <th>Selesai</th>
                  <th>Belum Selesai</th>
                  <th>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(actionsByOfficer).length === 0 ? `
                  <tr><td colspan="4" style="text-align:center;">Tiada data tindakan pegawai.</td></tr>
                ` : Object.keys(actionsByOfficer)
                    .map(name => {
                      const total = actionsByOfficer[name];
                      const done = state.actions.filter(a => a.pegawaiNama === name && a.status === 'Selesai').length;
                      const pending = total - done;
                      return { name, done, pending, total };
                    })
                    .sort((a,b) => b.total - a.total)
                    .slice(0, 5)
                    .map(row => `
                      <tr>
                        <td><strong>${row.name}</strong></td>
                        <td><span class="badge badge-success">${row.done}</span></td>
                        <td><span class="badge badge-warning">${row.pending}</span></td>
                        <td><strong>${row.total}</strong></td>
                      </tr>
                    `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      renderUnitChart(actionsByUnit);
      renderStatusChart(actionsDone, actionsPending, actionsOverdue);
    }, 100);
  }
};


// ==========================================================================
// MODUL 2 & 6: Pengurusan Mesyuarat & Agenda
// ==========================================================================
const MeetingsModule = {
  init(container, params) {
    if (params.action === 'new' || params.id) {
      MeetingsModule.renderForm(container, params.id);
    } else {
      MeetingsModule.renderList(container);
    }
  },

  renderList(container) {
    const state = window.smartGovState;
    container.innerHTML = `
      <div class="page-title-section">
        <div>
          <h2 class="page-title">Pengurusan Mesyuarat</h2>
          <p class="page-subtitle">Pendaftaran, penetapan agenda dan arkib mesyuarat PMTG</p>
        </div>
        <div>
          <button class="btn btn-primary" id="createNewMeetingBtn">
            <i data-lucide="plus"></i> Daftar Mesyuarat Baru
          </button>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title"><i data-lucide="list"></i> Senarai Mesyuarat Terkini</h3>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Nama Mesyuarat</th>
                <th>Tarikh & Masa</th>
                <th>Tempat</th>
                <th>Pengerusi</th>
                <th>Setiausaha</th>
                <th>Status</th>
                <th style="text-align: right;">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              ${state.meetings.length === 0 ? `
                <tr><td colspan="7" style="text-align:center;">Tiada mesyuarat didaftarkan.</td></tr>
              ` : state.meetings.map(m => {
                const pengerusi = state.members.find(x => x.id === m.pengerusiId)?.nama || m.pengerusiId || 'Tiada';
                const setiausaha = state.members.find(x => x.id === m.setiausahaId)?.nama || m.setiausahaId || 'Tiada';
                const dateFormatted = new Date(m.tarikh).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
                const isLocked = m.status === 'Diluluskan';

                return `
                  <tr>
                    <td><strong>${m.nama}</strong><br><span style="font-size:11px;color:var(--text-muted);">Bil. ${m.bilangan}/${m.tahun}</span></td>
                    <td>${dateFormatted}<br><span style="font-size:11px;color:var(--text-muted);">${m.masa}</span></td>
                    <td>${m.tempat}</td>
                    <td>${pengerusi}</td>
                    <td>${setiausaha}</td>
                    <td><span class="badge ${isLocked ? 'badge-success' : 'badge-info'}">${m.status}</span></td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 6px;">
                        <a href="#memo?id=${m.id}" class="btn btn-secondary btn-icon" title="Memo"><i data-lucide="mail" style="width:14px;"></i></a>
                        <a href="#attendance?id=${m.id}" class="btn btn-secondary btn-icon" title="Kehadiran"><i data-lucide="qr-code" style="width:14px;"></i></a>
                        <a href="#minutes?id=${m.id}" class="btn btn-secondary btn-icon" title="Minit"><i data-lucide="file-text" style="width:14px;"></i></a>
                        <button class="btn btn-primary btn-icon" onclick="window.location.hash='#meetings?id=${m.id}'" ${isLocked ? 'disabled' : ''}><i data-lucide="edit-3" style="width:14px;"></i></button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('createNewMeetingBtn').addEventListener('click', () => {
      window.location.hash = '#meetings?action=new';
    });
    if (window.lucide) window.lucide.createIcons();
  },

  renderForm(container, meetingId) {
    const state = window.smartGovState;
    const isEdit = !!meetingId;
    
    let meeting = {
      nama: '', bilangan: '', tahun: new Date().getFullYear().toString(),
      tarikh: new Date().toISOString().split('T')[0], masa: '08:30 Pagi',
      tempat: 'Bilik Persidangan, PMTG', pengerusiId: '', setiausahaId: '',
      urusetiaIds: [], kategori: 'Mesyuarat Pengurusan', status: 'Draf',
      agenda: [
        { id: 'a1', tajuk: 'Kata-Kata Aluan Pengerusi', subAgendas: ['Ucapan Salam & Aluan Pengerusi'] },
        { id: 'a2', tajuk: 'Pengesahan Minit Mesyuarat', subAgendas: ['Cadangan & Sokongan Pengesahan'] },
        { id: 'a3', tajuk: 'Perkara-Perkara Berbangkit', subAgendas: [] },
        { id: 'a4', tajuk: 'Pembentangan Laporan Unit', subAgendas: [] },
        { id: 'a5', tajuk: 'Hal-Hal Lain', subAgendas: [] },
        { id: 'a6', tajuk: 'Ucapan Penutup', subAgendas: [] }
      ]
    };

    if (isEdit) {
      const found = state.meetings.find(m => m.id === meetingId);
      if (found) meeting = JSON.parse(JSON.stringify(found));
    }

    container.innerHTML = `
      <div class="page-title-section">
        <div>
          <h2 class="page-title">${isEdit ? 'Kemaskini Mesyuarat' : 'Daftar Mesyuarat Baru'}</h2>
          <p class="page-subtitle">Sila isi maklumat asas mesyuarat dan agenda rasmi di bawah.</p>
        </div>
        <div>
          <button class="btn btn-secondary" onclick="window.location.hash='#meetings'"><i data-lucide="arrow-left"></i> Kembali</button>
        </div>
      </div>

      <form id="meetingForm">
        <div class="grid-cols-3">
          <div class="card" style="grid-column: span 2;">
            <h3 class="card-title"><i data-lucide="info"></i> Maklumat Asas</h3>
            <div class="form-group">
              <label class="form-label">Nama Mesyuarat</label>
              <input type="text" id="meetingNama" class="form-control" value="${meeting.nama}" required placeholder="Contoh: Mesyuarat Pengurusan Politeknik METrO Tasek Gelugor">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Bilangan</label>
                <input type="text" id="meetingBilangan" class="form-control" value="${meeting.bilangan}" required placeholder="Contoh: 5">
              </div>
              <div class="form-group">
                <label class="form-label">Tahun</label>
                <input type="text" id="meetingTahun" class="form-control" value="${meeting.tahun}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Kategori</label>
                <select id="meetingKategori" class="form-control">
                  <option value="Mesyuarat Pengurusan" ${meeting.kategori === 'Mesyuarat Pengurusan' ? 'selected' : ''}>Mesyuarat Pengurusan</option>
                  <option value="Mesyuarat Akademik" ${meeting.kategori === 'Mesyuarat Akademik' ? 'selected' : ''}>Mesyuarat Akademik</option>
                  <option value="Mesyuarat Kewangan" ${meeting.kategori === 'Mesyuarat Kewangan' ? 'selected' : ''}>Mesyuarat Kewangan</option>
                  <option value="Mesyuarat JPKA" ${meeting.kategori === 'Mesyuarat JPKA' ? 'selected' : ''}>Mesyuarat JPKA</option>
                  <option value="Mesyuarat Kurikulum" ${meeting.kategori === 'Mesyuarat Kurikulum' ? 'selected' : ''}>Mesyuarat Kurikulum</option>
                  <option value="Mesyuarat Senat" ${meeting.kategori === 'Mesyuarat Senat' ? 'selected' : ''}>Mesyuarat Senat</option>
                  <option value="Lain-lain" ${(meeting.kategori && !["Mesyuarat Pengurusan", "Mesyuarat Akademik", "Mesyuarat Kewangan", "Mesyuarat JPKA", "Mesyuarat Kurikulum", "Mesyuarat Senat"].includes(meeting.kategori)) ? 'selected' : ''}>Lain-lain</option>
                </select>
                <div id="kategoriLainWrap" style="margin-top: 8px; display: ${(meeting.kategori && !["Mesyuarat Pengurusan", "Mesyuarat Akademik", "Mesyuarat Kewangan", "Mesyuarat JPKA", "Mesyuarat Kurikulum", "Mesyuarat Senat"].includes(meeting.kategori)) ? 'block' : 'none'};">
                  <input type="text" id="meetingKategoriLain" class="form-control" placeholder="Masukkan nama kategori mesyuarat..." value="${(meeting.kategori && !["Mesyuarat Pengurusan", "Mesyuarat Akademik", "Mesyuarat Kewangan", "Mesyuarat JPKA", "Mesyuarat Kurikulum", "Mesyuarat Senat"].includes(meeting.kategori)) ? meeting.kategori : ''}" style="font-size: 11px; padding: 4px 8px;">
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Tarikh</label>
                <input type="date" id="meetingTarikh" class="form-control" value="${meeting.tarikh}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Masa</label>
                <input type="text" id="meetingMasa" class="form-control" value="${meeting.masa}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Tempat</label>
                <input type="text" id="meetingTempat" class="form-control" value="${meeting.tempat}" required>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 class="card-title"><i data-lucide="users"></i> Urusetia & Pengerusi</h3>
            <div class="form-group">
              <label class="form-label">Pengerusi</label>
              <select id="meetingPengerusi" class="form-control" required>
                <option value="">-- Pilih Pengerusi --</option>
                ${state.members.map(m => `<option value="${m.id}" ${meeting.pengerusiId === m.id ? 'selected' : ''}>${m.nama}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Setiausaha (Pencatat)</label>
              <select id="meetingSetiausaha" class="form-control" required>
                <option value="">-- Pilih Setiausaha --</option>
                ${state.members.map(m => `<option value="${m.id}" ${meeting.setiausahaId === m.id ? 'selected' : ''}>${m.nama}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Urusetia Fail</label>
              <div style="max-height:90px; overflow-y:auto; border:1px solid var(--border-color); padding:8px; background:var(--bg-primary);">
                ${state.members.map(m => {
                  const checked = meeting.urusetiaIds.includes(m.id) ? 'checked' : '';
                  return `<div><label class="checkbox-label" style="font-size:11px;"><input type="checkbox" class="urusetia-checkbox checkbox-input" value="${m.id}" ${checked}> ${m.nama}</label></div>`;
                }).join('')}
              </div>
            </div>
            <div class="form-group" style="margin-top: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="form-label" style="margin: 0;">Ahli Mesyuarat (Keahlian)</label>
                <button type="button" id="toggleAllAhliBtn" class="btn btn-secondary" style="padding: 2px 6px; font-size: 10px;">Pilih Semua</button>
              </div>
              <div style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); padding:8px; background:var(--bg-primary);">
                ${state.members.map(m => {
                  const isChecked = (!meeting.id || (meeting.ahliIds && meeting.ahliIds.includes(m.id))) ? 'checked' : '';
                  return `<div><label class="checkbox-label" style="font-size:11px; display: flex; align-items: center; gap: 4px;"><input type="checkbox" class="ahli-checkbox checkbox-input" value="${m.id}" ${isChecked}> ${m.nama}</label></div>`;
                }).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3 class="card-title" style="margin-bottom:0;"><i data-lucide="layout-list"></i> Penyusunan Agenda & Sub-Agenda</h3>
            <button type="button" class="btn btn-secondary btn-icon" id="addAgendaRowBtn"><i data-lucide="plus-circle"></i> Tambah Agenda Utama</button>
          </div>
          <div id="agendaRowsWrapper">
            ${meeting.agenda.map((ag, idx) => `
              <div class="agenda-item-card" data-id="${ag.id}" style="border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 12px; margin-bottom: 12px; background-color: var(--bg-primary);">
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 8px;">
                  <span class="agenda-num" style="font-weight:700;">${idx + 1}.</span>
                  <input type="text" class="form-control agenda-title-input" value="${ag.tajuk}" required style="flex: 1; background: var(--bg-secondary);">
                  <button type="button" class="btn btn-secondary btn-icon add-sub-agenda-btn" style="padding:4px 8px;"><i data-lucide="plus" style="width:12px;"></i></button>
                  <button type="button" class="btn btn-danger btn-icon remove-agenda-btn" style="padding:4px 8px;"><i data-lucide="trash-2" style="width:12px;"></i></button>
                </div>
                <div class="sub-agendas-wrapper" style="padding-left: 24px; display: flex; flex-direction: column; gap: 6px;">
                  ${ag.subAgendas.map((sub, sIdx) => `
                    <div class="sub-agenda-row" style="display: flex; gap: 8px; align-items: center;">
                      <span style="font-size:10px; font-weight:bold; min-width:24px;">${idx + 1}.${sIdx + 1}</span>
                      <input type="text" class="form-control sub-agenda-input" value="${sub}" style="flex:1; background:var(--bg-secondary); padding:4px 8px; font-size:12px;">
                      <button type="button" class="btn btn-secondary btn-icon remove-sub-agenda-btn" style="padding:2px 6px;"><i data-lucide="x" style="width:10px;"></i></button>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:12px; margin-bottom:40px;">
          <button type="button" class="btn btn-secondary" onclick="window.location.hash='#meetings'">Batal</button>
          <button type="submit" class="btn btn-success"><i data-lucide="save"></i> Simpan Mesyuarat</button>
        </div>
      </form>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Toggle all ahli checkboxes
    const toggleBtn = document.getElementById('toggleAllAhliBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.ahli-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => cb.checked = !allChecked);
        toggleBtn.textContent = allChecked ? 'Pilih Semua' : 'Nyahpilih Semua';
      });
    }

    const wrapper = document.getElementById('agendaRowsWrapper');
    const addBtn = document.getElementById('addAgendaRowBtn');

    addBtn.addEventListener('click', () => {
      const nextIdx = wrapper.children.length + 1;
      const agendaId = 'a-' + Date.now();
      const div = document.createElement('div');
      div.className = 'agenda-item-card';
      div.setAttribute('data-id', agendaId);
      div.style = 'border:1px solid var(--border-color); border-radius:var(--border-radius-md); padding:12px; margin-bottom:12px; background-color:var(--bg-primary);';
      div.innerHTML = `
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:8px;">
          <span class="agenda-num" style="font-weight:700;">${nextIdx}.</span>
          <input type="text" class="form-control agenda-title-input" required style="flex:1; background:var(--bg-secondary);">
          <button type="button" class="btn btn-secondary btn-icon add-sub-agenda-btn" style="padding:4px 8px;"><i data-lucide="plus" style="width:12px;"></i></button>
          <button type="button" class="btn btn-danger btn-icon remove-agenda-btn" style="padding:4px 8px;"><i data-lucide="trash-2" style="width:12px;"></i></button>
        </div>
        <div class="sub-agendas-wrapper" style="padding-left: 24px; display: flex; flex-direction: column; gap: 6px;"></div>
      `;
      wrapper.appendChild(div);
      if (window.lucide) window.lucide.createIcons();
      attachListeners(div);
    });

    Array.from(wrapper.children).forEach(attachListeners);

    function attachListeners(card) {
      const remove = card.querySelector('.remove-agenda-btn');
      const addSub = card.querySelector('.add-sub-agenda-btn');
      const subWrap = card.querySelector('.sub-agendas-wrapper');

      remove.addEventListener('click', () => {
        card.remove();
        Array.from(wrapper.children).forEach((c, i) => {
          c.querySelector('.agenda-num').textContent = `${i + 1}.`;
          Array.from(c.querySelectorAll('.sub-agenda-row')).forEach((sRow, sIdx) => {
            sRow.querySelector('span').textContent = `${i + 1}.${sIdx + 1}`;
          });
        });
      });

      addSub.addEventListener('click', () => {
        const idx = Array.from(wrapper.children).indexOf(card);
        const subIdx = subWrap.children.length;
        const row = document.createElement('div');
        row.className = 'sub-agenda-row';
        row.style = 'display:flex; gap:8px; align-items:center;';
        row.innerHTML = `
          <span style="font-size:10px; font-weight:bold; min-width:24px;">${idx + 1}.${subIdx + 1}</span>
          <input type="text" class="form-control sub-agenda-input" placeholder="Sub-agenda" style="flex:1; background:var(--bg-secondary); padding:4px 8px; font-size:12px;">
          <button type="button" class="btn btn-secondary btn-icon remove-sub-agenda-btn" style="padding:2px 6px;"><i data-lucide="x" style="width:10px;"></i></button>
        `;
        subWrap.appendChild(row);
        if (window.lucide) window.lucide.createIcons();

        row.querySelector('.remove-sub-agenda-btn').addEventListener('click', () => {
          row.remove();
          Array.from(subWrap.children).forEach((sRow, sI) => {
            sRow.querySelector('span').textContent = `${idx + 1}.${sI + 1}`;
          });
        });
      });

      card.querySelectorAll('.sub-agenda-row').forEach(row => {
        row.querySelector('.remove-sub-agenda-btn').addEventListener('click', () => {
          row.remove();
          const idx = Array.from(wrapper.children).indexOf(card);
          Array.from(subWrap.children).forEach((sRow, sI) => {
            sRow.querySelector('span').textContent = `${idx + 1}.${sI + 1}`;
          });
        });
      });
    }

    const catSelect = document.getElementById('meetingKategori');
    const catLainWrap = document.getElementById('kategoriLainWrap');
    if (catSelect && catLainWrap) {
      catSelect.addEventListener('change', () => {
        if (catSelect.value === 'Lain-lain') {
          catLainWrap.style.display = 'block';
          document.getElementById('meetingKategoriLain').required = true;
        } else {
          catLainWrap.style.display = 'none';
          document.getElementById('meetingKategoriLain').required = false;
        }
      });
    }

    document.getElementById('meetingForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const urusetiaIds = [];
      document.querySelectorAll('.urusetia-checkbox:checked').forEach(cb => urusetiaIds.push(cb.value));

      const ahliIds = [];
      document.querySelectorAll('.ahli-checkbox:checked').forEach(cb => ahliIds.push(cb.value));

      const agenda = [];
      Array.from(wrapper.children).forEach(card => {
        const id = card.getAttribute('data-id');
        const tajuk = card.querySelector('.agenda-title-input').value.trim();
        const subAgendas = [];
        card.querySelectorAll('.sub-agenda-input').forEach(subInput => {
          const val = subInput.value.trim();
          if (val) subAgendas.push(val);
        });
        agenda.push({ id, tajuk, subAgendas });
      });

      const selectCat = document.getElementById('meetingKategori').value;
      const customCat = document.getElementById('meetingKategoriLain').value.trim();
      const finalKategori = selectCat === 'Lain-lain' ? customCat : selectCat;

      const payload = {
        nama: document.getElementById('meetingNama').value.trim(),
        bilangan: document.getElementById('meetingBilangan').value.trim(),
        tahun: document.getElementById('meetingTahun').value.trim(),
        kategori: finalKategori,
        tarikh: document.getElementById('meetingTarikh').value,
        masa: document.getElementById('meetingMasa').value.trim(),
        tempat: document.getElementById('meetingTempat').value.trim(),
        pengerusiId: document.getElementById('meetingPengerusi').value,
        setiausahaId: document.getElementById('meetingSetiausaha').value,
        urusetiaIds,
        ahliIds,
        agenda,
        operator: state.currentOperator
      };

      if (isEdit) {
        payload.id = meetingId;
        payload.status = meeting.status;
        payload.kehadiran = meeting.kehadiran;
        payload.minit = meeting.minit;
        payload.tidakHadirSebab = meeting.tidakHadirSebab;
        payload.ucapanPenutup = meeting.ucapanPenutup;
        payload.disediakanOleh = meeting.disediakanOleh;
        payload.disemakOleh = meeting.disemakOleh;
        payload.disahkanOleh = meeting.disahkanOleh;
      }

      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(`${API_URL}/meetings`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Mesyuarat berjaya disimpan.', 'success');
        window.location.hash = '#meetings';
      } else {
        showToast('Gagal: ' + data.message, 'danger');
      }
    });
  }
};


// ==========================================================================
// MODUL 3: Memo Mesyuarat Automatik
// ==========================================================================
const MemoModule = {
  init(container, params) {
    const state = window.smartGovState;
    if (state.meetings.length === 0) {
      container.innerHTML = `<div class="card"><h3 class="card-title text-danger">Tiada Mesyuarat</h3><p>Daftar mesyuarat terlebih dahulu.</p></div>`;
      return;
    }
    let meeting = state.meetings[0];
    if (params.id) {
      meeting = state.meetings.find(m => m.id === params.id) || state.meetings[0];
    }

    const setiausaha = state.members.find(x => x.id === meeting.setiausahaId)?.nama || 'Setiausaha';
    
    // Format date TODAY in Malay (e.g. 3 Ogos 2026)
    const todayObj = new Date();
    const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
    const todayFormatted = `${todayObj.getDate()} ${months[todayObj.getMonth()]} ${todayObj.getFullYear()}`;

    // Clean bilangan from "Bil. 7" or "BIL 7" to just "7"
    const cleanBilangan = meeting.bilangan.replace(/bil\.?\s*/i, '').trim();

    // Prevent duplicate BIL in title
    let titleStr = meeting.nama.toUpperCase();
    if (!titleStr.includes('BIL')) {
      titleStr += ` BIL. ${cleanBilangan} ${meeting.tahun}`;
    }

    container.innerHTML = `
      <div class="page-title-section no-print" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2>Memo Jemputan Mesyuarat</h2>
          <p style="font-size: 12px; color: var(--text-muted);">Jana memo rasmi kerajaan dalam A4</p>
        </div>
        <select id="memoMeetingSelect" class="form-control" style="width: 250px;">
          ${state.meetings.map(m => `<option value="${m.id}" ${m.id === meeting.id ? 'selected' : ''}>${m.nama} (Bil. ${m.bilangan}/${m.tahun})</option>`).join('')}
        </select>
      </div>

      <div class="memo-layout-container">
        
        <!-- Paper Wrapper (A4) -->
        <div class="card minute-print-preview" id="memoPrintArea" style="margin: 0; padding: 48px; background: white; color: black; box-shadow: var(--shadow-sm); font-family: Arial, sans-serif; line-height: 1.4;">
          
          <!-- Page 1: Memo Dalaman -->
          <div style="page-break-after: always; position: relative;">
            
            <!-- Logo Header -->
            <div style="text-align: center; margin-bottom: 12px;">
              <img src="logo.jpg" style="display: block; margin: 0 auto; max-width: 280px; height: auto;" alt="POLITEKNIK MALAYSIA METrO TASEK GELUGOR">
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
              <span style="border: 1.5px solid black; padding: 4px 16px; font-weight: bold; font-family: Arial, sans-serif; font-size: 11pt; letter-spacing: 0.5px; display: inline-block;">MEMO DALAMAN</span>
            </div>

            <!-- Rujukan & Tarikh row (Kosongkan kurungan rujukan, Tarikh hari ini) -->
            <div style="display: flex; justify-content: space-between; font-family: Arial, sans-serif; font-size: 10.5pt; margin-bottom: 8px;">
              <div>Ruj. Kami &nbsp; : PMTG.PP.100-6/1/2 JLD.2 ( &nbsp; &nbsp; &nbsp; &nbsp; )</div>
              <div>Tarikh : <span id="memoDisplayDate">${todayFormatted}</span></div>
            </div>

            <!-- Borders Table -->
            <table style="width: 100%; border: 1.5px solid black; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10.5pt; margin-bottom: 24px;">
              <tr>
                <td style="border: 1.5px solid black; padding: 10px; width: 100px; font-weight: bold; vertical-align: top;">Tajuk :</td>
                <td style="border: 1.5px solid black; padding: 10px; font-weight: bold; vertical-align: top; text-transform: uppercase;" colspan="2">
                  ${titleStr}
                </td>
              </tr>
              <tr>
                <td style="border: 1.5px solid black; padding: 10px; font-weight: bold; vertical-align: top;">Kepada :</td>
                <td style="border: 1.5px solid black; padding: 10px; vertical-align: top; width: 50%;">Senarai Nama Di Lampiran</td>
                <td style="border: 1.5px solid black; padding: 10px; vertical-align: top;" rowspan="2">
                  <strong>Salinan:</strong><br><br>
                  Fail Jabatan
                </td>
              </tr>
              <tr>
                <td style="border: 1.5px solid black; padding: 10px; font-weight: bold; vertical-align: top;">Daripada :</td>
                <td style="border: 1.5px solid black; padding: 10px; vertical-align: top;">
                  Pengarah<br>
                  Politeknik METrO Tasek Gelugor<br>
                  Pulau Pinang
                </td>
              </tr>
            </table>

            <!-- Content Area -->
            <div style="font-family: Arial, sans-serif; font-size: 10.5pt; text-align: justify; color: black; line-height: 1.5;">
              <p>Tuan/Puan,</p><br>
              <p>Dengan segala hormatnya perkara di atas dirujuk.</p><br>
              <p>
                2. &nbsp; &nbsp; Adalah dimaklumkan bahawa Politeknik METrO Tasek Gelugor Pulau Pinang akan mengadakan ${titleStr} pada ketetapan seperti berikut:
              </p>

              <!-- Inner DateTime table -->
              <table style="margin-left: 48px; margin-top: 10px; margin-bottom: 12px; font-size: 10.5pt; border-collapse: collapse;">
                <tr>
                  <td style="padding: 3px 0; width: 100px; font-weight: bold;">Tarikh</td>
                  <td style="padding: 3px 10px;">:</td>
                  <td>${new Date(meeting.tarikh).toLocaleDateString('ms-MY', { day:'numeric', month:'long', year:'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 0; font-weight: bold;">Masa</td>
                  <td style="padding: 3px 10px;">:</td>
                  <td>${meeting.masa}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 0; font-weight: bold;">Tempat</td>
                  <td style="padding: 3px 10px;">:</td>
                  <td>${meeting.tempat}</td>
                </tr>
              </table>

              <p>
                3. &nbsp; &nbsp; Sehubungan dengan itu, tuan/puan diwajibkan hadir dan perlu menunggu sehingga mesyuarat selesai. Sekiranya tidak hadir sila hantar wakil bagi pihak tuan/puan. Kerjasama tuan/puan amatlah dihargai.
              </p><br>
              
              <p>Sekian, terima kasih.</p><br>
              <p><strong>"MALAYSIA MADANI"</strong></p><br>
              <p><strong>"BERKHIDMAT UNTUK NEGARA"</strong></p><br>
              
              <p>Saya yang menjalankan amanah,</p>
              
              <!-- Vector signature space -->
              <div style="height: 55px; position: relative;">
                <svg width="100" height="45" style="position: absolute; left: 10px; top: 5px;">
                  <path d="M10,35 Q30,5 45,28 T80,10" fill="none" stroke="black" stroke-width="2" />
                  <path d="M25,25 L55,32" fill="none" stroke="black" stroke-width="1.2" />
                </svg>
              </div>

              <p><strong>(MOHD YUSAINI BIN MOHAMED ALI)</strong></p>
              <p>Pengarah</p>
              <p>Politeknik METrO Tasek Gelugor</p>
              <p>Pulau Pinang</p>
            </div>

            <!-- Invisible QR on physical print but visible on screen sidebar -->
            <div class="no-print" style="position: absolute; bottom: 0; right: 0; display: flex; flex-direction: column; align-items: center; border: 1px dotted #ccc; padding: 4px; background: #fafafa;">
              <div id="memoQrCodeContainer" style="width: 80px; height: 80px; background: white;"></div>
              <span style="font-size: 7px; color: #555; font-weight: bold; margin-top:2px;">Kehadiran QR</span>
            </div>

          </div>

          <!-- Page 2: Lampiran Senarai Nama -->
          <div class="print-page-break" style="page-break-before: always; padding-top: 24px;">
            
            <!-- Logo Header Page 2 -->
            <div style="text-align: center; margin-bottom: 12px;">
              <img src="logo.jpg" style="display: block; margin: 0 auto; max-width: 250px; height: auto;" alt="POLITEKNIK MALAYSIA METrO TASEK GELUGOR">
            </div>

            <div style="text-align: center; font-family: Arial, sans-serif; font-size: 10pt; font-weight: bold; margin-bottom: 20px; line-height: 1.4; text-transform: uppercase;">
              SENARAI AHLI ${titleStr}<br>
              POLITEKNIK METrO TASEK GELUGOR
            </div>

            <!-- Members table -->
            <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 8.5pt; border: 1px solid #aaa;">
              <thead>
                <tr style="background-color: #519ecb; color: white; border: 1px solid #aaa; font-weight: bold;">
                  <th style="border: 1px solid #aaa; padding: 6px 12px; text-align: center; width: 60px;">BIL</th>
                  <th style="border: 1px solid #aaa; padding: 6px 12px; text-align: left;">NAMA</th>
                  <th style="border: 1px solid #aaa; padding: 6px 12px; text-align: left; width: 330px;">JAWATAN</th>
                </tr>
              </thead>
              <tbody>
                ${state.members.filter(m => !meeting.ahliIds || meeting.ahliIds.includes(m.id)).map((m, idx) => `
                  <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9fbfc'}; border: 1px solid #aaa;">
                    <td style="border: 1px solid #aaa; padding: 5px 6px; text-align: center;">${idx + 1}</td>
                    <td style="border: 1px solid #aaa; padding: 5px 6px; text-transform: uppercase; font-weight: 500;">${m.nama}</td>
                    <td style="border: 1px solid #aaa; padding: 5px 6px; text-transform: uppercase;">${m.jawatan}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

        </div>

        <!-- Sidebar print controls -->
        <div class="card no-print" style="display: flex; flex-direction: column; gap: 12px; align-self: flex-start;">
          <h3 class="card-title">Tindakan Memo</h3>
          <button class="btn btn-primary" id="printMemoBtn"><i data-lucide="printer"></i> Cetak / Simpan PDF</button>
          <button class="btn btn-secondary" id="exportWordBtn"><i data-lucide="file-text"></i> Eksport Word</button>
          
          <div style="border-top:1px solid var(--border-color); padding-top:10px;">
            <label class="form-label" style="font-size: 11px; font-weight: 600;">Pilihan Tarikh Memo</label>
            <select id="memoDateSelect" class="form-control" style="font-size: 11px; padding: 4px 8px;">
              <option value="semasa">Tarikh Semasa (Hari Ini)</option>
              <option value="mesyuarat">Tarikh Mesyuarat</option>
            </select>
          </div>
          
          <div style="border-top:1px solid var(--border-color); padding-top:10px; font-size:11px; color:var(--text-muted); line-height:1.4;">
            <p>
              Nota: Butang cetak akan mengekalkan format rasmi memo dalaman (Halaman 1) dan Lampiran Senarai Ahli (Halaman 2) mengikut rujukan dokumen Politeknik Malaysia.
            </p>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const dateSelect = document.getElementById('memoDateSelect');
    const memoDisplayDate = document.getElementById('memoDisplayDate');
    if (dateSelect && memoDisplayDate) {
      const todayDate = todayFormatted;
      const meetDateObj = new Date(meeting.tarikh);
      const meetMonths = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
      const meetDateFormatted = `${meetDateObj.getDate()} ${meetMonths[meetDateObj.getMonth()]} ${meetDateObj.getFullYear()}`;

      dateSelect.addEventListener('change', (e) => {
        if (e.target.value === 'mesyuarat') {
          memoDisplayDate.textContent = meetDateFormatted;
        } else {
          memoDisplayDate.textContent = todayDate;
        }
      });
    }

    document.getElementById('memoMeetingSelect').addEventListener('change', (e) => {
      window.location.hash = `#memo?id=${e.target.value}`;
    });

    const qrContainer = document.getElementById('memoQrCodeContainer');
    if (qrContainer) {
      new QRCode(qrContainer, {
        text: `${window.location.origin}/#attendance?id=${meeting.id}`,
        width: 80, height: 80
      });
    }

    document.getElementById('printMemoBtn').addEventListener('click', () => {
      // Hide unwanted elements directly via DOM
      const pageTitle = document.querySelector('.page-title-section');
      const sidebar = document.querySelector('.sidebar');
      const header = document.querySelector('.top-header');
      const controls = document.querySelector('.memo-layout-container > .card.no-print');
      
      if (pageTitle) pageTitle.style.setProperty('display', 'none', 'important');
      if (sidebar) sidebar.style.setProperty('display', 'none', 'important');
      if (header) header.style.setProperty('display', 'none', 'important');
      if (controls) controls.style.setProperty('display', 'none', 'important');
      
      // Force full-width block styles on parents
      const mainContent = document.querySelector('.main-content');
      const appLayout = document.querySelector('.app-layout');
      const viewContainer = document.getElementById('viewContainer');
      const memoGrid = document.querySelector('.memo-layout-container');
      
      let origMain = mainContent ? mainContent.style.cssText : '';
      let origLayout = appLayout ? appLayout.style.cssText : '';
      let origView = viewContainer ? viewContainer.style.cssText : '';
      let origMemoGrid = memoGrid ? memoGrid.style.cssText : '';
      
      if (mainContent) {
        mainContent.style.setProperty('display', 'block', 'important');
        mainContent.style.setProperty('width', '100%', 'important');
        mainContent.style.setProperty('padding', '0', 'important');
        mainContent.style.setProperty('margin', '0', 'important');
        mainContent.style.setProperty('height', 'auto', 'important');
        mainContent.style.setProperty('overflow', 'visible', 'important');
      }
      if (appLayout) {
        appLayout.style.setProperty('display', 'block', 'important');
        appLayout.style.setProperty('width', '100%', 'important');
        appLayout.style.setProperty('padding', '0', 'important');
        appLayout.style.setProperty('margin', '0', 'important');
      }
      if (viewContainer) {
        viewContainer.style.setProperty('display', 'block', 'important');
        viewContainer.style.setProperty('width', '100%', 'important');
        viewContainer.style.setProperty('padding', '0', 'important');
        viewContainer.style.setProperty('margin', '0', 'important');
      }
      if (memoGrid) {
        memoGrid.style.setProperty('display', 'block', 'important');
        memoGrid.style.setProperty('width', '100%', 'important');
        memoGrid.style.setProperty('padding', '0', 'important');
        memoGrid.style.setProperty('margin', '0', 'important');
      }
      
      // Trigger print
      window.print();
      
      // Restore elements after print dialog closes
      setTimeout(() => {
        if (pageTitle) pageTitle.style.display = '';
        if (sidebar) sidebar.style.display = '';
        if (header) header.style.display = '';
        if (controls) controls.style.display = '';
        
        if (mainContent) mainContent.style.cssText = origMain;
        if (appLayout) appLayout.style.cssText = origLayout;
        if (viewContainer) viewContainer.style.cssText = origView;
        if (memoGrid) memoGrid.style.cssText = origMemoGrid;
      }, 800);
    });

    document.getElementById('exportWordBtn').addEventListener('click', () => {
      const html = document.getElementById('memoPrintArea').innerHTML;
      const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Memo_Dalaman_Bil_${meeting.bilangan}_${meeting.tahun}.doc`;
      a.click();
      showToast('Eksport Word selesai.', 'success');
    });
  }
};


// ==========================================================================
// MODUL 4: Pengurusan Ahli Jawatankuasa
// ==========================================================================
const MembersModule = {
  init(container, params) {
    container.innerHTML = `
      <div class="page-title-section">
        <div>
          <h2 class="page-title">Pangkalan Data Ahli</h2>
          <p class="page-subtitle">Urus maklumat peranan kakitangan dan kategori keahlian PMTG</p>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary" id="importExcelBtn"><i data-lucide="file-spreadsheet"></i> Import Excel/CSV</button>
          <button class="btn btn-primary" id="addNewMemberBtn"><i data-lucide="user-plus"></i> Tambah Ahli</button>
        </div>
      </div>

      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 class="card-title" style="margin-bottom:0;"><i data-lucide="users"></i> Pangkalan Ahli</h3>
          <input type="text" id="memberSearch" class="form-control" placeholder="Cari ahli..." style="width:250px;">
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Jawatan</th>
                <th>Unit</th>
                <th>Hubungan</th>
                <th>Kategori</th>
                <th style="text-align:right;">Edit</th>
              </tr>
            </thead>
            <tbody id="membersTableBody">
              <!-- Rendered via renderList -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Reinitialize newly added lucide icons
    if (window.lucide) window.lucide.createIcons();

    MembersModule.renderRows('');
    document.getElementById('memberSearch').addEventListener('input', (e) => {
      MembersModule.renderRows(e.target.value.trim());
    });

    document.getElementById('addNewMemberBtn').addEventListener('click', () => MembersModule.openModal(null));

    document.getElementById('importExcelBtn').addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx, .xls, .csv';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
          try {
            let dataRows = [];
            const fileName = file.name.toLowerCase();

            if (fileName.endsWith('.csv')) {
              const text = new TextDecoder('utf-8').decode(evt.target.result);
              dataRows = parseCSV(text);
            } else {
              // Parse Excel using SheetJS
              const data = new Uint8Array(evt.target.result);
              const workbook = XLSX.read(data, { type: 'array' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const rawRows = XLSX.utils.sheet_to_json(worksheet);
              
              dataRows = rawRows.map(row => {
                const normalized = {};
                for (const key in row) {
                  normalized[key.trim().toLowerCase()] = String(row[key] || '').trim();
                }
                return normalized;
              });
            }

            // Map and normalize keys (supports Malay and English column headers)
            const membersToImport = dataRows.map(row => {
              const nama = row.nama || row.name || row['nama pegawai'] || '';
              const jawatan = row.jawatan || row.position || row.jawatan || '';
              const unit = row.unit || row.department || row.jabatan || '';
              const email = row.email || row.emel || row['e-mail'] || '';
              const telefon = row.telefon || row.phone || row['no telefon'] || row.tel || '';
              const kategori = row.kategori || row.category || 'Tetap';
              const peranan = row.peranan || row.role || 'Ahli';

              return { nama, jawatan, unit, email, telefon, kategori, peranan };
            }).filter(m => m.nama); // Must have a name

            if (membersToImport.length === 0) {
              alert('Tiada data ahli yang sah dijumpai di dalam fail. Sila pastikan lajur "Nama" diisi.');
              return;
            }

            const confirmImport = confirm(`Sebanyak ${membersToImport.length} ahli baharu ditemui di dalam fail "${file.name}". Adakah anda pasti mahu mengimport mereka ke pangkalan data?`);
            if (!confirmImport) return;

            const res = await fetch('/api/members/batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                members: membersToImport,
                operator: window.smartGovState.operator || 'Sistem'
              })
            });
            const result = await res.json();
            if (result.success) {
              alert(`Berjaya mengimport ${result.count} ahli mesyuarat secara kelompok!`);
              // Reload members from API
              const fetchRes = await fetch('/api/init');
              const initData = await fetchRes.json();
              window.smartGovState.members = initData.members;
              MembersModule.renderRows('');
            } else {
              alert('Gagal mengimport ahli: ' + result.message);
            }

          } catch (err) {
            console.error(err);
            alert('Ralat semasa membaca fail: ' + err.message);
          }
        };

        reader.readAsArrayBuffer(file);
      };
      input.click();
    });

    // Helper for pure JS CSV parsing
    function parseCSV(text) {
      const lines = text.split(/\r?\n/);
      if (lines.length === 0) return [];
      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Match keeping commas inside quotes
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
        const values = matches.map(v => v.trim().replace(/^["']|["']$/g, ''));
        const row = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });
        rows.push(row);
      }
      return rows;
    }
  },

  renderRows(filter = '') {
    const state = window.smartGovState;
    const tbody = document.getElementById('membersTableBody');
    if (!tbody) return;

    const query = filter.toLowerCase();
    const filtered = state.members.filter(m => m.nama.toLowerCase().includes(query) || m.unit.toLowerCase().includes(query));

    tbody.innerHTML = filtered.map(m => `
      <tr data-id="${m.id}">
        <td><strong>${m.nama}</strong><br><span style="font-size:10px; color:var(--text-muted);">${m.peranan || 'Ahli'}</span></td>
        <td>${m.jawatan}</td>
        <td>${m.unit}</td>
        <td>${m.email || '—'}<br><span style="font-size:11px; color:var(--text-muted);">${m.telefon || ''}</span></td>
        <td><span class="badge badge-info">${m.kategori}</span></td>
        <td style="text-align:right;">
          <button class="btn btn-secondary btn-icon edit-member-btn" style="padding:4px 8px;"><i data-lucide="edit" style="width:14px;"></i></button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();

    tbody.querySelectorAll('.edit-member-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('tr').getAttribute('data-id');
        const member = state.members.find(x => x.id === id);
        MembersModule.openModal(member);
      });
    });
  },

  openModal(member = null) {
    const isEdit = !!member;
    const modalHtml = `
      <form id="memberFormModal">
        <div class="form-group">
          <label class="form-label">Nama Pegawai</label>
          <input type="text" id="mName" class="form-control" value="${isEdit ? member.nama : ''}" required>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Jawatan</label><input type="text" id="mJaw" class="form-control" value="${isEdit ? member.jawatan : ''}" required></div>
          <div class="form-group"><label class="form-label">Unit</label><input type="text" id="mUnit" class="form-control" value="${isEdit ? member.unit : ''}" required></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Emel</label><input type="email" id="mMail" class="form-control" value="${isEdit ? member.email : ''}"></div>
          <div class="form-group"><label class="form-label">Telefon</label><input type="text" id="mTel" class="form-control" value="${isEdit ? member.telefon : ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Kategori</label>
            <select id="mCat" class="form-control">
              <option value="Tetap" ${isEdit && member.kategori === 'Tetap' ? 'selected' : ''}>Tetap</option>
              <option value="Jemputan" ${isEdit && member.kategori === 'Jemputan' ? 'selected' : ''}>Jemputan</option>
              <option value="Pemerhati" ${isEdit && member.kategori === 'Pemerhati' ? 'selected' : ''}>Pemerhati</option>
              <option value="VIP" ${isEdit && member.kategori === 'VIP' ? 'selected' : ''}>VIP</option>
            </select>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-success">Simpan</button>
        </div>
      </form>
    `;

    showModal(isEdit ? 'Kemaskini Kakitangan' : 'Daftar Kakitangan Baru', modalHtml);

    document.getElementById('memberFormModal').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        nama: document.getElementById('mName').value.trim(),
        jawatan: document.getElementById('mJaw').value.trim(),
        unit: document.getElementById('mUnit').value.trim(),
        email: document.getElementById('mMail').value.trim(),
        telefon: document.getElementById('mTel').value.trim(),
        kategori: document.getElementById('mCat').value,
        operator: window.smartGovState.currentOperator
      };

      if (isEdit) payload.id = member.id;

      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(`${API_URL}/members`, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Data keahlian dikemaskini.', 'success');
        closeModal();
        await refreshState();
        MembersModule.renderRows('');
      }
    });
  }
};


// ==========================================================================
// MODUL 5: Kehadiran Ahli & QR Scan Simulator
// ==========================================================================
const AttendanceModule = {
  init(container, params) {
    const state = window.smartGovState;
    if (state.meetings.length === 0) {
      container.innerHTML = `<div class="card"><h3 class="card-title text-danger">Tiada Mesyuarat</h3></div>`;
      return;
    }
    let meeting = state.meetings[0];
    if (params.id) {
      meeting = state.meetings.find(m => m.id === params.id) || state.meetings[0];
    }

    const isLocked = meeting.status === 'Diluluskan';

    container.innerHTML = `
      <div class="page-title-section">
        <h2>Pendaftaran Kehadiran Jawatankuasa</h2>
        <select id="attendMeetingSelect" class="form-control" style="width:250px;">
          ${state.meetings.map(m => `<option value="${m.id}" ${m.id === meeting.id ? 'selected' : ''}>${m.nama}</option>`).join('')}
        </select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 320px; gap: 24px;">
        <div class="card">
          <form id="attendanceForm">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr><th>Kakitangan</th><th>Unit</th><th>Status Kehadiran</th><th>Catatan Sebab</th></tr>
                </thead>
                <tbody>
                  ${state.members.filter(m => !meeting.ahliIds || meeting.ahliIds.includes(m.id)).map(m => {
                    const status = meeting.kehadiran?.[m.id] || 'Hadir';
                    const sebab = meeting.tidakHadirSebab?.[m.id] || '';
                    return `
                      <tr class="member-row" data-id="${m.id}">
                        <td><strong>${m.nama}</strong><br><span style="font-size:10px;">${m.jawatan}</span></td>
                        <td>${m.unit}</td>
                        <td>
                          <select class="form-control status-select" style="font-size:11px; padding:4px;" ${isLocked ? 'disabled' : ''}>
                            <option value="Hadir" ${status === 'Hadir' ? 'selected' : ''}>Hadir</option>
                            <option value="Tidak Hadir" ${status === 'Tidak Hadir' ? 'selected' : ''}>Tidak Hadir</option>
                            <option value="Bersebab" ${status === 'Bersebab' ? 'selected' : ''}>Bersebab</option>
                            <option value="Cuti" ${status === 'Cuti' ? 'selected' : ''}>Cuti</option>
                            <option value="MC" ${status === 'MC' ? 'selected' : ''}>MC</option>
                          </select>
                        </td>
                        <td><input type="text" class="form-control sebab-input" value="${sebab}" placeholder="Sebab jika tidak hadir" ${isLocked ? 'disabled' : ''} style="font-size:11px; padding:4px;"></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
            <div style="display:flex; justify-content:flex-end; margin-top:16px;">
              <button type="submit" class="btn btn-success" ${isLocked ? 'disabled' : ''}>Simpan Kehadiran</button>
            </div>
          </form>
        </div>

        <div style="display:flex; flex-direction:column; gap:20px;">
          <div class="card" style="text-align:center;">
            <h3 class="card-title" style="justify-content:center;"><i data-lucide="qr-code"></i> Imbas Kehadiran QR</h3>
            <div style="display:flex; justify-content:center; margin:12px 0;">
              <div id="attendQr" style="width:150px; height:150px; padding:6px; background:white; border:1px solid #ddd;"></div>
            </div>
            <div style="font-size:10px; color:var(--text-muted); margin-bottom:8px; word-break:break-all;" id="qrUrlLabel"></div>
            <span class="badge badge-info">PORT: 8092</span>
          </div>

          <div class="card no-print">
            <h3 class="card-title"><i data-lucide="smartphone"></i> Simulasi Telefon</h3>
            <div class="form-group">
              <label class="form-label">Pilih Pegawai</label>
              <select id="simPegSelect" class="form-control" ${isLocked ? 'disabled' : ''}>
                <option value="">-- Pilih --</option>
                ${state.members.filter(m => !meeting.ahliIds || meeting.ahliIds.includes(m.id)).map(m => `<option value="${m.id}">${m.nama}</option>`).join('')}
              </select>
            </div>
            <button class="btn btn-primary" id="simScanBtn" style="width:100%;" ${isLocked ? 'disabled' : ''}>Simulasikan Imbasan QR</button>
          </div>

          <div class="card no-print" style="margin-top: 4px; padding: 12px; border: 1px dashed var(--color-primary); background: var(--bg-secondary);">
            <h4 style="font-size: 11px; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;"><i data-lucide="globe" style="width:12px;"></i> Akses Luar Talian (4G / 5G / Luar Wi-Fi)</h4>
            <p style="font-size: 9.5px; color: var(--text-muted); line-height: 1.3; margin-bottom: 8px;">
              Untuk membolehkan imbasan dari luar talian Wi-Fi yang sama, jalankan <code>npx localtunnel --port 8092</code> di terminal PC anda dan masukkan URL terowong di bawah:
            </p>
            <div style="display: flex; gap: 6px;">
              <input type="text" id="customServerUrlInput" class="form-control" style="font-size: 10px; padding: 2px 6px; flex: 1;" placeholder="Cth: https://xxxx.localtunnel.me" value="${meeting.tunnelUrl || ''}">
              <button type="button" class="btn btn-primary" id="btnSaveTunnelUrl" style="padding: 2px 6px; font-size: 10px;">Set</button>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('attendMeetingSelect').addEventListener('change', (e) => {
      window.location.hash = `#attendance?id=${e.target.value}`;
    });

    const qrDiv = document.getElementById('attendQr');
    const localIP = state.localIP || 'localhost';
    let qrUrl = `http://${localIP}:8092/#attendance?id=${meeting.id}`;
    
    if (meeting.tunnelUrl) {
      qrUrl = `${meeting.tunnelUrl.replace(/\/$/, '')}/#attendance?id=${meeting.id}`;
    }

    new QRCode(qrDiv, {
      text: qrUrl,
      width: 138, height: 138
    });

    const qrLabel = document.getElementById('qrUrlLabel');
    if (qrLabel) qrLabel.textContent = qrUrl;

    const saveTunnelBtn = document.getElementById('btnSaveTunnelUrl');
    if (saveTunnelBtn) {
      saveTunnelBtn.addEventListener('click', async () => {
        const tunnelInput = document.getElementById('customServerUrlInput');
        if (!tunnelInput) return;
        const val = tunnelInput.value.trim();
        
        saveTunnelBtn.disabled = true;
        saveTunnelBtn.textContent = 'Menyimpan...';
        
        const payload = {
          ...meeting,
          tunnelUrl: val,
          operator: state.currentOperator
        };
        
        const res = await fetch(`${API_URL}/meetings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast('URL Terowong berjaya dikemaskini!', 'success');
          await refreshState();
          AttendanceModule.init(container, params);
        } else {
          showToast('Gagal mengemas kini URL: ' + data.message, 'danger');
          saveTunnelBtn.disabled = false;
          saveTunnelBtn.textContent = 'Set';
        }
      });
    }

    document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const kehadiran = {};
      const tidakHadirSebab = {};
      document.querySelectorAll('.member-row').forEach(row => {
        const id = row.getAttribute('data-id');
        const val = row.querySelector('.status-select').value;
        const sebab = row.querySelector('.sebab-input').value.trim();
        kehadiran[id] = val;
        if (sebab) tidakHadirSebab[id] = sebab;
      });

      const payload = { ...meeting, kehadiran, tidakHadirSebab, operator: state.currentOperator };
      const res = await fetch(`${API_URL}/meetings`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Kehadiran disimpan.', 'success');
        await refreshState();
      }
    });

    document.getElementById('simScanBtn').addEventListener('click', async () => {
      const select = document.getElementById('simPegSelect');
      const mId = select.value;
      if (!mId) return showToast('Pilih pegawai dahulu.', 'warning');

      const currentKehadiran = meeting.kehadiran || {};
      currentKehadiran[mId] = 'Hadir';

      const member = state.members.find(x => x.id === mId);
      const payload = { ...meeting, kehadiran: currentKehadiran, operator: `${member.nama} (Simulasi QR)` };
      
      const res = await fetch(`${API_URL}/meetings`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Imbasan QR Kehadiran bagi ${member.nama} disahkan!`, 'success');
        select.value = '';
        await refreshState();
        AttendanceModule.init(container, { id: meeting.id }); // Redraw
      }
    });
  }
};


// ==========================================================================
// MODUL 7 & 16: Penulisan Minit & Templat Kerajaan
// ==========================================================================
const MinutesModule = {
  init(container, params) {
    const state = window.smartGovState;
    if (state.meetings.length === 0) {
      container.innerHTML = `<div class="card"><h3 class="card-title text-danger">Tiada Mesyuarat</h3></div>`;
      return;
    }
    let meeting = state.meetings[0];
    if (params.id) {
      meeting = state.meetings.find(m => m.id === params.id) || state.meetings[0];
    }
    const isLocked = meeting.status === 'Diluluskan';
    const currentMinit = meeting.minit || {};

    container.innerHTML = `
      <div class="page-title-section no-print">
        <h2>Penulisan Minit Rasmi</h2>
        <select id="minMeetingSelect" class="form-control" style="width:250px;">
          ${state.meetings.map(m => `<option value="${m.id}" ${m.id === meeting.id ? 'selected' : ''}>${m.nama}</option>`).join('')}
        </select>
      </div>

      <div class="card no-print" style="margin-bottom:20px;">
        <h3 class="card-title" style="font-size:13px;"><i data-lucide="layout"></i> Muatkan Templat Minit Rasmi</h3>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-secondary load-temp-btn" data-type="Mesyuarat Pengurusan" ${isLocked ? 'disabled' : ''}>Mesyuarat Pengurusan</button>
          <button class="btn btn-secondary load-temp-btn" data-type="Mesyuarat Akademik" ${isLocked ? 'disabled' : ''}>Mesyuarat Akademik</button>
          <button class="btn btn-secondary load-temp-btn" data-type="Mesyuarat Kewangan" ${isLocked ? 'disabled' : ''}>Mesyuarat Kewangan</button>
        </div>
      </div>

      <form id="minutesEditorForm">
        ${meeting.agenda.map((ag, idx) => {
          const item = currentMinit[ag.id] || { text: '', tindakan: [] };
          const isUnitReportAgenda = ag.tajuk.toUpperCase().includes('PEMBENTANGAN LAPORAN UNIT');

          if (isUnitReportAgenda) {
            const hasReports = item.isUnitSplit && item.unitReports && item.unitReports.length > 0;
            const reports = hasReports ? item.unitReports : [];
            return `
              <div class="card agenda-min-card" data-id="${ag.id}" style="margin-bottom:20px;">
                <div style="border-bottom:1px solid var(--border-color); padding-bottom:6px; margin-bottom:12px;">
                  <h3 class="card-title" style="margin-bottom:0; font-size:14px;">Perenggan ${idx + 1}.0: ${ag.tajuk.toUpperCase()}</h3>
                  <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">Penulisan dipecahkan mengikut pembentangan unit (Modul Tambahan)</p>
                </div>
                
                <div class="unit-reports-container" id="unitReportsContainer_${ag.id}">
                  ${reports.map(rep => renderUnitReportCard(rep, isLocked, state.members)).join('')}
                </div>
                
                <div style="margin-top:12px;" class="no-print">
                  <button type="button" class="btn btn-secondary btn-icon" id="addUnitReportBtn_${ag.id}" ${isLocked ? 'disabled' : ''}>
                    + Tambah Pembentangan Unit Baru
                  </button>
                </div>
              </div>
            `;
          }

          const hasTindakan = item.tindakan.length > 0;
          return `
            <div class="card agenda-min-card" data-id="${ag.id}" style="margin-bottom:20px;">
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:6px; margin-bottom:12px;">
                <h3 class="card-title" style="margin-bottom:0; font-size:14px;">Perenggan ${idx + 1}.0: ${ag.tajuk.toUpperCase()}</h3>
                <label class="checkbox-label" style="font-size:12px;">
                  <input type="checkbox" class="tindakan-trigger checkbox-input" ${hasTindakan ? 'checked' : ''} ${isLocked ? 'disabled' : ''}> Ada Tindakan Pegawai
                </label>
              </div>
              <div class="form-group">
                <textarea class="form-control min-text-input" rows="4" placeholder="Ulasan perenggan minit..." required ${isLocked ? 'disabled' : ''}>${item.text}</textarea>
              </div>

              <!-- Action Items list -->
              <div class="tindakan-wrap ${hasTindakan ? '' : 'hidden'}" style="background:var(--bg-primary); border:1px solid var(--border-color); padding:12px; border-radius:8px; margin-top:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="font-size:11px; font-weight:bold;">Pegawai Bertanggungjawab (Modul 8)</span>
                  <button type="button" class="btn btn-secondary btn-icon add-tindakan-btn" style="padding:2px 6px; font-size:10px;" ${isLocked ? 'disabled' : ''}>+ Tambah</button>
                </div>
                <div class="tindakan-rows">
                  ${item.tindakan.map(t => MinutesModule.renderTindakanRow(t, isLocked, state.members)).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('')}

        <div class="card" style="margin-bottom:20px;">
          <h3 class="card-title">Penutup Mesyuarat</h3>
          <textarea class="form-control" id="minPenutup" rows="2" placeholder="Ulasan penutup..." ${isLocked ? 'disabled' : ''}>${meeting.ucapanPenutup || ''}</textarea>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:12px; margin-bottom:40px;" class="no-print">
          <button type="button" class="btn btn-secondary" onclick="window.location.hash='#meetings'">Batal</button>
          <button type="submit" class="btn btn-success" ${isLocked ? 'disabled' : ''}>Simpan Minit</button>
        </div>
      </form>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('minMeetingSelect').addEventListener('change', (e) => {
      window.location.hash = `#minutes?id=${e.target.value}`;
    });

    // Attach listeners for unit split cards
    meeting.agenda.forEach(ag => {
      const isUnitReportAgenda = ag.tajuk.toUpperCase().includes('PEMBENTANGAN LAPORAN UNIT');
      if (isUnitReportAgenda) {
        const containerEl = document.getElementById(`unitReportsContainer_${ag.id}`);
        const addBtn = document.getElementById(`addUnitReportBtn_${ag.id}`);
        
        if (containerEl && addBtn) {
          containerEl.querySelectorAll('.unit-report-card').forEach(card => {
            attachUnitReportListeners(card, isLocked, state.members);
          });

          addBtn.addEventListener('click', () => {
            const div = document.createElement('div');
            div.innerHTML = renderUnitReportCard(null, isLocked, state.members);
            const cardEl = div.firstElementChild;
            containerEl.appendChild(cardEl);
            attachUnitReportListeners(cardEl, isLocked, state.members);
          });
        }
      }
    });

    document.querySelectorAll('.agenda-min-card').forEach(card => {
      const trigger = card.querySelector('.tindakan-trigger');
      const wrap = card.querySelector('.tindakan-wrap');
      const add = card.querySelector('.add-tindakan-btn');
      const rows = card.querySelector('.tindakan-rows');
      
      if (!trigger) return; // Skip if it's the unit split card (which doesn't have these standard triggers)

      trigger.addEventListener('change', () => {
        if (trigger.checked) {
          wrap.classList.remove('hidden');
          if (rows.children.length === 0) {
            rows.innerHTML = MinutesModule.renderTindakanRow(null, isLocked, state.members);
            MinutesModule.attachRowDelete(rows.firstElementChild);
          }
        } else {
          wrap.classList.add('hidden');
          rows.innerHTML = '';
        }
      });

      add.addEventListener('click', () => {
        const div = document.createElement('div');
        div.innerHTML = MinutesModule.renderTindakanRow(null, isLocked, state.members);
        const el = div.firstElementChild;
        rows.appendChild(el);
        MinutesModule.attachRowDelete(el);
      });

      rows.querySelectorAll('.tindakan-row').forEach(MinutesModule.attachRowDelete);
    });

    document.querySelectorAll('.load-temp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const temp = GOV_TEMPLATES[type] || GOV_TEMPLATES["Mesyuarat Pengurusan"];
        
        document.querySelectorAll('.agenda-min-card').forEach((card, i) => {
          const area = card.querySelector('.min-text-input');
          const key = `a${i + 1}`;
          
          if (area) {
            if (temp[key]) area.value = temp[key];
          } else {
            const containerEl = card.querySelector('.unit-reports-container');
            if (containerEl) {
              containerEl.innerHTML = ''; // Clear existing
              const defaultReps = [
                { unitNama: "Jabatan Akademik", text: "Pembentangan laporan prestasi akademik dan pencapaian peperiksaan pelajar bagi Sesi II: 2025/2026.", tindakan: [] },
                { unitNama: "Jabatan Sokongan Akademik", text: "Pembentangan laporan status pendaftaran pelajar baharu dan aktiviti kelab/persatuan.", tindakan: [] },
                { unitNama: "Unit Khidmat Pengurusan", text: "Pembentangan status perbelanjaan kewangan, bajet tahunan, perolehan alatan makmal, dan kebajikan staf PMTG.", tindakan: [] }
              ];
              defaultReps.forEach(rep => {
                const div = document.createElement('div');
                div.innerHTML = renderUnitReportCard(rep, isLocked, state.members);
                const cardEl = div.firstElementChild;
                containerEl.appendChild(cardEl);
                attachUnitReportListeners(cardEl, isLocked, state.members);
              });
            }
          }
        });

        document.getElementById('minPenutup').value = "Pengerusi menangguhkan mesyuarat pengurusan kali ini dengan mengucapkan ribuan terima kasih.";
        showToast(`Templat ${type} dimuatkan.`, 'success');
      });
    });

    document.getElementById('minutesEditorForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const minit = {};
      
      document.querySelectorAll('.agenda-min-card').forEach(card => {
        const id = card.getAttribute('data-id');
        const isSplit = card.querySelector('.unit-reports-container') !== null;
        
        if (isSplit) {
          const unitReports = [];
          card.querySelectorAll('.unit-report-card').forEach(uCard => {
            const selectEl = uCard.querySelector('.unit-name-select');
            let unitNama = selectEl.value;
            if (unitNama === 'NEW_UNIT') {
              unitNama = uCard.querySelector('.new-unit-name-input').value.trim();
            }
            const text = uCard.querySelector('.unit-text-input').value.trim();
            const trigger = uCard.querySelector('.unit-tindakan-trigger');
            
            const tindakan = [];
            if (trigger.checked) {
              uCard.querySelectorAll('.tindakan-row').forEach(row => {
                const taskId = row.getAttribute('data-action-id') || '';
                const keputusan = row.querySelector('.tind-task').value.trim();
                const pegawaiId = row.querySelector('.tind-peg').value;
                const tarikhSiap = row.querySelector('.tind-date').value;
                const keutamaan = row.querySelector('.tind-prio').value;
                const catatan = row.querySelector('.tind-note').value.trim();
                const pObj = state.members.find(x => x.id === pegawaiId);

                if (keputusan && pegawaiId) {
                  tindakan.push({
                    id: taskId,
                    agendaTajuk: `${card.querySelector('h3').innerText.split(':')[1]?.trim() || 'Pembentangan Laporan Unit'} - ${unitNama}`,
                    keputusan, pegawaiId, pegawaiNama: pObj.nama,
                    pegawaiUnit: pObj.unit, tarikhSiap, status: row.getAttribute('data-status') || 'Dalam tindakan',
                    keutamaan, catatan
                  });
                }
              });
            }
            
            if (unitNama && text) {
              unitReports.push({ unitNama, text, tindakan });
            }
          });
          minit[id] = { isUnitSplit: true, unitReports };
        } else {
          const text = card.querySelector('.min-text-input').value.trim();
          const trigger = card.querySelector('.tindakan-trigger');
          
          const tindakan = [];
          if (trigger.checked) {
            card.querySelectorAll('.tindakan-row').forEach(row => {
              const taskId = row.getAttribute('data-action-id') || '';
              const keputusan = row.querySelector('.tind-task').value.trim();
              const pegawaiId = row.querySelector('.tind-peg').value;
              const tarikhSiap = row.querySelector('.tind-date').value;
              const keutamaan = row.querySelector('.tind-prio').value;
              const catatan = row.querySelector('.tind-note').value.trim();

              const pObj = state.members.find(x => x.id === pegawaiId);

              if (keputusan && pegawaiId) {
                tindakan.push({
                  id: taskId,
                  agendaTajuk: card.querySelector('h3').innerText,
                  keputusan, pegawaiId, pegawaiNama: pObj.nama,
                  pegawaiUnit: pObj.unit, tarikhSiap, status: row.getAttribute('data-status') || 'Dalam tindakan',
                  keutamaan, catatan
                });
              }
            });
          }
          minit[id] = { text, tindakan };
        }
      });

      const payload = {
        ...meeting, minit,
        ucapanPenutup: document.getElementById('minPenutup').value.trim(),
        operator: state.currentOperator
      };

      if (payload.status === 'Draf') payload.status = 'Selesai';

      const res = await fetch(`${API_URL}/meetings`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Minit & Cabutan berjaya direkodkan.', 'success');
        await refreshState();
        window.location.hash = '#meetings';
      }
    });
  },

  renderTindakanRow(t = null, isLocked = false, members = []) {
    const actionId = t ? t.id : '';
    const task = t ? t.keputusan : '';
    const pId = t ? t.pegawaiId : '';
    const date = t ? t.tarikhSiap : '';
    const prio = t ? t.keutamaan : 'Sederhana';
    const note = t ? t.catatan : '';
    const status = t ? t.status : 'Dalam tindakan';

    return `
      <div class="tindakan-row" data-action-id="${actionId}" data-status="${status}" style="display:grid; grid-template-columns: 2fr 2fr 1.2fr 1fr 2fr auto; gap:6px; margin-bottom:8px; align-items:center;">
        <input type="text" class="form-control tind-task" value="${task}" required placeholder="Tugasan" ${isLocked ? 'disabled' : ''} style="font-size:10px; padding:4px;">
        <select class="form-control tind-peg" required ${isLocked ? 'disabled' : ''} style="font-size:10px; padding:4px;">
          <option value="">-- Pegawai --</option>
          ${members.map(m => `<option value="${m.id}" ${pId === m.id ? 'selected' : ''}>${m.nama}</option>`).join('')}
        </select>
        <input type="date" class="form-control tind-date" value="${date}" required ${isLocked ? 'disabled' : ''} style="font-size:10px; padding:4px;">
        <select class="form-control tind-prio" ${isLocked ? 'disabled' : ''} style="font-size:10px; padding:4px;">
          <option value="Tinggi" ${prio === 'Tinggi' ? 'selected' : ''}>Tinggi</option>
          <option value="Sederhana" ${prio === 'Sederhana' ? 'selected' : ''}>Sederhana</option>
          <option value="Rendah" ${prio === 'Rendah' ? 'selected' : ''}>Rendah</option>
        </select>
        <input type="text" class="form-control tind-note" value="${note}" placeholder="Catatan" ${isLocked ? 'disabled' : ''} style="font-size:10px; padding:4px;">
        <button type="button" class="btn btn-danger btn-icon remove-row-btn" style="padding:2px 4px;" ${isLocked ? 'disabled' : ''}>x</button>
      </div>
    `;
  },

  attachRowDelete(row) {
    row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
  }
};


// ==========================================================================
// MODUL 11: Kelulusan & Paparan Cetakan Minit Rasmi (Timeline & Timestamps)
// ==========================================================================
const ApprovalModule = {
  init(container, params) {
    const state = window.smartGovState;
    if (state.meetings.length === 0) {
      container.innerHTML = `<div class="card"><h3 class="card-title text-danger">Tiada Mesyuarat</h3></div>`;
      return;
    }
    let meeting = state.meetings[0];
    if (params.id) {
      meeting = state.meetings.find(m => m.id === params.id) || state.meetings[0];
    }
    ApprovalModule.render(container, meeting);
  },

  render(container, meeting) {
    const state = window.smartGovState;
    const currentOp = state.currentOperator;

    const isPengerusi = currentOp === "En. Mohd Yusaini bin Mohamed Ali";
    const isPenyemak = currentOp === "Pn. Norhasaliza binti Hassan";
    const isSetiausaha = currentOp === "Pn. Mashitah binti Osman";

    const steps = [
      { key: 'Draf', label: '1. Draf' },
      { key: 'Selesai', label: '2. Selesai Ditulis' },
      { key: 'Disemak', label: '3. Disemak' },
      { key: 'Diluluskan', label: '4. Diluluskan & Kunci' }
    ];
    const currentIdx = steps.findIndex(s => s.key === meeting.status);

    container.innerHTML = `
      <div class="page-title-section no-print">
        <h2>Kelulusan & Lock Cetak Minit</h2>
        <select id="apprMeetingSelect" class="form-control" style="width:250px;">
          ${state.meetings.map(m => `<option value="${m.id}" ${m.id === meeting.id ? 'selected' : ''}>${m.nama}</option>`).join('')}
        </select>
      </div>

      <div class="card no-print" style="margin-bottom:20px;">
        <h3 class="card-title" style="font-size:12px;">Timeline Status</h3>
        <div style="display:flex; justify-content:space-between; position:relative; margin:16px 0; padding:0 30px;">
          <div style="position:absolute; top:12px; left:40px; right:40px; height:2px; background:var(--border-color); z-index:1;"></div>
          <div style="position:absolute; top:12px; left:40px; width:${currentIdx*33.3}%; height:2px; background:var(--color-success); z-index:2;"></div>
          ${steps.map((st, i) => {
            const active = i <= currentIdx;
            return `<div style="display:flex; flex-direction:column; align-items:center; z-index:3; width:80px;">
              <div style="width:24px; height:24px; border-radius:50%; background:${active ? 'var(--color-success)' : 'var(--bg-primary)'}; border:2px solid ${active ? 'var(--color-success)' : 'var(--border-color)'}; display:flex; align-items:center; justify-content:center; font-size:10px; color:${active ? 'white' : 'var(--text-muted)'}; font-weight:bold;">${active ? '✓' : i+1}</div>
              <span style="font-size:11px; margin-top:4px; font-weight:600;">${st.label}</span>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card no-print" style="margin-bottom:20px; border-left:4px solid var(--color-primary);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>Status Minit: <span class="badge badge-info">${meeting.status}</span></div>
          <div style="display:flex; gap:8px;">
            ${meeting.status === 'Draf' && isSetiausaha ? `<button class="btn btn-primary" id="actReviewBtn">Hantar untuk Semakan</button>` : ''}
            ${meeting.status === 'Selesai' && isPenyemak ? `<button class="btn btn-warning" id="actCheckBtn">Tanda Disemak</button>` : ''}
            ${meeting.status === 'Disemak' && isPengerusi ? `<button class="btn btn-success" id="actLockBtn">Lulus & Kunci Minit</button>` : ''}
            ${meeting.status === 'Diluluskan' ? `<button class="btn btn-primary" id="printMinitBtn"><i data-lucide="printer"></i> Cetak PDF</button>` : `<button class="btn btn-secondary" id="previewMinitBtn">Pratonton PDF</button>`}
          </div>
        </div>
      </div>

      <div class="minute-print-preview" id="paperArea">
        <!-- Rendered via renderPaper -->
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('apprMeetingSelect').addEventListener('change', (e) => {
      window.location.hash = `#approval?id=${e.target.value}`;
    });

    ApprovalModule.renderPaper(meeting);

    const updateStatus = async (status) => {
      const nowStr = new Date().toLocaleDateString('ms-MY', { day:'numeric', month:'short', year:'numeric'}).toUpperCase();
      const payload = { ...meeting, status, operator: currentOp };
      
      if (status === 'Selesai') { payload.tarikhSedia = nowStr; payload.disediakanOleh = currentOp; }
      if (status === 'Disemak') { payload.tarikhSemak = nowStr; payload.disemakOleh = currentOp; }
      if (status === 'Diluluskan') { payload.tarikhSah = nowStr; payload.disahkanOleh = currentOp; }

      const res = await fetch(`${API_URL}/meetings`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Kitaran kelulusan dikemaskini.', 'success');
        await refreshState();
        ApprovalModule.render(container, data.meeting);
      }
    };

    const reviewBtn = document.getElementById('actReviewBtn');
    if (reviewBtn) reviewBtn.addEventListener('click', () => updateStatus('Selesai'));
    const checkBtn = document.getElementById('actCheckBtn');
    if (checkBtn) checkBtn.addEventListener('click', () => updateStatus('Disemak'));
    const lockBtn = document.getElementById('actLockBtn');
    if (lockBtn) lockBtn.addEventListener('click', () => updateStatus('Diluluskan'));

    const runMinitPrint = () => {
      const pageTitle = document.querySelector('.page-title-section');
      const sidebar = document.querySelector('.sidebar');
      const header = document.querySelector('.top-header');
      const noPrintCards = document.querySelectorAll('#viewContainer > .no-print, #viewContainer > .card.no-print');
      
      if (pageTitle) pageTitle.style.setProperty('display', 'none', 'important');
      if (sidebar) sidebar.style.setProperty('display', 'none', 'important');
      if (header) header.style.setProperty('display', 'none', 'important');
      noPrintCards.forEach(c => c.style.setProperty('display', 'none', 'important'));
      
      const mainContent = document.querySelector('.main-content');
      const appLayout = document.querySelector('.app-layout');
      const viewContainer = document.getElementById('viewContainer');
      
      let origMain = mainContent ? mainContent.style.cssText : '';
      let origLayout = appLayout ? appLayout.style.cssText : '';
      let origView = viewContainer ? viewContainer.style.cssText : '';
      
      if (mainContent) {
        mainContent.style.setProperty('display', 'block', 'important');
        mainContent.style.setProperty('width', '100%', 'important');
        mainContent.style.setProperty('padding', '0', 'important');
        mainContent.style.setProperty('margin', '0', 'important');
        mainContent.style.setProperty('height', 'auto', 'important');
        mainContent.style.setProperty('overflow', 'visible', 'important');
      }
      if (appLayout) {
        appLayout.style.setProperty('display', 'block', 'important');
        appLayout.style.setProperty('width', '100%', 'important');
        appLayout.style.setProperty('padding', '0', 'important');
        appLayout.style.setProperty('margin', '0', 'important');
      }
      if (viewContainer) {
        viewContainer.style.setProperty('display', 'block', 'important');
        viewContainer.style.setProperty('width', '100%', 'important');
        viewContainer.style.setProperty('padding', '0', 'important');
        viewContainer.style.setProperty('margin', '0', 'important');
      }
      
      window.print();
      
      setTimeout(() => {
        if (pageTitle) pageTitle.style.display = '';
        if (sidebar) sidebar.style.display = '';
        if (header) header.style.display = '';
        noPrintCards.forEach(c => c.style.display = '');
        
        if (mainContent) mainContent.style.cssText = origMain;
        if (appLayout) appLayout.style.cssText = origLayout;
        if (viewContainer) viewContainer.style.cssText = origView;
      }, 800);
    };

    const printBtn = document.getElementById('printMinitBtn');
    if (printBtn) printBtn.addEventListener('click', runMinitPrint);
    const prevBtn = document.getElementById('previewMinitBtn');
    if (prevBtn) prevBtn.addEventListener('click', runMinitPrint);
  },

  renderPaper(meeting) {
    const state = window.smartGovState;
    const paper = document.getElementById('paperArea');
    if (!paper) return;

    const date = new Date(meeting.tarikh);
    const dayNames = ['AHAD', 'ISNIN', 'SELASA', 'RABU', 'KHAMIS', 'JUMAAT', 'SABTU'];
    const monthNames = ['JAN', 'FEB', 'MAC', 'APR', 'MEI', 'JUN', 'JUL', 'OGOS', 'SEPT', 'OKT', 'NOV', 'DIS'];
    const dateFormatted = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()} (${dayNames[date.getDay()]})`;

    const hadir = [];
    const tidakHadir = [];
    const targetMembers = state.members.filter(m => !meeting.ahliIds || meeting.ahliIds.includes(m.id));
    targetMembers.forEach(m => {
      const status = meeting.kehadiran?.[m.id] || 'Hadir';
      if (status === 'Hadir') hadir.push(m);
      else tidakHadir.push(m);
    });

    hadir.sort((a,b) => {
      if (a.id === meeting.pengerusiId) return -1;
      if (b.id === meeting.pengerusiId) return 1;
      return 0;
    });

    let pNum = 1;

    let html = `
      <div class="print-header">
        <h2 class="print-title">MINIT MESYUARAT ${meeting.nama.toUpperCase()}</h2>
        <h3 class="print-bilangan">BIL. ${meeting.bilangan} TAHUN ${meeting.tahun}</h3>
      </div>
      <table class="print-meta-table">
        <tr><td class="meta-label">Tarikh</td><td>:</td><td><strong>${dateFormatted}</strong></td></tr>
        <tr><td class="meta-label">Masa</td><td>:</td><td><strong>${meeting.masa}</strong></td></tr>
        <tr><td class="meta-label">Tempat</td><td>:</td><td><strong>${meeting.tempat}</strong></td></tr>
      </table>
      <div class="print-section-title">KEHADIRAN :</div>
      <table class="print-kehadiran-table">
        ${hadir.map((h, i) => `
          <tr>
            <td class="col-num">${i + 1}.</td>
            <td class="col-role">${h.jawatan}<br><span style="font-weight:normal; font-size:10pt;">${h.nama}</span></td>
            <td class="col-pengerusi">${h.id === meeting.pengerusiId ? '- Pengerusi' : h.id === meeting.setiausahaId ? '- Pencatat Minit' : ''}</td>
          </tr>
        `).join('')}
      </table>

      <div class="print-section-title">TIDAK HADIR DENGAN MAAF :</div>
      <ul style="margin-left:24px; margin-bottom:20px; font-size:10.5pt; list-style-type:circle;">
        ${tidakHadir.length === 0 ? '<li>Tiada</li>' : tidakHadir.map(m => `<li><strong>${m.nama}</strong> - ${m.jawatan} (${meeting.tidakHadirSebab?.[m.id] || 'Sebab tidak dinyatakan'})</li>`).join('')}
      </ul>

      <div class="print-section-title" style="border-bottom:1px solid black; padding-bottom:2px; margin-bottom:16px;">AGENDA MESYUARAT</div>
    `;

    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    meeting.agenda.forEach((ag, idx) => {
      const minData = meeting.minit?.[ag.id] || { text: '', tindakan: [] };
      
      if (minData.isUnitSplit && minData.unitReports && minData.unitReports.length > 0) {
        html += `<div style="font-weight:bold; margin-top:20px; margin-bottom:8px;">${romans[idx]}. &nbsp; <u>${ag.tajuk.toUpperCase()}</u></div>`;
        const hasAnyActions = minData.unitReports.some(rep => rep.tindakan && rep.tindakan.length > 0);
        
        minData.unitReports.forEach((rep, rIdx) => {
          const isLastReport = rIdx === minData.unitReports.length - 1;
          
          let actText = '';
          if (rep.tindakan && rep.tindakan.length > 0) {
            const units = [...new Set(rep.tindakan.map(t => t.pegawaiUnit))];
            actText = `Tindakan:<br>${units.join('<br>')}`;
          } else if (isLastReport && !hasAnyActions) {
            actText = 'Makluman';
          }
          
          // Pecahkan teks mengikut penanda senarai sebaris
          const textParts = rep.text.split(/\s+(?=[a-zA-Z0-9][\.\)](?:\s|[a-zA-Z]|$))/).map(p => p.trim()).filter(p => p.length > 0);
          
          textParts.forEach((part, pIdx) => {
            const isFirstPart = pIdx === 0;
            const isList = /^[a-zA-Z0-9][\.\)]/.test(part) || /^[-*•]\s*/.test(part);
            
            let lineHtml = '';
            if (isList || !isFirstPart) {
              lineHtml = `<span style="flex:1; text-align:justify; margin-left:30px;">${part}</span>`;
            } else {
              lineHtml = `
                <span style="font-weight:bold; min-width:30px;">${idx + 1}.${rIdx + 1}</span>
                <span style="flex:1; text-align:justify;"><strong>Laporan Pembentangan ${rep.unitNama}:</strong> ${part}</span>
              `;
            }
            
            const isLastPart = pIdx === textParts.length - 1;
            const rowActText = isLastPart ? actText : '';
            
            html += `
              <div class="print-agenda-row">
                <div class="print-agenda-text" style="display:flex; align-items:flex-start;">
                  ${lineHtml}
                </div>
                <div class="print-agenda-action">${rowActText}</div>
              </div>
            `;
          });
        });
      } else {
        const rawLines = (minData.text || '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        // Pecahkan baris secara dinamik jika mengandungi senarai sebaris
        const flatLines = [];
        rawLines.forEach(line => {
          const parts = line.split(/\s+(?=[a-zA-Z0-9][\.\)](?:\s|[a-zA-Z]|$))/);
          flatLines.push(...parts.map(p => p.trim()).filter(p => p.length > 0));
        });
        
        html += `<div style="font-weight:bold; margin-top:20px; margin-bottom:8px;">${romans[idx]}. &nbsp; <u>${ag.tajuk.toUpperCase()}</u></div>`;
 
        if (flatLines.length === 0) {
          html += `
            <div class="print-agenda-row">
              <div class="print-agenda-text">
                <span>Tiada catatan.</span>
              </div>
              <div class="print-agenda-action">Makluman</div>
            </div>
          `;
        } else {
          let pNumOffset = 0;
          flatLines.forEach((line, pIdx) => {
            const isLast = pIdx === flatLines.length - 1;
            let actText = '';
            
            if (isLast) {
              if (minData.tindakan && minData.tindakan.length > 0) {
                const units = [...new Set(minData.tindakan.map(t => t.pegawaiUnit))];
                actText = `Tindakan:<br>${units.join('<br>')}`;
              } else {
                actText = 'Makluman';
              }
            }
            
            const isList = /^[a-zA-Z0-9][\.\)]/.test(line) || /^[-*•]\s*/.test(line);
            let lineHtml = '';
            
            if (isList) {
              pNumOffset++;
              lineHtml = `<span style="flex:1; text-align:justify; margin-left:30px;">${line}</span>`;
            } else {
              const currentSubNum = pIdx + 1 - pNumOffset;
              lineHtml = `
                <span style="font-weight:bold; min-width:30px;">${idx + 1}.${currentSubNum}</span>
                <span style="flex:1; text-align:justify;">${line}</span>
              `;
            }
            
            html += `
              <div class="print-agenda-row">
                <div class="print-agenda-text" style="display:flex; align-items:flex-start;">
                  ${lineHtml}
                </div>
                <div class="print-agenda-action">${actText}</div>
              </div>
            `;
          });
        }
      }
    });
 
    html += `
      <div style="font-weight:bold; margin-top:20px; margin-bottom:8px;">${romans[meeting.agenda.length] || 'XI'}. &nbsp; <u>PENUTUP</u></div>
      <div class="print-agenda-row">
        <div class="print-agenda-text" style="display:flex; align-items:flex-start;">
          <span style="font-weight:bold; min-width:30px;">${meeting.agenda.length + 1}.1</span>
          <span style="flex:1; text-align:justify;">${meeting.ucapanPenutup || 'Pengerusi menangguhkan mesyuarat.'}</span>
        </div>
        <div class="print-agenda-action">Makluman</div>
      </div>
    `;

    html += `
      <div class="print-signatures-grid" style="border-top:1px solid #ccc; padding-top:20px;">
        <div class="signature-column">
          <span class="signature-title">Disediakan Oleh:</span>
          <div style="margin-bottom:30px; font-size:10pt;">${meeting.tarikhSedia ? `[Tandatangan Digital]<br>Tarikh: ${meeting.tarikhSedia}` : ''}</div>
          <div class="signature-line"></div>
          <span class="signature-name">(${meeting.disediakanOleh || 'Mashitah binti Osman'})</span>
          <span>Setiausaha / Urusetia</span>
        </div>
        <div class="signature-column">
          <span class="signature-title">Disemak Oleh:</span>
          <div style="margin-bottom:30px; font-size:10pt;">${meeting.tarikhSemak ? `[Tandatangan Digital]<br>Tarikh: ${meeting.tarikhSemak}` : ''}</div>
          <div class="signature-line"></div>
          <span class="signature-name">(Pn. Norhasaliza binti Hassan)</span>
          <span>Penyemak Minit</span>
        </div>
        <div class="signature-column">
          <span class="signature-title">Disahkan Oleh:</span>
          <div style="margin-bottom:30px; font-size:10pt;">${meeting.tarikhSah ? `[Tandatangan Digital]<br>Tarikh: ${meeting.tarikhSah}` : ''}</div>
          <div class="signature-line"></div>
          <span class="signature-name">(${meeting.disahkanOleh || 'En. Mohd Yusaini bin Mohamed Ali'})</span>
          <span>Pengerusi Jawatankuasa</span>
        </div>
      </div>
    `;

    paper.innerHTML = html;
  }
};


// ==========================================================================
// MODUL 8: Cabutan Minit Mesyuarat (Automatik)
// ==========================================================================
const ExtractModule = {
  init(container, params) {
    const state = window.smartGovState;
    if (state.meetings.length === 0) {
      container.innerHTML = `<div class="card"><h3 class="card-title text-danger">Tiada Mesyuarat</h3></div>`;
      return;
    }
    let meeting = state.meetings[0];
    if (params.id) {
      meeting = state.meetings.find(m => m.id === params.id) || state.meetings[0];
    }
    ExtractModule.render(container, meeting);
  },

  render(container, meeting) {
    const state = window.smartGovState;
    const actions = state.actions.filter(a => a.meetingId === meeting.id);

    container.innerHTML = `
      <div class="page-title-section no-print">
        <h2>Cabutan Minit Mesyuarat</h2>
        <select id="extMeetingSelect" class="form-control" style="width:250px;">
          ${state.meetings.map(m => `<option value="${m.id}" ${m.id === meeting.id ? 'selected' : ''}>${m.nama}</option>`).join('')}
        </select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 300px; gap: 24px;">
        <div class="card minute-print-preview" id="extPrintArea" style="margin: 0; padding: 40px; background: white; color: black; box-shadow: var(--shadow-sm); font-family:Arial, sans-serif;">
          <div style="text-align: center; border-bottom: 2px solid black; padding-bottom: 8px; margin-bottom: 20px;">
            <h2 style="font-size: 12pt; font-weight: bold; text-transform: uppercase; margin: 0;">CABUTAN MINIT MESYUARAT</h2>
            <h3 style="font-size: 11pt; font-weight: bold; margin: 4px 0 0;">${meeting.nama.toUpperCase()}</h3>
            <span style="font-size: 9.5pt; font-weight: bold;">BIL. ${meeting.bilangan} TAHUN ${meeting.tahun}</span>
                  <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-top: 12px;">
            <thead>
              <tr style="background-color: #f1f5f9; border-top: 2px solid black; border-bottom: 2px solid black; font-weight:bold;">
                <th style="border: 1px solid black; padding: 6px; text-align: center; width: 35px;">Bil</th>
                <th style="border: 1px solid black; padding: 6px; text-align: left; width: 110px;">Agenda / Rujukan</th>
                <th style="border: 1px solid black; padding: 6px; text-align: left; width: 180px;">Keputusan / Tugasan</th>
                <th style="border: 1px solid black; padding: 6px; text-align: left; width: 130px;">Pegawai Terlibat</th>
                <th style="border: 1px solid black; padding: 6px; text-align: center; width: 65px;">Tarikh</th>
                <th style="border: 1px solid black; padding: 6px; text-align: center; width: 65px;">Status</th>
                <th style="border: 1px solid black; padding: 6px; text-align: left; width: 160px;">Maklum Balas Pegawai</th>
              </tr>
            </thead>
            <tbody>
              ${actions.length === 0 ? `
                <tr><td colspan="7" style="border:1px solid black; padding:20px; text-align:center; font-style:italic;">Tiada komitmen tindakan direkodkan.</td></tr>
              ` : actions.map((act, idx) => `
                <tr>
                  <td style="border:1px solid black; padding:6px; text-align:center;">${idx + 1}</td>
                  <td style="border:1px solid black; padding:6px; font-weight:bold;">${act.agendaTajuk.replace(/Perenggan\s*/, '')}</td>
                  <td style="border:1px solid black; padding:6px; text-align:justify;">${act.keputusan}</td>
                  <td style="border:1px solid black; padding:6px;"><strong>${act.pegawaiNama}</strong><br><span style="font-size:7.5pt;color:#555;">${act.pegawaiUnit}</span></td>
                  <td style="border:1px solid black; padding:6px; text-align:center;">${act.tarikhSiap ? new Date(act.tarikhSiap).toLocaleDateString('ms-MY', {day:'numeric',month:'short'}) : '—'}</td>
                  <td style="border:1px solid black; padding:6px; text-align:center; font-weight:bold; text-transform:uppercase;">${act.status}</td>
                  <td style="border:1px solid black; padding:6px;">
                    <div class="print-only" style="font-size:8.5pt; text-align:justify; white-space:pre-wrap;">${act.catatan || '—'}</div>
                    <div class="no-print" style="display:flex; flex-direction:column; gap:4px;">
                      <textarea class="form-control feedback-input" rows="2" style="font-size:9.5px; width:100%; resize:vertical; padding:2px 4px; line-height:1.2; background:var(--bg-secondary); color:var(--text-primary);" placeholder="Tulis respon/maklum balas..." data-action-id="${act.id}">${act.catatan || ''}</textarea>
                      <button type="button" class="btn btn-primary save-feedback-btn" data-action-id="${act.id}" style="padding: 1px 4px; font-size: 8.5px; align-self: flex-end;">
                        Simpan
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top:30px; text-align:right; font-size:9.5pt;">
            <p>Dikeluarkan oleh Urusetia,</p>
            <p style="font-weight:bold; margin-top:16px;">PMTG Jawatankuasa Kerja</p>
          </div>
        </div>
 
        <div class="card no-print" style="display:flex; flex-direction:column; gap:12px; align-self:flex-start;">
          <button class="btn btn-primary" onclick="window.print()">Cetak PDF</button>
          <button class="btn btn-secondary" id="exportWordBtnCabutan">Eksport Word</button>
        </div>
      </div>
    `;
 
    document.getElementById('extMeetingSelect').addEventListener('change', (e) => {
      window.location.hash = `#extract?id=${e.target.value}`;
    });
 
    const exportBtn = document.getElementById('exportWordBtnCabutan');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const html = document.getElementById('extPrintArea').innerHTML;
        const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Cabutan_${meeting.bilangan}_${meeting.tahun}.doc`;
        a.click();
        showToast('Eksport selesai.', 'success');
      });
    }

    document.querySelectorAll('.save-feedback-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const actionId = btn.getAttribute('data-action-id');
        const textarea = document.querySelector(`textarea[data-action-id="${actionId}"]`);
        if (!textarea) return;
        const feedbackValue = textarea.value.trim();

        btn.disabled = true;
        btn.textContent = 'Menyimpan...';

        const res = await fetch(`${API_URL}/actions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: actionId,
            catatan: feedbackValue,
            operator: state.currentOperator
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Maklum balas pegawai berjaya disimpan.', 'success');
          await refreshState();
          ExtractModule.render(container, meeting);
        } else {
          showToast('Gagal: ' + data.message, 'danger');
          btn.disabled = false;
          btn.textContent = 'Simpan';
        }
      });
    });
  }
};


// ==========================================================================
// MODUL 9 & 10: Pemantauan Tindakan & Reminder Portal
// ==========================================================================
const MonitoringModule = {
  init(container, params) {
    MonitoringModule.render(container, 'semua');
  },

  render(container, filter = 'semua') {
    const state = window.smartGovState;

    const total = state.actions.length;
    const done = state.actions.filter(a => a.status === 'Selesai').length;
    const pending = total - done;
    const overdue = state.actions.filter(a => a.status !== 'Selesai' && a.tarikhSiap && new Date(a.tarikhSiap) < new Date()).length;

    let filtered = [...state.actions];
    if (filter === 'overdue') {
      filtered = state.actions.filter(a => a.status !== 'Selesai' && a.tarikhSiap && new Date(a.tarikhSiap) < new Date());
    } else if (filter === 'pending') {
      filtered = state.actions.filter(a => a.status === 'Dalam tindakan');
    } else if (filter === 'done') {
      filtered = state.actions.filter(a => a.status === 'Selesai');
    }

    container.innerHTML = `
      <div class="page-title-section no-print">
        <h2>Pemantauan Tindakan & Notifikasi</h2>
      </div>

      <div class="grid-cols-4 no-print" style="margin-bottom:20px;">
        <div class="card stat-card stat-primary filter-c" data-filter="semua" style="cursor:pointer; ${filter==='semua' ? 'transform:translateY(-2px); box-shadow:var(--shadow-md);' : ''}">
          <div class="stat-info"><span class="stat-value">${total}</span><span class="stat-label">Semua Tindakan</span></div>
          <div class="stat-icon"><i data-lucide="list"></i></div>
        </div>
        <div class="card stat-card stat-danger filter-c" data-filter="overdue" style="cursor:pointer; ${filter==='overdue' ? 'transform:translateY(-2px); box-shadow:var(--shadow-md);' : ''}">
          <div class="stat-info"><span class="stat-value">${overdue}</span><span class="stat-label">Overdue (Merah)</span></div>
          <div class="stat-icon"><i data-lucide="alert-triangle"></i></div>
        </div>
        <div class="card stat-card stat-warning filter-c" data-filter="pending" style="cursor:pointer; ${filter==='pending' ? 'transform:translateY(-2px); box-shadow:var(--shadow-md);' : ''}">
          <div class="stat-info"><span class="stat-value">${pending}</span><span class="stat-label">Dalam Tindakan (Kuning)</span></div>
          <div class="stat-icon"><i data-lucide="clock"></i></div>
        </div>
        <div class="card stat-card stat-success filter-c" data-filter="done" style="cursor:pointer; ${filter==='done' ? 'transform:translateY(-2px); box-shadow:var(--shadow-md);' : ''}">
          <div class="stat-info"><span class="stat-value">${done}</span><span class="stat-label">Selesai (Hijau)</span></div>
          <div class="stat-icon"><i data-lucide="check-circle-2"></i></div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title"><i data-lucide="clipboard-list"></i> Tugasan Mengikut Status</h3>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr><th>Mesyuarat</th><th>Tugasan / Keputusan</th><th>Pegawai Bertanggungjawab</th><th>Tarikh Akhir</th><th>Status</th><th style="text-align:right;">Tindakan</th></tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr><td colspan="6" style="text-align:center;">Tiada tugasan ditemui.</td></tr>
              ` : filtered.map(a => {
                const isOver = a.status !== 'Selesai' && a.tarikhSiap && new Date(a.tarikhSiap) < new Date();
                const dFormatted = a.tarikhSiap ? new Date(a.tarikhSiap).toLocaleDateString('ms-MY', {day:'numeric',month:'short'}) : '—';
                return `
                  <tr data-action-id="${a.id}">
                    <td><strong>${a.meetingNama}</strong><br><span style="font-size:9.5px;color:#555;">Bil. ${a.meetingBilangan}</span></td>
                    <td style="max-width:280px;">${a.keputusan}</td>
                    <td><strong>${a.pegawaiNama}</strong><br><span style="font-size:9.5px;color:#555;">${a.pegawaiUnit}</span></td>
                    <td><span style="color:${isOver ? 'var(--color-danger)' : 'inherit'}; font-weight:${isOver ? 'bold' : 'normal'};">${dFormatted}</span></td>
                    <td><span class="badge ${a.status==='Selesai' ? 'badge-success' : isOver ? 'badge-danger' : 'badge-warning'}">${isOver ? 'OVERDUE' : a.status}</span></td>
                    <td style="text-align:right;">
                      <div style="display:inline-flex; gap:6px;">
                        <button class="btn btn-secondary btn-icon state-btn" style="padding:4px 8px;" title="Status"><i data-lucide="check-circle" style="width:12px;"></i></button>
                        <button class="btn btn-primary btn-icon remind-btn" style="padding:4px 8px;" title="Reminder"><i data-lucide="bell" style="width:12px;"></i></button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.querySelectorAll('.filter-c').forEach(card => {
      card.addEventListener('click', () => {
        const f = card.getAttribute('data-filter');
        MonitoringModule.render(container, f);
      });
    });

    document.querySelectorAll('.state-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('tr').getAttribute('data-action-id');
        const act = state.actions.find(x => x.id === id);
        MonitoringModule.openStatusModal(act, container, filter);
      });
    });

    document.querySelectorAll('.remind-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('tr').getAttribute('data-action-id');
        const act = state.actions.find(x => x.id === id);
        MonitoringModule.openReminderModal(act);
      });
    });
  },

  openStatusModal(action, container, filter) {
    const modalHtml = `
      <form id="stateModalForm">
        <p><strong>Tugasan:</strong> ${action.keputusan}</p>
        <div class="form-group" style="margin-top:12px;">
          <label class="form-label">Ubah Status</label>
          <select id="stateSelect" class="form-control">
            <option value="Dalam tindakan" ${action.status === 'Dalam tindakan' ? 'selected' : ''}>Dalam tindakan (Kuning)</option>
            <option value="Selesai" ${action.status === 'Selesai' ? 'selected' : ''}>Selesai (Hijau)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Catatan Tindakan</label>
          <textarea id="stateCatatan" class="form-control" rows="2">${action.catatan || ''}</textarea>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-success">Simpan Status</button>
        </div>
      </form>
    `;

    showModal('Kemaskini Status Komitmen', modalHtml);

    document.getElementById('stateModalForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        id: action.id,
        status: document.getElementById('stateSelect').value,
        catatan: document.getElementById('stateCatatan').value.trim(),
        operator: window.smartGovState.currentOperator
      };

      const res = await fetch(`${API_URL}/actions`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Status komitmen dikemaskini.', 'success');
        closeModal();
        await refreshState();
        MonitoringModule.render(container, filter);
      }
    });
  },

  openReminderModal(action) {
    const member = window.smartGovState.members.find(x => x.id === action.pegawaiId) || {};
    const dateStr = new Date(action.tarikhSiap).toLocaleDateString('ms-MY', {day:'numeric',month:'long',year:'numeric'});
    
    const modalHtml = `
      <form id="remindModalForm">
        <p><strong>Pegawai:</strong> ${action.pegawaiNama} (${member.telefon || '—'}, ${member.email || '—'})</p>
        <p><strong>Tugasan:</strong> ${action.keputusan}</p>
        <div class="form-group" style="margin-top:12px;">
          <label class="form-label">Saluran Reminder</label>
          <select id="remChannel" class="form-control">
            <option value="WhatsApp">WhatsApp (Simulasi API)</option>
            <option value="Telegram">Telegram (Bot Pintar)</option>
            <option value="Email">Emel Rasmi PMTG</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Sela Peringatan (Interval)</label>
          <select id="remInterval" class="form-control">
            <option value="Tunggakan">Peringatan Tunggakan (Overdue)</option>
            <option value="1 Hari">1 Hari Sebelum Tarikh Siap</option>
            <option value="3 Hari">3 Hari Sebelum Tarikh Siap</option>
            <option value="7 Hari">7 Hari Sebelum Tarikh Siap</option>
          </select>
        </div>
        <div style="background:#f1f5f9; padding:8px 12px; font-family:monospace; font-size:11px; margin-bottom:16px;">
          [PERINGATAN PORTAL PMTG]\nSalam, ${action.pegawaiNama}. Sila maklum balas tindakan: "${action.keputusan.substring(0,35)}..." sebelum tarikh akhir ${dateStr}.
        </div>
        <div style="display:flex; justify-content:flex-end; gap:12px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary" id="btnSendRem">Hantar Peringatan</button>
        </div>
      </form>
    `;

    showModal('Hantar Peringatan Notifikasi (Modul 10)', modalHtml);

    document.getElementById('remindModalForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const channel = document.getElementById('remChannel').value;
      const interval = document.getElementById('remInterval').value;
      const btn = document.getElementById('btnSendRem');
      
      btn.disabled = true;
      btn.textContent = 'Menghantar...';

      await fetch(`${API_URL}/meetings`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...window.smartGovState.meetings.find(m => m.id === action.meetingId),
          operator: `Notifikasi [${channel}] (${interval}) dihantar kepada ${action.pegawaiNama}`
        })
      });

      const messageText = `[PERINGATAN PORTAL PMTG]\nSalam, ${action.pegawaiNama}. Sila maklum balas tindakan: "${action.keputusan.substring(0,35)}..." sebelum tarikh akhir ${dateStr}.`;

      if (channel === 'Email') {
        const subject = encodeURIComponent(`[SmartGov PMTG] Peringatan Komitmen Tindakan: ${action.agendaTajuk}`);
        const body = encodeURIComponent(messageText + `\n\nSila kemaskini maklum balas anda di portal SmartGov.\n\nTerima kasih.`);
        window.open(`mailto:${member.email || ''}?subject=${subject}&body=${body}`);
      } else if (channel === 'WhatsApp') {
        const cleanPhone = (member.telefon || '').replace(/[^0-9]/g, '');
        const formattedPhone = cleanPhone.startsWith('60') ? cleanPhone : ('6' + (cleanPhone.startsWith('0') ? cleanPhone : '0' + cleanPhone));
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`, '_blank');
      } else if (channel === 'Telegram') {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(messageText)}`, '_blank');
      }

      showToast(`Peringatan via ${channel} berjaya dihantar kepada ${action.pegawaiNama}!`, 'success');
      closeModal();
      await refreshState();
    });
  }
};


// ==========================================================================
// MODUL 12: Carian Pintar Multi-Kriteria
// ==========================================================================
const SearchModule = {
  init(container, params) {
    const state = window.smartGovState;
    const initialQuery = params.q ? decodeURIComponent(params.q) : '';

    container.innerHTML = `
      <div class="page-title-section no-print">
        <h2>Carian Pintar</h2>
        <p class="page-subtitle">Cari maklumat minit mesyuarat, agenda, keputusan dan nama pegawai</p>
      </div>

      <div class="card no-print" style="margin-bottom:20px;">
        <form id="searchForm">
          <div class="form-row">
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label">Kata Kunci</label>
              <input type="text" id="sQuery" class="form-control" value="${initialQuery}" placeholder="Cari keyword...">
            </div>
            <div class="form-group">
              <label class="form-label">Unit</label>
              <select id="sUnit" class="form-control">
                <option value="">-- Semua Unit --</option>
                ${[...new Set(state.members.map(m => m.unit))].map(u => `<option value="${u}">${u}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button type="submit" class="btn btn-primary">Mula Mencari</button>
          </div>
        </form>
      </div>

      <div id="searchResults">
        <!-- Rendered dynamically -->
      </div>
    `;

    document.getElementById('searchForm').addEventListener('submit', (e) => {
      e.preventDefault();
      SearchModule.execute();
    });

    if (initialQuery) SearchModule.execute();
  },

  execute() {
    const state = window.smartGovState;
    const query = document.getElementById('sQuery').value.trim().toLowerCase();
    const unit = document.getElementById('sUnit').value;
    const wrap = document.getElementById('searchResults');
    if (!wrap) return;

    const matchedMeetings = state.meetings.filter(m => {
      const matchKey = !query || m.nama.toLowerCase().includes(query) || m.tempat.toLowerCase().includes(query);
      return matchKey;
    });

    const matchedActions = state.actions.filter(a => {
      const matchKey = !query || a.keputusan.toLowerCase().includes(query) || a.agendaTajuk.toLowerCase().includes(query);
      const matchUnit = !unit || a.pegawaiUnit === unit;
      return matchKey && matchUnit;
    });

    if (matchedMeetings.length === 0 && matchedActions.length === 0) {
      wrap.innerHTML = `<div class="card" style="text-align:center;"><p>Tiada padanan dijumpai.</p></div>`;
      return;
    }

    wrap.innerHTML = `
      ${matchedMeetings.length > 0 ? `
        <div class="card" style="margin-bottom:20px;">
          <h3 class="card-title">Mesyuarat Ditemui (${matchedMeetings.length})</h3>
          <div class="table-responsive">
            <table class="table">
              <thead><tr><th>Mesyuarat</th><th>Kategori</th><th>Tarikh</th><th>Status</th></tr></thead>
              <tbody>
                ${matchedMeetings.map(m => `
                  <tr>
                    <td><strong>${m.nama}</strong><br><span style="font-size:10px;">Bil. ${m.bilangan}</span></td>
                    <td>${m.kategori}</td>
                    <td>${m.tarikh}</td>
                    <td><span class="badge badge-info">${m.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      ${matchedActions.length > 0 ? `
        <div class="card">
          <h3 class="card-title">Tugasan & Tindakan Ditemui (${matchedActions.length})</h3>
          <div class="table-responsive">
            <table class="table">
              <thead><tr><th>Mesyuarat</th><th>Keputusan Minit</th><th>Pegawai Bertanggungjawab</th><th>Status</th></tr></thead>
              <tbody>
                ${matchedActions.map(a => `
                  <tr>
                    <td><strong>${a.meetingNama}</strong></td>
                    <td>${a.keputusan}</td>
                    <td><strong>${a.pegawaiNama}</strong><br>${a.pegawaiUnit}</td>
                    <td><span class="badge ${a.status==='Selesai'?'badge-success':'badge-warning'}">${a.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
    `;
  }
};


// ==========================================================================
// MODUL 13: Laporan & Eksport Excel (CSV)
// ==========================================================================
const ReportsModule = {
  init(container, params) {
    container.innerHTML = `
      <div class="page-title-section no-print">
        <h2>Penjanaan Laporan Mesyuarat</h2>
      </div>

      <div class="card no-print" style="margin-bottom:20px;">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Jenis Laporan</label>
            <select id="repType" class="form-control">
              <option value="mesyuarat">Ringkasan Kehadiran & Kerap Mesyuarat</option>
              <option value="unit">Prestasi Tindakan Mengikut Unit</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tahun</label>
            <select id="repYear" class="form-control"><option value="2026">2026</option></select>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end;">
          <button class="btn btn-primary" id="btnGenRep">Jana Laporan</button>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 280px; gap:20px;">
        <div class="card minute-print-preview" id="repPrintArea" style="margin:0; padding:30px; background:white; color:black; box-shadow:var(--shadow-sm);">
          <!-- Dynamic -->
        </div>
        <div class="card no-print" style="display:flex; flex-direction:column; gap:12px; align-self:flex-start;">
          <button class="btn btn-primary" onclick="window.print()">Cetak PDF</button>
          <button class="btn btn-success" id="btnExportCsv">Eksport Excel (CSV)</button>
        </div>
      </div>
    `;

    document.getElementById('btnGenRep').addEventListener('click', () => ReportsModule.generate());
    document.getElementById('btnExportCsv').addEventListener('click', () => ReportsModule.exportCsv());
    ReportsModule.generate();
  },

  generate() {
    const state = window.smartGovState;
    const type = document.getElementById('repType').value;
    const area = document.getElementById('repPrintArea');
    if (!area) return;

    let html = `
      <div style="text-align:center; border-bottom:2px solid black; padding-bottom:8px; margin-bottom:20px;">
        <h2 style="font-size:12pt; font-weight:bold; margin:0;">LAPORAN ANALIS PRESTASI PMTG</h2>
        <span style="font-size:9pt; color:#444;">Sistem SmartGovMeeting</span>
      </div>
    `;

    if (type === 'mesyuarat') {
      const counts = {};
      state.meetings.forEach(m => { counts[m.kategori] = (counts[m.kategori] || 0) + 1; });

      html += `
        <h4>Ringkasan Kategori Mesyuarat (2026)</h4>
        <table style="width:100%; border-collapse:collapse; margin-top:12px; font-size:10pt;">
          <thead>
            <tr style="background:#e2e8f0; border-top:1px solid black; border-bottom:1px solid black; font-weight:bold;">
              <th style="border:1px solid black; padding:6px; text-align:left;">Kategori Mesyuarat</th>
              <th style="border:1px solid black; padding:6px; text-align:center; width:150px;">Bilangan</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(counts).length === 0 ? `<tr><td colspan="2" style="border:1px solid black; padding:10px; text-align:center;">Tiada data.</td></tr>` : Object.keys(counts).map(cat => `
              <tr>
                <td style="border:1px solid black; padding:6px;">${cat}</td>
                <td style="border:1px solid black; padding:6px; text-align:center;"><strong>${counts[cat]}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      const unitStats = {};
      state.actions.forEach(a => {
        const u = a.pegawaiUnit || 'Lain-lain';
        if (!unitStats[u]) unitStats[u] = { done: 0, total: 0 };
        unitStats[u].total++;
        if (a.status === 'Selesai') unitStats[u].done++;
      });

      html += `
        <h4>Prestasi Tindakan Unit (2026)</h4>
        <table style="width:100%; border-collapse:collapse; margin-top:12px; font-size:10pt;">
          <thead>
            <tr style="background:#e2e8f0; border-top:1px solid black; border-bottom:1px solid black; font-weight:bold;">
              <th style="border:1px solid black; padding:6px; text-align:left;">Unit</th>
              <th style="border:1px solid black; padding:6px; text-align:center; width:100px;">Selesai</th>
              <th style="border:1px solid black; padding:6px; text-align:center; width:100px;">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(unitStats).length === 0 ? `<tr><td colspan="3" style="border:1px solid black; padding:10px; text-align:center;">Tiada data.</td></tr>` : Object.keys(unitStats).map(u => `
              <tr>
                <td style="border:1px solid black; padding:6px;"><strong>${u}</strong></td>
                <td style="border:1px solid black; padding:6px; text-align:center; color:#10b981; font-weight:bold;">${unitStats[u].done}</td>
                <td style="border:1px solid black; padding:6px; text-align:center;">${unitStats[u].total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    area.innerHTML = html;
  },

  exportCsv() {
    const table = document.querySelector('#repPrintArea table');
    if (!table) return showToast('Tiada jadual untuk dieksport.', 'warning');
    
    let csv = [];
    table.querySelectorAll('tr').forEach(tr => {
      let row = [];
      tr.querySelectorAll('th, td').forEach(col => {
        row.push(`"${col.innerText.trim()}"`);
      });
      csv.push(row.join(','));
    });

    const blob = new Blob(['\ufeff' + csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_SmartGov.csv`;
    a.click();
    showToast('Laporan Excel (CSV) diunduh.', 'success');
  }
};


// ==========================================================================
// MODUL 15: Audit Trail Logs Viewer
// ==========================================================================
const AuditModule = {
  init(container, params) {
    container.innerHTML = `
      <div class="page-title-section no-print">
        <h2>Audit Trail / Log Aktiviti</h2>
        <button class="btn btn-secondary" id="btnRefAudit"><i data-lucide="refresh-cw"></i> Muat Semula Log</button>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="table" style="font-size:11.5px;">
            <thead>
              <tr style="background:#f1f5f9;"><th>Masa & Tarikh</th><th>Pegawai / Operator</th><th>IP Address</th><th>Aktiviti</th><th>Butiran</th></tr>
            </thead>
            <tbody id="auditRows">
              <!-- Dynamic -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    AuditModule.renderRows();

    document.getElementById('btnRefAudit').addEventListener('click', async () => {
      await refreshState();
      AuditModule.renderRows();
      showToast('Log dimuat semula.', 'success');
    });
  },

  renderRows() {
    const state = window.smartGovState;
    const body = document.getElementById('auditRows');
    if (!body) return;

    body.innerHTML = state.auditLogs.map(log => {
      const dateStr = new Date(log.timestamp).toLocaleString('ms-MY');
      return `
        <tr>
          <td><strong>${dateStr}</strong></td>
          <td><strong>${log.user}</strong></td>
          <td><code>${log.ip}</code></td>
          <td style="font-weight:bold; color:var(--color-primary);">${log.action}</td>
          <td>${log.details}</td>
        </tr>
      `;
    }).join('');
  }
};


// ==========================================================================
// MODUL 17: Repositori Fail & Lampiran (Base64 offline uploader)
// ==========================================================================
const RepositoryModule = {
  init(container, params) {
    container.innerHTML = `
      <div class="page-title-section no-print">
        <h2>Repositori Fail Setempat</h2>
        <button class="btn btn-primary" id="btnUploadModal"><i data-lucide="upload-cloud"></i> Muat Naik Fail</button>
      </div>
      <div class="card">
        <h3 class="card-title"><i data-lucide="folder-open"></i> Fail Tersimpan</h3>
        <div class="repo-grid" id="repoGrid">
          <!-- Dynamic -->
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    RepositoryModule.render();

    document.getElementById('btnUploadModal').addEventListener('click', () => RepositoryModule.openUploadModal());
  },

  render() {
    const state = window.smartGovState;
    const grid = document.getElementById('repoGrid');
    if (!grid) return;

    if (state.repository.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:30px; color:var(--text-muted);"><p>Tiada fail tersimpan.</p></div>`;
      return;
    }

    grid.innerHTML = state.repository.map(doc => `
      <div class="repo-card" data-id="${doc.id}">
        <div class="repo-card-actions">
          <button class="btn btn-danger btn-icon del-file-btn" style="padding:2px 4px; border:none; background:rgba(0,0,0,0.05); color:var(--color-danger);"><i data-lucide="trash-2" style="width:12px;"></i></button>
        </div>
        <div class="repo-icon-wrapper pdf"><i data-lucide="file-text"></i></div>
        <div class="repo-title" title="${doc.tajuk}">${doc.tajuk}</div>
        <span class="badge badge-info" style="font-size:8px;">${doc.jenis}</span>
        <div class="repo-meta"><span>${doc.saiz}</span> &bull; <span>${doc.namaFail}</span></div>
        <a href="${doc.dataUrl}" download="${doc.namaFail}" class="btn btn-secondary" style="width:100%; padding:4px 8px; font-size:10px; margin-top:6px;">Muat Tunun</a>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();

    grid.querySelectorAll('.del-file-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('.repo-card').getAttribute('data-id');
        if (confirm('Padam fail ini daripada repositori?')) {
          const res = await fetch(`${API_URL}/repository`, {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, operator: state.currentOperator })
          });
          const data = await res.json();
          if (data.success) {
            showToast('Fail dipadam.', 'success');
            await refreshState();
            RepositoryModule.render();
          }
        }
      });
    });
  },

  openUploadModal() {
    const state = window.smartGovState;
    const html = `
      <form id="uploadForm">
        <div class="form-group">
          <label class="form-label">Keterangan Fail</label>
          <input type="text" id="uplTajuk" class="form-control" required placeholder="Cth: Slaid Laporan Unit ICT">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Jenis Fail</label>
            <select id="uplJenis" class="form-control">
              <option value="PDF">PDF</option>
              <option value="Excel">Excel</option>
              <option value="PowerPoint">PowerPoint</option>
              <option value="Gambar">Gambar</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Pilih Fail</label>
            <input type="file" id="uplFile" class="form-control" required style="padding:4px;">
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-success" id="btnUploadRun">Muat Naik</button>
        </div>
      </form>
    `;

    showModal('Muat Naik Lampiran', html);

    let fileData = '';
    let fileName = '';
    let fileSize = '';

    document.getElementById('uplFile').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      fileName = file.name;
      fileSize = file.size > 1024*1024 ? (file.size/(1024*1024)).toFixed(1)+' MB' : (file.size/1024).toFixed(0)+' KB';
      
      const r = new FileReader();
      r.onload = (evt) => { fileData = evt.target.result; };
      r.readAsDataURL(file);
    });

    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!fileData) return showToast('Sila tunggu fail dibaca.', 'warning');

      const payload = {
        tajuk: document.getElementById('uplTajuk').value.trim(),
        jenis: document.getElementById('uplJenis').value,
        namaFail: fileName, saiz: fileSize, dataUrl: fileData,
        muatNaikOleh: state.currentOperator, operator: state.currentOperator
      };

      const btn = document.getElementById('btnUploadRun');
      btn.disabled = true;
      btn.textContent = 'Memuat naik...';

      const res = await fetch(`${API_URL}/repository`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Fail disimpan.', 'success');
        closeModal();
        await refreshState();
        RepositoryModule.render();
      }
    });
  }
};


// ==========================================================================
// SPA Router Mapping & Navigational Setup
// ==========================================================================
const ROUTES = {
  'dashboard': DashboardModule.init,
  'meetings': MeetingsModule.init,
  'memo': MemoModule.init,
  'members': MembersModule.init,
  'attendance': AttendanceModule.init,
  'minutes': MinutesModule.init,
  'approval': ApprovalModule.init,
  'extract': ExtractModule.init,
  'repository': RepositoryModule.init,
  'monitoring': MonitoringModule.init,
  'search': SearchModule.init,
  'reports': ReportsModule.init,
  'audit': AuditModule.init
};

async function handleRouting() {
  const viewContainer = document.getElementById('viewContainer');
  if (!viewContainer) return;

  viewContainer.innerHTML = `
    <div class="loading-spinner-wrapper">
      <div class="spinner"></div>
      <p>Mengambil data terkini...</p>
    </div>
  `;

  await refreshState();

  let hash = window.location.hash.substring(1) || 'dashboard';
  let routeKey = hash;
  let queryParams = {};
  if (hash.includes('?')) {
    const parts = hash.split('?');
    routeKey = parts[0];
    const searchParams = new URLSearchParams(parts[1]);
    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value;
    }
  }

  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    if (item.getAttribute('data-view') === routeKey) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  const renderer = ROUTES[routeKey] || DashboardModule.init;
  
  try {
    renderer(viewContainer, queryParams);
  } catch (err) {
    console.error(`Error rendering route [${routeKey}]:`, err);
    viewContainer.innerHTML = `
      <div class="card">
        <h3 class="card-title text-danger"><i data-lucide="alert-triangle"></i> Ralat Paparan</h3>
        <p>Gagal memaparkan modul [${routeKey}]: ${err.message}</p>
        <button class="btn btn-primary mt-4" onclick="window.location.hash = 'dashboard'">Kembali</button>
      </div>
    `;
  }

  if (window.lucide) window.lucide.createIcons();
}

// Global System Event Initializer
document.addEventListener('DOMContentLoaded', async () => {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('smartgov-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  window.smartGovState.theme = savedTheme;
  
  if (themeToggleBtn) {
    themeToggleBtn.innerHTML = savedTheme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      window.smartGovState.theme = next;
      localStorage.setItem('smartgov-theme', next);
      themeToggleBtn.innerHTML = next === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
      if (window.lucide) window.lucide.createIcons();
    });
  }

  const operatorSelect = document.getElementById('operatorSelect');
  const operatorRoleBadge = document.getElementById('operatorRoleBadge');
  
  if (operatorSelect) {
    const savedOp = localStorage.getItem('smartgov-operator');
    if (savedOp) operatorSelect.value = savedOp;
    window.smartGovState.currentOperator = operatorSelect.value;
    
    const selectedOpt = operatorSelect.options[operatorSelect.selectedIndex];
    if (selectedOpt) operatorRoleBadge.textContent = selectedOpt.getAttribute('data-role');

    operatorSelect.addEventListener('change', () => {
      window.smartGovState.currentOperator = operatorSelect.value;
      localStorage.setItem('smartgov-operator', operatorSelect.value);
      const opt = operatorSelect.options[operatorSelect.selectedIndex];
      if (opt) operatorRoleBadge.textContent = opt.getAttribute('data-role');
      showToast(`Mod operasi ditukar ke: ${window.smartGovState.currentOperator}`, 'success');
      handleRouting();
    });
  }

  const modalCloseBtn = document.getElementById('globalModalCloseBtn');
  const modalBackdrop = document.getElementById('globalModalBackdrop');
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  const quickAddMeetingBtn = document.getElementById('quickAddMeetingBtn');
  if (quickAddMeetingBtn) {
    quickAddMeetingBtn.addEventListener('click', () => {
      window.location.hash = 'meetings';
    });
  }

  const globalHeaderSearch = document.getElementById('globalHeaderSearch');
  if (globalHeaderSearch) {
    globalHeaderSearch.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        const query = encodeURIComponent(globalHeaderSearch.value.trim());
        window.location.hash = `search?q=${query}`;
        globalHeaderSearch.value = '';
      }
    });
  }

  await refreshState();
  window.addEventListener('hashchange', handleRouting);
  handleRouting();
});

// Official Static Templates mapping for Quick loader
const GOV_TEMPLATES = {
  "Mesyuarat Pengurusan": {
    "a1": "Pengerusi mengucapkan salam dan memulakan mesyuarat dengan bacaan Ummul Kitab Al-Fatihah. Pengerusi mengucapkan terima kasih atas kehadiran semua ahli mesyuarat bagi membincangkan urusan tadbir urus Politeknik METrO Tasek Gelugor.",
    "a2": "Minit Mesyuarat Pengurusan Politeknik METrO Tasek Gelugor Bilangan 4 Tahun 2026 yang diadakan pada 28 Mei 2026 telah disahkan oleh mesyuarat tanpa pindaan.",
    "a3": "Mesyuarat mengambil maklum status maklum balas tindakan bagi perkara-perkara berbangkit daripada minit mesyuarat yang lalu. Unit-unit berkaitan diminta mengambil tindakan susulan segera.",
    "a4": "Pembentangan laporan prestasi oleh Ketua Jabatan Akademik (KJA), Ketua Jabatan Sokongan Akademik (KJSA) dan Ketua Unit Khidmat Pengurusan (UKP) berkaitan pencapaian bajet tahunan.",
    "a5": "Beberapa isu kebajikan staf dibangkitkan termasuk keperluan naik taraf kerusi pejabat dan penyediaan peranti komputer riba bagi fasa penggantian seterusnya.",
    "a6": "Pengerusi merakamkan setinggi-tinggi penghargaan kepada semua ahli mesyuarat. Mesyuarat ditangguhkan pada jam 12:30 Tengah Hari dengan tasbih kaffarah."
  },
  "Mesyuarat Akademik": {
    "a1": "Pengerusi mengalu-alukan kehadiran semua jawatankuasa akademik PMTG. Pengerusi menekankan kepentingan mematuhi takwim akademik KPT dan memantau prestasi PDP pelajar Semester I.",
    "a2": "Minit Mesyuarat Akademik Bilangan 2 Tahun 2026 yang lepas dibentang dan disahkan secara rasmi.",
    "a3": "Perkara berbangkit mengenai kes kecurangan akademik pelajar peperiksaan akhir semester pendek telah diselesaikan secara tatatertib.",
    "a4": "Ketua Unit Peperiksaan membentangkan keputusan analisis peperiksaan pelajar bagi Sesi II: 2025/2026. Laporan menunjukkan peningkatan kadar kelulusan sebanyak 3%.",
    "a5": "Ketua Unit Pembelajaran Digital mencadangkan pengaktifan akaun Microsoft Teams bagi pensyarah sambilan luar.",
    "a6": "Pengerusi meminta pensyarah memastikan kualiti penilaian berterusan (PB) dipelihara. Mesyuarat ditangguhkan."
  },
  "Mesyuarat Kewangan": {
    "a1": "Pengerusi memulakan mesyuarat jawatankuasa kewangan PMTG dan mengingatkan supaya perolehan dibuat dengan mematuhi prinsip penjimatan dan ketelusan.",
    "a2": "Minit mesyuarat kewangan bertarikh 15 Jun 2026 disahkan tanpa pindaan.",
    "a3": "Isu kelewatan tuntutan perjalanan pensyarah telah diteliti dan sistem tuntutan e-claim kini berfungsi semula.",
    "a4": "Ketua Unit Perolehan membentangkan baki peruntukan semasa OS28. Bajet pembangunan masih berbaki RM50,000.",
    "a5": "Tuntutan kelulusan khas bagi pembelian unit penyaman udara baru makmal komputer dibincangkan.",
    "a6": "Pengerusi meminta urusetia mempercepatkan perbelanjaan sebelum suku tahun ke-4. Mesyuarat ditangguhkan."
  }
};
