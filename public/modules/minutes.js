// Modul 7 & Modul 16: Penulisan Minit Mesyuarat & Templat Kerajaan
export function initMinutes(container, params) {
  const state = window.smartGovState;

  if (state.meetings.length === 0) {
    container.innerHTML = `
      <div class="card">
        <h3 class="card-title text-danger"><i data-lucide="alert-triangle"></i> Tiada Rekod Mesyuarat</h3>
        <p>Sila daftar mesyuarat terlebih dahulu sebelum menulis minit.</p>
        <button class="btn btn-primary mt-4" onclick="window.location.hash='#meetings'">Daftar Mesyuarat</button>
      </div>
    `;
    return;
  }

  let selectedMeeting = state.meetings[0];
  if (params.id) {
    selectedMeeting = state.meetings.find(m => m.id === params.id) || state.meetings[0];
  }

  renderMinutesEditor(container, selectedMeeting);
}

// Government template structures (Modul 16)
const GOV_TEMPLATES = {
  "Mesyuarat Pengurusan": {
    "a1": "Pengerusi mengucapkan salam dan memulakan mesyuarat dengan bacaan Ummul Kitab Al-Fatihah. Pengerusi mengucapkan terima kasih atas kehadiran semua ahli mesyuarat bagi membincangkan urusan tadbir urus Politeknik METrO Tasek Gelugor.",
    "a2": "Minit Mesyuarat Pengurusan Politeknik METrO Tasek Gelugor Bilangan 4 Tahun 2026 yang diadakan pada 28 Mei 2026 telah disahkan oleh mesyuarat tanpa pindaan/dengan pindaan.",
    "a3": "Mesyuarat mengambil maklum status maklum balas tindakan bagi perkara-perkara berbangkit daripada minit mesyuarat yang lalu. Unit-unit berkaitan diminta mengambil tindakan susulan segera bagi perkara yang masih dalam pelaksanaan.",
    "a4": "Pembentangan laporan prestasi oleh Ketua Jabatan Akademik (KJA), Ketua Jabatan Sokongan Akademik (KJSA) dan Ketua Unit Khidmat Pengurusan (UKP) berkaitan pencapaian bajet tahunan serta projek pembangunan fizikal.",
    "a5": "Beberapa isu kebajikan staf dibangkitkan termasuk keperluan naik taraf kerusi pejabat dan penyediaan peranti komputer riba bagi fasa penggantian seterusnya.",
    "a6": "Pengerusi merakamkan setinggi-tinggi penghargaan kepada semua ahli mesyuarat atas komitmen padu yang ditunjukkan. Mesyuarat ditangguhkan pada jam 12:30 Tengah Hari dengan tasbih kaffarah dan surah Al-Asr."
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
    "a4": "Ketua Unit Perolehan membentangkan baki peruntukan semasa OS28 dan OS29. Bajet pembangunan masih berbaki RM50,000.",
    "a5": "Tuntutan kelulusan khas bagi pembelian unit penyaman udara baru makmal komputer dibincangkan.",
    "a6": "Pengerusi meminta urusetia mempercepatkan perbelanjaan sebelum suku tahun ke-4. Mesyuarat ditangguhkan."
  }
};

function renderMinutesEditor(container, meeting) {
  const state = window.smartGovState;
  const isLocked = meeting.status === 'Diluluskan';
  
  // Make sure minutes structure exists in meeting object
  const currentMinutes = meeting.minit || {};

  container.innerHTML = `
    <div class="page-title-section no-print">
      <div>
        <h2 class="page-title">Penulisan Minit & Cabutan</h2>
        <p class="page-subtitle">Urus penulisan ulasan perenggan mesyuarat mengikut format rasmi kerajaan</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <select id="minutesMeetingSelect" class="form-control" style="width: 250px;">
          ${state.meetings.map(m => `
            <option value="${m.id}" ${m.id === meeting.id ? 'selected' : ''}>${m.nama} (Bil. ${m.bilangan}/${m.tahun})</option>
          `).join('')}
        </select>
        <button class="btn btn-secondary" onclick="window.location.hash='#meetings'">
          <i data-lucide="settings"></i> Urus Mesyuarat
        </button>
      </div>
    </div>

    <!-- Modul 16 Template Toolbar (No print) -->
    <div class="card no-print" style="margin-bottom: 24px;">
      <h3 class="card-title" style="font-size:14px;"><i data-lucide="layout"></i> Modul 16: Templat Minit Cepat</h3>
      <p style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">Sila klik mana-mana butang templat untuk pra-isi data minit mesyuarat secara automatik mengikut kategori rasmi.</p>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn btn-secondary load-template-btn" data-template="Mesyuarat Pengurusan" ${isLocked ? 'disabled' : ''}>Mesyuarat Pengurusan</button>
        <button class="btn btn-secondary load-template-btn" data-template="Mesyuarat Akademik" ${isLocked ? 'disabled' : ''}>Mesyuarat Akademik</button>
        <button class="btn btn-secondary load-template-btn" data-template="Mesyuarat Kewangan" ${isLocked ? 'disabled' : ''}>Mesyuarat Kewangan</button>
        <button class="btn btn-secondary load-template-btn" data-template="Mesyuarat JPKA" ${isLocked ? 'disabled' : ''}>Mesyuarat JPKA (Simbul)</button>
        <button class="btn btn-secondary load-template-btn" data-template="Mesyuarat Kurikulum" ${isLocked ? 'disabled' : ''}>Mesyuarat Kurikulum</button>
        <button class="btn btn-secondary load-template-btn" data-template="Mesyuarat Senat" ${isLocked ? 'disabled' : ''}>Mesyuarat Senat</button>
      </div>
    </div>

    <!-- Main Form Editor -->
    <form id="minutesEditorForm">
      
      <!-- List agendas dynamically (Modul 7) -->
      ${meeting.agenda.map((ag, idx) => {
        const minitText = currentMinutes[ag.id]?.text || '';
        const tindakanList = currentMinutes[ag.id]?.tindakan || [];
        const hasTindakan = tindakanList.length > 0;
        
        return `
          <div class="card agenda-minute-editor-card" data-agenda-id="${ag.id}" style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
              <h3 class="card-title" style="margin-bottom: 0; font-size:15px;">
                <span style="color:var(--color-primary);">${idx + 1}.0</span> ${ag.tajuk.toUpperCase()}
              </h3>
              <div>
                <label class="checkbox-label" style="font-size:12px;">
                  <input type="checkbox" class="tindakan-trigger-checkbox checkbox-input" ${hasTindakan ? 'checked' : ''} ${isLocked ? 'disabled' : ''}>
                  <i data-lucide="check-square" style="width:14px;height:14px;display:inline;"></i> Ada Tindakan Pegawai (Modul 8)
                </label>
              </div>
            </div>

            <!-- Discussion Content Textbox -->
            <div class="form-group">
              <label class="form-label" style="font-size:12px;">Keputusan / Catatan Perenggan Minit</label>
              <textarea class="form-control minute-text-input" rows="5" placeholder="Tulis catatan rasmi minit perenggan di sini..." required ${isLocked ? 'disabled' : ''}>${minitText}</textarea>
            </div>

            <!-- Modul 8: Actions Container (Hidden or shown based on checkbox) -->
            <div class="tindakan-container-block ${hasTindakan ? '' : 'hidden'}" style="background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 16px; margin-top: 12px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h4 style="font-size:12px;font-weight:700;"><i data-lucide="alert-circle" style="width:14px;height:14px;display:inline;margin-right:4px;"></i> Tugasan Pegawai Bertanggungjawab</h4>
                <button type="button" class="btn btn-secondary btn-icon add-tindakan-row-btn" style="padding:4px 8px;font-size:11px;" ${isLocked ? 'disabled' : ''}>
                  <i data-lucide="plus" style="width:12px;height:12px;"></i> Tambah Pegawai
                </button>
              </div>

              <!-- List of actions -->
              <div class="tindakan-rows-wrapper">
                ${tindakanList.map(t => renderTindakanRow(t, isLocked, state.members)).join('')}
              </div>
            </div>

          </div>
        `;
      }).join('')}

      <!-- Closing Speech Textbox -->
      <div class="card" style="margin-bottom: 24px;">
        <h3 class="card-title"><i data-lucide="file-minus"></i> Catatan Penutup Mesyuarat</h3>
        <div class="form-group" style="margin-bottom:0;">
          <textarea class="form-control" id="ucapanPenutup" rows="3" placeholder="Tulis ucapan penangguhan atau penutup mesyuarat di sini..." ${isLocked ? 'disabled' : ''}>${meeting.ucapanPenutup || ''}</textarea>
        </div>
      </div>

      <!-- Submit buttons -->
      <div class="no-print" style="display: flex; justify-content: flex-end; gap: 12px; margin-bottom: 40px;">
        <button type="button" class="btn btn-secondary" onclick="window.location.hash='#meetings'">Batal</button>
        <button type="submit" class="btn btn-success" ${isLocked ? 'disabled' : ''}><i data-lucide="save"></i> Simpan Catatan Minit</button>
      </div>

    </form>
  `;

  // Init Lucide
  if (window.lucide) window.lucide.createIcons();

  // Dropdown selector
  document.getElementById('minutesMeetingSelect').addEventListener('change', (e) => {
    window.location.hash = `#minutes?id=${e.target.value}`;
  });

  // Attach dynamic show/hide & add actions
  document.querySelectorAll('.agenda-minute-editor-card').forEach(card => {
    const trigger = card.querySelector('.tindakan-trigger-checkbox');
    const container = card.querySelector('.tindakan-container-block');
    const addBtn = card.querySelector('.add-tindakan-row-btn');
    const wrapper = card.querySelector('.tindakan-rows-wrapper');

    trigger.addEventListener('change', () => {
      if (trigger.checked) {
        container.classList.remove('hidden');
        if (wrapper.children.length === 0) {
          // Add default action row
          wrapper.innerHTML = renderTindakanRow(null, isLocked, state.members);
          attachTindakanRowListeners(wrapper.firstElementChild);
        }
      } else {
        container.classList.add('hidden');
        wrapper.innerHTML = ''; // Clear rows
      }
    });

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const div = document.createElement('div');
        div.innerHTML = renderTindakanRow(null, isLocked, state.members);
        const child = div.firstElementChild;
        wrapper.appendChild(child);
        attachTindakanRowListeners(child);
      });
    }

    // Attach listener to pre-existing rows
    wrapper.querySelectorAll('.tindakan-row-item').forEach(attachTindakanRowListeners);
  });

  function attachTindakanRowListeners(row) {
    if (window.lucide) window.lucide.createIcons();
    row.querySelector('.remove-tindakan-row-btn').addEventListener('click', () => {
      row.remove();
    });
  }

  // Handle template loader clicks (Modul 16)
  document.querySelectorAll('.load-template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const templateName = btn.getAttribute('data-template');
      
      // We can load a simulated template block or default to Mesyuarat Pengurusan
      const selectedTemplate = GOV_TEMPLATES[templateName] || GOV_TEMPLATES["Mesyuarat Pengurusan"];
      
      document.querySelectorAll('.agenda-minute-editor-card').forEach(card => {
        const agendaId = card.getAttribute('data-agenda-id');
        const textInput = card.querySelector('.minute-text-input');
        
        // Match by index or key
        // Map templates to index a1, a2, etc.
        const defaultIndex = Array.from(document.querySelectorAll('.agenda-minute-editor-card')).indexOf(card) + 1;
        const key = `a${defaultIndex}`;
        
        if (selectedTemplate[key]) {
          textInput.value = selectedTemplate[key];
        } else {
          textInput.value = `Catatan ulasan minit bagi agenda ${defaultIndex}.0...`;
        }
      });

      // Default ucapan penutup template
      document.getElementById('ucapanPenutup').value = "Pengerusi mengucapkan terima kasih atas kerjasama yang diberikan dan mendoakan kelancaran tugas semua warga politeknik.";
      window.showToast(`Templat [${templateName}] berjaya dimuatkan.`, 'success');
    });
  });

  // Handle minutes submission
  document.getElementById('minutesEditorForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const minit = {};

    document.querySelectorAll('.agenda-minute-editor-card').forEach(card => {
      const agendaId = card.getAttribute('data-agenda-id');
      const text = card.querySelector('.minute-text-input').value.trim();
      const trigger = card.querySelector('.tindakan-trigger-checkbox');
      const agendaTajuk = card.querySelector('.card-title').textContent.trim();

      const tindakan = [];
      if (trigger.checked) {
        card.querySelectorAll('.tindakan-row-item').forEach(row => {
          const actionId = row.getAttribute('data-action-id') || '';
          const keputusan = row.querySelector('.tindakan-task-input').value.trim();
          const pegawaiId = row.querySelector('.tindakan-pegawai-select').value;
          const tarikhSiap = row.querySelector('.tindakan-date-input').value;
          const keutamaan = row.querySelector('.tindakan-priority-select').value;
          const catatan = row.querySelector('.tindakan-notes-input').value.trim();

          const pegawai = state.members.find(x => x.id === pegawaiId);

          if (keputusan && pegawaiId) {
            tindakan.push({
              id: actionId,
              agendaTajuk,
              keputusan,
              pegawaiId,
              pegawaiNama: pegawai.nama,
              pegawaiUnit: pegawai.unit,
              tarikhSiap,
              status: row.getAttribute('data-status') || 'Dalam tindakan',
              keutamaan,
              catatan
            });
          }
        });
      }

      minit[agendaId] = { text, tindakan };
    });

    const ucapanPenutup = document.getElementById('ucapanPenutup').value.trim();

    // Compile whole updated meeting object
    const payload = {
      ...meeting,
      minit,
      ucapanPenutup,
      operator: state.currentOperator
    };

    // Auto-update status to 'Selesai' when minutes are saved if it was draft
    if (payload.status === 'Draf') {
      payload.status = 'Selesai';
    }

    try {
      const res = await fetch(`${window.location.origin}/api/meetings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        window.showToast('Catatan minit dan cabutan tindakan berjaya disimpan.', 'success');
        // Refresh local cache
        await window.refreshState();
        // Go back to meetings list
        window.location.hash = '#meetings';
      } else {
        window.showToast('Gagal menyimpan minit: ' + data.message, 'danger');
      }
    } catch (err) {
      console.error(err);
      window.showToast('Ralat sambungan server.', 'danger');
    }
  });
}

function renderTindakanRow(action = null, isLocked = false, members = []) {
  const taskId = action ? action.id : '';
  const keputusan = action ? action.keputusan : '';
  const pId = action ? action.pegawaiId : '';
  const date = action ? action.tarikhSiap : '';
  const priority = action ? action.keutamaan : 'Sederhana';
  const notes = action ? action.catatan : '';
  const status = action ? action.status : 'Dalam tindakan';

  return `
    <div class="tindakan-row-item" data-action-id="${taskId}" data-status="${status}" style="display:grid;grid-template-columns: 2fr 2fr 1fr 1fr 2fr auto; gap:10px; margin-bottom:12px; align-items:center;">
      <div>
        <input type="text" class="form-control tindakan-task-input" value="${keputusan}" placeholder="Keputusan / Tugasan Tindakan" required ${isLocked ? 'disabled' : ''} style="font-size:11px;padding:6px;">
      </div>
      <div>
        <select class="form-control tindakan-pegawai-select" required ${isLocked ? 'disabled' : ''} style="font-size:11px;padding:6px;">
          <option value="">-- Pilih Pegawai --</option>
          ${members.map(m => `
            <option value="${m.id}" ${pId === m.id ? 'selected' : ''}>${m.nama} (${m.jawatan})</option>
          `).join('')}
        </select>
      </div>
      <div>
        <input type="date" class="form-control tindakan-date-input" value="${date}" required ${isLocked ? 'disabled' : ''} style="font-size:11px;padding:6px;">
      </div>
      <div>
        <select class="form-control tindakan-priority-select" ${isLocked ? 'disabled' : ''} style="font-size:11px;padding:6px;">
          <option value="Tinggi" ${priority === 'Tinggi' ? 'selected' : ''}>Tinggi</option>
          <option value="Sederhana" ${priority === 'Sederhana' ? 'selected' : ''}>Sederhana</option>
          <option value="Rendah" ${priority === 'Rendah' ? 'selected' : ''}>Rendah</option>
        </select>
      </div>
      <div>
        <input type="text" class="form-control tindakan-notes-input" value="${notes}" placeholder="Catatan/Lampiran" ${isLocked ? 'disabled' : ''} style="font-size:11px;padding:6px;">
      </div>
      <div>
        <button type="button" class="btn btn-danger btn-icon remove-tindakan-row-btn" style="padding:4px 8px;" ${isLocked ? 'disabled' : ''} title="Padam Pegawai">
          <i data-lucide="x" style="width:12px;height:12px;"></i>
        </button>
      </div>
    </div>
  `;
}
