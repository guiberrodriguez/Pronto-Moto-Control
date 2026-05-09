import {
  Activity,
  Target,
  Wallet,
  Bike,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function KPIs({
  pagos,
  gastos,
  motos,
  clientes,
  usuarios,
}) {
  const ingresos = pagos.reduce((s, p) => s + Number(p.monto || 0), 0);
  const egresos = gastos.reduce((s, g) => s + Number(g.monto || 0), 0);
  const neto = ingresos - egresos;

  const motosTotales = motos.length;
  const motosAlquiladas = motos.filter((m) => m.clienteId).length;
  const motosDisponibles = motos.filter((m) => !m.clienteId).length;

  const ocupacion = motosTotales
    ? Math.round((motosAlquiladas / motosTotales) * 100)
    : 0;

  const clientesTotales = clientes.length;
  const cobradores = usuarios.filter((u) => u.rol === "cobrador").length;

  const ticketPromedio = pagos.length
    ? Math.round(ingresos / pagos.length)
    : 0;

  const margen = ingresos
    ? Math.round((neto / ingresos) * 100)
    : 0;

  const pagosHoy = pagos.filter(
    (p) => p.fecha === new Date().toISOString().slice(0, 10)
  ).length;

  const motosRiesgo = motos.filter((m) => m.estado === "En mora").length;

  return (
    <div className="kpisPage">
      <section className="kpisHero">
        <div>
          <span>Panel analítico</span>
          <h1>KPIs Ejecutivos</h1>
          <p>
            Indicadores clave de rendimiento financiero, operativo y comercial.
          </p>
        </div>

        <div className="kpisHeroIcon">
          <Activity size={42} />
        </div>
      </section>

      <section className="kpisGrid">
        <KpiCard
          icon={<Wallet size={26} />}
          title="Ingresos"
          value={`RD$${Number(ingresos).toLocaleString()}`}
          note="Total cobrado"
          status="positivo"
        />

        <KpiCard
          icon={<TrendingDown size={26} />}
          title="Gastos"
          value={`RD$${Number(egresos).toLocaleString()}`}
          note="Total egresos"
          status="negativo"
        />

        <KpiCard
          icon={<TrendingUp size={26} />}
          title="Neto"
          value={`RD$${Number(neto).toLocaleString()}`}
          note="Ganancia operativa"
          status={neto >= 0 ? "positivo" : "negativo"}
        />

        <KpiCard
          icon={<Target size={26} />}
          title="Margen"
          value={`${margen}%`}
          note="Rentabilidad sobre ingresos"
          status={margen >= 30 ? "positivo" : margen >= 10 ? "alerta" : "negativo"}
        />

        <KpiCard
          icon={<Bike size={26} />}
          title="Ocupación flota"
          value={`${ocupacion}%`}
          note={`${motosAlquiladas} alquiladas / ${motosDisponibles} disponibles`}
          status={ocupacion >= 70 ? "positivo" : ocupacion >= 40 ? "alerta" : "negativo"}
        />

        <KpiCard
          icon={<Users size={26} />}
          title="Clientes"
          value={clientesTotales}
          note={`${cobradores} cobradores activos`}
          status="neutral"
        />

        <KpiCard
          icon={<Wallet size={26} />}
          title="Ticket promedio"
          value={`RD$${Number(ticketPromedio).toLocaleString()}`}
          note="Promedio por pago"
          status="neutral"
        />

        <KpiCard
          icon={<AlertTriangle size={26} />}
          title="Riesgo"
          value={motosRiesgo}
          note="Motos marcadas en mora"
          status={motosRiesgo > 0 ? "negativo" : "positivo"}
        />
      </section>

      <section className="kpisAnalysisGrid">
        <div className="kpiAnalysisCard">
          <h2>Salud financiera</h2>

          <div className="kpiProgressBox">
            <div className="kpiProgressHeader">
              <span>Margen operativo</span>
              <strong>{margen}%</strong>
            </div>

            <div className="kpiProgressTrack">
              <div
                className="kpiProgressFill"
                style={{ width: `${Math.max(0, Math.min(margen, 100))}%` }}
              />
            </div>
          </div>

          <p>
            {margen >= 30
              ? "Excelente rentabilidad operativa."
              : margen >= 10
              ? "Rentabilidad positiva, pero con espacio para mejorar."
              : "Margen bajo. Revisa gastos, mora y rendimiento por moto."}
          </p>
        </div>

        <div className="kpiAnalysisCard">
          <h2>Eficiencia operativa</h2>

          <div className="kpiProgressBox">
            <div className="kpiProgressHeader">
              <span>Uso de flota</span>
              <strong>{ocupacion}%</strong>
            </div>

            <div className="kpiProgressTrack">
              <div
                className="kpiProgressFill orange"
                style={{ width: `${ocupacion}%` }}
              />
            </div>
          </div>

          <p>
            {ocupacion >= 70
              ? "La flota está bien aprovechada."
              : ocupacion >= 40
              ? "Uso moderado de flota. Hay oportunidad de colocar más motos."
              : "Baja ocupación. Prioriza ventas, asignaciones y recuperación."}
          </p>
        </div>

        <div className="kpiAnalysisCard">
          <h2>Cobranza del día</h2>

          <div className="kpiTodayNumber">
            {pagosHoy}
          </div>

          <p>
            Pagos registrados hoy. Usa este indicador para medir actividad diaria.
          </p>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ icon, title, value, note, status }) {
  return (
    <div className={`kpiCard ${status}`}>
      <div className="kpiCardTop">
        <div className="kpiIcon">
          {icon}
        </div>

        <span>{title}</span>
      </div>

      <h2>{value}</h2>
      <p>{note}</p>
    </div>
  );
}
