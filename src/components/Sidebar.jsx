import {
  Home,
  Users,
  Bike,
  Wallet,
  Receipt,
  AlertTriangle,
  Trophy,
  Paperclip,
  CreditCard,
  Bell,
  ClipboardList,
  Building2,
  BarChart3,
  Activity,
  CalendarDays,
  Settings,
  X,
} from "lucide-react";

const menuAdmin = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "motos", label: "Motos", icon: Bike },
  { id: "pagos", label: "Pagos", icon: Wallet },
  { id: "gastos", label: "Gastos", icon: Receipt },
  { id: "morosidad", label: "Morosidad", icon: AlertTriangle },
  { id: "reportes", label: "Reportes", icon: BarChart3 },
  { id: "kpis", label: "KPIs", icon: Activity },
  { id: "caja", label: "Caja", icon: CalendarDays },
  { id: "ranking", label: "Ranking", icon: Trophy },
  { id: "adjuntos", label: "Adjuntos", icon: Paperclip },
  { id: "pagosDigitales", label: "Pagos digitales", icon: CreditCard },
  { id: "notificaciones", label: "Notificaciones", icon: Bell },
  { id: "auditoria", label: "Auditoría", icon: ClipboardList },
  { id: "empresa", label: "Empresa", icon: Building2 },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

const menuCobrador = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "pagos", label: "Pagos", icon: Wallet },
  { id: "morosidad", label: "Morosidad", icon: AlertTriangle },
  { id: "notificaciones", label: "Notificaciones", icon: Bell },
];

export default function Sidebar({
  tab,
  setTab,
  esAdmin,
  menuAbierto,
  setMenuAbierto,
}) {
  const items = esAdmin ? menuAdmin : menuCobrador;

  function seleccionar(id) {
    setTab(id);
    setMenuAbierto(false);
  }

  return (
    <>
      <aside className="sidebarPro">
        <div className="sidebarBrand">
          <img src="/logo.png" alt="Pronto Moto" />
        </div>

        <SidebarContenido
          items={items}
          tab={tab}
          seleccionar={seleccionar}
        />
      </aside>

      {menuAbierto && (
        <>
          <div
            className="mobileMenuOverlay"
            onClick={() => setMenuAbierto(false)}
          />

          <aside className="mobileSidebar">
            <div className="mobileSidebarTop">
              <img src="/logo.png" alt="Pronto Moto" />

              <button
                className="mobileCloseBtn"
                onClick={() => setMenuAbierto(false)}
              >
                <X size={26} />
              </button>
            </div>

            <SidebarContenido
              items={items}
              tab={tab}
              seleccionar={seleccionar}
            />
          </aside>
        </>
      )}
    </>
  );
}

function SidebarContenido({ items, tab, seleccionar }) {
  return (
    <nav className="sidebarMenu">
      {items.map((item) => {
        const Icon = item.icon;
        const active = tab === item.id;

        return (
          <button
            key={item.id}
            className={`sidebarItem ${active ? "active" : ""}`}
            onClick={() => seleccionar(item.id)}
          >
            <Icon size={19} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function MobileTabs() {
  return null;
}

/* FIX SIDEBAR DESKTOP CONTRASTE + LOGO */

.sidebarPro {
  padding-top: 24px !important;
}

.sidebarBrand {
  display: block !important;
  padding: 10px 14px 24px !important;
  margin-bottom: 18px !important;
  border-bottom: 1px solid rgba(255,255,255,.08) !important;
}

.sidebarBrand img {
  display: block !important;
  width: 170px !important;
  height: auto !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.sidebarItem {
  color: #e5e7eb !important;
  opacity: 1 !important;
}

.sidebarItem span {
  color: inherit !important;
  opacity: 1 !important;
}

.sidebarItem svg {
  color: #ff6b00 !important;
  opacity: 1 !important;
}

.sidebarItem.active {
  color: #ffffff !important;
}

.sidebarItem.active svg {
  color: #ffffff !important;
}

/* FIX MENÚ MÓVIL: LOGO + TEXTO VISIBLE */

.mobileSidebar .mobileSidebarTop{
  display:flex !important;
  justify-content:space-between !important;
  align-items:center !important;
  margin-bottom:28px !important;
}

.mobileSidebar .mobileSidebarTop img{
  display:block !important;
  width:170px !important;
  height:auto !important;
  opacity:1 !important;
  visibility:visible !important;
}

.mobileSidebar .sidebarMenu{
  gap:12px !important;
}

.mobileSidebar .sidebarItem{
  color:#e5e7eb !important;
  opacity:1 !important;
}

.mobileSidebar .sidebarItem span{
  color:#e5e7eb !important;
  opacity:1 !important;
  font-weight:900 !important;
}

.mobileSidebar .sidebarItem svg{
  color:#ff6b00 !important;
  opacity:1 !important;
}

.mobileSidebar .sidebarItem.active{
  color:#ffffff !important;
}

.mobileSidebar .sidebarItem.active span,
.mobileSidebar .sidebarItem.active svg{
  color:#ffffff !important;
}

/* evita que modo claro oscurezca el menú móvil */
.lightMode .mobileSidebar .sidebarItem,
.lightMode .mobileSidebar .sidebarItem span{
  color:#e5e7eb !important;
}

.lightMode .mobileSidebar .sidebarItem svg{
  color:#ff6b00 !important;
}

.lightMode .mobileSidebar .sidebarItem.active span,
.lightMode .mobileSidebar .sidebarItem.active svg{
  color:#ffffff !important;
}