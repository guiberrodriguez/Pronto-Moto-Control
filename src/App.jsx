import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
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
            <tr><th>Monto pendiente antes del pago</th><td>{money(data.montoPendienteAntes || 0)}</td></tr>
            <tr><th>Monto pagado</th><td>{money(data.monto)}</td></tr>
            <tr><th>Monto pendiente después del pago</th><td>{money(data.montoPendienteDespues || 0)}</td></tr>
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

function Dashboard(){
  const [tab,setTab]=useState("inicio");

  const [clientes,setClientes]=useState([]);
  const [motos,setMotos]=useState([]);
  const [pagos,setPagos]=useState([]);
  const [gastos,setGastos]=useState([]);
  const [adjuntos,setAdjuntos]=useState([]);

  const [ultimo,setUltimo]=useState(null);
  const [clienteVista,setClienteVista]=useState(null);
  const [busquedaCliente,setBusquedaCliente]=useState("");
  const [busquedaClientePago,setBusquedaClientePago]=useState("");
  const [clientePagoId,setClientePagoId]=useState("");
  const [papelComprobante,setPapelComprobante]=useState("normal");

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
    sexo:"Masculino",
    nombre:"",
    cedula:"",
    correo:"",
    telefono:"",
    telefonoResidencial:"",
    telefonoReferencia:"",
    direccion:"",
    referencia:"",
    riesgo:"Nuevo cliente"
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

  async function cargar(){
    const c=await getDocs(collection(db,"clientes"));
    const m=await getDocs(collection(db,"motos"));
    const p=await getDocs(collection(db,"pagos"));
    const g=await getDocs(collection(db,"gastos"));
    const a=await getDocs(collection(db,"adjuntos"));

    setClientes(c.docs.map(d=>({id:d.id,...d.data()})));
    setMotos(m.docs.map(d=>({id:d.id,...d.data()})));
    setPagos(p.docs.map(d=>({docId:d.id,...d.data()})));
    setGastos(g.docs.map(d=>({id:d.id,...d.data()})));
    setAdjuntos(a.docs.map(d=>({id:d.id,...d.data()})));
  }

  useEffect(()=>{ cargar(); },[]);

  const totalIngresos=pagos.reduce((s,p)=>s+Number(p.monto||0),0);
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

  const rankingMotos=[...motos].sort((a,b)=>{
    const netoA=ingresosPorMoto(a.id)-gastosPorMoto(a.id);
    const netoB=ingresosPorMoto(b.id)-gastosPorMoto(b.id);
    return netoB-netoA;
  });

  const motosMorosas=motos.filter(m=>m.clienteId && atrasoMoto(m)>=1);

  const clientesFiltrados = useMemo(()=>{
    const q = busquedaCliente.toLowerCase().trim();

    if(!q) return clientes;

    return clientes.filter(c=>{
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
        c.sexo
      ].join(" ").toLowerCase();

      return texto.includes(q);
    });
  },[clientes,busquedaCliente]);

  const clientesPagoFiltrados = useMemo(()=>{
    const q = busquedaClientePago.toLowerCase().trim();

    if(!q) return clientes;

    return clientes.filter(c=>{
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
        c.sexo
      ].join(" ").toLowerCase();

      return texto.includes(q);
    });
  },[clientes,busquedaClientePago]);

  const clientePago = clientes.find(c=>c.id===clientePagoId) || null;
  const motosClientePago = motos.filter(m=>m.clienteId===clientePagoId);
  const motoPagoSeleccionada = motos.find(m=>m.id===pago.motoId) || null;
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
    if(!cliente.nombre) return alert("El nombre del cliente es obligatorio");

    if(editCliente){
      await updateDoc(doc(db,"clientes",editCliente),cliente);
      setEditCliente(null);
    }else{
      const nuevoId=await generarIdCliente(cliente.pais);
      await addDoc(collection(db,"clientes"),{
        ...cliente,
        idCliente:nuevoId
      });
    }

    setCliente({
      idCliente:"",
      pais:"República Dominicana",
      nacionalidad:"Dominicana",
      sexo:"Masculino",
      nombre:"",
      cedula:"",
      correo:"",
      telefono:"",
      telefonoResidencial:"",
      telefonoReferencia:"",
      direccion:"",
      referencia:"",
      riesgo:"Nuevo cliente"
    });

    cargar();
  }

  function editarCliente(c){
    setCliente({
      idCliente:c.idCliente||"",
      pais:c.pais||"República Dominicana",
      nacionalidad:c.nacionalidad||"Dominicana",
      sexo:c.sexo||"Masculino",
      nombre:c.nombre||"",
      cedula:c.cedula||"",
      correo:c.correo||"",
      telefono:c.telefono||"",
      telefonoResidencial:c.telefonoResidencial||"",
      telefonoReferencia:c.telefonoReferencia||"",
      direccion:c.direccion||"",
      referencia:c.referencia||"",
      riesgo:c.riesgo||"Nuevo cliente"
    });

    setEditCliente(c.id);
    setTab("clientes");
  }

  async function eliminarCliente(id){
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
    if(confirm("¿Eliminar esta moto?")){
      await deleteDoc(doc(db,"motos",id));
      cargar();
    }
  }
  
    async function registrarPago(){
    const motoSeleccionada=motos.find(m=>m.id===pago.motoId);
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
    if(confirm("¿Eliminar este gasto?")){
      await deleteDoc(doc(db,"gastos",id));
      cargar();
    }
  }

  async function subirAdjunto(){
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
    if(confirm("¿Eliminar este adjunto?")){
      await deleteObject(ref(storage,a.ruta));
      await deleteDoc(doc(db,"adjuntos",a.id));
      cargar();
    }
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