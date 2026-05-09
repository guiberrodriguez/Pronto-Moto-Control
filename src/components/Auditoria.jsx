import {
  ClipboardList,
  UserRound,
  Clock,
  ShieldCheck,
  PlusCircle,
  Pencil,
  Trash2,
  Activity,
} from "lucide-react";

export default function Auditoria({
  auditLogs,
}) {
  function iconoAccion(accion = "") {
    if (accion.includes("crear")) return <PlusCircle size={24} />;
    if (accion.includes("editar")) return <Pencil size={24} />;
    if (accion.includes("eliminar")) return <Trash2 size={24} />;
    return <Activity size={24} />;
  }

  function claseAccion(accion = "") {
    if (accion.includes("crear")) return "crear";
    if (accion.includes("editar")) return "editar";
    if (accion.includes("eliminar")) return "eliminar";
    return "general";
  }

  const creaciones = auditLogs.filter((l) =>
    String(l.accion || "").includes("crear")
  ).length;

  const ediciones = auditLogs.filter((l) =>
    String(l.accion || "").includes("editar")
  ).length;

  const eliminaciones = auditLogs.filter((l) =>
    String(l.accion || "").includes("eliminar")
  ).length;

  return (
    <div className="auditoriaPage">
      <section className="auditoriaHero">
        <div>
          <span>Historial empresarial</span>
          <h1>Auditoría</h1>
          <p>
            Registro de acciones críticas, usuarios, módulos y trazabilidad operativa.
          </p>
        </div>

        <div className="auditoriaHeroIcon">
          <ClipboardList size={42} />
        </div>
      </section>

      <section className="auditoriaResumen">
        <div className="auditoriaMetric">
          <ShieldCheck size={26} />
          <span>Total eventos</span>
          <h2>{auditLogs.length}</h2>
        </div>

        <div className="auditoriaMetric crear">
          <PlusCircle size={26} />
          <span>Creaciones</span>
          <h2>{creaciones}</h2>
        </div>

        <div className="auditoriaMetric editar">
          <Pencil size={26} />
          <span>Ediciones</span>
          <h2>{ediciones}</h2>
        </div>

        <div className="auditoriaMetric eliminar">
          <Trash2 size={26} />
          <span>Eliminaciones</span>
          <h2>{eliminaciones}</h2>
        </div>
      </section>

      <section className="auditoriaTimeline">
        {auditLogs
          .slice()
          .reverse()
          .map((log) => {
            const clase = claseAccion(log.accion);

            return (
              <div key={log.id} className={`auditoriaCard ${clase}`}>
                <div className={`auditoriaIcon ${clase}`}>
                  {iconoAccion(log.accion)}
                </div>

                <div className="auditoriaContent">
                  <div className="auditoriaTop">
                    <span className={`accionBadge ${clase}`}>
                      {log.accion || "evento"}
                    </span>

                    <small>
                      <Clock size={14} />
                      {log.fechaHora || log.fecha || "Sin fecha"}
                    </small>
                  </div>

                  <h2>{log.descripcion || "Evento registrado"}</h2>

                  <div className="auditoriaMeta">
                    <div>
                      <UserRound size={15} />
                      <span>
                        {log.usuario?.nombre ||
                          log.usuario?.correo ||
                          "Usuario no identificado"}
                      </span>
                    </div>

                    <div>
                      <ClipboardList size={15} />
                      <span>{log.modulo || "Módulo general"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        {auditLogs.length === 0 && (
          <div className="auditoriaEmpty">
            <ClipboardList size={52} />
            <h2>No hay eventos de auditoría</h2>
            <p>Cuando se registren acciones del sistema aparecerán aquí.</p>
          </div>
        )}
      </section>
    </div>
  );
}