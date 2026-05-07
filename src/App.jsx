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

