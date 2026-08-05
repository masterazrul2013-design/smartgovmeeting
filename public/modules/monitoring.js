// Modul 9 & Modul 10: Pemantauan Tindakan & Simulasi Reminder (WhatsApp/Telegram/Email)
export function initMonitoring(container, params) {
  const state = window.smartGovState;

  // Track active filter for actions list
  let currentFilter = params.filter || 'semua'; // semua, overdue, pending, done

  container.innerHTML = `
    <div class="page-title-section no-print">
      <div>
        <h2 class="page-title">Pemantauan Tindakan & Reminder</h2>
        <p class="page-subtitle">Modul 9 & 10: Pemantauan tugasan pegawai, status tindakan dan simulasi peringatan</p>
      </div>
    </div>

    <!-- Modul 9: Color-coded cards that click-to-filter -->
    <div class="grid-cols-4 no-print" style="margin-bottom: 24px;">
      
      <div class="card stat-card stat-primary filter-card" data-filter="semua" style="cursor:pointer; border-bottom: 4px solid var(--color-primary);">
        <div class="stat-info">
          <span class="stat-value" id="countAll">0</span>
          <span class="stat-label">Semua Tindakan</span>
        </div>
        <div class="stat-icon"><i data-lucide="list"></i></div>
      </div>

      <div class="card stat-card stat-danger filter-card" data-filter="overdue" style="cursor:pointer; border-bottom: 4px solid var(--color-danger);">
        <div class="stat-info">
          <span class="stat-value text-danger" id="countOverdue">0</span>
          <span class="stat-label">Tunggakan (Overdue)</span>
        </div>
        <div class="stat-icon"><i data-lucide="alert-triangle"></i></div>
      </div>

      <div class="card stat-card stat-warning filter-card" data-filter="pending" style="cursor:pointer; border-bottom: 4px solid var(--color-warning);">
        <div class="stat-info">
          <span class="stat-value text-warning" id="countPending">0</span>
          <span class="stat-label">Dalam Tindakan</span>
        </div>
        <div class="stat-icon"><i data-lucide="clock"></i></div>
      </div>

      <div class="card stat-card stat-success filter-card" data-filter="done" style="cursor:pointer; border-bottom: 4px solid var(--color-success);">
        <div class="stat-info">
          <span class="stat-value text-success" id="countDone">0</span>
          <span class="stat-label">Tindakan Selesai</span>
        </div>
        <div class="stat-icon"><i data-lucide="check-circle-2"></i></div>
      </div>
    </div>

    <!-- Actions Monitor Table -->
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 class="card-title" style="margin-bottom:0;"><i data-lucide="check-square"></i> Senarai Tugasan Pegawai (<span id="filterLabel">Semua</span>)</h3>
        <span style="font-size: 11px; color: var(--text-muted);">Klik kad di atas untuk tapis secara pantas</span>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Rujukan Mesyuarat</th>
              <th>Tugasan / Keputusan</th>
              <th>Pegawai & Unit</th>
              <th>Tarikh Siap</th>
              <th>Status</th>
              <th>Keutamaan</th>
              <th style="text-align: right;" class="no-print">Tindakan</th>
            </tr>
          </thead>
          <tbody id="monitoringTableBody">
            <!-- Rendered dynamically -->
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Init Lucide
  if (window.lucide) window.lucide.createIcons();

  // Populate data
  updateMonitoringUI(currentFilter);

  // Attach filter-card clicks
  document.querySelectorAll('.filter-card').forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.getAttribute('data-filter');
      updateMonitoringUI(filter);
    });
  });
}

function updateMonitoringUI(filter) {
  const state = window.smartGovState;
  const tableBody = document.getElementById('monitoringTableBody');
  const filterLabel = document.getElementById('filterLabel');
  
  if (!tableBody) return;

  // Recalculate totals
  const total = state.actions.length;
  const done = state.actions.filter(a => a.status === 'Selesai').length;
  const pending = state.actions.filter(a => a.status === 'Dalam tindakan').length;
  const overdue = state.actions.filter(a => {
    if (a.status === 'Selesai') return false;
    if (!a.tarikhSiap) return false;
    return new Date(a.tarikhSiap) < new Date();
  }).length;

  document.getElementById('countAll').textContent = total;
  document.getElementById('countDone').textContent = done;
  document.getElementById('countPending').textContent = pending;
  document.getElementById('countOverdue').textContent = overdue;

  // Filter actions array
  let filtered = [...state.actions];
  if (filter === 'overdue') {
    filtered = state.actions.filter(a => a.status !== 'Selesai' && a.tarikhSiap && new Date(a.tarikhSiap) < new Date());
    filterLabel.textContent = 'Tunggakan / Overdue';
  } else if (filter === 'pending') {
    filtered = state.actions.filter(a => a.status === 'Dalam tindakan');
    filterLabel.textContent = 'Dalam Tindakan';
  } else if (filter === 'done') {
    filtered = state.actions.filter(a => a.status === 'Selesai');
    filterLabel.textContent = 'Tindakan Selesai';
  } else {
    filterLabel.textContent = 'Semua Tindakan';
  }

  // Visual selection outline on cards
  document.querySelectorAll('.filter-card').forEach(c => {
    if (c.getAttribute('data-filter') === filter) {
      c.style.transform = 'translateY(-4px)';
      c.style.boxShadow = 'var(--shadow-lg)';
    } else {
      c.style.transform = 'none';
      c.style.boxShadow = 'var(--shadow-sm)';
    }
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px 0;">
          Tiada tugasan ditemui bagi kategori tapis ini.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(act => {
    const isOverdue = act.status !== 'Selesai' && act.tarikhSiap && new Date(act.tarikhSiap) < new Date();
    
    let statusBadge = 'badge-warning';
    if (act.status === 'Selesai') statusBadge = 'badge-success';
    else if (isOverdue) statusBadge = 'badge-danger';

    let priorityBadge = 'badge-info';
    if (act.keutamaan === 'Tinggi') priorityBadge = 'badge-danger';
    if (act.keutamaan === 'Rendah') priorityBadge = 'badge-primary';

    const dateFormatted = act.tarikhSiap 
      ? new Date(act.tarikhSiap).toLocaleDateString('ms-MY', { day:'numeric', month:'short', year:'numeric' }) 
      : '—';

    return `
      <tr data-action-id="${act.id}">
        <td>
          <strong>${act.meetingNama}</strong><br>
          <span style="font-size:11px;color:var(--text-muted);">Bil. ${act.meetingBilangan}/${act.meetingTahun}</span>
        </td>
        <td style="max-width:320px;text-align:justify;">
          <strong>${act.agendaTajuk.replace(/^\d+\.\s*/, '')}</strong><br>
          <span style="font-size:12px;color:var(--text-secondary);">${act.keputusan}</span>
        </td>
        <td>
          <strong>${act.pegawaiNama}</strong><br>
          <span style="font-size:11px;color:var(--text-muted);">${act.pegawaiUnit}</span>
        </td>
        <td>
          <span style="color: ${isOverdue ? 'var(--color-danger)' : 'inherit'}; font-weight: ${isOverdue ? 'bold' : 'normal'};">
            ${dateFormatted}
          </span>
        </td>
        <td>
          <span class="badge ${statusBadge}">
            ${isOverdue ? 'OVERDUE' : act.status}
          </span>
        </td>
        <td><span class="badge ${priorityBadge}">${act.keutamaan || 'Sederhana'}</span></td>
        <td style="text-align: right;" class="no-print">
          <div style="display:inline-flex; gap:6px;">
            <button class="btn btn-secondary btn-icon status-change-btn" style="padding:6px 10px;" title="Kemas Kini Status">
              <i data-lucide="check-circle" style="width:14px;height:14px;"></i>
            </button>
            <button class="btn btn-primary btn-icon reminder-btn" style="padding:6px 10px;" title="Hantar Reminder (Modul 10)">
              <i data-lucide="bell" style="width:14px;height:14px;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();

  // Attach status change listener
  tableBody.querySelectorAll('.status-change-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('tr').getAttribute('data-action-id');
      const act = state.actions.find(x => x.id === id);
      if (act) openStatusModal(act);
    });
  });

  // Attach reminder trigger
  tableBody.querySelectorAll('.reminder-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('tr').getAttribute('data-action-id');
      const act = state.actions.find(x => x.id === id);
      if (act) openReminderModal(act);
    });
  });
}

function openStatusModal(action) {
  const modalHtml = `
    <form id="actionStatusForm">
      <div style="margin-bottom:16px;">
        <p><strong>Tugasan:</strong> ${action.keputusan}</p>
        <p style="margin-top:4px;"><strong>Pegawai:</strong> ${action.pegawaiNama} (${action.pegawaiUnit})</p>
      </div>

      <div class="form-group">
        <label class="form-label" for="actStatusSelect">Status Tugasan</label>
        <select id="actStatusSelect" class="form-control">
          <option value="Dalam tindakan" ${action.status === 'Dalam tindakan' ? 'selected' : ''}>Dalam tindakan (Kuning)</option>
          <option value="Selesai" ${action.status === 'Selesai' ? 'selected' : ''}>Selesai (Hijau)</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" for="actCatatanInput">Catatan Kemajuan / Lampiran Tindakan</label>
        <textarea id="actCatatanInput" class="form-control" rows="3" placeholder="Masukkan ulasan kemajuan atau pautan fail jika ada...">${action.catatan || ''}</textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
        <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Batal</button>
        <button type="submit" class="btn btn-success"><i data-lucide="save"></i> Simpan Status</button>
      </div>
    </form>
  `;

  window.showModal('Kemas Kini Status Tindakan', modalHtml);

  document.getElementById('actionStatusForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      id: action.id,
      status: document.getElementById('actStatusSelect').value,
      catatan: document.getElementById('actCatatanInput').value.trim(),
      operator: window.smartGovState.currentOperator
    };

    try {
      const res = await fetch(`${window.location.origin}/api/actions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        window.showToast('Status tindakan berjaya disimpan.', 'success');
        window.closeModal();
        // Refresh cache & view
        await window.refreshState();
        updateMonitoringUI(document.querySelector('.filter-card[style*="translateY"]').getAttribute('data-filter'));
      } else {
        window.showToast('Gagal menyimpan: ' + data.message, 'danger');
      }
    } catch (err) {
      console.error(err);
      window.showToast('Ralat sambungan pelayan.', 'danger');
    }
  });
}

function openReminderModal(action) {
  const member = window.smartGovState.members.find(x => x.id === action.pegawaiId) || {};
  const isOverdue = action.status !== 'Selesai' && action.tarikhSiap && new Date(action.tarikhSiap) < new Date();
  
  const modalHtml = `
    <form id="reminderModalForm">
      <div style="margin-bottom:16px;">
        <p><strong>Penerima:</strong> ${action.pegawaiNama} (${member.email || 'Tiada Emel'}, ${member.telefon || 'Tiada Telefon'})</p>
        <p style="margin-top:4px;"><strong>Tindakan:</strong> ${action.keputusan}</p>
        <p style="margin-top:4px;"><strong>Tarikh Siap:</strong> ${new Date(action.tarikhSiap).toLocaleDateString('ms-MY', {day:'numeric',month:'long',year:'numeric'})}</p>
      </div>

      <div class="form-group">
        <label class="form-label">Saluran Peringatan (Reminder Channel)</label>
        <div style="display:flex; gap:16px; margin-top:8px;">
          <label class="checkbox-label">
            <input type="radio" name="remChannel" value="WhatsApp" checked class="checkbox-input">
            <i data-lucide="message-square" style="width:14px;height:14px;display:inline;vertical-align:middle;"></i> WhatsApp
          </label>
          <label class="checkbox-label">
            <input type="radio" name="remChannel" value="Telegram" class="checkbox-input">
            <i data-lucide="send" style="width:14px;height:14px;display:inline;vertical-align:middle;"></i> Telegram
          </label>
          <label class="checkbox-label">
            <input type="radio" name="remChannel" value="Email" class="checkbox-input">
            <i data-lucide="mail" style="width:14px;height:14px;display:inline;vertical-align:middle;"></i> Emel Rasmi
          </label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="remIntervalSelect">Sela Peringatan (Interval)</label>
        <select id="remIntervalSelect" class="form-control">
          <option value="Tunggakan" ${isOverdue ? 'selected' : ''}>Peringatan Tunggakan (Overdue)</option>
          <option value="1 Hari" ${!isOverdue ? 'selected' : ''}>1 Hari Sebelum Tarikh Siap</option>
          <option value="3 Hari">3 Hari Sebelum Tarikh Siap</option>
          <option value="7 Hari">7 Hari Sebelum Tarikh Siap</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Kandungan Notifikasi (Auto-Generated)</label>
        <div id="reminderMessagePreview" style="background:#f1f5f9; border:1px solid #cbd5e1; padding:10px; border-radius: var(--border-radius-sm); font-size:11.5px; font-family: monospace; white-space: pre-wrap; color:#334155;">
          Loading preview...
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
        <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary" id="btnSendRealRem"><i data-lucide="bell-ring"></i> Hantar Notifikasi</button>
      </div>
    </form>
  `;

  window.showModal('Hantar Peringatan Pegawai (Modul 10)', modalHtml);

  // Message preview compiler
  const channelRadios = document.getElementsByName('remChannel');
  const intervalSelect = document.getElementById('remIntervalSelect');
  const previewDiv = document.getElementById('reminderMessagePreview');

  function updatePreview() {
    let channel = 'WhatsApp';
    for (let r of channelRadios) {
      if (r.checked) channel = r.value;
    }
    const interval = intervalSelect.value;
    const dateFormatted = new Date(action.tarikhSiap).toLocaleDateString('ms-MY', { day:'numeric', month:'long', year:'numeric'});

    let text = '';
    if (channel === 'Email') {
      text = `Kepada: ${member.email || 'pegawai@pmtg.edu.my'}\nSubjek: PERINGATAN TINDAKAN MINIT - ${action.meetingNama} (${interval})\n\nTuan/Puan,\nSila ambil tindakan segera bagi keputusan mesyuarat berikut:\nTugasan: ${action.keputusan}\nTarikh Siap: ${dateFormatted}\n\nUrusetia Mesyuarat PMTG.`;
    } else {
      // WhatsApp / Telegram
      text = `[PERINGATAN MESYUARAT PMTG - ${interval.toUpperCase()}]\n\nSalam sejahtera, ${action.pegawaiNama}. Sila maklum balas tindakan perenggan minit bagi mesyuarat:\n📌 ${action.meetingNama}\n📝 Tugasan: ${action.keputusan}\n📅 Tarikh Siap: ${dateFormatted}\n\nSila kemaskini status tugasan anda dalam portal SmartGovMeeting. Terima kasih.`;
    }
    previewDiv.textContent = text;
  }

  // Attach change hooks
  channelRadios.forEach(r => r.addEventListener('change', updatePreview));
  intervalSelect.addEventListener('change', updatePreview);
  updatePreview();

  // Handle reminder sending simulation
  document.getElementById('reminderModalForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    let channel = 'WhatsApp';
    for (let r of channelRadios) {
      if (r.checked) channel = r.value;
    }
    const interval = intervalSelect.value;

    const sendBtn = document.getElementById('btnSendRealRem');
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;margin-right:4px;"></span> Menghantar...';

    // Log this action to the server audit trail!
    const logDetails = `Hantar peringatan auto (${interval}) via ${channel} kepada ${action.pegawaiNama} (${action.pegawaiUnit}) untuk tugasan: "${action.keputusan.substring(0, 40)}..."`;
    
    // Call custom audit log saver on server
    try {
      // Simulate network delay for realistic experience
      await new Promise(r => setTimeout(r, 800));

      const res = await fetch(`${window.location.origin}/api/meetings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state.meetings.find(m => m.id === action.meetingId),
          operator: window.smartGovState.currentOperator // This logs to audit trail!
        })
      });

      // Write manual audit log entry on server by sending custom message or using api
      // Note: We simulate a successful send, and write log by editing a meeting or mock save
      // Let's create an audit entry via database modification
      const mockLogPayload = {
        id: action.meetingId,
        operator: `${window.smartGovState.currentOperator} (Sistem Reminder)`,
        status: state.meetings.find(m => m.id === action.meetingId).status
      };
      
      // We will update the meeting status or just mock and save to trigger log audit
      // The server will automatically write to audit logs if we perform a PUT.
      // So we can send a PUT request to meetings with operator set to the message!
      await fetch(`${window.location.origin}/api/meetings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state.meetings.find(m => m.id === action.meetingId),
          operator: `Notifikasi [${channel}] sent to ${action.pegawaiNama}`
        })
      });

      window.showToast(`[REMINDER] Notifikasi ${channel} (${interval}) berjaya dihantar kepada ${action.pegawaiNama}!`, 'success');
      window.closeModal();
      await window.refreshState();
    } catch (err) {
      console.error(err);
      window.showToast('Gagal menyambung ke server notifikasi.', 'danger');
      sendBtn.disabled = false;
    }
  });
}
