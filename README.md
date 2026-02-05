# Absen QR — Starter (React + Node/Express + PostgreSQL)

Fitur utama:
- Autentikasi JWT
- Role: admin/hr/employee
- Generate QR session (admin) -> karyawan scan untuk check-in/check-out
- Export laporan CSV
- Docker + docker-compose untuk self-host

Jalankan cepat (dengan Docker):
1. Clone repo:
   git clone https://github.com/ridhoajaaa/Absen-QR.git
   cd Absen-QR

2. Buat file backend/.env berdasarkan backend/.env.example

3. Jalankan:
   docker-compose up --build

Akses:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api

Buat admin:
- POST /api/auth/register
  {"name":"Admin","email":"admin@example.com","password":"adminpass","role":"admin"}

Login:
- POST /api/auth/login -> dapatkan token untuk Authorization: Bearer <token>

Generate QR (admin):
- POST /api/attendance/generate (header Authorization)

Scan (karyawan):
- POST /api/attendance/scan { token: "<token_from_qr>", lat, lng }

Export CSV (admin):
- GET /api/attendance/export (header Authorization) -> download CSV

Catatan:
- Jangan push file .env ke repo publik.
- Untuk production: pakai HTTPS, simpan JWT aman, perketat validasi dan rate-limiting.
