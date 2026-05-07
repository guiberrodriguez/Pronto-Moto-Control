import React, { useMemo, useState } from "react";
import { Wallet, Printer, CheckCircle } from "lucide-react";
import { money, today } from "../utils/helpers";
import { abrirImpresion } from "../utils/print";
import IconTextButton from "./IconTextButton";

export default function CajaDiaria({
  esAdmin,
  pagos,
  gastos,
  empresa
}){
  if(!esAdmin) return null;

  const [fechaCaja,setFechaCaja]=useState(today());

  const pagosCaja = useMemo(()=>{
    return pagos.filter(p=>p.fecha===fechaCaja);
  },[pagos,fechaCaja]);

  const gastosCaja = useMemo(()=>{
    return gastos.filter(g=>g.fecha===fechaCaja);
  },[gastos,fechaCaja]);

  const efectivo = pagosCaja
    .filter(p=>p.metodo==="Efectivo")
    .reduce((s,p)=>s+Number(p.monto||0),0);

  const deposito = pagosCaja
    .filter(p=>p.metodo==="Depósito")
    .reduce((s,p)=>s+Number(p.monto||0),0);

  const transferencia = pagosCaja
    .filter(p=>p.metodo==="Transferencia bancaria")
    .reduce((s,p)=>s+Number(p.monto||0),0);

  const digital = pagosCaja
    .filter(p=>["Azul","CardNet","PayPal","Stripe","Link de pago externo"].includes(p.metodo))
    .reduce((s,p)=>s+Number(p.monto||0),0);

  const totalIngresos = pagosCaja.reduce((s,p)=>s+Number(p.monto||0),0);
  const totalGastos = gastosCaja.reduce((s,g)=>s+Number(g.monto||0),0);
  const balanceCaja = totalIngresos-totalGastos;

  function imprimirCaja(){
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

        <div class="pdfTitle">CIERRE DE CAJA DIARIA</div>

        <div class="pdfGrid">
          <div class="infoBlock">
            <span class="label">Fecha</span>
            <span class="value">${fechaCaja}</span>
          </div>

          <div class="infoBlock amountBlock">
            <span class="label">Ingresos</span>
            <span class="amount">${money(totalIngresos)}</span>
          </div>

          <div class="infoBlock amountBlock">
            <span class="label">Gastos</span>
            <span class="amount dangerAmount">${money(totalGastos)}</span>
          </div>

          <div class="infoBlock amountBlock">
            <span class="label">Balance de caja</span>
            <span class="amount">${money(balanceCaja)}</span>
          </div>
        </div>

        <h3 style="margin-top:35px;">Detalle por método</h3>

        <table style="width:100%;border-collapse:collapse;margin-top:15px;">
          <tr>
            <th>Método</th>
            <th>Total</th>
          </tr>
          <tr><td>Efectivo</td><td>${money(efectivo)}</td></tr>
          <tr><td>Depósito</td><td>${money(deposito)}</td></tr>
          <tr><td>Transferencia</td><td>${money(transferencia)}</td></tr>
          <tr><td>Pagos digitales</td><td>${money(digital)}</td></tr>
        </table>

        <h3 style="margin-top:35px;">Pagos</h3>

        <table style="width:100%;border-collapse:collapse;margin-top:15px;">
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Moto</th>
            <th>Método</th>
            <th>Monto</th>
          </tr>

          ${pagosCaja.map(p=>`
            <tr>
              <td>${p.id}</td>
              <td>${p.cliente}</td>
              <td>${p.moto}</td>
              <td>${p.metodo}</td>
              <td>${money(p.monto)}</td>
            </tr>
          `).join("")}
        </table>

        <h3 style="margin-top:35px;">Gastos</h3>

        <table style="width:100%;border-collapse:collapse;margin-top:15px;">
          <tr>
            <th>Categoría</th>
            <th>Proveedor</th>
            <th>Monto</th>
          </tr>

          ${gastosCaja.map(g=>`
            <tr>
              <td>${g.categoria}</td>
              <td>${g.proveedor || ""}</td>
              <td>${money(g.monto)}</td>
            </tr>
          `).join("")}
        </table>

        <div class="signatureArea">
          <div class="signatureBox">
            <div class="line"></div>
            <p>Firma responsable</p>
          </div>

          <div class="signatureBox">
            <div class="line"></div>
            <p>Firma administrador</p>
          </div>
        </div>

        <div class="pdfFooter">
          <p>Cierre generado automáticamente por ${empresa.nombre}</p>
        </div>
      </div>
    `;

    abrirImpresion("Cierre caja diaria",html,"normal");
  }

  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Control operativo</p>
          <h2>Caja diaria PRO</h2>
        </div>
      </div>

      <input
        type="date"
        className="dateInput"
        value={fechaCaja}
        onChange={e=>setFechaCaja(e.target.value)}
      />

      <div className="kpiGrid">
        <div className="kpiCard successKpi">
          <Wallet size={26}/>
          <span>Ingresos</span>
          <b>{money(totalIngresos)}</b>
        </div>

        <div className="kpiCard dangerKpi">
          <Wallet size={26}/>
          <span>Gastos</span>
          <b>{money(totalGastos)}</b>
        </div>

        <div className="kpiCard primaryKpi">
          <CheckCircle size={26}/>
          <span>Balance caja</span>
          <b>{money(balanceCaja)}</b>
        </div>
      </div>

      <h3>Detalle por método</h3>

      <div className="gridStats premiumStats">
        <div className="card stat premiumStat">
          <span>Efectivo</span>
          <b>{money(efectivo)}</b>
        </div>

        <div className="card stat premiumStat">
          <span>Depósito</span>
          <b>{money(deposito)}</b>
        </div>

        <div className="card stat premiumStat">
          <span>Transferencia</span>
          <b>{money(transferencia)}</b>
        </div>

        <div className="card stat premiumStat">
          <span>Digital</span>
          <b>{money(digital)}</b>
        </div>
      </div>

      <div className="actionRow">
        <IconTextButton
          icon={Printer}
          label="Imprimir cierre de caja"
          onClick={imprimirCaja}
        />
      </div>

      <h3>Pagos del día</h3>

      {pagosCaja.length===0 && <p>No hay pagos en esta fecha.</p>}

      {pagosCaja.map(p=>(
        <div className="item premiumItem" key={p.docId}>
          <b>{p.id}</b>
          <p>{p.cliente}</p>
          <p>{p.moto}</p>
          <p>{p.metodo} · {money(p.monto)}</p>
        </div>
      ))}

      <h3>Gastos del día</h3>

      {gastosCaja.length===0 && <p>No hay gastos en esta fecha.</p>}

      {gastosCaja.map(g=>(
        <div className="item premiumItem" key={g.id}>
          <b>{g.categoria}</b>
          <p>{g.proveedor}</p>
          <p>{money(g.monto)}</p>
        </div>
      ))}
    </div>
  );
}