import { Search, Eye, Pencil, Trash2, UserRound } from "lucide-react";

const clientes = [
  {
    id: 1,
    nombre: "Juan Pérez",
    telefono: "809-000-0000",
    cedula: "000-0000000-0",
    moto: "Honda Dio",
    estado: "Al día",
  },
  {
    id: 2,
    nombre: "Carlos Méndez",
    telefono: "829-000-0000",
    cedula: "001-0000000-0",
    moto: "Yamaha Gear",
    estado: "En mora",
  },
];

export default function ClientesTablePro() {
  return (
    <section className="clientesTablePro">
      <div className="clientesTableHeader">
        <div>
          <span>CRM de clientes</span>
          <h2>Clientes registrados</h2>
        </div>

        <div className="clientesSearchBox">
          <Search size={19} />
          <input placeholder="Buscar cliente..." />
        </div>
      </div>

      <div className="clientesTableWrapper">
        <table className="clientesTable">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Cédula</th>
              <th>Moto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>
                  <div className="clienteCell">
                    <div className="clienteAvatar">
                      <UserRound size={20} />
                    </div>

                    <strong>{cliente.nombre}</strong>
                  </div>
                </td>

                <td>{cliente.telefono}</td>
                <td>{cliente.cedula}</td>
                <td>{cliente.moto}</td>

                <td>
                  <span
                    className={
                      cliente.estado === "Al día"
                        ? "estadoBadge alDia"
                        : "estadoBadge enMora"
                    }
                  >
                    {cliente.estado}
                  </span>
                </td>

                <td>
                  <div className="clientesActions">
                    <button className="actionBtn view">
                      <Eye size={17} />
                    </button>

                    <button className="actionBtn edit">
                      <Pencil size={17} />
                    </button>

                    <button className="actionBtn delete">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}