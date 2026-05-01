# Pronto Moto Control Cloud

MVP en React + Firebase para llevar Pronto Moto a la nube y generar QR reales.

## Qué incluye

- Login privado con Firebase Authentication.
- Base de datos en Cloud Firestore.
- Generación de comprobantes con ID `YYYYMM-XX`.
- QR real que redirige a `/validar/:id`.
- Página pública de validación del comprobante.
- Preparado para subir a Vercel o Firebase Hosting.

## Pasos

1. Crear proyecto en Firebase.
2. Activar Authentication con Email/Password.
3. Crear un usuario administrador.
4. Activar Cloud Firestore.
5. Copiar `.env.example` a `.env` y llenar las variables.
6. Instalar dependencias:

```bash
npm install
npm run dev
```

7. Para producción:

```bash
npm run build
```

## Despliegue recomendado

- Vercel para hosting rápido.
- Firebase para Auth + Firestore.
- Dominio sugerido: `app.prontomoto.com` o `prontomoto.app`.

## Importante

El QR necesita una URL pública real en `VITE_PUBLIC_BASE_URL`, por ejemplo:

```env
VITE_PUBLIC_BASE_URL=https://prontomoto.vercel.app
```
