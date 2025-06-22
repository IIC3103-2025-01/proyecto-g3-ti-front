// src/components/StockSummary.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  ListGroup,
  Badge,
  Spinner,
  Alert,
  ProgressBar,
  Button,
  InputGroup,
  FormControl,
  Row,
  Col,
  Collapse,
  OverlayTrigger,
  Tooltip,
  Dropdown,
} from "react-bootstrap";
import { POLLING } from "../config/polling";
import { useApi } from "../hooks/useApi";

// Iconos para diferentes tipos de SKU basados en prefijo
const SKU_ICONS = {
  ALU: "⚙️",
  MOD: "📱",
  SENSOR: "📡",
  BAT: "🔋",
  ANTCOM: "📶",
  PROD: "📦",
  COBERT: "🛡️",
  PCB: "💾",
  MICRO: "🔬",
  default: "📦",
};

// Obtener el icono adecuado para un SKU
const getSkuIcon = (sku) => {
  const prefix = Object.keys(SKU_ICONS).find((prefix) =>
    sku.toUpperCase().startsWith(prefix)
  );
  return prefix ? SKU_ICONS[prefix] : SKU_ICONS.default;
};

export default function StockSummary({ spaces }) {
  const { data, loading, error } = useApi("/api/stock", {
    pollingInterval: POLLING.STOCK,
  });

  // Estados para interactividad
  const [expandedSku, setExpandedSku] = useState(null);
  const [sortBy, setSortBy] = useState("name"); // name, quantity, locations
  const [searchQuery, setSearchQuery] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [animatedItems, setAnimatedItems] = useState([]);

  // Configurar animaciones de entrada
  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        setAnimatedItems(Object.keys(data));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="text-center py-2">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  // Too Many Requests
  if (error?.startsWith?.("Error 429")) {
    return (
      <Alert variant="warning">
        🍵 Demasiadas peticiones. Por favor espera unos segundos antes de
        reintentar.
      </Alert>
    );
  }

  // Internal Server Error
  if (error?.startsWith?.("Error 500")) {
    return <Alert variant="warning">🤨 Espera un momentito👌</Alert>;
  }

  // cualquier otro error
  if (error) {
    return <Alert variant="danger">Error cargando stock: {error}</Alert>;
  }

  if (!data || Object.keys(data).length === 0) {
    return <Alert variant="info">No hay datos de stock disponibles.</Alert>;
  }

  // Preparar los datos
  const stockEntries = Object.entries(data || {}).map(([sku, info]) => {
    const locationCount = Object.keys(info.por_espacio).length;
    const maxInOneLocation = Math.max(...Object.values(info.por_espacio));
    const percentInOneLocation = Math.round(
      (maxInOneLocation / info.total) * 100
    );

    return {
      sku,
      total: info.total,
      por_espacio: info.por_espacio,
      locationCount,
      maxInOneLocation,
      percentInOneLocation,
    };
  });

  // Filtrar por búsqueda
  const filteredEntries = stockEntries.filter((entry) =>
    entry.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ordenar según el criterio seleccionado
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === "name") return a.sku.localeCompare(b.sku);
    if (sortBy === "quantity") return b.total - a.total;
    if (sortBy === "locations") return b.locationCount - a.locationCount;
    return 0;
  });

  // Calcular estadísticas generales
  const totalItems = sortedEntries.reduce((sum, entry) => sum + entry.total, 0);
  const totalUniqueSkus = sortedEntries.length;
  const avgPerSku =
    totalUniqueSkus > 0 ? Math.round(totalItems / totalUniqueSkus) : 0;

  // Categorías disponibles (basadas en los prefijos de SKU)
  const categories = [
    ...new Set(
      sortedEntries.map((entry) => {
        const prefix = Object.keys(SKU_ICONS).find((prefix) =>
          entry.sku.toUpperCase().startsWith(prefix)
        );
        return prefix || "default";
      })
    ),
  ];

  // Controlar la altura del contenedor
  const containerHeight = Math.min(sortedEntries.length * 50, 400);

  return (
    <div className="stock-summary">
      {/* Controles y búsqueda */}
      <div className="mb-2">
        <Row className="g-2">
          <Col md={7}>
            <InputGroup size="sm">
              <InputGroup.Text>🔍</InputGroup.Text>
              <FormControl
                placeholder="Buscar SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="outline-secondary"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </Button>
              )}
            </InputGroup>
          </Col>
          <Col md={5} className="d-flex">
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip>
                  Ordenar por{" "}
                  {sortBy === "name"
                    ? "nombre"
                    : sortBy === "quantity"
                    ? "cantidad"
                    : "ubicaciones"}
                </Tooltip>
              }
            >
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-2"
                onClick={() => {
                  const options = ["name", "quantity", "locations"];
                  const currentIndex = options.indexOf(sortBy);
                  const nextIndex = (currentIndex + 1) % options.length;
                  setSortBy(options[nextIndex]);
                }}
              >
                {sortBy === "name" ? "🔠" : sortBy === "quantity" ? "🔢" : "📍"}
              </Button>
            </OverlayTrigger>

            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowStats(!showStats)}
              className="me-2 flex-grow-1"
            >
              {showStats ? "Ocultar Resumen" : "Ver Resumen"}
            </Button>
          </Col>
        </Row>
      </div>

      {/* Panel de estadísticas */}
      <Collapse in={showStats}>
        <div className="mb-3 p-2 bg-light rounded border">
          <Row className="g-2 text-center">
            <Col xs={4}>
              <div className="small text-muted">SKUs Únicos</div>
              <div className="h5 mb-0">{totalUniqueSkus}</div>
            </Col>
            <Col xs={4}>
              <div className="small text-muted">Ítems Totales</div>
              <div className="h5 mb-0">{totalItems}</div>
            </Col>
            <Col xs={4}>
              <div className="small text-muted">Promedio</div>
              <div className="h5 mb-0">{avgPerSku}/SKU</div>
            </Col>
          </Row>

          {/* Distribución por categorías */}
          <div className="mt-2 pt-2 border-top">
            <div className="small text-muted mb-1">Distribución por tipo:</div>
            {categories.map((category) => {
              const itemsInCategory = sortedEntries.filter((entry) =>
                entry.sku.toUpperCase().startsWith(category)
              );
              const countInCategory = itemsInCategory.reduce(
                (sum, entry) => sum + entry.total,
                0
              );
              const percentage =
                Math.round((countInCategory / totalItems) * 100) || 0;

              return (
                <div
                  key={category}
                  className="d-flex align-items-center small mb-1"
                >
                  <span className="me-2">
                    {SKU_ICONS[category] || SKU_ICONS.default}
                  </span>
                  <span className="me-2" style={{ width: "60px" }}>
                    {category}
                  </span>
                  <ProgressBar
                    now={percentage}
                    variant={percentage > 50 ? "primary" : "info"}
                    className="flex-grow-1 me-2"
                    style={{ height: "8px" }}
                  />
                  <span>
                    {countInCategory} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Collapse>

      {/* Lista de SKUs */}
      <div
        className="stock-list"
        style={{
          height: `${containerHeight}px`,
          maxHeight: "400px",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#6c757d #f8f9fa",
        }}
      >
        {sortedEntries.map((entry) => {
          const isExpanded = expandedSku === entry.sku;
          const icon = getSkuIcon(entry.sku);

          // Determinar color según cantidad
          let variant = "primary";
          if (entry.total <= 10) variant = "danger";
          else if (entry.total <= 20) variant = "warning";
          else if (entry.total <= 50) variant = "info";

          return (
            <Card
              key={entry.sku}
              className={`mb-2 shadow-sm ${
                animatedItems.includes(entry.sku) ? "fade-in-card" : "opacity-0"
              }`}
              style={{
                transition: "all 0.3s ease",
                animationDelay: `${sortedEntries.indexOf(entry) * 50}ms`,
              }}
            >
              <Card.Header
                className={`d-flex justify-content-between align-items-center py-2 bg-${variant} bg-opacity-10 border-${variant}`}
                style={{ cursor: "pointer" }}
                onClick={() => setExpandedSku(isExpanded ? null : entry.sku)}
              >
                <div className="d-flex align-items-center">
                  <span className="me-2" style={{ fontSize: "1.2rem" }}>
                    {icon}
                  </span>
                  <strong>{entry.sku}</strong>
                </div>
                <div className="d-flex align-items-center">
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>
                        En {entry.locationCount} ubicacion
                        {entry.locationCount !== 1 ? "es" : ""}
                      </Tooltip>
                    }
                  >
                    <Badge bg="light" text="dark" className="me-2">
                      📍 {entry.locationCount}
                    </Badge>
                  </OverlayTrigger>
                  <Badge bg={variant} pill>
                    {entry.total} unidades
                  </Badge>
                </div>
              </Card.Header>

              <Collapse in={isExpanded}>
                <div>
                  <ListGroup variant="flush">
                    {Object.entries(entry.por_espacio).map(([spaceId, qty]) => {
                      const espacio = spaces.find(
                        (s) => s.space_id === spaceId
                      );
                      const label = espacio
                        ? `${espacio.type.replace("-", " ")} (${spaceId.slice(
                            -4
                          )})`
                        : spaceId;

                      // Calcular porcentaje de este espacio respecto al total
                      const percentOfTotal = Math.round(
                        (qty / entry.total) * 100
                      );

                      return (
                        <ListGroup.Item
                          key={spaceId}
                          className="px-3 py-2 d-flex flex-column"
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <span>
                              {espacio && (
                                <span className="me-1" style={{ opacity: 0.7 }}>
                                  {espacio.type === "buffer"
                                    ? "🧰"
                                    : espacio.type === "workshop"
                                    ? "🔧"
                                    : espacio.type === "check-in"
                                    ? "📥"
                                    : espacio.type === "check-out"
                                    ? "📤"
                                    : "❓"}
                                </span>
                              )}
                              {label}
                            </span>
                            <Badge bg="light" text="dark" pill>
                              {qty}
                            </Badge>
                          </div>
                          <ProgressBar
                            now={percentOfTotal}
                            variant={percentOfTotal > 75 ? "primary" : "info"}
                            style={{ height: "6px" }}
                            className="mt-1"
                          />
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </div>
              </Collapse>

              {/* Mini-barra de progreso siempre visible que muestra distribución */}
              {!isExpanded && (
                <div className="px-3 py-1">
                  <div className="d-flex small text-muted justify-content-between">
                    <span>Distribución:</span>
                    <span>
                      Máx: {entry.percentInOneLocation}% en una ubicación
                    </span>
                  </div>
                  <ProgressBar className="mt-1" style={{ height: "6px" }}>
                    {Object.entries(entry.por_espacio).map(([spaceId, qty]) => {
                      const percent = Math.round((qty / entry.total) * 100);
                      const espacio = spaces.find(
                        (s) => s.space_id === spaceId
                      );
                      const variant =
                        espacio?.type === "buffer"
                          ? "success"
                          : espacio?.type === "workshop"
                          ? "primary"
                          : espacio?.type === "check-in"
                          ? "info"
                          : espacio?.type === "check-out"
                          ? "warning"
                          : "secondary";

                      return (
                        <ProgressBar
                          key={spaceId}
                          variant={variant}
                          now={percent}
                          max={100}
                          className="border-0"
                        />
                      );
                    })}
                  </ProgressBar>
                </div>
              )}
            </Card>
          );
        })}

        {sortedEntries.length === 0 && searchQuery && (
          <Alert variant="info">
            No se encontraron SKUs que coincidan con "{searchQuery}"
          </Alert>
        )}
      </div>

      {/* Estilo para animaciones */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in-card {
          animation: fadeIn 0.5s ease forwards;
        }

        .stock-list::-webkit-scrollbar {
          width: 6px;
        }

        .stock-list::-webkit-scrollbar-track {
          background: #f8f9fa;
        }

        .stock-list::-webkit-scrollbar-thumb {
          background-color: #adb5bd;
          border-radius: 6px;
        }

        .stock-list::-webkit-scrollbar-thumb:hover {
          background-color: #6c757d;
        }
      `}</style>
    </div>
  );
}
