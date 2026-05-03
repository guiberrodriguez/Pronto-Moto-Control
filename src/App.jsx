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
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage } from "./firebase";
import { QRCodeCanvas } from "qrcode.react";
import "./style.css";

const BASE_URL = window.location.origin;

const paises = [
  "República Dominicana","República de Haití","Venezuela","Colombia","Cuba","Puerto Rico",
  "Estados Unidos","México","España","Argentina","Chile","Perú","Ecuador","Brasil","Panamá",
  "Costa Rica","Nicaragua","Honduras","El Salvador","Guatemala","Uruguay","Paraguay","Bolivia",
  "Canadá","Francia","Italia","Alemania","Reino Unido","China","Japón","Corea del Sur"
];

const nacionalidades = [
  "Dominicana","Haitiana","Venezolana","Colombiana","Cubana","Puertorriqueña",
  "Estadounidense","Mexicana","Española","Argentina","Chilena","Peruana","Ecuatoriana",
  "Brasileña","Panameña","Costarricense","Nicaragüense","Hondureña","Salvadoreña",
  "Guatemalteca","Uruguaya","Paraguaya","Boliviana","Canadiense","Francesa","Italiana",
  "Alemana","Británica","China","Japonesa","Surcoreana"
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
  "Espaillat": ["Moca", "Cayetano Germosén", "Gaspar Hernández", "Jamao al Norte"],
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

function money(n){
  return "RD$" + Number(n || 0).toLocaleString();
}

function today(){
  return new Date().toISOString().slice(0,10);
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
    <div className="login">
      <div className="card loginCard">
        <div className="logoBox bigLogo">
          <img src="/logo.png" alt="Pronto Moto" onError={e=>{e.currentTarget.style.display="none"}} />
        </div>

        <h1>Pronto Moto Control</h1>
        <p className="muted">Acceso privado</p>

        {error && <div className="alert">{error}</div>}

        <input placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={pass} onChange={e=>setPass(e.target.value)} />

        <button onClick={login}>Entrar</button>
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
    return <div className="app"><div className="card"><h1>Validando comprobante...</h1></div></div>;
  }

  if(!data){
    return <div className="app"><div className="card"><h1>Comprobante no encontrado</h1></div></div>;
  }

  return (
    <div className="app">
      <div className="card validCard">
        <div className="logoBox bigLogo">
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
            <tr><th>Estatus</th><td>{data.estatus || "N/A"}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function abrirImpresion(titulo,html,tipoPapel="normal"){
  const anterior=document.getElementById("print-frame");
  if(anterior) anterior.remove();

  const iframe=document.createElement("iframe");
  iframe.id="print-frame";
  iframe.style.position="fixed";
  iframe.style.right="0";
  iframe.style.bottom="0";
  iframe.style.width="0";
  iframe.style.height="0";
  iframe.style.border="0";
  document.body.appendChild(iframe);

  const ticketCss = tipoPapel === "termico"
    ? `
      @page { size: 80mm auto; margin: 3mm; }
      body{font-family:Arial,sans-serif;width:72mm;padding:0;margin:0;color:#111;background:white;font-size:11px;}
      h1{font-size:16px;text-align:center;margin:4px 0;}
      h2{font-size:13px;text-align:center;margin:4px 0;}
      p{margin:3px 0;}
      table{width:100%;border-collapse:collapse;margin-top:6px;font-size:11px;}
      td,th{border-bottom:1px dashed #999;padding:4px 0;text-align:left;}
      .centro{text-align:center;}
      img{max-width:120px;}
      .firmas td{height:50px;}
    `
    : `
      @page { size: auto; margin: 12mm; }
      body{font-family:Arial,sans-serif;padding:30px;color:#333;background:white;}
      h1,h2{text-align:center;}
      table{width:100%;border-collapse:collapse;margin-top:20px;}
      td,th{border:1px solid #ddd;padding:8px;text-align:left;}
      .firmas td{height:80px;}
      .centro{text-align:center;}
      img{max-width:180px;}
    `;

  const documento=iframe.contentWindow.document;
  documento.open();
  documento.write(`
    <html>
      <head>
        <title>${titulo}</title>
        <style>${ticketCss}</style>
      </head>
      <body>${html}</body>
    </html>
  `);
  documento.close();

  setTimeout(()=>{
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  },700);
}

function Dashboard({user}){
  const [tab,setTab]=useState("inicio");

  const [clientes,setClientes]=useState([]);
  const [motos,setMotos]=useState([]);
  const [pagos,setPagos]=useState([]);
  const [gastos,setGastos]=useState([]);
  const [adjuntos,setAdjuntos]=useState([]);
  const [usuarios,setUsuarios]=useState([]);

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
    cobradorId:""
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
    metodo:"Efectivo"
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

  async function cargar(){
    const c=await getDocs(collection(db,"clientes"));
    const m=await getDocs(collection(db,"motos"));
    const p=await getDocs(collection(db,"pagos"));
    const g=await getDocs(collection(db,"gastos"));
    const a=await getDocs(collection(db,"adjuntos"));
    const u=await getDocs(collection(db,"usuarios"));

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
  }

  useEffect(()=>{ cargar(); },[]);

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
  const totalGastos=gastos.reduce((s,g)=>s+Number(g.monto||0),0);
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

    if(editCliente){
      await updateDoc(doc(db,"clientes",editCliente),clienteFinal);
      setEditCliente(null);
    }else{
      const nuevoId=await generarIdCliente(cliente.pais);
      await addDoc(collection(db,"clientes"),{
        ...clienteFinal,
        idCliente:nuevoId
      });
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
      cobradorId:""
    });

    cargar();
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
      cobradorId:c.cobradorId||""
    });

    setEditCliente(c.id);
    setTab("clientes");
  }

  async function eliminarCliente(id){
    if(!esAdmin) return alert("Solo el administrador puede eliminar clientes");

    if(confirm("¿Eliminar este cliente? Las motos asignadas quedarán sin cliente.")){
      await deleteDoc(doc(db,"clientes",id));

      for(const m of motos.filter(x=>x.clienteId===id)){
        await updateDoc(doc(db,"motos",m.id),{
          ...m,
          clienteId:"",
          estado:"Disponible"
        });
      }

      cargar();
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

    if(editMoto){
      await updateDoc(doc(db,"motos",editMoto),datos);
      setEditMoto(null);
    }else{
      await addDoc(collection(db,"motos"),datos);
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

    if(confirm("¿Eliminar esta moto?")){
      await deleteDoc(doc(db,"motos",id));
      cargar();
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

    const comprobante={
      id,
      fecha:today(),
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
      estatus:pendienteDespues <= 0 ? "Al día" : deuda.estatus,
      url:`${BASE_URL}/validar/${id}`
    };

    await addDoc(collection(db,"pagos"),comprobante);
    setUltimo(comprobante);
    setPago({motoId:"",monto:"400",metodo:"Efectivo"});
    cargar();
  }

  async function guardarGasto(){
    if(!esAdmin) return alert("Solo el administrador puede registrar gastos");
    if(!gasto.motoId) return alert("Selecciona una moto");
    if(!gasto.monto) return alert("El monto es obligatorio");

    if(editGasto){
      await updateDoc(doc(db,"gastos",editGasto),gasto);
      setEditGasto(null);
    }else{
      await addDoc(collection(db,"gastos"),gasto);
    }

    setGasto({
      motoId:"",
      fecha:today(),
      categoria:"Reparación",
      monto:"",
      proveedor:"",
      nota:""
    });

    cargar();
  }

  function editarGasto(g){
    if(!esAdmin) return alert("Solo el administrador puede editar gastos");

    setGasto({
      motoId:g.motoId||"",
      fecha:g.fecha||today(),
      categoria:g.categoria||"Reparación",
      monto:g.monto||"",
      proveedor:g.proveedor||"",
      nota:g.nota||""
    });

    setEditGasto(g.id);
    setTab("gastos");
  }

  async function eliminarGasto(id){
    if(!esAdmin) return alert("Solo el administrador puede eliminar gastos");

    if(confirm("¿Eliminar este gasto?")){
      await deleteDoc(doc(db,"gastos",id));
      cargar();
    }
  }

  async function subirAdjunto(){
    if(!esAdmin) return alert("Solo el administrador puede subir adjuntos");
    if(!clienteAdjunto) return alert("Selecciona un cliente");
    if(!archivo) return alert("Selecciona un archivo");

    const ruta=`clientes/${clienteAdjunto}/${Date.now()}-${archivo.name}`;
    const archivoRef=ref(storage,ruta);

    await uploadBytes(archivoRef,archivo);
    const url=await getDownloadURL(archivoRef);

    await addDoc(collection(db,"adjuntos"),{
      clienteId:clienteAdjunto,
      nombre:archivo.name,
      tipo:archivo.type,
      ruta,
      url,
      fecha:today()
    });

    setArchivo(null);
    setClienteAdjunto("");
    cargar();
  }

  async function eliminarAdjunto(a){
    if(!esAdmin) return alert("Solo el administrador puede eliminar adjuntos");

    if(confirm("¿Eliminar este adjunto?")){
      await deleteObject(ref(storage,a.ruta));
      await deleteDoc(doc(db,"adjuntos",a.id));
      cargar();
    }
  }

  async function guardarUsuario(){
    if(!esAdmin) return alert("Solo el administrador puede gestionar usuarios");
    if(!usuarioForm.uid || !usuarioForm.correo) return alert("Debes colocar UID y correo del usuario creado en Firebase Authentication");

    await setDoc(doc(db,"usuarios",usuarioForm.uid),usuarioForm);

    setUsuarioForm({
      uid:"",
      nombre:"",
      correo:"",
      rol:"cobrador"
    });

    cargar();
  }

  async function cambiarPassword(){
    if(!nuevaPassword || nuevaPassword.length < 6){
      return alert("La contraseña debe tener al menos 6 caracteres");
    }

    await updatePassword(auth.currentUser,nuevaPassword);
    setNuevaPassword("");
    alert("Contraseña actualizada");
  }

  function mensajeWhatsAppPago(p){
    return `Hola ${p.cliente || ""}, su pago ha sido registrado correctamente.\n\nID: ${p.id}\nMoto: ${p.moto}\nMonto pagado: ${money(p.monto)}\nPendiente: ${money(p.montoPendienteDespues || 0)}\nComprobante: ${p.url}`;
  }

  function mensajeWhatsAppMora(m){
    const c=clientes.find(x=>x.id===m.clienteId);
    const d=deudaMoto(m);

    return `Hola ${c?.nombre || ""}, tienes ${d.cuotasPendientes} cuota(s) pendiente(s) de pago de la motocicleta ${m.placa}. Deuda estimada: ${money(d.montoPendiente)}. Favor regularizar.`;
  }

  function imprimirContrato(m){
    const c=clientes.find(x=>x.id===m.clienteId);
    if(!c) return alert("Esta moto no tiene cliente asignado");

    const html=`
      <h1>${empresa.nombre}</h1>
      <p class="centro">${empresa.telefono} · ${empresa.direccion}</p>
      <h2>CONTRATO DE ALQUILER DE MOTOCICLETA</h2>
      <p><b>Fecha:</b> ${today()}</p>
      <p><b>Arrendador:</b> ${empresa.nombre} · RNC/Cédula: ${empresa.rnc||"N/A"}</p>
      <p><b>Arrendatario:</b> ${c.nombre} · ID Cliente: ${c.idCliente || c.id} · Cédula: ${c.cedula} · Teléfono: ${c.telefono}</p>
      <p><b>Sexo:</b> ${c.sexo || ""} · <b>Correo:</b> ${c.correo || ""}</p>
      <p><b>País:</b> ${c.pais || ""} · <b>Nacionalidad:</b> ${c.nacionalidad || ""}</p>
      <p><b>Provincia:</b> ${c.provincia || ""} · <b>Municipio:</b> ${c.municipio || ""}</p>
      <p><b>Dirección:</b> ${c.direccion}</p>

      <table>
        <tr>
          <th>Placa</th>
          <th>Marca</th>
          <th>Modelo</th>
          <th>Año</th>
          <th>GPS / Tracker</th>
          <th>Pago diario</th>
          <th>Depósito</th>
        </tr>
        <tr>
          <td>${m.placa}</td>
          <td>${m.marca}</td>
          <td>${m.modelo}</td>
          <td>${m.anio}</td>
          <td>${m.tracker||"N/A"}</td>
          <td>${money(m.pagoDiario)}</td>
          <td>${money(m.deposito)}</td>
        </tr>
      </table>

      <h3>Condiciones principales</h3>
      <ol>
        <li>El pago es diario, exceptuando los domingos.</li>
        <li>Al acumular tres cuotas vencidas, el contrato podrá ser cancelado.</li>
        <li>El arrendador podrá recuperar la motocicleta por las vías legales correspondientes.</li>
        <li>El arrendatario asume multas, accidentes, daños, uso indebido y cualquier responsabilidad derivada del uso de la motocicleta.</li>
        <li>Queda prohibido prestar, ceder, subarrendar o usar la motocicleta en actividades ilícitas.</li>
      </ol>

      <p>${empresa.notas||""}</p>

      <br/><br/>
      <table class="firmas">
        <tr>
          <td>Firma Arrendador</td>
          <td>Firma Arrendatario</td>
        </tr>
        <tr>
          <td></td>
          <td></td>
        </tr>
      </table>
    `;

    abrirImpresion("Contrato "+m.placa,html,"normal");
  }
  
    function comprobanteHtml(p,tipo="normal"){
    if(tipo==="termico"){
      return `
        <h1>${empresa.nombre}</h1>
        <p class="centro">${empresa.telefono}</p>
        <p class="centro">${empresa.direccion}</p>
        <h2>COMPROBANTE</h2>

        <p><b>ID:</b> ${p.id}</p>
        <p><b>Fecha:</b> ${p.fecha}</p>
        <p><b>ID Cliente:</b> ${p.idCliente || p.clienteId}</p>
        <p><b>Cliente:</b> ${p.cliente}</p>
        <p><b>Moto:</b> ${p.moto}</p>
        <p><b>Cuota diaria:</b> ${money(p.cuotaDiaria)}</p>
        <p><b>Cuotas pend.:</b> ${p.cuotasPendientes || 0}</p>
        <p><b>Pendiente antes:</b> ${money(p.montoPendienteAntes || 0)}</p>
        <p><b>Pagado:</b> ${money(p.monto)}</p>
        <p><b>Pendiente después:</b> ${money(p.montoPendienteDespues || 0)}</p>
        <p><b>Método:</b> ${p.metodo}</p>
        <p><b>Cobrador:</b> ${p.cobrador || ""}</p>
        <p><b>Estatus:</b> ${p.estatus || "N/A"}</p>

        <div class="centro" style="margin-top:10px">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(p.url)}" />
          <p>Validar QR</p>
        </div>
      `;
    }

    return `
      <h1>${empresa.nombre}</h1>
      <p class="centro">${empresa.telefono} · ${empresa.direccion}</p>
      <h2>COMPROBANTE DE PAGO</h2>

      <table>
        <tr><th>ID Comprobante</th><td>${p.id}</td></tr>
        <tr><th>Fecha</th><td>${p.fecha}</td></tr>
        <tr><th>ID Cliente</th><td>${p.idCliente || p.clienteId}</td></tr>
        <tr><th>Cliente</th><td>${p.cliente}</td></tr>
        <tr><th>Cédula</th><td>${p.cedula || ""}</td></tr>
        <tr><th>Teléfono</th><td>${p.telefono || ""}</td></tr>
        <tr><th>Moto</th><td>${p.moto}</td></tr>
        <tr><th>Cuota diaria</th><td>${money(p.cuotaDiaria)}</td></tr>
        <tr><th>Cuotas pendientes</th><td>${p.cuotasPendientes || 0}</td></tr>
        <tr><th>Monto pendiente antes del pago</th><td>${money(p.montoPendienteAntes || 0)}</td></tr>
        <tr><th>Monto pagado</th><td>${money(p.monto)}</td></tr>
        <tr><th>Monto pendiente después del pago</th><td>${money(p.montoPendienteDespues || 0)}</td></tr>
        <tr><th>Método</th><td>${p.metodo}</td></tr>
        <tr><th>Cobrador</th><td>${p.cobrador || ""}</td></tr>
        <tr><th>Estatus</th><td>${p.estatus || "N/A"}</td></tr>
        <tr><th>Validación</th><td>${p.url}</td></tr>
      </table>

      <div class="centro" style="margin-top:20px">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(p.url)}" />
        <p>Código QR de validación</p>
      </div>
    `;
  }

  function imprimirComprobante(p,tipo="normal"){
    abrirImpresion("Comprobante "+p.id,comprobanteHtml(p,tipo),tipo);
  }

  useEffect(()=>{
    if(motosMorosas.length > 0 && "Notification" in window){
      if(Notification.permission === "granted"){
        new Notification("Pronto Moto",{
          body:`Tienes ${motosMorosas.length} moto(s) con atraso.`
        });
      }else if(Notification.permission !== "denied"){
        Notification.requestPermission();
      }
    }
  },[motosMorosas.length]);

  return (
    <div className="app">
      <div className="header">
        <div className="brand">
          <div className="logoBox">
            <img src="/logo.png" alt="Pronto Moto" onError={e=>{e.currentTarget.style.display="none"}} />
          </div>

          <div>
            <p className="muted">Sistema comercial de renta diaria</p>
            <h1>Pronto Moto Control PRO</h1>
            <p className="muted">
              Usuario: {usuarioActual?.nombre || user.email} · Rol: {usuarioActual?.rol || "admin"}
            </p>
          </div>
        </div>

        <div>
          <button onClick={cargar}>Actualizar</button>
          <button onClick={()=>signOut(auth)}>Salir</button>
        </div>
      </div>

      <div className="gridStats">
        <div className="card stat"><span>Clientes</span><b>{clientesVisibles.length}</b></div>
        <div className="card stat"><span>Motos</span><b>{motosVisibles.length}</b></div>
        <div className="card stat"><span>Morosas</span><b>{motosMorosas.length}</b></div>
        <div className="card stat"><span>Ingresos</span><b>{money(totalIngresos)}</b></div>
        <div className="card stat"><span>Gastos</span><b>{money(totalGastos)}</b></div>
        <div className="card stat"><span>Neto</span><b>{money(neto)}</b></div>
      </div>

      <div className="tabs">
        <button className={tab==="inicio"?"active":""} onClick={()=>setTab("inicio")}>Inicio</button>
        <button className={tab==="clientes"?"active":""} onClick={()=>setTab("clientes")}>Clientes</button>
        <button className={tab==="motos"?"active":""} onClick={()=>setTab("motos")}>Motos</button>
        <button className={tab==="pagos"?"active":""} onClick={()=>setTab("pagos")}>Pagos</button>
        {esAdmin && <button className={tab==="gastos"?"active":""} onClick={()=>setTab("gastos")}>Gastos</button>}
        <button className={tab==="morosidad"?"active":""} onClick={()=>setTab("morosidad")}>Morosidad</button>
        <button className={tab==="ranking"?"active":""} onClick={()=>setTab("ranking")}>Ranking</button>
        {esAdmin && <button className={tab==="adjuntos"?"active":""} onClick={()=>setTab("adjuntos")}>Adjuntos</button>}
        {esAdmin && <button className={tab==="empresa"?"active":""} onClick={()=>setTab("empresa")}>Empresa</button>}
        <button className={tab==="configuracion"?"active":""} onClick={()=>setTab("configuracion")}>Configuración</button>
      </div>

      {tab==="inicio" && (
        <>
          <div className="card">
            <h2>Dashboard financiero</h2>
            <p>Ingresos totales: <b>{money(totalIngresos)}</b></p>
            <p>Gastos totales: <b>{money(totalGastos)}</b></p>
            <p>Neto general: <b>{money(neto)}</b></p>
            {!esAdmin && <p>Vista limitada a clientes asignados al cobrador.</p>}
          </div>

          <div className="card">
            <h2>Gráficas rápidas</h2>

            <p><b>Ingresos</b> {money(totalIngresos)}</p>
            <div style={{background:"#eee",borderRadius:10,overflow:"hidden",height:18}}>
              <div style={{width:`${Math.min(100,totalIngresos/(totalIngresos+totalGastos || 1)*100)}%`,background:"#ff6600",height:18}}></div>
            </div>

            <p><b>Gastos</b> {money(totalGastos)}</p>
            <div style={{background:"#eee",borderRadius:10,overflow:"hidden",height:18}}>
              <div style={{width:`${Math.min(100,totalGastos/(totalIngresos+totalGastos || 1)*100)}%`,background:"#dc2626",height:18}}></div>
            </div>

            <p><b>Morosidad</b> {motosMorosas.length} moto(s)</p>
            <div style={{background:"#eee",borderRadius:10,overflow:"hidden",height:18}}>
              <div style={{width:`${Math.min(100,(motosMorosas.length/(motosVisibles.length || 1))*100)}%`,background:"#25D366",height:18}}></div>
            </div>
          </div>
        </>
      )}

      {tab==="configuracion" && (
        <div className="card">
          <h2>Configuración</h2>

          <h3>Cambiar contraseña</h3>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={nuevaPassword}
            onChange={e=>setNuevaPassword(e.target.value)}
          />
          <button onClick={cambiarPassword}>Cambiar contraseña</button>

          {esAdmin && (
            <>
              <h3>Gestión de usuarios / cobradores</h3>
              <p className="muted">
                Primero crea el usuario en Firebase Authentication. Luego copia su UID y regístralo aquí.
              </p>

              <input placeholder="UID de Firebase Auth" value={usuarioForm.uid} onChange={e=>setUsuarioForm({...usuarioForm,uid:e.target.value})}/>
              <input placeholder="Nombre" value={usuarioForm.nombre} onChange={e=>setUsuarioForm({...usuarioForm,nombre:e.target.value})}/>
              <input placeholder="Correo" value={usuarioForm.correo} onChange={e=>setUsuarioForm({...usuarioForm,correo:e.target.value})}/>
              <select value={usuarioForm.rol} onChange={e=>setUsuarioForm({...usuarioForm,rol:e.target.value})}>
                <option value="admin">Admin</option>
                <option value="cobrador">Cobrador</option>
              </select>
              <button onClick={guardarUsuario}>Guardar usuario</button>

              <h3>Usuarios registrados</h3>
              {usuarios.map(u=>(
                <div className="item" key={u.id}>
                  <b>{u.nombre}</b>
                  <p>{u.correo}</p>
                  <p>Rol: {u.rol}</p>
                  <p>UID: {u.uid}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab==="ranking" && (
        <div className="card">
          <h2>Ranking de motos por rentabilidad</h2>

          {rankingMotos.map((m,index)=>(
            <div className="item" key={m.id}>
              <b>#{index+1} · {m.placa}</b>
              <p>{m.marca} {m.modelo}</p>
              <p>Ingresos: {money(ingresosPorMoto(m.id))}</p>
              <p>Gastos: {money(gastosPorMoto(m.id))}</p>
              <p>Neto: {money(ingresosPorMoto(m.id)-gastosPorMoto(m.id))}</p>
            </div>
          ))}
        </div>
      )}

      {tab==="morosidad" && (
        <div className="card">
          <h2>Control de morosidad</h2>

          {motosMorosas.length===0 && <p>No hay motos con atraso registrado.</p>}

          {motosMorosas.map(m=>{
            const c=clientes.find(x=>x.id===m.clienteId);
            const d=deudaMoto(m);

            return (
              <div className="item" key={m.id}>
                <b>{m.placa}</b>
                <p>Cliente: {c?.nombre || "N/A"}</p>
                <p>Cuotas pendientes: {d.cuotasPendientes}</p>
                <p>Deuda estimada: {money(d.montoPendiente)}</p>
                <p>Estatus: {d.estatus}</p>

                {c?.telefono && (
                  <a href={whatsappUrl(c.telefono,mensajeWhatsAppMora(m))} target="_blank" rel="noreferrer">
                    <button className="whatsappBtn">WhatsApp</button>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab==="empresa" && esAdmin && (
        <div className="card">
          <h2>Datos de empresa</h2>

          <input placeholder="Nombre de empresa" value={empresa.nombre} onChange={e=>setEmpresa({...empresa,nombre:e.target.value})}/>
          <input placeholder="Teléfono" value={empresa.telefono} onChange={e=>setEmpresa({...empresa,telefono:e.target.value})}/>
          <input placeholder="Dirección" value={empresa.direccion} onChange={e=>setEmpresa({...empresa,direccion:e.target.value})}/>
          <input placeholder="RNC / Cédula" value={empresa.rnc} onChange={e=>setEmpresa({...empresa,rnc:e.target.value})}/>
          <input placeholder="Notas adicionales para contrato" value={empresa.notas} onChange={e=>setEmpresa({...empresa,notas:e.target.value})}/>
        </div>
      )}

      {tab==="clientes" && (
        <div className="card">
          <h2>{editCliente ? "Editar cliente" : "Crear cliente"}</h2>

          <input 
            placeholder="Buscar cliente por nombre, ID, cédula, teléfono, correo, provincia..."
            value={busquedaCliente}
            onChange={e=>setBusquedaCliente(e.target.value)}
          />

          {esAdmin && (
            <>
              {editCliente && <p><b>ID Cliente:</b> {cliente.idCliente}</p>}

              <select value={cliente.pais} onChange={e=>setCliente({...cliente,pais:e.target.value})}>
                {paises.map(p=><option key={p} value={p}>{p}</option>)}
              </select>

              <select value={cliente.nacionalidad} onChange={e=>setCliente({...cliente,nacionalidad:e.target.value})}>
                {nacionalidades.map(n=><option key={n} value={n}>{n}</option>)}
              </select>

              <select
                value={cliente.provincia}
                onChange={e=>{
                  const prov=e.target.value;
                  setCliente({
                    ...cliente,
                    provincia:prov,
                    municipio:(provinciasRD[prov] || [])[0] || ""
                  });
                }}
              >
                {Object.keys(provinciasRD).map(p=><option key={p} value={p}>{p}</option>)}
              </select>

              <select value={cliente.municipio} onChange={e=>setCliente({...cliente,municipio:e.target.value})}>
                {municipiosDisponibles.map(m=><option key={m} value={m}>{m}</option>)}
              </select>

              <select value={cliente.sexo} onChange={e=>setCliente({...cliente,sexo:e.target.value})}>
                <option>Masculino</option>
                <option>Femenino</option>
              </select>

              <input placeholder="Nombre" value={cliente.nombre} onChange={e=>setCliente({...cliente,nombre:e.target.value})}/>
              <input placeholder="Cédula / Pasaporte" value={cliente.cedula} onChange={e=>setCliente({...cliente,cedula:e.target.value})}/>
              <input placeholder="Correo electrónico" value={cliente.correo} onChange={e=>setCliente({...cliente,correo:e.target.value})}/>
              <input placeholder="Teléfono móvil" value={cliente.telefono} onChange={e=>setCliente({...cliente,telefono:e.target.value})}/>
              <input placeholder="Teléfono residencial" value={cliente.telefonoResidencial} onChange={e=>setCliente({...cliente,telefonoResidencial:e.target.value})}/>
              <input placeholder="Teléfono de referencia" value={cliente.telefonoReferencia} onChange={e=>setCliente({...cliente,telefonoReferencia:e.target.value})}/>
              <input placeholder="Dirección" value={cliente.direccion} onChange={e=>setCliente({...cliente,direccion:e.target.value})}/>
              <input placeholder="Referencia personal" value={cliente.referencia} onChange={e=>setCliente({...cliente,referencia:e.target.value})}/>
              <input placeholder="Riesgo" value={cliente.riesgo} onChange={e=>setCliente({...cliente,riesgo:e.target.value})}/>

              <select value={cliente.cobradorId} onChange={e=>setCliente({...cliente,cobradorId:e.target.value})}>
                <option value="">Sin cobrador asignado</option>
                {usuarios.filter(u=>u.rol==="cobrador").map(u=>(
                  <option key={u.uid || u.id} value={u.uid || u.id}>{u.nombre} · {u.correo}</option>
                ))}
              </select>

              <button onClick={guardarCliente}>{editCliente ? "Guardar cambios" : "Crear cliente"}</button>
            </>
          )}

          {clientesFiltrados.map(c=>(
            <div className="item" key={c.id}>
              <b>{c.idCliente || c.id} · {c.nombre}</b>
              <p>{c.pais || "N/A"} · {c.nacionalidad || "N/A"} · {c.sexo || "N/A"}</p>
              <p>{c.provincia || "N/A"} · {c.municipio || "N/A"}</p>
              <p>{c.telefono} · {c.cedula}</p>
              <p>{c.correo}</p>
              <p>Cobrador: {usuarios.find(u=>(u.uid || u.id)===c.cobradorId)?.nombre || "Sin asignar"}</p>

              {esAdmin && <button onClick={()=>editarCliente(c)}>Editar</button>}
              <button onClick={()=>setClienteVista(c)}>Perfil</button>

              {c.telefono && (
                <a href={whatsappUrl(c.telefono,`Hola ${c.nombre}, te contactamos de Pronto Moto.`)} target="_blank" rel="noreferrer">
                  <button className="whatsappBtn">WhatsApp</button>
                </a>
              )}

              {esAdmin && <button className="deleteBtn" onClick={()=>eliminarCliente(c.id)}>Eliminar</button>}
            </div>
          ))}
        </div>
      )}

      {clienteVista && (
        <div className="card">
          <h2>Perfil del cliente</h2>

          <p><b>ID Cliente:</b> {clienteVista.idCliente || clienteVista.id}</p>
          <p><b>Nombre:</b> {clienteVista.nombre}</p>
          <p><b>Sexo:</b> {clienteVista.sexo}</p>
          <p><b>País:</b> {clienteVista.pais}</p>
          <p><b>Nacionalidad:</b> {clienteVista.nacionalidad}</p>
          <p><b>Provincia:</b> {clienteVista.provincia}</p>
          <p><b>Municipio:</b> {clienteVista.municipio}</p>
          <p><b>Cédula:</b> {clienteVista.cedula}</p>
          <p><b>Correo:</b> {clienteVista.correo}</p>
          <p><b>Teléfono móvil:</b> {clienteVista.telefono}</p>
          <p><b>Teléfono residencial:</b> {clienteVista.telefonoResidencial}</p>
          <p><b>Teléfono referencia:</b> {clienteVista.telefonoReferencia}</p>
          <p><b>Dirección:</b> {clienteVista.direccion}</p>

          <h3>Motos asignadas</h3>
          {motos.filter(m=>m.clienteId===clienteVista.id).map(m=>(
            <div className="item" key={m.id}>{m.placa} - {m.marca} {m.modelo}</div>
          ))}

          <h3>Pagos</h3>
          {pagos.filter(p=>p.clienteId===clienteVista.id).map(p=>(
            <div className="item" key={p.docId}>{p.id} - {money(p.monto)}</div>
          ))}

          <h3>Adjuntos</h3>
          {adjuntos.filter(a=>a.clienteId===clienteVista.id).map(a=>(
            <div className="item" key={a.id}>
              <a href={a.url} target="_blank" rel="noreferrer">{a.nombre}</a>
            </div>
          ))}

          <button onClick={()=>setClienteVista(null)}>Cerrar perfil</button>
        </div>
      )}

      {tab==="motos" && (
        <div className="card">
          <h2>{editMoto ? "Editar moto" : "Crear moto"}</h2>

          {esAdmin && (
            <>
              <input placeholder="Placa" value={moto.placa} onChange={e=>setMoto({...moto,placa:e.target.value})}/>
              <input placeholder="Marca" value={moto.marca} onChange={e=>setMoto({...moto,marca:e.target.value})}/>
              <input placeholder="Modelo" value={moto.modelo} onChange={e=>setMoto({...moto,modelo:e.target.value})}/>
              <input placeholder="Año" value={moto.anio} onChange={e=>setMoto({...moto,anio:e.target.value})}/>
              <input placeholder="Tracker / GPS" value={moto.tracker} onChange={e=>setMoto({...moto,tracker:e.target.value})}/>

              <select value={moto.clienteId} onChange={e=>setMoto({...moto,clienteId:e.target.value})}>
                <option value="">Sin cliente asignado</option>
                {clientes.map(c=><option key={c.id} value={c.id}>{c.idCliente || c.id} · {c.nombre}</option>)}
              </select>

              <input type="date" value={moto.fechaAsignacion} onChange={e=>setMoto({...moto,fechaAsignacion:e.target.value})}/>
              <input placeholder="Pago diario" value={moto.pagoDiario} onChange={e=>setMoto({...moto,pagoDiario:e.target.value})}/>
              <input placeholder="Depósito" value={moto.deposito} onChange={e=>setMoto({...moto,deposito:e.target.value})}/>

              <button onClick={guardarMoto}>{editMoto ? "Guardar cambios" : "Crear moto"}</button>
            </>
          )}

          {motosVisibles.map(m=>{
            const d=deudaMoto(m);

            return (
              <div className="item" key={m.id}>
                <b>{m.placa}</b>
                <p>{m.marca} {m.modelo} · {m.anio}</p>
                <p>Pago diario: {money(m.pagoDiario)}</p>
                <p>Estado: {m.estado || "Disponible"}</p>
                <p>Cliente: {clientes.find(c=>c.id===m.clienteId)?.nombre || "Sin asignar"}</p>
                <p>Cuotas pendientes: {d.cuotasPendientes}</p>
                <p>Monto pendiente: {money(d.montoPendiente)}</p>
                <p>Estatus: {d.estatus}</p>

                {esAdmin && <button onClick={()=>editarMoto(m)}>Editar</button>}
                {esAdmin && <button onClick={()=>imprimirContrato(m)}>Contrato</button>}
                {esAdmin && <button className="deleteBtn" onClick={()=>eliminarMoto(m.id)}>Eliminar</button>}
              </div>
            );
          })}
        </div>
      )}

      {tab==="pagos" && (
        <div className="card">
          <h2>Registrar pago</h2>

          <input
            placeholder="Buscar cliente para pago por nombre, ID, cédula, teléfono..."
            value={busquedaClientePago}
            onChange={e=>setBusquedaClientePago(e.target.value)}
          />

          <select
            value={clientePagoId}
            onChange={e=>{
              setClientePagoId(e.target.value);
              setPago({...pago,motoId:""});
            }}
          >
            <option value="">Seleccionar cliente</option>
            {clientesPagoFiltrados.map(c=>(
              <option key={c.id} value={c.id}>
                {c.idCliente || c.id} · {c.nombre} · {c.telefono}
              </option>
            ))}
          </select>

          {clientePago && (
            <div className="item">
              <h3>Cliente seleccionado</h3>
              <p><b>ID:</b> {clientePago.idCliente || clientePago.id}</p>
              <p><b>Nombre:</b> {clientePago.nombre}</p>
              <p><b>Cédula:</b> {clientePago.cedula}</p>
              <p><b>Teléfono:</b> {clientePago.telefono}</p>
            </div>
          )}

          <select value={pago.motoId} onChange={e=>setPago({...pago,motoId:e.target.value})}>
            <option value="">Seleccionar moto del cliente</option>
            {motosClientePago.map(m=>(
              <option key={m.id} value={m.id}>
                {m.placa} · {m.marca} {m.modelo}
              </option>
            ))}
          </select>

          {motoPagoSeleccionada && deudaPagoSeleccionada && (
            <div className="item">
              <h3>Información de pago</h3>
              <p><b>Moto:</b> {motoPagoSeleccionada.placa} {motoPagoSeleccionada.marca} {motoPagoSeleccionada.modelo}</p>
              <p><b>Cuota diaria:</b> {money(motoPagoSeleccionada.pagoDiario)}</p>
              <p><b>Cuotas pendientes:</b> {deudaPagoSeleccionada.cuotasPendientes}</p>
              <p><b>Monto pendiente:</b> {money(deudaPagoSeleccionada.montoPendiente)}</p>
              <p><b>Estatus:</b> {deudaPagoSeleccionada.estatus}</p>
            </div>
          )}

          <input placeholder="Monto pagado" value={pago.monto} onChange={e=>setPago({...pago,monto:e.target.value})}/>

          <select value={pago.metodo} onChange={e=>setPago({...pago,metodo:e.target.value})}>
            <option>Efectivo</option>
            <option>Depósito</option>
            <option>Transferencia bancaria</option>
          </select>

          <select value={papelComprobante} onChange={e=>setPapelComprobante(e.target.value)}>
            <option value="normal">Papel normal / PDF</option>
            <option value="termico">Ticket térmico 80mm / Bluetooth</option>
          </select>

          <button onClick={registrarPago}>Generar comprobante</button>

          {ultimo && (
            <div className="item">
              <h2>Comprobante</h2>
              <p><b>ID:</b> {ultimo.id}</p>
              <p><b>ID Cliente:</b> {ultimo.idCliente}</p>
              <p><b>Cliente:</b> {ultimo.cliente}</p>
              <p><b>Moto:</b> {ultimo.moto}</p>
              <p><b>Monto pagado:</b> {money(ultimo.monto)}</p>
              <p><b>Pendiente después:</b> {money(ultimo.montoPendienteDespues)}</p>

              <QRCodeCanvas value={ultimo.url} />
              <p>{ultimo.url}</p>

              <button onClick={()=>imprimirComprobante(ultimo,"normal")}>Imprimir PDF</button>
              <button onClick={()=>imprimirComprobante(ultimo,"termico")}>Imprimir térmico</button>

              {ultimo.clienteId && clientes.find(c=>c.id===ultimo.clienteId)?.telefono && (
                <a href={whatsappUrl(clientes.find(c=>c.id===ultimo.clienteId)?.telefono,mensajeWhatsAppPago(ultimo))} target="_blank" rel="noreferrer">
                  <button className="whatsappBtn">Enviar WhatsApp</button>
                </a>
              )}
            </div>
          )}

          <h2>Historial de pagos</h2>

          {pagosVisibles.map(p=>(
            <div className="item" key={p.docId}>
              <b>{p.id}</b>
              <p>{p.fecha} · {p.cliente}</p>
              <p>{p.moto} · {money(p.monto)}</p>
              <p>Cobrador: {p.cobrador || ""}</p>

              <button onClick={()=>imprimirComprobante(p,"normal")}>PDF</button>
              <button onClick={()=>imprimirComprobante(p,"termico")}>Térmico</button>

              {p.clienteId && clientes.find(c=>c.id===p.clienteId)?.telefono && (
                <a href={whatsappUrl(clientes.find(c=>c.id===p.clienteId)?.telefono,mensajeWhatsAppPago(p))} target="_blank" rel="noreferrer">
                  <button className="whatsappBtn">WhatsApp</button>
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {tab==="gastos" && esAdmin && (
        <div className="card">
          <h2>{editGasto ? "Editar gasto" : "Registrar gasto"}</h2>

          <select value={gasto.motoId} onChange={e=>setGasto({...gasto,motoId:e.target.value})}>
            <option value="">Seleccionar moto</option>
            {motos.map(m=><option key={m.id} value={m.id}>{m.placa}</option>)}
          </select>

          <input type="date" value={gasto.fecha} onChange={e=>setGasto({...gasto,fecha:e.target.value})}/>
          <input placeholder="Categoría" value={gasto.categoria} onChange={e=>setGasto({...gasto,categoria:e.target.value})}/>
          <input placeholder="Monto" value={gasto.monto} onChange={e=>setGasto({...gasto,monto:e.target.value})}/>
          <input placeholder="Proveedor / Taller" value={gasto.proveedor} onChange={e=>setGasto({...gasto,proveedor:e.target.value})}/>
          <input placeholder="Nota" value={gasto.nota} onChange={e=>setGasto({...gasto,nota:e.target.value})}/>

          <button onClick={guardarGasto}>{editGasto ? "Guardar cambios" : "Guardar gasto"}</button>

          <h2>Historial de gastos</h2>

          {gastos.map(g=>(
            <div className="item" key={g.id}>
              <b>{g.categoria}</b>
              <p>Fecha: {g.fecha}</p>
              <p>Moto: {motos.find(m=>m.id===g.motoId)?.placa || "N/A"}</p>
              <p>Monto: {money(g.monto)}</p>
              <p>Proveedor: {g.proveedor}</p>
              <p>Nota: {g.nota}</p>

              <button onClick={()=>editarGasto(g)}>Editar</button>
              <button className="deleteBtn" onClick={()=>eliminarGasto(g.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}

      {tab==="adjuntos" && esAdmin && (
        <div className="card">
          <h2>Adjuntos por cliente</h2>

          <select value={clienteAdjunto} onChange={e=>setClienteAdjunto(e.target.value)}>
            <option value="">Seleccionar cliente</option>
            {clientes.map(c=><option key={c.id} value={c.id}>{c.idCliente || c.id} · {c.nombre}</option>)}
          </select>

          <input type="file" onChange={e=>setArchivo(e.target.files[0])}/>
          <button onClick={subirAdjunto}>Subir adjunto</button>

          <h2>Documentos guardados</h2>

          {adjuntos.map(a=>(
            <div className="item" key={a.id}>
              <b>{a.nombre}</b>
              <p>Cliente: {clientes.find(c=>c.id===a.clienteId)?.nombre || "N/A"}</p>
              <p>Fecha: {a.fecha}</p>
              <a href={a.url} target="_blank" rel="noreferrer">Ver documento</a><br/>
              <button className="deleteBtn" onClick={()=>eliminarAdjunto(a)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App(){
  const [user,setUser]=useState(null);
  const path=window.location.pathname;

  useEffect(()=>onAuthStateChanged(auth,setUser),[]);

  if(path.startsWith("/validar/")) return <ValidarComprobante/>;
  if(!user) return <Login/>;

  return <Dashboard user={user}/>;
}

createRoot(document.getElementById("root")).render(<App/>);