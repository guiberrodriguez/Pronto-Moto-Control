import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

export async function registrarAuditoria({
  accion,
  modulo,
  descripcion,
  usuario,
  extra = {}
}){
  try{
    await addDoc(collection(db,"auditLogs"),{
      accion,
      modulo,
      descripcion,

      usuarioId: usuario?.uid || usuario?.id || "",
      usuarioNombre: usuario?.nombre || usuario?.correo || "Usuario",
      usuarioCorreo: usuario?.correo || "",

      fecha: new Date().toISOString(),

      ...extra
    });
  }catch(e){
    console.log("Error auditoría:", e);
  }
}