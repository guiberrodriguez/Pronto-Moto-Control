import React from "react";
import { Paperclip, Trash2 } from "lucide-react";
import IconTextButton from "./IconTextButton";

export default function Adjuntos({
  esAdmin,
  clienteAdjunto,
  setClienteAdjunto,
  archivo,
  setArchivo,
  clientes,
  adjuntos,
  subirAdjunto,
  eliminarAdjunto
}){
  if(!esAdmin) return null;

  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Documentos y archivos</p>
          <h2>Adjuntos por cliente</h2>
        </div>
      </div>

      <select value={clienteAdjunto} onChange={e=>setClienteAdjunto(e.target.value)}>
        <option value="">Seleccionar cliente</option>

        {clientes.map(c=>(
          <option key={c.id} value={c.id}>
            {c.idCliente || c.id} · {c.nombre}
          </option>
        ))}
      </select>

      <input type="file" onChange={e=>setArchivo(e.target.files[0])}/>

      {archivo && (
        <p className="muted">
          Archivo seleccionado: {archivo.name}
        </p>
      )}

      <IconTextButton
        icon={Paperclip}
        label="Subir adjunto"
        onClick={subirAdjunto}
      />

      <h2>Documentos guardados</h2>

      {adjuntos.length===0 && (
        <p>No hay documentos adjuntos registrados.</p>
      )}

      {adjuntos.map(a=>(
        <div className="item premiumItem" key={a.id}>
          <b>{a.nombre}</b>

          <p>
            Cliente: {clientes.find(c=>c.id===a.clienteId)?.nombre || "N/A"}
          </p>

          <p>Fecha: {a.fecha}</p>

          <a href={a.url} target="_blank" rel="noreferrer">
            Ver documento
          </a>

          <br/>

          <IconTextButton
            icon={Trash2}
            label="Eliminar"
            className="deleteBtn"
            onClick={()=>eliminarAdjunto(a)}
          />
        </div>
      ))}
    </div>
  );
}