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