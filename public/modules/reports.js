// Modul 13: Laporan Bulanan/Tahunan & Eksport Excel/PDF
export function initReports(container, params) {
  const state = window.smartGovState;

  container.innerHTML = `
    <div class="page-title-section no-print">
      <div>
        <h2 class="page-title">Penjanaan Laporan Mesyuarat</h2>
        <p class="page-subtitle">Modul 13: Analisis laporan berkala dan eksport dalam format Excel/PDF</p>
      </div>
    </div>

    <!-- Report generator filter panel -->
    <div class="card no-print" style="margin-bottom: 24px;">
      <h3 class="card-title"><i data-lucide="file-spreadsheet"></i> Tetapan Parameter Laporan</h3>
      <form id="reportGenerateForm">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="repType">Jenis Laporan</label>
            <select id="repType" class="form-control">
              <option value="mesyuarat">Ringkasan Kerap Kategori Mesyuarat</option>
              <option value="tindakan_unit">Prestasi Tindakan Mengikut Unit</option>
              <option value="tindakan_pegawai">Beban Tugasan Mengikut Pegawai</option>
              <option value="tindakan_status">Pecahan Status Tindakan & Overdue</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="repTahun">Tahun Laporan</label>
            <select id="repTahun" class="form-control">
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="repBulan">Bulan (Untuk Bulanan)</label>
            <select id="repBulan" class="form-control">
              <option value="semua">-- Semua Bulan --</option>
              <option value="0">Januari</option>
              <option value="1">Februari</option>
              <option value="2">Mac</option>
              <option value="3">April</option>
              <option value="4">Mei</option>
              <option value="5">Jun</option>
              <option value="6">Julai</option>
              <option value="7">Ogos</option>
              <option value="8">September</option>
              <option value="9">Oktober</option>
              <option value="10">November</option>
              <option value="11">Disember</option>
            </select>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:8px;">
          <button type="submit" class="btn btn-primary"><i data-lucide="refresh-cw"></i> Jana Laporan</button>
        </div>
      </form>
    </div>

    <!-- Report Render Area -->
    <div style="display: grid; grid-template-columns: 1fr 300px; gap: 24px;">
      
      <!-- Paper Render Area -->
      <div class="card minute-print-preview" id="reportPrintArea" style="margin: 0; padding: 40px; background: white; color: black; box-shadow: var(--shadow-md); font-family: Arial, sans-serif;">
        <!-- Filled dynamically -->
      </div>

      <!-- Export Panel Controls -->
      <div class="card no-print" style="display: flex; flex-direction: column; gap: 16px; align-self: flex-start;">
        <h3 class="card-title"><i data-lucide="download"></i> Eksport Laporan</h3>
        <button class="btn btn-primary" id="printReportBtn" style="width: 100%;">
          <i data-lucide="printer"></i> Cetak / Simpan PDF
        </button>
        <button class="btn btn-success" id="exportCsvBtn" style="width: 100%;">
          <i data-lucide="file-spreadsheet"></i> Eksport ke Excel (CSV)
        </button>
      </div>

    </div>
  `;

  // Init Lucide
  if (window.lucide) window.lucide.createIcons();

  // Initial generation
  generateReport();

  // Attach submit handler
  document.getElementById('reportGenerateForm').addEventListener('submit', (e) => {
    e.preventDefault();
    generateReport();
  });

  // Attach print
  document.getElementById('printReportBtn').addEventListener('click', () => {
    window.print();
  });

  // Attach CSV download
  document.getElementById('exportCsvBtn').addEventListener('click', () => {
    exportReportToCsv();
  });
}

// Generate report data based on selections
function generateReport() {
  const state = window.smartGovState;
  const repType = document.getElementById('repType').value;
  const year = document.getElementById('repTahun').value;
  const month = document.getElementById('repBulan').value;
  
  const reportPrintArea = document.getElementById('reportPrintArea');
  if (!reportPrintArea) return;

  const monthNames = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  const monthLabel = month === 'semua' ? 'Tahun' : monthNames[parseInt(month)];
  
  // Filter base datasets
  const filteredMeetings = state.meetings.filter(m => {
    const d = new Date(m.tarikh);
    const matchesYear = d.getFullYear().toString() === year;
    const matchesMonth = month === 'semua' || d.getMonth().toString() === month;
    return matchesYear && matchesMonth;
  });

  const matchedMeetingIds = filteredMeetings.map(m => m.id);
  const filteredActions = state.actions.filter(a => matchedMeetingIds.includes(a.meetingId));

  let reportTitle = '';
  let tableHtml = '';

  if (repType === 'mesyuarat') {
    reportTitle = `LAPORAN KERAP KATEGORI MESYUARAT ${monthLabel.toUpperCase()} ${year}`;
    
    // Group by category
    const counts = {};
    filteredMeetings.forEach(m => {
      counts[m.kategori] = (counts[m.kategori] || 0) + 1;
    });

    tableHtml = `
      <table style="width:100%; border-collapse:collapse; margin-top:20px; font-size:11pt;">
        <thead>
          <tr style="background:#f1f5f9; border-top:2px solid black; border-bottom:2px solid black;">
            <th style="border:1px solid black; padding:8px; text-align:left; font-weight:bold;">Bil</th>
            <th style="border:1px solid black; padding:8px; text-align:left; font-weight:bold;">Kategori Jawatankuasa</th>
            <th style="border:1px solid black; padding:8px; text-align:center; font-weight:bold; width:150px;">Bilangan Mesyuarat</th>
          </tr>
        </thead>
        <tbody>
          ${Object.keys(counts).length === 0 ? `
            <tr><td colspan="3" style="border:1px solid black; padding:12px; text-align:center; color:#555;">Tiada rekod mesyuarat ditemui.</td></tr>
          ` : Object.keys(counts).map((cat, idx) => `
            <tr>
              <td style="border:1px solid black; padding:8px; text-align:center;">${idx + 1}</td>
              <td style="border:1px solid black; padding:8px;">${cat}</td>
              <td style="border:1px solid black; padding:8px; text-align:center;"><strong>${counts[cat]}</strong></td>
            </tr>
          `).join('')}
          <tr style="font-weight:bold; background:#f8fafc;">
            <td colspan="2" style="border:1px solid black; padding:8px; text-align:right;">Jumlah Keseluruhan :</td>
            <td style="border:1px solid black; padding:8px; text-align:center;">${filteredMeetings.length}</td>
          </tr>
        </tbody>
      </table>
    `;
  } 
  
  else if (repType === 'tindakan_unit') {
    reportTitle = `LAPORAN PRESTASI TINDAKAN PEGAWAI MENGIKUT UNIT ${monthLabel.toUpperCase()} ${year}`;

    // Group actions by Unit
    const unitStats = {};
    // Seed all units found in members to show full picture
    state.members.forEach(m => {
      if (!unitStats[m.unit]) {
        unitStats[m.unit] = { done: 0, pending: 0, overdue: 0, total: 0 };
      }
    });

    filteredActions.forEach(a => {
      const unit = a.pegawaiUnit || 'Lain-lain';
      if (!unitStats[unit]) {
        unitStats[unit] = { done: 0, pending: 0, overdue: 0, total: 0 };
      }
      
      unitStats[unit].total++;
      if (a.status === 'Selesai') {
        unitStats[unit].done++;
      } else {
        unitStats[unit].pending++;
        const isOverdue = a.tarikhSiap && new Date(a.tarikhSiap) < new Date();
        if (isOverdue) unitStats[unit].overdue++;
      }
    });

    // Remove units that have 0 actions to keep report clean if wanted, or list all
    const activeUnits = Object.keys(unitStats).filter(u => unitStats[u].total > 0);

    tableHtml = `
      <table style="width:100%; border-collapse:collapse; margin-top:20px; font-size:10pt;">
        <thead>
          <tr style="background:#f1f5f9; border-top:2px solid black; border-bottom:2px solid black;">
            <th style="border:1px solid black; padding:8px; text-align:left; font-weight:bold;">Bil</th>
            <th style="border:1px solid black; padding:8px; text-align:left; font-weight:bold;">Nama Unit / Cawangan</th>
            <th style="border:1px solid black; padding:8px; text-align:center; font-weight:bold; width:90px;">Selesai (Hijau)</th>
            <th style="border:1px solid black; padding:8px; text-align:center; font-weight:bold; width:90px;">Tindakan (Kuning)</th>
            <th style="border:1px solid black; padding:8px; text-align:center; font-weight:bold; width:90px;">Overdue (Merah)</th>
            <th style="border:1px solid black; padding:8px; text-align:center; font-weight:bold; width:90px;">Jumlah</th>
            <th style="border:1px solid black; padding:8px; text-align:center; font-weight:bold; width:90px;">% Selesai</th>
          </tr>
        </thead>
        <tbody>
          ${activeUnits.length === 0 ? `
            <tr><td colspan="7" style="border:1px solid black; padding:12px; text-align:center; color:#555;">Tiada rekod tindakan komited bagi tempoh ini.</td></tr>
          ` : activeUnits.map((unit, idx) => {
            const stat = unitStats[unit];
            const rate = stat.total > 0 ? ((stat.done / stat.total) * 100).toFixed(0) + '%' : '0%';
            return `
              <tr>
                <td style="border:1px solid black; padding:8px; text-align:center;">${idx + 1}</td>
                <td style="border:1px solid black; padding:8px;"><strong>${unit}</strong></td>
                <td style="border:1px solid black; padding:8px; text-align:center; color:#10b981; font-weight:bold;">${stat.done}</td>
                <td style="border:1px solid black; padding:8px; text-align:center; color:#f59e0b; font-weight:bold;">${stat.pending}</td>
                <td style="border:1px solid black; padding:8px; text-align:center; color:#ef4444; font-weight:bold;">${stat.overdue}</td>
                <td style="border:1px solid black; padding:8px; text-align:center;"><strong>${stat.total}</strong></td>
                <td style="border:1px solid black; padding:8px; text-align:center; font-weight:bold; background:#f0fdf4;">${rate}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } 
  
  else if (repType === 'tindakan_pegawai') {
    reportTitle = `LAPORAN BEBAN TUGASAN & PRESTASI PEGAWAI ${monthLabel.toUpperCase()} ${year}`;

    // Group actions by Officer
    const pegStats = {};
    filteredActions.forEach(a => {
      const name = a.pegawaiNama || 'Tiada Nama';
      if (!pegStats[name]) {
        pegStats[name] = { done: 0, pending: 0, total: 0 };
      }
      pegStats[name].total++;
      if (a.status === 'Selesai') pegStats[name].done++;
      else pegStats[name].pending++;
    });

    tableHtml = `
      <table style="width:100%; border-collapse:collapse; margin-top:20px; font-size:10pt;">
        <thead>
          <tr style="background:#f1f5f9; border-top:2px solid black; border-bottom:2px solid black;">
            <th style="border:1px solid black; padding:8px; text-align:left; font-weight:bold;">Bil</th>
            <th style="border:1px solid black; padding:8px; text-align:left; font-weight:bold;">Nama Pegawai Bertanggungjawab</th>
            <th style="border:1px solid black; padding:8px; text-align:center; font-weight:bold; width:100px;">Tugasan Selesai</th>
            <th style="border:1px solid black; padding:8px; text-align:center; font-weight:bold; width:120px;">Tugasan Pending</th>
            <th style="border:1px solid black; padding:8px; text-align:center; font-weight:bold; width:100px;">Jumlah Beban</th>
          </tr>
        </thead>
        <tbody>
          ${Object.keys(pegStats).length === 0 ? `
            <tr><td colspan="5" style="border:1px solid black; padding:12px; text-align:center; color:#555;">Tiada beban tugasan dikesan dalam tempoh ini.</td></tr>
          ` : Object.keys(pegStats).map((name, idx) => {
            const stat = pegStats[name];
            return `
              <tr>
                <td style="border:1px solid black; padding:8px; text-align:center;">${idx + 1}</td>
                <td style="border:1px solid black; padding:8px;"><strong>${name}</strong></td>
                <td style="border:1px solid black; padding:8px; text-align:center;">${stat.done}</td>
                <td style="border:1px solid black; padding:8px; text-align:center;">${stat.pending}</td>
                <td style="border:1px solid black; padding:8px; text-align:center;"><strong>${stat.total}</strong></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } 
  
  else if (repType === 'tindakan_status') {
    reportTitle = `LAPORAN RINGKASAN STATUS KEPUTUSAN MINIT ${monthLabel.toUpperCase()} ${year}`;

    // Count status distribution
    let doneCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    filteredActions.forEach(a => {
      if (a.status === 'Selesai') doneCount++;
      else {
        pendingCount++;
        const isOverdue = a.tarikhSiap && new Date(a.tarikhSiap) < new Date();
        if (isOverdue) overdueCount++;
      }
    });

    tableHtml = `
      <table style="width:100%; border-collapse:collapse; margin-top:20px; font-size:11pt;">
        <thead>
          <tr style="background:#f1f5f9; border-top:2px solid black; border-bottom:2px solid black;">
            <th style="border:1px solid black; padding:8px; text-align:left; font-weight:bold;">Bil</th>
            <th style="border:1px solid black; padding:8px; text-align:left; font-weight:bold;">Status Tindakan</th>
            <th style="border:1px solid black; padding:8px; text-align:center; font-weight:bold; width:150px;">Bilangan Ulasan</th>
            <th style="border:1px solid black; padding:8px; text-align:center; font-weight:bold; width:150px;">Peratusan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid black; padding:8px; text-align:center;">1</td>
            <td style="border:1px solid black; padding:8px; color:#10b981; font-weight:bold;">Tindakan Selesai (Hijau)</td>
            <td style="border:1px solid black; padding:8px; text-align:center;">${doneCount}</td>
            <td style="border:1px solid black; padding:8px; text-align:center;">${filteredActions.length > 0 ? ((doneCount / filteredActions.length)*100).toFixed(1) + '%' : '0%'}</td>
          </tr>
          <tr>
            <td style="border:1px solid black; padding:8px; text-align:center;">2</td>
            <td style="border:1px solid black; padding:8px; color:#f59e0b; font-weight:bold;">Dalam Tindakan (Kuning)</td>
            <td style="border:1px solid black; padding:8px; text-align:center;">${pendingCount - overdueCount}</td>
            <td style="border:1px solid black; padding:8px; text-align:center;">${filteredActions.length > 0 ? (((pendingCount - overdueCount) / filteredActions.length)*100).toFixed(1) + '%' : '0%'}</td>
          </tr>
          <tr>
            <td style="border:1px solid black; padding:8px; text-align:center;">3</td>
            <td style="border:1px solid black; padding:8px; color:#ef4444; font-weight:bold;">Tunggakan / Overdue (Merah)</td>
            <td style="border:1px solid black; padding:8px; text-align:center;">${overdueCount}</td>
            <td style="border:1px solid black; padding:8px; text-align:center;">${filteredActions.length > 0 ? ((overdueCount / filteredActions.length)*100).toFixed(1) + '%' : '0%'}</td>
          </tr>
          <tr style="font-weight:bold; background:#f8fafc;">
            <td colspan="2" style="border:1px solid black; padding:8px; text-align:right;">Jumlah Keseluruhan :</td>
            <td style="border:1px solid black; padding:8px; text-align:center;">${filteredActions.length}</td>
            <td style="border:1px solid black; padding:8px; text-align:center;">100.0%</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // Inject content to Paper
  reportPrintArea.innerHTML = `
    <!-- Centered Header -->
    <div style="text-align: center; border-bottom: 2px solid black; padding-bottom: 12px; margin-bottom: 24px;">
      <h2 style="font-size: 13pt; font-weight: bold; text-transform: uppercase; margin: 0;">LAPORAN ANALIS KPI INTEGRASI PMTG</h2>
      <h3 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; margin: 4px 0 0;" id="reportPrintTitle">${reportTitle}</h3>
      <span style="font-size: 9pt; color:#444;">Politeknik METrO Tasek Gelugor - Kod Sistem: SmartGovMeeting</span>
    </div>

    <!-- Stats Summary Row -->
    <div style="display:flex; justify-content:space-between; margin-bottom:20px; font-size:10pt;">
      <div>Janaan Tarikh: <strong>${new Date().toLocaleDateString('ms-MY', { day:'numeric', month:'long', year:'numeric', hour:'numeric', minute:'numeric' })}</strong></div>
      <div>Pegawai Laporan: <strong>${state.currentOperator}</strong></div>
    </div>

    <!-- Data Table -->
    <div id="reportTableDataWrapper">
      ${tableHtml}
    </div>

    <div style="margin-top:40px; font-size:9pt; color:#666; font-style:italic;">
      Nota: Dokumen ini dijana secara automatik daripada portal pangkalan data SmartGovMeeting PMTG dan boleh dieksport sebagai format Excel atau fail PDF rasmi.
    </div>
  `;
}

// Convert table data to CSV and trigger file download
function exportReportToCsv() {
  const table = document.querySelector('#reportTableDataWrapper table');
  if (!table) {
    window.showToast('Tiada jadual laporan ditemui untuk dieksport!', 'warning');
    return;
  }

  const titleText = document.getElementById('reportPrintTitle').textContent.replace(/\s+/g, '_');
  
  let csvContent = [];
  const rows = table.querySelectorAll('tr');
  
  rows.forEach(row => {
    const cols = row.querySelectorAll('th, td');
    let rowContent = [];
    
    cols.forEach(col => {
      // Escape inner quotes and wrap in quotes
      let text = col.innerText.replace(/"/g, '""').trim();
      rowContent.push(`"${text}"`);
    });
    
    csvContent.push(rowContent.join(','));
  });

  const csvBlob = new Blob(['\ufeff' + csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(csvBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Laporan_${titleText}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  window.showToast('Laporan berjaya dieksport ke format Excel (CSV).', 'success');
}
