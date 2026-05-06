import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Bike, Users, AlertTriangle } from "lucide-react";
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
  const chartFinanzas = [
    {
      name:"Finanzas",
      ingresos:totalIngresos,
      gastos:totalGastos,
      neto:neto
    }
  ];

  const chartMorosidad = [
    {
      name:"Al día",
      value:Math.max(0,motosVisibles.length - motosMorosas.length)
    },
    {
      name:"Morosas",
      value:motosMorosas.length
    }
  ];

  return (
    <>
      <div className="executiveHero">
        <div className="executiveMain">
          <p className="muted">Dashboard ejecutivo</p>
          <h1>Resumen financiero</h1>

          <div className="executiveMetrics">
            <div className="executiveMetric">
              <span>Ingresos</span>
              <b>{money(totalIngresos)}</b>
            </div>

            <div className="executiveMetric">
              <span>Gastos</span>
              <b>{money(totalGastos)}</b>
            </div>

            <div className="executiveMetric successMetric">
              <span>Neto</span>
              <b>{money(neto)}</b>
            </div>
          </div>

          {!esAdmin && (
            <p className="muted">
              Vista limitada a clientes asignados al cobrador.
            </p>
          )}
        </div>

        <div className="executiveWidgets">
          <div className="executiveWidget orangeWidget">
            <div>
              <p>Motos activas</p>
              <h2>{motosVisibles.length}</h2>
            </div>
            <Bike size={28}/>
          </div>

          <div className="executiveWidget blueWidget">
            <div>
              <p>Clientes</p>
              <h2>{clientesVisibles.length}</h2>
            </div>
            <Users size={28}/>
          </div>

          <div className="executiveWidget redWidget">
            <div>
              <p>Morosidad</p>
              <h2>{motosMorosas.length}</h2>
            </div>
            <AlertTriangle size={28}/>
          </div>
        </div>
      </div>

      <div className="activityGrid">
        <div className="card activityCard">
          <div className="sectionHeader">
            <div>
              <p className="muted">Actividad reciente</p>
              <h2>Últimos pagos</h2>
            </div>
          </div>

          {pagosVisibles.slice(0,5).map(p=>(
            <div className="activityItem" key={p.docId}>
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
            <p>No hay pagos recientes.</p>
          )}
        </div>

        <div className="card activityCard">
          <div className="sectionHeader">
            <div>
              <p className="muted">Alertas</p>
              <h2>Morosidad</h2>
            </div>
          </div>

          {motosMorosas.slice(0,5).map(m=>{
            const clienteMora = clientes.find(c=>c.id===m.clienteId);
            const deuda = deudaMoto(m);

            return (
              <div className="activityItem" key={m.id}>
                <div>
                  <b>{m.placa}</b>
                  <p>{clienteMora?.nombre || "Sin cliente"}</p>
                </div>

                <div className="dangerPill">
                  {deuda.cuotasPendientes} cuotas
                </div>
              </div>
            );
          })}

          {motosMorosas.length===0 && (
            <p>No hay morosidad registrada.</p>
          )}
        </div>
      </div>

      <div className="card chartCard premiumChartCard">
        <div className="sectionHeader">
          <div>
            <p className="muted">Indicadores visuales</p>
            <h2>Gráficas financieras</h2>
          </div>
        </div>

        <div className="chartsGrid">
          <div className="realChartCard">
            <h3>Ingresos vs Gastos</h3>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartFinanzas}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ingresos" radius={[12,12,0,0]} fill="#ff6600" />
                <Bar dataKey="gastos" radius={[12,12,0,0]} fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="realChartCard">
            <h3>Morosidad</h3>

            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={chartMorosidad}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}