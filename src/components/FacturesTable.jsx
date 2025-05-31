// src/components/FacturasTable.jsx
import React, { useState, useEffect, useRef } from "react";
import { Card, Table, Spinner, Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/config";

export default function FacturasTable() {
  const navigate = useNavigate();

  // Estados para datos e interacción
  const [ordersWithInvoice, setOrdersWithInvoice] = useState([]);
  const [count, setCount] = useState(0);
  const [skip, setSkip] = useState(0);
  // Limitar cada lote a 20 para que el contenedor inicie mostrando alrededor de 20 facturas
  const LIMIT = 20;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Referencia al area de scroll (ahora será el Card.Body)
  const containerRef = useRef();

  useEffect(() => {
    loadMoreOrders(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carga batch de órdenes con factura
  const loadMoreOrders = async (newSkip) => {
    setLoading(true);
    setError(null);

    try {
      const url =
        `${API_URL.replace(/\/$/, "")}` +
        `/api/get-orders-with-invoice?skip=${newSkip}&limit=${LIMIT}`;

      const resp = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const { count: totalCount, orders } = await resp.json();

      setCount(totalCount);
      setOrdersWithInvoice((prev) =>
        newSkip === 0 ? orders : [...prev, ...orders]
      );
      setSkip((prev) => prev + orders.length);
    } catch (err) {
      console.error("Error fetching orders with invoice:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de scroll infinito
  const handleScroll = () => {
    if (
      containerRef.current.scrollHeight - containerRef.current.scrollTop <=
        containerRef.current.clientHeight + 50 &&
      ordersWithInvoice.length < count &&
      !loading
    ) {
      loadMoreOrders(skip);
    }
  };

  if (loading && ordersWithInvoice.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }
  if (error && ordersWithInvoice.length === 0) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  return (
    <Card className="shadow-sm border-primary w-100 mt-3">
      {/* 
        Se fija la altura del contenedor para mostrar aproximadamente 20 facturas,
        y se habilita scroll interno.
      */}
      <Card.Body
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: "800px", overflowY: "auto", padding: 0 }}
      >
        <Card.Title as="h2" className="h5 mb-3 p-3">
          Órdenes Facturadas
        </Card.Title>

        {error && (
          <Alert variant="danger" className="mx-3 mb-3">
            {error}
          </Alert>
        )}

        <Table striped hover className="mb-0">
          <thead
            className="table-light"
            style={{
              position: "sticky",
              top: 0,
              background: "white",
              zIndex: 2,
            }}
          >
            <tr>
              <th className="px-2 py-2 text-start text-nowrap">
                Fecha Factura
              </th>
              <th className="px-2 py-2 text-start text-nowrap">
                ID Factura
              </th>
              <th className="px-2 py-2 text-start text-nowrap">
                Monto Total
              </th>
              <th className="px-2 py-2 text-start text-nowrap">
                Estado Factura
              </th>
              <th className="px-2 py-2 text-start text-nowrap">
                ID Orden
              </th>
              <th className="px-2 py-2 text-start text-nowrap">
                Acción
              </th>
            </tr>
          </thead>

          <tbody>
            {ordersWithInvoice.map((o) => {
              const inv = o.factura.__values__;
              return (
                <tr key={o.id}>
                  <td className="px-2 py-2">
                    {new Date(inv.createdAt).toLocaleString()}
                  </td>
                  <td className="px-2 py-2">{inv.id}</td>
                  <td className="px-2 py-2">{inv.totalPrice}</td>
                  <td className="px-2 py-2">{inv.status}</td>
                  <td className="px-2 py-2">{o.id}</td>
                  <td className="px-2 py-2">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/order-details/${o.id}`)}
                    >
                      Ver Orden
                    </Button>
                  </td>
                </tr>
              );
            })}

            {loading && ordersWithInvoice.length > 0 && (
              <tr>
                <td colSpan="6" className="text-center py-2">
                  <Spinner animation="border" size="sm" /> Cargando más…
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {!loading && !error && ordersWithInvoice.length === 0 && (
          <p className="m-3">No hay órdenes facturadas para mostrar.</p>
        )}
      </Card.Body>
    </Card>
  );
}
