import {
  TrendingUp,
  Wallet,
  Bike,
  AlertTriangle,
  ShieldAlert,
  DollarSign,
  Activity,
  Users
} from "lucide-react";

import { money } from "../utils/helpers";

export default function Inicio({
  esAdmin,
  totalIngresos,
  totalGastos,
  neto,
  motosVisibles,
  clientesVisibles,
  motosMorosas,
  pagosVisibles,
  clientes,
  deudaMoto
}){

  const ingresosHoy = pagosVisibles
    .filter(p=>p.fecha===new Date().toISOString().slice(0,10))
    .reduce((s,p)=>s+Number(p.monto||0),0);

  const totalMorosidad = motosMorosas.reduce((s,m)=>{
    return s + Number(deudaMoto(m).montoPendiente || 0);
  },0);

  const motosActivas = motosVisibles.filter(
    m=>m.estado==="Alquilada"
  ).length;

  const motosDisponibles = motosVisibles.filter(
    m=>m.estado!=="Alquilada"
  ).length;

  const porcentajeMora = motosVisibles.length
    ? ((motosMorosas.length / motosVisibles.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="mainDashboard">

      <section className="executiveHero">

        <div className="executiveMain">

          <div>
            <p className="muted">
              PANEL EJECUTIVO
            </p>

            <h1>
              Bienvenido a
              <br/>
              Pronto Moto
            </h1>

            <p>
              Visualiza ingresos, rentabilidad,
              morosidad, desempeño operativo y
              métricas empresariales en tiempo real.
            </p>
          </div>

          <div className="executiveMetrics">

            <div className="executiveMetric">
              <span>Ingresos del día</span>
              <b>{money(ingresosHoy)}</b>
            </div>

            <div className="executiveMetric successMetric">
              <span>Resultado neto</span>
              <b>{money(neto)}</b>
            </div>

            <div className="executiveMetric">
              <span>Motos activas</span>
              <b>{motosActivas}</b>
            </div>

          </div>

        </div>

        <div className="executiveWidgets">

          <div className="executiveWidget orangeWidget">
            <div>
              <p>Ingresos acumulados</p>
              <h2>{money(totalIngresos)}</h2>
            </div>

            <DollarSign/>
          </div>

          <div className="executiveWidget blueWidget">
            <div>
              <p>Clientes activos</p>
              <h2>{clientesVisibles.length}</h2>
            </div>

            <Users/>
          </div>

          <div className="executiveWidget redWidget">
            <div>
              <p>Motos en mora</p>
              <h2>{motosMorosas.length}</h2>
            </div>

            <AlertTriangle/>
          </div>

        </div>

      </section>

      <section className="kpiGrid">

        <div className="kpiCard primaryKpi">
          <span>Ingresos Totales</span>

          <b>{money(totalIngresos)}</b>

          <div className="kpiChange">
            <TrendingUp size={16}/>
            Flujo positivo
          </div>
        </div>

        <div className="kpiCard successKpi">
          <span>Ganancia Neta</span>

          <b>{money(neto)}</b>

          <div className="kpiChange">
            <Wallet size={16}/>
            Resultado operativo
          </div>
        </div>

        <div className="kpiCard warningKpi">
          <span>Morosidad Total</span>

          <b>{money(totalMorosidad)}</b>

          <div className="kpiChange">
            <ShieldAlert size={16}/>
            {porcentajeMora}% de riesgo
          </div>
        </div>

        <div className="kpiCard dangerKpi">
          <span>Gastos Totales</span>

          <b>{money(totalGastos)}</b>

          <div className="kpiChange">
            <Activity size={16}/>
            Costos operativos
          </div>
        </div>

      </section>
      
            <section className="dashboardGrid">

        <div className="card executiveCard">
          <div className="sectionHeader">
            <div>
              <p className="muted">Estado de flota</p>
              <h2>Motos</h2>
            </div>

            <Bike size={26}/>
          </div>

          <div className="fleetStats">
            <div>
              <span>Activas</span>
              <b>{motosActivas}</b>
            </div>

            <div>
              <span>Disponibles</span>
              <b>{motosDisponibles}</b>
            </div>

            <div>
              <span>En mora</span>
              <b>{motosMorosas.length}</b>
            </div>
          </div>

          <div className="progressWrap">
            <div className="progressInfo">
              <span>Uso de flota</span>
              <b>
                {motosVisibles.length
                  ? Math.round((motosActivas / motosVisibles.length) * 100)
                  : 0}%
              </b>
            </div>

            <div className="progressBar">
              <div
                className="progressFill"
                style={{
                  width:`${
                    motosVisibles.length
                      ? Math.round((motosActivas / motosVisibles.length) * 100)
                      : 0
                  }%`
                }}
              />
            </div>
          </div>
        </div>

        <div className="card executiveCard">
          <div className="sectionHeader">
            <div>
              <p className="muted">Cobranza reciente</p>
              <h2>Últimos pagos</h2>
            </div>

            <Wallet size={26}/>
          </div>

          {pagosVisibles.slice(0,5).map(p=>(
            <div className="activityItem" key={p.docId || p.id}>
              <div>
                <b>{p.cliente}</b>
                <p>{p.moto}</p>
              </div>

              <div className="activityAmount">
                {money(p.monto)}
              </div>
            </div>
          ))}

          {pagosVisibles.length===0 && (
            <p className="muted">No hay pagos registrados todavía.</p>
          )}
        </div>

      </section>
      
            <section className="dashboardGrid">

        <div className="card executiveCard">
          <div className="sectionHeader">
            <div>
              <p className="muted">Riesgo operativo</p>
              <h2>Morosidad crítica</h2>
            </div>

            <AlertTriangle size={26}/>
          </div>

          {motosMorosas.slice(0,6).map(m=>{
            const clienteMora = clientes.find(c=>c.id===m.clienteId);
            const deuda = deudaMoto(m);

            return (
              <div className="riskItem" key={m.id}>
                <div>
                  <b>{m.placa}</b>
                  <p>{clienteMora?.nombre || "Cliente no encontrado"}</p>
                </div>

                <div>
                  <span>{deuda.cuotasPendientes} cuotas</span>
                  <strong>{money(deuda.montoPendiente)}</strong>
                </div>
              </div>
            );
          })}

          {motosMorosas.length===0 && (
            <p className="muted">No hay morosidad registrada.</p>
          )}
        </div>

        <div className="card executiveCard">
          <div className="sectionHeader">
            <div>
              <p className="muted">Resumen financiero</p>
              <h2>Ingresos vs Gastos</h2>
            </div>

            <TrendingUp size={26}/>
          </div>

          <div className="financeBars">
            <div>
              <div className="financeLabel">
                <span>Ingresos</span>
                <b>{money(totalIngresos)}</b>
              </div>

              <div className="financeTrack">
                <div
                  className="financeFill incomeFill"
                  style={{
                    width:"100%"
                  }}
                />
              </div>
            </div>

            <div>
              <div className="financeLabel">
                <span>Gastos</span>
                <b>{money(totalGastos)}</b>
              </div>

              <div className="financeTrack">
                <div
                  className="financeFill expenseFill"
                  style={{
                    width:`${
                      totalIngresos
                        ? Math.min(100,Math.round((totalGastos/totalIngresos)*100))
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="financeLabel">
                <span>Neto</span>
                <b>{money(neto)}</b>
              </div>

              <div className="financeTrack">
                <div
                  className="financeFill netFill"
                  style={{
                    width:`${
                      totalIngresos
                        ? Math.min(100,Math.round((Math.max(neto,0)/totalIngresos)*100))
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

      </section>
      
            <section className="card executiveCard">

        <div className="sectionHeader">
          <div>
            <p className="muted">Visión ejecutiva</p>
            <h2>Indicadores operativos</h2>
          </div>

          <Activity size={26}/>
        </div>

        <div className="executiveSummaryGrid">

          <div className="summaryTile">
            <span>Clientes registrados</span>
            <b>{clientesVisibles.length}</b>
          </div>

          <div className="summaryTile">
            <span>Motos registradas</span>
            <b>{motosVisibles.length}</b>
          </div>

          <div className="summaryTile">
            <span>Motos disponibles</span>
            <b>{motosDisponibles}</b>
          </div>

          <div className="summaryTile">
            <span>Motos activas</span>
            <b>{motosActivas}</b>
          </div>

          <div className="summaryTile dangerTile">
            <span>Casos en mora</span>
            <b>{motosMorosas.length}</b>
          </div>

          <div className="summaryTile successTile">
            <span>Pagos registrados</span>
            <b>{pagosVisibles.length}</b>
          </div>

        </div>

      </section>

      {!esAdmin && (
        <section className="card executiveCard">
          <p className="muted">
            Vista limitada a clientes, pagos y motos asignadas al cobrador.
          </p>
        </section>
      )}

    </div>
  );
}