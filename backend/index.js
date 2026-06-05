import "dotenv/config";
import express from "express";
import pg from "pg"; // Mengganti mysql2 ke pg
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";

const app = express();
app.use(cors({
  origin: "http://localhost:5173", // Mengizinkan alamat frontend Vite Anda
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// --- [ CONFIG NODEMAILER ] ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "smptridharmamanado7@gmail.com",
    pass: "kkupruitgvejybis",
  },
});

// 1. Konfigurasi Folder Uploads
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    );
  },
});
const upload = multer({ storage: storage });

// 2. Koneksi Database Supabase (PostgreSQL Connection Pool)
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Wajib diaktifkan untuk koneksi secure cloud Supabase
  }
});

// Wrapper agar fungsi db.query MySQL lama tetap bekerja menggunakan PostgreSQL pool
const db = {
  query: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    let index = 1;
    const postgresSql = sql.replace(/\?/g, () => `$${index++}`);

    pool.query(postgresSql, params, (err, res) => {
      if (err) return callback(err, null);
      callback(null, res.rows);
    });
  }
};

pool.connect((err) => {
  if (err) {
    console.error("❌ Koneksi Database Supabase Gagal:", err.message);
    return;
  }
  console.log(`✅ Server & Database Supabase (PostgreSQL) AKTIF!`);
});

// --- [ AUTH - PERBAIKAN PROTEKSI VERIFIKASI AKUN ADMIN BK ] ---
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: "Server Error" });
      if (result && result.length > 0) {
        const user = result[0];

        if (user.role === "siswa" && user.status_aktif === "PENDING") {
          return res.status(403).json({ 
            success: false, 
            message: "Maaf, akun Anda belum aktif. Silakan hubungi Admin / Guru BK di sekolah untuk memproses verifikasi berkas pendaftaran Anda!" 
          });
        }

        res.json({ success: true, user: user });
      } else {
        res.json({ success: false, message: "Email atau Password salah!" });
      }
    }
  );
});

app.post("/api/register", (req, res) => {
  const { nama, email, password, kelas, security_question, security_answer } =
    req.body;
  db.query(
    "INSERT INTO users (nama, email, password, kelas, role, security_question, security_answer) VALUES (?, ?, ?, ?, 'siswa', ?, ?)",
    [nama, email, password, kelas, security_question, security_answer],
    (err) => {
      if (err) {
        console.error("❌ Register error:", err.message);
        if (err.code === '23505') { 
          return res.status(400).json({ success: false, message: "Email sudah terdaftar!" });
        }
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true });
    }
  );
});

// --- [ LUPA PASSWORD ] ---
app.get("/api/forgot-password/question", (req, res) => {
  const { email } = req.query;
  db.query(
    "SELECT security_question FROM users WHERE email = ?",
    [email],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!result || result.length === 0) {
        return res.json({ success: false, message: "Email tidak ditemukan." });
      }
      const question = result[0].security_question;
      if (!question) {
        return res.json({
          success: false,
          message: "Akun ini tidak memiliki pertanyaan keamanan. Hubungi admin.",
        });
      }
      res.json({ success: true, security_question: question });
    }
  );
});

app.post("/api/forgot-password/verify", (req, res) => {
  const { email, security_answer } = req.body;
  db.query(
    "SELECT id FROM users WHERE email = ? AND LOWER(security_answer) = LOWER(?)",
    [email, security_answer],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result && result.length > 0) {
        res.json({ success: true, id: result[0].id });
      } else {
        res.json({
          success: false,
          message: "Jawaban keamanan salah. Coba lagi.",
        });
      }
    }
  );
});

app.post("/api/forgot-password/reset", (req, res) => {
  const { id, new_password } = req.body;
  db.query(
    "UPDATE users SET password = ? WHERE id = ?",
    [new_password, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// --- [ PENGADUAN ] ---
app.post("/api/laporan", upload.array("foto", 4), (req, res) => {
  const { id_siswa, kategori, isi_laporan } = req.body;

  let fotoString = null;
  if (req.files && req.files.length > 0) {
    const fileNames = req.files.map((file) => file.filename);
    fotoString = fileNames.join(",");
  }

  const tanggal = new Date().toISOString().split("T")[0];
  db.query(
    "INSERT INTO laporan (id_siswa, kategori, isi_laporan, foto, tanggal_lapor, status) VALUES (?, ?, ?, ?, ?, 'TERKIRIM')",
    [id_siswa, kategori, isi_laporan, fotoString, tanggal],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.get("/api/laporan/user/:id_siswa", (req, res) => {
  db.query(
    "SELECT * FROM laporan WHERE id_siswa = ? ORDER BY id DESC",
    [req.params.id_siswa],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

// --- [ KONSULTASI ] ---
app.get("/api/guru", (req, res) => {
  db.query("SELECT * FROM guru", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.post("/api/konsultasi", (req, res) => {
  const { id_siswa, id_guru, tanggal, jam, topik } = req.body;
  db.query(
    "INSERT INTO konsultasi (id_siswa, id_guru, tanggal, jam, topik, status) VALUES (?, ?, ?, ?, ?, 'MENUNGGU')",
    [id_siswa, id_guru, tanggal, jam, topik],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.get("/api/riwayat/:id_siswa", (req, res) => {
  const sql =
    "SELECT k.*, g.nama_guru FROM konsultasi k JOIN guru g ON k.id_guru = g.id_guru WHERE k.id_siswa = ? ORDER BY k.id DESC";
  db.query(sql, [req.params.id_siswa], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// --- [ PERBAIKAN TOTAL ENDPOINT STATISTIK ADMIN ] ---
app.get("/api/admin/stats", (req, res) => {
  const { bulan, tahun, all } = req.query;

  let qL, qK, qCat;
  let params = [];

  // JIKA FRONTLINE MEMINTA SEMUA DATA ATAU FILTER TIADA, ATUR STRUKTUR QUERY GLOBAL TANPA WHERE CLAUSE BULAN
  if (all === 'true') {
    qL = "SELECT COUNT(*) as total, SUM(CASE WHEN status='SELESAI' OR status='DIPROSES' THEN 1 ELSE 0 END) as selesai FROM laporan";
    qK = "SELECT COUNT(*) as total, SUM(CASE WHEN status='Selesai' OR status='DIPROSES' THEN 1 ELSE 0 END) as selesai FROM konsultasi";
    qCat = "SELECT kategori, COUNT(*) as jumlah FROM laporan GROUP BY kategori";
  } else {
    const intBulan = parseInt(bulan);
    const intTahun = parseInt(tahun);

    if (isNaN(intBulan) || isNaN(intTahun)) {
      return res.json({
        totalPengaduan: 0,
        pengaduanSelesai: 0,
        totalKonsultasi: 0,
        konsultasiSelesai: 0,
        kategori: { BULLYING: 0, FASILITAS: 0, KEKERASAN: 0, LAINNYA: 0 }
      });
    }

    // Menggunakan pembanding string parsial yang jauh lebih aman untuk tipe DATE cloud Supabase
    const padBulan = String(intBulan).padStart(2, '0');
    const filterTanggal = `${intTahun}-${padBulan}%`;

    qL = "SELECT COUNT(*) as total, SUM(CASE WHEN status='SELESAI' THEN 1 ELSE 0 END) as selesai FROM laporan WHERE CAST(tanggal_lapor AS TEXT) LIKE ?";
    qK = "SELECT COUNT(*) as total, SUM(CASE WHEN status='Selesai' OR status='DIPROSES' THEN 1 ELSE 0 END) as selesai FROM konsultasi WHERE CAST(tanggal AS TEXT) LIKE ?";
    qCat = "SELECT kategori, COUNT(*) as jumlah FROM laporan WHERE CAST(tanggal_lapor AS TEXT) LIKE ? GROUP BY kategori";
    
    params = [filterTanggal];
  }

  db.query(qL, params, (err, resL) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(qK, params, (err, resK) => {
      if (err) return res.status(500).json({ error: err.message });

      db.query(qCat, params, (err, resCat) => {
        if (err) return res.status(500).json({ error: err.message });

        const dataLapor = resL[0] || { total: 0, selesai: 0 };
        const dataKonsul = resK[0] || { total: 0, selesai: 0 };

        const kategoriStats = {
          BULLYING: 0,
          FASILITAS: 0,
          KEKERASAN: 0,
          LAINNYA: 0,
        };

        if (resCat) {
          resCat.forEach((row) => {
            if (row.kategori) {
              const key = row.kategori.toUpperCase();
              if (kategoriStats.hasOwnProperty(key)) {
                kategoriStats[key] = parseInt(row.jumlah) || 0;
              }
            }
          });
        }

        // Return data dengan format snake_case & camelCase agar sinkron otomatis dengan dashboard admin Anda
        res.json({
          total_pengaduan: parseInt(dataLapor.total) || 0,
          totalPengaduan: parseInt(dataLapor.total) || 0,
          pengaduan_selesai: parseInt(dataLapor.selesai) || 0,
          pengaduanSelesai: parseInt(dataLapor.selesai) || 0,
          total_konsultasi: parseInt(dataKonsul.total) || 0,
          totalKonsultasi: parseInt(dataKonsul.total) || 0,
          konsultasi_selesai: parseInt(dataKonsul.selesai) || 0,
          konsultasiSelesai: parseInt(dataKonsul.selesai) || 0,
          kategori: kategoriStats,
        });
      });
    });
  });
});

app.get("/api/admin/laporan", (req, res) => {
  const sql =
    "SELECT l.*, u.nama as nama_pelapor, u.kelas FROM laporan l JOIN users u ON l.id_siswa = u.id ORDER BY l.id DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.put("/api/admin/update-laporan/:id", (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  const sqlGetEmail =
    "SELECT u.email, u.nama, l.kategori FROM laporan l JOIN users u ON l.id_siswa = u.id WHERE l.id = ?";

  db.query(sqlGetEmail, [id], (err, userData) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query(
      "UPDATE laporan SET status = ? WHERE id = ?",
      [status, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        if (userData && userData.length > 0) {
          const { email, nama, kategori } = userData[0];
          transporter.sendMail({
            from: '"SIBY Group Support" <smptridharmamanado7@gmail.com>',
            to: email,
            subject: `Update Status Pengaduan - ${kategori}`,
            html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2>Halo ${nama},</h2>
                  <p>Pengaduan Anda mengenai <b>${kategori}</b> telah diperbarui.</p>
                  <p>Status terbaru: <b>${status}</b></p>
                </div>`,
          });
        }
        res.json({ success: true });
      }
    );
  });
});

app.get("/api/admin/konsultasi", (req, res) => {
  const sql =
    "SELECT k.*, u.nama as nama, u.kelas, g.nama_guru FROM konsultasi k JOIN users u ON k.id_siswa = u.id JOIN guru g ON k.id_guru = g.id_guru ORDER BY k.id DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.put("/api/admin/update-konsultasi/:id", (req, res) => {
  const { jam, link_zoom, pesan_admin, status } = req.body;
  const { id } = req.params;
  const sqlGetEmail =
    "SELECT u.email, u.nama, g.nama_guru FROM konsultasi k JOIN users u ON k.id_siswa = u.id JOIN guru g ON g.id_guru = k.id_guru WHERE k.id = ?";

  db.query(sqlGetEmail, [id], (err, userData) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query(
      "UPDATE konsultasi SET jam = ?, link_zoom = ?, pesan_admin = ?, status = ? WHERE id = ?",
      [jam, link_zoom, pesan_admin, status, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        if (userData && userData.length > 0) {
          const { email, nama, nama_guru } = userData[0];
          transporter.sendMail({
            from: '"SIBY Group Support" <smptridharmamanado7@gmail.com>',
            to: email,
            subject: `Update Jadwal Konsultasi - ${nama_guru}`,
            html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #eee;">
                  <h2>Halo ${nama},</h2>
                  <p>Jadwal konsultasi Anda dengan <b>${nama_guru}</b> diperbarui menjadi status: ${status}</p>
                </div>`,
          });
        }
        res.json({ success: true });
      }
    );
  });
});

// --- [ ENDPOINT KELOLA VERIFIKASI SISWA UNTUK ADMIN BK ] ---
app.get("/api/admin/siswa-pending", (req, res) => {
  const sql = "SELECT id, nama, email, kelas, created_at FROM users WHERE role = 'siswa' AND status_aktif = 'PENDING' ORDER BY id DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.put("/api/admin/verifikasi-siswa/:id", (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE users SET status_aktif = 'AKTIF' WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: "Akun siswa berhasil diaktifkan!" });
  });
});

app.delete("/api/admin/tolak-siswa/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM users WHERE id = ? AND status_aktif = 'PENDING'";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: "Pendaftaran akun palsu berhasil dihapus." });
  });
});

const PORT = 8080;
app.listen(PORT, () =>
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`)
);