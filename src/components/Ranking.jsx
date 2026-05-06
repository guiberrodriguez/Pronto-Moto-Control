import React from "react";
import { money } from "../utils/helpers";

export default function Ranking({
  rankingMotos,
  ingresosPorMoto,
  gastosPorMoto
}){
  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Rentabilidad por activo</p>
          <h2>Ranking de motos</h2>
        </div>
      </div>

      {rankingMotos.length===0 && (
        <p>No hay motos registradas para mostrar ranking.</p>
      )}

      {rankingMotos.map((m,index)=>(
        <div className="item premiumItem" key={m.id}>
          <b>#{index+1} · {m.placa}</b>
          <p>{m.marca} {m.modelo}</p>
          <p>Ingresos: {money(ingresosPorMoto(m.id))}</p>
          <p>Gastos: {money(gastosPorMoto(m.id))}</p>
          <p>Neto: {money(ingresosPorMoto(m.id)-gastosPorMoto(m.id))}</p>
        </div>
      ))}
    </div>
  );
}