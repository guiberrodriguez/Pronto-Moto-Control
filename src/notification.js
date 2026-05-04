// 🔥 NOTIFICACIONES PRO BASE (SIN ERRORES)

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

const messaging = getMessaging(app);

// 🔐 Solicitar permisos
export async function solicitarPermisoNotificaciones(user) {
  try {
    const permiso = await Notification.requestPermission();

    if (permiso !== "granted") {
      console.log("❌ Permiso denegado");
      return null;
    }

    console.log("✅ Permiso concedido");

    const vapidKey = "BIEJf5ClQUq88BoTmUx5OZ2gv8Am5pg_cn5Kn4MbMbmxY7OwQ4SXA2RoISGa2zZo2LLfpJOvs_mppgqA5-ZWZI4";

    const token = await getToken(messaging, {
      vapidKey
    });

    if (!token) {
      console.log("❌ No se pudo generar token");
      return null;
    }

    console.log("✅ Token generado:", token);

    // 💾 Guardar token en Firestore
    await setDoc(doc(db, "tokensPush", user.uid), {
      token,
      email: user.email,
      fecha: new Date().toISOString()
    });

    return token;

  } catch (error) {
    console.error("❌ Error en notificaciones:", error);
    return null;
  }
}

// 📩 Escuchar notificaciones en foreground
export function escucharNotificaciones() {
  onMessage(messaging, (payload) => {
    console.log("📩 Notificación recibida:", payload);

    // 🔔 Mostrar alerta REAL en la app
    alert(payload.notification?.title + " - " + payload.notification?.body);
  });
}