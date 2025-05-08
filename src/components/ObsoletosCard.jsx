// src/components/ObsoletosCard.jsx
import React from "react";
import { Card, ListGroup, Badge, Spinner, Alert } from "react-bootstrap";
import { useApi } from "../hooks/useApi";

export default React.memo(function ObsoletosCard() {
  const { data, loading, error } = useApi("/api/obsoletos", {
    pollingInterval: 0,
  });

  if (loading)
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status" />
      </div>
    );
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  const entries = Object.entries(data);
  return (
    <Card className="h-100 shadow-sm border-primary">
      <Card.Body>
        <Card.Title as="h2" className="h5 mb-3">
          Productos por vencer (±3h)
        </Card.Title>
        {entries.length === 0 ? (
          <Card.Text className="text-muted">
            No hay productos próximos a vencer.
          </Card.Text>
        ) : (
          <ListGroup variant="flush">
            {entries.map(([sku, items]) => (
              <ListGroup.Item
                key={sku}
                className="d-flex justify-content-between px-0 py-1"
              >
                <span>{sku}</span>
                <Badge bg="secondary">{items.length} unidades</Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
});
