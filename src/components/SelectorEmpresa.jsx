import {
  Building2,
  CheckCircle2,
  Plus,
  ShieldCheck,
} from "lucide-react";

export default function SelectorEmpresa({
  empresas,
  empresaActual,
  setEmpresaActual,
}) {
  return (
    <div className="selectorEmpresaPage">
      <section className="selectorEmpresaHero">
        <div>
          <span>Multiempresa</span>
          <h1>Seleccionar empresa</h1>
          <p>
            Elige la empresa que deseas administrar dentro del panel Pronto Moto.
          </p>
        </div>

        <div className="selectorEmpresaIcon">
          <Building2 size={42} />
        </div>
      </section>

      <section className="empresasGrid">
        {empresas.map((empresa) => {
          const activa = empresaActual?.id === empresa.id;

          return (
            <button
              key={empresa.id}
              className={`empresaSelectCard ${activa ? "activa" : ""}`}
              onClick={() => setEmpresaActual(empresa)}
            >
              <div className="empresaSelectTop">
                <div className="empresaSelectIcon">
                  <Building2 size={28} />
                </div>

                {activa && (
                  <span className="empresaActivaBadge">
                    <CheckCircle2 size={16} />
                    Activa
                  </span>
                )}
              </div>

              <h2>{empresa.nombre || "Empresa sin nombre"}</h2>

              <p>{empresa.direccion || "Sin dirección registrada"}</p>

              <div className="empresaSelectMeta">
                <span>
                  <ShieldCheck size={15} />
                  Panel seguro
                </span>

                <span>
                  RNC: {empresa.rnc || "N/A"}
                </span>
              </div>
            </button>
          );
        })}

        {empresas.length === 0 && (
          <div className="empresaEmptyCard">
            <Plus size={48} />
            <h2>No hay empresas registradas</h2>
            <p>
              Crea una empresa en Firestore para comenzar a usar el sistema multiempresa.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}