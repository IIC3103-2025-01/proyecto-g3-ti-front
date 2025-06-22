// src/components/ObsoletosSummary.jsx
import React, { useState } from "react";
import {
  Card,
  ListGroup,
  Badge,
  Spinner,
  Alert,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { POLLING } from "../config/polling";
import { useApi } from "../hooks/useApi";

export default function ObsoletosSummary() {
  const { data, loading, error } = useApi("/api/obsoletos", {
    pollingInterval: POLLING.OBSOLETOS,
  });

  // Estado para el SKU seleccionado
  const [selectedSku, setSelectedSku] = useState(null);

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

  const entries = Object.entries(data || {});

  // Altura aproximada de un elemento de lista
  const itemHeight = 36; // en píxeles
  // Altura para mostrar aproximadamente 10 elementos (o todos si hay menos)
  const listHeight = Math.min(10, entries.length) * itemHeight;

  // Calcular el total de unidades obsoletas
  const totalObsoletos = entries.reduce(
    (sum, [_, items]) => sum + items.length,
    0
  );

  if (entries.length === 0) {
    return (
      <Card.Text className="text-muted">
        No hay productos próximos a vencer.
      </Card.Text>
    );
  }

  return (
    <div style={{ height: "100%" }} className="d-flex flex-column">
      <div className="d-flex justify-content-between mb-2">
        <strong>Productos por vencer</strong>
        {totalObsoletos > 0 && (
          <Badge bg="danger">Total: {totalObsoletos}</Badge>
        )}
      </div>

      <div
        style={{
          maxHeight: `${listHeight}px`,
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#6c757d #f8f9fa",
        }}
        className="custom-scrollbar"
      >
        <ListGroup variant="flush">
          {entries.map(([sku, items]) => {
            // Ahora usamos horas para expiración
            const hoursToExpiry = items[0]?.hours_to_expiry || 0;

            // Determinar color según proximidad a vencimiento en horas
            let badgeVariant = "secondary";
            let tooltipMessage = "✨ Tiempo suficiente";
            let emoji = "🕰️";

            if (hoursToExpiry <= 24) {
              badgeVariant = "danger";
              tooltipMessage = "🔥 ¡Última oportunidad! Menos de 24 horas";
              emoji = "⚡";
            } else if (hoursToExpiry <= 72) {
              badgeVariant = "warning";
              tooltipMessage = "⏰ ¡Corre! Menos de 72 horas";
              emoji = "🚨";
            } else if (hoursToExpiry <= 168) {
              badgeVariant = "info";
              tooltipMessage = "📊 Menos de una semana disponible";
              emoji = "📢";
            }

            return (
              <OverlayTrigger
                key={sku}
                placement="right"
                overlay={
                  <Tooltip id={`tooltip-${sku}`}>
                    <small>{tooltipMessage}</small>
                  </Tooltip>
                }
              >
                <ListGroup.Item
                  action
                  active={selectedSku === sku}
                  onClick={() =>
                    setSelectedSku(sku === selectedSku ? null : sku)
                  }
                  className="border-0 rounded-1 mb-1 py-2 d-flex justify-content-between align-items-center"
                  style={{
                    transition: "background-color 0.2s ease",
                    cursor: "pointer",
                  }}
                >
                  <span className={selectedSku === sku ? "fw-bold" : ""}>
                    {emoji} {sku}
                  </span>
                  <Badge bg={badgeVariant} pill className="ms-2">
                    {items.length} {items.length === 1 ? "unidad" : "unidades"}
                  </Badge>
                </ListGroup.Item>
              </OverlayTrigger>
            );
          })}
        </ListGroup>
      </div>
    </div>
  );
}
