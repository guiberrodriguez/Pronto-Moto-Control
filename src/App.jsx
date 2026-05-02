import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";

function App(){
  const [user,setUser]=useState(null);
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [data,setData]=useState([]);
  const [name,setName]=useState("");

  useEffect(()=>{
    onAuthStateChanged(auth,setUser);
  },[]);

  async function login(){
    await signInWithEmailAndPassword(auth,email,pass);
  }

  async function addData(){
    await addDoc(collection(db,"test"),{name});
    loadData();
  }

  async function loadData(){
    const snap=await getDocs(collection(db,"test"));
    setData(snap.docs.map(d=>d.data()));
  }

  if(!user){
    return (
      <div style={{padding:40}}>
        <h1>Login</h1>
        <input placeholder="email" onChange={e=>setEmail(e.target.value)} />
        <input placeholder="password" type="password" onChange={e=>setPass(e.target.value)} />
        <button onClick={login}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{padding:40}}>
      <h1>Pronto Moto (Conectado)</h1>
      <button onClick={()=>signOut(auth)}>Salir</button>

      <h2>Prueba Firestore</h2>
      <input placeholder="nombre" onChange={e=>setName(e.target.value)} />
      <button onClick={addData}>Guardar</button>
      <button onClick={loadData}>Cargar</button>

      {data.map((d,i)=><p key={i}>{d.name}</p>)}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App/>);