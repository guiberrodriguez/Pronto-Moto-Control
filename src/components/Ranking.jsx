import {
  Trophy,
  Bike,
  TrendingUp,
  TrendingDown,
  BadgeDollarSign,
} from "lucide-react";

export default function Ranking({
  rankingMotos,
  ingresosPorMoto,
  gastosPorMoto,
}) {
  return (
    <div className="rankingPage">

      <section className="rankingHero">
        <div>
          <span>Rentabilidad operativa</span>
          <h1>Ranking de motos</h1>
          <p>
            Identifica las unidades más rentables, motos con pérdidas y rendimiento financiero por vehículo.
          </p>
        </div>

        <div className="rankingHeroIcon">
          <Trophy size={42} />
        </div>
      </section>

      <section className="rankingGrid">
        {rankingMotos.map((m, index) => {
          const ingresos = ingresosPorMoto(m.id);
          const gastos = gastosPorMoto(m.id);
          const neto = ingresos - gastos;
          const rentable = neto >= 0;

          return (
            <div
              key={m.id}
              className={`rankingCard ${rentable ? "positivo" : "negativo"}`}
            >
              <div className="rankingTop">
                <div className="rankingPosition">
                  #{index + 1}
                </div>

                <div className="rankingBikeIcon">
                  <Bike size={26} />
                </div>
              </div>

              <h2>{m.placa}</h2>

              <p className="rankingModelo">
                {m.marca} {m.modelo}
              </p>

              <div className="rankingStats">
                <div className="rankingStat">
                  <small>Ingresos</small>
                  <strong className="greenText">
                    RD${Number(ingresos || 0).toLocaleString()}
                  </strong>
                </div>

                <div className="rankingStat">
                  <small>Gastos</small>
                  <strong className="redText">
                    RD${Number(gastos || 0).toLocaleString()}
                  </strong>
                </div>

                <div className="rankingStat full">
                  <small>Ganancia neta</small>
                  <strong className={rentable ? "greenText" : "redText"}>
                    RD${Number(neto || 0).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className={`rankingResult ${rentable ? "rentable" : "perdida"}`}>
                {rentable ? <TrendingUp size={18} /> : <TrendingDown size={18} />}

                <span>
                  {rentable ? "Unidad rentable" : "Unidad con pérdida"}
                </span>
              </div>
            </div>
          );
        })}

        {rankingMotos.length === 0 && (
          <div className="rankingEmpty">
            <BadgeDollarSign size={48} />
            <h2>No hay datos de rentabilidad</h2>
            <p>Cuando registres motos, pagos y gastos, aparecerá el ranking.</p>
          </div>
        )}
      </section>

    </div>
  );
}