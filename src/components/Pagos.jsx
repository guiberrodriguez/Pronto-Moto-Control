import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Search,
  CreditCard,
  Printer,
  MessageCircle,
  Trash2,
  MapPin
} from "lucide-react";

import { pasarelasPago, metodosDigitales } from "../data/constants";
import { money, whatsappUrl, locationMapUrl } from "../utils/helpers";
import IconTextButton from "./IconTextButton";

export default function Pagos({
  esAdmin,
  pago,
  setPago,
  clientePagoId,
  setClientePagoId,
  busquedaClientePago,
  setBusquedaClientePago,
  clientesPagoFiltrados,
  clientePago,
  motosClientePago,
  motoPagoSeleccionada,
  deudaPagoSeleccionada,
  papelComprobante,
  setPapelComprobante,
  registrarPago,
  ultimo,
  clientes,
  pagosVisibles,
  imprimirComprobante,
  eliminarPago,
  mensajeWhatsAppPago
}){
  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Cobros y comprobantes</p>
          <h2>Registrar pago</h2>
        </div>
      </div>

      <div className="searchBox">
        <Search size={18}/>
        <input
          placeholder="Buscar cliente para pago por nombre, ID, cédula, teléfono..."
          value={busquedaClientePago}
          onChange={e=>setBusquedaClientePago(e.target.value)}
        />
      </div>

      <select
        value={clientePagoId}
        onChange={e=>{
          setClientePagoId(e.target.value);
          setPago({...pago,motoId:""});
        }}
      >
        <option value="">Seleccionar cliente</option>
        {clientesPagoFiltrados.map(c=>(
          <option key={c.id} value={c.id}>
            {c.idCliente || c.id} · {c.nombre} · {c.telefono}
          </option>
        ))}
      </select>

      {clientePago && (
        <div className="item premiumItem">
          <h3>Cliente seleccionado</h3>
          <p><b>ID:</b> {clientePago.idCliente || clientePago.id}</p>
          <p><b>Nombre:</b> {clientePago.nombre}</p>
          <p><b>Cédula:</b> {clientePago.cedula}</p>
          <p><b>Teléfono:</b> {clientePago.telefono}</p>
        </div>
      )}

      <select value={pago.motoId} onChange={e=>setPago({...pago,motoId:e.target.value})}>
        <option value="">Seleccionar moto del cliente</option>
        {motosClientePago.map(m=>(
          <option key={m.id} value={m.id}>
            {m.placa} · {m.marca} {m.modelo}
          </option>
        ))}
      </select>

      {motoPagoSeleccionada && deudaPagoSeleccionada && (
        <div className="item premiumItem">
          <h3>Información de pago</h3>
          <p><b>Moto:</b> {motoPagoSeleccionada.placa} {motoPagoSeleccionada.marca} {motoPagoSeleccionada.modelo}</p>
          <p><b>Cuota diaria:</b> {money(motoPagoSeleccionada.pagoDiario)}</p>
          <p><b>Cuotas pendientes:</b> {deudaPagoSeleccionada.cuotasPendientes}</p>
          <p><b>Monto pendiente:</b> {money(deudaPagoSeleccionada.montoPendiente)}</p>
          <p><b>Estatus:</b> {deudaPagoSeleccionada.estatus}</p>
        </div>
      )}

      <input
        placeholder="Monto pagado"
        value={pago.monto}
        onChange={e=>setPago({...pago,monto:e.target.value})}
      />

      <select value={pago.metodo} onChange={e=>setPago({...pago,metodo:e.target.value})}>
        {pasarelasPago.map(m=>(
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      {metodosDigitales.includes(pago.metodo) && (
        <>
          <input
            placeholder="Link de pago o referencia"
            value={pago.linkPago}
            onChange={e=>setPago({...pago,linkPago:e.target.value})}
          />

          <select
            value={pago.estadoPagoDigital}
            onChange={e=>setPago({...pago,estadoPagoDigital:e.target.value})}
          >
            <option>Pendiente</option>
            <option>Pagado</option>
            <option>Fallido</option>
            <option>Cancelado</option>
          </select>
        </>
      )}

      <select value={papelComprobante} onChange={e=>setPapelComprobante(e.target.value)}>
        <option value="normal">Papel normal / PDF</option>
        <option value="termico">Ticket térmico 80mm / Bluetooth</option>
      </select>

      <IconTextButton icon={CreditCard} label="Generar comprobante" onClick={registrarPago}/>

      {ultimo && (
        <div className="item premiumItem">
          <h2>Comprobante</h2>
          <p><b>ID:</b> {ultimo.id}</p>
          <p><b>ID Cliente:</b> {ultimo.idCliente}</p>
          <p><b>Cliente:</b> {ultimo.cliente}</p>
          <p><b>Moto:</b> {ultimo.moto}</p>
          <p><b>Monto pagado:</b> {money(ultimo.monto)}</p>
          <p><b>Pendiente después:</b> {money(ultimo.montoPendienteDespues)}</p>
          <p><b>Método:</b> {ultimo.metodo}</p>
          <p><b>Estado pago digital:</b> {ultimo.estadoPagoDigital}</p>

          {ultimo.ubicacionCobro?.lat && (
            <p>
              <a href={locationMapUrl(ultimo.ubicacionCobro)} target="_blank" rel="noreferrer">
                Ver ubicación del cobro
              </a>
            </p>
          )}

          <QRCodeCanvas value={ultimo.url} />
          <p>{ultimo.url}</p>

          <div className="actionRow">
            <IconTextButton icon={Printer} label="Imprimir PDF" onClick={()=>imprimirComprobante(ultimo,"normal")}/>
            <IconTextButton icon={Printer} label="Imprimir térmico" onClick={()=>imprimirComprobante(ultimo,"termico")}/>

            {ultimo.clienteId && clientes.find(c=>c.id===ultimo.clienteId)?.telefono && (
              <a
                href={whatsappUrl(clientes.find(c=>c.id===ultimo.clienteId)?.telefono,mensajeWhatsAppPago(ultimo))}
                target="_blank"
                rel="noreferrer"
              >
                <IconTextButton icon={MessageCircle} label="Enviar WhatsApp" className="whatsappBtn"/>
              </a>
            )}
          </div>
        </div>
      )}

      <h2>Historial de pagos</h2>

      {pagosVisibles.map(p=>(
        <div className="item premiumItem" key={p.docId}>
          <b>{p.id}</b>
          <p>{p.fecha} · {p.cliente}</p>
          <p>{p.moto} · {money(p.monto)}</p>
          <p>Cobrador: {p.cobrador || ""}</p>
          <p>Método: {p.metodo}</p>

          <div className="actionRow">
            <IconTextButton icon={Printer} label="PDF" onClick={()=>imprimirComprobante(p,"normal")}/>
            <IconTextButton icon={Printer} label="Térmico" onClick={()=>imprimirComprobante(p,"termico")}/>

            {esAdmin && (
              <IconTextButton
                icon={Trash2}
                label="Eliminar"
                className="deleteBtn"
                onClick={()=>eliminarPago(p)}
              />
            )}

            {p.ubicacionCobro?.lat && (
              <a href={locationMapUrl(p.ubicacionCobro)} target="_blank" rel="noreferrer">
                <IconTextButton icon={MapPin} label="Ubicación"/>
              </a>
            )}

            {p.clienteId && clientes.find(c=>c.id===p.clienteId)?.telefono && (
              <a
                href={whatsappUrl(clientes.find(c=>c.id===p.clienteId)?.telefono,mensajeWhatsAppPago(p))}
                target="_blank"
                rel="noreferrer"
              >
                <IconTextButton icon={MessageCircle} label="WhatsApp" className="whatsappBtn"/>
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}