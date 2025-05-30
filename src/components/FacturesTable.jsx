import React, { useState } from "react";
import { Card, Table, Spinner, Alert, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { API_URL } from "../config/config";

// Convierte de "yyyy-mm-dd" a "dd-mm-yyyy"
function formatDate(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
}

export default function FacturasTable() {
  // Calculate default dates
  const today = new Date();
  const todayFormatted = today.toISOString().split("T")[0];
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(today.getDate() - 3);
  const tenDaysAgoFormatted = tenDaysAgo.toISOString().split("T")[0];

  const [invoices, setInvoices] = useState([]);
  const [fromDate, setFromDate] = useState(tenDaysAgoFormatted);
  const [toDate, setToDate] = useState(todayFormatted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const fetchInvoices = async () => {
    if (!fromDate || !toDate) {
      setError("Debe seleccionar ambas fechas");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = `${API_URL}/api/facturas-emitidas?fromDate=${formatDate(
        fromDate
      )}&toDate=${formatDate(toDate)}`;
      const resp = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (!resp.ok) throw new Error("Error al obtener facturas");
      const data = await resp.json();
      // Los datos se reciben como un array de arrays, así que los aplastamos
      const flatInvoices = data.flat().map((item) => item.__values__);
      setInvoices(flatInvoices);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Altura aproximada de una fila de tabla (ajustar según necesidades)
  const rowHeight = 48; // en píxeles
  // Altura para mostrar aproximadamente 15 filas
  const tableHeight = 15 * rowHeight;

  return (
    <Card className="shadow-sm border-primary w-100 mt-3">
      <Card.Body>
        <Card.Title as="h2" className="h5 mb-3">
          Facturas Emitidas
        </Card.Title>

        <Button
          variant="secondary"
          onClick={() => setShowFilter(!showFilter)}
          className="mb-3"
        >
          {showFilter ? "Ocultar Filtro de Fechas" : "Mostrar Filtro de Fechas"}
        </Button>

        {showFilter && (
          <Form className="mb-3">
            <Form.Group className="mb-2">
              <Form.Label>Fecha Inicio</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Fecha Fin</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={fetchInvoices}>
              Buscar
            </Button>
          </Form>
        )}

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && invoices.length > 0 && (
          <div
            className="table-responsive"
            style={{
              maxHeight: `${tableHeight}px`,
              overflowY: "auto",
            }}
          >
            <Table striped hover className="mb-0">
              <thead
                className="table-light"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  backgroundColor: "#f8f9fa", // Color similar a table-light
                }}
              >
                <tr>
                  <th>Fecha y hora de facturación</th>
                  <th>id</th>
                  <th>Monto factura</th>
                  <th>Estado de pago</th>
                  <th>Orden de Compra</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{new Date(inv.createdAt).toLocaleString()}</td>
                    <td>{inv.id}</td>
                    <td>{inv.totalPrice}</td>
                    <td>{inv.status}</td>
                    <td>
                      <Link to={`/ordenes/${inv.id}`}>Ver Orden</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {!loading && !error && invoices.length === 0 && (
          <p className="mb-0">
            No hay facturas para mostrar. Selecciona fechas y presiona Buscar.
          </p>
        )}
      </Card.Body>
    </Card>
  );
}
