import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";
import { QRCodeCanvas } from "qrcode.react";

const BASE_URL = window.location.origin;

function Login() {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");

  return (
    <div style={{padding:40}}>
      <h1>Pronto Moto Control</h1>
      <input placeholder="Correo" onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Contraseña" type="password" onChange={e=>setPass(e.target.value)} />
      <button onClick={()=>signInWithEmailAndPassword(auth,email,pass)}>Entrar</button>
    </div>
  );
}

function ValidarComprobante() {
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    async function cargar(){
      const id = window.location.pathname.split("/validar/")[1];
      const snap = await getDocs(collection(db,"pagos"));
      const pagos = snap.docs.map(d=>d.data());
      const encontrado = pagos.find(p=>p.id===id);
      setData(encontrado || null);
      setLoading(false);
    }
    cargar();
  },[]);

  if(loading) return <div style={{padding:40}}><h1>Validando...</h1></div>;
  if(!data) return <div style={{padding:40}}><h1>Comprobante no encontrado</h1></div>;

  return (
    <div style={{padding:40}}>
      <h1>Comprobante válido</h1>
      <p><b>ID:</b> {data.id}</p>
      <p><b>Fecha:</b> {data.fecha}</p>
      <p><b>Cliente:</b> {data.cliente}</p>
      <p><b>Moto:</b> {data.moto}</p>
      <p><b>Monto:</b> RD${data.monto}</p>
      <p><b>Método:</b> {data.metodo}</p>
    </div>
  );
}

function Dashboard() {
  const [clientes,setClientes]=useState([]);
  const [motos,setMotos]=useState([]);
  const [pagos,setPagos]=useState([]);
  const [pago,setPago]=useState({motoId:"", monto:"400", metodo:"Efectivo"});
  const [ultimo,setUltimo]=useState(null);

  async function cargar(){
    const c = await getDocs(collection(db,"clientes"));
    const m = await getDocs(collection(db,"motos"));
    const p = await getDocs(collection(db,"pagos"));
    setClientes(c.docs.map(d=>({id:d.id,...d.data()})));
    setMotos(m.docs.map(d=>({id:d.id,...d.data()})));
    setPagos(p.docs.map(d=>({id:d.id,...d.data()})));
  }

  useEffect(()=>{ cargar(); },[]);

  function generarID(){
    const fecha = new Date();
    const ym = fecha.toISOString().slice(0,7).replace("-","");
    const seq = String(pagos.length+1).padStart(2,"0");
    return `${ym}-${seq}`;
  }

  async function registrarPago(){
    const moto = motos.find(m=>m.id===pago.motoId);
    const cliente = clientes.find(c=>c.id===moto?.clienteId);

    const id = generarID();

    const comprobante = {
      id,
      fecha: new Date().toISOString().slice(0,10),
      cliente: cliente?.nombre || "",
      moto: moto?.placa || "",
      monto: pago.monto,
      metodo: pago.metodo,
      url: `${BASE_URL}/validar/${id}`
    };

    await addDoc(collection(db,"pagos"), comprobante);
    setUltimo(comprobante);
    cargar();
  }

  return (
    <div style={{padding:40}}>
      <h1>Pronto Moto Control</h1>

      <button onClick={cargar}>Actualizar</button>
      <button onClick={()=>signOut(auth)}>Salir</button>

      <h2>Registrar pago</h2>

      <select onChange={e=>setPago({...pago,motoId:e.target.value})}>
        <option value="">Seleccionar moto</option>
        {motos.map(m=><option key={m.id} value={m.id}>{m.placa}</option>)}
      </select>

      <input placeholder="Monto" value={pago.monto} onChange={e=>setPago({...pago,monto:e.target.value})} />

      <select value={pago.metodo} onChange={e=>setPago({...pago,metodo:e.target.value})}>
        <option>Efectivo</option>
        <option>Transferencia</option>
      </select>

      <button onClick={registrarPago}>Generar comprobante</button>

      {ultimo && (
        <div style={{marginTop:20}}>
          <h2>Comprobante</h2>
          <p>{ultimo.id}</p>
          <QRCodeCanvas value={ultimo.url} />
          <p>{ultimo.url}</p>
        </div>
      )}
    </div>
  );
}

function App(){
  const [user,setUser]=useState(null);
  const path = window.location.pathname;

  useEffect(()=>onAuthStateChanged(auth,setUser),[]);

  if(path.startsWith("/validar/")){
    return <ValidarComprobante />;
  }

  if(!user) return <Login />;
  return <Dashboard />;
}

createRoot(document.getElementById("root")).render(<App />);