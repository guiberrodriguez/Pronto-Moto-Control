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
import Auditoria from "./components/Auditoria";
import Reportes from "./components/Reportes";
import KPIs from "./components/KPIs";
import CajaDiaria from "./components/CajaDiaria";
import SelectorEmpresa from "./components/SelectorEmpresa";

import { EmpresaProvider, useEmpresa } from "./context/EmpresaContext";

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

import { registrarAuditoria } from "./utils/audit";

function Dashboard({user}){
  const { empresaActual, setEmpresaActual } = useEmpresa();

  const [tab,setTab]=useState("inicio");
  const [menuAbierto,setMenuAbierto]=useState(false);
  const [tema,setTema]=useState(localStorage.getItem("tema") || "light");

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

  const esAdmin = !usuarioActual || usuarioActual.rol === "admin";
  const empresaId = empresaActual?.id || "";
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

  function filtrarPorEmpresa(lista){
    if(!empresaId) return lista;

    return lista.filter(item=>{
      return item.empresaId === empresaId || !item.empresaId;
    });
  }

  async function cargar(){
    const emp=await getDocs(collection(db,"empresas"));
    const c=await getDocs(collection(db,"clientes"));
    const m=await getDocs(collection(db,"motos"));
    const p=await getDocs(collection(db,"pagos"));
    const g=await getDocs(collection(db,"gastos"));
    const a=await getDocs(collection(db,"adjuntos"));
    const u=await getDocs(collection(db,"usuarios"));
    const n=await getDocs(collection(db,"notificaciones"));
    const pd=await getDocs(collection(db,"pagosDigitales"));
    const al=await getDocs(collection(db,"auditLogs"));

    const empresasData=emp.docs.map(d=>({id:d.id,...d.data()}));
    const usuariosData=u.docs.map(d=>({id:d.id,...d.data()}));

    const perfil=usuariosData.find(x=>x.uid===user.uid || x.correo===user.email) || {
      uid:user.uid,
      nombre:user.email,
      correo:user.email,
      rol:"admin"
    };

    const clientesData=c.docs.map(d=>({id:d.id,...d.data()}));
    const motosData=m.docs.map(d=>({id:d.id,...d.data()}));
    const pagosData=p.docs.map(d=>({docId:d.id,...d.data()}));
    const gastosData=g.docs.map(d=>({id:d.id,...d.data()}));
    const adjuntosData=a.docs.map(d=>({id:d.id,...d.data()}));
    const notificacionesData=n.docs.map(d=>({id:d.id,...d.data()}));
    const pagosDigitalesData=pd.docs.map(d=>({id:d.id,...d.data()}));
    const auditLogsData=al.docs.map(d=>({id:d.id,...d.data()}));

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