import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  UserRound,
  Clock,
} from "lucide-react";

export default function Notificaciones({
  notificaciones,
  marcarNotificacionLeida,
}) {
  const pendientes = notificaciones.filter((n) => !n.leida).length;

  function iconoTipo(tipo) {
    if (tipo === "admin") return <Wallet size={24} />;
    if (tipo === "cobrador") return <UserRound size={24} />;
    return <Bell size={24} />;
  }

  return (
    <div className="notificacionesPage">
      <section className="notificacionesHero">
        <div>
          <span>Centro de alertas</span>
          <h1>Notificaciones</h1>
          <p>
            Revisa pagos, alertas operativas y avisos importantes del sistema.
          </p>
        </div>

        <div className="notificacionesHeroIcon">
          <Bell size={42} />
        </div>
      </section>

      <section className="notificacionesResumen">
        <div className="notificacionMetric">
          <Bell size={26} />
          <span>Total alertas</span>
          <h2>{notificaciones.length}</h2>
        </div>

        <div className="notificacionMetric pendiente">
          <AlertTriangle size={26} />
          <span>Pendientes</span>
          <h2>{pendientes}</h2>
        </div>

        <div className="notificacionMetric leida">
          <CheckCircle2 size={26} />
          <span>Leídas</span>
          <h2>{notificaciones.length - pendientes}</h2>
        </div>
      </section>

      <section className="notificacionesGrid">
        {notificaciones.map((n) => (
          <div
            key={n.id}
            className={`notificacionCard ${n.leida ? "leida" : "pendiente"}`}
          >
            <div className="notificacionTop">
              <div className="notificacionIcon">
                {iconoTipo(n.tipo)}
              </div>

              <span className={n.leida ? "estadoNotif leida" : "estadoNotif pendiente"}>
                {n.leida ? "Leída" : "Pendiente"}
              </span>
            </div>

            <h2>{n.titulo || "Notificación"}</h2>

            <p>{n.mensaje || "Sin mensaje"}</p>

            <div className="notificacionFecha">
              <Clock size={16} />
              {n.fechaHora || "Sin fecha"}
            </div>

            {!n.leida && (
              <button
                className="marcarLeidaBtn"
                onClick={() => marcarNotificacionLeida(n)}
              >
                <CheckCircle2 size={18} />
                Marcar como leída
              </button>
            )}
          </div>
        ))}

        {notificaciones.length === 0 && (
          <div className="notificacionesEmpty">
            <Bell size={52} />
            <h2>No hay notificaciones</h2>
            <p>Cuando el sistema genere alertas aparecerán aquí.</p>
          </div>
        )}
      </section>
    </div>
  );
}