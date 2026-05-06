import React from "react";

export default function Empresa({
  esAdmin,
  empresa,
  setEmpresa
}){
  if(!esAdmin) return null;

  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Branding y datos comerciales</p>
          <h2>Datos de empresa</h2>
        </div>
      </div>

      <input
        placeholder="Nombre de empresa"
        value={empresa.nombre}
        onChange={e=>setEmpresa({...empresa,nombre:e.target.value})}
      />

      <input
        placeholder="Teléfono"
        value={empresa.telefono}
        onChange={e=>setEmpresa({...empresa,telefono:e.target.value})}
      />

      <input
        placeholder="Dirección"
        value={empresa.direccion}
        onChange={e=>setEmpresa({...empresa,direccion:e.target.value})}
      />

      <input
        placeholder="RNC / Cédula"
        value={empresa.rnc}
        onChange={e=>setEmpresa({...empresa,rnc:e.target.value})}
      />

      <input
        placeholder="Notas adicionales para contrato"
        value={empresa.notas}
        onChange={e=>setEmpresa({...empresa,notas:e.target.value})}
      />
    </div>
  );
}