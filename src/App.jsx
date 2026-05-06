import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword
} from "firebase/auth";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";

import { auth, db, storage } from "./firebase";
import { QRCodeCanvas } from "qrcode.react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

import {
  Menu,
  Sun,
  Moon,
  RefreshCw,
  Settings,
  Bell,
  LogOut,
  Home,
  Users,
  Bike,
  CreditCard,
  Wallet,
  AlertTriangle,
  Trophy,
  Paperclip,
  Building2,
  Search,
  MapPin,
  FileText,
  Trash2,
  Edit,
  Eye,
  Printer,
  MessageCircle,
  ShieldCheck
} from "lucide-react";

import "./style.css";

const BASE_URL = window.location.origin;

const paises = [
  "República Dominicana",
  "República de Haití",
  "Venezuela",
  "Colombia",
  "Cuba",
  "Puerto Rico",
  "Estados Unidos",
  "México",
  "España",
  "Argentina",
  "Chile",
  "Perú",
  "Ecuador",
  "Brasil",
  "Panamá",
  "Costa Rica",
  "Nicaragua",
  "Honduras",
  "El Salvador",
  "Guatemala",
  "Uruguay",
  "Paraguay",
  "Bolivia",
  "Canadá",
  "Francia",
  "Italia",
  "Alemania",
  "Reino Unido",
  "China",
  "Japón",
  "Corea del Sur"
];

const nacionalidades = [
  "Dominicana",
  "Haitiana",
  "Venezolana",
  "Colombiana",
  "Cubana",
  "Puertorriqueña",
  "Estadounidense",
  "Mexicana",
  "Española",
  "Argentina",
  "Chilena",
  "Peruana",
  "Ecuatoriana",
  "Brasileña",
  "Panameña",
  "Costarricense",
  "Nicaragüense",
  "Hondureña",
  "Salvadoreña",
  "Guatemalteca",
  "Uruguaya",
  "Paraguaya",
  "Boliviana",
  "Canadiense",
  "Francesa",
  "Italiana",
  "Alemana",
  "Británica",
  "China",
  "Japonesa",
  "Surcoreana"
];

const provinciasRD = {
  "Distrito Nacional": ["Santo Domingo de Guzmán"],
  "Santo Domingo": [
    "Santo Domingo Este",
    "Santo Domingo Norte",
    "Santo Domingo Oeste",
    "Boca Chica",
    "Los Alcarrizos",
    "Pedro Brand",
    "San Antonio de Guerra"
  ],
  "Santiago": [
    "Santiago de los Caballeros",
    "Bisonó",
    "Jánico",
    "Licey al Medio",
    "Puñal",
    "Sabana Iglesia",
    "San José de las Matas",
    "Tamboril",
    "Villa González"
  ],
  "La Vega": ["La Vega", "Constanza", "Jarabacoa", "Jima Abajo"],
  "San Cristóbal": [
    "San Cristóbal",
    "Bajos de Haina",
    "Cambita Garabitos",
    "Los Cacaos",
    "Sabana Grande de Palenque",
    "San Gregorio de Nigua",
    "Villa Altagracia",
    "Yaguate"
  ],
  "Puerto Plata": [
    "Puerto Plata",
    "Altamira",
    "Guananico",
    "Imbert",
    "Los Hidalgos",
    "Luperón",
    "Sosúa",
    "Villa Isabela",
    "Villa Montellano"
  ],
  "San Pedro de Macorís": [
    "San Pedro de Macorís",
    "Consuelo",
    "Guayacanes",
    "Quisqueya",
    "Ramón Santana",
    "San José de los Llanos"
  ],
  "La Romana": ["La Romana", "Guaymate", "Villa Hermosa"],
  "La Altagracia": ["Higüey", "San Rafael del Yuma"],
  "Duarte": [
    "San Francisco de Macorís",
    "Arenoso",
    "Castillo",
    "Eugenio María de Hostos",
    "Las Guáranas",
    "Pimentel",
    "Villa Riva"
  ],
  "Espaillat": [
    "Moca",
    "Cayetano Germosén",
    "Gaspar Hernández",
    "Jamao al Norte"
  ],
  "Peravia": ["Baní", "Nizao"],
  "Azua": [
    "Azua de Compostela",
    "Estebanía",
    "Guayabal",
    "Las Charcas",
    "Las Yayas de Viajama",
    "Padre Las Casas",
    "Peralta",
    "Pueblo Viejo",
    "Sabana Yegua",
    "Tábara Arriba"
  ],
  "Barahona": [
    "Barahona",
    "Cabral",
    "El Peñón",
    "Enriquillo",
    "Fundación",
    "Jaquimeyes",
    "La Ciénaga",
    "Las Salinas",
    "Paraíso",
    "Polo",
    "Vicente Noble"
  ],
  "San Juan": [
    "San Juan de la Maguana",
    "Bohechío",
    "El Cercado",
    "Juan de Herrera",
    "Las Matas de Farfán",
    "Vallejuelo"
  ],
  "Monseñor Nouel": ["Bonao", "Maimón", "Piedra Blanca"],
  "Monte Plata": [
    "Monte Plata",
    "Bayaguana",
    "Peralvillo",
    "Sabana Grande de Boyá",
    "Yamasá"
  ],
  "Hermanas Mirabal": ["Salcedo", "Tenares", "Villa Tapia"],
  "María Trinidad Sánchez": ["Nagua", "Cabrera", "El Factor", "Río San Juan"],
  "Samaná": ["Samaná", "Las Terrenas", "Sánchez"],
  "Hato Mayor": ["Hato Mayor del Rey", "El Valle", "Sabana de la Mar"],
  "El Seibo": ["El Seibo", "Miches"],
  "Monte Cristi": [
    "Monte Cristi",
    "Castañuela",
    "Guayubín",
    "Las Matas de Santa Cruz",
    "Pepillo Salcedo",
    "Villa Vásquez"
  ],
  "Valverde": ["Mao", "Esperanza", "Laguna Salada"],
  "Dajabón": ["Dajabón", "El Pino", "Loma de Cabrera", "Partido", "Restauración"],
  "Santiago Rodríguez": ["San Ignacio de Sabaneta", "Los Almácigos", "Monción"],
  "Elías Piña": [
    "Comendador",
    "Bánica",
    "El Llano",
    "Hondo Valle",
    "Juan Santiago",
    "Pedro Santana"
  ],
  "Independencia": [
    "Jimaní",
    "Cristóbal",
    "Duvergé",
    "La Descubierta",
    "Mella",
    "Postrer Río"
  ],
  "Bahoruco": ["Neiba", "Galván", "Los Ríos", "Tamayo", "Villa Jaragua"],
  "Pedernales": ["Pedernales", "Oviedo"],
  "Sánchez Ramírez": ["Cotuí", "Cevicos", "Fantino", "La Mata"]
};

const pasarelasPago = [
  "Efectivo",
  "Depósito",
  "Transferencia bancaria",
  "Azul",
  "CardNet",
  "PayPal",
  "Stripe",
  "Link de pago externo"
];

function money(n){
  return "RD$" + Number(n || 0).toLocaleString();
}

function today(){
  return new Date().toISOString().slice(0,10);
}

function nowDateTime(){
  return new Date().toISOString();
}

function currentYear(){
  return new Date().getFullYear();
}

function receiptId(count){
  const ym = new Date().toISOString().slice(0,7).replace("-","");
  return `${ym}-${String(count + 1).padStart(2,"0")}`;
}

function countryCode(country){
  const c = String(country || "").toLowerCase();

  if(c.includes("dominicana")) return "RD";
  if(c.includes("hait")) return "RH";
  if(c.includes("venezuela")) return "VE";
  if(c.includes("colombia")) return "CO";
  if(c.includes("cuba")) return "CU";
  if(c.includes("puerto rico")) return "PR";
  if(c.includes("estados unidos")) return "US";
  if(c.includes("méxico") || c.includes("mexico")) return "MX";
  if(c.includes("españa")) return "ES";
  if(c.includes("argentina")) return "AR";
  if(c.includes("chile")) return "CL";
  if(c.includes("perú") || c.includes("peru")) return "PE";
  if(c.includes("ecuador")) return "EC";
  if(c.includes("brasil")) return "BR";
  if(c.includes("panamá") || c.includes("panama")) return "PA";

  return String(country || "XX").slice(0,2).toUpperCase();
}

function businessDaysBetween(startDate,endDate){
  if(!startDate || !endDate) return 0;

  let start = new Date(startDate + "T00:00:00");
  let end = new Date(endDate + "T00:00:00");
  let count = 0;

  start.setDate(start.getDate() + 1);

  while(start <= end){
    if(start.getDay() !== 0) count++;
    start.setDate(start.getDate() + 1);
  }

  return count;
}

function cleanPhone(phone){
  return String(phone || "").replace(/\D/g,"");
}

function whatsappUrl(phone,text){
  return `https://wa.me/1${cleanPhone(phone)}?text=${encodeURIComponent(text)}`;
}

function getLocation(){
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation){
      reject(new Error("Este dispositivo no soporta ubicación GPS"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos=>{
        resolve({
          lat:pos.coords.latitude,
          lng:pos.coords.longitude,
          accuracy:pos.coords.accuracy,
          fecha:nowDateTime()
        });
      },
      err=>reject(err),
      {
        enableHighAccuracy:true,
        timeout:15000,
        maximumAge:0
      }
    );
  });
}

function locationMapUrl(location){
  if(!location?.lat || !location?.lng) return "";
  return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
}

function getNombreUsuario(usuarioActual,user){
  const fuente = usuarioActual?.nombre || user?.displayName || user?.email || "Usuario";
  if(fuente.includes("@")) return fuente.split("@")[0].split(".")[0];
  return fuente.split(" ")[0];
}

function IconTextButton({icon:Icon,label,onClick,className="",type="button"}){
  return (
    <button type={type} className={`iconTextBtn ${className}`} onClick={onClick}>
      {Icon && <Icon size={18}/>}
      <span>{label}</span>
    </button>
  );
}

function Login(){
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [error,setError]=useState("");

  async function login(){
    try{
      setError("");
      await signInWithEmailAndPassword(auth,email,pass);
    }catch(e){
      setError(e.message);
    }
  }

  return (
    <div className="login premiumLogin">
      <div className="loginGlow"></div>

      <div className="card loginCard premiumLoginCard">
        <div className="loginLogo">
          <img src="/logo.png" alt="Pronto Moto" onError={e=>{e.currentTarget.style.display="none"}} />
        </div>

        <p className="muted loginSubtitle">Acceso privado empresarial</p>

        {error && <div className="alert">{error}</div>}

        <input placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={pass} onChange={e=>setPass(e.target.value)} />

        <button onClick={login} className="primaryWideBtn">
          Entrar
        </button>
      </div>
    </div>
  );
}

function ValidarComprobante(){
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    async function load(){
      const id = window.location.pathname.split("/validar/")[1];
      const snap = await getDocs(collection(db,"pagos"));
      const pagos = snap.docs.map(d=>d.data());
      setData(pagos.find(p=>p.id===id) || null);
      setLoading(false);
    }

    load();
  },[]);

  if(loading){
    return (
      <div className="premiumShell">
        <div className="card">
          <h1>Validando comprobante...</h1>
        </div>
      </div>
    );
  }

  if(!data){
    return (
      <div className="premiumShell">
        <div className="card">
          <h1>Comprobante no encontrado</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="premiumShell">
      <div className="card validCard">
        <div className="loginLogo">
          <img src="/logo.png" alt="Pronto Moto" onError={e=>{e.currentTarget.style.display="none"}} />
        </div>

        <h1>Comprobante válido</h1>
        <p className="success">Validado en la nube</p>

        <table>
          <tbody>
            <tr><th>ID</th><td>{data.id}</td></tr>
            <tr><th>Fecha</th><td>{data.fecha}</td></tr>
            <tr><th>ID Cliente</th><td>{data.idCliente || data.clienteId}</td></tr>
            <tr><th>Cliente</th><td>{data.cliente}</td></tr>
            <tr><th>Moto</th><td>{data.moto}</td></tr>
            <tr><th>Cuotas pendientes</th><td>{data.cuotasPendientes || 0}</td></tr>
            <tr><th>Monto pendiente antes</th><td>{money(data.montoPendienteAntes || 0)}</td></tr>
            <tr><th>Monto pagado</th><td>{money(data.monto)}</td></tr>
            <tr><th>Monto pendiente después</th><td>{money(data.montoPendienteDespues || 0)}</td></tr>
            <tr><th>Método</th><td>{data.metodo}</td></tr>
            <tr><th>Estado pago digital</th><td>{data.estadoPagoDigital || "N/A"}</td></tr>
            <tr><th>Cobrador</th><td>{data.cobrador || ""}</td></tr>
            <tr><th>Estatus</th><td>{data.estatus || "N/A"}</td></tr>
          </tbody>
        </table>

        {data.ubicacionCobro?.lat && (
          <p>
            <a href={locationMapUrl(data.ubicacionCobro)} target="_blank" rel="noreferrer">
              Ver ubicación del cobro
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

function abrirImpresion(titulo, html, tipoPapel = "normal") {
  const printWindow = window.open("", "_blank", "width=900,height=700");

  if (!printWindow) {
    alert("El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para esta app.");
    return;
  }

  const ticketCss = tipoPapel === "termico"
    ? `
      @page { size: 80mm auto; margin: 3mm; }
      html,body{font-family:Arial,sans-serif;width:72mm;padding:0;margin:0;color:#111;background:white;font-size:11px;}
      h1{font-size:16px;text-align:center;margin:4px 0;}
      h2{font-size:13px;text-align:center;margin:4px 0;}
      p{margin:3px 0;}
      table{width:100%;border-collapse:collapse;margin-top:6px;font-size:11px;}
      td,th{border-bottom:1px dashed #999;padding:4px 0;text-align:left;}
      .centro{text-align:center;}
      img.printLogo{width:260px;max-width:100%;height:auto;display:block;margin:0 auto 6px;}
      img.qr{max-width:120px;}
      .firmas td{height:50px;}
    `
    : `
      @page { size: auto; margin: 12mm; }
      html,body{font-family:Arial,sans-serif;padding:0;margin:0;color:#333;background:white;}
      body{padding:30px;}
      h1,h2{text-align:center;}
      table{width:100%;border-collapse:collapse;margin-top:20px;}
      td,th{border:1px solid #ddd;padding:8px;text-align:left;}
      .firmas td{height:80px;}
      .centro{text-align:center;}
      img.printLogo{width:520px;max-width:100%;height:auto;display:block;margin:0 auto 12px;}
      img.qr{max-width:180px;}
    `;

  printWindow.document.open();
  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${titulo}</title>
        <style>${ticketCss}</style>
      </head>
      <body>
        ${html}
        <script>
          window.onload = function(){
            setTimeout(function(){
              window.focus();
              window.print();
            }, 600);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function Dashboard({user}){
  const [tab,setTab]=useState("inicio");
  const [menuAbierto,setMenuAbierto]=useState(false);
  const [tema,setTema]=useState(localStorage.getItem("tema") || "light");

  const [clientes,setClientes]=useState([]);
  const [motos,setMotos]=useState([]);
  const [pagos,setPagos]=useState([]);
  const [gastos,setGastos]=useState([]);
  const [adjuntos,setAdjuntos]=useState([]);
  const [usuarios,setUsuarios]=useState([]);
  const [notificaciones,setNotificaciones]=useState([]);
  const [pagosDigitales,setPagosDigitales]=useState([]);

  const [usuarioActual,setUsuarioActual]=useState(null);
  const [ultimo,setUltimo]=useState(null);
  const [clienteVista,setClienteVista]=useState(null);

  const [busquedaCliente,setBusquedaCliente]=useState("");
  const [busquedaClientePago,setBusquedaClientePago]=useState("");
  const [clientePagoId,setClientePagoId]=useState("");
  const [papelComprobante,setPapelComprobante]=useState("normal");

  const [nuevaPassword,setNuevaPassword]=useState("");

  const [usuarioForm,setUsuarioForm]=useState({
    uid:"",
    nombre:"",
    correo:"",
    rol:"cobrador"
  });

  const [empresa,setEmpresa]=useState({
    nombre:"Pronto Moto",
    telefono:"",
    direccion:"",
    rnc:"",
    notas:""
  });

  const [cliente,setCliente]=useState({
    idCliente:"",
    pais:"República Dominicana",
    nacionalidad:"Dominicana",
    provincia:"Distrito Nacional",
    municipio:"Santo Domingo de Guzmán",
    sexo:"Masculino",
    nombre:"",
    cedula:"",
    correo:"",
    telefono:"",
    telefonoResidencial:"",
    telefonoReferencia:"",
    direccion:"",
    referencia:"",
    riesgo:"Nuevo cliente",
    cobradorId:"",
    ubicacion:null
  });

  const [moto,setMoto]=useState({
    placa:"",
    marca:"",
    modelo:"",
    anio:"",
    tracker:"",
    clienteId:"",
    fechaAsignacion:today(),
    pagoDiario:"400",
    deposito:"5000"
  });

  const [pago,setPago]=useState({
    motoId:"",
    monto:"400",
    metodo:"Efectivo",
    linkPago:"",
    estadoPagoDigital:"No aplica"
  });

  const [gasto,setGasto]=useState({
    motoId:"",
    fecha:today(),
    categoria:"Reparación",
    monto:"",
    proveedor:"",
    nota:""
  });

  const [clienteAdjunto,setClienteAdjunto]=useState("");
  const [archivo,setArchivo]=useState(null);

  const [editCliente,setEditCliente]=useState(null);
  const [editMoto,setEditMoto]=useState(null);
  const [editGasto,setEditGasto]=useState(null);

  const esAdmin = !usuarioActual || usuarioActual.rol === "admin";
  const municipiosDisponibles = provinciasRD[cliente.provincia] || [];

  useEffect(()=>{
    document.body.classList.remove("darkMode","lightMode");

    if(tema === "dark"){
      document.body.classList.add("darkMode");
    }else{
      document.body.classList.add("lightMode");
    }

    localStorage.setItem("tema",tema);
  },[tema]);

  function toggleTema(){
    setTema(prev => prev === "dark" ? "light" : "dark");
  }

  async function cargar(){
    const c=await getDocs(collection(db,"clientes"));
    const m=await getDocs(collection(db,"motos"));
    const p=await getDocs(collection(db,"pagos"));
    const g=await getDocs(collection(db,"gastos"));
    const a=await getDocs(collection(db,"adjuntos"));
    const u=await getDocs(collection(db,"usuarios"));
    const n=await getDocs(collection(db,"notificaciones"));
    const pd=await getDocs(collection(db,"pagosDigitales"));

    const usuariosData=u.docs.map(d=>({id:d.id,...d.data()}));
    const perfil=usuariosData.find(x=>x.uid===user.uid || x.correo===user.email) || {
      uid:user.uid,
      nombre:user.email,
      correo:user.email,
      rol:"admin"
    };

    setUsuarioActual(perfil);
    setUsuarios(usuariosData);
    setClientes(c.docs.map(d=>({id:d.id,...d.data()})));
    setMotos(m.docs.map(d=>({id:d.id,...d.data()})));
    setPagos(p.docs.map(d=>({docId:d.id,...d.data()})));
    setGastos(g.docs.map(d=>({id:d.id,...d.data()})));
    setAdjuntos(a.docs.map(d=>({id:d.id,...d.data()})));
    setNotificaciones(n.docs.map(d=>({id:d.id,...d.data()})));
    setPagosDigitales(pd.docs.map(d=>({id:d.id,...d.data()})));
  }

  useEffect(()=>{
    cargar();
  },[]);

  const clientesVisibles = useMemo(()=>{
    if(esAdmin) return clientes;
    return clientes.filter(c=>c.cobradorId===usuarioActual?.uid || c.cobradorId===usuarioActual?.id);
  },[clientes,usuarioActual,esAdmin]);

  const motosVisibles = useMemo(()=>{
    if(esAdmin) return motos;
    const idsClientes=new Set(clientesVisibles.map(c=>c.id));
    return motos.filter(m=>idsClientes.has(m.clienteId));
  },[motos,clientesVisibles,esAdmin]);

  const pagosVisibles = useMemo(()=>{
    if(esAdmin) return pagos;
    const idsClientes=new Set(clientesVisibles.map(c=>c.id));
    return pagos.filter(p=>idsClientes.has(p.clienteId));
  },[pagos,clientesVisibles,esAdmin]);

  const totalIngresos=pagosVisibles.reduce((s,p)=>s+Number(p.monto||0),0);
  const totalGastos=esAdmin ? gastos.reduce((s,g)=>s+Number(g.monto||0),0) : 0;
  const neto=totalIngresos-totalGastos;

  function ingresosPorMoto(motoId){
    return pagos.filter(p=>p.motoId===motoId).reduce((s,p)=>s+Number(p.monto||0),0);
  }

  function gastosPorMoto(motoId){
    return gastos.filter(g=>g.motoId===motoId).reduce((s,g)=>s+Number(g.monto||0),0);
  }

  function pagosPorMoto(motoId){
    return pagos
      .filter(p=>p.motoId===motoId)
      .sort((a,b)=>String(b.fecha).localeCompare(String(a.fecha)));
  }

  function ultimoPagoMoto(motoId){
    return pagosPorMoto(motoId)[0] || null;
  }

  function atrasoMoto(m){
    if(!m.clienteId) return 0;

    const ultimo=ultimoPagoMoto(m.id);
    const fechaBase=ultimo?.fecha || m.fechaAsignacion || today();

    return businessDaysBetween(fechaBase,today());
  }

  function deudaMoto(m){
    const cuotasPendientes = atrasoMoto(m);
    const montoPendiente = cuotasPendientes * Number(m.pagoDiario || 0);

    let estatus = "Al día";
    if(cuotasPendientes >= 3) estatus = "Recuperación";
    else if(cuotasPendientes >= 2) estatus = "Riesgo alto";
    else if(cuotasPendientes >= 1) estatus = "Pendiente";

    return {
      cuotasPendientes,
      montoPendiente,
      estatus
    };
  }

  const rankingMotos=[...motosVisibles].sort((a,b)=>{
    const netoA=ingresosPorMoto(a.id)-gastosPorMoto(a.id);
    const netoB=ingresosPorMoto(b.id)-gastosPorMoto(b.id);
    return netoB-netoA;
  });

  const motosMorosas=motosVisibles.filter(m=>m.clienteId && atrasoMoto(m)>=1);

  const clientesFiltrados = useMemo(()=>{
    const q = busquedaCliente.toLowerCase().trim();

    if(!q) return clientesVisibles;

    return clientesVisibles.filter(c=>{
      const texto = [
        c.idCliente,
        c.nombre,
        c.cedula,
        c.telefono,
        c.telefonoResidencial,
        c.telefonoReferencia,
        c.correo,
        c.pais,
        c.nacionalidad,
        c.provincia,
        c.municipio,
        c.sexo
      ].join(" ").toLowerCase();

      return texto.includes(q);
    });
  },[clientesVisibles,busquedaCliente]);

  const clientesPagoFiltrados = useMemo(()=>{
    const q = busquedaClientePago.toLowerCase().trim();

    if(!q) return clientesVisibles;

    return clientesVisibles.filter(c=>{
      const texto = [
        c.idCliente,
        c.nombre,
        c.cedula,
        c.telefono,
        c.telefonoResidencial,
        c.telefonoReferencia,
        c.correo,
        c.pais,
        c.nacionalidad,
        c.provincia,
        c.municipio,
        c.sexo
      ].join(" ").toLowerCase();

      return texto.includes(q);
    });
  },[clientesVisibles,busquedaClientePago]);

  const clientePago = clientesVisibles.find(c=>c.id===clientePagoId) || null;
  const motosClientePago = motosVisibles.filter(m=>m.clienteId===clientePagoId);
  const motoPagoSeleccionada = motosVisibles.find(m=>m.id===pago.motoId) || null;
  const deudaPagoSeleccionada = motoPagoSeleccionada ? deudaMoto(motoPagoSeleccionada) : null;

  const chartFinanzas = [
    {
      name:"Finanzas",
      ingresos:totalIngresos,
      gastos:totalGastos,
      neto:neto
    }
  ];

  const chartMorosidad = [
    {
      name:"Al día",
      value:Math.max(0,motosVisibles.length - motosMorosas.length)
    },
    {
      name:"Morosas",
      value:motosMorosas.length
    }
  ];
  
    async function generarIdCliente(pais){
    const code=countryCode(pais);
    const year=currentYear();
    const prefijo=`${code}${year}`;
    const existentes=clientes.filter(c=>String(c.idCliente||"").startsWith(prefijo));
    const secuencia=String(existentes.length + 1).padStart(2,"0");
    return `${prefijo}-${secuencia}`;
  }

  async function guardarCliente(){
    if(!esAdmin) return alert("Solo el administrador puede crear o editar clientes");
    if(!cliente.nombre) return alert("El nombre del cliente es obligatorio");

    const clienteFinal = {
      ...cliente,
      municipio: cliente.municipio || (provinciasRD[cliente.provincia] || [])[0] || ""
    };

    try{
      if(editCliente){
        await updateDoc(doc(db,"clientes",editCliente),clienteFinal);
        alert("Cliente actualizado correctamente");
        setEditCliente(null);
      }else{
        const nuevoId=await generarIdCliente(cliente.pais);
        await addDoc(collection(db,"clientes"),{
          ...clienteFinal,
          idCliente:nuevoId
        });
        alert("Cliente creado correctamente");
      }

      setCliente({
        idCliente:"",
        pais:"República Dominicana",
        nacionalidad:"Dominicana",
        provincia:"Distrito Nacional",
        municipio:"Santo Domingo de Guzmán",
        sexo:"Masculino",
        nombre:"",
        cedula:"",
        correo:"",
        telefono:"",
        telefonoResidencial:"",
        telefonoReferencia:"",
        direccion:"",
        referencia:"",
        riesgo:"Nuevo cliente",
        cobradorId:"",
        ubicacion:null
      });

      cargar();
    }catch(e){
      alert("No se pudo guardar el cliente");
      console.log(e);
    }
  }

  function editarCliente(c){
    if(!esAdmin) return alert("Solo el administrador puede editar clientes");

    setCliente({
      idCliente:c.idCliente||"",
      pais:c.pais||"República Dominicana",
      nacionalidad:c.nacionalidad||"Dominicana",
      provincia:c.provincia||"Distrito Nacional",
      municipio:c.municipio||"Santo Domingo de Guzmán",
      sexo:c.sexo||"Masculino",
      nombre:c.nombre||"",
      cedula:c.cedula||"",
      correo:c.correo||"",
      telefono:c.telefono||"",
      telefonoResidencial:c.telefonoResidencial||"",
      telefonoReferencia:c.telefonoReferencia||"",
      direccion:c.direccion||"",
      referencia:c.referencia||"",
      riesgo:c.riesgo||"Nuevo cliente",
      cobradorId:c.cobradorId||"",
      ubicacion:c.ubicacion||null
    });

    setEditCliente(c.id);
    setTab("clientes");
  }

  async function eliminarCliente(id){
    if(!esAdmin) return alert("Solo el administrador puede eliminar clientes");

    const confirmar = confirm("¿Seguro que deseas eliminar este cliente? Las motos asignadas quedarán sin cliente.");
    if(!confirmar) return;

    try{
      await deleteDoc(doc(db,"clientes",id));

      for(const m of motos.filter(x=>x.clienteId===id)){
        await updateDoc(doc(db,"motos",m.id),{
          ...m,
          clienteId:"",
          estado:"Disponible"
        });
      }

      alert("Cliente eliminado correctamente");
      cargar();
    }catch(e){
      alert("No se pudo eliminar el cliente");
      console.log(e);
    }
  }

  async function capturarUbicacionCliente(){
    try{
      const ubicacion=await getLocation();
      setCliente({...cliente,ubicacion});
      alert("Ubicación capturada correctamente");
    }catch(e){
      alert("No se pudo capturar la ubicación: " + e.message);
    }
  }

  async function guardarMoto(){
    if(!esAdmin) return alert("Solo el administrador puede crear o editar motos");
    if(!moto.placa) return alert("La placa es obligatoria");

    const datos={
      ...moto,
      estado:moto.clienteId?"Alquilada":"Disponible",
      fechaAsignacion:moto.clienteId ? (moto.fechaAsignacion || today()) : ""
    };

    try{
      if(editMoto){
        await updateDoc(doc(db,"motos",editMoto),datos);
        alert("Moto actualizada correctamente");
        setEditMoto(null);
      }else{
        await addDoc(collection(db,"motos"),datos);
        alert("Moto creada correctamente");
      }

      setMoto({
        placa:"",
        marca:"",
        modelo:"",
        anio:"",
        tracker:"",
        clienteId:"",
        fechaAsignacion:today(),
        pagoDiario:"400",
        deposito:"5000"
      });

      cargar();
    }catch(e){
      alert("No se pudo guardar la moto");
      console.log(e);
    }
  }

  function editarMoto(m){
    if(!esAdmin) return alert("Solo el administrador puede editar motos");

    setMoto({
      placa:m.placa||"",
      marca:m.marca||"",
      modelo:m.modelo||"",
      anio:m.anio||"",
      tracker:m.tracker||"",
      clienteId:m.clienteId||"",
      fechaAsignacion:m.fechaAsignacion||today(),
      pagoDiario:m.pagoDiario||"400",
      deposito:m.deposito||"5000"
    });

    setEditMoto(m.id);
    setTab("motos");
  }

  async function eliminarMoto(id){
    if(!esAdmin) return alert("Solo el administrador puede eliminar motos");

    const confirmar = confirm("¿Seguro que deseas eliminar esta moto?");
    if(!confirmar) return;

    try{
      await deleteDoc(doc(db,"motos",id));
      alert("Moto eliminada correctamente");
      cargar();
    }catch(e){
      alert("No se pudo eliminar la moto");
      console.log(e);
    }
  }

  async function registrarPago(){
    const motoSeleccionada=motosVisibles.find(m=>m.id===pago.motoId);

    if(!clientePago) return alert("Selecciona un cliente");
    if(!motoSeleccionada) return alert("Selecciona una moto del cliente");

    const deuda=deudaMoto(motoSeleccionada);
    const montoPagado=Number(pago.monto || 0);
    const pendienteDespues=Math.max(0, deuda.montoPendiente - montoPagado);
    const id=receiptId(pagos.length);

    let ubicacionCobro=null;

    try{
      ubicacionCobro=await getLocation();
    }catch(e){
      ubicacionCobro=null;
    }

    const comprobante={
      id,
      fecha:today(),
      fechaHora:nowDateTime(),
      clienteId:clientePago.id,
      idCliente:clientePago.idCliente || "",
      cliente:clientePago.nombre || "",
      cedula:clientePago.cedula || "",
      telefono:clientePago.telefono || "",
      cobradorId:usuarioActual?.uid || usuarioActual?.id || "",
      cobrador:usuarioActual?.nombre || user.email || "",
      motoId:motoSeleccionada.id,
      moto:`${motoSeleccionada.placa} ${motoSeleccionada.marca||""} ${motoSeleccionada.modelo||""}`,
      cuotaDiaria:Number(motoSeleccionada.pagoDiario || 0),
      cuotasPendientes:deuda.cuotasPendientes,
      montoPendienteAntes:deuda.montoPendiente,
      monto:Number(pago.monto || 0),
      montoPendienteDespues:pendienteDespues,
      metodo:pago.metodo,
      linkPago:pago.linkPago || "",
      estadoPagoDigital:pago.estadoPagoDigital || "No aplica",
      estatus:pendienteDespues <= 0 ? "Al día" : deuda.estatus,
      ubicacionCobro,
      url:`${BASE_URL}/validar/${id}`
    };

    try{
      await addDoc(collection(db,"pagos"),comprobante);

      try{
        if(clientePago?.cobradorId){
          await addDoc(collection(db,"notificaciones"),{
            tipo:"cobrador",
            titulo:"Cobro realizado",
            mensaje:`Pago recibido de ${clientePago.nombre}`,
            usuarioId:clientePago.cobradorId,
            clienteId:clientePago.id,
            motoId:motoSeleccionada.id,
            fechaHora:nowDateTime(),
            leida:false
          });
        }

        await addDoc(collection(db,"notificaciones"),{
          tipo:"admin",
          titulo:"Nuevo ingreso",
          mensaje:`Se registró un pago de ${money(pago.monto)}`,
          clienteId:clientePago.id,
          motoId:motoSeleccionada.id,
          fechaHora:nowDateTime(),
          leida:false
        });

        if("Notification" in window && Notification.permission === "granted"){
          new Notification("Pronto Moto", {
            body:`Pago recibido de ${clientePago.nombre}`
          });
        }
      }catch(e){
        console.log("No se pudo guardar o mostrar la notificación:", e);
      }

      try{
        if(["Azul","CardNet","PayPal","Stripe","Link de pago externo"].includes(pago.metodo)){
          await addDoc(collection(db,"pagosDigitales"),{
            comprobanteId:id,
            clienteId:clientePago.id,
            cliente:clientePago.nombre || "",
            motoId:motoSeleccionada.id,
            moto:motoSeleccionada.placa || "",
            monto:Number(pago.monto || 0),
            pasarela:pago.metodo,
            linkPago:pago.linkPago || "",
            estado:pago.estadoPagoDigital || "Pendiente",
            fecha:today(),
            fechaHora:nowDateTime()
          });
        }
      }catch(e){
        console.log("No se pudo registrar el pago digital:", e);
      }

      setUltimo(comprobante);
      setPago({
        motoId:"",
        monto:"400",
        metodo:"Efectivo",
        linkPago:"",
        estadoPagoDigital:"No aplica"
      });

      alert("Pago registrado correctamente");
      cargar();
    }catch(e){
      alert("No se pudo registrar el pago");
      console.log(e);
    }
  }

  async function eliminarPago(p){
    if(!esAdmin) return alert("Solo el administrador puede eliminar pagos");

    const confirmar = confirm(`¿Seguro que deseas eliminar el pago ${p.id}?`);
    if(!confirmar) return;

    try{
      await deleteDoc(doc(db,"pagos",p.docId));
      alert("Pago eliminado correctamente");
      cargar();
    }catch(e){
      alert("No se pudo eliminar el pago");
      console.log(e);
    }
  }