import React from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";

export default function OrdersTable() {
  const { data, loading, error } = useApi("/api/orders?skip=0&limit=10");

  if (loading) return <p>Cargando pedidos…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const orders = data?.orders || [];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Últimos Pedidos</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              {[
                "ID",
                "Cliente",
                "Proveedor",
                "Canal",
                "Estado",
                "Creado",
                "Actualizado",
                "Detalle",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-600 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-4 text-center text-gray-500"
                >
                  No hay pedidos.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.order_id}
                  className="hover:bg-gray-100 transition"
                >
                  <td className="px-4 py-3 text-sm">{o.order_id}</td>
                  <td className="px-4 py-3 text-sm">{o.client}</td>
                  <td className="px-4 py-3 text-sm">{o.supplier}</td>
                  <td className="px-4 py-3 text-sm">{o.channel}</td>
                  <td className="px-4 py-3 text-sm">{o.status}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(o.payload.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(o.payload.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      to={`/pedido/${o.order_id}`}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Ver más
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
