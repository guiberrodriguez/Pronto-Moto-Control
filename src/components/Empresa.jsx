import {
  Building2,
  Phone,
  MapPin,
  FileText,
  Save,
  BadgeInfo,
} from "lucide-react";

export default function Empresa({
  esAdmin,
  empresa,
  setEmpresa,
  guardarEmpresa,
}) {
  return (
    <div className="empresaPage">
      <section className="empresaHero">
        <div>
          <span>Perfil corporativo</span>
          <h1>Empresa</h1>
          <p>
            Configura los datos que aparecerán en contratos, comprobantes y documentos oficiales.
          </p>
        </div>

        <div className="empresaHeroIcon">
          <Building2 size={42} />
        </div>
      </section>

      <section className="empresaFormCard">
        <h2>Datos de la empresa</h2>

        <div className="empresaFormGrid">
          <div className="empresaField">
            <label>Nombre comercial</label>
            <div>
              <Building2 size={18} />
              <input
                placeholder="Nombre de la empresa"
                value={empresa.nombre}
                onChange={(e) =>
                  setEmpresa({ ...empresa, nombre: e.target.value })
                }
                disabled={!esAdmin}
              />
            </div>
          </div>

          <div className="empresaField">
            <label>Teléfono</label>
            <div>
              <Phone size={18} />
              <input
                placeholder="Teléfono"
                value={empresa.telefono}
                onChange={(e) =>
                  setEmpresa({ ...empresa, telefono: e.target.value })
                }
                disabled={!esAdmin}
              />
            </div>
          </div>

          <div className="empresaField">
            <label>Dirección</label>
            <div>
              <MapPin size={18} />
              <input
                placeholder="Dirección"
                value={empresa.direccion}
                onChange={(e) =>
                  setEmpresa({ ...empresa, direccion: e.target.value })
                }
                disabled={!esAdmin}
              />
            </div>
          </div>

          <div className="empresaField">
            <label>RNC / Cédula</label>
            <div>
              <FileText size={18} />
              <input
                placeholder="RNC o cédula"
                value={empresa.rnc}
                onChange={(e) =>
                  setEmpresa({ ...empresa, rnc: e.target.value })
                }
                disabled={!esAdmin}
              />
            </div>
          </div>
        </div>

        <div className="empresaNotasBox">
          <label>Notas legales o condiciones generales</label>

          <textarea
            placeholder="Escribe notas legales para contratos o recibos..."
            value={empresa.notas}
            onChange={(e) =>
              setEmpresa({ ...empresa, notas: e.target.value })
            }
            disabled={!esAdmin}
          />
        </div>

        <button
          className="empresaSaveBtn"
          disabled={!esAdmin}
          onClick={guardarEmpresa}
        >
          <Save size={20} />
          Guardar datos corporativos
        </button>
      </section>

      <section className="empresaPreviewCard">
        <div className="empresaPreviewHeader">
          <div>
            <span>Vista previa</span>
            <h2>{empresa.nombre || "Pronto Moto"}</h2>
          </div>

          <BadgeInfo size={34} />
        </div>

        <div className="empresaPreviewGrid">
          <div>
            <small>Teléfono</small>
            <strong>{empresa.telefono || "Sin teléfono"}</strong>
          </div>

          <div>
            <small>Dirección</small>
            <strong>{empresa.direccion || "Sin dirección"}</strong>
          </div>

          <div>
            <small>RNC / Cédula</small>
            <strong>{empresa.rnc || "No definido"}</strong>
          </div>

          <div>
            <small>Uso documental</small>
            <strong>Contratos y recibos</strong>
          </div>
        </div>

        <div className="empresaLegalPreview">
          <small>Notas legales</small>
          <p>{empresa.notas || "No hay notas legales configuradas."}</p>
        </div>
      </section>
    </div>
  );
}