// src/components/OrderDetails.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { Card, Table, Spinner, Alert } from "react-bootstrap";
import { useApi } from "../hooks/useApi";

export default function OrderDetails() {
  const { orden_id } = useParams(); // recoge /orden/:orden_id
  const { data, loading, error } = useApi(
    `/api/desplegar_ordenes/${orden_id}`,
    {
      pollingInterval: 0,
    }
  );

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status" />
      </div>
    );
  }
  if (error) {
    return <Alert variant="danger">Error cargando detalles: {error}</Alert>;
  }
  if (!data) {
    return (
      <Alert variant="warning">
        Orden con ID <strong>{orden_id}</strong> no encontrada.
      </Alert>
    );
  }

  // Renombramos data a p para que se asemeje a la nomenclatura del snippet
  const p = data;

  return (
    <Card className="shadow-sm border-secondary mt-4">
      <Card.Body>
        <Card.Title as="h2" className="h5 mb-3">
          Detalles de la Orden #{p.id}
        </Card.Title>

        <Table bordered size="sm" className="mb-3">
          <tbody>
            <tr>
              <th>ID interno</th>
              <td>{p.id}</td>
            </tr>
            <tr>
              <th>SKU</th>
              <td>{p.sku}</td>
            </tr>
            <tr>
              <th>Cliente</th>
              <td>{p.cliente}</td>
            </tr>
            <tr>
              <th>Proveedor</th>
              <td>{p.proveedor}</td>
            </tr>
            <tr>
              <th>Cantidad</th>
              <td>{p.cantidad}</td>
            </tr>
            <tr>
              <th>Precio Unitario</th>
              <td>{p.precio_unitario}</td>
            </tr>
            <tr>
              <th>Vencimiento</th>
              <td>{new Date(p.vencimiento).toLocaleString()}</td>
            </tr>
            <tr>
              <th>Facturado</th>
              <td>{p.facturado ? "Facturado" : "No facturado"}</td>
            </tr>
            <tr>
              <td colSpan="2" className="border-top-0 p-3 bg-light">
                <dl className="row mb-2">
                  <dt className="col-sm-3">Estado</dt>
                  <dd className="col-sm-9">{p.estado}</dd>
                  <dt className="col-sm-3">Creada</dt>
                  <dd className="col-sm-9">
                    {new Date(p.creada).toLocaleString()}
                  </dd>
                  <dt className="col-sm-3">Actualizada</dt>
                  <dd className="col-sm-9">
                    {new Date(p.actualizada).toLocaleString()}
                  </dd>
                </dl>
                <div>
                  <strong>Historial:</strong>
                  <Table size="sm" striped className="mb-0 mt-2">
                    <thead>
                      <tr>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.historial.map((h, i) => (
                        <tr key={i}>
                          <td>{h.nombre}</td>
                          <td>{new Date(h.fecha).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                {p.factura && (
                  <Card className="mt-3">
                    <Card.Header>Detalle de la Factura</Card.Header>
                    <Card.Body>
                      <dl className="row mb-0">
                        <dt className="col-sm-4">Número</dt>
                        <dd className="col-sm-8">{p.factura.numero}</dd>
                        <dt className="col-sm-4">Fecha Emisión</dt>
                        <dd className="col-sm-8">{p.factura.fecha_emision}</dd>
                        <dt className="col-sm-4">Monto Total</dt>
                        <dd className="col-sm-8">{p.factura.monto_total}</dd>
                        <dt className="col-sm-4">Detalles</dt>
                        <dd className="col-sm-8">
                          <ul className="mb-0">
                            {p.factura.detalles.map((d, j) => (
                              <li key={j}>
                                {d.descripcion} - {d.cantidad} x{" "}
                                {d.precio_unitario}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </dl>
                    </Card.Body>
                  </Card>
                )}
              </td>
            </tr>
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
