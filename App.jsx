import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { QRCodeCanvas } from "qrcode.react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import "./style.css";

const BASE_URL = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;

function money(n) {
  return "RD$" + Number(n || 0).toLocaleString();
}

function yyyymm(date) {
  return String(date || new Date().toISOString().slice(0, 10)).slice(0, 7).replace("-", "");
}

function ValidationPage({ receiptId }) {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "receipts", receiptId));
      setReceipt(snap.exists() ? snap.data() : null);
      setLoading(false);
    }
    load();
  }, [receiptId]);

  if (loading) return <div className="page"><h2>Validando comprobante...</h2></div>;
  if (!receipt) return <div className="page"><h2>Comprobante no encontrado</h2><p>Este comprobante no existe o fue eliminado.</p></div>;

  return (
    <div className="page receipt-public">
      <h1>Comprobante válido</h1>
      <p><b>ID:</b> {receipt.id}</p>
      <p><b>Fecha:</b> {receipt.date}</p>
      <p><b>Cliente:</b> {receipt.clientName} (ID {receipt.clientId})</p>
      <p><b>Moto:</b> {receipt.bikeData}</p>
      <p><b>Monto pagado:</b> {money(receipt.amountPaid)}</p>
      <p><b>Monto pendiente:</b> {money(receipt.amountPending)}</p>
      <p><b>Método:</b> {receipt.method}</p>
      <p className="valid">Verificado en la nube</p>
    </div>
  );
}

function Dashboard({ user }) {
  const [clients, setClients] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientCedula: "",
    bikePlate: "",
    bikeBrand: "",
    bikeModel: "",
    amount: 400,
    method: "Efectivo",
  });
  const [lastReceipt, setLastReceipt] = useState(null);

  async function refresh() {
    const cs = await getDocs(query(collection(db, "clients"), orderBy("createdAt", "desc")));
    const bs = await getDocs(query(collection(db, "bikes"), orderBy("createdAt", "desc")));
    const ps = await getDocs(query(collection(db, "payments"), orderBy("createdAt", "desc")));
    setClients(cs.docs.map(d => ({ id: d.id, ...d.data() })));
    setBikes(bs.docs.map(d => ({ id: d.id, ...d.data() })));
    setPayments(ps.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => { refresh(); }, []);

  async function quickCreateReceipt() {
    const clientRef = await addDoc(collection(db, "clients"), {
      name: form.clientName,
      phone: form.clientPhone,
      cedula: form.clientCedula,
      createdAt: serverTimestamp(),
    });

    const bikeRef = await addDoc(collection(db, "bikes"), {
      plate: form.bikePlate,
      brand: form.bikeBrand,
      model: form.bikeModel,
      clientId: clientRef.id,
      createdAt: serverTimestamp(),
    });

    const countSnap = await getDocs(collection(db, "receipts"));
    const sequence = String(countSnap.size + 1).padStart(2, "0");
    const receiptId = `${yyyymm(new Date().toISOString().slice(0, 10))}-${sequence}`;

    const receipt = {
      id: receiptId,
      date: new Date().toISOString().slice(0, 10),
      clientId: clientRef.id,
      clientName: form.clientName,
      bikeId: bikeRef.id,
      bikeData: `${form.bikePlate} · ${form.bikeBrand} ${form.bikeModel}`,
      amountPaid: Number(form.amount || 0),
      amountPending: 0,
      method: form.method,
      validationUrl: `${BASE_URL}/validar/${receiptId}`,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "receipts", receiptId), receipt);
    await addDoc(collection(db, "payments"), receipt);

    setLastReceipt(receipt);
    await refresh();
  }

  return (
    <div className="page">
      <header>
        <div>
          <h1>Pronto Moto Control</h1>
          <p>App en la nube con comprobantes QR reales</p>
        </div>
        <button onClick={() => signOut(auth)}>Salir</button>
      </header>

      <section className="card">
        <h2>Crear comprobante rápido</h2>
        <div className="grid">
          <input placeholder="Nombre cliente" value={form.clientName} onChange={e=>setForm({...form, clientName:e.target.value})}/>
          <input placeholder="Teléfono cliente" value={form.clientPhone} onChange={e=>setForm({...form, clientPhone:e.target.value})}/>
          <input placeholder="Cédula cliente" value={form.clientCedula} onChange={e=>setForm({...form, clientCedula:e.target.value})}/>
          <input placeholder="Placa moto" value={form.bikePlate} onChange={e=>setForm({...form, bikePlate:e.target.value})}/>
          <input placeholder="Marca moto" value={form.bikeBrand} onChange={e=>setForm({...form, bikeBrand:e.target.value})}/>
          <input placeholder="Modelo moto" value={form.bikeModel} onChange={e=>setForm({...form, bikeModel:e.target.value})}/>
          <input type="number" placeholder="Monto pagado" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})}/>
          <select value={form.method} onChange={e=>setForm({...form, method:e.target.value})}>
            <option>Efectivo</option>
            <option>Transferencia bancaria</option>
          </select>
        </div>
        <button onClick={quickCreateReceipt}>Generar comprobante con QR real</button>
      </section>

      {lastReceipt && (
        <section className="card receipt">
          <h2>Comprobante generado</h2>
          <p><b>ID:</b> {lastReceipt.id}</p>
          <p><b>Cliente:</b> {lastReceipt.clientName}</p>
          <p><b>Moto:</b> {lastReceipt.bikeData}</p>
          <p><b>Monto:</b> {money(lastReceipt.amountPaid)}</p>
          <QRCodeCanvas value={lastReceipt.validationUrl} size={160} />
          <p className="url">{lastReceipt.validationUrl}</p>
          <button onClick={() => window.open(lastReceipt.validationUrl, "_blank")}>Abrir validación</button>
          <button onClick={() => window.print()}>Imprimir / PDF</button>
        </section>
      )}

      <section className="card">
        <h2>Resumen</h2>
        <p>Clientes: {clients.length}</p>
        <p>Motos: {bikes.length}</p>
        <p>Pagos: {payments.length}</p>
      </section>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <div className="login">
      <div className="card">
        <h1>Pronto Moto Control</h1>
        <p>Acceso privado</p>
        <input placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Contraseña" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
        <button onClick={() => signInWithEmailAndPassword(auth, email, pass)}>Entrar</button>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const path = window.location.pathname;
  const match = path.match(/^\/validar\/([^/]+)/);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (match) return <ValidationPage receiptId={decodeURIComponent(match[1])} />;
  if (!user) return <Login />;
  return <Dashboard user={user} />;
}

createRoot(document.getElementById("root")).render(<App />);
