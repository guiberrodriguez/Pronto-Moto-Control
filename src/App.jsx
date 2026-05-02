import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { QRCodeCanvas } from "qrcode.react";

const BASE_URL = window.location.origin;

function Login() {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");

  return (
    <div style={{padding:40}}>
      <h1>Pronto Moto Control</h1>
      <input placeholder="Correo" onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Contraseña" type="password" onChange={e=>setPass(e.target.value)} />
      <button onClick={()=>signInWithEmailAndPassword(auth,email,pass)}>Entrar</button>
    </div>
  );
}

function ValidarComprobante() {
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    async function cargar(){
      const id = window.location.pathname.split("/validar/")[1];
      const snap = await getDocs(collection(db,"pagos"));
      const pagos = snap.docs.map(d=>d.data());
      const encontrado = pagos.find(p=>p.id===id);
      setData(encontrado || null);
      setLoading(false);
    }
    cargar();
  },[]);

  if(loading) return <div style={{padding:40}}><h1>Validando...</h1></div>;
  if(!data) return <div style={{padding:40}}><h1>Comprobante no encontrado</h1></div>;

  return (
    <div style={{padding:40}}>
      <h1>Comprobante válido</h1>
      <p><b>ID:</b> {data.id}</p>
      <p><b>Fecha:</b> {data.fecha}</p>
      <p><b>Cliente:</b> {data.cliente}</p>
      <p><b>Moto:</b> {data.moto}</p>
      <p><b>Monto:</b> RD${data.monto}</p>
      <p><b>Método:</b> {data.metodo}</p>
    </div>
  );
}

function abrirImpresion(titulo, html) {
  const anterior = document.getElementById("print-frame");
  if (anterior) anterior.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "print-frame";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";

  document.body.appendChild(iframe);

  const documento = iframe.contentWindow.document;

  documento.open();
  documento.write(`
    <html>
      <head>
        <title>${titulo}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #333;
            background: white;
          }

          h1, h2 {
            text-align: center;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          td, th {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }

          .firmas td {
            height: 80px;
          }

          .centro {
            text-align: center;
          }

          img {
            max-width: 180px;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `);
  documento.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 800);
}

function Dashboard() {
  const [tab,setTab]=useState("inicio");
  const [clientes,setClientes]=useState([]);
  const [motos,setMotos]=useState([]);
  const [pagos,setPagos]=useState([]);
  const [gastos,setGastos]=useState([]);
  const [ultimo,setUltimo]=useState(null);

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
    fecha:new Date().toISOString().slice(0,10),
    categoria:"Reparación",
    monto:"",
    proveedor:"",
    nota:""
  });

  const [editCliente,setEditCliente]=useState(null);
  const [editMoto,setEditMoto]=useState(null);
  const [editGasto,setEditGasto]=useState(null);

  async function cargar(){
    const c = await getDocs(collection(db,"clientes"));
    const m = await getDocs(collection(db,"motos"));
    const p = await getDocs(collection(db,"pagos"));
    const g = await getDocs(collection(db,"gastos"));

    setClientes(c.docs.map(d=>({id:d.id,...d.data()})));
    setMotos(m.docs.map(d=>({id:d.id,...d.data()})));
    setPagos(p.docs.map(d=>({id:d.id,...d.data()})));
    setGastos(g.docs.map(d=>({id:d.id,...d.data()})));
  }

  useEffect(()=>{ cargar(); },[]);

  const totalIngresos = pagos.reduce((s,p)=>s+Number(p.monto || 0),0);
  const totalGastos = gastos.reduce((s,g)=>s+Number(g.monto || 0),0);
  const neto = totalIngresos - totalGastos;

  async function guardarCliente(){
    if(!cliente.nombre){
      alert("El nombre del cliente es obligatorio");
      return;
    }

    if(editCliente){
      await updateDoc(doc(db,"clientes",editCliente),cliente);
      setEditCliente(null);
    } else {
      await addDoc(collection(db,"clientes"),cliente);
    }

    setCliente({
      nombre:"",
      cedula:"",
      telefono:"",
      direccion:"",
      referencia:"",
      riesgo:"Nuevo cliente"
    });

    cargar();
  }

  function editarCliente(c){
    setCliente({
      nombre:c.nombre || "",
      cedula:c.cedula || "",
      telefono:c.telefono || "",
      direccion:c.direccion || "",
      referencia:c.referencia || "",
      riesgo:c.riesgo || "Nuevo cliente"
    });
    setEditCliente(c.id);
    setTab("clientes");
  }

  async function eliminarCliente(id){
    if(confirm("¿Eliminar este cliente? Las motos asignadas quedarán sin cliente.")){
      await deleteDoc(doc(db,"clientes",id));

      const motosAsignadas = motos.filter(m=>m.clienteId===id);
      for(const m of motosAsignadas){
        await updateDoc(doc(db,"motos",m.id),{...m,clienteId:""});
      }

      cargar();
    }
  }

  async function guardarMoto(){
    if(!moto.placa){
      alert("La placa de la moto es obligatoria");
      return;
    }

    const datosMoto = {
      ...moto,
      estado: moto.clienteId ? "Alquilada" : "Disponible"
    };

    if(editMoto){
      await updateDoc(doc(db,"motos",editMoto),datosMoto);
      setEditMoto(null);
    } else {
      await addDoc(collection(db,"motos"),datosMoto);
    }

    setMoto({
      placa:"",
      marca:"",
      modelo:"",
      anio:"",
      tracker:"",
      clienteId:"",
      pagoDiario:"400",
      deposito:"5000"
    });

    cargar();
  }

  function editarMoto(m){
    setMoto({
      placa:m.placa || "",
      marca:m.marca || "",
      modelo:m.modelo || "",
      anio:m.anio || "",
      tracker:m.tracker || "",
      clienteId:m.clienteId || "",
      pagoDiario:m.pagoDiario || "400",
      deposito:m.deposito || "5000"
    });
    setEditMoto(m.id);
    setTab("motos");
  }

  async function eliminarMoto(id){
    if(confirm("¿Eliminar esta moto del inventario?")){
      await deleteDoc(doc(db,"motos",id));
      cargar();
    }
  }

  function generarID(){
    const fecha = new Date();
    const ym = fecha.toISOString().slice(0,7).replace("-","");
    const seq = String(pagos.length+1).padStart(2,"0");
    return `${ym}-${seq}`;
  }

  async function registrarPago(){
    const motoSeleccionada = motos.find(m=>m.id===pago.motoId);

    if(!motoSeleccionada){
      alert("Selecciona una moto");
      return;
    }

    const clienteSeleccionado = clientes.find(c=>c.id===motoSeleccionada.clienteId);
    const id = generarID();

    const comprobante = {
      id,
      fecha: new Date().toISOString().slice(0,10),
      clienteId: clienteSeleccionado?.id || "",
      cliente: clienteSeleccionado?.nombre || "",
      motoId: motoSeleccionada.id,
      moto: `${motoSeleccionada.placa} ${motoSeleccionada.marca || ""} ${motoSeleccionada.modelo || ""}`,
      monto: pago.monto,
      metodo: pago.metodo,
      url: `${BASE_URL}/validar/${id}`
    };

    await addDoc(collection(db,"pagos"), comprobante);
    setUltimo(comprobante);
    setPago({motoId:"", monto:"400", metodo:"Efectivo"});
    cargar();
  }

  async function guardarGasto(){
    if(!gasto.motoId){
      alert("Selecciona una moto");
      return;
    }

    if(!gasto.monto){
      alert("El monto es obligatorio");
      return;
    }

    if(editGasto){
      await updateDoc(doc(db,"gastos",editGasto),gasto);
      setEditGasto(null);
    } else {
      await addDoc(collection(db,"gastos"),gasto);
    }

    setGasto({
      motoId:"",
      fecha:new Date().toISOString().slice(0,10),
      categoria:"Reparación",
      monto:"",
      proveedor:"",
      nota:""
    });

    cargar();
  }

  function editarGasto(g){
    setGasto({
      motoId:g.motoId || "",
      fecha:g.fecha || new Date().toISOString().slice(0,10),
      categoria:g.categoria || "Reparación",
      monto:g.monto || "",
      proveedor:g.proveedor || "",
      nota:g.nota || ""
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

  function gastosPorMoto(motoId){
    return gastos
      .filter(g=>g.motoId===motoId)
      .reduce((s,g)=>s+Number(g.monto || 0),0);
  }

  function ingresosPorMoto(motoId){
    return pagos
      .filter(p=>p.motoId===motoId)
      .reduce((s,p)=>s+Number(p.monto || 0),0);
  }

  function imprimirContrato(m){
    const c = clientes.find(x=>x.id===m.clienteId);

    if(!c){
      alert("Esta moto no tiene cliente asignado");
      return;
    }

    const html = `
      <h1>${empresa.nombre}</h1>
      <p class="centro">${empresa.telefono} · ${empresa.direccion}</p>
      <h2>CONTRATO DE ALQUILER DE MOTOCICLETA</h2>

      <p><b>Fecha:</b> ${new Date().toISOString().slice(0,10)}</p>
      <p><b>Arrendador:</b> ${empresa.nombre} · RNC/Cédula: ${empresa.rnc || "N/A"}</p>
      <p><b>Arrendatario:</b> ${c.nombre} · Cédula: ${c.cedula} · Teléfono: ${c.telefono}</p>
      <p><b>Dirección del cliente:</b> ${c.direccion}</p>

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
          <td>${m.tracker || "N/A"}</td>
          <td>RD$${m.pagoDiario}</td>
          <td>RD$${m.deposito}</td>
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

      <p>${empresa.notas || ""}</p>

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

    abrirImpresion("Contrato " + m.placa, html);
  }

  function imprimirComprobante(p){
    const html = `
      <h1>${empresa.nombre}</h1>
      <p class="centro">${empresa.telefono} · ${empresa.direccion}</p>
      <h2>COMPROBANTE DE PAGO</h2>

      <table>
        <tr><th>ID Comprobante</th><td>${p.id}</td></tr>
        <tr><th>Fecha</th><td>${p.fecha}</td></tr>
        <tr><th>ID Cliente</th><td>${p.clienteId}</td></tr>
        <tr><th>Cliente</th><td>${p.cliente}</td></tr>
        <tr><th>Moto</th><td>${p.moto}</td></tr>
        <tr><th>Monto Pagado</th><td>RD$${p.monto}</td></tr>
        <tr><th>Método</th><td>${p.metodo}</td></tr>
        <tr><th>Validación</th><td>${p.url}</td></tr>
      </table>

      <div class="centro" style="margin-top:20px">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(p.url)}" />
        <p>Código QR de validación</p>
      </div>
    `;

    abrirImpresion("Comprobante " + p.id, html);
  }

  return (
    <div style={{padding:40}}>
      <h1>Pronto Moto Control</h1>

      <button onClick={cargar}>Actualizar</button>
      <button onClick={()=>signOut(auth)}>Salir</button>

      <div style={{marginTop:20}}>
        <button onClick={()=>setTab("inicio")}>Inicio</button>
        <button onClick={()=>setTab("clientes")}>Clientes</button>
        <button onClick={()=>setTab("motos")}>Motos</button>
        <button onClick={()=>setTab("pagos")}>Pagos</button>
        <button onClick={()=>setTab("gastos")}>Gastos</button>
        <button onClick={()=>setTab("empresa")}>Empresa</button>
      </div>

      {tab==="inicio" && (
        <div>
          <h2>Resumen financiero</h2>
          <p>Clientes: {clientes.length}</p>
          <p>Motos: {motos.length}</p>
          <p>Pagos: {pagos.length}</p>
          <p>Gastos: {gastos.length}</p>
          <h3>Ingresos: RD${totalIngresos.toLocaleString()}</h3>
          <h3>Gastos: RD${totalGastos.toLocaleString()}</h3>
          <h2>Neto: RD${neto.toLocaleString()}</h2>
        </div>
      )}

      {tab==="empresa" && (
        <div>
          <h2>Datos de empresa</h2>
          <input placeholder="Nombre de empresa" value={empresa.nombre} onChange={e=>setEmpresa({...empresa,nombre:e.target.value})}/>
          <input placeholder="Teléfono" value={empresa.telefono} onChange={e=>setEmpresa({...empresa,telefono:e.target.value})}/>
          <input placeholder="Dirección" value={empresa.direccion} onChange={e=>setEmpresa({...empresa,direccion:e.target.value})}/>
          <input placeholder="RNC / Cédula" value={empresa.rnc} onChange={e=>setEmpresa({...empresa,rnc:e.target.value})}/>
          <input placeholder="Notas adicionales para contrato" value={empresa.notas} onChange={e=>setEmpresa({...empresa,notas:e.target.value})}/>
        </div>
      )}

      {tab==="clientes" && (
        <div>
          <h2>{editCliente ? "Editar cliente" : "Crear cliente"}</h2>

          <input placeholder="Nombre" value={cliente.nombre} onChange={e=>setCliente({...cliente,nombre:e.target.value})}/>
          <input placeholder="Cédula" value={cliente.cedula} onChange={e=>setCliente({...cliente,cedula:e.target.value})}/>
          <input placeholder="Teléfono" value={cliente.telefono} onChange={e=>setCliente({...cliente,telefono:e.target.value})}/>
          <input placeholder="Dirección" value={cliente.direccion} onChange={e=>setCliente({...cliente,direccion:e.target.value})}/>
          <input placeholder="Referencia" value={cliente.referencia} onChange={e=>setCliente({...cliente,referencia:e.target.value})}/>
          <input placeholder="Riesgo" value={cliente.riesgo} onChange={e=>setCliente({...cliente,riesgo:e.target.value})}/>

          <button onClick={guardarCliente}>{editCliente ? "Guardar cambios" : "Crear cliente"}</button>

          {clientes.map(c=>(
            <div key={c.id} style={{border:"1px solid #ddd",padding:10,marginTop:10}}>
              <b>{c.nombre}</b>
              <p>{c.telefono} · {c.cedula}</p>
              <p>{c.direccion}</p>
              <small>ID: {c.id}</small><br/>
              <button onClick={()=>editarCliente(c)}>Editar</button>
              <button onClick={()=>eliminarCliente(c.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}

      {tab==="motos" && (
        <div>
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
            <div key={m.id} style={{border:"1px solid #ddd",padding:10,marginTop:10}}>
              <b>{m.placa}</b>
              <p>{m.marca} {m.modelo} · {m.anio}</p>
              <p>Pago diario: RD${m.pagoDiario}</p>
              <p>Estado: {m.estado || "Disponible"}</p>
              <p>Cliente: {clientes.find(c=>c.id===m.clienteId)?.nombre || "Sin asignar"}</p>
              <p>Ingresos: RD${ingresosPorMoto(m.id).toLocaleString()}</p>
              <p>Gastos: RD${gastosPorMoto(m.id).toLocaleString()}</p>
              <p>Neto moto: RD${(ingresosPorMoto(m.id)-gastosPorMoto(m.id)).toLocaleString()}</p>
              <button onClick={()=>editarMoto(m)}>Editar</button>
              <button onClick={()=>eliminarMoto(m.id)}>Eliminar</button>
              <button onClick={()=>imprimirContrato(m)}>Contrato</button>
            </div>
          ))}
        </div>
      )}

      {tab==="pagos" && (
        <div>
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
            <div style={{marginTop:20,border:"1px solid #ddd",padding:15}}>
              <h2>Comprobante</h2>
              <p><b>ID:</b> {ultimo.id}</p>
              <p><b>Cliente:</b> {ultimo.cliente}</p>
              <p><b>Moto:</b> {ultimo.moto}</p>
              <p><b>Monto:</b> RD${ultimo.monto}</p>
              <QRCodeCanvas value={ultimo.url} />
              <p>{ultimo.url}</p>
              <button onClick={()=>imprimirComprobante(ultimo)}>Imprimir comprobante</button>
            </div>
          )}

          <h2>Historial de pagos</h2>
          {pagos.map(p=>(
            <div key={p.id} style={{border:"1px solid #ddd",padding:10,marginTop:10}}>
              <b>{p.id}</b>
              <p>{p.fecha} · {p.cliente}</p>
              <p>{p.moto} · RD${p.monto}</p>
              <button onClick={()=>imprimirComprobante(p)}>Comprobante</button>
            </div>
          ))}
        </div>
      )}

      {tab==="gastos" && (
        <div>
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
            <div key={g.id} style={{border:"1px solid #ddd",padding:10,marginTop:10}}>
              <b>{g.categoria}</b>
              <p>Fecha: {g.fecha}</p>
              <p>Moto: {motos.find(m=>m.id===g.motoId)?.placa || "N/A"}</p>
              <p>Monto: RD${g.monto}</p>
              <p>Proveedor: {g.proveedor}</p>
              <p>Nota: {g.nota}</p>
              <button onClick={()=>editarGasto(g)}>Editar</button>
              <button onClick={()=>eliminarGasto(g.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App(){
  const [user,setUser]=useState(null);
  const path = window.location.pathname;

  useEffect(()=>onAuthStateChanged(auth,setUser),[]);

  if(path.startsWith("/validar/")){
    return <ValidarComprobante />;
  }

  if(!user) return <Login />;
  return <Dashboard />;
}

createRoot(document.getElementById("root")).render(<App />);