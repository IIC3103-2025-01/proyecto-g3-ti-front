// src/components/BankStatementSummary.jsx
import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  Badge,
  Spinner,
  Alert,
  Button,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { API_URL } from "../config/config";

// Función helper para formatear fechas de YYYY-MM-DD (del input) a DD-MM-YYYY (para la API)
const formatDateForApi = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};

// Sub-componente para las tarjetas de estadísticas
const StatCard = ({ title, data, variant, showCount = true }) => {
  const value = data?.sum ?? 0;
  const count = data?.count ?? 0;
  const isWarning = variant === "warning";

  return (
    <Card className={`mb-3 border-${variant}`}>
      <Card.Header
        className={`d-flex justify-content-between bg-${variant} ${
          isWarning ? "text-dark" : "text-white"
        }`}
      >
        <strong>{title}</strong>
        {showCount && (
          <Badge bg="light" text={isWarning ? "dark" : variant}>
            {count} facturas
          </Badge>
        )}
      </Card.Header>
      <Card.Body className="py-2">
        <h3 className={`m-0 text-${variant}`}>
          {new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
          }).format(value)}
        </h3>
      </Card.Body>
    </Card>
  );
};

export default function BankStatementSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fechas en el estado del componente, formato YYYY-MM-DD para el input type="date"
  const [fromDate, setFromDate] = useState("2025-06-23");
  const [toDate, setToDate] = useState("2025-06-25");

  const fetchBalance = useCallback(
    async (option = "default") => {
      setLoading(true);
      setError(null);

      try {
        let fromDateStr, toDateStr;

        if (option === "custom") {
          fromDateStr = formatDateForApi(fromDate);
          toDateStr = formatDateForApi(toDate);
        } else {
          // Caso "default" usará las fechas del estado
          fromDateStr = formatDateForApi(fromDate);
          toDateStr = formatDateForApi(toDate);
        }

        // Construir la URL con los parámetros de query
        const url = `${API_URL}/api/balance?fromDate=${fromDateStr}&toDate=${toDateStr}`;

        console.log("🚀 Llamando al endpoint con la URL:", url);

        // Realizar la petición GET
        const response = await fetch(url, {
          method: "GET", // <-- MÉTODO CAMBIADO A GET
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorDetail =
            errorData.detail?.[0]?.msg ||
            JSON.stringify(errorData.detail) ||
            response.statusText;
          throw new Error(`Error ${response.status}: ${errorDetail}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [fromDate, toDate]
  );

  // Carga inicial de datos al montar el componente
  useEffect(() => {
    fetchBalance();
  }, []);

  if (error)
    return (
      <Alert variant="danger">
        Error al cargar el balance: {error.message}
      </Alert>
    );
  if (!data && loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  if (!data)
    return <Alert variant="info">No hay datos de balance para mostrar.</Alert>;

  const { deuda, egresos, ingresos, balance } = data;

  return (
    <div style={{ height: "100%", overflowY: "auto", paddingRight: "5px" }}>
      <Card className="mb-3 border-info">
        <Card.Header className="d-flex justify-content-between align-items-center bg-info text-white">
          <strong>Resumen Financiero</strong>
        </Card.Header>
        <Card.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              fetchBalance("custom");
            }}
          >
            <Row className="align-items-end">
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="mb-1 small">Desde:</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    size="sm"
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="mb-1 small">Hasta:</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    size="sm"
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  size="sm"
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    "Buscar"
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <StatCard
        title="Deuda (Facturas por Pagar)"
        data={deuda}
        variant="danger"
      />
      <StatCard
        title="Egresos (Facturas Pagadas)"
        data={egresos}
        variant="warning"
      />
      <StatCard
        title="Ingresos (Facturas Emitidas)"
        data={ingresos}
        variant="success"
      />
      <StatCard
        title="Saldo en Caja"
        data={{ sum: balance }} // Envolver el valor en un objeto con propiedad 'sum'
        variant={balance >= 0 ? "primary" : "danger"} // Color rojo si es negativo
        showCount={false}
      />
    </div>
  );
}
