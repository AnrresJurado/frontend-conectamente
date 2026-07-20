import React, { useEffect, useState } from 'react';
import { Tag, Spin, Alert, message, Card, Statistic, Button, Modal, Table } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { encuestasService, Encuesta, Respuesta, AsignacionEncuesta } from '../../services/encuestasService';

const PALETTE = {
  primaryDark: '#12414a',
  primary: '#1d5863',
  accent: '#4da6b0',
  accentSoft: '#bce3e6',
  bg: '#eef7f7',
  card: '#ffffff',
  textMuted: '#64748b',
  border: '#e2e8f0',
  success: '#3f9d6f',
  warning: '#e0a13a',
  danger: '#c0564e',
};

const COLORS = ['#1d5863', '#4da6b0', '#e0a13a', '#c0564e', '#7c6fda', '#3f9d6f'];

const Encuestas: React.FC = () => {
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [encuestaSeleccionada, setEncuestaSeleccionada] = useState<Encuesta | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [encuestasData, metricasData] = await Promise.all([
        encuestasService.getAll(),
        encuestasService.getMetricasGenerales(),
      ]);
      setEncuestas(encuestasData);
      setMetricas(metricasData);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos de encuestas.');
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const verRespuestas = async (encuesta: Encuesta) => {
    setEncuestaSeleccionada(encuesta);
    setIsModalOpen(true);
    setLoading(true);
    try {
      const data = await encuestasService.getRespuestas(encuesta._id);
      setRespuestas(data);
    } catch (err) {
      console.error(err);
      message.error('Error al cargar las respuestas');
    } finally {
      setLoading(false);
    }
  };

  // Datos para el gráfico de respuestas por encuesta
  const datosRespuestasPorEncuesta = metricas?.respuestasPorEncuesta?.map((item: any, index: number) => ({
    nombre: item.encuestaTitulo,
    cantidad: item.cantidad,
    color: COLORS[index % COLORS.length],
  })) || [];

  const columns = [
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      ellipsis: true,
      render: (text: string) => text || '—',
    },
    {
      title: 'Preguntas',
      key: 'preguntas',
      render: (_: any, record: Encuesta) => (
        <span>{record.preguntas?.length || 0} preguntas</span>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Encuesta) => (
        <Button
          type="primary"
          size="small"
          onClick={() => verRespuestas(record)}
          style={{
            background: PALETTE.primary,
            borderColor: PALETTE.primary,
          }}
        >
          Ver Respuestas
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '120px 0',
          background: PALETTE.bg,
          minHeight: '100%',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 20, borderRadius: 12 }}
        />
      )}

      {/* ═══════════════ ENCABEZADO ═══════════════ */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestión de Encuestas</h1>
          <p style={styles.subtitle}>
            Administra encuestas y visualiza respuestas de pacientes
          </p>
        </div>
      </div>

      {/* ═══════════════ ESTADÍSTICAS ═══════════════ */}
      <div style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Statistic
            title="Total de Encuestas"
            value={metricas?.totalEncuestas || 0}
            prefix="📋"
            valueStyle={{ color: PALETTE.primary, fontWeight: 700 }}
          />
        </Card>
        <Card style={styles.statCard}>
          <Statistic
            title="Total de Respuestas"
            value={metricas?.totalRespuestas || 0}
            prefix="✅"
            valueStyle={{ color: PALETTE.success, fontWeight: 700 }}
          />
        </Card>
        <Card style={styles.statCard}>
          <Statistic
            title="Promedio por Encuesta"
            value={metricas?.totalEncuestas ? Math.round((metricas.totalRespuestas / metricas.totalEncuestas)) : 0}
            prefix="📊"
            valueStyle={{ color: PALETTE.accent, fontWeight: 700 }}
          />
        </Card>
      </div>

      {/* ═══════════════ GRÁFICO ═══════════════ */}
      {datosRespuestasPorEncuesta.length > 0 && (
        <Card style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Respuestas por Encuesta</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosRespuestasPorEncuesta}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={PALETTE.border} />
              <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: PALETTE.textMuted }} />
              <YAxis tick={{ fontSize: 12, fill: PALETTE.textMuted }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${PALETTE.border}` }} />
              <Bar dataKey="cantidad" name="Respuestas" fill={PALETTE.accent} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ═══════════════ TABLA DE ENCUESTAS ═══════════════ */}
      <Card style={styles.tableCard}>
        <h3 style={styles.chartTitle}>Encuestas Disponibles</h3>
        {encuestas.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 30 }}>📝</span>
            <p style={styles.emptyText}>No hay encuestas registradas</p>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={encuestas}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      {/* ═══════════════ MODAL DE RESPUESTAS ═══════════════ */}
      <Modal
        title={
          <span style={styles.modalTitle}>
            Respuestas: {encuestaSeleccionada?.titulo}
          </span>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEncuestaSeleccionada(null);
          setRespuestas([]);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <div style={{ marginTop: 16 }}>
          {respuestas.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No hay respuestas para esta encuesta</p>
            </div>
          ) : (
            <div style={styles.respuestasList}>
              {respuestas.map((respuesta, index) => (
                <Card key={respuesta._id} style={styles.respuestaCard} size="small">
                  <div style={styles.respuestaHeader}>
                    <Tag color="blue">Respuesta #{index + 1}</Tag>
                    <span style={styles.respuestaFecha}>
                      {new Date(respuesta.createdAt).toLocaleDateString('es-EC', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div style={styles.respuestasContent}>
                    {Object.entries(respuesta.respuestas).map(([pregunta, valor]) => (
                      <div key={pregunta} style={styles.respuestaItem}>
                        <strong style={styles.preguntaText}>{pregunta}:</strong>
                        <span style={styles.valorText}>
                          {typeof valor === 'object' ? JSON.stringify(valor) : String(valor)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: PALETTE.bg,
    minHeight: '100%',
    padding: '36px 40px 60px',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primary,
    fontSize: 26,
    fontWeight: 800,
    margin: 0,
    letterSpacing: '-0.4px',
  },
  subtitle: {
    color: PALETTE.textMuted,
    fontSize: 14,
    margin: '4px 0 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    borderRadius: 20,
    border: `1px solid ${PALETTE.border}`,
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
  },
  chartCard: {
    borderRadius: 20,
    border: `1px solid ${PALETTE.border}`,
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
    marginBottom: 24,
  },
  chartTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primary,
    fontSize: 17,
    fontWeight: 700,
    margin: '0 0 20px',
  },
  tableCard: {
    borderRadius: 20,
    border: `1px solid ${PALETTE.border}`,
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
    gap: 12,
  },
  emptyText: {
    color: PALETTE.textMuted,
    fontSize: 13.5,
    margin: 0,
    textAlign: 'center',
  },
  modalTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primary,
    fontWeight: 800,
    fontSize: 18,
  },
  respuestasList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxHeight: 500,
    overflowY: 'auto',
  },
  respuestaCard: {
    borderRadius: 12,
    border: `1px solid ${PALETTE.border}`,
  },
  respuestaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  respuestaFecha: {
    fontSize: 12,
    color: PALETTE.textMuted,
  },
  respuestasContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  respuestaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '8px 12px',
    background: PALETTE.bg,
    borderRadius: 8,
  },
  preguntaText: {
    color: PALETTE.primary,
    fontSize: 13,
  },
  valorText: {
    color: '#334155',
    fontSize: 13.5,
  },
};

export default Encuestas;