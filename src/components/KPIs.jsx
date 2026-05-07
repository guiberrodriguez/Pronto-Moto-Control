import React, { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Trophy,
  Bike,
  Users
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

import { money } from "../utils/helpers";

export default function KPIs({
  esAdmin,
  pagos,
  gastos,
  motos,
  clientes,
  usuarios
}){
  if(!esAdmin) return null;

  const totalIngresos = pagos.reduce((s,p)=>s+Number(p.monto||0),0);
  const totalGastos = gastos.reduce((s,g)=>s+Number(g.monto||0),0);
  const utilidad = totalIngresos-totalGastos;

  const ticketPromedio = pagos.length
    ? totalIngresos/pagos.length
    : 0;

  const mejorMoto = useMemo(()=>{
    const ranking = motos.map(m=>{
      const ingresos = pagos
        .filter(p=>p.motoId===m.id)
        .reduce((s,p)=>s+Number(p.monto||0),0);

      const egresos = gastos
        .filter(g=>g.motoId===m.id)
        .reduce((s,g)=>s+Number(g.monto||0),0);

      return {
        ...m,
        neto: ingresos-egresos
      };
    });

    return ranking.sort((a,b)=>b.neto-a.neto)[0];
  },[motos,pagos,gastos]);

  const mejorCobrador = useMemo(()=>{
    const ranking = usuarios.map(u=>{
      const total = pagos
        .filter(p=>p.cobradorId===u.uid || p.cobradorId===u.id)
        .reduce((s,p)=>s+Number(p.monto||0),0);

      return {
        ...u,
        total
      };
    });

    return ranking.sort((a,b)=>b.total-a.total)[0];
  },[usuarios,pagos]);

  const ingresosMensuales = useMemo(()=>{
    const mapa={};

    pagos.forEach(p=>{
      if(!p.fecha) return;

      const mes = String(p.fecha).slice(0,7);

      if(!mapa[mes]){
        mapa[mes]=0;
      }

      mapa[mes]+=Number(p.monto||0);
    });

    return Object.entries(mapa).map(([mes,total])=>({
      mes,
      total
    }));
  },[pagos]);

  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Panel ejecutivo</p>
          <h2>KPIs financieros PRO</h2>
        </div>
      </div>

      <div className="kpiGrid">
        <div className="kpiCard successKpi">
          <TrendingUp size={26}/>
          <span>Ingresos totales</span>
          <b>{money(totalIngresos)}</b>
        </div>

        <div className="kpiCard dangerKpi">
          <TrendingDown size={26}/>
          <span>Gastos totales</span>
          <b>{money(totalGastos)}</b>
        </div>

        <div className="kpiCard primaryKpi">
          <Wallet size={26}/>
          <span>Utilidad neta</span>
          <b>{money(utilidad)}</b>
        </div>

        <div className="kpiCard warningKpi">
          <Trophy size={26}/>
          <span>Ticket promedio</span>
          <b>{money(ticketPromedio)}</b>
        </div>

        <div className="kpiCard">
          <Bike size={26}/>
          <span>Mejor moto</span>
          <b>{mejorMoto?.placa || "N/A"}</b>
        </div>

        <div className="kpiCard">
          <Users size={26}/>
          <span>Mejor cobrador</span>
          <b>{mejorCobrador?.nombre || "N/A"}</b>
        </div>
      </div>

      <div className="card chartCard premiumChartCard">
        <div className="sectionHeader">
          <div>
            <p className="muted">Análisis financiero</p>
            <h2>Crecimiento mensual</h2>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={ingresosMensuales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="total"
              stroke="#ff6600"
              fill="#ff6600"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="gridStats premiumStats">
        <div className="card stat premiumStat">
          <span>Total clientes</span>
          <b>{clientes.length}</b>
        </div>

        <div className="card stat premiumStat">
          <span>Total motos</span>
          <b>{motos.length}</b>
        </div>

        <div className="card stat premiumStat">
          <span>Total pagos</span>
          <b>{pagos.length}</b>
        </div>

        <div className="card stat premiumStat">
          <span>Total cobradores</span>
          <b>{usuarios.filter(u=>u.rol==="cobrador").length}</b>
        </div>
      </div>
    </div>
  );
}