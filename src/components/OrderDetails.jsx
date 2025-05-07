import React from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Card, Spinner, Alert, Button } from "react-bootstrap";
import { useApi } from "../hooks/useApi";

export default function OrderDetails() {
  const { id } = useParams();
  const { data, loading, error } = useApi(`/api/orders?skip=0&limit=100`);

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status" />
      </div>
    );
  }
  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  const order = data.orders.find((o) => o.order_id === id);
  if (!order) {
    return <Alert variant="warning">Pedido no encontrado</Alert>;
  }

  return (
    <Container className="py-4">
      <Card>
        <Card.Body>
          <Card.Title as="h2" className="h4 mb-3">
            {order.order_id}
          </Card.Title>

          <Card.Text>
            <strong>Cliente:</strong> {order.client}
          </Card.Text>
          <Card.Text>
            <strong>Proveedor:</strong> {order.supplier}
          </Card.Text>
          <Card.Text>
            <strong>Canal:</strong> {order.channel}
          </Card.Text>
          <Card.Text>
            <strong>Estado:</strong> {order.status}
          </Card.Text>

          <Card.Text>
            <strong>Payload completo:</strong>
          </Card.Text>
          <pre className="bg-light p-3 rounded">
            {JSON.stringify(order.payload, null, 2)}
          </pre>

          <Button variant="link" as={Link} to="/">
            ← Volver
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
