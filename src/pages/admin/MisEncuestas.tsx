import React, { useEffect, useState } from 'react';
import { Tag, Spin, Alert, message, Card, Statistic, Button, Modal, Input, Select, Radio, Space, Typography, Divider } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { encuestasService ,Encuesta, Respuesta } from '../../services/encuestasService';
import { useAuth } from '../../hooks/useAuth';


const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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
  const { user } = useAuth();
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [misRespuestas, setMisRespuestas] = useState<Respuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [encuestaSeleccionada, setEncuestaSeleccionada] = useState<Encuesta | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para responder
  const [respondiendo, setRespondiendo] = useState(false);
  const [respuestasForm, setRespuestasForm] = useState<Record<string, any>>({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [asignacionesData, respuestasData] = await Promise.all([
        encuestasService.getMisEncuestas(),
        encuestasService.getMisRespuestas(),
      ]);

      // Extraer las encuestas desde la propiedad 'encuesta' o 'encuestaId' si vienen populadas
      const encuestasExtraidas = (asignacionesData || []).map((a: any) => a.encuesta || a.encuestaId || a);
      
      setEncuestas(encuestasExtraidas);
      setMisRespuestas(respuestasData);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar tus encuestas asignadas.');
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const verMisRespuestas = async (encuesta: Encuesta) => {
    setEncuestaSeleccionada(encuesta);
    setIsModalOpen(true);
    setRespondiendo(false);
    setRespuestasForm({});
  };

  const iniciarRespuesta = () => {
    setRespondiendo(true);
    // Inicializar respuestas vacías
    const inicial: Record<string, any> = {};
    encuestaSeleccionada?.preguntas?.forEach((p, index) => {
      inicial[`pregunta_${index}`] = p.tipo === 'TEXTO' ? '' : undefined;
    });
    setRespuestasForm(inicial);
  };

  const handleRespuestaChange = (key: string, value: any) => {
    setRespuestasForm(prev => ({ ...prev, [key]: value }));
  };

  const handleEnviarRespuestas = async () => {
    if (!encuestaSeleccionada || !user) return;

    // Validar que todas las preguntas tengan respuesta
    const preguntas = encuestaSeleccionada.preguntas || [];
    for (let i = 0; i < preguntas.length; i++) {
      const key = `pregunta_${i}`;
      const valor = respuestasForm[key];
      if (valor === undefined || valor === null || valor === '') {
        message.warning(`Por favor responde la pregunta #${i + 1}`);
        return;
      }
    }

    setEnviando(true);
    try {
      // Construir el objeto de respuestas con el texto de la pregunta como clave
      const respuestasMap: Record<string, any> = {};
      preguntas.forEach((p, index) => {
        respuestasMap[p.pregunta] = respuestasForm[`pregunta_${index}`];
      });

      await encuestasService.guardarRespuesta(
        encuestaSeleccionada._id,
        user.id,
        respuestasMap
      );

      message.success('¡Respuestas enviadas exitosamente!');
      setIsModalOpen(false);
      setEncuestaSeleccionada(null);
      setRespondiendo(false);
      setRespuestasForm({});
      
      // Recargar datos para reflejar el cambio
      cargarDatos();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || 'Error al guardar las respuestas.');
    } finally {
      setEnviando(false);
    }
  };

  const yaRespondida = (encuestaId: string) => {
    return misRespuestas.some(r => r.encuestaId === encuestaId);
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

  // Renderizar pregunta según tipo
  const renderPregunta = (pregunta: { pregunta: string; tipo: string; opciones?: string[] }, index: number) => {
    const key = `pregunta_${index}`;
    const valor = respuestasForm[key];

    switch (pregunta.tipo) {
      case 'TEXTO':
        return (
          <TextArea
            rows={3}
            value={valor || ''}
            onChange={e => handleRespuestaChange(key, e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            style={{ borderRadius: 8 }}
          />
        );
      case 'ESCALA':
        return (
          <Radio.Group
            value={valor}
            onChange={e => handleRespuestaChange(key, e.target.value)}
          >
            <Space direction="horizontal" wrap>
              {(pregunta.opciones || ['1', '2', '3', '4', '5']).map(op => (
                <Radio.Button key={op} value={op} style={{ minWidth: 40, textAlign: 'center' }}>
                  {op}
                </Radio.Button>
              ))}
            </Space>
          </Radio.Group>
        );
      case 'MULTIPLE':
        return (
          <Select
            value={valor}
            onChange={val => handleRespuestaChange(key, val)}
            placeholder="Selecciona una opción..."
            style={{ width: '100%' }}
          >
            {(pregunta.opciones || []).map(op => (
              <Option key={op} value={op}>{op}</Option>
            ))}
          </Select>
        );
      default:
        return (
          <TextArea
            rows={2}
            value={valor || ''}
            onChange={e => handleRespuestaChange(key, e.target.value)}
            placeholder="Escribe tu respuesta..."
            style={{ borderRadius: 8 }}
          />
        );
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        .cm-mis-encuestas .ant-table { background: transparent; }
        .cm-mis-encuestas .ant-table-thead > tr > th {
          background: #f2f9f9;
          color: ${PALETTE.primary};
          font-weight: 700;
          font-size: 12.5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: none;
        }
        .cm-mis-encuestas .ant-table-thead > tr > th::before { display: none; }
        .cm-mis-encuestas .ant-table-tbody > tr > td {
          border-bottom: 1px solid #eef2f2;
          padding-top: 14px;
          padding-bottom: 14px;
        }
        .cm-mis-encuestas .ant-table-tbody > tr:hover > td { background: #f7fcfc; }
        .cm-mis-encuestas .ant-table-tbody > tr:last-child > td { border-bottom: none; }
        .cm-mis-encuestas .ant-pagination-item-active { border-color: ${PALETTE.primary}; }
        .cm-mis-encuestas .ant-pagination-item-active a { color: ${PALETTE.primary}; }
      `}</style>

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
          <Title style={styles.title}>Mis Encuestas</Title>
          <Text style={styles.subtitle}>
            Visualiza, completa y envía las encuestas asignadas por tu psicólogo
          </Text>
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
              const responded = yaRespondida(encuesta._id);
              return (
                <Card
                  key={encuesta._id}
                  style={{
                    ...styles.encuestaCard,
                    borderColor: responded ? PALETTE.success : PALETTE.border,
                    borderLeft: responded ? `4px solid ${PALETTE.success}` : `4px solid ${PALETTE.accent}`,
                  }}
                  actions={[
                    <Button
                      key="responder"
                      type={responded ? "default" : "primary"}
                      onClick={() => verMisRespuestas(encuesta)}
                      style={{
                        background: responded ? PALETTE.success : PALETTE.primary,
                        borderColor: responded ? PALETTE.success : PALETTE.primary,
                        color: '#fff',
                        borderRadius: 20,
                      }}
                      icon={responded ? <CheckOutlined /> : undefined}
                    >
                      {responded ? 'Ver mis respuestas' : 'Responder'}
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
                      {responded && (
                        <Tag color="green" icon={<CheckOutlined />}>✓ Respondida</Tag>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* ═══════════════ MODAL DE VER/RESPONDER ENCUESTA ═══════════════ */}
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
          setRespondiendo(false);
          setRespuestasForm({});
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <div style={{ marginTop: 16 }}>
          <p style={styles.modalDescripcion}>
            {encuestaSeleccionada?.descripcion}
          </p>

          {!respondiendo ? (
            // VISTA PREVIA
            <>
              <div style={styles.preguntasList}>
                {encuestaSeleccionada?.preguntas?.map((pregunta, index) => (
                  <Card key={index} style={styles.preguntaCard} size="small">
                    <div style={styles.preguntaInfo}>
                      <div style={styles.preguntaNumero}>
                        Pregunta {index + 1} de {encuestaSeleccionada?.preguntas?.length}
                      </div>
                      <Tag color="purple" style={{ fontSize: 11 }}>
                        {pregunta.tipo === 'TEXTO' ? 'Texto libre' : pregunta.tipo === 'ESCALA' ? 'Escala numérica' : 'Opción múltiple'}
                      </Tag>
                    </div>
                    <h4 style={styles.preguntaTexto}>{pregunta.pregunta}</h4>
                    {pregunta.opciones && pregunta.opciones.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text style={{ fontSize: 12, color: PALETTE.textMuted }}>Opciones: </Text>
                        <Space size={4} wrap>
                          {pregunta.opciones.map((op, i) => (
                            <Tag key={i} style={{ fontSize: 11 }}>{op}</Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={iniciarRespuesta}
                  style={{
                    background: PALETTE.primary,
                    borderColor: PALETTE.primary,
                    borderRadius: 24,
                    paddingLeft: 32,
                    paddingRight: 32,
                  }}
                  disabled={yaRespondida(encuestaSeleccionada?._id || '')}
                >
                  {yaRespondida(encuestaSeleccionada?._id || '') 
                    ? 'Ya has respondido esta encuesta' 
                    : 'Comenzar a Responder'}
                </Button>
                {yaRespondida(encuestaSeleccionada?._id || '') && (
                  <div style={{ marginTop: 12 }}>
                    <Tag color="green" style={{ padding: '4px 12px', fontSize: 13 }}>
                      <CheckOutlined /> Ya respondiste esta encuesta anteriormente
                    </Tag>
                  </div>
                )}
              </div>
            </>
          ) : (
            // FORMULARIO DE RESPUESTA
            <>
              <Divider style={{ borderColor: PALETTE.border, fontSize: 13, fontWeight: 600, color: PALETTE.primary }}>
                Responde las siguientes preguntas
              </Divider>

              <div style={styles.preguntasList}>
                {encuestaSeleccionada?.preguntas?.map((pregunta, index) => (
                  <Card key={index} style={styles.preguntaCard} size="small">
                    <div style={styles.preguntaInfo}>
                      <div style={styles.preguntaNumero}>
                        Pregunta {index + 1} de {encuestaSeleccionada?.preguntas?.length}
                      </div>
                      <Tag color="purple" style={{ fontSize: 11 }}>
                        {pregunta.tipo === 'TEXTO' ? 'Texto libre' : pregunta.tipo === 'ESCALA' ? 'Escala numérica' : 'Opción múltiple'}
                      </Tag>
                    </div>
                    <h4 style={styles.preguntaTexto}>{pregunta.pregunta}</h4>
                    <div style={{ marginTop: 12 }}>
                      {renderPregunta(pregunta, index)}
                    </div>
                  </Card>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Button
                  size="large"
                  onClick={() => setRespondiendo(false)}
                  icon={<CloseOutlined />}
                  style={{ borderRadius: 24, paddingLeft: 24, paddingRight: 24 }}
                >
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleEnviarRespuestas}
                  loading={enviando}
                  icon={<CheckOutlined />}
                  style={{
                    background: PALETTE.success,
                    borderColor: PALETTE.success,
                    borderRadius: 24,
                    paddingLeft: 24,
                    paddingRight: 24,
                  }}
                >
                  {enviando ? 'Enviando...' : 'Enviar Respuestas'}
                </Button>
              </div>
            </>
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
    marginTop: 4,
    display: 'block',
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
  chartTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primary,
    fontSize: 17,
    fontWeight: 700,
    margin: '0 0 20px',
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
  preguntaInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  preguntaNumero: {
    fontSize: 12,
    color: PALETTE.textMuted,
  },
  preguntaTexto: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primaryDark,
    fontSize: 15,
    fontWeight: 600,
    margin: 0,
  },
};

export default MisEncuestas;