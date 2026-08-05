// Modul 15: Audit Trail Logger Viewer
export function initAudit(container, params) {
  const state = window.smartGovState;

  container.innerHTML = `
    <div class="page-title-section no-print">
      <div>
        <h2 class="page-title">Audit Trail & Log Aktiviti</h2>
        <p class="page-subtitle">Modul 15: Penjejakan sejarah pindaan data, rekod masa, alamat IP, dan operator perubahan</p>
      </div>
      <div>
        <button class="btn btn-secondary" id="refreshAuditBtn">
          <i data-lucide="refresh-cw"></i> Muat Semula Log
        </button>
      </div>
    </div>

    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; gap:16px;">
        <h3 class="card-title" style="margin-bottom:0;"><i data-lucide="shield-alert"></i> Log Pindaan Pangkalan Data</h3>
        <input type="text" id="auditSearchInput" class="form-control" placeholder="Cari berdasarkan nama operator atau tugasan..." style="max-width:320px;">
      </div>

      <div class="table-responsive">
        <table class="table" style="font-size:12px;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="width:180px;">Tarikh & Jam</th>
              <th style="width:200px;">Operator / Pegawai</th>
              <th style="width:130px;">Alamat IP</th>
              <th style="width:180px;">Tindakan</th>
              <th>Butiran Ringkas Perubahan</th>
            </tr>
          </thead>
          <tbody id="auditTableBody">
            <!-- Injected dynamically -->
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Render list
  renderAuditData();

  // Attach search
  const searchInput = document.getElementById('auditSearchInput');
  searchInput.addEventListener('input', () => {
    renderAuditData(searchInput.value.trim());
  });

  // Attach refresh
  document.getElementById('refreshAuditBtn').addEventListener('click', async () => {
    window.showToast('Mengambil data log audit terbaru...', 'info');
    await window.refreshState();
    renderAuditData(searchInput.value.trim());
  });
}

function renderAuditData(filterKeyword = '') {
  const state = window.smartGovState;
  const tableBody = document.getElementById('auditTableBody');
  if (!tableBody) return;

  const query = filterKeyword.toLowerCase();
  
  // Filter audit logs
  const filtered = state.auditLogs.filter(log => 
    log.user.toLowerCase().includes(query) ||
    log.action.toLowerCase().includes(query) ||
    log.details.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 24px 0; color:var(--text-muted);">
          Tiada log audit ditemui.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(log => {
    const dateFormatted = new Date(log.timestamp).toLocaleString('ms-MY', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    let actionColor = 'inherit';
    if (log.action.includes('Lulus')) actionColor = 'var(--color-success)';
    if (log.action.includes('Padam')) actionColor = 'var(--color-danger)';
    if (log.action.includes('Daftar')) actionColor = 'var(--color-primary)';

    return `
      <tr>
        <td><strong>${dateFormatted}</strong></td>
        <td>
          <strong>${log.user}</strong><br>
          <span style="font-size:10px; color:var(--text-muted);">ID: ${log.id.substring(0, 8)}</span>
        </td>
        <td><code style="background:var(--bg-primary); padding:2px 6px; border-radius:4px; font-size:11px;">${log.ip}</code></td>
        <td style="font-weight:bold; color: ${actionColor};">${log.action}</td>
        <td style="text-align:justify;">${log.details}</td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}
