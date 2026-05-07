import { FileSearch } from "lucide-react";
import React from "react";
import {
  Home,
  Users,
  Bike,
  CreditCard,
  Wallet,
  AlertTriangle,
  Trophy,
  Paperclip,
  Building2,
  ShieldCheck
} from "lucide-react";

export const navItems = [
  {id:"inicio", label:"Inicio", icon:Home, admin:false},
  {id:"clientes", label:"Clientes", icon:Users, admin:false},
  {id:"motos", label:"Motos", icon:Bike, admin:false},
  {id:"pagos", label:"Pagos", icon:CreditCard, admin:false},
  {id:"gastos", label:"Gastos", icon:Wallet, admin:true},
  {id:"morosidad", label:"Morosidad", icon:AlertTriangle, admin:false},
  {id:"ranking", label:"Ranking", icon:Trophy, admin:false},
  {id:"adjuntos", label:"Adjuntos", icon:Paperclip, admin:true},
  {id:"pagosDigitales", label:"Pagos digitales", icon:ShieldCheck, admin:true},
  {id:"empresa", label:"Empresa", icon:Building2, admin:true}
];

export default function Sidebar({tab,setTab,esAdmin}){
  return (
    <aside className="sideNav">
      {navItems.filter(item=>!item.admin || esAdmin).map(item=>{
        const Icon=item.icon;

        return (
          <button
            key={item.id}
            className={tab===item.id ? "sideNavBtn active" : "sideNavBtn"}
            onClick={()=>setTab(item.id)}
          >
            <Icon size={18}/>
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}

export function MobileTabs({tab,setTab,esAdmin}){
  return (
    <div className="tabs mobileTabs">
      {navItems.filter(item=>!item.admin || esAdmin).map(item=>{
        const Icon=item.icon;

        return (
          <button
            key={item.id}
            className={tab===item.id ? "active" : ""}
            onClick={()=>setTab(item.id)}
          >
            <Icon size={15}/>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}