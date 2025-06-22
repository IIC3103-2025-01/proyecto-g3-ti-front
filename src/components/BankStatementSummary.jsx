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

export default function BankStatementSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fechas por defecto (23-06-2025 al 25-06-2025)
  const [fromDate, setFromDate] = useState("2025-06-23");
  const [toDate, setToDate] = useState("2025-06-25");

  // Función simplificada para obtener datos
  const fetchBalance = useCallback(
    async (option = "default") => {
      setLoading(true);
      setError(null);

      try {
        let requestBody = {};

        if (option === "lastDays") {
          // Últimos 2 días hasta hoy
          const today = new Date();
          const todayStr = today.toISOString().split("T")[0];

          const twoDaysAgo = new Date();
          twoDaysAgo.setDate(today.getDate() - 2);
          const twoDaysAgoStr = twoDaysAgo.toISOString().split("T")[0];

          // Formatear fechas a DD-MM-YYYY
          requestBody.fromDate = twoDaysAgoStr.split("-").reverse().join("-");
          requestBody.toDate = todayStr.split("-").reverse().join("-");
        } else if (option === "today") {
          // Solo hoy
          const today = new Date();
          const todayStr = today.toISOString().split("T")[0];
          const formattedToday = todayStr.split("-").reverse().join("-");

          requestBody.fromDate = formattedToday;
          requestBody.toDate = formattedToday;
        } else if (option === "custom") {
          // Usar fechas personalizadas
          requestBody.fromDate = fromDate.split("-").reverse().join("-");
          requestBody.toDate = toDate.split("-").reverse().join("-");
        }
        // Si es 'default', no se envían parámetros - la API usará sus valores por defecto

        const response = await fetch(`${API_URL}/api/balance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
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

  // Cargar datos al iniciar
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Si estamos cargando inicialmente
  if (loading && !data) {
    return (
      <div className="text-center py-2">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  // Si hay errores
  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  // Si no hay datos
  if (!data) {
    return (
      <div className="text-center py-2">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  // Extraer datos
  const { deuda, egresos, ingresos, balance } = data;

  return (
    <div style={{ height: "100%", overflowY: "auto", paddingRight: "5px" }}>
      {/* Filtro de fechas */}
      <Card className="mb-3 border-info">
        <Card.Header className="d-flex justify-content-between bg-info text-white">
          <strong>Filtrar por fechas</strong>
          <Button
            variant="light"
            size="sm"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            {showDatePicker ? "Ocultar" : "Mostrar"}
          </Button>
        </Card.Header>

        {showDatePicker && (
          <Card.Body className="py-2">
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                fetchBalance("custom");
              }}
            >
              <Row>
                <Col md={5}>
                  <Form.Group className="mb-2">
                    <Form.Label>Desde:</Form.Label>
                    <Form.Control
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group className="mb-2">
                    <Form.Label>Hasta:</Form.Label>
                    <Form.Control
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button
                    type="submit"
                    variant="primary"
                    className="mb-2 w-100"
                    disabled={loading}
                  >
                    Buscar
                  </Button>
                </Col>
              </Row>
              <div className="d-flex justify-content-end">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => fetchBalance("lastDays")}
                  disabled={loading}
                  className="me-2"
                >
                  Últimos 2 días
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => fetchBalance("today")}
                  disabled={loading}
                >
                  Consultar Hoy
                </Button>
              </div>
            </Form>
          </Card.Body>
        )}
      </Card>

      {/* Indicador de carga */}
      {loading && (
        <div className="text-center py-2 mb-3">
          <Spinner animation="border" size="sm" /> Actualizando datos...
        </div>
      )}

      {/* Tarjeta de Deuda */}
      <Card className="mb-3 border-danger">
        <Card.Header className="d-flex justify-content-between bg-danger text-white">
          <strong>Deuda</strong>
          <Badge bg="light" text="danger">
            {deuda?.count || 0} facturas
          </Badge>
        </Card.Header>
        <Card.Body className="py-2">
          <h3 className="text-danger m-0">{deuda?.sum || 0}</h3>
        </Card.Body>
      </Card>

      {/* Tarjeta de Egresos */}
      <Card className="mb-3 border-warning">
        <Card.Header className="d-flex justify-content-between bg-warning text-dark">
          <strong>Egresos</strong>
          <Badge bg="light" text="dark">
            {egresos?.count || 0} facturas
          </Badge>
        </Card.Header>
        <Card.Body className="py-2">
          <h3 className="text-warning m-0">{egresos?.sum || 0}</h3>
        </Card.Body>
      </Card>

      {/* Tarjeta de Ingresos */}
      <Card className="mb-3 border-success">
        <Card.Header className="d-flex justify-content-between bg-success text-white">
          <strong>Ingresos</strong>
          <Badge bg="light" text="success">
            {ingresos?.count || 0} facturas
          </Badge>
        </Card.Header>
        <Card.Body className="py-2">
          <h3 className="text-success m-0">{ingresos?.sum || 0}</h3>
        </Card.Body>
      </Card>

      {/* Tarjeta de Balance */}
      <Card className="mb-3 border-primary">
        <Card.Header className="d-flex justify-content-between bg-primary text-white">
          <strong>Saldo en Caja</strong>
          <Badge bg="light" text="primary">
            Balance
          </Badge>
        </Card.Header>
        <Card.Body className="py-2">
          <h3
            className={`m-0 ${balance >= 0 ? "text-success" : "text-danger"}`}
          >
            {balance}
          </h3>
        </Card.Body>
      </Card>
    </div>
  );
}
