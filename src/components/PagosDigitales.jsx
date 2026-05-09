import {
  CreditCard,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
} from "lucide-react";

export default function PagosDigitales({
  pagosDigitales,
}) {
  const total = pagosDigitales.reduce(
    (s, p) => s + Number(p.monto || 0),
    0
  );

  const pendientes = pagosDigitales.filter(
    (p) => p.estado === "Pendiente"
  ).length;

  const aprobados = pagosDigitales.filter(
    (p) => p.estado === "Aprobado"
  ).length;

  const rechazados = pagosDigitales.filter(
    (p) => p.estado === "Rechazado"
  ).length;

  function estadoClase(estado) {
    if (estado === "Aprobado") return "aprobado";
    if (estado === "Rechazado") return "rechazado";
    return "pendiente";
  }

  function estadoIcono(estado) {
    if (estado === "Aprobado") return <CheckCircle2 size={18} />;
    if (estado === "Rechazado") return <XCircle size={18} />;
    return <Clock size={18} />;
  }

  return (
    <div className="pagosDigitalesPage">
      <section className="pagosDigitalesHero">
        <div>
          <span>Fintech y pasarelas</span>
          <h1>Pagos Digitales</h1>
          <p>
            Controla pagos por transferencia, links digitales y validaciones pendientes.
          </p>
        </div>

        <div className="pagosDigitalesHeroIcon">
          <CreditCard size={42} />
        </div>
      </section>

      <section className="pagosDigitalesResumen">
        <div className="pagoDigitalMetric total">
          <Wallet size={26} />
          <span>Total digital</span>
          <h2>RD${Number(total).toLocaleString()}</h2>
        </div>

        <div className="pagoDigitalMetric pendiente">
          <Clock size={26} />
          <span>Pendientes</span>
          <h2>{pendientes}</h2>
        </div>

        <div className="pagoDigitalMetric aprobado">
          <CheckCircle2 size={26} />
          <span>Aprobados</span>
          <h2>{aprobados}</h2>
        </div>

        <div className="pagoDigitalMetric rechazado">
          <XCircle size={26} />
          <span>Rechazados</span>
          <h2>{rechazados}</h2>
        </div>
      </section>

      <section className="pagosDigitalesGrid">
        {pagosDigitales.map((p) => (
          <div key={p.id || p.comprobanteId} className="pagoDigitalCard">
            <div className="pagoDigitalTop">
              <div className="pagoDigitalIcon">
                <CreditCard size={26} />
              </div>

              <span className={`pagoDigitalEstado ${estadoClase(p.estado)}`}>
                {estadoIcono(p.estado)}
                {p.estado || "Pendiente"}
              </span>
            </div>

            <h2>RD${Number(p.monto || 0).toLocaleString()}</h2>

            <p>{p.cliente || "Cliente no definido"}</p>

            <div className="pagoDigitalInfo">
              <div>
                <small>Comprobante</small>
                <strong>{p.comprobanteId || "N/A"}</strong>
              </div>

              <div>
                <small>Pasarela</small>
                <strong>{p.pasarela || "No definida"}</strong>
              </div>

              <div>
                <small>Moto</small>
                <strong>{p.moto || "Sin moto"}</strong>
              </div>

              <div>
                <small>Fecha</small>
                <strong>{p.fecha || "Sin fecha"}</strong>
              </div>
            </div>

            {p.linkPago && (
              <a
                className="pagoDigitalLink"
                href={p.linkPago}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={18} />
                Abrir link de pago
              </a>
            )}
          </div>
        ))}

        {pagosDigitales.length === 0 && (
          <div className="pagosDigitalesEmpty">
            <CreditCard size={52} />
            <h2>No hay pagos digitales</h2>
            <p>
              Cuando registres pagos digitales aparecerán aquí.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}