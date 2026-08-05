// Modul 3: Memo Mesyuarat Automatik & Eksport
export function initMemo(container, params) {
  const state = window.smartGovState;

  if (state.meetings.length === 0) {
    container.innerHTML = `
      <div class="card">
        <h3 class="card-title text-danger"><i data-lucide="alert-triangle"></i> Tiada Rekod Mesyuarat</h3>
        <p>Sila daftar mesyuarat terlebih dahulu sebelum menjana memo.</p>
        <button class="btn btn-primary mt-4" onclick="window.location.hash='#meetings'">Daftar Mesyuarat</button>
      </div>
    `;
    return;
  }

  // Find selected meeting or default to first
  let selectedMeeting = state.meetings[0];
  if (params.id) {
    selectedMeeting = state.meetings.find(m => m.id === params.id) || state.meetings[0];
  }

  renderMemoSelector(container, selectedMeeting);
}

function renderMemoSelector(container, meeting) {
  const state = window.smartGovState;
  
  // Default values for memo inputs
  const pengerusi = state.members.find(x => x.id === meeting.pengerusiId)?.nama || meeting.pengerusiId || 'Tiada';
  const setiausaha = state.members.find(x => x.id === meeting.setiausahaId)?.nama || meeting.setiausahaId || 'Tiada';
  
  const dateFormatted = new Date(meeting.tarikh).toLocaleDateString('ms-MY', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).toUpperCase();

  // Create memo view HTML
  container.innerHTML = `
    <div class="page-title-section no-print">
      <div>
        <h2 class="page-title">Memo Jemputan Mesyuarat</h2>
        <p class="page-subtitle">Penjanaan surat jemputan rasmi secara automatik untuk ahli mesyuarat</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <select id="memoMeetingSelect" class="form-control" style="width: 250px;">
          ${state.meetings.map(m => `
            <option value="${m.id}" ${m.id === meeting.id ? 'selected' : ''}>${m.nama} (Bil. ${m.bilangan}/${m.tahun})</option>
          `).join('')}
        </select>
        <button class="btn btn-secondary" onclick="window.location.hash='#meetings'">
          <i data-lucide="settings"></i> Urus Mesyuarat
        </button>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 320px; gap: 24px;">
      
      <!-- Memo Paper Layout -->
      <div class="card minute-print-preview" id="memoPrintArea" style="margin: 0; padding: 48px; background: white; color: black; box-shadow: var(--shadow-md);">
        
        <!-- Header Rujukan -->
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid black; padding-bottom: 12px; margin-bottom: 20px; font-size: 11pt; font-family: Arial, sans-serif;">
          <div>
            <strong>POLITEKNIK METrO TASEK GELUGOR</strong><br>
            <span style="font-size: 9pt; color: #444;">Jalan Gelugor, 13300 Tasek Gelugor, Pulau Pinang</span>
          </div>
          <div style="text-align: right;">
            <strong>MEMO RASMI</strong><br>
            <span style="font-size: 9pt;">Ruj: PMTG/100-1/2/1 (${meeting.bilangan})</span>
          </div>
        </div>

        <!-- Memo Metadata -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 11pt;">
          <tr>
            <td style="width: 80px; font-weight: bold; padding: 4px 0;">KEPADA</td>
            <td style="width: 10px; padding: 4px 0;">:</td>
            <td style="padding: 4px 0;">Semua Ahli Jawatankuasa ${meeting.kategori}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">DARIPADA</td>
            <td style="padding: 4px 0;">:</td>
            <td style="padding: 4px 0;">Urusetia Mesyuarat PMTG (${setiausaha})</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">PERKARA</td>
            <td style="padding: 4px 0;">:</td>
            <td style="font-weight: bold; padding: 4px 0; text-transform: uppercase;">
              Jemputan ${meeting.nama} Bilangan ${meeting.bilangan} Tahun ${meeting.tahun}
            </td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">TARIKH</td>
            <td style="padding: 4px 0;">:</td>
            <td style="padding: 4px 0;">${dateFormatted}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">MASA</td>
            <td style="padding: 4px 0;">:</td>
            <td style="padding: 4px 0;">${meeting.masa}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">TEMPAT</td>
            <td style="padding: 4px 0;">:</td>
            <td style="padding: 4px 0;">${meeting.tempat}</td>
          </tr>
        </table>

        <!-- Memo Content -->
        <div style="font-family: Arial, sans-serif; font-size: 11pt; text-align: justify; margin-bottom: 20px;">
          <p style="margin-bottom: 12px;">Dengan hormatnya saya merujuk kepada perkara di atas.</p>
          <p style="margin-bottom: 16px;">
            2. Adalah dimaklumkan bahawa mesyuarat tersebut akan diadakan seperti ketentuan di atas untuk membincangkan agenda-agenda penting institusi. Kehadiran tuan/puan amatlah dihargai bagi melancarkan proses mesyuarat.
          </p>

          <strong style="display: block; margin-bottom: 8px;">AGENDA MESYUARAT:</strong>
          <ol style="margin-left: 20px; margin-bottom: 20px;">
            ${meeting.agenda.map(ag => `
              <li style="margin-bottom: 4px; font-weight: 500;">
                ${ag.tajuk}
                ${ag.subAgendas.length > 0 ? `
                  <ul style="margin-left: 20px; list-style-type: circle; font-weight: normal; font-size: 10pt; margin-top: 4px;">
                    ${ag.subAgendas.map(sub => `<li>${sub}</li>`).join('')}
                  </ul>
                ` : ''}
              </li>
            `).join('')}
          </ol>

          <strong style="display: block; margin-bottom: 8px;">ARAHAN & MAKLUMAN KHAS:</strong>
          <p id="memoArahanPreview" style="background-color: #f8fafc; border-left: 3px solid var(--color-primary); padding: 10px 14px; font-style: italic; font-size: 10pt; color: #475569; margin-bottom: 20px;">
            Sila bawa slaid laporan unit masing-masing dan hadir 10 minit sebelum mesyuarat bermula. Sila imbas QR Code kehadiran untuk pengesahan kehadiran secara pantas.
          </p>
        </div>

        <!-- Signature & QR Row -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 32px; font-family: Arial, sans-serif; font-size: 10pt;">
          <div>
            <p>Disediakan oleh,</p>
            <div style="margin: 8px 0; font-family: 'Courier New', Courier, monospace; font-size: 16pt; font-weight: bold; color: #3b82f6;">
              /MashitahOsman/
            </div>
            <p><strong>(${setiausaha})</strong></p>
            <p>Setiausaha Jawatankuasa PMTG</p>
          </div>
          
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <div id="memoQrCodeContainer" class="qr-code-placeholder" style="width: 100px; height: 100px; padding: 4px; border: 1px solid #ddd; background: white;"></div>
            <span style="font-size: 8px; color: #666; font-weight: bold;">Kehadiran Kod QR</span>
          </div>
        </div>

      </div>

      <!-- Right column controls -->
      <div class="card no-print" style="display: flex; flex-direction: column; gap: 16px; align-self: flex-start;">
        <h3 class="card-title"><i data-lucide="printer"></i> Panel Cetakan & Fail</h3>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" for="memoArahanInput">Edit Arahan Khas Memo</label>
          <textarea id="memoArahanInput" class="form-control" rows="4" style="font-size: 12px;">Sila bawa slaid laporan unit masing-masing dan hadir 10 minit sebelum mesyuarat bermula. Sila imbas QR Code kehadiran untuk pengesahan kehadiran secara pantas.</textarea>
        </div>

        <button class="btn btn-primary" id="printMemoBtn" style="width: 100%;">
          <i data-lucide="printer"></i> Cetak / Simpan PDF
        </button>

        <button class="btn btn-secondary" id="exportWordBtn" style="width: 100%;">
          <i data-lucide="file-text"></i> Eksport ke MS Word
        </button>

        <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 8px;">
          <p style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">
            <i data-lucide="info" style="width:12px;height:12px;display:inline;margin-right:2px;"></i>
            Nota: Cetakan PDF akan menyembunyikan semua kawalan panel navigasi sistem dan mengekalkan susun atur standard memo pejabat kerajaan.
          </p>
        </div>
      </div>

    </div>
  `;

  // Attach event handlers
  const memoMeetingSelect = document.getElementById('memoMeetingSelect');
  const memoArahanInput = document.getElementById('memoArahanInput');
  const memoArahanPreview = document.getElementById('memoArahanPreview');
  const printMemoBtn = document.getElementById('printMemoBtn');
  const exportWordBtn = document.getElementById('exportWordBtn');

  // Trigger icons
  if (window.lucide) window.lucide.createIcons();

  // Dropdown selector
  memoMeetingSelect.addEventListener('change', () => {
    window.location.hash = `#memo?id=${memoMeetingSelect.value}`;
  });

  // Real-time instruction editor
  memoArahanInput.addEventListener('input', () => {
    memoArahanPreview.textContent = memoArahanInput.value || "Tiada arahan khas.";
  });

  // Render QR Code linking to Live QR Attendance Simulator
  const qrContainer = document.getElementById('memoQrCodeContainer');
  qrContainer.innerHTML = ''; // Clear
  const attendanceLink = `${window.location.origin}/#attendance?id=${meeting.id}`;
  
  new QRCode(qrContainer, {
    text: attendanceLink,
    width: 92,
    height: 92,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });

  // Print button
  printMemoBtn.addEventListener('click', () => {
    window.print();
  });

  // Export to Word document simulation
  exportWordBtn.addEventListener('click', () => {
    const memoHtml = document.getElementById('memoPrintArea').innerHTML;
    const documentContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Memo Jemputan Mesyuarat</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11pt; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 4px; }
      </style>
      </head>
      <body>
        ${memoHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + documentContent], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Memo_Jemputan_Mesyuarat_Bil_${meeting.bilangan}_${meeting.tahun}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.showToast('Memo berjaya dieksport ke format MS Word.', 'success');
  });
}
