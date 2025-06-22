// src/components/SpacesSummary.jsx
import React, { useState, useEffect } from "react";
import {
  ListGroup,
  Badge,
  Spinner,
  Alert,
  ProgressBar,
  OverlayTrigger,
  Tooltip,
  Button,
  Row,
  Col,
  Collapse,
  Tabs,
  Tab,
} from "react-bootstrap";
import { POLLING } from "../config/polling";
import { useApi } from "../hooks/useApi";

// Iconos para los diferentes tipos de espacio
const SPACE_ICONS = {
  buffer: "🧰",
  workshop: "🔧",
  "check-in": "📥",
  "check-out": "📤",
  unknown: "❓",
};

// Función para obtener un emoji según el porcentaje de uso
const getUsageEmoji = (percentUsed) => {
  if (percentUsed > 90) return "🔴";
  if (percentUsed > 70) return "🟠";
  if (percentUsed > 50) return "🟡";
  return "🟢";
};

export default function SpacesSummary() {
  const { data, loading, error } = useApi("/api/spaces", {
    pollingInterval: POLLING.SPACES,
  });

  // Estados para la interactividad
  const [expandedSpace, setExpandedSpace] = useState(null);
  const [sortBy, setSortBy] = useState("type"); // 'type', 'usage', 'capacity'
  const [showStats, setShowStats] = useState(false);
  const [animatedItems, setAnimatedItems] = useState([]);
  const [statsTab, setStatsTab] = useState("working"); // 'all', 'buffer', 'working'

  // Para la animación de entrada de los elementos
  useEffect(() => {
    if (data?.spaces) {
      const timer = setTimeout(() => {
        setAnimatedItems(data.spaces.map((s) => s.space_id));
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

  if (error?.startsWith?.("Error 429")) {
    return (
      <Alert variant="warning">
        🍵 Demasiadas peticiones. Por favor espera unos segundos antes de
        reintentar.
      </Alert>
    );
  }

  if (error?.startsWith?.("Error 500")) {
    return <Alert variant="warning">🤨 Espera un momentito👌</Alert>;
  }

  if (error) {
    return <Alert variant="danger">Error cargando espacios: {error}</Alert>;
  }

  const spaces = data?.spaces || [];

  // Separar buffer del resto de espacios
  const bufferSpaces = spaces.filter((s) => s.type === "buffer");
  const workingSpaces = spaces.filter((s) => s.type !== "buffer");

  // Calcular estadísticas separadas
  // 1. Para buffer
  const bufferCapacity = bufferSpaces.reduce(
    (sum, s) => sum + s.total_space,
    0
  );
  const bufferUsed = bufferSpaces.reduce((sum, s) => sum + s.used_space, 0);
  const bufferPercentage =
    bufferCapacity > 0 ? Math.round((bufferUsed / bufferCapacity) * 100) : 0;

  // 2. Para espacios operativos (no buffer)
  const workingCapacity = workingSpaces.reduce(
    (sum, s) => sum + s.total_space,
    0
  );
  const workingUsed = workingSpaces.reduce((sum, s) => sum + s.used_space, 0);
  const workingPercentage =
    workingCapacity > 0 ? Math.round((workingUsed / workingCapacity) * 100) : 0;

  // 3. Total (para referencia)
  const totalCapacity = spaces.reduce((sum, s) => sum + s.total_space, 0);
  const usedCapacity = spaces.reduce((sum, s) => sum + s.used_space, 0);
  const usagePercentage =
    totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;

  // Ordenar espacios según criterio seleccionado
  const sortedSpaces = [...spaces].sort((a, b) => {
    if (sortBy === "type") return a.type.localeCompare(b.type);
    if (sortBy === "usage") {
      const usageA = a.total_space > 0 ? a.used_space / a.total_space : 0;
      const usageB = b.total_space > 0 ? b.used_space / b.total_space : 0;
      return usageB - usageA; // Mayor uso primero
    }
    if (sortBy === "capacity") return b.total_space - a.total_space; // Mayor capacidad primero
    return 0;
  });

  // Función para obtener variante de color según el porcentaje de uso
  const getProgressVariant = (used, total) => {
    const percent = total > 0 ? (used / total) * 100 : 0;
    if (percent > 90) return "danger";
    if (percent > 70) return "warning";
    if (percent > 50) return "info";
    return "success";
  };

  return (
    <div className="spaces-summary">
      {/* Controles y resumen */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="m-0 fw-bold">Espacios de la Fábrica</h6>
        <div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShowStats(!showStats)}
            className="me-2"
          >
            {showStats ? "Ocultar Resumen" : "Ver Resumen"}
          </Button>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip>
                Ordenar por:{" "}
                {sortBy === "type"
                  ? "Tipo"
                  : sortBy === "usage"
                  ? "Uso"
                  : "Capacidad"}
              </Tooltip>
            }
          >
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                const options = ["type", "usage", "capacity"];
                const currentIndex = options.indexOf(sortBy);
                const nextIndex = (currentIndex + 1) % options.length;
                setSortBy(options[nextIndex]);
              }}
            >
              {sortBy === "type" ? "🔠" : sortBy === "usage" ? "📊" : "📦"}
            </Button>
          </OverlayTrigger>
        </div>
      </div>

      {/* Panel de estadísticas con tabs */}
      <Collapse in={showStats}>
        <div className="mb-3 bg-light rounded">
          <Tabs
            activeKey={statsTab}
            onSelect={setStatsTab}
            className="mb-2 nav-tabs-sm"
          >
            <Tab eventKey="working" title="Áreas Operativas">
              <div className="p-2">
                <Row className="g-2 text-center">
                  <Col>
                    <div className="small text-muted">Capacidad</div>
                    <div className="h5 mb-0">{workingCapacity}</div>
                  </Col>
                  <Col>
                    <div className="small text-muted">Ocupado</div>
                    <div className="h5 mb-0">{workingUsed}</div>
                  </Col>
                  <Col>
                    <div className="small text-muted">Ocupación</div>
                    <div className="h5 mb-0">{workingPercentage}%</div>
                  </Col>
                </Row>
                <ProgressBar
                  className="mt-2"
                  now={workingPercentage}
                  variant={getProgressVariant(workingUsed, workingCapacity)}
                  label={`${workingPercentage}%`}
                />
              </div>
            </Tab>
            <Tab eventKey="buffer" title="Buffer">
              <div className="p-2">
                <Row className="g-2 text-center">
                  <Col>
                    <div className="small text-muted">Capacidad</div>
                    <div className="h5 mb-0">{bufferCapacity}</div>
                  </Col>
                  <Col>
                    <div className="small text-muted">Ocupado</div>
                    <div className="h5 mb-0">{bufferUsed}</div>
                  </Col>
                  <Col>
                    <div className="small text-muted">Ocupación</div>
                    <div className="h5 mb-0">{bufferPercentage}%</div>
                  </Col>
                </Row>
                <ProgressBar
                  className="mt-2"
                  now={bufferPercentage}
                  variant={getProgressVariant(bufferUsed, bufferCapacity)}
                  label={`${bufferPercentage}%`}
                />
              </div>
            </Tab>
            <Tab eventKey="all" title="Global">
              <div className="p-2">
                <Row className="g-2 text-center">
                  <Col>
                    <div className="small text-muted">Capacidad</div>
                    <div className="h5 mb-0">{totalCapacity}</div>
                  </Col>
                  <Col>
                    <div className="small text-muted">Ocupado</div>
                    <div className="h5 mb-0">{usedCapacity}</div>
                  </Col>
                  <Col>
                    <div className="small text-muted">Ocupación</div>
                    <div className="h5 mb-0">{usagePercentage}%</div>
                  </Col>
                </Row>
                <ProgressBar
                  className="mt-2"
                  now={usagePercentage}
                  variant={getProgressVariant(usedCapacity, totalCapacity)}
                  label={`${usagePercentage}%`}
                />
                <div className="text-center text-muted small mt-1">
                  <em>
                    Nota: El buffer tiene mayor capacidad y puede distorsionar
                    las estadísticas globales
                  </em>
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>
      </Collapse>

      {/* Lista de espacios */}
      <ListGroup variant="flush" className="rounded overflow-hidden">
        {sortedSpaces.map((s) => {
          const isExpanded = expandedSpace === s.space_id;
          const usagePercent =
            s.total_space > 0
              ? Math.round((s.used_space / s.total_space) * 100)
              : 0;
          const variant = getProgressVariant(s.used_space, s.total_space);
          const spaceIcon = SPACE_ICONS[s.type] || SPACE_ICONS.unknown;
          const usageEmoji = getUsageEmoji(usagePercent);

          // Destacar buffer con un estilo ligeramente diferente
          const isBuffer = s.type === "buffer";

          return (
            <ListGroup.Item
              key={s.space_id}
              className={`px-2 py-2 border-start border-3 ${
                animatedItems.includes(s.space_id)
                  ? "fade-in-item"
                  : "opacity-0"
              } ${isBuffer ? "buffer-item" : ""}`}
              style={{
                borderLeftColor:
                  variant === "success"
                    ? "#198754"
                    : variant === "info"
                    ? "#0dcaf0"
                    : variant === "warning"
                    ? "#ffc107"
                    : "#dc3545",
                transition: "all 0.3s ease",
                cursor: "pointer",
                opacity: animatedItems.includes(s.space_id) ? 1 : 0,
                animationDelay: `${
                  spaces.findIndex((space) => space.space_id === s.space_id) *
                  100
                }ms`,
                backgroundColor: isBuffer ? "rgba(0,0,0,0.02)" : "",
              }}
              onClick={() => setExpandedSpace(isExpanded ? null : s.space_id)}
              action
            >
              <div className="d-flex justify-content-between align-items-center">
                <span className="d-flex align-items-center">
                  <span className="me-2" style={{ fontSize: "1.2rem" }}>
                    {spaceIcon}
                  </span>
                  <span className="text-capitalize">
                    {s.type.replace("-", " ")}
                    {isBuffer && (
                      <Badge
                        bg="secondary"
                        pill
                        className="ms-1"
                        style={{ fontSize: "0.65rem" }}
                      >
                        gran capacidad
                      </Badge>
                    )}
                  </span>
                </span>
                <div className="d-flex align-items-center">
                  <span className="me-2">{usageEmoji}</span>
                  <Badge
                    bg={variant}
                    className="d-flex align-items-center"
                    pill
                  >
                    {s.used_space} / {s.total_space}
                  </Badge>
                </div>
              </div>

              {/* Barra de progreso siempre visible */}
              <ProgressBar
                className="mt-1"
                now={usagePercent}
                variant={variant}
                style={{ height: "6px" }}
              />

              {/* Contenido expandible */}
              <Collapse in={isExpanded}>
                <div className="mt-2 pt-2 border-top">
                  <Row className="g-2 small">
                    <Col xs={6}>
                      <div className="text-muted">ID del espacio:</div>
                      <div>{s.space_id}</div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-muted">Ocupación:</div>
                      <div>
                        {usagePercent}% (
                        {usagePercent < 50
                          ? "Bajo"
                          : usagePercent < 75
                          ? "Medio"
                          : usagePercent < 90
                          ? "Alto"
                          : "Crítico"}
                        )
                      </div>
                    </Col>
                    <Col xs={12} className="text-center mt-1">
                      <div className={`alert alert-${variant} py-1 mb-0 small`}>
                        {isBuffer
                          ? "Buffer: Espacio de almacenamiento principal con gran capacidad"
                          : usagePercent > 90
                          ? "¡Espacio casi lleno! Considere liberarlo."
                          : usagePercent > 70
                          ? "Espacio con alta ocupación"
                          : usagePercent > 50
                          ? "Espacio con ocupación media"
                          : "Espacio con baja ocupación"}
                      </div>
                    </Col>
                  </Row>
                </div>
              </Collapse>
            </ListGroup.Item>
          );
        })}
      </ListGroup>

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

        .fade-in-item {
          animation: fadeIn 0.5s ease forwards;
        }

        .nav-tabs-sm .nav-link {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }

        .buffer-item {
          border-style: dashed !important;
        }
      `}</style>
    </div>
  );
}
