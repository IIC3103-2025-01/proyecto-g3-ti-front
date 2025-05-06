// src/hooks/useApi.js - VERSIÓN CORREGIDA
import { useEffect, useState } from "react";

export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null); // Limpia errores anteriores
    setData(null);  // Limpia datos anteriores mientras carga

    // --- CAMBIO PRINCIPAL AQUÍ ---
    // Llama solo al 'endpoint'. Asume que 'endpoint' ya viene como "/api/..."
    fetch(endpoint, {
    // ---------------------------
      ...options,
      headers: {
        accept: "application/json",
        ...(options.headers || {}),
      },
    })
      .then((res) => {
        if (!res.ok) {
          // Intenta obtener más detalles del error si es posible
          return res.text().then(text => {
             let errorMsg = `Error ${res.status} (${res.statusText})`;
             try {
               // Intenta parsear si la respuesta es JSON con error
               const jsonError = JSON.parse(text);
               errorMsg += `: ${jsonError.detail || text}`;
             } catch (e) {
               errorMsg += `: ${text}`; // Si no es JSON, muestra el texto
             }
             throw new Error(errorMsg);
          });
        }
        // Si la respuesta es OK pero no tiene contenido (ej. 204)
        if (res.status === 204 || res.headers.get('content-length') === '0') {
            return null; // O un objeto vacío {}, dependiendo de lo que esperes
        }
        return res.json(); // Procede a parsear JSON
      })
      .then((json) => setData(json))
      .catch((err) => {
          console.error(`Error fetching ${endpoint}:`, err); // Loguea el error para depuración
          setError(err.message || 'Ocurrió un error desconocido');
      })
      .finally(() => setLoading(false));

  // La dependencia 'endpoint' está bien. Si 'options' cambia y debe disparar un re-fetch,
  // necesitarías una estrategia para incluirlo sin causar bucles infinitos (ej. useMemo o serialización)
  }, [endpoint]);

  return { data, loading, error };
}