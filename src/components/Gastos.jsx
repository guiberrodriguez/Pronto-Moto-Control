import {
  BadgeDollarSign,
  Bike,
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
  TrendingDown,
} from "lucide-react";

export default function Gastos({
  esAdmin,
  gasto,
  setGasto,
  editGasto,
  motos,
  gastos,
  guardarGasto,
  editarGasto,
  eliminarGasto,
}) {
  const totalGastos = gastos.reduce(
    (s, g) => s + Number(g.monto || 0),
    0
  );

  function nombreMoto(id) {
    const moto = motos.find((m) => m.id === id);
    if (!moto) return "Sin moto";
    return `${moto.placa} · ${moto.marca || ""} ${moto.modelo || ""}`;
  }

  return (
    <div className="gastosPage">
      <section className="gastosHero">
        <div>
          <span>Control operativo</span>
          <h1>Gastos</h1>
          <p>
            Registra reparaciones, mantenimientos, combustible y otros gastos operativos.
          </p>
        </div>

        <div className="gastosTotalCard">
          <TrendingDown size={26} />
          <small>Total gastos</small>
          <strong>RD${Number(totalGastos).toLocaleString()}</strong>
        </div>
      </section>

      <section className="gastoFormCard">
        <h2>{editGasto ? "Editar gasto" : "Registrar gasto"}</h2>

        <div className="gastoFormGrid">
          <select
            value={gasto.motoId}
            onChange={(e) => setGasto({ ...gasto, motoId: e.target.value })}
          >
            <option value="">Seleccionar moto</option>
            {motos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.placa} · {m.marca} {m.modelo}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={gasto.fecha}
            onChange={(e) => setGasto({ ...gasto, fecha: e.target.value })}
          />

          <select
            value={gasto.categoria}
            onChange={(e) => setGasto({ ...gasto, categoria: e.target.value })}
          >
            <option>Reparación</option>
            <option>Mantenimiento</option>
            <option>Combustible</option>
            <option>Gomas</option>
            <option>Aceite</option>
            <option>Seguro</option>
            <option>Multa</option>
            <option>Otros</option>
          </select>

          <input
            placeholder="Monto"
            value={gasto.monto}
            onChange={(e) => setGasto({ ...gasto, monto: e.target.value })}
          />

          <input
            placeholder="Proveedor"
            value={gasto.proveedor}
            onChange={(e) => setGasto({ ...gasto, proveedor: e.target.value })}
          />

          <input
            placeholder="Nota"
            value={gasto.nota}
            onChange={(e) => setGasto({ ...gasto, nota: e.target.value })}
          />
        </div>

        <button
          className="guardarGastoBtn"
          onClick={guardarGasto}
          disabled={!esAdmin}
        >
          <Plus size={20} />
          {editGasto ? "Actualizar gasto" : "Guardar gasto"}
        </button>
      </section>

      <section className="gastosGrid">
        {gastos.map((g) => (
          <div key={g.id} className="gastoCard">
            <div className="gastoTop">
              <div className="gastoIcon">
                <BadgeDollarSign size={26} />
              </div>

              <span className="gastoCategoria">
                {g.categoria}
              </span>
            </div>

            <h2>RD${Number(g.monto || 0).toLocaleString()}</h2>

            <p className="gastoMoto">
              <Bike size={16} />
              {nombreMoto(g.motoId)}
            </p>

            <div className="gastoInfoGrid">
              <div>
                <small>Fecha</small>
                <strong>
                  <CalendarDays size={15} />
                  {g.fecha}
                </strong>
              </div>

              <div>
                <small>Proveedor</small>
                <strong>{g.proveedor || "Sin proveedor"}</strong>
              </div>

              <div className="full">
                <small>Nota</small>
                <strong>{g.nota || "Sin nota"}</strong>
              </div>
            </div>

            <div className="gastoActions">
              <button
                className="gastoBtn edit"
                onClick={() => editarGasto(g)}
              >
                <Pencil size={18} />
              </button>

              <button
                className="gastoBtn delete"
                onClick={() => eliminarGasto(g.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {gastos.length === 0 && (
          <div className="gastosEmpty">
            <TrendingDown size={48} />
            <h2>No hay gastos registrados</h2>
            <p>Cuando registres gastos operativos aparecerán aquí.</p>
          </div>
        )}
      </section>
    </div>
  );
}