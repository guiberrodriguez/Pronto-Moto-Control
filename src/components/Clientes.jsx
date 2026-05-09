import { useState } from "react";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  UserRound,
  MapPin,
  Plus,
} from "lucide-react";

export default function Clientes() {
  const [busqueda, setBusqueda] = useState("");

  const clientes = [
    {
      id: 1,
      nombre: "Juan Pérez",
      telefono: "809-000-0000",
      cedula: "000-0000000-0",
      direccion: "Santo Domingo",
      moto: "Honda Dio",
      estado: "Al día",
    },
    {
      id: 2,
      nombre: "Carlos Méndez",
      telefono: "829-000-0000",
      cedula: "001-0000000-0",
      direccion: "Santiago",
      moto: "Yamaha Gear",
      estado: "En mora",
    },
  ];

  const clientesFiltrados = clientes.filter((cliente) =>
    `${cliente.nombre} ${cliente.telefono} ${cliente.cedula} ${cliente.moto}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="clientesPage">

      <section className="clientesHero">
        <div>
          <span>Gestión de clientes</span>
          <h1>Clientes</h1>
          <p>Administra clientes, contratos, motos asignadas y estados de pago.</p>
        </div>

        <button className="createClientBtn">
          <Plus size={20} />
          Crear cliente
        </button>
      </section>

      <section className="clienteFormCard">
        <h2>Registrar cliente</h2>

        <div className="clienteFormGrid">
          <input placeholder="Nombre completo" />
          <input placeholder="Teléfono" />
          <input placeholder="Cédula" />
          <input placeholder="Dirección" />
          <input placeholder="Moto asignada" />
          <input placeholder="Monto del contrato" />
        </div>

        <div className="clientFormActions">
          <button className="captureLocationBtn">
            <MapPin size={20} />
            Capturar ubicación
          </button>

          <button className="createClientBtn">
            <Plus size={20} />
            Guardar cliente
          </button>
        </div>
      </section>

      <section className="clientesTablePro">
        <div className="clientesTableHeader">
          <div>
            <span>CRM de clientes</span>
            <h2>Clientes registrados</h2>
          </div>

          <div className="clientesSearchBox">
            <Search size={19} />
            <input
              placeholder="Buscar cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="clientesTableWrapper">
          <table className="clientesTable">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Cédula</th>
                <th>Dirección</th>
                <th>Moto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {clientesFiltrados.map((cliente) => (
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
                  <td>{cliente.direccion}</td>
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

              {clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="7" className="emptyClientes">
                    No se encontraron clientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}