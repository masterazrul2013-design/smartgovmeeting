// Modul 8: Cabutan Minit Mesyuarat (Feature Utama)
export function initExtract(container, params) {
  const state = window.smartGovState;

  if (state.meetings.length === 0) {
    container.innerHTML = `
      <div class="card">
        <h3 class="card-title text-danger"><i data-lucide="alert-triangle"></i> Tiada Rekod Mesyuarat</h3>
        <p>Sila daftar mesyuarat terlebih dahulu sebelum menjana cabutan minit.</p>
        <button class="btn btn-primary mt-4" onclick="window.location.hash='#meetings'">Daftar Mesyuarat</button>
      </div>
    `;
    return;
  }

  let selectedMeeting = state.meetings[0];
  if (params.id) {
    selectedMeeting = state.meetings.find(m => m.id === params.id) || state.meetings[0];
  }

  renderExtractPanel(container, selectedMeeting);
}

function renderExtractPanel(container, meeting) {
  const state = window.smartGovState;
  
  // Filter actions associated with this meeting
  const meetingActions = state.actions.filter(a => a.meetingId === meeting.id);

  container.innerHTML = `
    <div class="page-title-section no-print">
      <div>
        <h2 class="page-title">Cabutan Minit Mesyuarat</h2>
        <p class="page-subtitle">Modul 8: Penjanaan cabutan tindakan pegawai secara automatik tanpa taip semula</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <select id="extractMeetingSelect" class="form-control" style="width: 250px;">
          ${state.meetings.map(m => `
            <option value="${m.id}" ${m.id === meeting.id ? 'selected' : ''}>${m.nama} (Bil. ${m.bilangan}/${m.tahun})</option>
          `).join('')}
        </select>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 300px; gap: 24px;">
      
      <!-- Cabutan Minit Document Emulation -->
      <div class="card minute-print-preview" id="extractPrintArea" style="margin: 0; padding: 40px; background: white; color: black; box-shadow: var(--shadow-md); font-family: Arial, sans-serif;">
        
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid black; padding-bottom: 12px; margin-bottom: 24px;">
          <h2 style="font-size: 13pt; font-weight: bold; text-transform: uppercase; margin: 0;">CABUTAN MINIT MESYUARAT</h2>
          <h3 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; margin: 4px 0 0;">${meeting.nama.toUpperCase()}</h3>
          <span style="font-size: 10pt; font-weight: bold;">BIL. ${meeting.bilangan} TAHUN ${meeting.tahun}</span>
        </div>

        <!-- Metadata Mini Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt;">
          <tr>
            <td style="width: 100px; font-weight: bold; padding: 3px 0;">Tarikh Mesyuarat</td>
            <td style="width: 10px;">:</td>
            <td>${new Date(meeting.tarikh).toLocaleDateString('ms-MY', { day:'numeric', month:'long', year:'numeric' })}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 3px 0;">Tempat</td>
            <td>:</td>
            <td>${meeting.tempat}</td>
          </tr>
        </table>

        <!-- Actions Extract Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f1f5f9; border-top: 2px solid black; border-bottom: 2px solid black;">
              <th style="border: 1px solid black; padding: 8px; text-align: center; width: 40px; font-weight: bold;">Bil</th>
              <th style="border: 1px solid black; padding: 8px; text-align: left; width: 140px; font-weight: bold;">Agenda / Rujukan</th>
              <th style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">Keputusan / Tugasan Tindakan</th>
              <th style="border: 1px solid black; padding: 8px; text-align: left; width: 160px; font-weight: bold;">Pegawai Bertanggungjawab</th>
              <th style="border: 1px solid black; padding: 8px; text-align: center; width: 90px; font-weight: bold;">Tarikh Siap</th>
              <th style="border: 1px solid black; padding: 8px; text-align: center; width: 90px; font-weight: bold;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${meetingActions.length === 0 ? `
              <tr>
                <td colspan="6" style="border: 1px solid black; padding: 24px; text-align: center; color: #555; font-style: italic;">
                  Tiada tindakan atau tugasan pegawai yang direkodkan dalam minit mesyuarat ini.
                </td>
              </tr>
            ` : meetingActions.map((act, index) => {
              const dateFormatted = act.tarikhSiap 
                ? new Date(act.tarikhSiap).toLocaleDateString('ms-MY', { day:'numeric', month:'short', year:'numeric' }) 
                : '—';
              
              return `
                <tr>
                  <td style="border: 1px solid black; padding: 8px; text-align: center; vertical-align: top;">${index + 1}</td>
                  <td style="border: 1px solid black; padding: 8px; vertical-align: top; font-weight: bold;">
                    ${act.agendaTajuk.replace(/^\d+\.\s*/, '')}
                  </td>
                  <td style="border: 1px solid black; padding: 8px; vertical-align: top; text-align: justify;">
                    ${act.keputusan}
                    ${act.catatan ? `<br><span style="font-size: 8.5pt; color: #555; font-style: italic;">Catatan: ${act.catatan}</span>` : ''}
                  </td>
                  <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                    <strong>${act.pegawaiNama}</strong><br>
                    <span style="font-size: 8.5pt; color: #444;">${act.pegawaiUnit}</span>
                  </td>
                  <td style="border: 1px solid black; padding: 8px; text-align: center; vertical-align: top;">${dateFormatted}</td>
                  <td style="border: 1px solid black; padding: 8px; text-align: center; vertical-align: top; font-weight: bold; text-transform: uppercase;">
                    ${act.status}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Signature stamp -->
        <div style="margin-top: 36px; text-align: right; font-size: 10pt; font-family: Arial, sans-serif;">
          <p>Dikeluarkan oleh Urusetia,</p>
          <div style="margin: 8px 0; font-family: 'Courier New', Courier, monospace; font-weight: bold; font-size: 14pt; color: #64748b;">
            /SmartGovExtract/
          </div>
          <p><strong>Jabatan Sokongan Akademik PMTG</strong></p>
        </div>

      </div>

      <!-- Right Panel Controls -->
      <div class="card no-print" style="display: flex; flex-direction: column; gap: 16px; align-self: flex-start;">
        <h3 class="card-title"><i data-lucide="printer"></i> Eksport Cabutan</h3>
        
        <button class="btn btn-primary" id="printExtractBtn" style="width: 100%;" ${meetingActions.length === 0 ? 'disabled' : ''}>
          <i data-lucide="printer"></i> Cetak / Simpan PDF
        </button>

        <button class="btn btn-secondary" id="exportExtractWordBtn" style="width: 100%;" ${meetingActions.length === 0 ? 'disabled' : ''}>
          <i data-lucide="file-text"></i> Eksport ke MS Word
        </button>

        <div style="border-top: 1px solid var(--border-color); padding-top: 12px; font-size: 11px; color: var(--text-muted); line-height: 1.4;">
          <p>
            <i data-lucide="info" style="width:12px;height:12px;display:inline;margin-right:2px;"></i>
            Cabutan Minit adalah dokumen ringkas khusus yang menyenaraikan komitmen tindakan bagi memudahkan Unit/Pegawai menjalankan tugas tanpa merujuk minit penuh.
          </p>
        </div>
      </div>

    </div>
  `;

  // Init Lucide
  if (window.lucide) window.lucide.createIcons();

  // Dropdown navigation
  document.getElementById('extractMeetingSelect').addEventListener('change', (e) => {
    window.location.hash = `#extract?id=${e.target.value}`;
  });

  // Print handler
  const printExtractBtn = document.getElementById('printExtractBtn');
  if (printExtractBtn) {
    printExtractBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Word export handler
  const exportExtractWordBtn = document.getElementById('exportExtractWordBtn');
  if (exportExtractWordBtn) {
    exportExtractWordBtn.addEventListener('click', () => {
      const contentHtml = document.getElementById('extractPrintArea').innerHTML;
      const documentContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><title>Cabutan Minit Mesyuarat</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 10pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid black; padding: 6px; vertical-align: top; }
          th { background-color: #f1f5f9; font-weight: bold; }
        </style>
        </head>
        <body>
          ${contentHtml}
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff' + documentContent], {
        type: 'application/msword'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cabutan_Minit_${meeting.bilangan}_${meeting.tahun}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      window.showToast('Cabutan minit berjaya dieksport ke format MS Word.', 'success');
    });
  }
}
