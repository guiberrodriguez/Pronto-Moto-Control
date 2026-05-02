import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore";
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

  useEffect(()=>{cargar();},[]);

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

  function validarURL(){
    const path = window.location.pathname;
    if(path.startsWith("/validar/")){
      const id = path.split("/validar/")[1];
      const data = pagos.find(p=>p.id===id);

      if(!data){
        return <h1>Comprobante no encontrado</h1>;
      }

      return (
        <div style={{padding:40}}>
          <h1>Comprobante válido</h1>
          <p>ID: {data.id}</p>
          <p>Cliente: {data.cliente}</p>
          <p>Moto: {data.moto}</p>
          <p>Monto: RD${data.monto}</p>
        </div>
      );
    }
  }

  if(window.location.pathname.includes("/validar/")){
    return validarURL();
  }

  return (
    <div style={{padding:40}}>
      <h1>Pagos</h1>
      <button onClick={()=>signOut(auth)}>Salir</button>

      <select onChange={e=>setPago({...pago,motoId:e.target.value})}>
        <option>Seleccionar moto</option>
        {motos.map(m=><option value={m.id}>{m.placa}</option>)}
      </select>

      <input placeholder="Monto" onChange={e=>setPago({...pago,monto:e.target.value})} />
      <select onChange={e=>setPago({...pago,metodo:e.target.value})}>
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

function ValidarComprobante(){
  const [comprobante,setComprobante]=useState(null);
  const [cargando,setCargando]=useState(true);

  useEffect(()=>{
    async function cargar(){
      const id = window.location.pathname.split("/validar/")[1];
      const snap = await getDocs(collection(db,"pagos"));
      const pagos = snap.docs.map(d=>({idDoc:d.id,...d.data()}));
      const encontrado = pagos.find(p=>p.id===id);
      setComprobante(encontrado || null);
      setCargando(false);
    }
    cargar();
  },[]);

  if(cargando) return <div style={{padding:40}}><h1>Validando comprobante...</h1></div>;

  if(!comprobante){
    return (
      <div style={{padding:40}}>
        <h1>Comprobante no encontrado</h1>
      </div>
    );
  }

  return (
    <div style={{padding:40}}>
      <h1>Comprobante válido</h1>
      <p><b>ID:</b> {comprobante.id}</p>
      <p><b>Fecha:</b> {comprobante.fecha}</p>
      <p><b>Cliente:</b> {comprobante.cliente}</p>
      <p><b>Moto:</b> {comprobante.moto}</p>
      <p><b>Monto:</b> RD${comprobante.monto}</p>
      <p><b>Método:</b> {comprobante.metodo}</p>
    </div>
  );
}





    

