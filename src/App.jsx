import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc
} from "firebase/firestore";
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

const provinciasRD = {
  "Distrito Nacional": ["Santo Domingo de Guzmán"],
  "Santo Domingo": [
    "Santo Domingo Este",
    "Santo Domingo Norte",
    "Santo Domingo Oeste",
    "Boca Chica",
    "Los Alcarrizos",
    "Pedro Brand",
    "San Antonio de Guerra"
  ],
  "Santiago": [
    "Santiago de los Caballeros",
    "Bisonó",
    "Jánico",
    "Licey al Medio",
    "Puñal",
    "Sabana Iglesia",
    "San José de las Matas",
    "Tamboril",
    "Villa González"
  ],
  "La Vega": ["La Vega", "Constanza", "Jarabacoa", "Jima Abajo"],
  "San Cristóbal": [
    "San Cristóbal",
    "Bajos de Haina",
    "Cambita Garabitos",
    "Los Cacaos",
    "Sabana Grande de Palenque",
    "San Gregorio de Nigua",
    "Villa Altagracia",
    "Yaguate"
  ],
  "Puerto Plata": [
    "Puerto Plata",
    "Altamira",
    "Guananico",
    "Imbert",
    "Los Hidalgos",
    "Luperón",
    "Sosúa",
    "Villa Isabela",
    "Villa Montellano"
  ],
  "San Pedro de Macorís": [
    "San Pedro de Macorís",
    "Consuelo",
    "Guayacanes",
    "Quisqueya",
    "Ramón Santana",
    "San José de los Llanos"
  ],
  "La Romana": ["La Romana", "Guaymate", "Villa Hermosa"],
  "La Altagracia": ["Higüey", "San Rafael del Yuma"],
  "Duarte": [
    "San Francisco de Macorís",
    "Arenoso",
    "Castillo",
    "Eugenio María de Hostos",
    "Las Guáranas",
    "Pimentel",
    "Villa Riva"
  ],
  "Espaillat": ["Moca", "Cayetano Germosén", "Gaspar Hernández", "Jamao al Norte"],
  "Peravia": ["Baní", "Nizao"],
  "Azua": [
    "Azua de Compostela",
    "Estebanía",
    "Guayabal",
    "Las Charcas",
    "Las Yayas de Viajama",
    "Padre Las Casas",
    "Peralta",
    "Pueblo Viejo",
    "Sabana Yegua",
    "Tábara Arriba"
  ],
  "Barahona": [
    "Barahona",
    "Cabral",
    "El Peñón",
    "Enriquillo",
    "Fundación",
    "Jaquimeyes",
    "La Ciénaga",
    "Las Salinas",
    "Paraíso",
    "Polo",
    "Vicente Noble"
  ],
  "San Juan": [
    "San Juan de la Maguana",
    "Bohechío",
    "El Cercado",
    "Juan de Herrera",
    "Las Matas de Farfán",
    "Vallejuelo"
  ],
  "Monseñor Nouel": ["Bonao", "Maimón", "Piedra Blanca"],
  "Monte Plata": [
    "Monte Plata",
    "Bayaguana",
    "Peralvillo",
    "Sabana Grande de Boyá",
    "Yamasá"
  ],
  "Hermanas Mirabal": ["Salcedo", "Tenares", "Villa Tapia"],
  "María Trinidad Sánchez": ["Nagua", "Cabrera", "El Factor", "Río San Juan"],
  "Samaná": ["Samaná", "Las Terrenas", "Sánchez"],
  "Hato Mayor": ["Hato Mayor del Rey", "El Valle", "Sabana de la Mar"],
  "El Seibo": ["El Seibo", "Miches"],
  "Monte Cristi": [
    "Monte Cristi",
    "Castañuela",
    "Guayubín",
    "Las Matas de Santa Cruz",
    "Pepillo Salcedo",
    "Villa Vásquez"
  ],
  "Valverde": ["Mao", "Esperanza", "Laguna Salada"],
  "Dajabón": ["Dajabón", "El Pino", "Loma de Cabrera", "Partido", "Restauración"],
  "Santiago Rodríguez": ["San Ignacio de Sabaneta", "Los Almácigos", "Monción"],
  "Elías Piña": [
    "Comendador",
    "Bánica",
    "El Llano",
    "Hondo Valle",
    "Juan Santiago",
    "Pedro Santana"
  ],
  "Independencia": [
    "Jimaní",
    "Cristóbal",
    "Duvergé",
    "La Descubierta",
    "Mella",
    "Postrer Río"
  ],
  "Bahoruco": ["Neiba", "Galván", "Los Ríos", "Tamayo", "Villa Jaragua"],
  "Pedernales": ["Pedernales", "Oviedo"],
  "Sánchez Ramírez": ["Cotuí", "Cevicos", "Fantino", "La Mata"]
};

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