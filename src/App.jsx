import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { QRCodeCanvas } from "qrcode.react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import "./style.css";

const BASE_URL = window.location.origin;

function money(n) {
  return "RD$" + Number(n || 0).toLocaleString();
}

function yyyymm(date) {
  return String(date || new Date().toISOString().slice(0, 10)).slice(0, 7).replace("-", "");
}

function ErrorBox({ message }) {
  return (
    <div className="page">
      <div className="card error">
        <h1>La app cargó, pero hay un error</h1>
        <p>{message}</p>
        <p>Verifica que Email/Password esté activo y que Firestore esté creado en Firebase.</p>
      </div>
    </div>
  );
}

function ValidationPage({ receiptId }) {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "receipts", receiptId));
        setReceipt(snap.exists() ? snap.data() : null);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [receiptId]);

  if (loading) return <div className="page"><div className="card"><h2>Validando comprobante...</h2></div></div>;
  if (err) return <ErrorBox message={err} />;
  if (!receipt) return <div className="page"><div className="card"><h2>Comprobante no encontrado</h2><p>Este comprobante no existe o fue eliminado.</p></div></div>;

  return (
    <div className="page receipt-public">
      <div className="card">
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
    </div>
  );
}

function Dashboard() {
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
  const [err, setErr] = useState("");

  async function refresh() {
    try {
      const cs = await getDocs(collection(db, "clients"));
      const bs = await getDocs(collection(db, "bikes"));
      const ps = await getDocs(collection(db, "payments"));
      setClients(cs.docs.map(d => ({ id: d.id, ...d.data() })));
      setBikes(bs.docs.map(d => ({ id: d.id, ...d.data() })));
      setPayments(ps.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function quickCreateReceipt() {
    setErr("");
    try {
      if (!form.clientName || !form.bikePlate || !form.amount) {
        setErr("Completa al menos nombre del cliente, placa y monto.");
        return;
      }

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
    } catch (e) {
      setErr(e.message);
    }
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

      {err && <div className="card error"><b>Error:</b> {err}</div>}

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
  const [err, setErr] = useState("");

  async function doLogin() {
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="login">
      <div className="card">
        <h1>Pronto Moto Control</h1>
        <p>Acceso privado</p>
        {err && <div className="error">{err}</div>}
        <input placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Contraseña" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
        <button onClick={doLogin}>Entrar</button>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(undefined);
  const [fatal, setFatal] = useState("");

  useEffect(() => {
    try {
      return onAuthStateChanged(auth, setUser, err => setFatal(err.message));
    } catch (e) {
      setFatal(e.message);
    }
  }, []);

  const path = window.location.pathname;
  const match = path.match(/^\/validar\/([^/]+)/);

  if (fatal) return <ErrorBox message={fatal} />;
  if (match) return <ValidationPage receiptId={decodeURIComponent(match[1])} />;
  if (user === undefined) return <div className="page"><div className="card"><h2>Cargando...</h2></div></div>;
  if (!user) return <Login />;
  return <Dashboard />;
}

createRoot(document.getElementById("root")).render(<App />);
