export function abrirImpresion(
  titulo,
  contenido,
  tipo = "normal"
){

  const ventana = window.open(
    "",
    "_blank",
    "width=900,height=1200"
  );

  ventana.document.write(`
    <html>
      <head>
        <title>${titulo}</title>

        <style>

          *{
            box-sizing:border-box;
            margin:0;
            padding:0;
          }

          body{
            font-family:
              Inter,
              Arial,
              sans-serif;

            background:white;
            color:#111;

            padding:${
              tipo === "ticket"
                ? "0"
                : "30px"
            };
          }

          .ticket58{
            width:300px;
            margin:auto;
            padding:14px;
          }

          .ticket80{
            width:420px;
            margin:auto;
            padding:18px;
          }

          .premiumPdf{
            width:100%;
            max-width:900px;
            margin:auto;
          }

          .pdfHeader{
            display:flex;
            justify-content:space-between;
            align-items:center;

            gap:20px;

            margin-bottom:24px;
          }

          .pdfCompany h1{
            font-size:30px;
            color:#ff6b00;
            font-weight:900;
          }

          .pdfCompany p{
            margin-top:4px;
            font-size:14px;
            color:#555;
          }

          .pdfTitle{
            margin:30px 0;

            font-size:24px;
            font-weight:900;

            color:#111;
          }

          .pdfGrid{
            display:grid;
            grid-template-columns:
              repeat(auto-fit,minmax(220px,1fr));

            gap:18px;
          }

          .infoBlock{
            border:1px solid #ddd;

            border-radius:16px;

            padding:18px;

            display:flex;
            flex-direction:column;
            gap:8px;
          }

          .label{
            font-size:13px;
            color:#666;
            font-weight:700;
          }

          .value{
            font-size:16px;
            font-weight:800;
          }

          .amount{
            font-size:22px;
            font-weight:900;
            color:#ff6b00;
          }

          .signatureArea{
            display:flex;
            justify-content:space-between;

            gap:40px;

            margin-top:80px;
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
            margin-top:60px;
            text-align:center;
            font-size:13px;
            color:#666;
          }

          /* TICKET */

          .ticket{
            font-size:13px;
            line-height:1.5;
          }

          .ticketHeader{
            text-align:center;
            border-bottom:1px dashed #000;
            padding-bottom:14px;
            margin-bottom:14px;
          }

          .ticketLogo{
            width:90px;
            margin:auto;
            display:block;
            margin-bottom:10px;
          }

          .ticketTitle{
            font-size:22px;
            font-weight:900;
            color:#ff6b00;
          }

          .ticketSub{
            font-size:12px;
            color:#444;
            margin-top:4px;
          }

          .ticketBlock{
            margin-top:14px;
            padding-bottom:14px;
            border-bottom:1px dashed #000;
          }

          .ticketRow{
            display:flex;
            justify-content:space-between;
            gap:12px;

            margin-top:6px;
          }

          .ticketLabel{
            color:#555;
            font-weight:700;
          }

          .ticketValue{
            font-weight:900;
            text-align:right;
          }

          .ticketAmount{
            font-size:26px;
            font-weight:900;
            color:#ff6b00;
            text-align:center;
            margin-top:16px;
          }

          .ticketStatus{
            margin-top:16px;

            text-align:center;

            font-size:13px;
            font-weight:900;
          }

          .statusPaid{
            color:#22c55e;
          }

          .statusDebt{
            color:#ef4444;
          }

          .qrWrapper{
            margin-top:18px;
            text-align:center;
          }

          .qrWrapper img{
            width:150px;
            height:150px;
          }

          .ticketFooter{
            margin-top:18px;
            text-align:center;
            font-size:11px;
            color:#555;
          }

          @media print{
            body{
              margin:0;
            }

            .noPrint{
              display:none;
            }
          }

        </style>

      </head>

      <body>

        ${contenido}

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>

      </body>
    </html>
  `);

  ventana.document.close();
}

export function comprobanteHtml(
  p,
  empresa,
  tipo = "normal"
){

  const qr = `
    https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${
      encodeURIComponent(p.url || "")
    }
  `;

  if(
    tipo === "ticket" ||
    tipo === "ticketPremium"
  ){

    return `
      <div class="${
        tipo === "ticketPremium"
          ? "ticket80"
          : "ticket58"
      } ticket">

        <div class="ticketHeader">

          <img
            class="ticketLogo"
            src="${window.location.origin}/logo.png"
          />

          <div class="ticketTitle">
            ${empresa.nombre || "Pronto Moto"}
          </div>

          <div class="ticketSub">
            ${empresa.telefono || ""}
          </div>

          <div class="ticketSub">
            ${empresa.direccion || ""}
          </div>

        </div>

        <div class="ticketBlock">

          <div class="ticketRow">
            <span class="ticketLabel">
              Recibo
            </span>

            <span class="ticketValue">
              ${p.id}
            </span>
          </div>

          <div class="ticketRow">
            <span class="ticketLabel">
              Fecha
            </span>

            <span class="ticketValue">
              ${p.fecha}
            </span>
          </div>

          <div class="ticketRow">
            <span class="ticketLabel">
              Cliente
            </span>

            <span class="ticketValue">
              ${p.cliente}
            </span>
          </div>

          <div class="ticketRow">
            <span class="ticketLabel">
              Moto
            </span>

            <span class="ticketValue">
              ${p.moto}
            </span>
          </div>

          <div class="ticketRow">
            <span class="ticketLabel">
              Método
            </span>

            <span class="ticketValue">
              ${p.metodo}
            </span>
          </div>

        </div>

        <div class="ticketAmount">
          RD$${Number(p.monto || 0).toLocaleString()}
        </div>

        <div class="ticketStatus ${
          Number(p.montoPendienteDespues || 0) <= 0
            ? "statusPaid"
            : "statusDebt"
        }">

          ${
            Number(p.montoPendienteDespues || 0) <= 0
              ? "CLIENTE AL DÍA"
              : `PENDIENTE RD$${Number(
                  p.montoPendienteDespues || 0
                ).toLocaleString()}`
          }

        </div>

        <div class="qrWrapper">

          <img src="${qr}" />

          <div class="ticketSub">
            Escanea para validar
          </div>

        </div>

        <div class="ticketFooter">

          <p>
            Validar comprobante:
          </p>

          <p>
            ${p.url || ""}
          </p>

          <br/>

          <p>
            Gracias por su pago
          </p>

        </div>

      </div>
    `;
  }

  return `
    <div class="premiumPdf">

      <div class="pdfHeader">

        <div class="pdfCompany">

          <h1>
            ${empresa.nombre || "Pronto Moto"}
          </h1>

          <p>
            ${empresa.telefono || ""}
          </p>

          <p>
            ${empresa.direccion || ""}
          </p>

          <p>
            RNC/Cédula:
            ${empresa.rnc || "N/A"}
          </p>

        </div>

      </div>

      <div class="pdfTitle">
        COMPROBANTE DE PAGO
      </div>

      <div class="pdfGrid">

        <div class="infoBlock">
          <span class="label">
            Recibo
          </span>

          <span class="value">
            ${p.id}
          </span>
        </div>

        <div class="infoBlock">
          <span class="label">
            Fecha
          </span>

          <span class="value">
            ${p.fecha}
          </span>
        </div>

        <div class="infoBlock">
          <span class="label">
            Cliente
          </span>

          <span class="value">
            ${p.cliente}
          </span>
        </div>

        <div class="infoBlock">
          <span class="label">
            Moto
          </span>

          <span class="value">
            ${p.moto}
          </span>
        </div>

        <div class="infoBlock">
          <span class="label">
            Método
          </span>

          <span class="value">
            ${p.metodo}
          </span>
        </div>

        <div class="infoBlock">
          <span class="label">
            Estado
          </span>

          <span class="value">
            ${p.estatus}
          </span>
        </div>

        <div class="infoBlock">
          <span class="label">
            Monto pagado
          </span>

          <span class="amount">
            RD$${Number(p.monto || 0).toLocaleString()}
          </span>
        </div>

      </div>

      <div
        style="
          margin-top:40px;
          text-align:center;
        "
      >

        <img
          src="${qr}"
          style="
            width:180px;
            height:180px;
          "
        />

        <p
          style="
            margin-top:14px;
            color:#666;
          "
        >
          Escanea para validar
        </p>

      </div>

      <div class="pdfFooter">

        <p>
          Validación:
        </p>

        <p>
          ${p.url || ""}
        </p>

      </div>

    </div>
  `;
}