import {
  UploadCloud,
  FileText,
  Image,
  Trash2,
  Download,
  UserRound,
  FolderOpen,
} from "lucide-react";

export default function Adjuntos({
  esAdmin,
  clienteAdjunto,
  setClienteAdjunto,
  archivo,
  setArchivo,
  clientes,
  adjuntos,
  subirAdjunto,
  eliminarAdjunto,
}) {
  function clienteNombre(id) {
    const c = clientes.find((x) => x.id === id);
    return c?.nombre || "Sin cliente";
  }

  function esImagen(tipo = "") {
    return tipo.startsWith("image/");
  }

  return (
    <div className="adjuntosPage">
      <section className="adjuntosHero">
        <div>
          <span>Documentos y evidencias</span>
          <h1>Adjuntos</h1>
          <p>
            Administra cédulas, licencias, contratos, fotos y documentos de clientes.
          </p>
        </div>

        <div className="adjuntosHeroIcon">
          <FolderOpen size={42} />
        </div>
      </section>

      <section className="adjuntoUploadCard">
        <h2>Subir documento</h2>

        <div className="adjuntoFormGrid">
          <select
            value={clienteAdjunto}
            onChange={(e) => setClienteAdjunto(e.target.value)}
          >
            <option value="">Seleccionar cliente</option>

            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <label className="fileUploadBox">
            <UploadCloud size={28} />

            <div>
              <strong>
                {archivo ? archivo.name : "Seleccionar archivo"}
              </strong>

              <small>
                PDF, imagen, documento o evidencia
              </small>
            </div>

            <input
              type="file"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <button
          className="subirAdjuntoBtn"
          onClick={subirAdjunto}
          disabled={!esAdmin}
        >
          <UploadCloud size={20} />
          Subir adjunto
        </button>
      </section>

      <section className="adjuntosGrid">
        {adjuntos.map((a) => (
          <div key={a.id} className="adjuntoCard">
            <div className="adjuntoPreview">
              {esImagen(a.tipo) ? (
                <img src={a.url} alt={a.nombre} />
              ) : (
                <FileText size={46} />
              )}
            </div>

            <div className="adjuntoBody">
              <div className="adjuntoType">
                {esImagen(a.tipo) ? <Image size={18} /> : <FileText size={18} />}
                <span>{esImagen(a.tipo) ? "Imagen" : "Documento"}</span>
              </div>

              <h3>{a.nombre}</h3>

              <p>
                <UserRound size={15} />
                {clienteNombre(a.clienteId)}
              </p>

              <small>{a.fecha}</small>

              <div className="adjuntoActions">
                <a
                  className="adjuntoBtn download"
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download size={18} />
                </a>

                <button
                  className="adjuntoBtn delete"
                  onClick={() => eliminarAdjunto(a)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {adjuntos.length === 0 && (
          <div className="adjuntosEmpty">
            <FolderOpen size={52} />
            <h2>No hay adjuntos registrados</h2>
            <p>Cuando subas documentos o fotos aparecerán aquí.</p>
          </div>
        )}
      </section>
    </div>
  );
}