import React from "react";
import { useApi } from "../hooks/useApi";

export default function MetricsDashboard() {
  const { data: spacesData, loading: l1 } = useApi("/api/spaces");
  const { data: stockData, loading: l2 } = useApi("/api/stock_summary");
  const { data: obData, loading: l3 } = useApi("/api/obsoletos");

  if (l1 || l2 || l3) return <p>Cargando métricas...</p>;

  return (
    <section className="space-y-6">
      {/* Espacios */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Espacios por Sector</h2>
        {spacesData.spaces.map((s) => (
          <p key={s.space_id} className="text-gray-700">
            {s.type}: {s.used_space} / {s.total_space}
          </p>
        ))}
      </div>

      {/* Stock */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Stock por SKU</h2>
        {Object.entries(stockData).map(([sku, info]) => (
          <p key={sku} className="text-gray-700">
            {sku}: {info.total}
          </p>
        ))}
      </div>

      {/* Próximos obsoletos */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Productos por vencer (±3h)
        </h2>
        {Object.entries(obData).length === 0 ? (
          <p className="text-gray-500">No hay productos próximos a vencer.</p>
        ) : (
          Object.entries(obData).map(([sku, items]) => (
            <p key={sku} className="text-gray-700">
              {sku}: {items.length} unidades
            </p>
          ))
        )}
      </div>
    </section>
  );
}
