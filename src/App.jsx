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