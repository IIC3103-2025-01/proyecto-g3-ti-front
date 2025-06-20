// src/components/BankStatementCard.jsx
import React from "react";
import { Card } from "react-bootstrap";
import BankStatementSummary from "./BankStatementSummary";

export default function BankStatementCard() {
  return (
    <Card className="h-100 shadow-sm border-primary">
      <Card.Body>
        <Card.Title as="h2" className="h5 mb-3">
          Estado Financiero
        </Card.Title>
        <BankStatementSummary />
      </Card.Body>
    </Card>
  );
}
