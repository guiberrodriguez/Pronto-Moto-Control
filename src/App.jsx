import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage } from "./firebase";
import { QRCodeCanvas } from "qrcode.react";

const BASE_URL = window.location.origin;

/* LOGIN */
function Login() {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");

  return (
    <div style={{padding:40}}>
      <h1>Pronto Moto Control</h1>
      <input placeholder="Correo" onChange={e=>setEmail(e.target.value)} />
      <input type="password" placeholder="Contraseña" onChange={e=>setPass(e.target.value)} />
      <button onClick={()=>signInWithEmailAndPassword(auth,email,pass)}>Entrar</button>
    </div>
  );
}

/* VALIDAR QR */
function ValidarComprobante() {
  const [data,setData]=useState(null);

  useEffect(()=>{
    async function load(){
      const id = window.location.pathname.split("/validar/")[1];
      const snap = await getDocs(collection(db,"pagos"));
      const pagos = snap.docs.map(d=>d.data());
      setData(pagos.find(p=>p.id===id));
    }
    load();
  },[]);

  if(!data) return <h2 style={{padding:40}}>No encontrado</h2>;

  return (
    <div style={{padding:40}}>
      <h1>Comprobante válido</h1>
      <p>{data.id}</p>
      <p>{data.cliente}</p>
      <p>{data.moto}</p>
      <p>RD${data.monto}</p>
    </div>
  );
}

/* IMPRESIÓN SEGURA */
function printDoc(html){
  const iframe = document.createElement("iframe");
  iframe.style.display="none";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;

  doc.open();
  doc.write(`<html><body>${html}</body></html>`);
  doc.close();

  setTimeout(()=>{
    iframe.contentWindow.print();
  },500);
}

/* DASHBOARD */
function Dashboard(){

  const [tab,setTab]=useState("inicio");

  const [clientes,setClientes]=useState([]);
  const [motos,setMotos]=useState([]);
  const [pagos,setPagos]=useState([]);
  const [gastos,setGastos]=useState([]);
  const [adjuntos,setAdjuntos]=useState([]);

  const [archivo,setArchivo]=useState(null);
  const [clienteAdjunto,setClienteAdjunto]=useState("");

  const [pago,setPago]=useState({motoId:"",monto:"400"});

  async function cargar(){
    setClientes((await getDocs(collection(db,"clientes"))).docs.map(d=>({id:d.id,...d.data()})));
    setMotos((await getDocs(collection(db,"motos"))).docs.map(d=>({id:d.id,...d.data()})));
    setPagos((await getDocs(collection(db,"pagos"))).docs.map(d=>({id:d.id,...d.data()})));
    setGastos((await getDocs(collection(db,"gastos"))).docs.map(d=>({id:d.id,...d.data()})));
    setAdjuntos((await getDocs(collection(db,"adjuntos"))).docs.map(d=>({id:d.id,...d.data()})));
  }

  useEffect(()=>{cargar();},[]);

  /* PAGO */
  async function crearPago(){
    const moto = motos.find(m=>m.id===pago.motoId);
    const cliente = clientes.find(c=>c.id===moto?.clienteId);

    const id = Date.now().toString();

    const data={
      id,
      cliente:cliente?.nombre,
      moto:moto?.placa,
      monto:pago.monto,
      fecha:new Date().toISOString().slice(0,10),
      url:`${BASE_URL}/validar/${id}`
    };

    await addDoc(collection(db,"pagos"),data);
    cargar();
  }

  /* ADJUNTOS */
  async function subirAdjunto(){
    if(!archivo || !clienteAdjunto) return alert("Faltan datos");

    const ruta=`clientes/${clienteAdjunto}/${Date.now()}-${archivo.name}`;
    const fileRef=ref(storage,ruta);

    await uploadBytes(fileRef,archivo);
    const url=await getDownloadURL(fileRef);

    await addDoc(collection(db,"adjuntos"),{
      clienteId:clienteAdjunto,
      nombre:archivo.name,
      url,
      ruta
    });

    setArchivo(null);
    cargar();
  }

  async function eliminarAdjunto(a){
    await deleteObject(ref(storage,a.ruta));
    await deleteDoc(doc(db,"adjuntos",a.id));
    cargar();
  }

  return (
    <div style={{padding:20}}>
      <h1>Dashboard</h1>

      <button onClick={()=>setTab("pagos")}>Pagos</button>
      <button onClick={()=>setTab("adjuntos")}>Adjuntos</button>

      {tab==="pagos" && (
        <div>
          <select onChange={e=>setPago({...pago,motoId:e.target.value})}>
            <option>Seleccionar moto</option>
            {motos.map(m=><option key={m.id} value={m.id}>{m.placa}</option>)}
          </select>

          <input value={pago.monto} onChange={e=>setPago({...pago,monto:e.target.value})}/>
          <button onClick={crearPago}>Crear pago</button>
        </div>
      )}

      {tab==="adjuntos" && (
        <div>
          <select onChange={e=>setClienteAdjunto(e.target.value)}>
            <option>Seleccionar cliente</option>
            {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>

          <input type="file" onChange={e=>setArchivo(e.target.files[0])}/>
          <button onClick={subirAdjunto}>Subir</button>

          {adjuntos.map(a=>(
            <div key={a.id}>
              <a href={a.url} target="_blank">{a.nombre}</a>
              <button onClick={()=>eliminarAdjunto(a)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* APP */
function App(){
  const [user,setUser]=useState(null);
  const path=window.location.pathname;

  useEffect(()=>onAuthStateChanged(auth,setUser),[]);

  if(path.includes("/validar/")) return <ValidarComprobante/>;
  if(!user) return <Login/>;

  return <Dashboard/>;
}

createRoot(document.getElementById("root")).render(<App />);