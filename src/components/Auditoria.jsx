import React from "react";

export default function Auditoria({ esAdmin, auditLogs }){
  if(!esAdmin) return null;

  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Historial empresarial</p>
          <h2>Auditoría PRO</h2>
        </div>
      </div>

      {auditLogs.length===0 && (
        <p>No hay registros de auditoría todavía.</p>
      )}

      {auditLogs.map(log=>(
        <div className="item premiumItem" key={log.id}>
          <b>{log.accion?.toUpperCase()} · {log.modulo}</b>
          <p>{log.descripcion}</p>
          <p>Usuario: {log.usuarioNombre} · {log.usuarioCorreo}</p>
          <p>Fecha: {log.fecha}</p>
        </div>
      ))}
    </div>
  );
}