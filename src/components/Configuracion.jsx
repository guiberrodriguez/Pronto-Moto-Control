import {
  ShieldCheck,
  KeyRound,
  UserPlus,
  Users,
  Mail,
  BadgeCheck,
  Lock,
  Save,
} from "lucide-react";

export default function Configuracion({
  esAdmin,
  nuevaPassword,
  setNuevaPassword,
  cambiarPassword,
  usuarioForm,
  setUsuarioForm,
  guardarUsuario,
  usuarios,
}) {
  return (
    <div className="configPage">
      <section className="configHero">
        <div>
          <span>Seguridad empresarial</span>
          <h1>Configuración</h1>
          <p>
            Gestiona usuarios, roles, accesos y seguridad de la plataforma.
          </p>
        </div>

        <div className="configHeroIcon">
          <ShieldCheck size={42} />
        </div>
      </section>

      <section className="configGrid">
        <div className="configCard">
          <div className="configCardHeader">
            <KeyRound size={26} />
            <h2>Cambiar contraseña</h2>
          </div>

          <p>
            Actualiza la contraseña del usuario actualmente autenticado.
          </p>

          <div className="configInputBox">
            <Lock size={18} />

            <input
              type="password"
              placeholder="Nueva contraseña"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
            />
          </div>

          <button className="configPrimaryBtn" onClick={cambiarPassword}>
            <Save size={18} />
            Actualizar contraseña
          </button>
        </div>

        {esAdmin && (
          <div className="configCard">
            <div className="configCardHeader">
              <UserPlus size={26} />
              <h2>Crear / editar usuario</h2>
            </div>

            <p>
              Registra usuarios autorizados creados previamente en Firebase Authentication.
            </p>

            <div className="configFormGrid">
              <input
                placeholder="UID del usuario"
                value={usuarioForm.uid}
                onChange={(e) =>
                  setUsuarioForm({ ...usuarioForm, uid: e.target.value })
                }
              />

              <input
                placeholder="Nombre"
                value={usuarioForm.nombre}
                onChange={(e) =>
                  setUsuarioForm({ ...usuarioForm, nombre: e.target.value })
                }
              />

              <input
                placeholder="Correo"
                value={usuarioForm.correo}
                onChange={(e) =>
                  setUsuarioForm({ ...usuarioForm, correo: e.target.value })
                }
              />

              <select
                value={usuarioForm.rol}
                onChange={(e) =>
                  setUsuarioForm({ ...usuarioForm, rol: e.target.value })
                }
              >
                <option value="admin">Administrador</option>
                <option value="cobrador">Cobrador</option>
              </select>
            </div>

            <button className="configPrimaryBtn" onClick={guardarUsuario}>
              <Save size={18} />
              Guardar usuario
            </button>
          </div>
        )}
      </section>

      <section className="usuariosPanel">
        <div className="usuariosPanelHeader">
          <div>
            <span>Usuarios registrados</span>
            <h2>Equipo operativo</h2>
          </div>

          <Users size={32} />
        </div>

        <div className="usuariosGrid">
          {usuarios.map((u) => (
            <div key={u.id || u.uid || u.correo} className="usuarioCard">
              <div className="usuarioAvatar">
                <Users size={24} />
              </div>

              <div className="usuarioInfo">
                <h3>{u.nombre || "Usuario sin nombre"}</h3>

                <p>
                  <Mail size={15} />
                  {u.correo || "Sin correo"}
                </p>

                <span
                  className={
                    u.rol === "admin"
                      ? "rolBadge admin"
                      : "rolBadge cobrador"
                  }
                >
                  <BadgeCheck size={14} />
                  {u.rol === "admin" ? "Administrador" : "Cobrador"}
                </span>
              </div>
            </div>
          ))}

          {usuarios.length === 0 && (
            <div className="usuariosEmpty">
              <Users size={46} />
              <h2>No hay usuarios registrados</h2>
              <p>
                Los usuarios aparecerán aquí cuando los guardes en Firebase.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}