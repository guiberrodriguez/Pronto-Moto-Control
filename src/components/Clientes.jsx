import { useState } from "react";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  UserRound,
  MapPin,
  Plus,
  X,
  Phone,
  Mail,
  Bike,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";

const clientesIniciales = [
  {
    id: 1,
    codigo: "RD2026-01",
    nombre: "Guiber Rodriguez",
    telefono: "8297888181",
    telefono2: "22500656578",
    email: "guiber.rodriguez@gmail.com",
    cedula: "000-0000000-0",
    nacionalidad: "República Dominicana",
    provincia: "La Altagracia",
    ciudad: "Higüey",
    genero: "Masculino",
    direccion: "La Altagracia · Higüey",
    moto: "ZH1022 Yamaha Crux",
    cobrador: "Sin asignar",
    estado: "En mora",
    contrato: "RD$ 1,800",
    cuotas: "2 cuotas",
  },
];

export default function Clientes() {
  const [busqueda, setBusqueda] = useState("");
  const [clientes, setClientes] = useState(clientesIniciales);
  const [clienteActivo, setClienteActivo] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    cedula: "",
    direccion: "",
    moto: "",
    contrato: "",
  });

  const clientesFiltrados = clientes.filter((cliente) =>
    `${cliente.nombre} ${cliente.telefono} ${cliente.cedula} ${cliente.moto} ${cliente.estado}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const crearCliente = () => {
    if (!form.nombre.trim()) return;

    const nuevoCliente = {
      id: Date.now(),
      codigo: `RD2026-${clientes.length + 1}`,
      nombre: form.nombre,
      telefono: form.telefono || "Sin teléfono",
      telefono2: "",
      email: "",
      cedula: form.cedula || "Sin cédula",
      nacionalidad: "República Dominicana",
      provincia: "",
      ciudad: "",
      genero: "",
      direccion: form.direccion || "Sin dirección",
      moto: form.moto || "Sin moto",
      cobrador: "Sin asignar",
      estado: "Al día",
      contrato: form.contrato || "Sin contrato",
      cuotas: "0 cuotas",
    };

    setClientes([nuevoCliente, ...clientes]);

    setForm({
      nombre: "",
      telefono: "",
      cedula: "",
      direccion: "",
      moto: "",
      contrato: "",
    });
  };

  const eliminarCliente = (id) => {
    setClientes(clientes.filter((cliente) => cliente.id !== id));
  };

  return (
    <div className="clientesPage">
      <section className="clientesHero">
        <div>
          <span>Gestión de clientes</span>
          <h1>Clientes</h1>
          <p>Administra clientes, contratos, motos asignadas y estados de pago.</p>
        </div>

        <button className="createClientBtn" onClick={crearCliente}>
          <Plus size={20} />
          Crear cliente
        </button>
      </section>

      <section className="clienteFormCard">
        <h2>Registrar cliente</h2>

        <div className="clienteFormGrid">
          <input
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <input
            placeholder="Teléfono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />

          <input
            placeholder="Cédula"
            value={form.cedula}
            onChange={(e) => setForm({ ...form, cedula: e.target.value })}
          />

          <input
            placeholder="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />

          <input
            placeholder="Moto asignada"
            value={form.moto}
            onChange={(e) => setForm({ ...form, moto: e.target.value })}
          />

          <input
            placeholder="Monto del contrato"
            value={form.contrato}
            onChange={(e) => setForm({ ...form, contrato: e.target.value })}
          />
        </div>

        <div className="clientFormActions">
          <button className="captureLocationBtn">
            <MapPin size={20} />
            Capturar ubicación
          </button>

          <button className="createClientBtn" onClick={crearCliente}>
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
                      <button
                        className="actionBtn view"
                        onClick={() => setClienteActivo(cliente)}
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        className="actionBtn edit"
                        onClick={() => setClienteActivo(cliente)}
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        className="actionBtn delete"
                        onClick={() => eliminarCliente(cliente.id)}
                      >
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

      {clienteActivo && (
        <ClientePerfil
          cliente={clienteActivo}
          onClose={() => setClienteActivo(null)}
        />
      )}
    </div>
  );
}

export function ClientePerfil({ cliente, onClose }) {
  if (!cliente) {
    return (
      <div className="clienteModalOverlay">
        <div className="clienteModal">
          <button className="closeModalBtn" onClick={onClose}>
            <X size={22} />
          </button>
          <h2 style={{ color: "white" }}>Cliente no encontrado</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="clienteModalOverlay">
      <div className="clienteModal">
        <button className="closeModalBtn" onClick={onClose}>
          <X size={22} />
        </button>

        <div className="modalHeader">
          <div className="modalAvatar">
            <UserRound size={32} />
          </div>

          <div>
            <span>Perfil del cliente</span>
            <h2>{cliente.nombre}</h2>
          </div>
        </div>

        <div className="modalGrid">
          <div className="modalInfoCard">
            <small>Código</small>
            <strong>{cliente.codigo}</strong>
          </div>

          <div className="modalInfoCard">
            <small>Teléfono</small>
            <strong>
              <Phone size={16} /> {cliente.telefono}
            </strong>
          </div>

          <div className="modalInfoCard">
            <small>Email</small>
            <strong>
              <Mail size={16} /> {cliente.email || "Sin email"}
            </strong>
          </div>

          <div className="modalInfoCard">
            <small>Cédula</small>
            <strong>{cliente.cedula}</strong>
          </div>

          <div className="modalInfoCard">
            <small>Dirección</small>
            <strong>{cliente.direccion}</strong>
          </div>

          <div className="modalInfoCard">
            <small>Moto asignada</small>
            <strong>
              <Bike size={16} /> {cliente.moto}
            </strong>
          </div>

          <div className="modalInfoCard">
            <small>Cobrador</small>
            <strong>{cliente.cobrador}</strong>
          </div>

          <div className="modalInfoCard">
            <small>Contrato</small>
            <strong>{cliente.contrato}</strong>
          </div>

          <div className="modalInfoCard">
            <small>Cuotas pendientes</small>
            <strong>{cliente.cuotas}</strong>
          </div>

          <div className="modalInfoCard">
            <small>Estado</small>
            <span
              className={
                cliente.estado === "Al día"
                  ? "estadoBadge alDia"
                  : "estadoBadge enMora"
              }
            >
              {cliente.estado === "Al día" ? (
                <BadgeCheck size={15} />
              ) : (
                <AlertTriangle size={15} />
              )}
              {cliente.estado}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}