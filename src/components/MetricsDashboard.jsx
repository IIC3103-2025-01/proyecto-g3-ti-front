// src/components/MetricsDashboard.jsx
import React from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { POLLING } from "../config/polling";
import SpacesCard from "./SpacesCard";
import StockCard from "./StockCard";
import ObsoletosCard from "./ObsoletosCard";
import BankStatementCard from "./BankStatementCard";

import { useApi } from "../hooks/useApi";

export default function MetricsDashboard() {
  const { data: spacesData, loading: l1 } = useApi("/api/spaces", {
    pollingInterval: 0,
  });
  const spaces = spacesData?.spaces || [];

  // sólo mostramos spinner mientras cargan los espacios
  if (l1) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  // Altura fija para todos los cards
  const cardHeight = "500px";

  // Estilo común para todas las columnas
  const colStyle = {
    display: "flex",
    flexDirection: "column",
  };

  // Estilo común para todos los cards
  const cardStyle = {
    height: cardHeight,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden", // Asegura que el contenido no se desborde
  };

  return (
    <Row className="gy-4 align-items-stretch">
      <Col md={4} style={colStyle}>
        <div style={cardStyle}>
          <SpacesCard />
        </div>
      </Col>
      <Col md={4} style={colStyle}>
        <div style={cardStyle}>
          <StockCard spaces={spaces} />
        </div>
      </Col>
      <Col md={4} style={colStyle}>
        <div style={cardStyle}>
          <ObsoletosCard />
        </div>
      </Col>
      <Col md={4} style={colStyle}>
        <div style={cardStyle}>
          <BankStatementCard />
        </div>
      </Col>
    </Row>
  );
}
