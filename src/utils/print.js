import { BASE_URL } from "../data/constants";
import { money, locationMapUrl } from "./helpers";

export function abrirImpresion(titulo, html, tipoPapel = "normal") {
  const printWindow = window.open("", "_blank", "width=900,height=700");

  if (!printWindow) {
    alert("El navegador bloqueó la ventana de impresión.");
    return;
  }

  const ticketCss = tipoPapel === "termico"
  ? `
  @page{
    size:80mm auto;
    margin:3mm;
  }

  html,body{
    margin:0;
    padding:0;
    background:white;
    color:#111;
    font-family:Arial,sans-serif;
    width:72mm;
    font-size:11px;
  }

  .ticketWrap{
    padding:4px;
  }

  .ticketHeader{
    text-align:center;
  }

  .printLogo{
    width:240px;
    max-width:100%;
    display:block;
    margin:0 auto 8px;
  }

  .ticketHeader h1{
    font-size:18px;
    margin:4px 0;
  }

  .ticketHeader h2{
    font-size:14px;
    margin-top:8px;
  }

  .ticketDivider{
    border-top:1px dashed #999;
    margin:8px 0;
  }

  .ticketBody{
    margin-top:10px;
  }

  .row{
    display:flex;
    justify-content:space-between;
    margin:6px 0;
    gap:10px;
  }

  .ticketQR{
    text-align:center;
    margin-top:14px;
  }

  .qr{
    width:120px;
    height:120px;
  }

  .ticketFooter{
    text-align:center;
    margin-top:12px;
    font-size:10px;
  }
  `
  : `
  @page{
    size:auto;
    margin:14mm;
  }

  html,body{
    margin:0;
    padding:0;
    background:white;
    color:#222;
    font-family:Arial,sans-serif;
  }

  body{
    padding:30px;
  }

  .premiumPdf{
    width:100%;
  }

  .pdfHeader{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:30px;
    border-bottom:2px solid #ff6600;
    padding-bottom:20px;
  }

  .pdfLogoArea{
    flex:1;
  }

  .printLogo{
    width:380px;
    max-width:100%;
  }

  .pdfCompany{
    flex:1;
    text-align:right;
  }

  .pdfCompany h1{
    margin:0;
    font-size:34px;
    color:#ff6600;
  }

  .pdfTitle{
    margin-top:30px;
    font-size:24px;
    font-weight:700;
    text-align:center;
    letter-spacing:2px;
  }

  .pdfGrid{
    margin-top:30px;
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:16px;
  }

  .infoBlock{
    border:1px solid #e5e7eb;
    border-radius:16px;
    padding:18px;
    background:#fafafa;
  }

  .label{
    display:block;
    font-size:12px;
    color:#777;
    margin-bottom:8px;
  }

  .value{
    font-size:17px;
    font-weight:600;
  }

  .amount{
    font-size:28px;
    font-weight:800;
    color:#16a34a;
  }

  .dangerAmount{
    color:#dc2626;
  }

  .qrSection{
    margin-top:40px;
    display:flex;
    align-items:center;
    gap:30px;
    border:1px solid #eee;
    border-radius:20px;
    padding:20px;
  }

  .qr{
    width:180px;
    height:180px;
  }

  .qrText h3{
    margin:0 0 10px;
    font-size:24px;
  }

  .signatureArea{
    display:flex;
    justify-content:space-between;
    gap:30px;
    margin-top:60px;
  }

  .signatureBox{
    flex:1;
    text-align:center;
  }

  .line{
    border-top:2px solid #111;
    margin-bottom:10px;
  }

  .pdfFooter{
    margin-top:40px;
    text-align:center;
    font-size:12px;
    color:#666;
  }
  `;

  printWindow.document.open();

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8"/>
        <title>${titulo}</title>
        <style>${ticketCss}</style>
      </head>

      <body>
        ${html}

        <script>
          window.onload = function(){
            setTimeout(function(){
              window.focus();
              window.print();
            },600);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

export function comprobanteHtml(p,empresa,tipo="normal"){
  const ubicacionTexto = p.ubicacionCobro?.lat
    ? `
      <div class="infoBlock">
        <span class="label">Ubicación del cobro</span>
        <span class="value">${locationMapUrl(p.ubicacionCobro)}</span>
      </div>
    `
    : "";

  if(tipo==="termico"){
    return `
      <div class="ticketWrap">

        <div class="ticketHeader">
          <img class="printLogo" src="${BASE_URL}/logo.png" />

          <h1>${empresa.nombre}</h1>

          <p>${empresa.telefono || ""}</p>
          <p>${empresa.direccion || ""}</p>

          <div class="ticketDivider"></div>

          <h2>COMPROBANTE</h2>
        </div>

        <div class="ticketBody">
          <div class="row">
            <span>ID</span>
            <b>${p.id}</b>
          </div>

          <div class="row">
            <span>Fecha</span>
            <b>${p.fecha}</b>
          </div>

          <div class="row">
            <span>Cliente</span>
            <b>${p.cliente}</b>
          </div>

          <div class="row">
            <span>Moto</span>
            <b>${p.moto}</b>
          </div>

          <div class="row">
            <span>Pagado</span>
            <b>${money(p.monto)}</b>
          </div>

          <div class="row">
            <span>Pendiente</span>
            <b>${money(p.montoPendienteDespues || 0)}</b>
          </div>
        </div>

        <div class="ticketQR">
          <img
            class="qr"
            src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(p.url)}"
          />
        </div>

      </div>
    `;
  }

  return `
    <div class="premiumPdf">

      <div class="pdfHeader">

        <div class="pdfLogoArea">
          <img class="printLogo" src="${BASE_URL}/logo.png" />
        </div>

        <div class="pdfCompany">
          <h1>${empresa.nombre}</h1>

          <p>${empresa.telefono || ""}</p>
          <p>${empresa.direccion || ""}</p>
          <p>RNC/Cédula: ${empresa.rnc || "N/A"}</p>
        </div>

      </div>

      <div class="pdfTitle">
        COMPROBANTE DE PAGO
      </div>

      <div class="pdfGrid">

        <div class="infoBlock">
          <span class="label">ID comprobante</span>
          <span class="value">${p.id}</span>
        </div>

        <div class="infoBlock">
          <span class="label">Fecha</span>
          <span class="value">${p.fecha}</span>
        </div>

        <div class="infoBlock">
          <span class="label">Cliente</span>
          <span class="value">${p.cliente}</span>
        </div>

        <div class="infoBlock amountBlock">
          <span class="label">Monto pagado</span>
          <span class="amount">${money(p.monto)}</span>
        </div>

        <div class="infoBlock amountBlock">
          <span class="label">Balance pendiente</span>
          <span class="amount dangerAmount">
            ${money(p.montoPendienteDespues || 0)}
          </span>
        </div>

        ${ubicacionTexto}

      </div>

    </div>
  `;
}