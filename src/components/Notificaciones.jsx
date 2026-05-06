import React from "react";
import { Bell } from "lucide-react";
import IconTextButton from "./IconTextButton";

export default function Notificaciones({
  esAdmin,
  notificaciones,
  marcarNotificacionLeida
}){
  if(!esAdmin) return null;

  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Alertas internas</p>
          <h2>Centro de notificaciones</h2>
        </div>
      </div>

      {notificaciones.length===0 && (
        <p>No hay notificaciones registradas.</p>
      )}

      {notificaciones.map(n=>(
        <div className="item premiumItem" key={n.id}>
          <b>{n.titulo}</b>
          <p>{n.mensaje}</p>
          <p>{n.fechaHora}</p>
          <p>Estado: {n.leida ? "Leída" : "Pendiente"}</p>

          {!n.leida && (
            <IconTextButton
              icon={Bell}
              label="Marcar como leída"
              onClick={()=>marcarNotificacionLeida(n)}
            />
          )}
        </div>
      ))}
    </div>
  );
}