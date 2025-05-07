// src/hooks/useApi.js
import { useEffect, useState, useRef } from "react";

export function useApi(
  endpoint,
  { 
    options = {},            // fetch options extra
    pollingInterval = 10000      // milisegundos entre peticiones (0 = no polling)
  } = {}
) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  // guardamos el último controller para abortar
  const controllerRef = useRef(null);

  useEffect(() => {
    let intervalId;

    const fetchData = async () => {
      // abort anterior si existe
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(endpoint, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            ...(options.headers || {}),
          },
          ...options,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error ${res.status}: ${text || res.statusText}`);
        }
        const json = res.status === 204 ? null : await res.json();
        setData(json);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("useApi error:", err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    // primer fetch
    fetchData();

    // setInterval solo si pollingInterval >0
    if (pollingInterval > 0) {
      intervalId = setInterval(fetchData, pollingInterval);
    }

    return () => {
      // cleanup al desmontar o cambiar endpoint/interval
      if (controllerRef.current) controllerRef.current.abort();
      if (intervalId) clearInterval(intervalId);
    };
  }, [endpoint, pollingInterval]); // depende también de pollingInterval

  return { data, loading, error };
}
