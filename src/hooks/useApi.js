// src/hooks/useApi.js
import { useEffect, useState, useRef } from "react";
import { API_URL } from "~/config";

export function useApi(
  path, // antes: "endpoint"
  {
    options = {},
    pollingInterval = 0,
    incremental = false,
    mergeData = (prev, next) => next,
  } = {}
) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    let intervalId;

    const fetchData = async () => {
      // abort anterior
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      setError(null);

      // construye URL completa: si viene con http usa tal cual
      const base = API_URL.replace(/\/$/, "");
      let url = path.startsWith("http")
        ? path
        : `${base}${path.startsWith("/") ? path : `/${path}`}`;

      // incremental?
      if (incremental && lastRef.current) {
        const sep = url.includes("?") ? "&" : "?";
        url += `${sep}since=${encodeURIComponent(lastRef.current)}`;
      }

      try {
        const res = await fetch(url, {
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
        setData((prev) => mergeData(prev, json));
        lastRef.current = json?.lastUpdated || new Date().toISOString();
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    if (pollingInterval > 0)
      intervalId = setInterval(fetchData, pollingInterval);

    return () => {
      controllerRef.current?.abort();
      intervalId && clearInterval(intervalId);
    };
  }, [path, pollingInterval, incremental, JSON.stringify(options)]);

  return { data, loading, error };
}
