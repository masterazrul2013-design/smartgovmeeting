const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8092;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DB_FILE = path.join(__dirname, 'db.json');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  // 1. Cuba cari IP adapter fizikal (Wi-Fi, Ethernet, LAN) dahulu
  for (const name of Object.keys(interfaces)) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('virtualbox') || 
        nameLower.includes('vmware') || 
        nameLower.includes('vbox') || 
        nameLower.includes('host-only') || 
        nameLower.includes('virtual') || 
        nameLower.includes('vethernet') || 
        nameLower.includes('loopback') ||
        nameLower.includes('wsl')) {
      continue;
    }
    
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  // 2. Fallback kepada mana-mana IPv4 jika tiada adapter fizikal ditemui
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// MIME types mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Database helper functions
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { members: [], meetings: [], actions: [], auditLogs: [], repository: [] };
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file:', err);
    return { members: [], meetings: [], actions: [], auditLogs: [], repository: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database file:', err);
    return false;
  }
}

// Log audit trail
function logAudit(user, ip, action, details) {
  const db = readDB();
  const newLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    user: user || 'Pegawai',
    ip: ip || '127.0.0.1',
    action: action,
    details: details
  };
  db.auditLogs.unshift(newLog); // Prepend so newest is first
  writeDB(db);
  return newLog;
}

// Helper to send JSON responses
function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Server logic
const server = http.createServer((req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Handle CORS for development flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API Endpoints ---
  if (pathname.startsWith('/api/')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let payload = {};
      try {
        if (body) payload = JSON.parse(body);
      } catch (e) {
        return sendJSON(res, 400, { success: false, message: 'Format JSON tidak sah' });
      }

      // GET /api/data
      if (req.method === 'GET' && pathname === '/api/data') {
        const db = readDB();
        return sendJSON(res, 200, {
          members: db.members,
          meetings: db.meetings,
          actions: db.actions,
          repository: db.repository,
          auditLogs: db.auditLogs,
          localIP: getLocalIP()
        });
      }

      // POST /api/meetings (Create meeting)
      if (req.method === 'POST' && pathname === '/api/meetings') {
        const db = readDB();
        const meeting = {
          id: 'meet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          nama: payload.nama || 'Mesyuarat Baru',
          bilangan: payload.bilangan || '1',
          tahun: payload.tahun || new Date().getFullYear().toString(),
          tarikh: payload.tarikh || new Date().toISOString().split('T')[0],
          masa: payload.masa || '08:30 AM',
          tempat: payload.tempat || 'Bilik Persidangan',
          pengerusiId: payload.pengerusiId || '',
          setiausahaId: payload.setiausahaId || '',
          urusetiaIds: payload.urusetiaIds || [],
          ahliIds: payload.ahliIds || [],
          tunnelUrl: payload.tunnelUrl || '',
          kategori: payload.kategori || 'Mesyuarat Pengurusan',
          status: payload.status || 'Draf', // Draf, Berjalan, Selesai, Disemak, Diluluskan (Locked)
          kehadiran: payload.kehadiran || {}, // { memberId: 'Hadir' | 'Tidak Hadir' | 'Bersebab' | 'Cuti' | 'MC' }
          agenda: payload.agenda || [], // [{ id, tajuk, subAgendas: [] }]
          minit: payload.minit || {}, // { agendaId: { text: '', tindakan: [] } }
          tidakHadirSebab: payload.tidakHadirSebab || {}, // { memberId: 'Sebab...' }
          ucapanPenutup: payload.ucapanPenutup || '',
          disediakanOleh: payload.disediakanOleh || '',
          disemakOleh: payload.disemakOleh || '',
          disahkanOleh: payload.disahkanOleh || '',
          tarikhSedia: payload.tarikhSedia || '',
          tarikhSemak: payload.tarikhSemak || '',
          tarikhSah: payload.tarikhSah || '',
          createdAt: new Date().toISOString()
        };

        db.meetings.push(meeting);
        if (writeDB(db)) {
          logAudit(payload.operator, clientIP, 'Daftar Mesyuarat', `Mendaftar mesyuarat baru: ${meeting.nama} (Bil. ${meeting.bilangan}/${meeting.tahun})`);
          return sendJSON(res, 201, { success: true, meeting });
        }
        return sendJSON(res, 500, { success: false, message: 'Gagal menyimpan mesyuarat' });
      }

      // PUT /api/meetings (Update meeting details, minutes, attendance, lock status)
      if (req.method === 'PUT' && pathname === '/api/meetings') {
        const db = readDB();
        const idx = db.meetings.findIndex(m => m.id === payload.id);
        if (idx === -1) {
          return sendJSON(res, 404, { success: false, message: 'Mesyuarat tidak dijumpai' });
        }

        // Prevent modification if already Approved/Locked (unless explicit bypass by sysadmin if needed, but here we strictly lock it)
        const oldMeeting = db.meetings[idx];
        if (oldMeeting.status === 'Diluluskan' && payload.status !== 'Diluluskan') {
          return sendJSON(res, 403, { success: false, message: 'Mesyuarat telah diluluskan dan dikunci. Tiada pengeditan dibenarkan.' });
        }

        // Update fields
        db.meetings[idx] = { ...oldMeeting, ...payload, updatedAt: new Date().toISOString() };

        // Process Cabutan Minit (Extract action items to actions list)
        // If the meeting is marked as 'Selesai', 'Disemak' or 'Diluluskan', update the actions list
        if (payload.minit) {
          // Keep track of action IDs from this meeting to clean up deleted ones
          const activeActionIds = [];
          
          Object.keys(payload.minit).forEach(agendaId => {
            const minitItem = payload.minit[agendaId];
            
            // Collect all tindakan objects from this agenda item
            let agendaTindakans = [];
            if (minitItem.isUnitSplit && minitItem.unitReports && Array.isArray(minitItem.unitReports)) {
              minitItem.unitReports.forEach(rep => {
                if (rep.tindakan && Array.isArray(rep.tindakan)) {
                  agendaTindakans.push(...rep.tindakan);
                }
              });
            } else if (minitItem.tindakan && Array.isArray(minitItem.tindakan)) {
              agendaTindakans = minitItem.tindakan;
            }

            agendaTindakans.forEach(act => {
              let actionId = act.id;
              if (!actionId || actionId.startsWith('temp-')) {
                actionId = 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                act.id = actionId; // Update in-place in meeting minute too
              }
              activeActionIds.push(actionId);

              // Update or Insert into actions array
              const actionIdx = db.actions.findIndex(a => a.id === actionId);
              const actionData = {
                id: actionId,
                meetingId: payload.id,
                meetingNama: payload.nama,
                meetingBilangan: payload.bilangan,
                meetingTahun: payload.tahun,
                agendaId: agendaId,
                agendaTajuk: act.agendaTajuk || '',
                keputusan: act.keputusan || '',
                pegawaiId: act.pegawaiId || '',
                pegawaiNama: act.pegawaiNama || '',
                pegawaiUnit: act.pegawaiUnit || '',
                tarikhSiap: act.tarikhSiap || '',
                status: act.status || 'Dalam tindakan', // 'Dalam tindakan', 'Selesai', 'Overdue'
                keutamaan: act.keutamaan || 'Sederhana',
                catatan: act.catatan || '',
                lampiran: act.lampiran || '', // filename or base64 ref
                updatedAt: new Date().toISOString()
              };

              if (actionIdx === -1) {
                actionData.createdAt = new Date().toISOString();
                db.actions.push(actionData);
              } else {
                db.actions[actionIdx] = { ...db.actions[actionIdx], ...actionData };
              }
            });
          });

          // Optional: Clean up actions that were removed from the minute (if they existed before but not now)
          db.actions = db.actions.filter(a => a.meetingId !== payload.id || activeActionIds.includes(a.id));
        }

        if (writeDB(db)) {
          let logActionName = 'Kemas Kini Mesyuarat';
          if (payload.status === 'Diluluskan') logActionName = 'Lulus & Kunci Minit';
          logAudit(payload.operator, clientIP, logActionName, `Mengemas kini mesyuarat: ${payload.nama} (Bil. ${payload.bilangan}/${payload.tahun}). Status: ${payload.status}`);
          return sendJSON(res, 200, { success: true, meeting: db.meetings[idx] });
        }
        return sendJSON(res, 500, { success: false, message: 'Gagal menyimpan perubahan mesyuarat' });
      }

      // POST /api/members (Create member)
      if (req.method === 'POST' && pathname === '/api/members') {
        const db = readDB();
        const member = {
          id: 'm' + (db.members.length + 1) + '-' + Math.random().toString(36).substr(2, 4),
          nama: payload.nama || 'Nama Pegawai',
          jawatan: payload.jawatan || 'Pegawai',
          unit: payload.unit || 'Unit',
          email: payload.email || '',
          telefon: payload.telefon || '',
          kategori: payload.kategori || 'Tetap',
          peranan: payload.peranan || 'Ahli',
          createdAt: new Date().toISOString()
        };
        db.members.push(member);
        if (writeDB(db)) {
          logAudit(payload.operator, clientIP, 'Tambah Ahli', `Menambah ahli mesyuarat: ${member.nama} (${member.jawatan})`);
          return sendJSON(res, 201, { success: true, member });
        }
        return sendJSON(res, 500, { success: false, message: 'Gagal menyimpan ahli' });
      }

      // POST /api/members/batch (Batch create members)
      if (req.method === 'POST' && pathname === '/api/members/batch') {
        const db = readDB();
        const imported = [];
        if (Array.isArray(payload.members)) {
          payload.members.forEach((m, idx) => {
            const member = {
              id: 'm' + (db.members.length + idx + 1) + '-' + Math.random().toString(36).substr(2, 4),
              nama: m.nama || 'Nama Pegawai',
              jawatan: m.jawatan || 'Pegawai',
              unit: m.unit || 'Unit',
              email: m.email || '',
              telefon: m.telefon || '',
              kategori: m.kategori || 'Tetap',
              peranan: m.peranan || 'Ahli',
              createdAt: new Date().toISOString()
            };
            db.members.push(member);
            imported.push(member);
          });
        }
        if (writeDB(db)) {
          logAudit(payload.operator, clientIP, 'Tambah Ahli (Batch)', `Mengimport ${imported.length} orang ahli mesyuarat secara kelompok`);
          return sendJSON(res, 201, { success: true, count: imported.length });
        }
        return sendJSON(res, 500, { success: false, message: 'Gagal mengimport ahli' });
      }

      // PUT /api/members (Update member)
      if (req.method === 'PUT' && pathname === '/api/members') {
        const db = readDB();
        const idx = db.members.findIndex(m => m.id === payload.id);
        if (idx === -1) {
          return sendJSON(res, 404, { success: false, message: 'Ahli tidak dijumpai' });
        }
        db.members[idx] = { ...db.members[idx], ...payload, updatedAt: new Date().toISOString() };
        if (writeDB(db)) {
          logAudit(payload.operator, clientIP, 'Kemas Kini Ahli', `Mengemas kini ahli: ${payload.nama}`);
          return sendJSON(res, 200, { success: true, member: db.members[idx] });
        }
        return sendJSON(res, 500, { success: false, message: 'Gagal mengemas kini ahli' });
      }

      // PUT /api/actions (Update action item status, notes, or priority from dashboard)
      if (req.method === 'PUT' && pathname === '/api/actions') {
        const db = readDB();
        const idx = db.actions.findIndex(a => a.id === payload.id);
        if (idx === -1) {
          return sendJSON(res, 404, { success: false, message: 'Tindakan tidak dijumpai' });
        }

        db.actions[idx] = { ...db.actions[idx], ...payload, updatedAt: new Date().toISOString() };
        
        // Also update inside the respective meeting minute tindakan array if possible to keep in sync
        const meetIdx = db.meetings.findIndex(m => m.id === db.actions[idx].meetingId);
        if (meetIdx !== -1) {
          const meeting = db.meetings[meetIdx];
          const agendaId = db.actions[idx].agendaId;
          if (meeting.minit && meeting.minit[agendaId]) {
            const minitItem = meeting.minit[agendaId];
            if (minitItem.isUnitSplit && minitItem.unitReports && Array.isArray(minitItem.unitReports)) {
              minitItem.unitReports.forEach(rep => {
                if (rep.tindakan && Array.isArray(rep.tindakan)) {
                  const actIdx = rep.tindakan.findIndex(t => t.id === payload.id);
                  if (actIdx !== -1) {
                    rep.tindakan[actIdx] = {
                      ...rep.tindakan[actIdx],
                      ...payload
                    };
                  }
                }
              });
            } else if (minitItem.tindakan && Array.isArray(minitItem.tindakan)) {
              const actIdx = minitItem.tindakan.findIndex(t => t.id === payload.id);
              if (actIdx !== -1) {
                minitItem.tindakan[actIdx] = {
                  ...minitItem.tindakan[actIdx],
                  ...payload
                };
              }
            }
          }
        }

        if (writeDB(db)) {
          logAudit(payload.operator, clientIP, 'Kemas Kini Tindakan', `Kemas kini status tindakan: ${db.actions[idx].keputusan.substring(0, 30)}... kepada [${payload.status}]`);
          return sendJSON(res, 200, { success: true, action: db.actions[idx] });
        }
        return sendJSON(res, 500, { success: false, message: 'Gagal mengemas kini tindakan' });
      }

      // POST /api/repository (Upload document)
      if (req.method === 'POST' && pathname === '/api/repository') {
        const db = readDB();
        const doc = {
          id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          namaFail: payload.namaFail || 'dokumen.pdf',
          tajuk: payload.tajuk || 'Dokumen Tanpa Tajuk',
          jenis: payload.jenis || 'PDF', // PDF, Gambar, PowerPoint, Excel, Lampiran, Surat
          saiz: payload.saiz || '0 KB',
          tarikhMuatNaik: new Date().toISOString(),
          muatNaikOleh: payload.muatNaikOleh || 'Pengguna',
          dataUrl: payload.dataUrl || '', // Base64 content
          catatan: payload.catatan || ''
        };
        db.repository.push(doc);
        if (writeDB(db)) {
          logAudit(payload.operator, clientIP, 'Muat Naik Dokumen', `Memuat naik fail ke repositori: ${doc.tajuk} (${doc.namaFail})`);
          return sendJSON(res, 201, { success: true, document: doc });
        }
        return sendJSON(res, 500, { success: false, message: 'Gagal memuat naik fail' });
      }

      // DELETE /api/repository (Remove document)
      if (req.method === 'DELETE' && pathname === '/api/repository') {
        const db = readDB();
        const docId = payload.id;
        const docIdx = db.repository.findIndex(d => d.id === docId);
        if (docIdx === -1) {
          return sendJSON(res, 404, { success: false, message: 'Dokumen tidak dijumpai' });
        }
        const docName = db.repository[docIdx].tajuk;
        db.repository.splice(docIdx, 1);
        if (writeDB(db)) {
          logAudit(payload.operator, clientIP, 'Padam Dokumen', `Memadam dokumen dari repositori: ${docName}`);
          return sendJSON(res, 200, { success: true });
        }
        return sendJSON(res, 500, { success: false, message: 'Gagal memadam dokumen' });
      }

      return sendJSON(res, 404, { success: false, message: 'Endpoint API tidak wujud' });
    });
    return;
  }

  // --- Static File Server ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // Simple security check to stay inside public folder
  const relative = path.relative(PUBLIC_DIR, filePath);
  const isSafe = relative && !relative.startsWith('..') && !path.isAbsolute(relative);

  if (!isSafe && pathname !== '/') {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Akses dilarang');
    return;
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Return index.html for client-side routing if requested path doesn't exist (optional, but good for SPA)
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, content2) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Halaman tidak dijumpai');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content2, 'utf-8');
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Ralat server: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server SmartGovMeeting sedang berjalan di http://localhost:${PORT}`);
});
