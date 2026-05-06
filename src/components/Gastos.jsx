import React from "react";
import { Wallet, Edit, Trash2 } from "lucide-react";
import { money } from "../utils/helpers";
import IconTextButton from "./IconTextButton";

export default function Gastos({
  esAdmin,
  gasto,
  setGasto,
  editGasto,
  motos,
  gastos,
  guardarGasto,
  editarGasto,
  eliminarGasto
}){
  if(!esAdmin) return null;

  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Costos operativos</p>
          <h2>{editGasto ? "Editar gasto" : "Registrar gasto"}</h2>
        </div>
      </div>

      <select value={gasto.motoId} onChange={e=>setGasto({...gasto,motoId:e.target.value})}>
        <option value="">Seleccionar moto</option>
        {motos.map(m=>(
          <option key={m.id} value={m.id}>{m.placa}</option>
        ))}
      </select>

      <input className="dateInput" type="date" value={gasto.fecha} onChange={e=>setGasto({...gasto,fecha:e.target.value})}/>
      <input placeholder="Categoría" value={gasto.categoria} onChange={e=>setGasto({...gasto,categoria:e.target.value})}/>
      <input placeholder="Monto" value={gasto.monto} onChange={e=>setGasto({...gasto,monto:e.target.value})}/>
      <input placeholder="Proveedor / Taller" value={gasto.proveedor} onChange={e=>setGasto({...gasto,proveedor:e.target.value})}/>
      <input placeholder="Nota" value={gasto.nota} onChange={e=>setGasto({...gasto,nota:e.target.value})}/>

      <IconTextButton
        icon={Wallet}
        label={editGasto ? "Guardar cambios" : "Guardar gasto"}
        onClick={guardarGasto}
      />

      <h2>Historial de gastos</h2>

      {gastos.map(g=>(
        <div className="item premiumItem" key={g.id}>
          <b>{g.categoria}</b>
          <p>Fecha: {g.fecha}</p>
          <p>Moto: {motos.find(m=>m.id===g.motoId)?.placa || "N/A"}</p>
          <p>Monto: {money(g.monto)}</p>
          <p>Proveedor: {g.proveedor}</p>
          <p>Nota: {g.nota}</p>

          <div className="actionRow">
            <IconTextButton icon={Edit} label="Editar" onClick={()=>editarGasto(g)}/>
            <IconTextButton icon={Trash2} label="Eliminar" className="deleteBtn" onClick={()=>eliminarGasto(g.id)}/>
          </div>
        </div>
      ))}
    </div>
  );
}