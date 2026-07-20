import React, { useEffect, useState } from 'react';
import { Card, Spin, Alert, message, Button, Modal, Radio, Typography, Divider, Tag, Space } from 'antd';
import { CheckOutlined, EyeOutlined } from '@ant-design/icons';
import { testsPsicometricosService, AsignacionTest } from '../../services/testsPsicometricosService';
import { TESTS_PREDEFINIDOS, getTestById, TipoTest } from '../../data/testsPredefinidos';
import { useAuth } from '../../hooks/useAuth';

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
  const { user } = useAuth();
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

      <div style={{ marginBottom: 24 }}>
        <Title style={{ color: PALETTE.primary, fontSize: 26, fontWeight: 800, margin: 0 }}>
          Mis Tests Psicométricos
        </Title>
        <Text style={{ color: PALETTE.textMuted, fontSize: 14, marginTop: 4, display: 'block' }}>
          Realiza los tests que tu psicólogo te ha habilitado
        </Text>
      </div>

      {/* Tests disponibles */}
      <div style={{ marginBottom: 32 }}>
        <Title level={4} style={{ color: PALETTE.primary, marginBottom: 16 }}>
          Tests Disponibles
        </Title>
        
        {TESTS_PREDEFINIDOS.map(test => {
          const { estado, intentos } = getEstadoTest(test.id);
          const isDisponible = estado === 'ACTIVO';
          
          return (
            <Card
              key={test.id}
              style={{
                marginBottom: 16,
                borderRadius: 16,
                border: `1px solid ${PALETTE.border}`,
                background: PALETTE.card,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Title level={5} style={{ color: PALETTE.primary, margin: 0 }}>
                    {test.nombre}
                  </Title>
                  <Text style={{ color: PALETTE.textMuted, fontSize: 13 }}>
                    {test.preguntas.length} preguntas
                  </Text>
                </div>
                
                {isDisponible ? (
                  <Button type="primary" onClick={() => iniciarTest(test.id)}>
                    Comenzar Test
                  </Button>
                ) : (
                  <Tag color="default">No habilitado por tu psicólogo</Tag>
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
            Tests Completados
          </Divider>
          
          {asignaciones
            .filter(a => a.estado === 'COMPLETADO')
            .map(a => (
              <Card
                key={a._id}
                style={{
                  marginBottom: 12,
                  borderRadius: 12,
                  border: `1px solid ${PALETTE.border}`,
                }}
                actions={[
                  <Button 
                    key="ver" 
                    type="link" 
                    onClick={() => {
                      setAsignacionHistorial(a);
                      setHistorialVisible(true);
                    }}
                  >
                    Ver respuestas
                  </Button>,
                ]}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong>{getTestById(a.tipoTest)?.nombre}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {a.intentos.length} intento(s) realizado(s)
                    </Text>
                  </div>
                  {a.intentos[a.intentos.length - 1]?.alertaCritica && (
                    <Tag color="error">🚨 Alerta</Tag>
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
          <Text style={{ color: PALETTE.textMuted, marginBottom: 16, display: 'block' }}>
            {getTestById(testSeleccionado || 'TENDENCIAS_PERSONALES')?.instrucciones}
          </Text>

          {getTestById(testSeleccionado || 'TENDENCIAS_PERSONALES')?.preguntas.map((preg, index) => (
            <Card key={preg.id} style={{ marginBottom: 12, borderRadius: 12, background: PALETTE.bg }} size="small">
              <div style={{ marginBottom: 8 }}>
                <Text strong>Pregunta {index + 1} de {getTestById(testSeleccionado || 'TENDENCIAS_PERSONALES')?.preguntas.length}</Text>
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
              onClick={handleEnviar}
              loading={enviando}
              style={{ background: PALETTE.success, borderColor: PALETTE.success, borderRadius: 24 }}
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
                  <Text strong>Intento #{index + 1}</Text>
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

export default MisTestsPsicometricos;