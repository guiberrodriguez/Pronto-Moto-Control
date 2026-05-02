import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

function Login({onLogin}) {
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

  return (
    <div style={{padding:40}}>
      <h1>Panel Principal</h1>
      <button onClick={()=>signOut(auth)}>Salir</button>

      <div style={{marginTop:20}}>
        <button onClick={()=>setTab("inicio")}>Inicio</button>
        <button onClick={()=>setTab("clientes")}>Clientes</button>
        <button onClick={()=>setTab("motos")}>Motos</button>
        <button onClick={()=>setTab("pagos")}>Pagos</button>
        <button onClick={()=>setTab("gastos")}>Gastos</button>
      </div>

      <div style={{marginTop:30}}>
        {tab==="inicio" && <h2>Bienvenido al sistema</h2>}
        {tab==="clientes" && <h2>Módulo Clientes</h2>}
        {tab==="motos" && <h2>Módulo Motos</h2>}
        {tab==="pagos" && <h2>Módulo Pagos</h2>}
        {tab==="gastos" && <h2>Módulo Gastos</h2>}
      </div>
    </div>
  );
}

function App() {
  const [user,setUser]=useState(null);

  useEffect(()=>{
    onAuthStateChanged(auth,setUser);
  },[]);

  if(!user) return <Login />;
  return <Dashboard />;
}

createRoot(document.getElementById("root")).render(<App />);