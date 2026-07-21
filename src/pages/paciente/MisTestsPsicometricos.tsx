import React, { useEffect, useState } from 'react';
import { Card, Spin, Alert, message, Button, Modal, Radio, Typography, Divider, Tag, Space, Progress, Empty } from 'antd';
import {
  FileTextOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  LockOutlined,
  HistoryOutlined,
  WarningFilled,
  SendOutlined,
} from '@ant-design/icons';
import { testsPsicometricosService, AsignacionTest } from '../../services/testsPsicometricosService';
import { TESTS_PREDEFINIDOS, getTestById, TipoTest } from '../../data/testsPredefinidos';


const { Title, Text } = Typography;

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

const MisTestsPsicometricos: React.FC = () => {
  const [asignaciones, setAsignaciones] = useState<AsignacionTest[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testSeleccionado, setTestSeleccionado] = useState<TipoTest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [respuestasForm, setRespuestasForm] = useState<Record<string, any>>({});
  const [enviando, setEnviando] = useState(false);
  const [historialVisible, setHistorialVisible] = useState(false);
  const [asignacionHistorial, setAsignacionHistorial] = useState<AsignacionTest | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await testsPsicometricosService.obtenerAsignacionesPaciente();
      setAsignaciones(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los tests psicométricos.');
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const iniciarTest = (tipoTest: TipoTest) => {
    setTestSeleccionado(tipoTest);
    setRespuestasForm({});
    setIsModalOpen(true);
  };

  const handleRespuestaChange = (pregId: string, valor: any) => {
    setRespuestasForm(prev => ({ ...prev, [pregId]: valor }));
  };

  const calcularPuntajeYDiagnostico = () => {
    const test = getTestById(testSeleccionado!);
    if (!test) return { puntaje: 0, diagnostico: '', desglose: {} };

    let puntaje = 0;
    test.preguntas.forEach(p => {
      puntaje += respuestasForm[p.id] || 0;
    });

    const desglose = test.interpretarDesglose(respuestasForm);
    const diagnostico = test.calcularDiagnostico(puntaje);
    
    // Detectar alerta crítica (p5 del test de bienestar >= 3)
    const alertaCritica = testSeleccionado === 'BIENESTAR_ACTUAL' && (respuestasForm['p5'] || 0) >= 3;

    return { puntaje, diagnostico, desglose, alertaCritica };
  };

  const handleEnviar = async () => {
    if (!testSeleccionado) return;

    const test = getTestById(testSeleccionado);
    if (!test) return;

    // Validar que todas las preguntas tengan respuesta
    for (const p of test.preguntas) {
      if (respuestasForm[p.id] === undefined) {
        message.warning(`Por favor responde la pregunta: ${p.texto.substring(0, 30)}...`);
        return;
      }
    }

    const { puntaje, diagnostico, desglose, alertaCritica } = calcularPuntajeYDiagnostico();

    // Encontrar la asignación activa
    const asignacion = asignaciones.find(a => a.tipoTest === testSeleccionado && a.estado === 'ACTIVO');
    if (!asignacion) {
      message.error('No hay un test activo disponible');
      return;
    }

    setEnviando(true);
    try {
      await testsPsicometricosService.responderTest(
        asignacion._id,
        respuestasForm,
        puntaje,
        diagnostico,
        desglose,
        alertaCritica
      );
      message.success('Test completado exitosamente');
      setIsModalOpen(false);
      cargarDatos();
    } catch (err) {
      message.error('Error al enviar el test');
    } finally {
      setEnviando(false);
    }
  };

  const getEstadoTest = (tipoTest: TipoTest) => {
    const asignacion = asignaciones.find(a => a.tipoTest === tipoTest);
    if (!asignacion) return { estado: 'INACTIVO', intentos: 0 };
    return { estado: asignacion.estado, intentos: asignacion.intentos.length };
  };

  const yaCompletoTest = (tipoTest: TipoTest): boolean => {
    const asignacion = asignaciones.find(a => a.tipoTest === tipoTest);
    return asignacion ? asignacion.intentos.length >= 1 : false;
  };

  // ── helpers puramente visuales (no tocan lógica de negocio) ──
  const totalPreguntasModal = getTestById(testSeleccionado || 'TENDENCIAS_PERSONALES')?.preguntas.length || 0;
  const respondidasModal = Object.keys(respuestasForm).length;
  const progresoModal = totalPreguntasModal > 0 ? Math.round((respondidasModal / totalPreguntasModal) * 100) : 0;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0', background: PALETTE.bg, minHeight: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ background: PALETTE.bg, minHeight: '100%', padding: '36px 40px 60px' }}>
      <style>{`
        .cm-mis-tests .ant-card { background: transparent; }
        .cm-test-card { transition: transform .16s ease, box-shadow .16s ease; }
        .cm-test-card:hover { transform: translateY(-3px); box-shadow: 0 12px 26px rgba(29, 88, 99, 0.12); }
        .cm-pregunta-card .ant-radio-wrapper { padding: 4px 0; }
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
      <div style={styles.hero}>
        <svg style={styles.heroDecoration} viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
          <circle cx="900" cy="10" r="140" fill="rgba(255,255,255,0.05)" />
          <circle cx="60" cy="180" r="90" fill="rgba(255,255,255,0.04)" />
        </svg>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Tag style={styles.heroEyebrow}>
            <FileTextOutlined style={{ marginRight: 6 }} />
            Evaluación clínica
          </Tag>
          <Title style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '12px 0 4px' }}>
            Mis Tests Psicométricos
          </Title>
          <Text style={{ color: PALETTE.accentSoft, fontSize: 14.5 }}>
            Realiza los tests que tu psicólogo te ha habilitado
          </Text>
        </div>
      </div>

      {/* Tests disponibles */}
      <div style={{ marginTop: 28, marginBottom: 32 }}>
        <Title level={4} style={{ color: PALETTE.primary, marginBottom: 16 }}>
          Tests Disponibles
        </Title>
        
        {TESTS_PREDEFINIDOS.map(test => {
          const { estado } = getEstadoTest(test.id);
          const isDisponible = estado === 'ACTIVO';
          const completado = yaCompletoTest(test.id);
          
          return (
            <Card
              key={test.id}
              className="cm-test-card"
              style={{
                marginBottom: 16,
                borderRadius: 16,
                border: `1px solid ${PALETTE.border}`,
                background: PALETTE.card,
                boxShadow: '0 4px 16px rgba(29, 88, 99, 0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: completado
                        ? `${PALETTE.success}1a`
                        : isDisponible
                        ? `${PALETTE.primary}1a`
                        : `${PALETTE.textMuted}1a`,
                      color: completado ? PALETTE.success : isDisponible ? PALETTE.primary : PALETTE.textMuted,
                      fontSize: 19,
                    }}
                  >
                    {completado ? <CheckCircleFilled /> : isDisponible ? <FileTextOutlined /> : <LockOutlined />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <Title level={5} style={{ color: PALETTE.primaryDark, margin: 0 }}>
                      {test.nombre}
                    </Title>
                    <Text style={{ color: PALETTE.textMuted, fontSize: 13 }}>
                      {test.preguntas.length} preguntas
                    </Text>
                  </div>
                </div>
                
                {isDisponible ? (
                  <Button 
                    type="primary" 
                    icon={completado ? <CheckCircleFilled /> : <SendOutlined />}
                    onClick={() => iniciarTest(test.id)}
                    disabled={completado}
                    style={{
                      borderRadius: 10,
                      fontWeight: 600,
                      background: completado ? undefined : PALETTE.primary,
                      borderColor: completado ? undefined : PALETTE.primary,
                    }}
                  >
                    {completado ? 'Test Completado' : 'Comenzar Test'}
                  </Button>
                ) : (
                  <Tag style={{ borderRadius: 999, padding: '4px 12px', color: PALETTE.textMuted }}>
                    <ClockCircleOutlined style={{ marginRight: 6 }} />
                    No habilitado por tu psicólogo
                  </Tag>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tests completados */}
      {asignaciones.filter(a => a.estado === 'COMPLETADO').length > 0 && (
        <div>
          <Divider style={{ borderColor: PALETTE.border, fontSize: 13, fontWeight: 600, color: PALETTE.primary }}>
            <HistoryOutlined style={{ marginRight: 6 }} />
            Tests Completados
          </Divider>
          
          {asignaciones
            .filter(a => a.estado === 'COMPLETADO')
            .map(a => (
              <Card
                key={a._id}
                className="cm-test-card"
                style={{
                  marginBottom: 12,
                  borderRadius: 12,
                  border: `1px solid ${PALETTE.border}`,
                }}
                actions={[
                  <Button 
                    key="ver" 
                    type="link" 
                    icon={<HistoryOutlined />}
                    onClick={() => {
                      setAsignacionHistorial(a);
                      setHistorialVisible(true);
                    }}
                    style={{ color: PALETTE.primary, fontWeight: 600 }}
                  >
                    Ver respuestas
                  </Button>,
                ]}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong style={{ color: PALETTE.primaryDark }}>{getTestById(a.tipoTest)?.nombre}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {a.intentos.length} intento(s) realizado(s)
                    </Text>
                  </div>
                  {a.intentos[a.intentos.length - 1]?.alertaCritica && (
                    <Tag icon={<WarningFilled />} color="error" style={{ borderRadius: 999, fontWeight: 600 }}>
                      Alerta
                    </Tag>
                  )}
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Modal para responder test */}
      <Modal
        title={
          <span style={{ color: PALETTE.primary, fontWeight: 800, fontSize: 18 }}>
            {getTestById(testSeleccionado || 'TENDENCIAS_PERSONALES')?.nombre}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        <div style={{ marginTop: 16 }}>
          <Text style={{ color: PALETTE.textMuted, marginBottom: 12, display: 'block' }}>
            {getTestById(testSeleccionado || 'TENDENCIAS_PERSONALES')?.instrucciones}
          </Text>

          {totalPreguntasModal > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 12.5, color: PALETTE.textMuted }}>Progreso</Text>
                <Text style={{ fontSize: 12.5, color: PALETTE.textMuted }}>
                  {respondidasModal}/{totalPreguntasModal}
                </Text>
              </div>
              <Progress
                percent={progresoModal}
                showInfo={false}
                strokeColor={PALETTE.accent}
                trailColor={PALETTE.border}
                size="small"
              />
            </div>
          )}

          {getTestById(testSeleccionado || 'TENDENCIAS_PERSONALES')?.preguntas.map((preg, index) => (
            <Card
              key={preg.id}
              className="cm-pregunta-card"
              style={{ marginBottom: 12, borderRadius: 12, background: PALETTE.bg, border: `1px solid ${PALETTE.border}` }}
              size="small"
            >
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ color: PALETTE.primaryDark }}>
                  Pregunta {index + 1} de {getTestById(testSeleccionado || 'TENDENCIAS_PERSONALES')?.preguntas.length}
                </Text>
              </div>
              <Text style={{ marginBottom: 12, display: 'block' }}>{preg.texto}</Text>
              
              {preg.tipo === 'ESCALA' ? (
                <Radio.Group
                  onChange={e => handleRespuestaChange(preg.id, e.target.value)}
                  value={respuestasForm[preg.id]}
                >
                  <Space direction="vertical">
                    {[0, 1, 2, 3, 4].map(v => (
                      <Radio key={v} value={v} style={{ fontSize: 13 }}>
                        {v} - {v === 0 ? 'Nada en absoluto' : v === 1 ? 'Un poco' : v === 2 ? 'Moderadamente' : v === 3 ? 'Bastante' : 'Mucho'}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              ) : (
                <Radio.Group
                  onChange={e => handleRespuestaChange(preg.id, e.target.value)}
                  value={respuestasForm[preg.id]}
                >
                  <Space direction="vertical">
                    {preg.opciones?.map(op => (
                      <Radio key={op.valor} value={op.valor} style={{ fontSize: 13 }}>
                        {op.label}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              )}
            </Card>
          ))}

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              onClick={handleEnviar}
              loading={enviando}
              style={{ background: PALETTE.success, borderColor: PALETTE.success, borderRadius: 24, fontWeight: 600, paddingLeft: 28, paddingRight: 28 }}
            >
              {enviando ? 'Enviando...' : 'Enviar Test'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de historial */}
      <Modal
        title={
          <span style={{ color: PALETTE.primary, fontWeight: 800, fontSize: 18 }}>
            Resultado: {getTestById(asignacionHistorial?.tipoTest || 'TENDENCIAS_PERSONALES')?.nombre}
          </span>
        }
        open={historialVisible}
        onCancel={() => setHistorialVisible(false)}
        footer={null}
        width={700}
      >
        {asignacionHistorial && (
          <div style={{ marginTop: 16 }}>
            {asignacionHistorial.intentos.length === 0 && (
              <Empty description="Aún no hay intentos registrados" />
            )}
            {asignacionHistorial.intentos.map((intento, index) => (
              <Card 
                key={index} 
                style={{ 
                  marginBottom: 16, 
                  borderRadius: 12,
                  border: `1px solid ${PALETTE.border}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text strong style={{ color: PALETTE.primaryDark }}>Intento #{index + 1}</Text>
                  <Text type="secondary">{new Date(intento.fecha).toLocaleDateString()}</Text>
                </div>
                
                <div style={{ marginBottom: 12 }}>
                  <Text>Puntaje: </Text>
                  <Text strong style={{ color: PALETTE.primary }}>
                    {intento.puntajeTotal}/{getTestById(asignacionHistorial.tipoTest)?.puntajeMaximo}
                  </Text>
                  <Text> - {intento.diagnostico}</Text>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <Text strong>Respuestas:</Text>
                  {Object.entries(intento.respuestas).map(([pregId, valor]) => (
                    <div key={pregId} style={{ fontSize: 12, marginLeft: 12 }}>
                      <Text type="secondary">{pregId}: </Text>
                      <Text>{valor}</Text>
                    </div>
                  ))}
                </div>

                {intento.alertaCritica && (
                  <Alert
                    type="error"
                    message="⚠️ ALERTA CRÍTICA: Ideación suicida detectada"
                    showIcon
                    style={{ borderRadius: 10 }}
                  />
                )}
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────────────────────
const styles: { [key: string]: React.CSSProperties } = {
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.primaryDark})`,
    boxShadow: '0 12px 30px rgba(18, 65, 74, 0.22)',
    padding: '28px 32px',
  },
  heroDecoration: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  heroEyebrow: {
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.25)',
    color: '#fff',
    borderRadius: 999,
    padding: '4px 12px',
    fontSize: 12.5,
    fontWeight: 600,
  },
};

export default MisTestsPsicometricos;