import React, { useEffect, useState } from 'react';
import { Tag, Spin, Alert, message, Card, Statistic, Button, Modal } from 'antd';
import { encuestasService, Encuesta, RespuestaEncuesta } from '../../services/encuestasService';

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

const MisEncuestas: React.FC = () => {
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [misRespuestas, setMisRespuestas] = useState<RespuestaEncuesta[]>([]);
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
      const [encuestasData, respuestasData] = await Promise.all([
        encuestasService.getAll(),
        encuestasService.misRespuestas(),
      ]);
      setEncuestas(encuestasData);
      setMisRespuestas(respuestasData);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos de encuestas.');
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const verMisRespuestas = async (encuesta: Encuesta) => {
    setEncuestaSeleccionada(encuesta);
    setIsModalOpen(true);
    // Aquí cargarías las respuestas específicas del usuario para esta encuesta
  };

  // Estadísticas
  const encuestasRespondidas = misRespuestas.length;
  const encuestasDisponibles = encuestas.length;

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
          <h1 style={styles.title}>Mis Encuestas</h1>
          <p style={styles.subtitle}>
            Visualiza y completa las encuestas disponibles
          </p>
        </div>
      </div>

      {/* ═══════════════ ESTADÍSTICAS ═══════════════ */}
      <div style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Statistic
            title="Encuestas Disponibles"
            value={encuestasDisponibles}
            prefix="📋"
            valueStyle={{ color: PALETTE.primary, fontWeight: 700 }}
          />
        </Card>
        <Card style={styles.statCard}>
          <Statistic
            title="Encuestas Respondidas"
            value={encuestasRespondidas}
            prefix="✅"
            valueStyle={{ color: PALETTE.success, fontWeight: 700 }}
          />
        </Card>
        <Card style={styles.statCard}>
          <Statistic
            title="Pendientes"
            value={encuestasDisponibles - encuestasRespondidas}
            prefix="⏳"
            valueStyle={{ color: PALETTE.warning, fontWeight: 700 }}
          />
        </Card>
      </div>

      {/* ═══════════════ LISTA DE ENCUESTAS ═══════════════ */}
      <Card style={styles.tableCard}>
        <h3 style={styles.chartTitle}>Encuestas Disponibles</h3>
        {encuestas.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 30 }}>📝</span>
            <p style={styles.emptyText}>No hay encuestas disponibles en este momento</p>
          </div>
        ) : (
          <div style={styles.encuestasList}>
            {encuestas.map((encuesta) => {
              const yaRespondida = misRespuestas.some(
                (r) => r.encuestaId === encuesta._id
              );
              return (
                <Card
                  key={encuesta._id}
                  style={styles.encuestaCard}
                  actions={[
                    <Button
                      key="responder"
                      type="primary"
                      onClick={() => verMisRespuestas(encuesta)}
                      disabled={yaRespondida}
                      style={{
                        background: yaRespondida ? PALETTE.textMuted : PALETTE.primary,
                        borderColor: yaRespondida ? PALETTE.textMuted : PALETTE.primary,
                      }}
                    >
                      {yaRespondida ? 'Ya respondida' : 'Responder'}
                    </Button>,
                  ]}
                >
                  <div style={styles.encuestaContent}>
                    <h4 style={styles.encuestaTitulo}>{encuesta.titulo}</h4>
                    <p style={styles.encuestaDescripcion}>{encuesta.descripcion}</p>
                    <div style={styles.encuestaMeta}>
                      <Tag color="blue">
                        {encuesta.preguntas?.length || 0} preguntas
                      </Tag>
                      {yaRespondida && (
                        <Tag color="green">✓ Respondida</Tag>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* ═══════════════ MODAL DE RESPUESTAS ═══════════════ */}
      <Modal
        title={
          <span style={styles.modalTitle}>
            {encuestaSeleccionada?.titulo}
          </span>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEncuestaSeleccionada(null);
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <div style={{ marginTop: 16 }}>
          <p style={styles.modalDescripcion}>
            {encuestaSeleccionada?.descripcion}
          </p>
          <div style={styles.preguntasList}>
            {encuestaSeleccionada?.preguntas?.map((pregunta, index) => (
              <Card key={index} style={styles.preguntaCard} size="small">
                <div style={styles.preguntaNumero}>
                  Pregunta {index + 1} de {encuestaSeleccionada.preguntas?.length}
                </div>
                <h4 style={styles.preguntaTexto}>{pregunta.pregunta}</h4>
                <div style={styles.tipoPregunta}>
                  <Tag color="purple">{pregunta.tipo}</Tag>
                </div>
              </Card>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <p style={{ color: PALETTE.textMuted, fontSize: 13 }}>
              Esta es una vista previa. La funcionalidad de responder estará disponible próximamente.
            </p>
          </div>
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
  encuestasList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  encuestaCard: {
    borderRadius: 16,
    border: `1px solid ${PALETTE.border}`,
    transition: 'all 0.3s ease',
  },
  encuestaContent: {
    padding: '8px 0',
  },
  encuestaTitulo: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primary,
    fontSize: 18,
    fontWeight: 700,
    margin: '0 0 8px',
  },
  encuestaDescripcion: {
    color: '#475569',
    fontSize: 14,
    margin: '0 0 12px',
    lineHeight: 1.5,
  },
  encuestaMeta: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primary,
    fontWeight: 800,
    fontSize: 18,
  },
  modalDescripcion: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 1.6,
  },
  preguntasList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  preguntaCard: {
    borderRadius: 12,
    border: `1px solid ${PALETTE.border}`,
    background: PALETTE.bg,
  },
  preguntaNumero: {
    fontSize: 12,
    color: PALETTE.textMuted,
    marginBottom: 8,
  },
  preguntaTexto: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primaryDark,
    fontSize: 15,
    fontWeight: 600,
    margin: '0 0 8px',
  },
  tipoPregunta: {
    marginTop: 8,
  },
};

export default MisEncuestas;