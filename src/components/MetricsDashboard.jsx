// src/components/MetricsDashboard.jsx
import React from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import OrdersPerHourCard from "./OrdersPerHour";
import BankStatementCard from "./BankStatementCard";
import SpacesCard from "./SpacesCard";
import StockCard from "./StockCard";
import ObsoletosCard from "./ObsoletosCard";
import { useApi } from "../hooks/useApi";

export default function MetricsDashboard() {
  const { data: spacesData, loading } = useApi("/api/spaces", {
    pollingInterval: 0,
  });
  const spaces = spacesData?.spaces || [];

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  // Estilo común para contenedores de tarjetas
  const cardContainerStyle = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div className="dashboard-container">
      {/* Primera fila: 3 componentes principales */}
      <Row className="g-4 mb-4">
        <Col lg={4}>
          <div style={cardContainerStyle}>
            <SpacesCard />
          </div>
        </Col>
        <Col lg={4}>
          <div style={cardContainerStyle}>
            <StockCard spaces={spaces} />
          </div>
        </Col>
        <Col lg={4}>
          <div style={cardContainerStyle}>
            <ObsoletosCard />
          </div>
        </Col>
      </Row>

      {/* Segunda fila: 2 componentes adicionales */}
      <Row className="g-4">
        <Col md={6}>
          <div style={cardContainerStyle}>
            <OrdersPerHourCard />
          </div>
        </Col>
        <Col md={6}>
          <div style={cardContainerStyle}>
            <BankStatementCard />
          </div>
        </Col>
      </Row>
    </div>
  );
}
