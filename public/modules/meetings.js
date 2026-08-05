// Modul 2 & Modul 6: Pengurusan Mesyuarat & Agenda
export function initMeetings(container, params) {
  const state = window.smartGovState;
  
  // Check if we are creating/editing a meeting
  if (params.action === 'new' || params.id) {
    renderMeetingForm(container, params.id);
    return;
  }

  // Render list of meetings
  renderMeetingList(container);
}

function renderMeetingList(container) {
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
              <tr>
                <td colspan="7" style="text-align: center; padding: 32px 0; color: var(--text-muted);">
                  <i data-lucide="info" style="width: 32px; height: 32px; margin-bottom: 8px;"></i>
                  <p>Tiada rekod mesyuarat ditemui. Sila daftar mesyuarat pertama anda.</p>
                </td>
              </tr>
            ` : state.meetings.map(m => {
              const pengerusi = state.members.find(x => x.id === m.pengerusiId)?.nama || m.pengerusiId || 'Tiada';
              const setiausaha = state.members.find(x => x.id === m.setiausahaId)?.nama || m.setiausahaId || 'Tiada';
              const dateFormatted = new Date(m.tarikh).toLocaleDateString('ms-MY', {
                day: 'numeric', month: 'long', year: 'numeric'
              });
              
              let statusBadgeClass = 'badge-info';
              if (m.status === 'Selesai') statusBadgeClass = 'badge-success';
              if (m.status === 'Diluluskan') statusBadgeClass = 'badge-success'; // locked
              if (m.status === 'Disemak') statusBadgeClass = 'badge-warning';
              if (m.status === 'Draf') statusBadgeClass = 'badge-danger';

              const isLocked = m.status === 'Diluluskan';

              return `
                <tr>
                  <td>
                    <strong>${m.nama}</strong><br>
                    <span style="font-size: 11px; color: var(--text-muted);">Bil. ${m.bilangan}/${m.tahun} | Kategori: ${m.kategori}</span>
                  </td>
                  <td>${dateFormatted}<br><span style="font-size: 11px; color: var(--text-muted);">${m.masa}</span></td>
                  <td>${m.tempat}</td>
                  <td>${pengerusi}</td>
                  <td>${setiausaha}</td>
                  <td>
                    <span class="badge ${statusBadgeClass}">
                      <i data-lucide="${isLocked ? 'lock' : 'edit-2'}" style="width: 10px; height: 10px; margin-right: 4px;"></i>
                      ${m.status}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px;">
                      <a href="#memo?id=${m.id}" class="btn btn-secondary btn-icon" title="Lihat/Generate Memo" style="padding: 6px 10px;">
                        <i data-lucide="mail" style="width: 14px; height: 14px;"></i>
                      </a>
                      <a href="#attendance?id=${m.id}" class="btn btn-secondary btn-icon" title="Kehadiran" style="padding: 6px 10px;">
                        <i data-lucide="qr-code" style="width: 14px; height: 14px;"></i>
                      </a>
                      <a href="#minutes?id=${m.id}" class="btn btn-secondary btn-icon" title="Catat Minit" style="padding: 6px 10px;">
                        <i data-lucide="file-text" style="width: 14px; height: 14px;"></i>
                      </a>
                      <button class="btn btn-primary btn-icon" onclick="window.location.hash='#meetings?id=${m.id}'" style="padding: 6px 10px;" ${isLocked ? 'disabled title="Minit dikunci"' : 'title="Edit Mesyuarat"'}>
                        <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
                      </button>
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

  // Attach button triggers
  document.getElementById('createNewMeetingBtn').addEventListener('click', () => {
    window.location.hash = '#meetings?action=new';
  });
}

function renderMeetingForm(container, meetingId) {
  const state = window.smartGovState;
  const isEdit = !!meetingId;
  
  let meeting = {
    nama: '', bilangan: '', tahun: new Date().getFullYear().toString(),
    tarikh: new Date().toISOString().split('T')[0], masa: '08:30 AM',
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
    if (found) meeting = JSON.parse(JSON.stringify(found)); // Deep clone
  }

  // Pre-seeded lists for dropdown selections
  const pengerusiList = state.members.filter(m => m.peranan === 'Pengerusi' || m.jawatan.includes('Pengarah'));
  const setiausahaList = state.members; 
  const allMembers = state.members;

  container.innerHTML = `
    <div class="page-title-section">
      <div>
        <h2 class="page-title">${isEdit ? 'Kemaskini Mesyuarat' : 'Daftar Mesyuarat Baru'}</h2>
        <p class="page-subtitle">Sila isi maklumat asas mesyuarat dan agenda rasmi di bawah.</p>
      </div>
      <div>
        <button class="btn btn-secondary" onclick="window.location.hash='#meetings'">
          <i data-lucide="arrow-left"></i> Kembali
        </button>
      </div>
    </div>

    <form id="meetingForm">
      <div class="grid-cols-3">
        <!-- Part 1: Maklumat Asas -->
        <div class="card" style="grid-column: span 2;">
          <h3 class="card-title"><i data-lucide="info"></i> Maklumat Asas Mesyuarat</h3>
          
          <div class="form-group">
            <label class="form-label" for="meetingNama">Nama Mesyuarat</label>
            <input type="text" id="meetingNama" class="form-control" value="${meeting.nama}" required placeholder="Contoh: Mesyuarat Pengurusan Politeknik METrO Tasek Gelugor">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="meetingBilangan">Bilangan Mesyuarat</label>
              <input type="text" id="meetingBilangan" class="form-control" value="${meeting.bilangan}" required placeholder="Contoh: 5">
            </div>
            <div class="form-group">
              <label class="form-label" for="meetingTahun">Tahun</label>
              <input type="text" id="meetingTahun" class="form-control" value="${meeting.tahun}" required placeholder="2026">
            </div>
            <div class="form-group">
              <label class="form-label" for="meetingKategori">Kategori Mesyuarat</label>
              <select id="meetingKategori" class="form-control">
                <option value="Mesyuarat Pengurusan" ${meeting.kategori === 'Mesyuarat Pengurusan' ? 'selected' : ''}>Mesyuarat Pengurusan</option>
                <option value="Mesyuarat Akademik" ${meeting.kategori === 'Mesyuarat Akademik' ? 'selected' : ''}>Mesyuarat Akademik</option>
                <option value="Mesyuarat Kewangan" ${meeting.kategori === 'Mesyuarat Kewangan' ? 'selected' : ''}>Mesyuarat Kewangan</option>
                <option value="Mesyuarat JPKA" ${meeting.kategori === 'Mesyuarat JPKA' ? 'selected' : ''}>Mesyuarat JPKA</option>
                <option value="Mesyuarat Kurikulum" ${meeting.kategori === 'Mesyuarat Kurikulum' ? 'selected' : ''}>Mesyuarat Kurikulum</option>
                <option value="Mesyuarat Senat" ${meeting.kategori === 'Mesyuarat Senat' ? 'selected' : ''}>Mesyuarat Senat</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="meetingTarikh">Tarikh</label>
              <input type="date" id="meetingTarikh" class="form-control" value="${meeting.tarikh}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="meetingMasa">Masa</label>
              <input type="text" id="meetingMasa" class="form-control" value="${meeting.masa}" placeholder="Contoh: 8.30 Pagi" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="meetingTempat">Tempat</label>
              <input type="text" id="meetingTempat" class="form-control" value="${meeting.tempat}" placeholder="Bilik Persidangan" required>
            </div>
          </div>
        </div>

        <!-- Part 2: Ahli Utama -->
        <div class="card">
          <h3 class="card-title"><i data-lucide="users"></i> Ahli Kuasa & Urusetia</h3>
          
          <div class="form-group">
            <label class="form-label" for="meetingPengerusi">Pengerusi Mesyuarat</label>
            <select id="meetingPengerusi" class="form-control" required>
              <option value="">-- Pilih Pengerusi --</option>
              ${allMembers.map(m => `
                <option value="${m.id}" ${meeting.pengerusiId === m.id ? 'selected' : ''}>${m.nama} (${m.jawatan})</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="meetingSetiausaha">Setiausaha (Penyemak Minit)</label>
            <select id="meetingSetiausaha" class="form-control" required>
              <option value="">-- Pilih Setiausaha --</option>
              ${allMembers.map(m => `
                <option value="${m.id}" ${meeting.setiausahaId === m.id ? 'selected' : ''}>${m.nama} (${m.jawatan})</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Urusetia / Urusan Fail</label>
            <div style="max-height: 140px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 8px; background-color: var(--bg-primary);">
              ${allMembers.map(m => {
                const checked = meeting.urusetiaIds.includes(m.id) ? 'checked' : '';
                return `
                  <div style="margin-bottom: 4px;">
                    <label class="checkbox-label" style="font-size: 11px;">
                      <input type="checkbox" class="urusetia-checkbox checkbox-input" value="${m.id}" ${checked}>
                      ${m.nama}
                    </label>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Part 3: Agenda & Sub-Agenda Setup (Modul 6) -->
      <div class="card" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 class="card-title" style="margin-bottom: 0;"><i data-lucide="layout-list"></i> Penyusunan Agenda & Sub-Agenda</h3>
          <button type="button" class="btn btn-secondary btn-icon" id="addAgendaRowBtn">
            <i data-lucide="plus-circle"></i> Tambah Agenda Utama
          </button>
        </div>

        <div id="agendaRowsWrapper">
          ${meeting.agenda.map((ag, idx) => `
            <div class="agenda-item-card" data-id="${ag.id}" style="border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 16px; margin-bottom: 16px; background-color: var(--bg-primary);">
              <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: 700; color: var(--color-primary); font-size: 14px;" class="agenda-num">${idx + 1}.</span>
                <input type="text" class="form-control agenda-title-input" value="${ag.tajuk}" placeholder="Tajuk Agenda (cth: Ucapan Aluan)" required style="flex: 1; background: var(--bg-secondary);">
                
                <button type="button" class="btn btn-secondary btn-icon add-sub-agenda-btn" style="padding: 6px 10px;" title="Tambah Sub-Agenda">
                  <i data-lucide="plus" style="width:14px;height:14px;"></i>
                </button>
                <button type="button" class="btn btn-danger btn-icon remove-agenda-btn" style="padding: 6px 10px;" title="Padam Agenda Ini">
                  <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
                </button>
              </div>

              <!-- Sub-agendas wrapper -->
              <div class="sub-agendas-wrapper" style="padding-left: 24px; display: flex; flex-direction: column; gap: 8px;">
                ${ag.subAgendas.map((sub, sIdx) => `
                  <div class="sub-agenda-row" style="display: flex; gap: 8px; align-items: center;">
                    <span style="font-size: 11px; font-weight: bold; color: var(--text-secondary); min-width: 24px;">${idx + 1}.${sIdx + 1}</span>
                    <input type="text" class="form-control sub-agenda-input" value="${sub}" placeholder="Butiran sub-agenda" style="flex: 1; background: var(--bg-secondary); padding: 6px 10px; font-size:12px;">
                    <button type="button" class="btn btn-secondary btn-icon remove-sub-agenda-btn" style="padding: 4px 8px;" title="Padam Sub-Agenda">
                      <i data-lucide="x" style="width:10px;height:10px;"></i>
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Action Footer -->
      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-bottom: 40px;">
        <button type="button" class="btn btn-secondary" onclick="window.location.hash='#meetings'">Batal</button>
        <button type="submit" class="btn btn-success"><i data-lucide="save"></i> Simpan Maklumat Mesyuarat</button>
      </div>
    </form>
  `;

  // Attach agenda row actions
  const agendaRowsWrapper = document.getElementById('agendaRowsWrapper');
  const addAgendaRowBtn = document.getElementById('addAgendaRowBtn');

  // Trigger icons
  if (window.lucide) window.lucide.createIcons();

  // Add primary agenda row
  addAgendaRowBtn.addEventListener('click', () => {
    const nextIdx = agendaRowsWrapper.children.length + 1;
    const agendaId = 'a-' + Date.now();
    const div = document.createElement('div');
    div.className = 'agenda-item-card';
    div.setAttribute('data-id', agendaId);
    div.style = 'border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 16px; margin-bottom: 16px; background-color: var(--bg-primary);';
    div.innerHTML = `
      <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 10px;">
        <span style="font-weight: 700; color: var(--color-primary); font-size: 14px;" class="agenda-num">${nextIdx}.</span>
        <input type="text" class="form-control agenda-title-input" placeholder="Tajuk Agenda" required style="flex: 1; background: var(--bg-secondary);">
        
        <button type="button" class="btn btn-secondary btn-icon add-sub-agenda-btn" style="padding: 6px 10px;" title="Tambah Sub-Agenda">
          <i data-lucide="plus" style="width:14px;height:14px;"></i>
        </button>
        <button type="button" class="btn btn-danger btn-icon remove-agenda-btn" style="padding: 6px 10px;" title="Padam Agenda Ini">
          <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
        </button>
      </div>
      <div class="sub-agendas-wrapper" style="padding-left: 24px; display: flex; flex-direction: column; gap: 8px;"></div>
    `;
    agendaRowsWrapper.appendChild(div);
    if (window.lucide) window.lucide.createIcons();
    attachAgendaItemListeners(div);
  });

  // Attach listeners to initial agenda rows
  Array.from(agendaRowsWrapper.children).forEach(attachAgendaItemListeners);

  function attachAgendaItemListeners(card) {
    const removeBtn = card.querySelector('.remove-agenda-btn');
    const addSubBtn = card.querySelector('.add-sub-agenda-btn');
    const subWrapper = card.querySelector('.sub-agendas-wrapper');

    removeBtn.addEventListener('click', () => {
      card.remove();
      // Renumber
      Array.from(agendaRowsWrapper.children).forEach((c, i) => {
        c.querySelector('.agenda-num').textContent = `${i + 1}.`;
        // Also update sub-agenda label indexes
        Array.from(c.querySelectorAll('.sub-agenda-row')).forEach((sRow, sIdx) => {
          sRow.querySelector('span').textContent = `${i + 1}.${sIdx + 1}`;
        });
      });
    });

    addSubBtn.addEventListener('click', () => {
      const idx = Array.from(agendaRowsWrapper.children).indexOf(card);
      const subIdx = subWrapper.children.length;
      const row = document.createElement('div');
      row.className = 'sub-agenda-row';
      row.style = 'display: flex; gap: 8px; align-items: center;';
      row.innerHTML = `
        <span style="font-size: 11px; font-weight: bold; color: var(--text-secondary); min-width: 24px;">${idx + 1}.${subIdx + 1}</span>
        <input type="text" class="form-control sub-agenda-input" placeholder="Butiran sub-agenda" style="flex: 1; background: var(--bg-secondary); padding: 6px 10px; font-size:12px;">
        <button type="button" class="btn btn-secondary btn-icon remove-sub-agenda-btn" style="padding: 4px 8px;" title="Padam Sub-Agenda">
          <i data-lucide="x" style="width:10px;height:10px;"></i>
        </button>
      `;
      subWrapper.appendChild(row);
      if (window.lucide) window.lucide.createIcons();

      row.querySelector('.remove-sub-agenda-btn').addEventListener('click', () => {
        row.remove();
        // Renumber sub-agendas in this card
        Array.from(subWrapper.children).forEach((sRow, sI) => {
          sRow.querySelector('span').textContent = `${idx + 1}.${sI + 1}`;
        });
      });
    });

    // Attach listeners to pre-existing sub-agenda rows
    card.querySelectorAll('.sub-agenda-row').forEach(row => {
      row.querySelector('.remove-sub-agenda-btn').addEventListener('click', () => {
        row.remove();
        const idx = Array.from(agendaRowsWrapper.children).indexOf(card);
        Array.from(subWrapper.children).forEach((sRow, sI) => {
          sRow.querySelector('span').textContent = `${idx + 1}.${sI + 1}`;
        });
      });
    });
  }

  // Handle Form Submission
  document.getElementById('meetingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Gather basic data
    const nama = document.getElementById('meetingNama').value.trim();
    const bilangan = document.getElementById('meetingBilangan').value.trim();
    const tahun = document.getElementById('meetingTahun').value.trim();
    const kategori = document.getElementById('meetingKategori').value;
    const tarikh = document.getElementById('meetingTarikh').value;
    const masa = document.getElementById('meetingMasa').value.trim();
    const tempat = document.getElementById('meetingTempat').value.trim();
    const pengerusiId = document.getElementById('meetingPengerusi').value;
    const setiausahaId = document.getElementById('meetingSetiausaha').value;
    
    // Gather urusetia
    const urusetiaIds = [];
    document.querySelectorAll('.urusetia-checkbox:checked').forEach(cb => {
      urusetiaIds.push(cb.value);
    });

    // Gather agendas & sub-agendas
    const agenda = [];
    Array.from(agendaRowsWrapper.children).forEach(card => {
      const id = card.getAttribute('data-id');
      const tajuk = card.querySelector('.agenda-title-input').value.trim();
      const subAgendas = [];
      card.querySelectorAll('.sub-agenda-input').forEach(subInput => {
        const val = subInput.value.trim();
        if (val) subAgendas.push(val);
      });
      agenda.push({ id, tajuk, subAgendas });
    });

    const payload = {
      nama, bilangan, tahun, kategori, tarikh, masa, tempat,
      pengerusiId, setiausahaId, urusetiaIds, agenda,
      operator: state.currentOperator
    };

    if (isEdit) {
      payload.id = meetingId;
      payload.status = meeting.status; // Keep status
      payload.kehadiran = meeting.kehadiran;
      payload.minit = meeting.minit;
      payload.tidakHadirSebab = meeting.tidakHadirSebab;
      payload.ucapanPenutup = meeting.ucapanPenutup;
      payload.disediakanOleh = meeting.disediakanOleh;
      payload.disemakOleh = meeting.disemakOleh;
      payload.disahkanOleh = meeting.disahkanOleh;
    }

    try {
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(`${window.location.origin}/api/meetings`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        window.showToast(isEdit ? 'Maklumat mesyuarat berjaya dikemaskini.' : 'Mesyuarat baru berjaya didaftarkan.', 'success');
        window.location.hash = '#meetings';
      } else {
        window.showToast('Gagal menyimpan mesyuarat: ' + data.message, 'danger');
      }
    } catch (err) {
      console.error(err);
      window.showToast('Ralat sambungan server.', 'danger');
    }
  });
}
