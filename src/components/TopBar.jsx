import React from "react";
import { signOut } from "firebase/auth";
import {
  Menu,
  Sun,
  Moon,
  RefreshCw,
  Settings,
  Bell,
  LogOut
} from "lucide-react";

import { auth } from "../firebase";
import { getNombreUsuario } from "../utils/helpers";

export default function TopBar({
  user,
  usuarioActual,
  tema,
  toggleTema,
  cargar,
  setTab,
  menuAbierto,
  setMenuAbierto,
  esAdmin
}){
  return (
    <div className="topBar premiumTopBar">
      <div className="brandArea premiumBrand">
        <img
          src="/logo.png"
          alt="Pronto Moto"
          className="logoMain premiumLogo"
          onError={e=>{e.currentTarget.style.display="none"}}
        />

        <div>
          <p className="muted">Panel empresarial</p>
          <h2 className="saludo">
            Hola {getNombreUsuario(usuarioActual,user)}!
          </h2>
        </div>
      </div>

      <div className="menuArea">
        <button
          className="iconBtn"
          onClick={()=>setMenuAbierto(!menuAbierto)}
          title="Menú"
        >
          <Menu size={24}/>
        </button>

        {menuAbierto && (
          <div className="dropdownMenu premiumDropdown">
            <button onClick={()=>{toggleTema(); setMenuAbierto(false);}}>
              {tema === "dark" ? <Sun size={18}/> : <Moon size={18}/>}
              <span>{tema === "dark" ? "Modo claro" : "Modo oscuro"}</span>
            </button>

            <button onClick={()=>{cargar(); setMenuAbierto(false);}}>
              <RefreshCw size={18}/>
              <span>Actualizar</span>
            </button>

            <button onClick={()=>{setTab("configuracion"); setMenuAbierto(false);}}>
              <Settings size={18}/>
              <span>Configuración</span>
            </button>

            {esAdmin && (
              <button onClick={()=>{setTab("notificaciones"); setMenuAbierto(false);}}>
                <Bell size={18}/>
                <span>Notificaciones</span>
              </button>
            )}

            <button onClick={()=>signOut(auth)}>
              <LogOut size={18}/>
              <span>Salir</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}