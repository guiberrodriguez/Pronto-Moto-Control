import React from "react";
import { Search, MapPin, ShieldCheck, Edit, Eye, MessageCircle, Trash2 } from "lucide-react";
import { paises, nacionalidades, provinciasRD } from "../data/constants";
import { whatsappUrl, locationMapUrl, money } from "../utils/helpers";
import IconTextButton from "./IconTextButton";

export default function Clientes({
  esAdmin,
  cliente,
  setCliente,
  editCliente,
  usuarios,
  clientesFiltrados,
  busquedaCliente,
  setBusquedaCliente,
  municipiosDisponibles,
  guardarCliente,
  capturarUbicacionCliente,
  editarCliente,
  eliminarCliente,
  setClienteVista
}){
  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Base de clientes</p>
          <h2>{editCliente ? "Editar cliente" : "Crear cliente"}</h2>
        </div>
      </div>

      <div className="searchBox">
        <Search size={18}/>
        <input
          placeholder="Buscar cliente por nombre, ID, cédula, teléfono, correo, provincia..."
          value={busquedaCliente}
          onChange={e=>setBusquedaCliente(e.target.value)}
        />
      </div>

      {esAdmin && (
        <>
          {editCliente && <p><b>ID Cliente:</b> {cliente.idCliente}</p>}

          <select value={cliente.pais} onChange={e=>setCliente({...cliente,pais:e.target.value})}>
            {paises.map(p=><option key={p} value={p}>{p}</option>)}
          </select>

          <select value={cliente.nacionalidad} onChange={e=>setCliente({...cliente,nacionalidad:e.target.value})}>
            {nacionalidades.map(n=><option key={n} value={n}>{n}</option>)}
          </select>

          <select
            value={cliente.provincia}
            onChange={e=>{
              const prov=e.target.value;
              setCliente({
                ...cliente,
                provincia:prov,
                municipio:(provinciasRD[prov] || [])[0] || ""
              });
            }}
          >
            {Object.keys(provinciasRD).map(p=><option key={p} value={p}>{p}</option>)}
          </select>

          <select value={cliente.municipio} onChange={e=>setCliente({...cliente,municipio:e.target.value})}>
            {municipiosDisponibles.map(m=><option key={m} value={m}>{m}</option>)}
          </select>

          <select value={cliente.sexo} onChange={e=>setCliente({...cliente,sexo:e.target.value})}>
            <option>Masculino</option>
            <option>Femenino</option>
          </select>

          <input placeholder="Nombre" value={cliente.nombre} onChange={e=>setCliente({...cliente,nombre:e.target.value})}/>
          <input placeholder="Cédula / Pasaporte" value={cliente.cedula} onChange={e=>setCliente({...cliente,cedula:e.target.value})}/>
          <input placeholder="Correo electrónico" value={cliente.correo} onChange={e=>setCliente({...cliente,correo:e.target.value})}/>
          <input placeholder="Teléfono móvil" value={cliente.telefono} onChange={e=>setCliente({...cliente,telefono:e.target.value})}/>
          <input placeholder="Teléfono residencial" value={cliente.telefonoResidencial} onChange={e=>setCliente({...cliente,telefonoResidencial:e.target.value})}/>
          <input placeholder="Teléfono de referencia" value={cliente.telefonoReferencia} onChange={e=>setCliente({...cliente,telefonoReferencia:e.target.value})}/>
          <input placeholder="Dirección" value={cliente.direccion} onChange={e=>setCliente({...cliente,direccion:e.target.value})}/>
          <input placeholder="Referencia personal" value={cliente.referencia} onChange={e=>setCliente({...cliente,referencia:e.target.value})}/>
          <input placeholder="Riesgo" value={cliente.riesgo} onChange={e=>setCliente({...cliente,riesgo:e.target.value})}/>

          <select value={cliente.cobradorId} onChange={e=>setCliente({...cliente,cobradorId:e.target.value})}>
            <option value="">Sin cobrador asignado</option>
            {usuarios.filter(u=>u.rol==="cobrador").map(u=>(
              <option key={u.uid || u.id} value={u.uid || u.id}>{u.nombre} · {u.correo}</option>
            ))}
          </select>

          <IconTextButton icon={MapPin} label="Capturar ubicación del cliente" onClick={capturarUbicacionCliente}/>

          {cliente.ubicacion?.lat && (
            <p>
              <a href={locationMapUrl(cliente.ubicacion)} target="_blank" rel="noreferrer">
                Ver ubicación capturada
              </a>
            </p>
          )}

          <IconTextButton icon={ShieldCheck} label={editCliente ? "Guardar cambios" : "Crear cliente"} onClick={guardarCliente}/>
        </>
      )}

      {clientesFiltrados.map(c=>(
        <div className="item premiumItem" key={c.id}>
          <b>{c.idCliente || c.id} · {c.nombre}</b>
          <p>{c.pais || "N/A"} · {c.nacionalidad || "N/A"} · {c.sexo || "N/A"}</p>
          <p>{c.provincia || "N/A"} · {c.municipio || "N/A"}</p>
          <p>{c.telefono} · {c.cedula}</p>
          <p>{c.correo}</p>
          <p>Cobrador: {usuarios.find(u=>(u.uid || u.id)===c.cobradorId)?.nombre || "Sin asignar"}</p>

          {c.ubicacion?.lat && (
            <p>
              <a href={locationMapUrl(c.ubicacion)} target="_blank" rel="noreferrer">
                Ver ubicación
              </a>
            </p>
          )}

          <div className="actionRow">
            {esAdmin && <IconTextButton icon={Edit} label="Editar" onClick={()=>editarCliente(c)}/>}
            <IconTextButton icon={Eye} label="Perfil" onClick={()=>setClienteVista(c)}/>

            {c.telefono && (
              <a href={whatsappUrl(c.telefono,`Hola ${c.nombre}, te contactamos de Pronto Moto.`)} target="_blank" rel="noreferrer">
                <IconTextButton icon={MessageCircle} label="WhatsApp" className="whatsappBtn"/>
              </a>
            )}

            {esAdmin && <IconTextButton icon={Trash2} label="Eliminar" className="deleteBtn" onClick={()=>eliminarCliente(c.id)}/>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ClientePerfil({
  clienteVista,
  setClienteVista,
  motos,
  pagos,
  adjuntos
}){
  if(!clienteVista) return null;

  return (
    <div className="card profileCard">
      <div className="sectionHeader">
        <div>
          <p className="muted">Detalle del cliente</p>
          <h2>Perfil del cliente</h2>
        </div>
      </div>

      <p><b>ID Cliente:</b> {clienteVista.idCliente || clienteVista.id}</p>
      <p><b>Nombre:</b> {clienteVista.nombre}</p>
      <p><b>Sexo:</b> {clienteVista.sexo}</p>
      <p><b>País:</b> {clienteVista.pais}</p>
      <p><b>Nacionalidad:</b> {clienteVista.nacionalidad}</p>
      <p><b>Provincia:</b> {clienteVista.provincia}</p>
      <p><b>Municipio:</b> {clienteVista.municipio}</p>
      <p><b>Cédula:</b> {clienteVista.cedula}</p>
      <p><b>Correo:</b> {clienteVista.correo}</p>
      <p><b>Teléfono móvil:</b> {clienteVista.telefono}</p>
      <p><b>Teléfono residencial:</b> {clienteVista.telefonoResidencial}</p>
      <p><b>Teléfono referencia:</b> {clienteVista.telefonoReferencia}</p>
      <p><b>Dirección:</b> {clienteVista.direccion}</p>

      {clienteVista.ubicacion?.lat && (
        <p>
          <a href={locationMapUrl(clienteVista.ubicacion)} target="_blank" rel="noreferrer">
            Ver ubicación en Google Maps
          </a>
        </p>
      )}

      <h3>Motos asignadas</h3>
      {motos.filter(m=>m.clienteId===clienteVista.id).map(m=>(
        <div className="item premiumItem" key={m.id}>
          {m.placa} - {m.marca} {m.modelo}
        </div>
      ))}

      <h3>Pagos</h3>
      {pagos.filter(p=>p.clienteId===clienteVista.id).map(p=>(
        <div className="item premiumItem" key={p.docId}>
          {p.id} - {money(p.monto)}
        </div>
      ))}

      <h3>Adjuntos</h3>
      {adjuntos.filter(a=>a.clienteId===clienteVista.id).map(a=>(
        <div className="item premiumItem" key={a.id}>
          <a href={a.url} target="_blank" rel="noreferrer">{a.nombre}</a>
        </div>
      ))}

      <IconTextButton icon={Eye} label="Cerrar perfil" onClick={()=>setClienteVista(null)}/>
    </div>
  );
}