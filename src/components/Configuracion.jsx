import React from "react";
import { Settings, ShieldCheck } from "lucide-react";
import IconTextButton from "./IconTextButton";

export default function Configuracion({
  esAdmin,
  nuevaPassword,
  setNuevaPassword,
  cambiarPassword,
  usuarioForm,
  setUsuarioForm,
  guardarUsuario,
  usuarios
}){
  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Seguridad y usuarios</p>
          <h2>Configuración</h2>
        </div>
      </div>

      <h3>Cambiar contraseña</h3>

      <input
        type="password"
        placeholder="Nueva contraseña"
        value={nuevaPassword}
        onChange={e=>setNuevaPassword(e.target.value)}
      />

      <IconTextButton
        icon={Settings}
        label="Cambiar contraseña"
        onClick={cambiarPassword}
      />

      {esAdmin && (
        <>
          <h3>Gestión de usuarios / cobradores</h3>

          <p className="muted">
            Primero crea el usuario en Firebase Authentication. Luego copia su UID y regístralo aquí.
          </p>

          <input
            placeholder="UID de Firebase Auth"
            value={usuarioForm.uid}
            onChange={e=>setUsuarioForm({...usuarioForm,uid:e.target.value})}
          />

          <input
            placeholder="Nombre"
            value={usuarioForm.nombre}
            onChange={e=>setUsuarioForm({...usuarioForm,nombre:e.target.value})}
          />

          <input
            placeholder="Correo"
            value={usuarioForm.correo}
            onChange={e=>setUsuarioForm({...usuarioForm,correo:e.target.value})}
          />

          <select
            value={usuarioForm.rol}
            onChange={e=>setUsuarioForm({...usuarioForm,rol:e.target.value})}
          >
            <option value="admin">Admin</option>
            <option value="cobrador">Cobrador</option>
          </select>

          <IconTextButton
            icon={ShieldCheck}
            label="Guardar usuario"
            onClick={guardarUsuario}
          />

          <h3>Usuarios registrados</h3>

          {usuarios.map(u=>(
            <div className="item premiumItem" key={u.id}>
              <b>{u.nombre}</b>
              <p>{u.correo}</p>
              <p>Rol: {u.rol}</p>
              <p>UID: {u.uid}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}