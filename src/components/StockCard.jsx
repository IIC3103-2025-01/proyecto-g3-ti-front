// src/components/StockCard.jsx
import React from "react";
import { Card, ListGroup, Badge, Spinner, Alert } from "react-bootstrap";
import { useApi } from "../hooks/useApi";

export default React.memo(function StockCard({ spaces }) {
  const { data, loading, error } = useApi("/api/stock_summary", {
    pollingInterval: 15000,
  });

  if (loading)
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status" />
      </div>
    );
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  return (
    <Card className="h-100 shadow-sm border-primary">
      <Card.Body>
        <Card.Title as="h2" className="h5 mb-3">
          Stock por SKU
        </Card.Title>
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
      </Card.Body>
    </Card>
  );
});
