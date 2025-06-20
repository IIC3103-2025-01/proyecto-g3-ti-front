// src/components/FacturasTable.jsx
import React, { useState } from "react";
import { Card, Table, Spinner, Alert, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/config";

// yyyy-mm-dd → dd-mm-yyyy
function formatDate(dateStr) {
  // Verifica si ya está en formato DD-MM-YYYY
  if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) return dateStr;

  // Suponiendo que dateStr es YYYY-MM-DD
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
}

export default function FacturasTable() {
  const navigate = useNavigate();

  // Rango por defecto: últimos 3 días
  const today = new Date();
  const todayFormatted = today.toISOString().split("T")[0];
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(today.getDate() - 3);
  const threeDaysAgoFormatted = threeDaysAgo.toISOString().split("T")[0];

  const [invoices, setInvoices] = useState([]);
  const [fromDate, setFromDate] = useState(threeDaysAgoFormatted);
  const [toDate, setToDate] = useState(todayFormatted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  // track loading state per factura
  const [navLoading, setNavLoading] = useState({});

  // 1) Traer facturas
  const fetchInvoices = async () => {
    console.log("🔍 fetchInvoices desde", fromDate, "hasta", toDate);
    if (!fromDate || !toDate) {
      setError("Debe seleccionar ambas fechas");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(
        `${API_URL}/api/facturas-emitidas?fromDate=${formatDate(
          fromDate
        )}&toDate=${formatDate(toDate)}`,
        { headers: { Accept: "application/json" } }
      );
      console.log("📥 facturas-emitidas status:", resp.status);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      console.log("📄 facturas recibidas:", data);

      // Verifica la estructura antes de procesar
      if (!Array.isArray(data) || data.some((item) => item === null)) {
        setError("La respuesta del servidor no tiene el formato esperado");
        return;
      }

      // Intenta extraer los datos de manera segura
      try {
        const flat = data
          .flat()
          .filter(Boolean)
          .map((item) => item.__values__);
        console.log("Datos procesados:", flat);
        setInvoices(flat);
      } catch (err) {
        console.error("Error al procesar datos:", err);
        setError("Error al procesar los datos recibidos");
      }
    } catch (err) {
      console.error("❌ fetchInvoices error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2) Cuando el usuario hace click en "Ver Orden"

  // estilos tabla
  const rowHeight = 48;
  const tableHeight = 15 * rowHeight;

  return (
    <Card className="shadow-sm border-primary w-100 mt-3">
      <Card.Body>
        <Card.Title as="h2" className="h5 mb-3">
          Facturas Emitidas
        </Card.Title>

        <Button
          variant="secondary"
          onClick={() => setShowFilter((s) => !s)}
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
                style={{ position: "sticky", top: 0, zIndex: 1 }}
              >
                <tr>
                  <th>Fecha y hora</th>
                  <th>ID Factura</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Acción</th>
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
                      <Button
                        size="sm"
                        onClick={() => navigate(`/order-details/${inv.id}`)}
                      >
                        Ver Orden
                      </Button>
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
