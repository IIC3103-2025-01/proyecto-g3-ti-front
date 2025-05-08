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
  if (error) {
    return <Alert variant="danger">Error cargando stock: {error}</Alert>;
  }

  return (
    <>
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
                  className="px-0 py-1 d-flex justify-content-between"
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
    </>
  );
}
