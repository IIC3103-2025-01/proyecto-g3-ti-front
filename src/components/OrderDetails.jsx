// src/components/OrderDetails.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { Card, Table, Spinner, Alert } from "react-bootstrap";
import { useApi } from "../hooks/useApi";

// Componente para mostrar detalles de una orden a partir de invoice_id
export default function OrderDetails() {
  const { invoice_id } = useParams();

  // Llamada al nuevo endpoint: Get Order From Invoice
  const {
    data: order,
    loading,
    error,
  } = useApi(`/api/order-from-invoice/${invoice_id}`, { pollingInterval: 0 });

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }
  if (error) {
    return <Alert variant="danger">Error cargando orden: {error}</Alert>;
  }
  if (!order) {
    return (
      <Alert variant="warning">
        No se encontró la orden para la factura <strong>{invoice_id}</strong>.
      </Alert>
    );
  }

  // Datos de la orden
  const {
    id,
    sku,
    cliente,
    proveedor,
    cantidad,
    precio_unitario,
    creada,
    vencimiento,
    estado,
    actualizado,
    facturado,
    historial,
    factura,
  } = order;

  // Valores de la factura interna
  const invoiceValues = factura?.__values__ || {};

  return (
    <Card className="shadow-sm border-secondary mt-4">
      <Card.Body>
        <Card.Title as="h2" className="h5 mb-3">
          Detalles de la Orden #{id}
        </Card.Title>

        <Table bordered size="sm" className="mb-4">
          <tbody>
            <tr>
              <th>ID interno</th>
              <td>{id}</td>
            </tr>
            <tr>
              <th>SKU</th>
              <td>{sku}</td>
            </tr>
            <tr>
              <th>Cliente</th>
              <td>{cliente}</td>
            </tr>
            <tr>
              <th>Proveedor</th>
              <td>{proveedor}</td>
            </tr>
            <tr>
              <th>Cantidad</th>
              <td>{cantidad}</td>
            </tr>
            <tr>
              <th>Precio Unitario</th>
              <td>{precio_unitario}</td>
            </tr>
            <tr>
              <th>Vencimiento</th>
              <td>{new Date(vencimiento).toLocaleString()}</td>
            </tr>
            <tr>
              <th>Creada</th>
              <td>{new Date(creada).toLocaleString()}</td>
            </tr>
            <tr>
              <th>Actualizada</th>
              <td>{new Date(actualizado).toLocaleString()}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>{estado}</td>
            </tr>
            <tr>
              <th>Facturado</th>
              <td>{facturado ? "Sí" : "No"}</td>
            </tr>
          </tbody>
        </Table>

        <strong>Historial de Estados</strong>
        <Table size="sm" striped className="mb-4">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((h, idx) => (
              <tr key={idx}>
                <td>{h.nombre}</td>
                <td>{new Date(h.fecha).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        {invoiceValues.id && (
          <Card className="mt-3">
            <Card.Header>Detalle de la Factura</Card.Header>
            <Card.Body>
              <Table bordered size="sm">
                <tbody>
                  <tr>
                    <th>ID Factura</th>
                    <td>{invoiceValues.id}</td>
                  </tr>
                  <tr>
                    <th>Cliente</th>
                    <td>{invoiceValues.client}</td>
                  </tr>
                  <tr>
                    <th>Proveedor</th>
                    <td>{invoiceValues.supplier}</td>
                  </tr>
                  <tr>
                    <th>Canal</th>
                    <td>{invoiceValues.channel}</td>
                  </tr>
                  <tr>
                    <th>Estado</th>
                    <td>{invoiceValues.status}</td>
                  </tr>
                  <tr>
                    <th>Precio</th>
                    <td>{invoiceValues.price}</td>
                  </tr>
                  <tr>
                    <th>Interés</th>
                    <td>{invoiceValues.interest}</td>
                  </tr>
                  <tr>
                    <th>Total</th>
                    <td>{invoiceValues.totalPrice}</td>
                  </tr>
                  <tr>
                    <th>Creada</th>
                    <td>
                      {new Date(invoiceValues.createdAt).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <th>Actualizada</th>
                    <td>
                      {new Date(invoiceValues.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Card.Body>
    </Card>
  );
}
