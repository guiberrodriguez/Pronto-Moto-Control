import React from "react";
import { Building2 } from "lucide-react";

export default function SelectorEmpresa({
  empresas,
  empresaActual,
  setEmpresaActual
}){
  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Entorno de trabajo</p>
          <h2>Seleccionar empresa</h2>
        </div>
      </div>

      {empresas.length===0 && (
        <p>No tienes empresas asignadas todavía.</p>
      )}

      {empresas.map(e=>(
        <button
          key={e.id}
          className={
            empresaActual?.id===e.id
              ? "empresaSelectCard activeEmpresa"
              : "empresaSelectCard"
          }
          onClick={()=>setEmpresaActual(e)}
        >
          <Building2 size={24}/>

          <div>
            <b>{e.nombre}</b>
            <p>{e.rnc || "Sin RNC"} · {e.telefono || "Sin teléfono"}</p>
          </div>
        </button>
      ))}
    </div>
  );
}