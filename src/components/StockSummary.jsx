// src/components/StockSummary.jsx
import React from "react";
import { Card, ListGroup, Badge, Spinner, Alert } from "react-bootstrap";
import { POLLING } from "../config/polling";
import { useApi } from "../hooks/useApi";

export default function StockSummary({ spaces }) {
  const { data, loading, error } = useApi("/api/stock", {
    pollingInterval: POLLING.STOCK,
  });

  if (loading) {
    return (
      <div className="text-center py-2">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }
  // Too Many Requests
  if (error?.startsWith?.("Error 429")) {
    return (
      <Alert variant="warning">
        🍵 Demasiadas peticiones. Por favor espera unos segundos antes de
        reintentar.
      </Alert>
    );
  }

  // Internal Server Error
  if (error?.startsWith?.("Error 500")) {
    return <Alert variant="warning">🤨 Espera un momentito👌</Alert>;
  }

  // cualquier otro error
  if (error) {
    return <Alert variant="danger">Error cargando espacios: {error}</Alert>;
  }

  // Altura aproximada para mostrar 3 tarjetas antes de scroll
  const cardHeight = 130; // altura aproximada por tarjeta
  const maxVisibleCards = 3; // número de tarjetas visibles antes de scroll
  const containerHeight = data
    ? Math.min(Object.keys(data).length, maxVisibleCards) * cardHeight
    : 0;

  return (
    <div
      style={{
        maxHeight: containerHeight > 0 ? `${containerHeight}px` : "400px",
        overflowY: "auto",
        paddingRight: "5px", // espacio para la barra de desplazamiento
      }}
    >
      {Object.entries(data).map(([sku, info]) => (
        <Card key={sku} className="mb-3 border-secondary">
          <Card.Header className="d-flex justify-content-between">
            <strong>{sku}</strong>
            <Badge bg="secondary">{info.total}</Badge>
          </Card.Header>
          <ListGroup variant="flush">
            {Object.entries(info.por_espacio).map(([spaceId, qty]) => {
              const espacio = spaces.find((s) => s.space_id === spaceId);
              const label = espacio
                ? `${espacio.type} (${spaceId.slice(-4)})`
                : spaceId;
              return (
                <ListGroup.Item
                  key={spaceId}
                  className="px-3 py-1 d-flex justify-content-between"
                >
                  <small>{label}</small>
                  <Badge bg="light" text="dark">
                    {qty}
                  </Badge>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Card>
      ))}
    </div>
  );
}
