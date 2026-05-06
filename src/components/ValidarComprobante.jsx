import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { money, locationMapUrl } from "../utils/helpers";

export default function ValidarComprobante(){
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    async function load(){
      const id = window.location.pathname.split("/validar/")[1];
      const snap = await getDocs(collection(db,"pagos"));
      const pagos = snap.docs.map(d=>d.data());

      setData(pagos.find(p=>p.id===id) || null);
      setLoading(false);
    }

    load();
  },[]);

  if(loading){
    return (
      <div className="premiumShell">
        <div className="card">
          <h1>Validando comprobante...</h1>
        </div>
      </div>
    );
  }

  if(!data){
    return (
      <div className="premiumShell">
        <div className="card">
          <h1>Comprobante no encontrado</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="premiumShell">
      <div className="card validCard">
        <div className="loginLogo">
          <img
            src="/logo.png"
            alt="Pronto Moto"
            onError={e=>{e.currentTarget.style.display="none"}}
          />
        </div>

        <h1>Comprobante válido</h1>
        <p className="success">Validado en la nube</p>

        <table>
          <tbody>
            <tr><th>ID</th><td>{data.id}</td></tr>
            <tr><th>Fecha</th><td>{data.fecha}</td></tr>
            <tr><th>ID Cliente</th><td>{data.idCliente || data.clienteId}</td></tr>
            <tr><th>Cliente</th><td>{data.cliente}</td></tr>
            <tr><th>Moto</th><td>{data.moto}</td></tr>
            <tr><th>Cuotas pendientes</th><td>{data.cuotasPendientes || 0}</td></tr>
            <tr><th>Monto pendiente antes</th><td>{money(data.montoPendienteAntes || 0)}</td></tr>
            <tr><th>Monto pagado</th><td>{money(data.monto)}</td></tr>
            <tr><th>Monto pendiente después</th><td>{money(data.montoPendienteDespues || 0)}</td></tr>
            <tr><th>Método</th><td>{data.metodo}</td></tr>
            <tr><th>Estado pago digital</th><td>{data.estadoPagoDigital || "N/A"}</td></tr>
            <tr><th>Cobrador</th><td>{data.cobrador || ""}</td></tr>
            <tr><th>Estatus</th><td>{data.estatus || "N/A"}</td></tr>
          </tbody>
        </table>

        {data.ubicacionCobro?.lat && (
          <p>
            <a href={locationMapUrl(data.ubicacionCobro)} target="_blank" rel="noreferrer">
              Ver ubicación del cobro
            </a>
          </p>
        )}
      </div>
    </div>
  );
}