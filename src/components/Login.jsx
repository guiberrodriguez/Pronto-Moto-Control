import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  Lock,
  Mail,
  ShieldCheck,
  Bike,
  Eye,
  EyeOff,
} from "lucide-react";

import { auth } from "../firebase";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function entrar(e) {
    e.preventDefault();

    if (!correo || !password) {
      return alert("Completa correo y contraseña");
    }

    try {
      setCargando(true);
      await signInWithEmailAndPassword(auth, correo, password);
    } catch (error) {
      alert("No se pudo iniciar sesión. Revisa tus credenciales.");
      console.log(error);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="loginProPage">
      <section className="loginBrandPanel">
        <div className="loginLogoCircle">
          <Bike size={42} />
        </div>

        <span>Plataforma empresarial</span>

        <h1>
          Pronto<span>Moto</span>
        </h1>

        <p>
          Control de motos, clientes, pagos, morosidad, contratos,
          reportes y operación financiera en tiempo real.
        </p>

        <div className="loginFeatureGrid">
          <div>
            <ShieldCheck size={22} />
            <strong>Seguridad</strong>
            <small>Firebase Auth</small>
          </div>

          <div>
            <Bike size={22} />
            <strong>Flota</strong>
            <small>Control operativo</small>
          </div>

          <div>
            <Lock size={22} />
            <strong>Acceso</strong>
            <small>Roles protegidos</small>
          </div>
        </div>
      </section>

      <section className="loginFormPanel">
        <div className="loginFormCard">
          <div className="loginFormHeader">
            <span>Acceso seguro</span>
            <h2>Iniciar sesión</h2>
            <p>Ingresa tus credenciales para acceder al panel.</p>
          </div>

          <form onSubmit={entrar}>
            <label>Correo electrónico</label>

            <div className="loginInputBox">
              <Mail size={18} />

              <input
                type="email"
                placeholder="correo@empresa.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            <label>Contraseña</label>

            <div className="loginInputBox">
              <Lock size={18} />

              <input
                type={verPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="showPasswordBtn"
                onClick={() => setVerPassword(!verPassword)}
              >
                {verPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button className="loginSubmitBtn" disabled={cargando}>
              {cargando ? "Entrando..." : "Entrar al sistema"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}