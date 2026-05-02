import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

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
  const [tab,setTab]=useState("inicio");
  const [clientes,setClientes]=useState([]);
  const [motos,setMotos]=useState([]);
  const [cliente,setCliente]=useState({nombre:"", cedula:"", telefono:"", direccion:""});
  const [moto,setMoto]=useState({placa:"", marca:"", modelo:"", anio:"", clienteId:"", pagoDiario:"400"});
  const [editCliente,setEditCliente]=useState(null);
  const [editMoto,setEditMoto]=useState(null);

  async function cargarDatos(){
    const c = await getDocs(collection(db,"clientes"));
    const m = await getDocs(collection(db,"motos"));
    setClientes(c.docs.map(d=>({id:d.id,...d.data()})));
    setMotos(m.docs.map(d=>({id:d.id,...d.data()})));
  }

  useEffect(()=>{ cargarDatos(); },[]);

  async function guardarCliente(){
    if(editCliente){
      await updateDoc(doc(db,"clientes",editCliente),cliente);
      setEditCliente(null);
    } else {
      await addDoc(collection(db,"clientes"),cliente);
    }
    setCliente({nombre:"", cedula:"", telefono:"", direccion:""});
    cargarDatos();
  }

  async function guardarMoto(){
    if(editMoto){
      await updateDoc(doc(db,"motos",editMoto),moto);
      setEditMoto(null);
    } else {
      await addDoc(collection(db,"motos"),moto);
    }
    setMoto({placa:"", marca:"", modelo:"", anio:"", clienteId:"", pagoDiario:"400"});
    cargarDatos();
  }

  async function eliminarCliente(id){
    if(confirm("¿Eliminar este cliente?")){
      await deleteDoc(doc(db,"clientes",id));
      cargarDatos();
    }
  }

  async function eliminarMoto(id){
    if(confirm("¿Eliminar esta moto?")){
      await deleteDoc(doc(db,"motos",id));
      cargarDatos();
    }
  }

  function editarCliente(c){
    setCliente(c);
    setEditCliente(c.id);
  }

  function editarMoto(m){
    setMoto(m);
    setEditMoto(m.id);
  }

  return (
    <div style={{padding:40}}>
      <h1>Pronto Moto Control</h1>
      <button onClick={()=>signOut(auth)}>Salir</button>

      <div style={{marginTop:20}}>
        <button onClick={()=>setTab("inicio")}>Inicio</button>
        <button onClick={()=>setTab("clientes")}>Clientes</button>
        <button onClick={()=>setTab("motos")}>Motos</button>
      </div>

      {tab==="inicio" && (
        <div>
          <h2>Resumen</h2>
          <p>Clientes: {clientes.length}</p>
          <p>Motos: {motos.length}</p>
        </div>
      )}

      {tab==="clientes" && (
        <div>
          <h2>Clientes</h2>
          <input placeholder="Nombre" value={cliente.nombre} onChange={e=>setCliente({...cliente,nombre:e.target.value})}/>
          <input placeholder="Cédula" value={cliente.cedula} onChange={e=>setCliente({...cliente,cedula:e.target.value})}/>
          <input placeholder="Teléfono" value={cliente.telefono} onChange={e=>setCliente({...cliente,telefono:e.target.value})}/>
          <input placeholder="Dirección" value={cliente.direccion} onChange={e=>setCliente({...cliente,direccion:e.target.value})}/>
          <button onClick={guardarCliente}>{editCliente ? "Guardar cambios" : "Crear cliente"}</button>

          {clientes.map(c=>(
            <div key={c.id} style={{border:"1px solid #ddd",padding:10,marginTop:10}}>
              <b>{c.nombre}</b>
              <p>{c.telefono} · {c.cedula}</p>
              <button onClick={()=>editarCliente(c)}>Editar</button>
              <button onClick={()=>eliminarCliente(c.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}

      {tab==="motos" && (
        <div>
          <h2>Motos</h2>
          <input placeholder="Placa" value={moto.placa} onChange={e=>setMoto({...moto,placa:e.target.value})}/>
          <input placeholder="Marca" value={moto.marca} onChange={e=>setMoto({...moto,marca:e.target.value})}/>
          <input placeholder="Modelo" value={moto.modelo} onChange={e=>setMoto({...moto,modelo:e.target.value})}/>
          <input placeholder="Año" value={moto.anio} onChange={e=>setMoto({...moto,anio:e.target.value})}/>
          <input placeholder="ID Cliente asignado" value={moto.clienteId} onChange={e=>setMoto({...moto,clienteId:e.target.value})}/>
          <input placeholder="Pago diario" value={moto.pagoDiario} onChange={e=>setMoto({...moto,pagoDiario:e.target.value})}/>
          <button onClick={guardarMoto}>{editMoto ? "Guardar cambios" : "Crear moto"}</button>

          {motos.map(m=>(
            <div key={m.id} style={{border:"1px solid #ddd",padding:10,marginTop:10}}>
              <b>{m.placa}</b>
              <p>{m.marca} {m.modelo} · RD${m.pagoDiario}</p>
              <p>ID Cliente: {m.clienteId || "Sin asignar"}</p>
              <button onClick={()=>editarMoto(m)}>Editar</button>
              <button onClick={()=>eliminarMoto(m.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [user,setUser]=useState(null);
  useEffect(()=>onAuthStateChanged(auth,setUser),[]);
  if(!user) return <Login />;
  return <Dashboard />;
}

createRoot(document.getElementById("root")).render(<App />);