import {
  Menu,
  RefreshCcw,
  Sun,
  Moon,
  LogOut,
  Building2,
  UserRound,
} from "lucide-react";

import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function TopBar({
  user,
  usuarioActual,
  tema,
  toggleTema,
  cargar,
  setTab,
  menuAbierto,
  setMenuAbierto,
  esAdmin,
}) {
  async function salir() {
    await signOut(auth);
  }

  return (
    <header className="topBarPro">
      <div className="topBarBrand">
        <img src="/logo.png" alt="Pronto Moto" />

        <div>
          <span>Panel empresarial</span>
          <h1>Hola Guiber!</h1>
        </div>
      </div>

      <div className="topBarActions">
        {esAdmin && (
          <button
            className="topIconBtn"
            onClick={() => setTab("empresa")}
            title="Empresa"
          >
            <Building2 size={20} />
          </button>
        )}

        <button
          className="topIconBtn"
          onClick={cargar}
          title="Actualizar"
        >
          <RefreshCcw size={20} />
        </button>

        <button
          className="topIconBtn"
          onClick={toggleTema}
          title="Cambiar tema"
        >
          {tema === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="topUserBox">
          <UserRound size={18} />

          <div>
            <strong>
              {usuarioActual?.nombre || user?.email || "Usuario"}
            </strong>

            <small>
              {usuarioActual?.rol || "admin"}
            </small>
          </div>
        </div>

        <button
          className="topLogoutBtn"
          onClick={salir}
          title="Salir"
        >
          <LogOut size={20} />
        </button>

        <button
          className="topMenuBtn"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <Menu size={28} />
        </button>
      </div>
    </header>
  );
}