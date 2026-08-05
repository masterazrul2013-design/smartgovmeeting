// Modul 5: Kehadiran Ahli & QR Attendance Simulator
export function initAttendance(container, params) {
  const state = window.smartGovState;

  if (state.meetings.length === 0) {
    container.innerHTML = `
      <div class="card">
        <h3 class="card-title text-danger"><i data-lucide="alert-triangle"></i> Tiada Rekod Mesyuarat</h3>
        <p>Sila daftar mesyuarat terlebih dahulu sebelum menguruskan kehadiran.</p>
        <button class="btn btn-primary mt-4" onclick="window.location.hash='#meetings'">Daftar Mesyuarat</button>
      </div>
    `;
    return;
  }

  let selectedMeeting = state.meetings[0];
  if (params.id) {
    selectedMeeting = state.meetings.find(m => m.id === params.id) || state.meetings[0];
  }

  renderAttendancePanel(container, selectedMeeting);
}

function renderAttendancePanel(container, meeting) {
  const state = window.smartGovState;
  const isLocked = meeting.status === 'Diluluskan';

  container.innerHTML = `
    <div class="page-title-section">
      <div>
        <h2 class="page-title">Pendaftaran Kehadiran</h2>
        <p class="page-subtitle">Urus status kehadiran ahli mesyuarat secara manual atau melalui imbasan kod QR</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <select id="attendanceMeetingSelect" class="form-control" style="width: 250px;">
          ${state.meetings.map(m => `
            <option value="${m.id}" ${m.id === meeting.id ? 'selected' : ''}>${m.nama} (Bil. ${m.bilangan}/${m.tahun})</option>
          `).join('')}
        </select>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 340px; gap: 24px;">
      
      <!-- Left: Attendance Sheet -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 class="card-title" style="margin-bottom: 0;"><i data-lucide="clipboard-check"></i> Senarai Kehadiran Ahli</h3>
          <span class="badge ${isLocked ? 'badge-danger' : 'badge-info'}">
            <i data-lucide="${isLocked ? 'lock' : 'edit-3'}" style="width:10px;height:10px;margin-right:4px;"></i>
            Status: ${meeting.status}
          </span>
        </div>

        <form id="attendanceForm">
          <div class="table-responsive" style="margin-bottom: 16px;">
            <table class="table">
              <thead>
                <tr>
                  <th>Nama & Jawatan</th>
                  <th>Unit</th>
                  <th>Kategori</th>
                  <th>Status Kehadiran</th>
                  <th>Sebab / Catatan (Jika Bersebab/Cuti)</th>
                </tr>
              </thead>
              <tbody>
                ${state.members.map(member => {
                  const status = meeting.kehadiran?.[member.id] || 'Hadir';
                  const sebab = meeting.tidakHadirSebab?.[member.id] || '';
                  
                  return `
                    <tr class="member-row" data-member-id="${member.id}">
                      <td>
                        <strong>${member.nama}</strong><br>
                        <span style="font-size:11px;color:var(--text-muted);">${member.jawatan}</span>
                      </td>
                      <td>${member.unit}</td>
                      <td><span class="badge badge-info" style="font-size:9px;">${member.kategori}</span></td>
                      <td>
                        <select class="form-control attendance-status-select" style="font-size:12px;padding:6px;width:120px;" ${isLocked ? 'disabled' : ''}>
                          <option value="Hadir" ${status === 'Hadir' ? 'selected' : ''}>Hadir</option>
                          <option value="Tidak Hadir" ${status === 'Tidak Hadir' ? 'selected' : ''}>Tidak Hadir</option>
                          <option value="Bersebab" ${status === 'Bersebab' ? 'selected' : ''}>Bersebab</option>
                          <option value="Cuti" ${status === 'Cuti' ? 'selected' : ''}>Cuti</option>
                          <option value="MC" ${status === 'MC' ? 'selected' : ''}>MC</option>
                        </select>
                      </td>
                      <td>
                        <input type="text" class="form-control attendance-reason-input" value="${sebab}" placeholder="Contoh: Mesyuarat Luar" style="font-size:12px;padding:6px;" ${isLocked ? 'disabled' : ''}>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button type="submit" class="btn btn-success" ${isLocked ? 'disabled' : ''}>
              <i data-lucide="save"></i> Simpan Senarai Kehadiran
            </button>
          </div>
        </form>
      </div>

      <!-- Right: QR Code & Simulator Portal -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- QR Panel -->
        <div class="card" style="text-align: center;">
          <h3 class="card-title" style="justify-content: center;"><i data-lucide="qr-code"></i> Imbasan QR Code</h3>
          <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 16px;">
            Pegawai boleh mengimbas kod QR ini menggunakan peranti mudah alih untuk mengesahkan kehadiran secara automatik.
          </p>
          
          <div style="display: flex; justify-content: center; margin-bottom: 12px;">
            <div id="attendanceQrCode" class="qr-code-placeholder" style="width: 180px; height: 180px; padding: 10px; background: white;"></div>
          </div>
          
          <span style="font-size: 10px; font-weight: bold; color: var(--text-muted); background: var(--bg-primary); padding: 4px 8px; border-radius: 99px;">
            PORT: 8092 / LOCALHOST
          </span>
        </div>

        <!-- Simulator Portal -->
        <div class="card no-print">
          <h3 class="card-title"><i data-lucide="smartphone"></i> Simulasi Imbas QR (Telefon)</h3>
          <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
            Gunakan panel simulasi ini untuk melakonkan imbasan QR oleh pegawai pilihan.
          </p>

          <div class="form-group">
            <label class="form-label" for="simPegawaiSelect">Pilih Pegawai Mengimbas</label>
            <select id="simPegawaiSelect" class="form-control" ${isLocked ? 'disabled' : ''}>
              <option value="">-- Pilih Pegawai --</option>
              ${state.members.map(m => `
                <option value="${m.id}">${m.nama}</option>
              `).join('')}
            </select>
          </div>

          <button class="btn btn-primary" id="simScanBtn" style="width: 100%;" ${isLocked ? 'disabled' : ''}>
            <i data-lucide="scan-line"></i> Lakonkan Imbasan QR
          </button>
        </div>

      </div>

    </div>
  `;

  // Init Lucide
  if (window.lucide) window.lucide.createIcons();

  // Dropdown navigation
  document.getElementById('attendanceMeetingSelect').addEventListener('change', (e) => {
    window.location.hash = `#attendance?id=${e.target.value}`;
  });

  // Render QR Code linking to Live scanner simulation URL
  const qrContainer = document.getElementById('attendanceQrCode');
  qrContainer.innerHTML = '';
  const scanLink = `${window.location.origin}/#attendance?id=${meeting.id}`;
  
  new QRCode(qrContainer, {
    text: scanLink,
    width: 160,
    height: 160,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.M
  });

  // Manual Attendance form submit handler
  document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const kehadiran = {};
    const tidakHadirSebab = {};

    document.querySelectorAll('.member-row').forEach(row => {
      const memberId = row.getAttribute('data-member-id');
      const status = row.querySelector('.attendance-status-select').value;
      const sebab = row.querySelector('.attendance-reason-input').value.trim();

      kehadiran[memberId] = status;
      if (sebab) {
        tidakHadirSebab[memberId] = sebab;
      }
    });

    const payload = {
      ...meeting,
      kehadiran,
      tidakHadirSebab,
      operator: state.currentOperator
    };

    try {
      const res = await fetch(`${window.location.origin}/api/meetings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        window.showToast('Senarai kehadiran berjaya disimpan.', 'success');
        // Reload cache
        await window.refreshState();
      } else {
        window.showToast('Gagal menyimpan kehadiran: ' + data.message, 'danger');
      }
    } catch (err) {
      console.error(err);
      window.showToast('Ralat sambungan server.', 'danger');
    }
  });

  // QR Scanning Simulator Button
  const simScanBtn = document.getElementById('simScanBtn');
  const simPegawaiSelect = document.getElementById('simPegawaiSelect');

  simScanBtn.addEventListener('click', async () => {
    const memberId = simPegawaiSelect.value;
    if (!memberId) {
      window.showToast('Sila pilih pegawai untuk melakukan simulasi imbasan.', 'warning');
      return;
    }

    const member = state.members.find(x => x.id === memberId);
    
    // Check if meeting attendance is already configured
    const currentKehadiran = meeting.kehadiran || {};
    currentKehadiran[memberId] = 'Hadir'; // Scan forces 'Hadir'

    const payload = {
      ...meeting,
      kehadiran: currentKehadiran,
      operator: member.nama // Log the action in audit log as performed by this scanning employee!
    };

    try {
      const res = await fetch(`${window.location.origin}/api/meetings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        window.showToast(`[QR SCAN] Kehadiran ${member.nama} berjaya disahkan secara simulasi!`, 'success');
        
        // Highlight row in list visually
        const row = document.querySelector(`.member-row[data-member-id="${memberId}"]`);
        if (row) {
          row.querySelector('.attendance-status-select').value = 'Hadir';
          row.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
          setTimeout(() => {
            row.style.backgroundColor = 'transparent';
          }, 1500);
        }

        // Reset selector
        simPegawaiSelect.value = '';
        
        // Refresh cache
        await window.refreshState();
      } else {
        window.showToast('Gagal melakonkan scan: ' + data.message, 'danger');
      }
    } catch (err) {
      console.error(err);
      window.showToast('Ralat server.', 'danger');
    }
  });
}
