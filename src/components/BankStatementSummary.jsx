// src/components/BankStatementSummary.jsx
import React, { useState, useCallback } from "react";
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

  // Fechas por defecto (afectan la carga inicial y el formulario)
  const [fromDate, setFromDate] = useState("2025-06-23");
  const [toDate, setToDate] = useState("2025-06-25");

  const fetchBalance = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      try {
        let from, to;

        // --- INICIO DE LA LÓGICA MODIFICADA ---
        // Determinar las fechas a usar en formato YYYY-MM-DD
        if (params.useToday) {
          const today = new Date();
          const todayStr = today.toISOString().split("T")[0];
          from = todayStr;
          to = todayStr; // Para "hoy", la fecha de inicio y fin es la misma
        } else if (params.usePreviousDays) {
          const today = new Date();
          const todayStr = today.toISOString().split("T")[0];
          const twoDaysAgo = new Date();
          twoDaysAgo.setDate(today.getDate() - 2);
          const twoDaysAgoStr = twoDaysAgo.toISOString().split("T")[0];
          from = twoDaysAgoStr;
          to = todayStr;
        } else if (params.useCustomDates) {
          from = fromDate;
          to = toDate;
        }
        // Si no se pasa ningún parámetro (en la carga inicial), 'from' y 'to' serán undefined,
        // y la API usará sus valores por defecto.

        // --- FIN DE LA LÓGICA MODIFICADA ---

        // 1. Formatear las fechas a DD-MM-YYYY para la URL si existen
        const fromFormatted = from
          ? from.split("-").reverse().join("-")
          : undefined;
        const toFormatted = to ? to.split("-").reverse().join("-") : undefined;

        // 2. Construir los parámetros de consulta (query params)
        const queryParams = new URLSearchParams();
        if (fromFormatted) queryParams.append("fromDate", fromFormatted);
        if (toFormatted) queryParams.append("toDate", toFormatted);

        // 3. Crear la URL final con los parámetros
        const url = `${API_URL}/api/balance?${queryParams.toString()}`;
        console.log("Enviando solicitud a la URL:", url);

        // 4. Configurar la solicitud POST (corregida en el paso anterior para 'Bad Request')
        const requestOptions = {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        };

        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP ${response.status} ${response.statusText}: ${errorText}`
          );
        }

        const result = await response.json();
        console.log("Datos recibidos:", result);
        setData(result);
      } catch (err) {
        console.error("Error en fetchBalance:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [fromDate, toDate]
  );

  // Cargar datos al montar el componente (usa los defaults de la API)
  React.useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Manejar consulta con fechas personalizadas
  const handleCustomDateSearch = (e) => {
    e.preventDefault();
    fetchBalance({ useCustomDates: true });
  };

  if (loading && !data) {
    return (
      <div className="text-center py-2">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (error && error.includes("429")) {
    return (
      <Alert variant="warning">
        🍵 Demasiadas peticiones. Por favor espera unos segundos antes de
        reintentar.
      </Alert>
    );
  }

  if (error && error.includes("500")) {
    return (
      <Alert variant="warning">
        🤨 El servidor encontró un problema. Espera un momentito👌
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">Error cargando datos financieros: {error}</Alert>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-2">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  const { deuda, egresos, ingresos, balance } = data;

  return (
    <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "5px" }}>
      {/* Selector de fechas */}
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
            <Form onSubmit={handleCustomDateSearch}>
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
              {/* --- INICIO DE BOTONES MODIFICADOS --- */}
              <div className="d-flex justify-content-end">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => fetchBalance({ usePreviousDays: true })}
                  disabled={loading}
                  className="me-2"
                >
                  Últimos 2 días
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => fetchBalance({ useToday: true })}
                  disabled={loading}
                >
                  Consultar Hoy
                </Button>
              </div>
              {/* --- FIN DE BOTONES MODIFICADOS --- */}
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

      {/* Tarjeta de Saldo en Caja */}
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
