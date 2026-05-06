import React from "react";
import { MessageCircle } from "lucide-react";
import { money, whatsappUrl } from "../utils/helpers";
import IconTextButton from "./IconTextButton";

export default function Morosidad({
  motosMorosas,
  clientes,
  deudaMoto,
  mensajeWhatsAppMora
}){
  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Gestión de riesgo</p>
          <h2>Control de morosidad</h2>
        </div>
      </div>

      {motosMorosas.length===0 && (
        <p>No hay motos con atraso registrado.</p>
      )}

      {motosMorosas.map(m=>{
        const c=clientes.find(x=>x.id===m.clienteId);
        const d=deudaMoto(m);

        return (
          <div className="item premiumItem" key={m.id}>
            <b>{m.placa}</b>
            <p>Cliente: {c?.nombre || "N/A"}</p>
            <p>Cuotas pendientes: {d.cuotasPendientes}</p>
            <p>Deuda estimada: {money(d.montoPendiente)}</p>
            <p>Estatus: {d.estatus}</p>

            {c?.telefono && (
              <a
                href={whatsappUrl(c.telefono,mensajeWhatsAppMora(m))}
                target="_blank"
                rel="noreferrer"
              >
                <IconTextButton
                  icon={MessageCircle}
                  label="WhatsApp"
                  className="whatsappBtn"
                />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}