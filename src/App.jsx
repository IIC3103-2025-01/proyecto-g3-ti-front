import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Container, Navbar } from "react-bootstrap";

import MetricsDashboard from "./components/MetricsDashboard";
import OrdersTable from "./components/OrdersTable";
import OrderDetails from "./components/OrderDetails";
import PedidosTable from "./components/PedidosTable";
import OrdersPerHourCard from "./components/OrdersPerHour";
import PedidosDetails from "./components/PedidosDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar bg="light" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>Starlink Factory Dashboard</Navbar.Brand>
        </Container>
      </Navbar>

      <Container>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <MetricsDashboard />
                <div className="mt-4">
                  <OrdersPerHourCard />
                </div>
                <div className="mt-4">
                  <OrdersTable />
                </div>
                <div className="mt-4">
                  <PedidosTable />
                </div>
              </>
            }
          />
          <Route path="/orden/:id" element={<OrderDetails />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}
