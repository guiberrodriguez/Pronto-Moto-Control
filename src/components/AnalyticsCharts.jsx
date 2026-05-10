import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

import {
  TrendingUp,
  Bike,
  Wallet,
  BadgeDollarSign,
} from "lucide-react";

const COLORS = ["#ff6b00", "#3b82f6", "#22c55e", "#eab308", "#ef4444"];

function money(value) {
  return `RD$${Number(value || 0).toLocaleString()}`;
}

export default function AnalyticsCharts({
  pagos = [],
  gastos = [],
  motos = [],
  clientes = [],
}) {
  const totalIngresos = pagos.reduce((s, p) => s + Number(p.monto || 0), 0);
  const totalGastos = gastos.reduce((s, g) => s + Number(g.monto || 0), 0);
  const neto = totalIngresos - totalGastos;

  const ingresosPorDia = {};

  pagos.forEach((p) => {
    const fecha = p.fecha || "Sin fecha";
    ingresosPorDia[fecha] =
      (ingresosPorDia[fecha] || 0) + Number(p.monto || 0);
  });

  const ingresosData = Object.entries(ingresosPorDia)
    .map(([fecha, monto]) => ({ fecha, monto }))
    .slice(-7);

  const estadoMotos = [
    {
      name: "Activas",
      value: motos.filter((m) => m.clienteId).length,
    },
    {
      name: "Disponibles",
      value: motos.filter((m) => !m.clienteId).length,
    },
  ];

  const topMotos = motos
    .map((m) => {
      const ingresos = pagos
        .filter((p) => p.motoId === m.id)
        .reduce((s, p) => s + Number(p.monto || 0), 0);

      return {
        name: m.placa || "Moto",
        ingresos,
      };
    })
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, 5);

  const gastosPorCategoria = {};

  gastos.forEach((g) => {
    const categoria = g.categoria || "Otros";
    gastosPorCategoria[categoria] =
      (gastosPorCategoria[categoria] || 0) + Number(g.monto || 0);
  });

  const gastosChart = Object.entries(gastosPorCategoria).map(
    ([categoria, monto]) => ({
      categoria,
      monto,
    })
  );

  return (
    <section className="analyticsProSection">
      <div className="analyticsHeroMini">
        <div>
          <span>Analytics realtime</span>
          <h2>Inteligencia del negocio</h2>
          <p>
            Visualiza tendencias, flota, ingresos, gastos y rendimiento por moto.
          </p>
        </div>

        <div className="analyticsPulse">
          <TrendingUp size={30} />
        </div>
      </div>

      <div className="analyticsKpiGrid">
        <div className="analyticsKpiCard">
          <Wallet size={24} />
          <span>Ingresos analizados</span>
          <strong>{money(totalIngresos)}</strong>
        </div>

        <div className="analyticsKpiCard">
          <BadgeDollarSign size={24} />
          <span>Gastos analizados</span>
          <strong>{money(totalGastos)}</strong>
        </div>

        <div className="analyticsKpiCard">
          <TrendingUp size={24} />
          <span>Resultado neto</span>
          <strong>{money(neto)}</strong>
        </div>

        <div className="analyticsKpiCard">
          <Bike size={24} />
          <span>Flota registrada</span>
          <strong>{motos.length}</strong>
        </div>
      </div>

      <div className="analyticsGrid">
        <div className="chartCard">
          <div className="chartHeader">
            <span>Realtime</span>
            <h3>Ingresos últimos días</h3>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={ingresosData}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ff6b00" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
              <XAxis dataKey="fecha" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />

              <Area
                type="monotone"
                dataKey="monto"
                stroke="#ff6b00"
                fillOpacity={1}
                fill="url(#colorIngresos)"
                strokeWidth={4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chartCard">
          <div className="chartHeader">
            <span>Operación</span>
            <h3>Estado de flota</h3>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={estadoMotos}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {estadoMotos.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chartCard fullWidth">
          <div className="chartHeader">
            <span>Rentabilidad</span>
            <h3>Motos más productivas</h3>
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={topMotos}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="ingresos" fill="#ff6b00" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chartCard fullWidth">
          <div className="chartHeader">
            <span>Finanzas</span>
            <h3>Distribución de gastos</h3>
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={gastosChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
              <XAxis dataKey="categoria" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="monto" fill="#3b82f6" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}