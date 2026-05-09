import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Receipt,
  BadgeDollarSign,
} from "lucide-react";

export default function CajaDiaria({
  pagos,
  gastos,
  empresa,
}) {
  const hoy = new Date().toISOString().slice(0, 10);

  const pagosHoy = pagos.filter((p) => p.fecha === hoy);
  const gastosHoy = gastos.filter((g) => g.fecha === hoy);

  const ingresosHoy = pagosHoy.reduce(
    (s, p) => s + Number(p.monto || 0),
    0
  );

  const egresosHoy = gastosHoy.reduce(
    (s, g) => s + Number(g.monto || 0),
    0
  );

  const balanceHoy = ingresosHoy - egresosHoy;

  return (
    <div className="cajaPage">
      <section className="cajaHero">
        <div>
          <span>Cierre financiero diario</span>
          <h1>Caja Diaria</h1>
          <p>
            Control de ingresos, gastos y balance operativo del día.
          </p>
        </div>

        <div className="cajaHeroIcon">
          <CalendarDays size={42} />
        </div>
      </section>

      <section className="cajaResumenGrid">
        <div className="cajaCard ingresos">
          <Wallet size={28} />
          <span>Ingresos hoy</span>
          <h2>RD${Number(ingresosHoy).toLocaleString()}</h2>
        </div>

        <div className="cajaCard gastos">
          <TrendingDown size={28} />
          <span>Gastos hoy</span>
          <h2>RD${Number(egresosHoy).toLocaleString()}</h2>
        </div>

        <div className="cajaCard balance">
          <TrendingUp size={28} />
          <span>Balance neto</span>
          <h2>RD${Number(balanceHoy).toLocaleString()}</h2>
        </div>
      </section>

      <section className="cajaMovimientosGrid">
        <div className="cajaPanel">
          <div className="cajaPanelHeader">
            <Receipt size={24} />
            <h2>Pagos de hoy</h2>
          </div>

          <div className="cajaLista">
            {pagosHoy.map((p) => (
              <div key={p.docId || p.id} className="cajaItem pago">
                <div>
                  <strong>{p.cliente}</strong>
                  <small>{p.moto}</small>
                </div>

                <span>RD${Number(p.monto || 0).toLocaleString()}</span>
              </div>
            ))}

            {pagosHoy.length === 0 && (
              <p className="cajaEmpty">No hay pagos registrados hoy.</p>
            )}
          </div>
        </div>

        <div className="cajaPanel">
          <div className="cajaPanelHeader">
            <BadgeDollarSign size={24} />
            <h2>Gastos de hoy</h2>
          </div>

          <div className="cajaLista">
            {gastosHoy.map((g) => (
              <div key={g.id} className="cajaItem gasto">
                <div>
                  <strong>{g.categoria}</strong>
                  <small>{g.proveedor || "Sin proveedor"}</small>
                </div>

                <span>RD${Number(g.monto || 0).toLocaleString()}</span>
              </div>
            ))}

            {gastosHoy.length === 0 && (
              <p className="cajaEmpty">No hay gastos registrados hoy.</p>
            )}
          </div>
        </div>
      </section>

      <section className="cajaCierre">
        <h2>Resumen de cierre</h2>

        <p>{empresa?.nombre || "Pronto Moto"}</p>

        <div className="cajaCierreGrid">
          <div>
            <small>Fecha</small>
            <strong>{hoy}</strong>
          </div>

          <div>
            <small>Pagos registrados</small>
            <strong>{pagosHoy.length}</strong>
          </div>

          <div>
            <small>Gastos registrados</small>
            <strong>{gastosHoy.length}</strong>
          </div>

          <div>
            <small>Balance final</small>
            <strong className={balanceHoy >= 0 ? "greenText" : "redText"}>
              RD${Number(balanceHoy).toLocaleString()}
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}