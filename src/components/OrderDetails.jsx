import React from "react";
import { useParams, Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";

export default function OrderDetails() {
  const { id } = useParams();
  const { data, loading, error } = useApi(`/api/orders?skip=0&limit=100`);

  if (loading) return <p>Cargando detalles…</p>;
  const order = data.orders.find((o) => o.order_id === id);
  if (!order) return <p>Pedido no encontrado</p>;

  return (
    <div className="container mx-auto p-6 space-y-4">
      <h2 className="text-3xl font-bold">{order.order_id}</h2>
      <p><strong>Cliente:</strong> {order.client}</p>
      <p><strong>Proveedor:</strong> {order.supplier}</p>
      <p><strong>Canal:</strong> {order.channel}</p>
      <p><strong>Estado:</strong> {order.status}</p>
      <p><strong>Payload completo:</strong></p>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(order.payload, null, 2)}</pre>
      <Link to="/" className="text-indigo-600 hover:text-indigo-800">
        ← Volver
      </Link>
    </div>
  );
}
