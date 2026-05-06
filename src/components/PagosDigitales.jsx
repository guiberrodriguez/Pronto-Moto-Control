import React from "react";
import { money } from "../utils/helpers";

export default function PagosDigitales({
  esAdmin,
  pagosDigitales
}){
  if(!esAdmin) return null;

  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Pasarelas y links externos</p>
          <h2>Pagos digitales</h2>
        </div>
      </div>

      {pagosDigitales.length===0 && (
        <p>No hay pagos digitales registrados.</p>
      )}

      {pagosDigitales.map(pd=>(
        <div className="item premiumItem" key={pd.id}>
          <b>{pd.comprobanteId}</b>
          <p>Cliente: {pd.cliente}</p>
          <p>Moto: {pd.moto}</p>
          <p>Monto: {money(pd.monto)}</p>
          <p>Pasarela: {pd.pasarela}</p>
          <p>Estado: {pd.estado}</p>

          {pd.linkPago && (
            <a href={pd.linkPago} target="_blank" rel="noreferrer">
              Abrir link de pago
            </a>
          )}
        </div>
      ))}
    </div>
  );
}