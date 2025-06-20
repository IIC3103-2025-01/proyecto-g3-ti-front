// src/components/BankStatementSummary.jsx
import React from "react";
import { Card, Badge, Spinner, Alert } from "react-bootstrap";
import { POLLING } from "../config/polling";
import { useApi } from "../hooks/useApi";

export default function BankStatementSummary() {
  const { data, loading, error } = useApi("/api/get-bank-statement", {
    pollingInterval: POLLING.BANK || 60000, // 60 segundos por defecto
  });

  if (loading) {
    return (
      <div className="text-center py-2">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (error?.startsWith?.("Error 429")) {
    return (
      <Alert variant="warning">
        🍵 Demasiadas peticiones. Por favor espera unos segundos antes de
        reintentar.
      </Alert>
    );
  }

  if (error?.startsWith?.("Error 500")) {
    return <Alert variant="warning">🤨 Espera un momentito👌</Alert>;
  }

  if (error) {
    return (
      <Alert variant="danger">Error cargando datos financieros: {error}</Alert>
    );
  }

  const balance = data?.values?.balance || 0;

  // Formatear número como moneda CLP
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="mb-3 border-primary">
      <Card.Header className="d-flex justify-content-between bg-primary text-white">
        <strong>Saldo en Cuenta</strong>
        <Badge bg="light" text="primary">
          Balance
        </Badge>
      </Card.Header>
      <Card.Body className="py-3">
        <h3 className={`m-0 ${balance >= 0 ? "text-success" : "text-danger"}`}>
          {formatCurrency(balance)}
        </h3>
      </Card.Body>
    </Card>
  );
}
