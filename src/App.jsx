import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { onAuthStateChanged, updatePassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

import { auth, db, storage } from "./firebase";

import "./style.css";

import Login from "./components/Login";
import ValidarComprobante from "./components/ValidarComprobante";
import TopBar from "./components/TopBar";
import Sidebar, { MobileTabs } from "./components/Sidebar";
import Inicio from "./components/Inicio";
import Clientes, { ClientePerfil } from "./components/Clientes";
import Motos from "./components/Motos";
import Pagos from "./components/Pagos";
import Gastos from "./components/Gastos";
import Morosidad from "./components/Morosidad";
import Ranking from "./components/Ranking";
import Adjuntos from "./components/Adjuntos";
import Configuracion from "./components/Configuracion";
import Empresa from "./components/Empresa";
import PagosDigitales from "./components/PagosDigitales";
import Notificaciones from "./components/Notificaciones";

import { provinciasRD, BASE_URL, metodosDigitales } from "./data/constants";

import {
  money,
  today,
  nowDateTime,
  currentYear,
  receiptId,
  countryCode,
  businessDaysBetween,
  getLocation
} from "./utils/helpers";

import {
  abrirImpresion,
  comprobanteHtml
} from "./utils/print";

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

    return { cuotasPendientes, montoPendiente, estatus };
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
        c.idCliente,c.nombre,c.cedula,c.telefono,c.telefonoResidencial,
        c.telefonoReferencia,c.correo,c.pais,c.nacionalidad,c.provincia,
        c.municipio,c.sexo
      ].join(" ").toLowerCase();

      return texto.includes(q);
    });
  },[clientesVisibles,busquedaCliente]);

  const clientesPagoFiltrados = useMemo(()=>{
    const q = busquedaClientePago.toLowerCase().trim();
    if(!q) return clientesVisibles;

    return clientesVisibles.filter(c=>{
      const texto = [
        c.idCliente,c.nombre,c.cedula,c.telefono,c.telefonoResidencial,
        c.telefonoReferencia,c.correo,c.pais,c.nacionalidad,c.provincia,
        c.municipio,c.sexo
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
      estado:moto.clienteId ? "Alquilada" : "Disponible",
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
      }catch(e){
        console.log("No se pudo guardar notificación:", e);
      }

      try{
        if(metodosDigitales.includes(pago.metodo)){
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
        console.log("No se pudo registrar pago digital:", e);
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

  function imprimirComprobante(p,tipo="normal"){
    abrirImpresion("Comprobante "+p.id,comprobanteHtml(p,empresa,tipo),tipo);
  }
  
    async function guardarGasto(){
    if(!esAdmin) return alert("Solo el administrador puede registrar gastos");
    if(!gasto.motoId) return alert("Selecciona una moto");
    if(!gasto.monto) return alert("El monto es obligatorio");

    try{
      if(editGasto){
        await updateDoc(doc(db,"gastos",editGasto),gasto);
        alert("Gasto actualizado correctamente");
        setEditGasto(null);
      }else{
        await addDoc(collection(db,"gastos"),gasto);
        alert("Gasto registrado correctamente");
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
    }catch(e){
      alert("No se pudo guardar el gasto");
      console.log(e);
    }
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

    const confirmar = confirm("¿Seguro que deseas eliminar este gasto?");
    if(!confirmar) return;

    try{
      await deleteDoc(doc(db,"gastos",id));
      alert("Gasto eliminado correctamente");
      cargar();
    }catch(e){
      alert("No se pudo eliminar el gasto");
      console.log(e);
    }
  }

  async function subirAdjunto(){
    if(!esAdmin) return alert("Solo el administrador puede subir adjuntos");
    if(!clienteAdjunto) return alert("Selecciona un cliente");
    if(!archivo) return alert("Selecciona un archivo");

    const ruta=`clientes/${clienteAdjunto}/${Date.now()}-${archivo.name}`;
    const archivoRef=ref(storage,ruta);

    try{
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
      alert("Adjunto subido correctamente");
      cargar();
    }catch(e){
      alert("No se pudo subir el adjunto");
      console.log(e);
    }
  }

  async function eliminarAdjunto(a){
    if(!esAdmin) return alert("Solo el administrador puede eliminar adjuntos");

    const confirmar = confirm("¿Seguro que deseas eliminar este adjunto?");
    if(!confirmar) return;

    try{
      await deleteObject(ref(storage,a.ruta));
      await deleteDoc(doc(db,"adjuntos",a.id));
      alert("Adjunto eliminado correctamente");
      cargar();
    }catch(e){
      alert("No se pudo eliminar el adjunto");
      console.log(e);
    }
  }
  
    async function guardarUsuario(){
    if(!esAdmin) return alert("Solo el administrador puede gestionar usuarios");

    if(!usuarioForm.uid || !usuarioForm.correo){
      return alert("Debes colocar UID y correo del usuario creado en Firebase Authentication");
    }

    try{
      await setDoc(doc(db,"usuarios",usuarioForm.uid),usuarioForm);

      setUsuarioForm({
        uid:"",
        nombre:"",
        correo:"",
        rol:"cobrador"
      });

      alert("Usuario guardado correctamente");
      cargar();
    }catch(e){
      alert("No se pudo guardar el usuario");
      console.log(e);
    }
  }

  async function cambiarPassword(){
    if(!nuevaPassword || nuevaPassword.length < 6){
      return alert("La contraseña debe tener al menos 6 caracteres");
    }

    try{
      await updatePassword(auth.currentUser,nuevaPassword);
      setNuevaPassword("");
      alert("Contraseña actualizada");
    }catch(e){
      alert("No se pudo cambiar la contraseña. Vuelve a iniciar sesión e intenta otra vez.");
      console.log(e);
    }
  }

  async function marcarNotificacionLeida(n){
    try{
      await updateDoc(doc(db,"notificaciones",n.id),{
        ...n,
        leida:true
      });

      cargar();
    }catch(e){
      console.log("No se pudo marcar la notificación:", e);
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

    if(!c){
      return alert("Esta moto no tiene cliente asignado");
    }

    const html=`
      <div class="premiumPdf">

        <div class="pdfHeader">
          <div class="pdfLogoArea">
            <img class="printLogo" src="${BASE_URL}/logo.png" />
          </div>

          <div class="pdfCompany">
            <h1>${empresa.nombre}</h1>
            <p>${empresa.telefono || ""}</p>
            <p>${empresa.direccion || ""}</p>
            <p>RNC/Cédula: ${empresa.rnc || "N/A"}</p>
          </div>
        </div>

        <div class="pdfTitle">
          CONTRATO DE ALQUILER DE MOTOCICLETA
        </div>

        <div class="pdfGrid">
          <div class="infoBlock">
            <span class="label">Fecha</span>
            <span class="value">${today()}</span>
          </div>

          <div class="infoBlock">
            <span class="label">Arrendador</span>
            <span class="value">${empresa.nombre}</span>
          </div>

          <div class="infoBlock">
            <span class="label">Cliente</span>
            <span class="value">${c.nombre}</span>
          </div>

          <div class="infoBlock">
            <span class="label">ID cliente</span>
            <span class="value">${c.idCliente || c.id}</span>
          </div>

          <div class="infoBlock">
            <span class="label">Cédula / Pasaporte</span>
            <span class="value">${c.cedula || ""}</span>
          </div>

          <div class="infoBlock">
            <span class="label">Teléfono</span>
            <span class="value">${c.telefono || ""}</span>
          </div>

          <div class="infoBlock">
            <span class="label">Dirección</span>
            <span class="value">${c.direccion || ""}</span>
          </div>

          <div class="infoBlock">
            <span class="label">Motocicleta</span>
            <span class="value">${m.placa} · ${m.marca || ""} ${m.modelo || ""}</span>
          </div>

          <div class="infoBlock">
            <span class="label">Año</span>
            <span class="value">${m.anio || ""}</span>
          </div>

          <div class="infoBlock">
            <span class="label">Tracker / GPS</span>
            <span class="value">${m.tracker || "N/A"}</span>
          </div>

          <div class="infoBlock amountBlock">
            <span class="label">Pago diario</span>
            <span class="amount">${money(m.pagoDiario)}</span>
          </div>

          <div class="infoBlock amountBlock">
            <span class="label">Depósito</span>
            <span class="amount">${money(m.deposito)}</span>
          </div>
        </div>

        <div style="margin-top:35px;font-size:15px;line-height:1.7;">
          <h3>Condiciones principales</h3>

          <ol>
            <li>El pago es diario, exceptuando los domingos.</li>
            <li>Al acumular tres cuotas vencidas, el contrato podrá ser cancelado.</li>
            <li>El arrendador podrá recuperar la motocicleta por las vías legales correspondientes.</li>
            <li>El arrendatario asume multas, accidentes, daños, uso indebido y cualquier responsabilidad derivada del uso de la motocicleta.</li>
            <li>Queda prohibido prestar, ceder, subarrendar o usar la motocicleta en actividades ilícitas.</li>
          </ol>

          <p>${empresa.notas || ""}</p>
        </div>

        <div class="signatureArea">
          <div class="signatureBox">
            <div class="line"></div>
            <p>Firma arrendador</p>
          </div>

          <div class="signatureBox">
            <div class="line"></div>
            <p>Firma arrendatario</p>
          </div>
        </div>

        <div class="pdfFooter">
          <p>Documento generado automáticamente por ${empresa.nombre}</p>
        </div>
      </div>
    `;

    abrirImpresion("Contrato "+m.placa,html,"normal");
  }
  
    return (
    <div className="premiumShell">
      <TopBar
        user={user}
        usuarioActual={usuarioActual}
        tema={tema}
        toggleTema={toggleTema}
        cargar={cargar}
        setTab={setTab}
        menuAbierto={menuAbierto}
        setMenuAbierto={setMenuAbierto}
        esAdmin={esAdmin}
      />

      <div className="premiumLayout">
        <Sidebar tab={tab} setTab={setTab} esAdmin={esAdmin}/>

        <main className="mainPanel">
          <MobileTabs tab={tab} setTab={setTab} esAdmin={esAdmin}/>

          {tab==="inicio" && (
            <Inicio
              esAdmin={esAdmin}
              totalIngresos={totalIngresos}
              totalGastos={totalGastos}
              neto={neto}
              motosVisibles={motosVisibles}
              clientesVisibles={clientesVisibles}
              motosMorosas={motosMorosas}
              pagosVisibles={pagosVisibles}
              clientes={clientes}
              deudaMoto={deudaMoto}
            />
          )}

          {tab==="clientes" && (
            <>
              <Clientes
                esAdmin={esAdmin}
                cliente={cliente}
                setCliente={setCliente}
                editCliente={editCliente}
                usuarios={usuarios}
                clientesFiltrados={clientesFiltrados}
                busquedaCliente={busquedaCliente}
                setBusquedaCliente={setBusquedaCliente}
                municipiosDisponibles={municipiosDisponibles}
                guardarCliente={guardarCliente}
                capturarUbicacionCliente={capturarUbicacionCliente}
                editarCliente={editarCliente}
                eliminarCliente={eliminarCliente}
                setClienteVista={setClienteVista}
              />

              <ClientePerfil
                clienteVista={clienteVista}
                setClienteVista={setClienteVista}
                motos={motos}
                pagos={pagos}
                adjuntos={adjuntos}
              />
            </>
          )}

          {tab==="motos" && (
            <Motos
              esAdmin={esAdmin}
              moto={moto}
              setMoto={setMoto}
              editMoto={editMoto}
              clientes={clientes}
              motosVisibles={motosVisibles}
              guardarMoto={guardarMoto}
              editarMoto={editarMoto}
              eliminarMoto={eliminarMoto}
              imprimirContrato={imprimirContrato}
              deudaMoto={deudaMoto}
              ingresosPorMoto={ingresosPorMoto}
              gastosPorMoto={gastosPorMoto}
            />
          )}

          {tab==="pagos" && (
            <Pagos
              esAdmin={esAdmin}
              pago={pago}
              setPago={setPago}
              clientePagoId={clientePagoId}
              setClientePagoId={setClientePagoId}
              busquedaClientePago={busquedaClientePago}
              setBusquedaClientePago={setBusquedaClientePago}
              clientesPagoFiltrados={clientesPagoFiltrados}
              clientePago={clientePago}
              motosClientePago={motosClientePago}
              motoPagoSeleccionada={motoPagoSeleccionada}
              deudaPagoSeleccionada={deudaPagoSeleccionada}
              papelComprobante={papelComprobante}
              setPapelComprobante={setPapelComprobante}
              registrarPago={registrarPago}
              ultimo={ultimo}
              clientes={clientes}
              pagosVisibles={pagosVisibles}
              imprimirComprobante={imprimirComprobante}
              eliminarPago={eliminarPago}
              mensajeWhatsAppPago={mensajeWhatsAppPago}
            />
          )}

          {tab==="gastos" && (
            <Gastos
              esAdmin={esAdmin}
              gasto={gasto}
              setGasto={setGasto}
              editGasto={editGasto}
              motos={motos}
              gastos={gastos}
              guardarGasto={guardarGasto}
              editarGasto={editarGasto}
              eliminarGasto={eliminarGasto}
            />
          )}

          {tab==="morosidad" && (
            <Morosidad
              motosMorosas={motosMorosas}
              clientes={clientes}
              deudaMoto={deudaMoto}
              mensajeWhatsAppMora={mensajeWhatsAppMora}
            />
          )}

          {tab==="ranking" && (
            <Ranking
              rankingMotos={rankingMotos}
              ingresosPorMoto={ingresosPorMoto}
              gastosPorMoto={gastosPorMoto}
            />
          )}

          {tab==="adjuntos" && (
            <Adjuntos
              esAdmin={esAdmin}
              clienteAdjunto={clienteAdjunto}
              setClienteAdjunto={setClienteAdjunto}
              archivo={archivo}
              setArchivo={setArchivo}
              clientes={clientes}
              adjuntos={adjuntos}
              subirAdjunto={subirAdjunto}
              eliminarAdjunto={eliminarAdjunto}
            />
          )}

          {tab==="configuracion" && (
            <Configuracion
              esAdmin={esAdmin}
              nuevaPassword={nuevaPassword}
              setNuevaPassword={setNuevaPassword}
              cambiarPassword={cambiarPassword}
              usuarioForm={usuarioForm}
              setUsuarioForm={setUsuarioForm}
              guardarUsuario={guardarUsuario}
              usuarios={usuarios}
            />
          )}

          {tab==="empresa" && (
            <Empresa
              esAdmin={esAdmin}
              empresa={empresa}
              setEmpresa={setEmpresa}
            />
          )}

          {tab==="pagosDigitales" && (
            <PagosDigitales
              esAdmin={esAdmin}
              pagosDigitales={pagosDigitales}
            />
          )}

          {tab==="notificaciones" && (
            <Notificaciones
              esAdmin={esAdmin}
              notificaciones={notificaciones}
              marcarNotificacionLeida={marcarNotificacionLeida}
            />
          )}
        </main>
      </div>
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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(() => console.log("Service Worker registrado"))
      .catch(err => console.log("Error SW:", err));
  });
}