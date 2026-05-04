import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { auth } from "./firebase";

const messaging = getMessaging(app);

export async function activarNotificacionesPush() {
  try {
    const permiso = await Notification.requestPermission();

    if (permiso !== "granted") {
      alert("Permiso de notificaciones denegado");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: "BIEJf5ClQUq88BoTmUx5OZ2gv8Am5pg_cn5Kn4MbMbmxY7OwQ4SXA2RoISGa2zZo2LLfpJOvs_mppgqA5-ZWZI4"
    });

    if (token && auth.currentUser) {
      await setDoc(doc(db, "tokensPush", auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        token,
        fecha: new Date().toISOString()
      });
    }

    return token;
  } catch (error) {
    console.error("Error activando notificaciones:", error);
    return null;
  }
}

export function escucharNotificaciones() {
  onMessage(messaging, (payload) => {
    new Notification(payload.notification?.title || "Pronto Moto", {
      body: payload.notification?.body || "Nueva notificación"
    });
  });
}