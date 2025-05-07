import React from "react";
import { Row, Col, Card, Spinner, ListGroup, Badge } from "react-bootstrap";
import { useApi } from "../hooks/useApi";

export default function MetricsDashboard() {
  const { data: spacesData, loading: l1 } = useApi("/api/spaces");
  const { data: stockData,  loading: l2 } = useApi("/api/stock_summary");
  const { data: obData,     loading: l3 } = useApi("/api/obsoletos");

  if (l1 || l2 || l3) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  return (
    <Row className="gy-4 align-items-stretch">
      {/* Espacios */}
      <Col md={4}>
        <Card className="h-100 shadow-sm border-primary">
          <Card.Body>
            <Card.Title as="h2" className="h5 mb-3">
              Espacios por Sector
            </Card.Title>
            <ListGroup variant="flush">
              {spacesData.spaces.map((s) => (
                <ListGroup.Item
                  key={s.space_id}
                  className="d-flex justify-content-between px-0 py-1"
                >
                  <span>{s.type}</span>
                  <Badge bg="secondary">
                    {s.used_space} / {s.total_space}
                  </Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>

      {/* Stock */}
      <Col md={4}>
        <Card className="h-100 shadow-sm border-primary">
          <Card.Body>
            <Card.Title as="h2" className="h5 mb-3">
              Stock por SKU
            </Card.Title>
            <ListGroup variant="flush">
              {Object.entries(stockData).map(([sku, info]) => (
                <ListGroup.Item
                  key={sku}
                  className="d-flex justify-content-between px-0 py-1"
                >
                  <span>{sku}</span>
                  <Badge bg="secondary">{info.total}</Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>

      {/* Obsoletos */}
      <Col md={4}>
        <Card className="h-100 shadow-sm border-primary">
          <Card.Body>
            <Card.Title as="h2" className="h5 mb-3">
              Productos por vencer (±3h)
            </Card.Title>
            {Object.entries(obData).length === 0 ? (
              <Card.Text className="text-muted">
                No hay productos próximos a vencer.
              </Card.Text>
            ) : (
              <ListGroup variant="flush">
                {Object.entries(obData).map(([sku, items]) => (
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
      </Col>
    </Row>
  );
}
