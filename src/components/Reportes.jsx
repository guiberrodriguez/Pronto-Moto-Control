import { exportarExcelPRO } from "../utils/excel";
import React, { useMemo } from "react";
import { FileText, Printer } from "lucide-react";
import { money, today } from "../utils/helpers";
import IconTextButton from "./IconTextButton";
import { abrirImpresion } from "../utils/print";

export default function Reportes({
  esAdmin,
  pagos,
  gastos,
  motos,
  clientes,
  usuarios,
  empresa
}){
  if(!esAdmin) return null;

  const fechaHoy = today();

  const pagosHoy = useMemo(()=>{
    return pagos.filter(p=>p.fecha===fechaHoy);
  },[pagos,fechaHoy]);

  const gastosHoy = useMemo(()=>{
    return gastos.filter(g=>g.fecha===fechaHoy);
  },[gastos,fechaHoy]);

  const totalPagosHoy = pagosHoy.reduce((s,p)=>s+Number(p.monto||0),0);
  const totalGastosHoy = gastosHoy.reduce((s,g)=>s+Number(g.monto||0),0);
  const netoHoy = totalPagosHoy-totalGastosHoy;

  const totalGeneralPagos = pagos.reduce((s,p)=>s+Number(p.monto||0),0);
  const totalGeneralGastos = gastos.reduce((s,g)=>s+Number(g.monto||0),0);
  const netoGeneral = totalGeneralPagos-totalGeneralGastos;

  const pagosPorCobrador = usuarios.map(u=>{
    const lista = pagos.filter(p=>p.cobradorId===u.uid || p.cobradorId===u.id);
    const total = lista.reduce((s,p)=>s+Number(p.monto||0),0);

    return {
      nombre:u.nombre || u.correo,
      correo:u.correo,
      cantidad:lista.length,
      total
    };
  }).filter(x=>x.cantidad>0);

  function imprimirReporteDiario(){
    const html = `
      <div class="premiumPdf">
        <div class="pdfHeader">
          <div class="pdfLogoArea">
            <img class="printLogo" src="/logo.png" />
          </div>

          <div class="pdfCompany">
            <h1>${empresa.nombre}</h1>
            <p>${empresa.telefono || ""}</p>
            <p>${empresa.direccion || ""}</p>
            <p>RNC/Cédula: ${empresa.rnc || "N/A"}</p>
          </div>
        </div>

        <div class="pdfTitle">CIERRE DIARIO</div>

        <div class="pdfGrid">
          <div class="infoBlock">
            <span class="label">Fecha</span>
            <span class="value">${fechaHoy}</span>
          </div>

          <div class="infoBlock amountBlock">
            <span class="label">Ingresos del día</span>
            <span class="amount">${money(totalPagosHoy)}</span>
          </div>

          <div class="infoBlock amountBlock">
            <span class="label">Gastos del día</span>
            <span class="amount dangerAmount">${money(totalGastosHoy)}</span>
          </div>

          <div class="infoBlock amountBlock">
            <span class="label">Neto del día</span>
            <span class="amount">${money(netoHoy)}</span>
          </div>
        </div>

        <h3 style="margin-top:35px;">Pagos del día</h3>

        <table style="width:100%;border-collapse:collapse;margin-top:15px;">
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Moto</th>
            <th>Monto</th>
            <th>Cobrador</th>
          </tr>

          ${pagosHoy.map(p=>`
            <tr>
              <td>${p.id}</td>
              <td>${p.cliente}</td>
              <td>${p.moto}</td>
              <td>${money(p.monto)}</td>
              <td>${p.cobrador || ""}</td>
            </tr>
          `).join("")}
        </table>

        <h3 style="margin-top:35px;">Gastos del día</h3>

        <table style="width:100%;border-collapse:collapse;margin-top:15px;">
          <tr>
            <th>Categoría</th>
            <th>Moto</th>
            <th>Monto</th>
            <th>Proveedor</th>
          </tr>

          ${gastosHoy.map(g=>`
            <tr>
              <td>${g.categoria}</td>
              <td>${motos.find(m=>m.id===g.motoId)?.placa || "N/A"}</td>
              <td>${money(g.monto)}</td>
              <td>${g.proveedor || ""}</td>
            </tr>
          `).join("")}
        </table>

        <div class="pdfFooter">
          <p>Reporte generado automáticamente por ${empresa.nombre}</p>
        </div>
      </div>
    `;

    abrirImpresion("Cierre diario",html,"normal");
  }

  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Finanzas y operación</p>
          <h2>Reportes empresariales PRO</h2>
        </div>
      </div>

      <div className="gridStats premiumStats">
        <div className="card stat premiumStat">
          <span>Ingresos hoy</span>
          <b>{money(totalPagosHoy)}</b>
        </div>

        <div className="card stat premiumStat dangerStat">
          <span>Gastos hoy</span>
          <b>{money(totalGastosHoy)}</b>
        </div>

        <div className="card stat premiumStat successStat">
          <span>Neto hoy</span>
          <b>{money(netoHoy)}</b>
        </div>

        <div className="card stat premiumStat">
          <span>Ingresos total</span>
          <b>{money(totalGeneralPagos)}</b>
        </div>

        <div className="card stat premiumStat dangerStat">
          <span>Gastos total</span>
          <b>{money(totalGeneralGastos)}</b>
        </div>

        <div className="card stat premiumStat successStat">
          <span>Neto total</span>
          <b>{money(netoGeneral)}</b>
        </div>
      </div>

      <div className="actionRow">
        <IconTextButton
          icon={Printer}
          label="Imprimir cierre diario PDF"
          onClick={imprimirReporteDiario}
        />
        
          <IconTextButton
            icon={FileText}
            label="Exportar Excel PRO"
            onClick={()=>
              exportarExcelPRO({
                pagos,
                gastos,
                motos,
                clientes,
                usuarios,
                empresa
              })
            }
          />
      </div>

      <h3>Resumen de hoy</h3>

      <div className="item premiumItem">
        <p>Pagos registrados hoy: <b>{pagosHoy.length}</b></p>
        <p>Gastos registrados hoy: <b>{gastosHoy.length}</b></p>
        <p>Clientes registrados: <b>{clientes.length}</b></p>
        <p>Motos registradas: <b>{motos.length}</b></p>
      </div>

      <h3>Reporte por cobrador</h3>

      {pagosPorCobrador.length===0 && (
        <p>No hay pagos asociados a cobradores todavía.</p>
      )}

      {pagosPorCobrador.map(c=>(
        <div className="item premiumItem" key={c.correo}>
          <b>{c.nombre}</b>
          <p>{c.correo}</p>
          <p>Cantidad de pagos: {c.cantidad}</p>
          <p>Total cobrado: {money(c.total)}</p>
        </div>
      ))}
    </div>
  );
}