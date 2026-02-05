import React, { useState } from "react";
import axios from "axios";
import QRReader from "react-qr-reader";
import QRCode from "qrcode.react";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [generated, setGenerated] = useState(null);

  const login = async () => {
    try {
      const r = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem("token", r.data.token);
      setToken(r.data.token);
      alert("Login sukses");
    } catch (e) {
      alert("Login gagal: " + (e.response?.data?.error || e.message));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  const handleScan = async (data) => {
    if (!data) return;
    setScanResult(data);
    if (!token) { alert("Silakan login dulu"); return; }
    try {
      const resp = await axios.post(`${API}/attendance/scan`, { token: data, lat: null, lng: null }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Success: " + resp.data.action);
    } catch (e) {
      alert("Error: " + (e.response?.data?.error || e.message));
    }
  };

  const generateQr = async () => {
    try {
      const resp = await axios.post(`${API}/attendance/generate`, { label: "Gate A - session", ttl_minutes: 60 }, { headers: { Authorization: `Bearer ${token}` } });
      setGenerated(resp.data);
    } catch (e) {
      alert("Error: " + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {!token ? (
        <div>
          <h3>Login</h3>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <br/>
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <br/>
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <div>
          <button onClick={logout}>Logout</button>
          <h3>Scan QR untuk Absen (kamera)</h3>
          <div style={{ width: 300 }}>
            <QRReader
              delay={300}
              onError={err => console.error(err)}
              onScan={handleScan}
              style={{ width: "100%" }}
            />
          </div>
          <p>Hasil scan: {scanResult}</p>

          <h3>Admin: Generate QR Session</h3>
          <button onClick={generateQr}>Generate QR (admin)</button>
          {generated && (
            <div>
              <p>Token: {generated.token}</p>
              <QRCode value={generated.token} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
