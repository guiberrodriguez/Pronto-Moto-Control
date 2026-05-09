import {
  BarChart3,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Bike,
  ShieldAlert,
} from "lucide-react";

export default function Reportes({
  pagos,
  gastos,
  motos,
  clientes,
  usuarios,
  empresa,
}) {

  const ingresos = pagos.reduce(
    (s,p)=>s+Number(p.monto || 0),
    0
  );

  const egresos = gastos.reduce(
    (s,g)=>s+Number(g.monto || 0),
    0
  );

  const neto = ingresos-egresos;

  const motosAlquiladas =
    motos.filter(m=>m.clienteId).length;

  const motosDisponibles =
    motos.filter(m=>!m.clienteId).length;

  const pagosHoy =
    pagos.filter(
      p=>p.fecha === new Date().toISOString().slice(0,10)
    ).length;

  const cobradores =
    usuarios.filter(
      u=>u.rol === "cobrador"
    ).length;

  const clientesActivos =
    clientes.length;

  const morosos =
    motos.filter(m=>m.estado === "En mora").length;

  return (

    <div className="reportesPage">

      {/* HERO */}
      <section className="reportesHero">

        <div>

          <span>
            Inteligencia empresarial
          </span>

          <h1>
            Reportes Ejecutivos
          </h1>

          <p>
            Análisis financiero, operativo
            y estratégico de la empresa.
          </p>

        </div>

        <div className="reportesHeroIcon">

          <BarChart3 size={42}/>

        </div>

      </section>

      {/* KPIS */}
      <section className="reportesGrid">

        <div className="reporteCard ingresos">

          <div className="reporteTop">

            <div className="reporteIcon">
              <Wallet size={24}/>
            </div>

            <span>
              Ingresos
            </span>

          </div>

          <h2>
            RD$
            {Number(ingresos).toLocaleString()}
          </h2>

          <p>
            Total cobrado
          </p>

        </div>

        <div className="reporteCard gastos">

          <div className="reporteTop">

            <div className="reporteIcon">
              <TrendingDown size={24}/>
            </div>

            <span>
              Gastos
            </span>

          </div>

          <h2>
            RD$
            {Number(egresos).toLocaleString()}
          </h2>

          <p>
            Egresos registrados
          </p>

        </div>

        <div className="reporteCard neto">

          <div className="reporteTop">

            <div className="reporteIcon">
              <TrendingUp size={24}/>
            </div>

            <span>
              Ganancia neta
            </span>

          </div>

          <h2>
            RD$
            {Number(neto).toLocaleString()}
          </h2>

          <p>
            Resultado operativo
          </p>

        </div>

        <div className="reporteCard morosidad">

          <div className="reporteTop">

            <div className="reporteIcon">
              <AlertTriangle size={24}/>
            </div>

            <span>
              Morosidad
            </span>

          </div>

          <h2>
            {morosos}
          </h2>

          <p>
            Motos en atraso
          </p>

        </div>

      </section>

      {/* ANALISIS */}
      <section className="analisisGrid">

        <div className="analisisCard">

          <div className="analisisHeader">

            <Bike size={24}/>

            <h2>
              Estado de flota
            </h2>

          </div>

          <div className="analisisItems">

            <div className="analisisItem">

              <small>
                Motos totales
              </small>

              <strong>
                {motos.length}
              </strong>

            </div>

            <div className="analisisItem">

              <small>
                Alquiladas
              </small>

              <strong className="greenText">
                {motosAlquiladas}
              </strong>

            </div>

            <div className="analisisItem">

              <small>
                Disponibles
              </small>

              <strong className="orangeText">
                {motosDisponibles}
              </strong>

            </div>

          </div>

        </div>

        <div className="analisisCard">

          <div className="analisisHeader">

            <Users size={24}/>

            <h2>
              Operación
            </h2>

          </div>

          <div className="analisisItems">

            <div className="analisisItem">

              <small>
                Clientes activos
              </small>

              <strong>
                {clientesActivos}
              </strong>

            </div>

            <div className="analisisItem">

              <small>
                Cobradores
              </small>

              <strong className="greenText">
                {cobradores}
              </strong>

            </div>

            <div className="analisisItem">

              <small>
                Pagos hoy
              </small>

              <strong className="orangeText">
                {pagosHoy}
              </strong>

            </div>

          </div>

        </div>

        <div className="analisisCard">

          <div className="analisisHeader">

            <ShieldAlert size={24}/>

            <h2>
              Riesgo financiero
            </h2>

          </div>

          <div className="riesgoPanel">

            <div className="riesgoBar">

              <div
                className="riesgoFill"
                style={{
                  width: `${
                    motos.length
                      ? (morosos/motos.length)*100
                      : 0
                  }%`
                }}
              />

            </div>

            <p>

              {
                motos.length
                  ? Math.round(
                      (morosos/motos.length)*100
                    )
                  : 0
              }%

              de la flota presenta riesgo operativo.

            </p>

          </div>

        </div>

      </section>

      {/* RESUMEN */}
      <section className="empresaResumen">

        <h2>
          Resumen Ejecutivo
        </h2>

        <p>
          {empresa?.nombre || "Pronto Moto"}
        </p>

        <div className="empresaResumenGrid">

          <div>
            <small>
              Ingresos
            </small>

            <strong className="greenText">
              RD$
              {Number(ingresos).toLocaleString()}
            </strong>
          </div>

          <div>
            <small>
              Gastos
            </small>

            <strong className="redText">
              RD$
              {Number(egresos).toLocaleString()}
            </strong>
          </div>

          <div>
            <small>
              Neto
            </small>

            <strong className="orangeText">
              RD$
              {Number(neto).toLocaleString()}
            </strong>
          </div>

        </div>

      </section>

    </div>
  );
}