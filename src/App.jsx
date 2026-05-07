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

import {
  onAuthStateChanged,
  updatePassword
} from "firebase/auth";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";

import { auth, db, storage } from "./firebase";

import "./style.css";

import Login from "./components/Login";
import ValidarComprobante from "./components/ValidarComprobante";

import TopBar from "./components/TopBar";
import Sidebar, { MobileTabs } from "./components/Sidebar";

import Inicio from "./components/Inicio";

import Clientes, {
  ClientePerfil
} from "./components/Clientes";

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
import Auditoria from "./components/Auditoria";
import Reportes from "./components/Reportes";
import KPIs from "./components/KPIs";
import CajaDiaria from "./components/CajaDiaria";
import SelectorEmpresa from "./components/SelectorEmpresa";

import {
  EmpresaProvider,
  useEmpresa
} from "./context/EmpresaContext";

import {
  provinciasRD,
  BASE_URL,
  metodosDigitales
} from "./data/constants";

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

import { registrarAuditoria } from "./utils/audit";

function Dashboard({user}){

  const { empresaActual, setEmpresaActual } = useEmpresa();

  const [tab,setTab]=useState("inicio");
  const [menuAbierto,setMenuAbierto]=useState(false);

  const [tema,setTema]=useState(
    localStorage.getItem("tema") || "light"
  );

  const [empresas,setEmpresas]=useState([]);

  const [clientes,setClientes]=useState([]);
  const [motos,setMotos]=useState([]);
  const [pagos,setPagos]=useState([]);
  const [gastos,setGastos]=useState([]);
  const [adjuntos,setAdjuntos]=useState([]);
  const [usuarios,setUsuarios]=useState([]);
  const [notificaciones,setNotificaciones]=useState([]);
  const [pagosDigitales,setPagosDigitales]=useState([]);
  const [auditLogs,setAuditLogs]=useState([]);

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

  const esAdmin =
    !usuarioActual ||
    usuarioActual.rol === "admin";

  const empresaId = empresaActual?.id || "";

  const municipiosDisponibles =
    provinciasRD[cliente.provincia] || [];
    
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

  function filtrarPorEmpresa(lista){
    if(!empresaId) return lista;

    return lista.filter(item=>{
      return item.empresaId === empresaId || !item.empresaId;
    });
  }

  async function cargar(){
    const emp = await getDocs(collection(db,"empresas"));
    const c = await getDocs(collection(db,"clientes"));
    const m = await getDocs(collection(db,"motos"));
    const p = await getDocs(collection(db,"pagos"));
    const g = await getDocs(collection(db,"gastos"));
    const a = await getDocs(collection(db,"adjuntos"));
    const u = await getDocs(collection(db,"usuarios"));
    const n = await getDocs(collection(db,"notificaciones"));
    const pd = await getDocs(collection(db,"pagosDigitales"));
    const al = await getDocs(collection(db,"auditLogs"));

    const empresasData = emp.docs.map(d=>({id:d.id,...d.data()}));
    const usuariosData = u.docs.map(d=>({id:d.id,...d.data()}));

    const perfil = usuariosData.find(x=>x.uid===user.uid || x.correo===user.email) || {
      uid:user.uid,
      nombre:user.email,
      correo:user.email,
      rol:"admin"
    };

    const clientesData = c.docs.map(d=>({id:d.id,...d.data()}));
    const motosData = m.docs.map(d=>({id:d.id,...d.data()}));
    const pagosData = p.docs.map(d=>({docId:d.id,...d.data()}));
    const gastosData = g.docs.map(d=>({id:d.id,...d.data()}));
    const adjuntosData = a.docs.map(d=>({id:d.id,...d.data()}));
    const notificacionesData = n.docs.map(d=>({id:d.id,...d.data()}));
    const pagosDigitalesData = pd.docs.map(d=>({id:d.id,...d.data()}));
    const auditLogsData = al.docs.map(d=>({id:d.id,...d.data()}));

    setEmpresas(empresasData);
    setUsuarioActual(perfil);
    setUsuarios(usuariosData);

    setClientes(filtrarPorEmpresa(clientesData));
    setMotos(filtrarPorEmpresa(motosData));
    setPagos(filtrarPorEmpresa(pagosData));
    setGastos(filtrarPorEmpresa(gastosData));
    setAdjuntos(filtrarPorEmpresa(adjuntosData));
    setNotificaciones(filtrarPorEmpresa(notificacionesData));
    setPagosDigitales(filtrarPorEmpresa(pagosDigitalesData));
    setAuditLogs(filtrarPorEmpresa(auditLogsData));

    if(empresaActual){
      setEmpresa({
        nombre:empresaActual.nombre || "Pronto Moto",
        telefono:empresaActual.telefono || "",
        direccion:empresaActual.direccion || "",
        rnc:empresaActual.rnc || "",
        notas:empresaActual.notas || ""
      });
    }
  }

  useEffect(()=>{
    cargar();
  },[empresaId]);
  
    const clientesVisibles = useMemo(()=>{
    if(esAdmin) return clientes;

    return clientes.filter(c=>
      c.cobradorId===usuarioActual?.uid ||
      c.cobradorId===usuarioActual?.id
    );
  },[clientes,usuarioActual,esAdmin]);

  const motosVisibles = useMemo(()=>{
    if(esAdmin) return motos;

    const idsClientes = new Set(clientesVisibles.map(c=>c.id));

    return motos.filter(m=>idsClientes.has(m.clienteId));
  },[motos,clientesVisibles,esAdmin]);

  const pagosVisibles = useMemo(()=>{
    if(esAdmin) return pagos;

    const idsClientes = new Set(clientesVisibles.map(c=>c.id));

    return pagos.filter(p=>idsClientes.has(p.clienteId));
  },[pagos,clientesVisibles,esAdmin]);

  const totalIngresos = pagosVisibles.reduce(
    (s,p)=>s+Number(p.monto||0),
    0
  );

  const totalGastos = esAdmin
    ? gastos.reduce((s,g)=>s+Number(g.monto||0),0)
    : 0;

  const neto = totalIngresos-totalGastos;

  function ingresosPorMoto(motoId){
    return pagos
      .filter(p=>p.motoId===motoId)
      .reduce((s,p)=>s+Number(p.monto||0),0);
  }

  function gastosPorMoto(motoId){
    return gastos
      .filter(g=>g.motoId===motoId)
      .reduce((s,g)=>s+Number(g.monto||0),0);
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

    const ultimo = ultimoPagoMoto(m.id);
    const fechaBase = ultimo?.fecha || m.fechaAsignacion || today();

    return businessDaysBetween(fechaBase,today());
  }

  function deudaMoto(m){
    const cuotasPendientes = atrasoMoto(m);
    const montoPendiente = cuotasPendientes * Number(m.pagoDiario || 0);

    let estatus = "Al día";

    if(cuotasPendientes >= 3){
      estatus = "Recuperación";
    }else if(cuotasPendientes >= 2){
      estatus = "Riesgo alto";
    }else if(cuotasPendientes >= 1){
      estatus = "Pendiente";
    }

    return {
      cuotasPendientes,
      montoPendiente,
      estatus
    };
  }

  const rankingMotos = [...motosVisibles].sort((a,b)=>{
    const netoA = ingresosPorMoto(a.id)-gastosPorMoto(a.id);
    const netoB = ingresosPorMoto(b.id)-gastosPorMoto(b.id);

    return netoB-netoA;
  });

  const motosMorosas = motosVisibles.filter(m=>
    m.clienteId && atrasoMoto(m)>=1
  );

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

  const clientePago =
    clientesVisibles.find(c=>c.id===clientePagoId) || null;

  const motosClientePago =
    motosVisibles.filter(m=>m.clienteId===clientePagoId);

  const motoPagoSeleccionada =
    motosVisibles.find(m=>m.id===pago.motoId) || null;

  const deudaPagoSeleccionada =
    motoPagoSeleccionada ? deudaMoto(motoPagoSeleccionada) : null;
    
    async function generarIdCliente(pais){
    const code = countryCode(pais);
    const year = currentYear();
    const prefijo = `${code}${year}`;

    const existentes = clientes.filter(c=>
      String(c.idCliente || "").startsWith(prefijo)
    );

    const secuencia = String(existentes.length + 1).padStart(2,"0");

    return `${prefijo}-${secuencia}`;
  }

  async function guardarCliente(){
    if(!esAdmin){
      return alert("Solo el administrador puede crear o editar clientes");
    }

    if(!cliente.nombre){
      return alert("El nombre del cliente es obligatorio");
    }

    const clienteFinal = {
      ...cliente,
      empresaId,
      municipio: cliente.municipio || (provinciasRD[cliente.provincia] || [])[0] || ""
    };

    try{
      if(editCliente){
        await updateDoc(doc(db,"clientes",editCliente),clienteFinal);

        await registrarAuditoria({
          accion:"editar",
          modulo:"clientes",
          descripcion:`Cliente actualizado: ${clienteFinal.nombre}`,
          usuario:usuarioActual,
          extra:{
            empresaId,
            clienteId:editCliente,
            clienteNombre:clienteFinal.nombre
          }
        });

        alert("Cliente actualizado correctamente");
        setEditCliente(null);
      }else{
        const nuevoId = await generarIdCliente(cliente.pais);

        await addDoc(collection(db,"clientes"),{
          ...clienteFinal,
          idCliente:nuevoId
        });

        await registrarAuditoria({
          accion:"crear",
          modulo:"clientes",
          descripcion:`Cliente creado: ${clienteFinal.nombre}`,
          usuario:usuarioActual,
          extra:{
            empresaId,
            clienteNombre:clienteFinal.nombre,
            clientePais:clienteFinal.pais
          }
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
    if(!esAdmin){
      return alert("Solo el administrador puede editar clientes");
    }

    setCliente({
      idCliente:c.idCliente || "",
      pais:c.pais || "República Dominicana",
      nacionalidad:c.nacionalidad || "Dominicana",
      provincia:c.provincia || "Distrito Nacional",
      municipio:c.municipio || "Santo Domingo de Guzmán",
      sexo:c.sexo || "Masculino",
      nombre:c.nombre || "",
      cedula:c.cedula || "",
      correo:c.correo || "",
      telefono:c.telefono || "",
      telefonoResidencial:c.telefonoResidencial || "",
      telefonoReferencia:c.telefonoReferencia || "",
      direccion:c.direccion || "",
      referencia:c.referencia || "",
      riesgo:c.riesgo || "Nuevo cliente",
      cobradorId:c.cobradorId || "",
      ubicacion:c.ubicacion || null
    });

    setEditCliente(c.id);
    setTab("clientes");
  }

  async function eliminarCliente(id){
    if(!esAdmin){
      return alert("Solo el administrador puede eliminar clientes");
    }

    const confirmar = confirm(
      "¿Seguro que deseas eliminar este cliente? Las motos asignadas quedarán sin cliente."
    );

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

      await registrarAuditoria({
        accion:"eliminar",
        modulo:"clientes",
        descripcion:"Cliente eliminado",
        usuario:usuarioActual,
        extra:{
          empresaId,
          clienteId:id
        }
      });

      alert("Cliente eliminado correctamente");
      cargar();
    }catch(e){
      alert("No se pudo eliminar el cliente");
      console.log(e);
    }
  }

  async function capturarUbicacionCliente(){
    try{
      const ubicacion = await getLocation();
      setCliente({...cliente,ubicacion});
      alert("Ubicación capturada correctamente");
    }catch(e){
      alert("No se pudo capturar la ubicación: " + e.message);
    }
  }
  
    async function guardarMoto(){
    if(!esAdmin){
      return alert("Solo el administrador puede crear o editar motos");
    }

    if(!moto.placa){
      return alert("La placa es obligatoria");
    }

    const datos = {
      ...moto,
      empresaId,
      estado:moto.clienteId ? "Alquilada" : "Disponible",
      fechaAsignacion:moto.clienteId ? (moto.fechaAsignacion || today()) : ""
    };

    try{
      if(editMoto){
        await updateDoc(doc(db,"motos",editMoto),datos);

        await registrarAuditoria({
          accion:"editar",
          modulo:"motos",
          descripcion:`Moto actualizada: ${datos.placa}`,
          usuario:usuarioActual,
          extra:{
            empresaId,
            motoId:editMoto,
            placa:datos.placa
          }
        });

        alert("Moto actualizada correctamente");
        setEditMoto(null);
      }else{
        await addDoc(collection(db,"motos"),datos);

        await registrarAuditoria({
          accion:"crear",
          modulo:"motos",
          descripcion:`Moto creada: ${datos.placa}`,
          usuario:usuarioActual,
          extra:{
            empresaId,
            placa:datos.placa,
            clienteId:datos.clienteId || ""
          }
        });

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
    if(!esAdmin){
      return alert("Solo el administrador puede editar motos");
    }

    setMoto({
      placa:m.placa || "",
      marca:m.marca || "",
      modelo:m.modelo || "",
      anio:m.anio || "",
      tracker:m.tracker || "",
      clienteId:m.clienteId || "",
      fechaAsignacion:m.fechaAsignacion || today(),
      pagoDiario:m.pagoDiario || "400",
      deposito:m.deposito || "5000"
    });

    setEditMoto(m.id);
    setTab("motos");
  }

  async function eliminarMoto(id){
    if(!esAdmin){
      return alert("Solo el administrador puede eliminar motos");
    }

    const confirmar = confirm("¿Seguro que deseas eliminar esta moto?");
    if(!confirmar) return;

    try{
      await deleteDoc(doc(db,"motos",id));

      await registrarAuditoria({
        accion:"eliminar",
        modulo:"motos",
        descripcion:"Moto eliminada",
        usuario:usuarioActual,
        extra:{
          empresaId,
          motoId:id
        }
      });

      alert("Moto eliminada correctamente");
      cargar();
    }catch(e){
      alert("No se pudo eliminar la moto");
      console.log(e);
    }
  }