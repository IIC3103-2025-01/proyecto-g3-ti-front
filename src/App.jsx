// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MetricsDashboard from "./components/MetricsDashboard";
import OrdersTable       from "./components/OrdersTable";
import OrderDetails      from "./components/OrderDetails";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 p-6">
        <header className="container mx-auto mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Starlink Factory Dashboard
          </h1>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <div className="container mx-auto space-y-8">
                <MetricsDashboard />
                <OrdersTable />
              </div>
            }
          />
          <Route path="/pedido/:id" element={<OrderDetails />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
