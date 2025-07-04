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

// const BATCH_SIZE = 100;

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

  // hook para estados únicos
  const uniqueChannels = useMemo(
    () => [...new Set(orders.map((o) => o.canal).filter(Boolean))],
    [orders]
  );
  const uniqueStates = useMemo(
    () => [...new Set(orders.map((o) => o.estado))],
    [orders]
  );

  // carga inicial
  useEffect(() => {
    setLoading(true);
    fetchOrders(0)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // trae batch de órdenes
  const fetchOrders = async (newSkip) => {
    const resp = await fetch(
      `${API_URL}/api/desplegar_ordenes?skip=${newSkip}&limit=${BATCH_SIZE}`,
      { headers: { Accept: "application/json" } }
    );
    if (!resp.ok) throw new Error("Error al obtener órdenes");
    const { count, orders: data } = await resp.json();
    setCount(count);
    setOrders((prev) => (newSkip === 0 ? data : [...prev, ...data]));
    setSkip((prev) => prev + data.length);
  };

  // infinite scroll
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

  // toggle detalle
  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // decision endpoint
  // const handleDecision = async (id, newState, confirmMsg) => {
  //   if (confirmMsg && !window.confirm(confirmMsg)) return;
  //   // detect remote vs local
  //   const isRemote = API_URL.includes("ordenes-compra");
  //   const url = isRemote
  //     ? `${API_URL}/ordenes/${id}/estado`
  //     : `${API_URL}/api/ordenes/${id}/decision`;

  //   try {
  //     const resp = await fetch(url, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ estado: newState }),
  //     });
  //     if (!resp.ok) {
  //       let msg = resp.statusText;
  //       try {
  //         const body = await resp.json();
  //         msg = body.detail?.[0]?.msg || JSON.stringify(body);
  //       } catch {}
  //       throw new Error(msg);
  //     }
  //     setOrders((prev) =>
  //       prev.map((o) => (o.id === id ? { ...o, estado: newState } : o))
  //     );
  //   } catch (err) {
  //     alert("No se pudo cambiar el estado: " + err.message);
  //   }
  // };

  // loading / error
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

  // aplica filtro
  const displayed = orders.filter(
    (o) =>
      (stateFilter === "all" || o.estado === stateFilter) &&
      (channelFilter === "all" || o.canal === channelFilter)
  );

  return (
    <Card className="shadow-sm border-primary w-100">
      <Card.Body>
        <Card.Title as="h2" className="h5 mb-3">
          Últimas Órdenes
        </Card.Title>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <Form.Group className="mb-3" style={{ minWidth: "300px" }}>
            <Form.Label>Filtrar por estado:</Form.Label>
            <Form.Select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
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
              onChange={(e) => setChannelFilter(e.target.value)}
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
                  // "Acciones",
                ].map((h) => (
                  <th key={h} className="px-2 py-2 text-start text-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((o) => (
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
                    {/* <td className="px-2 py-2">
                      <ButtonGroup size="sm">
                        {o.estado === "creada" && (
                          <>
                            <Button
                              variant="success"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDecision(o.id, "aceptada", null);
                              }}
                            >
                              Aceptar
                            </Button>
                            <Button
                              variant="danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDecision(o.id, "rechazada", "¿Rechazar?");
                              }}
                            >
                              Rechazar
                            </Button>
                          </>
                        )}
                        {o.estado === "aceptada" && (
                          <Button
                            variant="warning"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecision(o.id, "anulada", "¿Anular?");
                            }}
                          >
                            Anular
                          </Button>
                        )}
                      </ButtonGroup>
                    </td> */}
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
