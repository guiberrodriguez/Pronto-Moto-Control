import {
  Wallet,
  Search,
  BadgeDollarSign,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Printer,
  Send,
} from "lucide-react";

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
  mensajeWhatsAppPago,
}) {

  return (
    <div className="pagosPage">

      {/* HERO */}
      <section className="pagosHero">

        <div>
          <span>Gestión financiera</span>

          <h1>Pagos</h1>

          <p>
            Registro de cobros, validación de pagos,
            deuda automática y recibos premium.
          </p>
        </div>

        <button
          className="registrarPagoBtn"
          onClick={registrarPago}
        >
          <Wallet size={20}/>
          Registrar pago
        </button>

      </section>

      {/* FORM */}
      <section className="pagosFormCard">

        <h2>Nuevo pago</h2>

        <div className="pagosFormGrid">

          {/* CLIENTE */}
          <div className="pagosField full">

            <label>
              Buscar cliente
            </label>

            <div className="searchPagoBox">

              <Search size={18}/>

              <input
                placeholder="Buscar cliente..."
                value={busquedaClientePago}
                onChange={(e)=>
                  setBusquedaClientePago(e.target.value)
                }
              />

            </div>

          </div>

          {/* SELECT CLIENTE */}
          <div className="pagosField full">

            <label>
              Cliente
            </label>

            <select
              value={clientePagoId}
              onChange={(e)=>
                setClientePagoId(e.target.value)
              }
            >

              <option value="">
                Seleccionar cliente
              </option>

              {clientesPagoFiltrados.map(c=>(

                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.nombre}
                </option>

              ))}

            </select>

          </div>

          {/* MOTO */}
          <div className="pagosField">

            <label>
              Motocicleta
            </label>

            <select
              value={pago.motoId}
              onChange={(e)=>
                setPago({
                  ...pago,
                  motoId:e.target.value
                })
              }
            >

              <option value="">
                Seleccionar moto
              </option>

              {motosClientePago.map(m=>(

                <option
                  key={m.id}
                  value={m.id}
                >
                  {m.placa} · {m.marca}
                </option>

              ))}

            </select>

          </div>

          {/* MONTO */}
          <div className="pagosField">

            <label>
              Monto
            </label>

            <input
              placeholder="Monto"
              value={pago.monto}
              onChange={(e)=>
                setPago({
                  ...pago,
                  monto:e.target.value
                })
              }
            />

          </div>

          {/* METODO */}
          <div className="pagosField">

            <label>
              Método
            </label>

            <select
              value={pago.metodo}
              onChange={(e)=>
                setPago({
                  ...pago,
                  metodo:e.target.value
                })
              }
            >
              <option>Efectivo</option>
              <option>Transferencia</option>
              <option>Tarjeta</option>
              <option>PayPal</option>
              <option>Zelle</option>
            </select>

          </div>

          {/* COMPROBANTE */}
          <div className="pagosField">

            <label>
              Papel comprobante
            </label>

           <select
              value={papelComprobante}
              onChange={(e)=>
                setPapelComprobante(e.target.value)
              }
            >
              <option value="normal">
                Comprobante normal
              </option>
            
              <option value="ticket">
                Ticket térmico + QR
              </option>
            
              <option value="ticketPremium">
                Ticket premium completo
              </option>
            </select>

          </div>

        </div>

      </section>

      {/* DEUDA */}
      {motoPagoSeleccionada && deudaPagoSeleccionada && (

        <section className="deudaCard">

          <div className="deudaHeader">

            <div>
              <span>Estado financiero</span>

              <h2>
                {motoPagoSeleccionada.placa}
              </h2>
            </div>

            {
              deudaPagoSeleccionada.cuotasPendientes >= 1
                ? <AlertTriangle size={34}/>
                : <CheckCircle2 size={34}/>
            }

          </div>

          <div className="deudaGrid">

            <div className="deudaItem">
              <small>Cuotas pendientes</small>

              <strong>
                {deudaPagoSeleccionada.cuotasPendientes}
              </strong>
            </div>

            <div className="deudaItem">
              <small>Deuda actual</small>

              <strong className="redText">
                RD$
                {deudaPagoSeleccionada.montoPendiente}
              </strong>
            </div>

            <div className="deudaItem">
              <small>Estado</small>

              <strong className="orangeText">
                {deudaPagoSeleccionada.estatus}
              </strong>
            </div>

          </div>

        </section>

      )}

      {/* ÚLTIMO COMPROBANTE */}
      {ultimo && (

        <section className="ultimoPagoCard">

          <div className="ultimoHeader">

            <div>
              <span>Último pago</span>

              <h2>
                {ultimo.id}
              </h2>
            </div>

            <Receipt size={34}/>

          </div>

          <div className="ultimoGrid">

            <div className="ultimoItem">
              <small>Cliente</small>

              <strong>
                {ultimo.cliente}
              </strong>
            </div>

            <div className="ultimoItem">
              <small>Moto</small>

              <strong>
                {ultimo.moto}
              </strong>
            </div>

            <div className="ultimoItem">
              <small>Monto</small>

              <strong className="greenText">
                RD${ultimo.monto}
              </strong>
            </div>

            <div className="ultimoItem">
              <small>Método</small>

              <strong>
                {ultimo.metodo}
              </strong>
            </div>

          </div>

          <div className="ultimoActions">

            <button
              className="ultimoBtn orange"
              onClick={()=>
                imprimirComprobante(
                  ultimo,
                  papelComprobante
                )
              }
            >
              <Printer size={18}/>
              Imprimir
            </button>

            <a
              className="ultimoBtn green"
              href={`https://wa.me/?text=${encodeURIComponent(
                mensajeWhatsAppPago(ultimo)
              )}`}
              target="_blank"
            >
              <Send size={18}/>
              WhatsApp
            </a>

          </div>

        </section>

      )}

      {/* HISTORIAL */}
      <section className="historialPagos">

        <div className="historialHeader">

          <div>
            <span>Movimientos recientes</span>

            <h2>Historial de pagos</h2>
          </div>

        </div>

        <div className="historialGrid">

          {pagosVisibles
            .slice()
            .reverse()
            .slice(0,15)
            .map((p)=>{

              return (

                <div
                  key={p.docId}
                  className="historialCard"
                >

                  <div className="historialTop">

                    <div className="historialIcon">
                      <BadgeDollarSign size={24}/>
                    </div>

                    <span className="metodoPagoBadge">
                      {p.metodo}
                    </span>

                  </div>

                  <h3>
                    {p.cliente}
                  </h3>

                  <p>
                    {p.moto}
                  </p>

                  <div className="historialInfo">

                    <div>
                      <small>Monto</small>

                      <strong className="greenText">
                        RD${p.monto}
                      </strong>
                    </div>

                    <div>
                      <small>Fecha</small>

                      <strong>
                        {p.fecha}
                      </strong>
                    </div>

                  </div>

                  <button
                    className="deletePagoBtn"
                    onClick={()=>eliminarPago(p)}
                  >
                    Eliminar pago
                  </button>

                </div>

              );
            })}

        </div>

      </section>

    </div>
  );
}