import { AlertTriangle, Brain, TrendingUp, ShieldCheck } from "lucide-react";

export default function AiDashboard() {
  const riskScore = 82;

  const alerts = [
    {
      title: "Morosidad crítica detectada",
      text: "Hay motos con 2 cuotas o más pendientes. Prioriza la cobranza hoy.",
      type: "danger",
      icon: <AlertTriangle />,
    },
    {
      title: "Flujo positivo",
      text: "Los ingresos actuales superan los gastos operativos.",
      type: "success",
      icon: <TrendingUp />,
    },
    {
      title: "Cliente con riesgo elevado",
      text: "Un cliente presenta señales de atraso recurrente.",
      type: "warning",
      icon: <Brain />,
    },
  ];

  return (
    <section className="aiDashboard">
      <div className="aiMainCard">
        <div className="aiHeader">
          <div>
            <span>Inteligencia operativa</span>
            <h2>Dashboard IA</h2>
          </div>

          <Brain size={34} />
        </div>

        <div className="riskScoreBox">
          <div className="riskCircle">
            <span>{riskScore}</span>
            <small>/100</small>
          </div>

          <div>
            <h3>Score de riesgo</h3>
            <p>
              Riesgo operativo alto. Recomendamos seguimiento inmediato
              a clientes morosos.
            </p>
          </div>
        </div>
      </div>

      <div className="aiAlertsGrid">
        {alerts.map((alert, index) => (
          <div key={index} className={`aiAlert ${alert.type}`}>
            <div className="aiAlertIcon">
              {alert.icon}
            </div>

            <div>
              <h3>{alert.title}</h3>
              <p>{alert.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="aiPredictionCard">
        <div>
          <span>Predicción automática</span>
          <h2>Probabilidad de mora próxima</h2>
          <p>
            Según el comportamiento actual, existe una probabilidad alta
            de nuevos atrasos si no se realiza gestión preventiva.
          </p>
        </div>

        <ShieldCheck size={42} />
      </div>
    </section>
  );
}