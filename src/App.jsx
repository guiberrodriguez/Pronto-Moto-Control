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
            <tr><th>Monto</th><td>{money(data.monto)}</td></tr>
            <tr><th>Método</th><td>{data.metodo}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function abrirImpresion(titulo,html){
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

  const documento=iframe.contentWindow.document;
  documento.open();
  documento.write(`
    <html>
      <head>
        <title>${titulo}</title>
        <style>
          body{font-family:Arial,sans-serif;padding:30px;color:#333;background:white;}
          h1,h2{text-align:center;}
          table{width:100%;border-collapse:collapse;margin-top:20px;}
          td,th{border:1px solid #ddd;padding:8px;text-align:left;}
          .firmas td{height:80px;}
          .centro{text-align:center;}
          img{max-width:180px;}
        </style>
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

  function ultimoPagoMoto(motoId){
    const lista=pagos
      .filter(p=>p.motoId===motoId)
      .sort((a,b)=>String(b.fecha).localeCompare(String(a.fecha)));

    return lista[0] || null;
  }

  function atrasoMoto(m){
    if(!m.clienteId) return 0;

    const ultimo=ultimoPagoMoto(m.id);
    const fechaBase=ultimo?.fecha || m.fechaAsignacion || today();

    return businessDaysBetween(fechaBase,today());
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
        c.nacionalidad
      ].join(" ").toLowerCase();

      return texto.includes(q);
    });
  },[clientes,busquedaCliente]);

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
    if(!motoSeleccionada) return alert("Selecciona una moto");

    const clienteSeleccionado=clientes.find(c=>c.id===motoSeleccionada.clienteId);
    const id=receiptId(pagos.length);

    const comprobante={
      id,
      fecha:today(),
      clienteId:clienteSeleccionado?.id||"",
      idCliente:clienteSeleccionado?.idCliente||"",
      cliente:clienteSeleccionado?.nombre||"",
      motoId:motoSeleccionada.id,
      moto:`${motoSeleccionada.placa}`,
      monto:pago.monto,
      metodo:pago.metodo,
      url:`${BASE_URL}/validar/${id}`
    };

    await addDoc(collection(db,"pagos"),comprobante);
    setUltimo(comprobante);
    setPago({motoId:"",monto:"400",metodo:"Efectivo"});
    cargar();
  }

  function mensajeWhatsAppPago(p){
    return `Hola ${p.cliente}, pago registrado.%0A${money(p.monto)}%0A${p.url}`;
  }

  function mensajeWhatsAppMora(m){
    const c=clientes.find(x=>x.id===m.clienteId);
    const dias=atrasoMoto(m);
    return `Hola ${c?.nombre}, tienes ${dias} días pendientes de pago de la moto ${m.placa}.`;
  }

  useEffect(()=>{
    if(motosMorosas.length > 0){
      if(Notification.permission === "granted"){
        new Notification("⚠️ Clientes con atraso");
      }else{
        Notification.requestPermission();
      }
    }
  },[motosMorosas]);

  return (
    <div className="app">

      <div className="header">
        <div className="brand">
          <div className="logoBox">
            <img src="/logo.png" />
          </div>
          <h1>Pronto Moto Control PRO</h1>
        </div>

        <button onClick={()=>signOut(auth)}>Salir</button>
      </div>

      <div className="tabs">
        <button onClick={()=>setTab("inicio")}>Inicio</button>
        <button onClick={()=>setTab("clientes")}>Clientes</button>
        <button onClick={()=>setTab("motos")}>Motos</button>
        <button onClick={()=>setTab("pagos")}>Pagos</button>
        <button onClick={()=>setTab("morosidad")}>Morosidad</button>
      </div>

      {tab==="inicio" && (
        <div className="card">
          <h2>Dashboard</h2>
          <p>Ingresos: {money(totalIngresos)}</p>
          <p>Gastos: {money(totalGastos)}</p>
          <p>Neto: {money(neto)}</p>

          <h3>Ranking</h3>
          {rankingMotos.map((m,i)=>(
            <div key={m.id}>
              #{i+1} {m.placa} - {money(ingresosPorMoto(m.id)-gastosPorMoto(m.id))}
            </div>
          ))}
        </div>
      )}

      {tab==="clientes" && (
        <div className="card">

          <h2>Clientes</h2>

          <input 
            placeholder="Buscar cliente..."
            value={busquedaCliente}
            onChange={e=>setBusquedaCliente(e.target.value)}
          />

          <select value={cliente.pais} onChange={e=>setCliente({...cliente,pais:e.target.value})}>
            {paises.map(p=><option key={p}>{p}</option>)}
          </select>

          <select value={cliente.nacionalidad} onChange={e=>setCliente({...cliente,nacionalidad:e.target.value})}>
            {nacionalidades.map(n=><option key={n}>{n}</option>)}
          </select>

          <select value={cliente.sexo} onChange={e=>setCliente({...cliente,sexo:e.target.value})}>
            <option>Masculino</option>
            <option>Femenino</option>
          </select>

          <input placeholder="Nombre" value={cliente.nombre} onChange={e=>setCliente({...cliente,nombre:e.target.value})}/>
          <input placeholder="Correo" value={cliente.correo} onChange={e=>setCliente({...cliente,correo:e.target.value})}/>
          <input placeholder="Teléfono" value={cliente.telefono} onChange={e=>setCliente({...cliente,telefono:e.target.value})}/>
          <input placeholder="Teléfono residencial" value={cliente.telefonoResidencial} onChange={e=>setCliente({...cliente,telefonoResidencial:e.target.value})}/>
          <input placeholder="Teléfono referencia" value={cliente.telefonoReferencia} onChange={e=>setCliente({...cliente,telefonoReferencia:e.target.value})}/>

          <button onClick={guardarCliente}>Guardar</button>

          {clientesFiltrados.map(c=>(
            <div key={c.id} className="item">
              <b>{c.idCliente} - {c.nombre}</b>
              <p>{c.pais} · {c.nacionalidad}</p>

              <a href={whatsappUrl(c.telefono,`Hola ${c.nombre}`)} target="_blank">
                <button className="whatsappBtn">WhatsApp</button>
              </a>

              <button className="deleteBtn" onClick={()=>eliminarCliente(c.id)}>Eliminar</button>
            </div>
          ))}

        </div>
      )}

      {tab==="motos" && (
        <div className="card">

          <h2>Motos</h2>

          <input placeholder="Placa" value={moto.placa} onChange={e=>setMoto({...moto,placa:e.target.value})}/>

          <select value={moto.clienteId} onChange={e=>setMoto({...moto,clienteId:e.target.value})}>
            <option>Asignar cliente</option>
            {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>

          <button onClick={guardarMoto}>Guardar moto</button>

          {motos.map(m=>(
            <div key={m.id} className="item">
              {m.placa} - atraso: {atrasoMoto(m)} días

              <button className="deleteBtn" onClick={()=>eliminarMoto(m.id)}>Eliminar</button>
            </div>
          ))}

        </div>
      )}

      {tab==="pagos" && (
        <div className="card">

          <select onChange={e=>setPago({...pago,motoId:e.target.value})}>
            {motos.map(m=><option key={m.id} value={m.id}>{m.placa}</option>)}
          </select>

          <input value={pago.monto} onChange={e=>setPago({...pago,monto:e.target.value})}/>
          <button onClick={registrarPago}>Generar pago</button>

          {ultimo && (
            <div className="item">
              {ultimo.id}
              <QRCodeCanvas value={ultimo.url}/>

              <a href={whatsappUrl(clientes.find(c=>c.id===ultimo.clienteId)?.telefono,mensajeWhatsAppPago(ultimo))} target="_blank">
                <button className="whatsappBtn">Enviar WhatsApp</button>
              </a>
            </div>
          )}

        </div>
      )}

      {tab==="morosidad" && (
        <div className="card">

          <h2>Morosos</h2>

          {motosMorosas.map(m=>{
            const c=clientes.find(x=>x.id===m.clienteId);

            return (
              <div key={m.id} className="item">
                {m.placa} - {c?.nombre}

                <a href={whatsappUrl(c?.telefono,mensajeWhatsAppMora(m))} target="_blank">
                  <button className="whatsappBtn">Cobrar</button>
                </a>
              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

function App(){
  const [user,setUser]=useState(null);

  useEffect(()=>onAuthStateChanged(auth,setUser),[]);

  if(!user) return <Login/>;
  return <Dashboard/>;
}

createRoot(document.getElementById("root")).render(<App/>);