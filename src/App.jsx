import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage } from "./firebase";
import { QRCodeCanvas } from "qrcode.react";
import "./style.css";

const BASE_URL = window.location.origin;

function money(n){
  return "RD$" + Number(n || 0).toLocaleString();
}

function today(){
  return new Date().toISOString().slice(0,10);
}

function receiptId(count){
  const ym = new Date().toISOString().slice(0,7).replace("-","");
  return `${ym}-${String(count + 1).padStart(2,"0")}`;
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

  if(loading) return <div className="app"><div className="card"><h1>Validando comprobante...</h1></div></div>;
  if(!data) return <div className="app"><div className="card"><h1>Comprobante no encontrado</h1></div></div>;

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

  const [empresa,setEmpresa]=useState({
    nombre:"Pronto Moto",
    telefono:"",
    direccion:"",
    rnc:"",
    notas:""
  });

  const [cliente,setCliente]=useState({
    nombre:"",
    cedula:"",
    telefono:"",
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

  async function guardarCliente(){
    if(!cliente.nombre) return alert("El nombre del cliente es obligatorio");

    if(editCliente){
      await updateDoc(doc(db,"clientes",editCliente),cliente);
      setEditCliente(null);
    }else{
      await addDoc(collection(db,"clientes"),cliente);
    }

    setCliente({nombre:"",cedula:"",telefono:"",direccion:"",referencia:"",riesgo:"Nuevo cliente"});
    cargar();
  }

  function editarCliente(c){
    setCliente({
      nombre:c.nombre||"",
      cedula:c.cedula||"",
      telefono:c.telefono||"",
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
        await updateDoc(doc(db,"motos",m.id),{...m,clienteId:"",estado:"Disponible"});
      }
      cargar();
    }
  }

  async function guardarMoto(){
    if(!moto.placa) return alert("La placa es obligatoria");

    const datos={...moto,estado:moto.clienteId?"Alquilada":"Disponible"};

    if(editMoto){
      await updateDoc(doc(db,"motos",editMoto),datos);
      setEditMoto(null);
    }else{
      await addDoc(collection(db,"motos"),datos);
    }

    setMoto({placa:"",marca:"",modelo:"",anio:"",tracker:"",clienteId:"",pagoDiario:"400",deposito:"5000"});
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
      cliente:clienteSeleccionado?.nombre||"",
      motoId:motoSeleccionada.id,
      moto:`${motoSeleccionada.placa} ${motoSeleccionada.marca||""} ${motoSeleccionada.modelo||""}`,
      monto:pago.monto,
      metodo:pago.metodo,
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

  function imprimirContrato(m){
    const c=clientes.find(x=>x.id===m.clienteId);
    if(!c) return alert("Esta moto no tiene cliente asignado");

    const html=`
      <h1>${empresa.nombre}</h1>
      <p class="centro">${empresa.telefono} · ${empresa.direccion}</p>
      <h2>CONTRATO DE ALQUILER DE MOTOCICLETA</h2>
      <p><b>Fecha:</b> ${today()}</p>
      <p><b>Arrendador:</b> ${empresa.nombre} · RNC/Cédula: ${empresa.rnc||"N/A"}</p>
      <p><b>Arrendatario:</b> ${c.nombre} · Cédula: ${c.cedula} · Teléfono: ${c.telefono}</p>
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

    abrirImpresion("Contrato "+m.placa,html);
  }

  function imprimirComprobante(p){
    const html=`
      <h1>${empresa.nombre}</h1>
      <p class="centro">${empresa.telefono} · ${empresa.direccion}</p>
      <h2>COMPROBANTE DE PAGO</h2>

      <table>
        <tr><th>ID Comprobante</th><td>${p.id}</td></tr>
        <tr><th>Fecha</th><td>${p.fecha}</td></tr>
        <tr><th>ID Cliente</th><td>${p.clienteId}</td></tr>
        <tr><th>Cliente</th><td>${p.cliente}</td></tr>
        <tr><th>Moto</th><td>${p.moto}</td></tr>
        <tr><th>Monto Pagado</th><td>${money(p.monto)}</td></tr>
        <tr><th>Método</th><td>${p.metodo}</td></tr>
        <tr><th>Validación</th><td>${p.url}</td></tr>
      </table>

      <div class="centro" style="margin-top:20px">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(p.url)}" />
        <p>Código QR de validación</p>
      </div>
    `;

    abrirImpresion("Comprobante "+p.id,html);
  }

  return (
    <div className="app">
      <div className="header">
        <div className="brand">
          <div className="logoBox">
            <img src="/logo.png" alt="Pronto Moto" onError={e=>{e.currentTarget.style.display="none"}} />
          </div>
          <div>
            <p className="muted">Sistema comercial de renta diaria</p>
            <h1>Pronto Moto Control</h1>
            <p className="muted">Clientes, motos, pagos, gastos, contratos, adjuntos y QR real</p>
          </div>
        </div>

        <div>
          <button onClick={cargar}>Actualizar</button>
          <button onClick={()=>signOut(auth)}>Salir</button>
        </div>
      </div>

      <div className="gridStats">
        <div className="card stat"><span>Clientes</span><b>{clientes.length}</b></div>
        <div className="card stat"><span>Motos</span><b>{motos.length}</b></div>
        <div className="card stat"><span>Pagos</span><b>{pagos.length}</b></div>
        <div className="card stat"><span>Gastos</span><b>{gastos.length}</b></div>
        <div className="card stat"><span>Ingresos</span><b>{money(totalIngresos)}</b></div>
        <div className="card stat"><span>Neto</span><b>{money(neto)}</b></div>
      </div>

      <div className="tabs">
        <button className={tab==="inicio"?"active":""} onClick={()=>setTab("inicio")}>Inicio</button>
        <button className={tab==="clientes"?"active":""} onClick={()=>setTab("clientes")}>Clientes</button>
        <button className={tab==="motos"?"active":""} onClick={()=>setTab("motos")}>Motos</button>
        <button className={tab==="pagos"?"active":""} onClick={()=>setTab("pagos")}>Pagos</button>
        <button className={tab==="gastos"?"active":""} onClick={()=>setTab("gastos")}>Gastos</button>
        <button className={tab==="adjuntos"?"active":""} onClick={()=>setTab("adjuntos")}>Adjuntos</button>
        <button className={tab==="empresa"?"active":""} onClick={()=>setTab("empresa")}>Empresa</button>
      </div>

      {tab==="inicio" && (
        <div className="card">
          <h2>Dashboard financiero</h2>
          <p>Ingresos totales: <b>{money(totalIngresos)}</b></p>
          <p>Gastos totales: <b>{money(totalGastos)}</b></p>
          <p>Neto general: <b>{money(neto)}</b></p>

          <h3>Rentabilidad por moto</h3>
          {motos.map(m=>(
            <div className="item" key={m.id}>
              <b>{m.placa}</b>
              <p>Ingresos: {money(ingresosPorMoto(m.id))}</p>
              <p>Gastos: {money(gastosPorMoto(m.id))}</p>
              <p>Neto: {money(ingresosPorMoto(m.id)-gastosPorMoto(m.id))}</p>
            </div>
          ))}
        </div>
      )}

      {tab==="empresa" && (
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

          <input placeholder="Nombre" value={cliente.nombre} onChange={e=>setCliente({...cliente,nombre:e.target.value})}/>
          <input placeholder="Cédula" value={cliente.cedula} onChange={e=>setCliente({...cliente,cedula:e.target.value})}/>
          <input placeholder="Teléfono" value={cliente.telefono} onChange={e=>setCliente({...cliente,telefono:e.target.value})}/>
          <input placeholder="Dirección" value={cliente.direccion} onChange={e=>setCliente({...cliente,direccion:e.target.value})}/>
          <input placeholder="Referencia" value={cliente.referencia} onChange={e=>setCliente({...cliente,referencia:e.target.value})}/>
          <input placeholder="Riesgo" value={cliente.riesgo} onChange={e=>setCliente({...cliente,riesgo:e.target.value})}/>

          <button onClick={guardarCliente}>{editCliente ? "Guardar cambios" : "Crear cliente"}</button>

          {clientes.map(c=>(
            <div className="item" key={c.id}>
              <b>{c.nombre}</b>
              <p>{c.telefono} · {c.cedula}</p>
              <p>{c.direccion}</p>
              <small>ID: {c.id}</small><br/>
              <button onClick={()=>editarCliente(c)}>Editar</button>
              <button onClick={()=>setClienteVista(c)}>Perfil</button>
              <button onClick={()=>eliminarCliente(c.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}

      {clienteVista && (
        <div className="card">
          <h2>Perfil del cliente</h2>
          <p><b>Nombre:</b> {clienteVista.nombre}</p>
          <p><b>Cédula:</b> {clienteVista.cedula}</p>
          <p><b>Teléfono:</b> {clienteVista.telefono}</p>
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

          <input placeholder="Placa" value={moto.placa} onChange={e=>setMoto({...moto,placa:e.target.value})}/>
          <input placeholder="Marca" value={moto.marca} onChange={e=>setMoto({...moto,marca:e.target.value})}/>
          <input placeholder="Modelo" value={moto.modelo} onChange={e=>setMoto({...moto,modelo:e.target.value})}/>
          <input placeholder="Año" value={moto.anio} onChange={e=>setMoto({...moto,anio:e.target.value})}/>
          <input placeholder="Tracker / GPS" value={moto.tracker} onChange={e=>setMoto({...moto,tracker:e.target.value})}/>

          <select value={moto.clienteId} onChange={e=>setMoto({...moto,clienteId:e.target.value})}>
            <option value="">Sin cliente asignado</option>
            {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>

          <input placeholder="Pago diario" value={moto.pagoDiario} onChange={e=>setMoto({...moto,pagoDiario:e.target.value})}/>
          <input placeholder="Depósito" value={moto.deposito} onChange={e=>setMoto({...moto,deposito:e.target.value})}/>

          <button onClick={guardarMoto}>{editMoto ? "Guardar cambios" : "Crear moto"}</button>

          {motos.map(m=>(
            <div className="item" key={m.id}>
              <b>{m.placa}</b>
              <p>{m.marca} {m.modelo} · {m.anio}</p>
              <p>Pago diario: {money(m.pagoDiario)}</p>
              <p>Estado: {m.estado || "Disponible"}</p>
              <p>Cliente: {clientes.find(c=>c.id===m.clienteId)?.nombre || "Sin asignar"}</p>
              <p>Ingresos: {money(ingresosPorMoto(m.id))}</p>
              <p>Gastos: {money(gastosPorMoto(m.id))}</p>
              <p>Neto moto: {money(ingresosPorMoto(m.id)-gastosPorMoto(m.id))}</p>
              <button onClick={()=>editarMoto(m)}>Editar</button>
              <button onClick={()=>eliminarMoto(m.id)}>Eliminar</button>
              <button onClick={()=>imprimirContrato(m)}>Contrato</button>
            </div>
          ))}
        </div>
      )}

      {tab==="pagos" && (
        <div className="card">
          <h2>Registrar pago</h2>

          <select value={pago.motoId} onChange={e=>setPago({...pago,motoId:e.target.value})}>
            <option value="">Seleccionar moto</option>
            {motos.map(m=><option key={m.id} value={m.id}>{m.placa}</option>)}
          </select>

          <input placeholder="Monto" value={pago.monto} onChange={e=>setPago({...pago,monto:e.target.value})}/>

          <select value={pago.metodo} onChange={e=>setPago({...pago,metodo:e.target.value})}>
            <option>Efectivo</option>
            <option>Transferencia bancaria</option>
          </select>

          <button onClick={registrarPago}>Generar comprobante</button>

          {ultimo && (
            <div className="item">
              <h2>Comprobante</h2>
              <p><b>ID:</b> {ultimo.id}</p>
              <p><b>Cliente:</b> {ultimo.cliente}</p>
              <p><b>Moto:</b> {ultimo.moto}</p>
              <p><b>Monto:</b> {money(ultimo.monto)}</p>
              <QRCodeCanvas value={ultimo.url} />
              <p>{ultimo.url}</p>
              <button onClick={()=>imprimirComprobante(ultimo)}>Imprimir comprobante</button>
            </div>
          )}

          <h2>Historial de pagos</h2>
          {pagos.map(p=>(
            <div className="item" key={p.docId}>
              <b>{p.id}</b>
              <p>{p.fecha} · {p.cliente}</p>
              <p>{p.moto} · {money(p.monto)}</p>
              <button onClick={()=>imprimirComprobante(p)}>Comprobante</button>
            </div>
          ))}
        </div>
      )}

      {tab==="gastos" && (
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
              <button onClick={()=>eliminarGasto(g.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}

      {tab==="adjuntos" && (
        <div className="card">
          <h2>Adjuntos por cliente</h2>

          <select value={clienteAdjunto} onChange={e=>setClienteAdjunto(e.target.value)}>
            <option value="">Seleccionar cliente</option>
            {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
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
              <button onClick={()=>eliminarAdjunto(a)}>Eliminar</button>
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

  return <Dashboard/>;
}

createRoot(document.getElementById("root")).render(<App/>);