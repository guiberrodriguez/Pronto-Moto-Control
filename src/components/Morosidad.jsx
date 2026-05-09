import {
  AlertTriangle,
  ShieldAlert,
  Siren,
  MessageCircle,
  Bike,
  Wallet,
} from "lucide-react";

export default function Morosidad({
  motosMorosas,
  clientes,
  deudaMoto,
  mensajeWhatsAppMora,
}) {

  function clienteMoto(id){
    return clientes.find(c=>c.id===id);
  }

  function nivelRiesgo(cuotas){

    if(cuotas >= 5){
      return {
        texto:"Crítico",
        clase:"critico",
        icono:<Siren size={20}/>
      };
    }

    if(cuotas >= 3){
      return {
        texto:"Alto",
        clase:"alto",
        icono:<ShieldAlert size={20}/>
      };
    }

    return {
      texto:"Moderado",
      clase:"moderado",
      icono:<AlertTriangle size={20}/>
    };
  }

  return (
    <div className="morosidadPage">

      {/* HERO */}
      <section className="morosidadHero">

        <div>
          <span>Inteligencia de cobranza</span>

          <h1>
            Morosidad
          </h1>

          <p>
            Gestión avanzada de clientes en atraso,
            riesgo operativo y recuperación financiera.
          </p>
        </div>

        <div className="morosidadResumen">

          <div className="morosidadMetric red">

            <small>
              Motos en mora
            </small>

            <strong>
              {motosMorosas.length}
            </strong>

          </div>

          <div className="morosidadMetric orange">

            <small>
              Riesgo operativo
            </small>

            <strong>
              {
                motosMorosas.filter(
                  m=>deudaMoto(m).cuotasPendientes >= 3
                ).length
              }
            </strong>

          </div>

        </div>

      </section>

      {/* GRID */}
      <section className="morosidadGrid">

        {motosMorosas.length === 0 && (

          <div className="sinMorosidad">

            <Wallet size={48}/>

            <h2>
              No hay clientes en mora
            </h2>

            <p>
              Todas las motocicletas se encuentran al día.
            </p>

          </div>

        )}

        {motosMorosas.map((m)=>{

          const cliente = clienteMoto(m.clienteId);

          const deuda = deudaMoto(m);

          const riesgo = nivelRiesgo(
            deuda.cuotasPendientes
          );

          return (

            <div
              key={m.id}
              className={`morosoCard ${riesgo.clase}`}
            >

              <div className="morosoTop">

                <div className={`riesgoIcon ${riesgo.clase}`}>
                  {riesgo.icono}
                </div>

                <span className={`riesgoBadge ${riesgo.clase}`}>
                  {riesgo.texto}
                </span>

              </div>

              <h2>
                {cliente?.nombre || "Sin cliente"}
              </h2>

              <p className="morosoMoto">

                <Bike size={16}/>

                {m.placa} · {m.marca} {m.modelo}

              </p>

              <div className="morosoInfoGrid">

                <div className="morosoInfoItem">
                  <small>
                    Cuotas pendientes
                  </small>

                  <strong className="redText">
                    {deuda.cuotasPendientes}
                  </strong>
                </div>

                <div className="morosoInfoItem">
                  <small>
                    Deuda estimada
                  </small>

                  <strong className="orangeText">
                    RD$
                    {Number(
                      deuda.montoPendiente || 0
                    ).toLocaleString()}
                  </strong>
                </div>

                <div className="morosoInfoItem">
                  <small>
                    Pago diario
                  </small>

                  <strong>
                    RD$
                    {Number(
                      m.pagoDiario || 0
                    ).toLocaleString()}
                  </strong>
                </div>

                <div className="morosoInfoItem">
                  <small>
                    Tracker GPS
                  </small>

                  <strong>
                    {m.tracker || "No asignado"}
                  </strong>
                </div>

              </div>

              {/* ALERTA */}
              <div className={`morosoAlert ${riesgo.clase}`}>

                {riesgo.icono}

                <span>

                  {
                    deuda.cuotasPendientes >= 5
                      ? "Recuperación inmediata recomendada"
                      : deuda.cuotasPendientes >= 3
                        ? "Cobranza urgente requerida"
                        : "Seguimiento preventivo"
                  }

                </span>

              </div>

              {/* ACTIONS */}
              <div className="morosoActions">

                <a
                  className="morosoBtn whatsapp"
                  href={`https://wa.me/${
                    cliente?.telefono || ""
                  }?text=${encodeURIComponent(
                    mensajeWhatsAppMora(m)
                  )}`}
                  target="_blank"
                >

                  <MessageCircle size={18}/>

                  WhatsApp

                </a>

              </div>

            </div>

          );
        })}

      </section>

    </div>
  );
}