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
  { id:"inicio", label:"Inicio", icon:Home },
  { id:"clientes", label:"Clientes", icon:Users },
  { id:"motos", label:"Motos", icon:Bike },
  { id:"pagos", label:"Pagos", icon:Wallet },
  { id:"gastos", label:"Gastos", icon:Receipt },
  { id:"morosidad", label:"Morosidad", icon:AlertTriangle },
  { id:"reportes", label:"Reportes", icon:BarChart3 },
  { id:"kpis", label:"KPIs", icon:Activity },
  { id:"caja", label:"Caja", icon:CalendarDays },
  { id:"ranking", label:"Ranking", icon:Trophy },
  { id:"adjuntos", label:"Adjuntos", icon:Paperclip },
  { id:"pagosDigitales", label:"Pagos digitales", icon:CreditCard },
  { id:"notificaciones", label:"Notificaciones", icon:Bell },
  { id:"auditoria", label:"Auditoría", icon:ClipboardList },
  { id:"empresa", label:"Empresa", icon:Building2 },
  { id:"configuracion", label:"Configuración", icon:Settings },
];

const menuCobrador = [
  { id:"inicio", label:"Inicio", icon:Home },
  { id:"clientes", label:"Clientes", icon:Users },
  { id:"pagos", label:"Pagos", icon:Wallet },
  { id:"morosidad", label:"Morosidad", icon:AlertTriangle },
  { id:"notificaciones", label:"Notificaciones", icon:Bell },
];

export default function Sidebar({
  tab,
  setTab,
  esAdmin,
  menuAbierto,
  setMenuAbierto,
}) {

  const items = esAdmin ? menuAdmin : menuCobrador;

  function seleccionar(id){
    setTab(id);
    setMenuAbierto(false);
  }

  return (
    <>
      <aside className="sidebarPro">
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
            onClick={()=>setMenuAbierto(false)}
          />

          <aside className="mobileSidebar">
            <div className="mobileSidebarTop">

              <button
                className="mobileCloseBtn"
                onClick={()=>setMenuAbierto(false)}
              >
                <X size={26}/>
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

function SidebarContenido({
  items,
  tab,
  seleccionar,
}) {
  return (
    <>

      <nav className="sidebarMenu">
        {items.map((item)=>{
          const Icon=item.icon;
          const active=tab===item.id;

          return (
            <button
              key={item.id}
              className={`sidebarItem ${active ? "active" : ""}`}
              onClick={()=>seleccionar(item.id)}
            >
              <Icon size={19}/>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

export function MobileTabs(){
  return null;
}