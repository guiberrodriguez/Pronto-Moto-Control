import {
  Users,
  Bike,
  AlertTriangle,
  Wallet,
  TrendingUp,
  ReceiptText,
} from "lucide-react";

function money(value) {
  return `RD$${Number(value || 0).toLocaleString()}`;
}

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
  deudaMoto,
}) {
  const ultimosPagos = [...pagosVisibles]
    .sort((a, b) => String(b.fechaHora || b.fecha).localeCompare(String(a.fechaHora || a.fecha)))
    .slice(0, 4);

  const moraCritica = [...motosMorosas]
    .map((m) => {
      const deuda = deudaMoto(m);
      const cliente = clientes.find((c) => c.id === m.clienteId);

      return {
        moto: m,
        cliente,
        deuda,
      };
    })
    .sort((a, b) => b.deuda.montoPendiente - a.deuda.montoPendiente)
    .slice(0, 3);

  return (
    <div className="inicioCleanPage">
      <section className="inicioHeroClean">
        <div>
          <span>Panel ejecutivo</span>
          <h1>Bienvenido a Pronto Moto</h1>
          <p>
            Resumen rápido de ingresos, clientes, flota, morosidad y últimos movimientos.
          </p>
        </div>

        <div className="inicioHeroIcon">
          <TrendingUp size={42} />
        </div>
      </section>

      <section className="inicioStatsGrid">
        <div className="inicioStatCard orange">
          <div>
            <span>Ingresos acumulados</span>
            <h2>{money(totalIngresos)}</h2>
          </div>
          <Wallet size={34} />
        </div>

        <div className="inicioStatCard blue">
          <div>
            <span>Clientes activos</span>
            <h2>{clientesVisibles.length}</h2>
          </div>
          <Users size={34} />
        </div>

        <div className="inicioStatCard red">
          <div>
            <span>Motos en mora</span>
            <h2>{motosMorosas.length}</h2>
          </div>
          <AlertTriangle size={34} />
        </div>

        <div className="inicioStatCard green">
          <div>
            <span>Ganancia neta</span>
            <h2>{money(neto)}</h2>
          </div>
          <TrendingUp size={34} />
        </div>
      </section>

      <section className="inicioPanelsGrid">
        <div className="inicioPanelCard">
          <div className="inicioPanelHeader">
            <div>
              <span>Cobranza reciente</span>
              <h2>Últimos pagos</h2>
            </div>

            <ReceiptText size={32} />
          </div>

          <div className="inicioList">
            {ultimosPagos.map((p) => (
              <div key={p.docId || p.id} className="inicioListItem">
                <div>
                  <strong>{p.cliente || "Cliente"}</strong>
                  <small>{p.moto || "Moto no definida"}</small>
                </div>

                <b className="greenText">{money(p.monto)}</b>
              </div>
            ))}

            {ultimosPagos.length === 0 && (
              <p className="inicioEmpty">No hay pagos registrados todavía.</p>
            )}
          </div>
        </div>

        <div className="inicioPanelCard">
          <div className="inicioPanelHeader">
            <div>
              <span>Riesgo operativo</span>
              <h2>Morosidad crítica</h2>
            </div>

            <AlertTriangle size={32} />
          </div>

          <div className="inicioList">
            {moraCritica.map(({ moto, cliente, deuda }) => (
              <div key={moto.id} className="inicioListItem">
                <div>
                  <strong>{moto.placa}</strong>
                  <small>{cliente?.nombre || "Sin cliente"}</small>
                </div>

                <div className="inicioDebt">
                  <span>{deuda.cuotasPendientes} cuotas</span>
                  <b>{money(deuda.montoPendiente)}</b>
                </div>
              </div>
            ))}

            {moraCritica.length === 0 && (
              <p className="inicioEmpty">No hay motos en mora actualmente.</p>
            )}
          </div>
        </div>
      </section>

      <section className="inicioFleetCard">
        <div className="inicioPanelHeader">
          <div>
            <span>Estado de flota</span>
            <h2>Motos</h2>
          </div>

          <Bike size={34} />
        </div>

        <div className="inicioFleetGrid">
          <div>
            <small>Activas</small>
            <strong>{motosVisibles.filter((m) => m.clienteId).length}</strong>
          </div>

          <div>
            <small>Disponibles</small>
            <strong>{motosVisibles.filter((m) => !m.clienteId).length}</strong>
          </div>

          <div>
            <small>En mora</small>
            <strong>{motosMorosas.length}</strong>
          </div>

          <div>
            <small>Gastos</small>
            <strong>{esAdmin ? money(totalGastos) : "N/A"}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}