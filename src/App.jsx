import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
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
  const [tab,setTab]=useState("inicio");
  const [clientes,setClientes]=useState([]);
  const [motos,setMotos]=useState([]);
  const [pagos,setPagos]=useState([]);
  const [ultimo,setUltimo]=useState(null);

  const [cliente,setCliente]=useState({
    nombre:"",
    cedula:"",
    telefono:"",
    direccion:"",
    referencia:"",
    riesgo:"Nuevo cliente"
  });

  const [moto,setMoto]=useState({
    placa:"",
    marca:"",
    modelo:"",
    anio:"",
    tracker:"",
    clienteId:"",
    pagoDiario:"400",
    deposito:"5000"
  });

  const [pago,setPago]=useState({
    motoId:"",
    monto:"400",
    metodo:"Efectivo"
  });

  const [editCliente,setEditCliente]=useState(null);
  const [editMoto,setEditMoto]=useState(null);

  async function cargar(){
    const c = await getDocs(collection(db,"clientes"));
    const m = await getDocs(collection(db,"motos"));
    const p = await getDocs(collection(db,"pagos"));

    setClientes(c.docs.map(d=>({id:d.id,...d.data()})));
    setMotos(m.docs.map(d=>({id:d.id,...d.data()})));
    setPagos(p.docs.map(d=>({id:d.id,...d.data()})));
  }

  useEffect(()=>{ cargar(); },[]);

  async function guardarCliente(){
    if(!cliente.nombre){
      alert("El nombre del cliente es obligatorio");
      return;
    }

    if(editCliente){
      await updateDoc(doc(db,"clientes",editCliente),cliente);
      setEditCliente(null);
    } else {
      await addDoc(collection(db,"clientes"),cliente);
    }

    setCliente({
      nombre:"",
      cedula:"",
      telefono:"",
      direccion:"",
      referencia:"",
      riesgo:"Nuevo cliente"
    });

    cargar();
  }

  function editarCliente(c){
    setCliente({
      nombre:c.nombre || "",
      cedula:c.cedula || "",
      telefono:c.telefono || "",
      direccion:c.direccion || "",
      referencia:c.referencia || "",
      riesgo:c.riesgo || "Nuevo cliente"
    });
    setEditCliente(c.id);
    setTab("clientes");
  }

  async function eliminarCliente(id){
    if(confirm("¿Eliminar este cliente? Las motos asignadas quedarán sin cliente.")){
      await deleteDoc(doc(db,"clientes",id));

      const motosAsignadas = motos.filter(m=>m.clienteId===id);
      for(const m of motosAsignadas){
        await updateDoc(doc(db,"motos",m.id),{...m,clienteId:""});
      }

      cargar();
    }
  }

  async function guardarMoto(){
    if(!moto.placa){
      alert("La placa de la moto es obligatoria");
      return;
    }

    const datosMoto = {
      ...moto,
      estado: moto.clienteId ? "Alquilada" : "Disponible"
    };

    if(editMoto){
      await updateDoc(doc(db,"motos",editMoto),datosMoto);
      setEditMoto(null);
    } else {
      await addDoc(collection(db,"motos"),datosMoto);
    }

    setMoto({
      placa:"",
      marca:"",
      modelo:"",
      anio:"",
      tracker:"",
      clienteId:"",
      pagoDiario:"400",
      deposito:"5000"
    });

    cargar();
  }

  function editarMoto(m){
    setMoto({
      placa:m.placa || "",
      marca:m.marca || "",
      modelo:m.modelo || "",
      anio:m.anio || "",
      tracker:m.tracker || "",
      clienteId:m.clienteId || "",
      pagoDiario:m.pagoDiario || "400",
      deposito:m.deposito || "5000"
    });
    setEditMoto(m.id);
    setTab("motos");
  }

  async function eliminarMoto(id){
    if(confirm("¿Eliminar esta moto del inventario?")){
      await deleteDoc(doc(db,"motos",id));
      cargar();
    }
  }

  function generarID(){
    const fecha = new Date();
    const ym = fecha.toISOString().slice(0,7).replace("-","");
    const seq = String(pagos.length+1).padStart(2,"0");
    return `${ym}-${seq}`;
  }

  async function registrarPago(){
    const motoSeleccionada = motos.find(m=>m.id===pago.motoId);

    if(!motoSeleccionada){
      alert("Selecciona una moto");
      return;
    }

    const clienteSeleccionado = clientes.find(c=>c.id===motoSeleccionada.clienteId);
    const id = generarID();

    const comprobante = {
      id,
      fecha: new Date().toISOString().slice(0,10),
      clienteId: clienteSeleccionado?.id || "",
      cliente: clienteSeleccionado?.nombre || "",
      motoId: motoSeleccionada.id,
      moto: `${motoSeleccionada.placa} ${motoSeleccionada.marca || ""} ${motoSeleccionada.modelo || ""}`,
      monto: pago.monto,
      metodo: pago.metodo,
      url: `${BASE_URL}/validar/${id}`
    };

    await addDoc(collection(db,"pagos"), comprobante);
    setUltimo(comprobante);
    setPago({motoId:"", monto:"400", metodo:"Efectivo"});
    cargar();
  }

  return (
    <div style={{padding:40}}>
      <h1>Pronto Moto Control</h1>

      <button onClick={cargar}>Actualizar</button>
      <button onClick={()=>signOut(auth)}>Salir</button>

      <div style={{marginTop:20}}>
        <button onClick={()=>setTab("inicio")}>Inicio</button>
        <button onClick={()=>setTab("clientes")}>Clientes</button>
        <button onClick={()=>setTab("motos")}>Motos</button>
        <button onClick={()=>setTab("pagos")}>Pagos</button>
      </div>

      {tab==="inicio" && (
        <div>
          <h2>Resumen</h2>
          <p>Clientes: {clientes.length}</p>
          <p>Motos: {motos.length}</p>
          <p>Pagos: {pagos.length}</p>
        </div>
      )}

      {tab==="clientes" && (
        <div>
          <h2>{editCliente ? "Editar cliente" : "Crear cliente"}</h2>

          <input placeholder="Nombre" value={cliente.nombre} onChange={e=>setCliente({...cliente,nombre:e.target.value})}/>
          <input placeholder="Cédula" value={cliente.cedula} onChange={e=>setCliente({...cliente,cedula:e.target.value})}/>
          <input placeholder="Teléfono" value={cliente.telefono} onChange={e=>setCliente({...cliente,telefono:e.target.value})}/>
          <input placeholder="Dirección" value={cliente.direccion} onChange={e=>setCliente({...cliente,direccion:e.target.value})}/>
          <input placeholder="Referencia" value={cliente.referencia} onChange={e=>setCliente({...cliente,referencia:e.target.value})}/>
          <input placeholder="Riesgo" value={cliente.riesgo} onChange={e=>setCliente({...cliente,riesgo:e.target.value})}/>

          <button onClick={guardarCliente}>{editCliente ? "Guardar cambios" : "Crear cliente"}</button>

          {clientes.map(c=>(
            <div key={c.id} style={{border:"1px solid #ddd",padding:10,marginTop:10}}>
              <b>{c.nombre}</b>
              <p>{c.telefono} · {c.cedula}</p>
              <p>{c.direccion}</p>
              <small>ID: {c.id}</small><br/>
              <button onClick={()=>editarCliente(c)}>Editar</button>
              <button onClick={()=>eliminarCliente(c.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}

      {tab==="motos" && (
        <div>
          <h2>{editMoto ? "Editar moto" : "Crear moto"}</h2>

          <input placeholder="Placa" value={moto.placa} onChange={e=>setMoto({...moto,placa:e.target.value})}/>
          <input placeholder="Marca" value={moto.marca} onChange={e=>setMoto({...moto,marca:e.target.value})}/>
          <input placeholder="Modelo" value={moto.modelo} onChange={e=>setMoto({...moto,modelo:e.target.value})}/>
          <input placeholder="Año" value={moto.anio} onChange={e=>setMoto({...moto,anio:e.target.value})}/>
          <input placeholder="Tracker / GPS" value={moto.tracker} onChange={e=>setMoto({...moto,tracker:e.target.value})}/>

          <select value={moto.clienteId} onChange={e=>setMoto({...moto,clienteId:e.target.value})}>
            <option value="">Sin cliente asignado</option>
            {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>

          <input placeholder="Pago diario" value={moto.pagoDiario} onChange={e=>setMoto({...moto,pagoDiario:e.target.value})}/>
          <input placeholder="Depósito" value={moto.deposito} onChange={e=>setMoto({...moto,deposito:e.target.value})}/>

          <button onClick={guardarMoto}>{editMoto ? "Guardar cambios" : "Crear moto"}</button>

          {motos.map(m=>(
            <div key={m.id} style={{border:"1px solid #ddd",padding:10,marginTop:10}}>
              <b>{m.placa}</b>
              <p>{m.marca} {m.modelo} · {m.anio}</p>
              <p>Pago diario: RD${m.pagoDiario}</p>
              <p>Estado: {m.estado || "Disponible"}</p>
              <p>Cliente: {clientes.find(c=>c.id===m.clienteId)?.nombre || "Sin asignar"}</p>
              <button onClick={()=>editarMoto(m)}>Editar</button>
              <button onClick={()=>eliminarMoto(m.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}

      {tab==="pagos" && (
        <div>
          <h2>Registrar pago</h2>

          <select value={pago.motoId} onChange={e=>setPago({...pago,motoId:e.target.value})}>
            <option value="">Seleccionar moto</option>
            {motos.map(m=><option key={m.id} value={m.id}>{m.placa}</option>)}
          </select>

          <input placeholder="Monto" value={pago.monto} onChange={e=>setPago({...pago,monto:e.target.value})}/>

          <select value={pago.metodo} onChange={e=>setPago({...pago,metodo:e.target.value})}>
            <option>Efectivo</option>
            <option>Transferencia bancaria</option>
          </select>

          <button onClick={registrarPago}>Generar comprobante</button>

          {ultimo && (
            <div style={{marginTop:20,border:"1px solid #ddd",padding:15}}>
              <h2>Comprobante</h2>
              <p><b>ID:</b> {ultimo.id}</p>
              <p><b>Cliente:</b> {ultimo.cliente}</p>
              <p><b>Moto:</b> {ultimo.moto}</p>
              <p><b>Monto:</b> RD${ultimo.monto}</p>
              <QRCodeCanvas value={ultimo.url} />
              <p>{ultimo.url}</p>
            </div>
          )}

          <h2>Historial de pagos</h2>
          {pagos.map(p=>(
            <div key={p.id} style={{border:"1px solid #ddd",padding:10,marginTop:10}}>
              <b>{p.id}</b>
              <p>{p.fecha} · {p.cliente}</p>
              <p>{p.moto} · RD${p.monto}</p>
            </div>
          ))}
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