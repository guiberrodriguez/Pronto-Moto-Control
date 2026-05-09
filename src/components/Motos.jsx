import {
  Bike,
  Plus,
  Pencil,
  Trash2,
  Printer,
  MapPinned,
  BadgeDollarSign,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

export default function Motos({
  esAdmin,
  moto,
  setMoto,
  editMoto,
  clientes,
  motosVisibles,
  guardarMoto,
  editarMoto,
  eliminarMoto,
  imprimirContrato,
  deudaMoto,
  ingresosPorMoto,
  gastosPorMoto,
}) {

  function clienteMoto(id){
    return clientes.find(c=>c.id===id);
  }

  return (
    <div className="motosPage">

      {/* HERO */}
      <section className="motosHero">

        <div>
          <span>Gestión de flota</span>
          <h1>Motos</h1>

          <p>
            Control operativo de motocicletas, contratos,
            cobranzas y estado financiero.
          </p>
        </div>

        <button
          className="saveMotoBtn"
          onClick={guardarMoto}
          disabled={!esAdmin}
        >
          <Plus size={20}/>
          {editMoto ? "Actualizar moto" : "Registrar moto"}
        </button>

      </section>

      {/* FORM */}
      <section className="motoFormCard">

        <h2>
          {editMoto ? "Editar motocicleta" : "Registrar motocicleta"}
        </h2>

        <div className="motoFormGrid">

          <input
            placeholder="Placa"
            value={moto.placa}
            onChange={(e)=>
              setMoto({...moto,placa:e.target.value})
            }
          />

          <input
            placeholder="Marca"
            value={moto.marca}
            onChange={(e)=>
              setMoto({...moto,marca:e.target.value})
            }
          />

          <input
            placeholder="Modelo"
            value={moto.modelo}
            onChange={(e)=>
              setMoto({...moto,modelo:e.target.value})
            }
          />

          <input
            placeholder="Año"
            value={moto.anio}
            onChange={(e)=>
              setMoto({...moto,anio:e.target.value})
            }
          />

          <input
            placeholder="Tracker GPS"
            value={moto.tracker}
            onChange={(e)=>
              setMoto({...moto,tracker:e.target.value})
            }
          />

          <select
            value={moto.clienteId}
            onChange={(e)=>
              setMoto({...moto,clienteId:e.target.value})
            }
          >
            <option value="">Seleccionar cliente</option>

            {clientes.map(c=>(
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <input
            placeholder="Pago diario"
            value={moto.pagoDiario}
            onChange={(e)=>
              setMoto({...moto,pagoDiario:e.target.value})
            }
          />

          <input
            placeholder="Depósito"
            value={moto.deposito}
            onChange={(e)=>
              setMoto({...moto,deposito:e.target.value})
            }
          />

        </div>

      </section>

      {/* GRID */}
      <section className="motosGrid">

        {motosVisibles.map((m)=>{

          const cliente = clienteMoto(m.clienteId);

          const deuda = deudaMoto(m);

          const ingresos = ingresosPorMoto(m.id);

          const gastos = gastosPorMoto(m.id);

          const neto = ingresos - gastos;

          return (

            <div
              key={m.id}
              className="motoCard"
            >

              <div className="motoCardTop">

                <div className="motoIcon">
                  <Bike size={28}/>
                </div>

                <span
                  className={
                    m.clienteId
                      ? deuda.cuotasPendientes >= 1
                        ? "estadoMoto mora"
                        : "estadoMoto alquilada"
                      : "estadoMoto disponible"
                  }
                >
                  {
                    m.clienteId
                      ? deuda.cuotasPendientes >= 1
                        ? "En mora"
                        : "Alquilada"
                      : "Disponible"
                  }
                </span>

              </div>

              <h2>
                {m.placa}
              </h2>

              <p className="motoModelo">
                {m.marca} {m.modelo}
              </p>

              <div className="motoInfoGrid">

                <div className="motoInfoItem">
                  <small>Cliente</small>

                  <strong>
                    {cliente?.nombre || "Sin asignar"}
                  </strong>
                </div>

                <div className="motoInfoItem">
                  <small>Pago diario</small>

                  <strong>
                    RD${m.pagoDiario}
                  </strong>
                </div>

                <div className="motoInfoItem">
                  <small>Ingresos</small>

                  <strong className="greenText">
                    RD${ingresos}
                  </strong>
                </div>

                <div className="motoInfoItem">
                  <small>Gastos</small>

                  <strong className="redText">
                    RD${gastos}
                  </strong>
                </div>

                <div className="motoInfoItem">
                  <small>Neto</small>

                  <strong className="orangeText">
                    RD${neto}
                  </strong>
                </div>

                <div className="motoInfoItem">
                  <small>GPS</small>

                  <strong>
                    {m.tracker || "No asignado"}
                  </strong>
                </div>

              </div>

              {deuda.cuotasPendientes >= 1 && (
                <div className="moraAlert">

                  <AlertTriangle size={18}/>

                  <span>
                    {deuda.cuotasPendientes} cuota(s) pendiente(s)
                  </span>

                </div>
              )}

              <div className="motoActions">

                <button
                  className="motoBtn blue"
                  onClick={()=>editarMoto(m)}
                >
                  <Pencil size={18}/>
                </button>

                <button
                  className="motoBtn red"
                  onClick={()=>eliminarMoto(m.id)}
                >
                  <Trash2 size={18}/>
                </button>

                <button
                  className="motoBtn orange"
                  onClick={()=>imprimirContrato(m)}
                >
                  <Printer size={18}/>
                </button>

              </div>

            </div>

          );
        })}

      </section>

    </div>
  );
}