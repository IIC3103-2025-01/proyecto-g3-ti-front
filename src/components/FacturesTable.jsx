// src/components/FacturesTable.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Spinner,
  Alert,
  Form,
  Button,
  Badge,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config/config";

// yyyy-mm-dd → dd-mm-yyyy
function formatDate(dateStr) {
  // Verifica si ya está en formato DD-MM-YYYY
  if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) return dateStr;

  // Suponiendo que dateStr es YYYY-MM-DD
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
}

// Función para calcular días entre fechas
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs(Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
}

export default function FacturasTable() {
  const navigate = useNavigate();

  // Rango por defecto: día actual en ambas fechas
  const today = new Date();
  const todayFormatted = today.toISOString().split("T")[0];

  const [invoices, setInvoices] = useState([]);
  const [fromDate, setFromDate] = useState(todayFormatted);
  const [toDate, setToDate] = useState(todayFormatted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rangeWarning, setRangeWarning] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  // Verificar rango cuando cambian las fechas
  useEffect(() => {
    if (fromDate && toDate) {
      const days = daysBetween(fromDate, toDate);
      if (days > 3) {
        setRangeWarning(
          "El rango no debe exceder los 3 días para evitar problemas con el rendimiento."
        );
      } else {
        setRangeWarning(null);
      }
    }
  }, [fromDate, toDate]);

  // Traer facturas
  const fetchInvoices = async () => {
    if (!fromDate || !toDate) {
      setError("Debe seleccionar ambas fechas");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const formattedFromDate = formatDate(fromDate);
      const formattedToDate = formatDate(toDate);

      console.log(
        "Consultando facturas con fechas:",
        formattedFromDate,
        formattedToDate
      );

      // Manejo individual de cada petición para mejor control de errores
      let pendingData = [];
      let paidData = [];

      try {
        // Obtener facturas emitidas pendientes
        const pendingResp = await fetch(
          `${API_URL}/api/facturas-emitidas-pendientes?fromDate=${formattedFromDate}&toDate=${formattedToDate}`
        );

        if (!pendingResp.ok) {
          console.error(
            "Error en facturas pendientes:",
            pendingResp.status,
            pendingResp.statusText
          );
          const errorText = await pendingResp.text();
          console.error("Detalle del error:", errorText);
        } else {
          pendingData = await pendingResp.json();
        }
      } catch (pendingErr) {
        console.error("Error al obtener facturas pendientes:", pendingErr);
      }

      try {
        // Obtener facturas emitidas pagadas
        const paidResp = await fetch(
          `${API_URL}/api/facturas-emitidas-pagadas?fromDate=${formattedFromDate}&toDate=${formattedToDate}`
        );

        if (!paidResp.ok) {
          console.error(
            "Error en facturas pagadas:",
            paidResp.status,
            paidResp.statusText
          );
          const errorText = await paidResp.text();
          console.error("Detalle del error:", errorText);
        } else {
          paidData = await paidResp.json();
        }
      } catch (paidErr) {
        console.error("Error al obtener facturas pagadas:", paidErr);
      }

      // Combinar y procesar facturas
      let allInvoices = [];

      // Procesar facturas pendientes
      if (Array.isArray(pendingData)) {
        pendingData.forEach((inv) => {
          if (inv && typeof inv === "object") {
            const facturaData = inv.__values__ || inv;
            allInvoices.push({
              ...facturaData,
              status: "pendiente",
            });
          }
        });
      }

      // Procesar facturas pagadas
      if (Array.isArray(paidData)) {
        paidData.forEach((inv) => {
          if (inv && typeof inv === "object") {
            const facturaData = inv.__values__ || inv;
            allInvoices.push({
              ...facturaData,
              status: "pagada",
            });
          }
        });
      }

      console.log("Facturas procesadas:", allInvoices.length);
      setInvoices(allInvoices);

      // Si no se obtuvo ningún dato pero tampoco hubo errores, mostrar mensaje
      if (allInvoices.length === 0) {
        setError("No se encontraron facturas en el período seleccionado");
      }
    } catch (err) {
      console.error("Error al obtener facturas:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cargar facturas al montar el componente
  useEffect(() => {
    fetchInvoices();
  }, []); // Se ejecuta solo al montar el componente

  // Altura de la tabla
  const rowHeight = 48;
  const tableHeight = 15 * rowHeight;

  return (
    <Card className="shadow-sm border-primary w-100 mt-3">
      <Card.Body>
        <Card.Title as="h2" className="h5 mb-3">
          Facturas
        </Card.Title>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowFilter((s) => !s)}
          className="mb-3"
        >
          {showFilter ? "Ocultar Filtro" : "Mostrar Filtro"}
        </Button>

        {showFilter && (
          <Form className="mb-3 p-3 border rounded bg-light">
            <div className="row g-2">
              <div className="col-md-5">
                <Form.Group>
                  <Form.Label>Fecha Inicio</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    size="sm"
                  />
                </Form.Group>
              </div>
              <div className="col-md-5">
                <Form.Group>
                  <Form.Label>Fecha Fin</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    size="sm"
                  />
                </Form.Group>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <Button
                  variant="primary"
                  onClick={fetchInvoices}
                  size="sm"
                  className="w-100"
                >
                  Buscar
                </Button>
              </div>
            </div>
          </Form>
        )}

        {loading && (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" />
            <p className="mb-0 mt-2">Cargando facturas...</p>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}
        {rangeWarning && <Alert variant="warning">{rangeWarning}</Alert>}

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
                  <th>Orden de compra</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id || `invoice-${Math.random()}`}>
                    <td>
                      {inv.createdAt
                        ? new Date(inv.createdAt).toLocaleString()
                        : "N/A"}
                    </td>
                    <td>{inv.id || "Sin ID"}</td>
                    <td>${parseFloat(inv.totalPrice || 0).toLocaleString()}</td>
                    <td>
                      <Badge
                        bg={inv.status === "pagada" ? "success" : "warning"}
                      >
                        {inv.status === "pagada" ? "Pagada" : "Pendiente"}
                      </Badge>
                    </td>
                    <td>
                      {inv.orderId ? (
                        <Link
                          to={`/order-details/${inv.orderId}`}
                          className="btn btn-sm btn-primary"
                        >
                          Ver orden
                        </Link>
                      ) : (
                        <span className="text-muted">No disponible</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {!loading && !error && invoices.length === 0 && (
          <Alert variant="info">
            No hay facturas para mostrar. Selecciona fechas y presiona Buscar.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}
