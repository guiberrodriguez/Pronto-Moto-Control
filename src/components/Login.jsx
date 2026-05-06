import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Login(){
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [error,setError]=useState("");

  async function login(){
    try{
      setError("");
      await signInWithEmailAndPassword(auth,email,pass);
    }catch(e){
      setError(e.message);
    }
  }

  return (
    <div className="login premiumLogin">
      <div className="loginGlow"></div>

      <div className="card loginCard premiumLoginCard">
        <div className="loginLogo">
          <img
            src="/logo.png"
            alt="Pronto Moto"
            onError={e=>{e.currentTarget.style.display="none"}}
          />
        </div>

        <p className="muted loginSubtitle">Acceso privado empresarial</p>

        {error && <div className="alert">{error}</div>}

        <input
          placeholder="Correo"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={pass}
          onChange={e=>setPass(e.target.value)}
        />

        <button onClick={login} className="primaryWideBtn">
          Entrar
        </button>
      </div>
    </div>
  );
}