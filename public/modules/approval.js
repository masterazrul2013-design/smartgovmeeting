// Modul 11: Kelulusan, Penguncian (Lock) Minit & Penjanaan Cetak PDF
export function initApproval(container, params) {
  const state = window.smartGovState;

  if (state.meetings.length === 0) {
    container.innerHTML = `
      <div class="card">
        <h3 class="card-title text-danger"><i data-lucide="alert-triangle"></i> Tiada Rekod Mesyuarat</h3>
        <p>Sila daftar mesyuarat terlebih dahulu sebelum menyemak kelulusan.</p>
        <button class="btn btn-primary mt-4" onclick="window.location.hash='#meetings'">Daftar Mesyuarat</button>
      </div>
    `;
    return;
  }

  let selectedMeeting = state.meetings[0];
  if (params.id) {
    selectedMeeting = state.meetings.find(m => m.id === params.id) || state.meetings[0];
  }

  renderApprovalWorkflow(container, selectedMeeting);
}

function renderApprovalWorkflow(container, meeting) {
  const state = window.smartGovState;
  const currentOp = state.currentOperator;
  
  // Operators helper roles
  const isPengerusi = currentOp === "En. Mohd Yusaini bin Mohamed Ali";
  const isPenyemak = currentOp === "Pn. Norhasaliza binti Hassan";
  const isSetiausaha = currentOp === "Pn. Mashitah binti Osman";

  const pengerusiName = state.members.find(x => x.id === meeting.pengerusiId)?.nama || meeting.pengerusiId || 'Pengarah';
  const setiausahaName = state.members.find(x => x.id === meeting.setiausahaId)?.nama || meeting.setiausahaId || 'Setiausaha';
  const penyemakName = "Pn. Norhasaliza binti Hassan"; // Pre-assigned in template example

  // Status mapping
  const statusSteps = [
    { key: 'Draf', label: '1. Draf Minit', desc: 'Setiausaha sedang menulis' },
    { key: 'Selesai', label: '2. Selesai Ditulis', desc: 'Dihantar untuk semakan' },
    { key: 'Disemak', label: '3. Disemak', desc: 'Disahkan oleh Penyemak' },
    { key: 'Diluluskan', label: '4. Diluluskan & Kunci', desc: 'Ditandatangani & Minit Dikunci' }
  ];

  const currentStepIdx = statusSteps.findIndex(s => s.key === meeting.status);

  container.innerHTML = `
    <div class="page-title-section no-print">
      <div>
        <h2 class="page-title">Kelulusan & Cetakan Minit</h2>
        <p class="page-subtitle">Sahkan draf minit mesyuarat, kunci pengeditan dan jana fail PDF rasmi</p>
      </div>
      <div>
        <select id="approvalMeetingSelect" class="form-control" style="width: 250px;">
          ${state.meetings.map(m => `
            <option value="${m.id}" ${m.id === meeting.id ? 'selected' : ''}>${m.nama} (Bil. ${m.bilangan}/${m.tahun})</option>
          `).join('')}
        </select>
      </div>
    </div>

    <!-- Timeline Progress Bar -->
    <div class="card no-print" style="margin-bottom: 24px;">
      <h3 class="card-title" style="font-size:14px;"><i data-lucide="git-commit"></i> Alur Kerja Kelulusan Minit</h3>
      
      <div style="display: flex; justify-content: space-between; position: relative; margin: 24px 0 12px; padding: 0 40px;">
        <!-- Background line -->
        <div style="position: absolute; top: 14px; left: 60px; right: 60px; height: 3px; background-color: var(--border-color); z-index: 1;"></div>
        <!-- Colored active line -->
        <div style="position: absolute; top: 14px; left: 60px; width: ${currentStepIdx * 33.3}%; height: 3px; background-color: var(--color-success); z-index: 2; transition: width 0.3s ease;"></div>
        
        ${statusSteps.map((step, idx) => {
          const isActive = idx <= currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          let circleBg = 'var(--bg-primary)';
          let border = '2px solid var(--border-color)';
          let color = 'var(--text-muted)';
          
          if (isActive) {
            circleBg = 'var(--color-success)';
            border = '2px solid var(--color-success)';
            color = 'var(--text-primary)';
          }
          if (isCurrent) {
            circleBg = 'var(--bg-secondary)';
            border = '3px solid var(--color-primary)';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; z-index: 3; width: 120px; text-align: center;">
              <div style="width: 30px; height: 30px; border-radius: 50%; background-color: ${circleBg}; border: ${border}; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; color: ${isActive && !isCurrent ? 'white' : color};">
                ${isActive && !isCurrent ? '✓' : idx + 1}
              </div>
              <span style="font-size: 12px; font-weight: 600; margin-top: 8px; color: ${color};">${step.label}</span>
              <span style="font-size: 10px; color: var(--text-muted);">${step.desc}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Actions Control Panel based on user role -->
    <div class="card no-print" style="margin-bottom: 24px; border-left: 4px solid var(--color-primary);">
      <h3 class="card-title"><i data-lucide="shield-alert"></i> Panel Tindakan Kelulusan (Mod: ${currentOp})</h3>
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <p style="font-size: 13px;">
            Status Semasa Minit: <strong><span class="badge badge-info">${meeting.status}</span></strong>
          </p>
          <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            ${meeting.status === 'Diluluskan' 
              ? 'Minit ini telah LULUS dan DIKUNCI secara rasmi. Tiada lagi perubahan kandungan boleh dibuat.' 
              : 'Anda boleh menukar status kelulusan di sebelah kanan mengikut peranan anda.'}
          </p>
        </div>

        <div style="display: flex; gap: 8px;">
          ${meeting.status === 'Draf' && isSetiausaha ? `
            <button class="btn btn-primary" id="btnSubmitReview"><i data-lucide="send"></i> Hantar Semakan</button>
          ` : ''}
          
          ${meeting.status === 'Selesai' && isPenyemak ? `
            <button class="btn btn-warning" id="btnApproveVerify"><i data-lucide="check-square"></i> Sahkan & Tanda Disemak</button>
          ` : ''}

          ${meeting.status === 'Disemak' && isPengerusi ? `
            <button class="btn btn-success" id="btnLockApprove"><i data-lucide="lock"></i> Lulus & Kunci Minit</button>
          ` : ''}

          ${meeting.status === 'Diluluskan' ? `
            <button class="btn btn-primary" onclick="window.print()"><i data-lucide="printer"></i> Cetak / Simpan PDF</button>
          ` : `
            <button class="btn btn-secondary" id="btnPreviewPrint"><i data-lucide="eye"></i> Paparan Cetakan</button>
          `}
        </div>
      </div>
    </div>

    <!-- Official Government Minute Document Render View (A4 Paper emulation) -->
    <div class="minute-print-preview" id="minutesPrintArea">
      <!-- Generated dynamically -->
    </div>
  `;

  // Render minutes document inside paper wrapper
  renderOfficialMinutesDocument(meeting);

  // Init Lucide
  if (window.lucide) window.lucide.createIcons();

  // Dropdown navigation
  document.getElementById('approvalMeetingSelect').addEventListener('change', (e) => {
    window.location.hash = `#approval?id=${e.target.value}`;
  });

  // Action listeners
  const btnSubmitReview = document.getElementById('btnSubmitReview');
  const btnApproveVerify = document.getElementById('btnApproveVerify');
  const btnLockApprove = document.getElementById('btnLockApprove');
  const btnPreviewPrint = document.getElementById('btnPreviewPrint');

  if (btnSubmitReview) {
    btnSubmitReview.addEventListener('click', () => updateStatus('Selesai', 'Hantar Semakan', 'Minit selesai ditulis oleh Setiausaha dan dihantar untuk semakan.'));
  }
  if (btnApproveVerify) {
    btnApproveVerify.addEventListener('click', () => updateStatus('Disemak', 'Sahkan Minit', 'Minit disemak dan disahkan oleh Ketua Jabatan Sokongan Akademik (Penyemak).'));
  }
  if (btnLockApprove) {
    btnLockApprove.addEventListener('click', () => updateStatus('Diluluskan', 'Lulus & Kunci Minit', 'Minit diluluskan dan dikunci secara rasmi oleh Pengarah (Pengerusi).'));
  }
  if (btnPreviewPrint) {
    btnPreviewPrint.addEventListener('click', () => {
      window.print();
    });
  }

  async function updateStatus(newStatus, actionLabel, actionDetail) {
    const payload = {
      ...meeting,
      status: newStatus,
      operator: currentOp
    };

    // Apply timestamps based on steps
    const now = new Date().toLocaleDateString('ms-MY', { day:'numeric', month:'short', year:'numeric' }).toUpperCase();
    if (newStatus === 'Selesai') {
      payload.tarikhSedia = now;
      payload.disediakanOleh = currentOp;
    }
    if (newStatus === 'Disemak') {
      payload.tarikhSemak = now;
      payload.disemakOleh = currentOp;
    }
    if (newStatus === 'Diluluskan') {
      payload.tarikhSah = now;
      payload.disahkanOleh = currentOp;
    }

    try {
      const res = await fetch(`${window.location.origin}/api/meetings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        window.showToast(`Minit berjaya dikemaskini status: ${newStatus}`, 'success');
        // Refresh cache and view
        await window.refreshState();
        renderApprovalWorkflow(container, data.meeting);
      } else {
        window.showToast('Gagal menukar status: ' + data.message, 'danger');
      }
    } catch (e) {
      console.error(e);
      window.showToast('Ralat sambungan pelayan.', 'danger');
    }
  }
}

// Logic to render official Malaysian government minute document format
function renderOfficialMinutesDocument(meeting) {
  const state = window.smartGovState;
  const paper = document.getElementById('minutesPrintArea');
  if (!paper) return;

  const pengerusi = state.members.find(x => x.id === meeting.pengerusiId);
  const setiausaha = state.members.find(x => x.id === meeting.setiausahaId);
  const dateObj = new Date(meeting.tarikh);
  
  const days = ['AHAD', 'ISNIN', 'SELASA', 'RABU', 'KHAMIS', 'JUMAAT', 'SABTU'];
  const months = ['JAN', 'FEB', 'MAC', 'APR', 'MEI', 'JUN', 'JUL', 'OGOS', 'SEPT', 'OKT', 'NOV', 'DIS'];
  
  const dayName = days[dateObj.getDay()];
  const dateFormatted = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()} (${dayName})`;

  // Kehadiran Table Rows (pre-seeded names selected as Hadir)
  // Let's filter members who are marked 'Hadir' (default to present if not set)
  const hadirList = [];
  const tidakHadirList = [];
  
  state.members.forEach(m => {
    const status = meeting.kehadiran?.[m.id] || 'Hadir';
    if (status === 'Hadir') {
      hadirList.push(m);
    } else {
      tidakHadirList.push(m);
    }
  });

  // Sort attendance list so Chairman is first, Secretary is last, others in middle
  hadirList.sort((a, b) => {
    if (a.id === meeting.pengerusiId) return -1;
    if (b.id === meeting.pengerusiId) return 1;
    if (a.id === meeting.setiausahaId) return 1;
    if (b.id === meeting.setiausahaId) return -1;
    return 0;
  });

  // Calculate paragraph numbers sequentially across all sections (killing detail!)
  let paragraphCounter = 1;

  let bodyHtml = `
    <!-- Centered Header -->
    <div class="print-header">
      <h2 class="print-title">MINIT ${meeting.nama.toUpperCase()}</h2>
      <h3 class="print-bilangan">BIL. ${meeting.bilangan} TAHUN ${meeting.tahun}</h3>
    </div>

    <!-- Metadata Section -->
    <table class="print-meta-table">
      <tr>
        <td class="meta-label">Tarikh</td>
        <td style="width: 15px;">:</td>
        <td><strong>${dateFormatted}</strong></td>
      </tr>
      <tr>
        <td class="meta-label">Masa</td>
        <td>:</td>
        <td><strong>${meeting.masa}</strong></td>
      </tr>
      <tr>
        <td class="meta-label">Tempat</td>
        <td>:</td>
        <td><strong>${meeting.tempat}</strong></td>
      </tr>
    </table>

    <div class="print-section-title">KEHADIRAN :</div>
    
    <!-- Kehadiran Table -->
    <table class="print-kehadiran-table">
      ${hadirList.map((m, idx) => {
        let roleCol = '';
        if (m.id === meeting.pengerusiId) {
          roleCol = '- Pengerusi';
        } else if (m.id === meeting.setiausahaId) {
          roleCol = '- Pencatat Minit';
        }

        return `
          <tr>
            <td class="col-num">${idx + 1}.</td>
            <td class="col-role">
              ${m.jawatan}<br>
              <span style="font-weight: normal; font-size: 10pt; color: #333;">${m.nama}</span>
            </td>
            <td class="col-pengerusi">${roleCol}</td>
          </tr>
        `;
      }).join('')}
    </table>

    <!-- Tidak Hadir Section -->
    <div class="print-section-title">TIDAK HADIR DENGAN MAAF :</div>
    <ul style="margin-left: 24px; margin-bottom: 24px; font-size: 11pt; list-style-type: disc;">
      ${tidakHadirList.length === 0 ? '<li>Tiada -</li>' : tidakHadirList.map(m => {
        const status = meeting.kehadiran?.[m.id] || 'Tidak Hadir';
        const sebab = meeting.tidakHadirSebab?.[m.id] ? `(${meeting.tidakHadirSebab[m.id]})` : '';
        return `
          <li style="margin-bottom:4px;">
            <strong>${m.nama}</strong> - ${m.jawatan} <span style="font-size:10pt;color:#555;">[${status} ${sebab}]</span>
          </li>
        `;
      }).join('')}
    </ul>

    <div class="print-section-title" style="border-bottom:1px solid black; padding-bottom:4px; margin-bottom:16px;">AGENDA MESYUARAT</div>
  `;

  // Render Agendas & Paragraphs
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  
  meeting.agenda.forEach((ag, index) => {
    const roman = romanNumerals[index] || (index + 1).toString();
    const minitObj = meeting.minit?.[ag.id];
    const rawText = minitObj?.text || 'Tiada catatan ulasan bertulis.';
    const tindakanList = minitObj?.tindakan || [];

    bodyHtml += `
      <div style="font-weight: bold; text-transform: uppercase; font-size: 11pt; margin-top: 24px; margin-bottom: 12px;">
        ${roman}. &nbsp; <u>${ag.tajuk}</u>
      </div>
    `;

    // Split text into paragraphs by double newlines or single newlines
    // Clean up empty lines
    const paragraphs = rawText.split('\n').map(p => p.trim()).filter(p => p.length > 0);

    if (paragraphs.length === 0) {
      bodyHtml += `
        <div class="print-agenda-row">
          <div class="print-agenda-text">
            <span>Tiada ulasan dilaporkan.</span>
          </div>
          <div class="print-agenda-action">Makluman</div>
        </div>
      `;
    } else {
      paragraphs.forEach((pText) => {
        // Build right aligned action text
        // Usually "Makluman" or "Tindakan: [Unit/Pegawai]"
        // We check if this agenda has actions, and map them if possible
        let actionLabel = 'Makluman';
        
        // Find if any action item's keputusan details are closely related, or just display the assigned officers
        if (tindakanList.length > 0) {
          // Join the unit/officer names responsible
          const units = [...new Set(tindakanList.map(t => t.pegawaiUnit || 'Pegawai'))];
          actionLabel = `Tindakan:<br>${units.join('<br>')}`;
        }

        // Special case: II. Pengesahan Minit doesn't have paragraph numbers in template example!
        // We will skip numbering only if the agenda is Pengesahan Minit
        const isPengesahan = ag.tajuk.toLowerCase().includes('pengesahan');
        const numLabel = isPengesahan ? '' : `${paragraphCounter}. &nbsp; `;

        bodyHtml += `
          <div class="print-agenda-row">
            <div class="print-agenda-text" style="display:flex; align-items:flex-start;">
              ${isPengesahan ? '' : `<span style="font-weight:bold; min-width:30px; display:inline-block;">${paragraphCounter}.</span>`}
              <span style="flex:1; text-align:justify;">${pText}</span>
            </div>
            <div class="print-agenda-action">${actionLabel}</div>
          </div>
        `;

        if (!isPengesahan) {
          paragraphCounter++;
        }
      });
    }
  });

  // Ucapan Penutup Section
  bodyHtml += `
    <div style="font-weight: bold; text-transform: uppercase; font-size: 11pt; margin-top: 24px; margin-bottom: 12px;">
      ${romanNumerals[meeting.agenda.length] || 'XI'}. &nbsp; <u>UCAPAN PENUTUP</u>
    </div>
    <div class="print-agenda-row">
      <div class="print-agenda-text" style="display:flex; align-items:flex-start;">
        <span style="font-weight:bold; min-width:30px; display:inline-block;">${paragraphCounter}.</span>
        <span style="flex:1; text-align:justify;">${meeting.ucapanPenutup || 'Pengerusi menangguhkan mesyuarat dengan ucapan terima kasih.'}</span>
      </div>
      <div class="print-agenda-action">Makluman</div>
    </div>
  `;

  // Signatures stack in 3 columns (Disediakan, Disemak, Disahkan)
  const isLocked = meeting.status === 'Diluluskan';

  bodyHtml += `
    <div class="print-signatures-grid" style="border-top:1px solid #ccc; padding-top:20px;">
      <div class="signature-column">
        <span class="signature-title">Disediakan Oleh:</span>
        <div style="margin-bottom: 40px; font-family: 'Courier New', Courier, monospace; font-size: 11pt; color: #555;">
          ${meeting.tarikhSedia ? `[Tandatangan Digital]<br>Tarikh: ${meeting.tarikhSedia}` : '<em>Belum Disediakan</em>'}
        </div>
        <div class="signature-line"></div>
        <span class="signature-name">(${meeting.disediakanOleh ? state.members.find(x => x.nama === meeting.disediakanOleh)?.nama || meeting.disediakanOleh : setiausahaName})</span>
        <span>Pencatat Minit Mesyuarat</span>
        <span>Politeknik METrO Tasek Gelugor</span>
      </div>

      <div class="signature-column">
        <span class="signature-title">Disemak Oleh:</span>
        <div style="margin-bottom: 40px; font-family: 'Courier New', Courier, monospace; font-size: 11pt; color: #555;">
          ${meeting.tarikhSemak ? `[Tandatangan Digital]<br>Tarikh: ${meeting.tarikhSemak}` : '<em>Belum Disemak</em>'}
        </div>
        <div class="signature-line"></div>
        <span class="signature-name">(${meeting.disemakOleh ? state.members.find(x => x.nama === meeting.disemakOleh)?.nama || meeting.disemakOleh : penyemakName})</span>
        <span>Ketua Jabatan Sokongan Akademik</span>
        <span>Politeknik METrO Tasek Gelugor</span>
      </div>

      <div class="signature-column">
        <span class="signature-title">Disahkan Oleh:</span>
        <div style="margin-bottom: 40px; font-family: 'Courier New', Courier, monospace; font-size: 11pt; color: #555;">
          ${meeting.tarikhSah ? `[Tandatangan Digital]<br>Tarikh: ${meeting.tarikhSah}` : '<em>Belum Diluluskan</em>'}
        </div>
        <div class="signature-line"></div>
        <span class="signature-name">(${meeting.disahkanOleh ? state.members.find(x => x.nama === meeting.disahkanOleh)?.nama || meeting.disahkanOleh : pengerusiName})</span>
        <span>Pengarah</span>
        <span>Politeknik METrO Tasek Gelugor</span>
      </div>
    </div>
  `;

  paper.innerHTML = bodyHtml;
}
