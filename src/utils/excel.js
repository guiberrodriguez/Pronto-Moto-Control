import * as XLSX from "xlsx";
import { money, today } from "./helpers";

export function exportarExcelPRO({
  pagos = [],
  gastos = [],
  motos = [],
  clientes = [],
  usuarios = [],
  empresa = { nombre: "Pronto Moto" }
}){
  const fecha = today();

  const pagosData = pagos.map(p=>({
    "ID comprobante": p.id || "",
    "Fecha": p.fecha || "",
    "Cliente": p.cliente || "",
    "ID cliente": p.idCliente || p.clienteId || "",
    "Moto": p.moto || "",
    "Monto": Number(p.monto || 0),
    "Método": p.metodo || "",
    "Cobrador": p.cobrador || "",
    "Estatus": p.estatus || ""
  }));

  const gastosData = gastos.map(g=>({
    "Fecha": g.fecha || "",
    "Moto": motos.find(m=>m.id===g.motoId)?.placa || "N/A",
    "Categoría": g.categoria || "",
    "Monto": Number(g.monto || 0),
    "Proveedor": g.proveedor || "",
    "Nota": g.nota || ""
  }));

  const motosData = motos.map(m=>{
    const ingresos = pagos
      .filter(p=>p.motoId===m.id)
      .reduce((s,p)=>s+Number(p.monto||0),0);

    const egresos = gastos
      .filter(g=>g.motoId===m.id)
      .reduce((s,g)=>s+Number(g.monto||0),0);

    return {
      "Placa": m.placa || "",
      "Marca": m.marca || "",
      "Modelo": m.modelo || "",
      "Cliente": clientes.find(c=>c.id===m.clienteId)?.nombre || "Sin asignar",
      "Pago diario": Number(m.pagoDiario || 0),
      "Ingresos": ingresos,
      "Gastos": egresos,
      "Neto": ingresos-egresos
    };
  });

  const cobradoresData = usuarios.map(u=>{
    const lista = pagos.filter(p=>p.cobradorId===u.uid || p.cobradorId===u.id);
    const total = lista.reduce((s,p)=>s+Number(p.monto||0),0);

    return {
      "Cobrador": u.nombre || u.correo || "",
      "Correo": u.correo || "",
      "Cantidad pagos": lista.length,
      "Total cobrado": total
    };
  });

  const totalIngresos = pagos.reduce((s,p)=>s+Number(p.monto||0),0);
  const totalGastos = gastos.reduce((s,g)=>s+Number(g.monto||0),0);

  const resumenData = [
    {"Indicador":"Empresa","Valor":empresa.nombre || "Pronto Moto"},
    {"Indicador":"Fecha de exportación","Valor":fecha},
    {"Indicador":"Total ingresos","Valor":money(totalIngresos)},
    {"Indicador":"Total gastos","Valor":money(totalGastos)},
    {"Indicador":"Neto general","Valor":money(totalIngresos-totalGastos)},
    {"Indicador":"Clientes registrados","Valor":clientes.length},
    {"Indicador":"Motos registradas","Valor":motos.length},
    {"Indicador":"Pagos registrados","Valor":pagos.length}
  ];

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumenData), "Resumen");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pagosData), "Pagos");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(gastosData), "Gastos");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(motosData), "Motos");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(cobradoresData), "Cobradores");

  XLSX.writeFile(wb, `Reporte_${empresa.nombre || "ProntoMoto"}_${fecha}.xlsx`);
}