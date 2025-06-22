// src/components/OrdersPerHourCard.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  ListGroup,
  Badge,
  Spinner,
  Alert,
  ProgressBar,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useApi } from "../hooks/useApi";

export default React.memo(function OrdersPerHourCard() {
  const { data, loading, error } = useApi("/api/orders_per_hour", {
    pollingInterval: 0,
  });

  // Estado para el elemento seleccionado
  const [selectedHour, setSelectedHour] = useState(null);

  // Estado para el máximo valor de pedidos (para calcular porcentajes)
  const [maxOrders, setMaxOrders] = useState(0);

  // Actualizar el máximo cuando los datos cambian
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const max = Math.max(...data.map((entry) => entry.order_count));
      setMaxOrders(max);
    }
  }, [data]);

  if (loading)
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status" />
      </div>
    );
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  // data es un array [{ hour: "...", order_count: N }, ...]
  const entries = Array.isArray(data) ? data : [];

  // Altura aproximada de un elemento de lista (ajustar según necesidades)
  const itemHeight = 42; // en píxeles (ligeramente aumentado para acomodar la barra de progreso)
  // Altura para mostrar aproximadamente 15 elementos
  const listHeight = Math.min(15, entries.length) * itemHeight;

  // Calcular el total de pedidos
  const totalOrders = entries.reduce(
    (sum, entry) => sum + entry.order_count,
    0
  );

  return (
    <Card className="h-100 shadow-sm border-primary">
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h2" className="h5 mb-3 d-flex justify-content-between">
          <span>Pedidos por hora</span>
          {totalOrders > 0 && (
            <Badge bg="primary" className="align-self-start">
              Total: {totalOrders}
            </Badge>
          )}
        </Card.Title>

        {entries.length === 0 ? (
          <Card.Text className="text-muted">
            No hay pedidos en este rango de tiempo.
          </Card.Text>
        ) : (
          <div
            style={{
              maxHeight: `${listHeight}px`,
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "#6c757d #f8f9fa",
            }}
            className="custom-scrollbar flex-grow-1"
          >
            <ListGroup variant="flush">
              {entries.map(({ hour, order_count }) => {
                // parseamos la hora y solo mostramos HH:MM
                const date = new Date(hour);
                const label = date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                // Calculamos el porcentaje respecto al máximo
                const percentage = Math.round((order_count / maxOrders) * 100);

                // Determinamos el color de la barra según el porcentaje
                let variantColor = "info"; // Default
                let tooltipMessage =
                  "Actividad baja: menos del 25% del máximo de pedidos";

                if (percentage > 75) {
                  variantColor = "danger";
                  tooltipMessage =
                    "Actividad muy alta: más del 75% del máximo de pedidos";
                } else if (percentage > 50) {
                  variantColor = "warning";
                  tooltipMessage =
                    "Actividad alta: entre 50-75% del máximo de pedidos";
                } else if (percentage > 25) {
                  variantColor = "success";
                  tooltipMessage =
                    "Actividad moderada: entre 25-50% del máximo de pedidos";
                }

                return (
                  <OverlayTrigger
                    placement="right"
                    overlay={
                      <Tooltip id={`tooltip-${hour}`}>
                        <small>
                          {tooltipMessage}
                          <br />
                          {order_count} de {maxOrders} pedidos máximos
                        </small>
                      </Tooltip>
                    }
                  >
                    <ListGroup.Item
                      key={hour}
                      action
                      active={selectedHour === hour}
                      onClick={() =>
                        setSelectedHour(hour === selectedHour ? null : hour)
                      }
                      className="border-0 rounded-1 mb-1 py-2"
                      style={{
                        transition: "background-color 0.2s ease",
                        cursor: "pointer",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-medium">{label}</span>
                        <Badge
                          bg={selectedHour === hour ? "light" : "secondary"}
                          text={selectedHour === hour ? "dark" : "light"}
                          pill
                          className="ms-2"
                        >
                          {order_count}{" "}
                          {order_count === 1 ? "pedido" : "pedidos"}
                        </Badge>
                      </div>
                      <ProgressBar
                        now={percentage}
                        variant={variantColor}
                        style={{
                          height: "6px",
                          opacity: selectedHour === hour ? 1 : 0.7,
                          transition: "opacity 0.3s ease",
                        }}
                      />
                    </ListGroup.Item>
                  </OverlayTrigger>
                );
              })}
            </ListGroup>
          </div>
        )}
      </Card.Body>
    </Card>
  );
});
