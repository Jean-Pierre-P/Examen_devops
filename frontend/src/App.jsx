import { useEffect, useState } from "react";

// URL del backend inyectada en build/runtime vía variable de entorno.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function App() {
  const [status, setStatus] = useState("cargando...");
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((r) => r.json())
      .then((data) => setStatus(JSON.stringify(data)))
      .catch(() => setStatus("no se pudo contactar al backend"));

    fetch(`${API_URL}/api/items`)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>EFT - Plataforma Frontend/Backend/BD</h1>
      <p>Estado del backend: {status}</p>
      <h2>Items</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
