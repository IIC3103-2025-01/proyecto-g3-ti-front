import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Card,
  Table,
  Spinner,
  Alert,
  Form,
  Button,
  ButtonGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { API_URL, BATCH_SIZE } from "../config/config";

export default function OrdersTableEnhanced() {
  const [orders, setOrders] = useState([]);
  const [count, setCount] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [stateFilter, setStateFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const containerRef = useRef();

  // hook para estados únicos (útil para los selectores)
  const uniqueChannels = useMemo(
    () => [...new Set(orders.map((o) => o.canal).filter(Boolean))],
    [orders]
  );
  const uniqueStates = useMemo(
    () => [...new Set(orders.map((o) => o.estado))],
    [orders]
  );

  // Función para obtener órdenes con filtros
  const fetchOrders = async (newSkip) => {
    // Construir URL con parámetros de filtro
    let url = `${API_URL}/api/desplegar_ordenes?skip=${newSkip}&limit=${BATCH_SIZE}`;

    // Añadir filtros si no están en "all"
    if (stateFilter !== "all") {
      url += `&estado=${stateFilter}`;
    }

    if (channelFilter !== "all") {
      url += `&canal=${channelFilter}`;
    }

    const resp = await fetch(url, { headers: { Accept: "application/json" } });
    if (!resp.ok) throw new Error("Error al obtener órdenes");
    const { count, orders: data } = await resp.json();

    setCount(count);
    setOrders((prev) => (newSkip === 0 ? data : [...prev, ...data]));
    setSkip((prev) => prev + data.length);
  };

  // Manejadores de cambio de filtros
  const handleStateFilterChange = (e) => {
    setStateFilter(e.target.value);
    setSkip(0); // Reinicia la paginación
    setOrders([]); // Limpia los datos actuales
  };

  const handleChannelFilterChange = (e) => {
    setChannelFilter(e.target.value);
    setSkip(0); // Reinicia la paginación
    setOrders([]); // Limpia los datos actuales
  };

  // Efecto para carga inicial
  useEffect(() => {
    setLoading(true);
    fetchOrders(0)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Efecto que observa cambios en los filtros
  useEffect(() => {
    setLoading(true);
    setOrders([]); // Limpiar órdenes actuales
    setSkip(0); // Reiniciar paginación
    fetchOrders(0)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [stateFilter, channelFilter]); // Dependencias: filtros

  // Infinite scroll
  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (
      scrollHeight - scrollTop <= clientHeight + 50 &&
      orders.length < count &&
      !loading
    ) {
      setLoading(true);
      fetchOrders(skip)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  };

  // Toggle detalle
  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // Loading / error
  if (loading && orders.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }
  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  return (
    <Card className="shadow-sm border-primary w-100">
      <Card.Body>
        <Card.Title as="h2" className="h5 mb-3">
          Últimas Órdenes
        </Card.Title>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <Form.Group className="mb-3" style={{ minWidth: "300px" }}>
            <Form.Label>Filtrar por estado:</Form.Label>
            <Form.Select value={stateFilter} onChange={handleStateFilterChange}>
              <option value="all">Todos</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" style={{ minWidth: "300px" }}>
            <Form.Label>Filtrar por canal:</Form.Label>
            <Form.Select
              value={channelFilter}
              onChange={handleChannelFilterChange}
            >
              <option value="all">Todos</option>
              {uniqueChannels.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>

        <div
          className="table-responsive"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
          ref={containerRef}
          onScroll={handleScroll}
        >
          <Table striped hover className="mb-0">
            <thead
              className="table-light"
              style={{
                position: "sticky",
                top: 0,
                background: "white",
                zIndex: 2,
              }}
            >
              <tr>
                {[
                  "SKU",
                  "ID",
                  "Canal",
                  "Cantidad",
                  "Estado de la Orden",
                  "Estado Facturación",
                ].map((h) => (
                  <th key={h} className="px-2 py-2 text-start text-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <React.Fragment key={o.id}>
                  <tr
                    className="align-middle"
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleExpand(o.id)}
                  >
                    <td className="px-2 py-2">{o.sku}</td>
                    <td className="px-2 py-2 text-nowrap">{o.id}</td>
                    <td className="px-2 py-2">{o.canal}</td>
                    <td className="px-2 py-2">{o.cantidad}</td>
                    <td className="px-2 py-2">{o.estado}</td>
                    <td className="px-2 py-2">
                      {o.facturado ? "Facturado" : "No facturado"}
                    </td>
                  </tr>
                  {expanded[o.id] && (
                    <tr>
                      <td colSpan="8" className="border-top-0 p-3 bg-light">
                        <dl className="row mb-2">
                          <dt className="col-sm-3">SKU</dt>
                          <dd className="col-sm-9">{o.sku}</dd>
                          <dt className="col-sm-3">ID</dt>
                          <dd className="col-sm-9">{o.id}</dd>
                          <dt className="col-sm-3">Cliente</dt>
                          <dd className="col-sm-9">{o.cliente}</dd>
                          <dt className="col-sm-3">Proveedor</dt>
                          <dd className="col-sm-9">{o.proveedor}</dd>
                          <dt className="col-sm-3">Canal</dt>
                          <dd className="col-sm-9">{o.canal}</dd>
                          <dt className="col-sm-3">Cantidad</dt>
                          <dd className="col-sm-9">{o.cantidad}</dd>
                          <dt className="col-sm-3">Precio Unitario</dt>
                          <dd className="col-sm-9">{o.precio_unitario}</dd>
                          <dt className="col-sm-3">Vencimiento</dt>
                          <dd className="col-sm-9">
                            {new Date(o.vencimiento).toLocaleString()}
                          </dd>
                          <dt className="col-sm-3">Facturado</dt>
                          <dd className="col-sm-9">
                            {o.facturado ? "Facturado" : "No facturado"}
                          </dd>
                        </dl>
                        <div>
                          <strong>Historial:</strong>
                          <Table size="sm" striped className="mb-0 mt-2">
                            <thead>
                              <tr>
                                <th>Estado</th>
                                <th>Fecha</th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.historial.map((h, i) => (
                                <tr key={i}>
                                  <td>{h.nombre}</td>
                                  <td>{new Date(h.fecha).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                        {o.factura && o.factura.__values__ && (
                          <Card className="mt-3">
                            <Card.Header>Detalle de la Factura</Card.Header>
                            <Card.Body>
                              <dl className="row mb-0">
                                <dt className="col-sm-4">ID</dt>
                                <dd className="col-sm-8">
                                  {o.factura.__values__.id}
                                </dd>
                                <dt className="col-sm-4">Cliente</dt>
                                <dd className="col-sm-8">
                                  {o.factura.__values__.client}
                                </dd>
                                <dt className="col-sm-4">Proveedor</dt>
                                <dd className="col-sm-8">
                                  {o.factura.__values__.supplier}
                                </dd>
                                <dt className="col-sm-4">Canal</dt>
                                <dd className="col-sm-8">
                                  {o.factura.__values__.channel}
                                </dd>
                                <dt className="col-sm-4">Estado</dt>
                                <dd className="col-sm-8">
                                  {o.factura.__values__.status}
                                </dd>
                                <dt className="col-sm-4">Precio</dt>
                                <dd className="col-sm-8">
                                  {o.factura.__values__.price}
                                </dd>
                                <dt className="col-sm-4">Interés</dt>
                                <dd className="col-sm-8">
                                  {o.factura.__values__.interest}
                                </dd>
                                <dt className="col-sm-4">Precio Total</dt>
                                <dd className="col-sm-8">
                                  {o.factura.__values__.totalPrice}
                                </dd>
                                <dt className="col-sm-4">Creada</dt>
                                <dd className="col-sm-8">
                                  {new Date(
                                    o.factura.__values__.createdAt
                                  ).toLocaleString()}
                                </dd>
                                <dt className="col-sm-4">Actualizada</dt>
                                <dd className="col-sm-8">
                                  {new Date(
                                    o.factura.__values__.updatedAt
                                  ).toLocaleString()}
                                </dd>
                              </dl>
                            </Card.Body>
                          </Card>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {loading && orders.length > 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-2">
                    <Spinner animation="border" size="sm" /> Cargando más...
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}
