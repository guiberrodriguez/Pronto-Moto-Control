export function money(n){
  return "RD$" + Number(n || 0).toLocaleString();
}

export function today(){
  return new Date().toISOString().slice(0,10);
}

export function nowDateTime(){
  return new Date().toISOString();
}

export function currentYear(){
  return new Date().getFullYear();
}

export function receiptId(count){
  const ym = new Date().toISOString().slice(0,7).replace("-","");
  return `${ym}-${String(count + 1).padStart(2,"0")}`;
}

export function countryCode(country){
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

export function businessDaysBetween(startDate,endDate){
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

export function cleanPhone(phone){
  return String(phone || "").replace(/\D/g,"");
}

export function whatsappUrl(phone,text){
  return `https://wa.me/1${cleanPhone(phone)}?text=${encodeURIComponent(text)}`;
}

export function getLocation(){
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation){
      reject(new Error("Este dispositivo no soporta ubicación GPS"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos=>{
        resolve({
          lat:pos.coords.latitude,
          lng:pos.coords.longitude,
          accuracy:pos.coords.accuracy,
          fecha:nowDateTime()
        });
      },
      err=>reject(err),
      {
        enableHighAccuracy:true,
        timeout:15000,
        maximumAge:0
      }
    );
  });
}

export function locationMapUrl(location){
  if(!location?.lat || !location?.lng) return "";
  return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
}

export function getNombreUsuario(usuarioActual,user){
  const fuente = usuarioActual?.nombre || user?.displayName || user?.email || "Usuario";
  if(fuente.includes("@")) return fuente.split("@")[0].split(".")[0];
  return fuente.split(" ")[0];
}