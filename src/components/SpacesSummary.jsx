// src/components/SpacesSummary.jsx
import React from "react";
import { ListGroup, Badge, Spinner, Alert } from "react-bootstrap";
import { useApi } from "../hooks/useApi";

export default function SpacesSummary() {
  const { data, loading, error } = useApi("/api/spaces", {
    pollingInterval: 10000, // polling
  });

  if (loading) {
    return (
      <div className="text-center py-2">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }
  if (error) {
    return <Alert variant="danger">Error cargando espacios</Alert>;
  }

  // data.spaces viene de tu API original
  const spaces = data?.spaces || [];

  return (
    <ListGroup variant="flush">
      {spaces.map((s) => (
        <ListGroup.Item
          key={s.space_id}
          className="d-flex justify-content-between px-0 py-1"
        >
          <span className="text-capitalize">{s.type.replace("-", " ")}</span>
          <Badge bg="secondary">
            {s.used_space} / {s.total_space}
          </Badge>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
