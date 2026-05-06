import React from "react";
import { Bike, Edit, FileText, Trash2 } from "lucide-react";
import { money } from "../utils/helpers";
import IconTextButton from "./IconTextButton";

export default function Motos({
  esAdmin,
  moto,
  setMoto,
  editMoto,
  clientes,
  motosVisibles,
  guardarMoto,
  editarMoto,
  eliminarMoto,
  imprimirContrato,
  deudaMoto,
  ingresosPorMoto,
  gastosPorMoto
}){
  return (
    <div className="card">
      <div className="sectionHeader">
        <div>
          <p className="muted">Inventario y asignaciones</p>
          <h2>{editMoto ? "Editar moto" : "Crear moto"}</h2>
        </div>
      </div>

      {esAdmin && (
        <>
          <input
            placeholder="Placa"
            value={moto.placa}
            onChange={e=>setMoto({...moto,placa:e.target.value})}
          />

          <input
            placeholder="Marca"
            value={moto.marca}
            onChange={e=>setMoto({...moto,marca:e.target.value})}
          />

          <input
            placeholder="Modelo"
            value={moto.modelo}
            onChange={e=>setMoto({...moto,modelo:e.target.value})}
          />

          <input
            placeholder="Año"
            value={moto.anio}
            onChange={e=>setMoto({...moto,anio:e.target.value})}
          />

          <input
            placeholder="Tracker / GPS"
            value={moto.tracker}
            onChange={e=>setMoto({...moto,tracker:e.target.value})}
          />

          <select
            value={moto.clienteId}
            onChange={e=>setMoto({...moto,clienteId:e.target.value})}
          >
            <option value="">Sin cliente asignado</option>

            {clientes.map(c=>(
              <option key={c.id} value={c.id}>
                {c.idCliente || c.id} · {c.nombre}
              </option>
            ))}
          </select>

          <input
            className="dateInput"
            type="date"
            value={moto.fechaAsignacion}
            onChange={e=>setMoto({...moto,fechaAsignacion:e.target.value})}
          />

          <input
            placeholder="Pago diario"
            value={moto.pagoDiario}
            onChange={e=>setMoto({...moto,pagoDiario:e.target.value})}
          />

          <input
            placeholder="Depósito"
            value={moto.deposito}
            onChange={e=>setMoto({...moto,deposito:e.target.value})}
          />

          <IconTextButton
            icon={Bike}
            label={editMoto ? "Guardar cambios" : "Crear moto"}
            onClick={guardarMoto}
          />
        </>
      )}

      {motosVisibles.map(m=>{
        const d=deudaMoto(m);

        return (
          <div className="item premiumItem" key={m.id}>
            <b>{m.placa}</b>

            <p>{m.marca} {m.modelo} · {m.anio}</p>

            <p>Pago diario: {money(m.pagoDiario)}</p>

            <p>Estado: {m.estado || "Disponible"}</p>

            <p>
              Cliente: {
                clientes.find(c=>c.id===m.clienteId)?.nombre || "Sin asignar"
              }
            </p>

            <p>Cuotas pendientes: {d.cuotasPendientes}</p>

            <p>Monto pendiente: {money(d.montoPendiente)}</p>

            <p>Estatus: {d.estatus}</p>

            <p>Ingresos: {money(ingresosPorMoto(m.id))}</p>

            <p>Gastos: {money(gastosPorMoto(m.id))}</p>

            <p>
              Neto moto: {
                money(
                  ingresosPorMoto(m.id)-gastosPorMoto(m.id)
                )
              }
            </p>

            <div className="actionRow">
              {esAdmin && (
                <IconTextButton
                  icon={Edit}
                  label="Editar"
                  onClick={()=>editarMoto(m)}
                />
              )}

              {esAdmin && (
                <IconTextButton
                  icon={FileText}
                  label="Contrato"
                  onClick={()=>imprimirContrato(m)}
                />
              )}

              {esAdmin && (
                <IconTextButton
                  icon={Trash2}
                  label="Eliminar"
                  className="deleteBtn"
                  onClick={()=>eliminarMoto(m.id)}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}