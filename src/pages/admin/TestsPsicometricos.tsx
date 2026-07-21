import React, { useEffect, useState } from 'react';
import { Table, Button, Spin, Alert, message, Card, Typography, Modal, Tag, Select, Space, Row, Col } from 'antd';
import { testsPsicometricosService, AsignacionTest } from '../../services/testsPsicometricosService';
import { TESTS_PREDEFINIDOS, getTestById, TipoTest } from '../../data/testsPredefinidos';
import { pacientesService } from '../../services/pacientesService';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';

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

const TestsPsicometricos: React.FC = () => {
  const [asignaciones, setAsignaciones] = useState<AsignacionTest[]>([]);

  const [pacientes, setPacientes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historialVisible, setHistorialVisible] = useState(false);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState<AsignacionTest | null>(null);
  
  // Modal para asignar test
  const [isAsignarModalOpen, setIsAsignarModalOpen] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<string>('');
  const [testSeleccionado, setTestSeleccionado] = useState<TipoTest | null>(null);
  const [asignando, setAsignando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [asignacionesData, pacientesData] = await Promise.all([
        testsPsicometricosService.obtenerAsignacionesPsicologo(),
        pacientesService.getAll(),
      ]);
      
      const pacientesMap: Record<string, string> = {};
      pacientesData.forEach((p: any) => {
        pacientesMap[p._id] = `${p.nombre} ${p.apellido || ''}`.trim();
      });
      
      setAsignaciones(asignacionesData);
      setPacientes(pacientesMap);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos de tests psicométricos.');
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleActivar = async (pacienteId: string, tipoTest: TipoTest) => {
    try {
      await testsPsicometricosService.asignarTest(pacienteId, tipoTest);
      message.success('Test activado correctamente');
      cargarDatos();
    } catch (err) {
      message.error('Error al activar el test');
    }
  };

  const handleReactivar = async (asignacion: AsignacionTest) => {
    try {
      await testsPsicometricosService.asignarTest(asignacion.pacienteId, asignacion.tipoTest);
      message.success('Test reactivado correctamente');
      cargarDatos();
    } catch (err) {
      message.error('Error al reactivar el test');
    }
  };

  const verHistorial = (asignacion: AsignacionTest) => {
    setAsignacionSeleccionada(asignacion);
    setHistorialVisible(true);
  };

  const handleMarcarComoVisto = async (asignacionId: string) => {
    try {
      await testsPsicometricosService.marcarComoVisto(asignacionId);
      message.success('Marcado como visto');
      cargarDatos();
    } catch (err) {
      message.error('Error al marcar como visto');
    }
  };

  const abrirModalAsignar = () => {
    setPacienteSeleccionado('');
    setTestSeleccionado(null);
    setIsAsignarModalOpen(true);
  };

  const handleAsignarTest = async () => {
    if (!pacienteSeleccionado || !testSeleccionado) {
      message.warning('Selecciona un paciente y un test');
      return;
    }
    setAsignando(true);
    try {
      await testsPsicometricosService.asignarTest(pacienteSeleccionado, testSeleccionado);
      message.success('Test asignado correctamente');
      setIsAsignarModalOpen(false);
      cargarDatos();
    } catch (err) {
      message.error('Error al asignar el test');
    } finally {
      setAsignando(false);
    }
  };

  const getEstadoTag = (estado: string, nuevoResultado: boolean, alertaCritica?: boolean) => {
    if (estado === 'INACTIVO') {
      return <Tag color="default">❌ Inactivo</Tag>;
    }
    if (estado === 'ACTIVO') {
      return <Tag color="processing">✅ Activo</Tag>;
    }
    if (nuevoResultado) {
      return <Tag color="warning">🆕 Completado (NUEVO)</Tag>;
    }
    if (alertaCritica) {
      return <Tag color="error">🚨 Alerta</Tag>;
    }
    return <Tag color="success">✔ Completado</Tag>;
  };

  const renderCeldaTest = (asignacion: AsignacionTest | undefined, tipoTest: TipoTest) => {
    if (!asignacion) {
      return (
        <div>
          <Tag color="default">❌ Inactivo</Tag>
          <br />
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleActivar('', tipoTest)}
            style={{ marginTop: 8 }}
          >
            [Activar]
          </Button>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>Intentos: 0</Text>
        </div>
      );
    }

    const ultimoIntento = asignacion.intentos[asignacion.intentos.length - 1];
    const alertaCritica = ultimoIntento?.alertaCritica;

    return (
      <div>
        {getEstadoTag(asignacion.estado, asignacion.nuevoResultado, alertaCritica)}
        <br />
        {asignacion.estado === 'COMPLETADO' ? (
          <Button 
            size="small"
            onClick={() => handleReactivar(asignacion)}
            style={{ marginTop: 4 }}
          >
            🔄 [Reactivar]
          </Button>
        ) : (
          <Button 
            size="small"
            danger
            onClick={() => testsPsicometricosService.desactivarTest(asignacion._id)}
            style={{ marginTop: 4 }}
          >
            [Desactivar]
          </Button>
        )}
        <br />
        {asignacion.numeroIntentos > 0 ? (
          <Text 
            style={{ fontSize: 12, color: PALETTE.accent, cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => verHistorial(asignacion)}
          >
            Intentos: {asignacion.numeroIntentos} 🔍
          </Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>Intentos: 0</Text>
        )}
        {asignacion.nuevoResultado && (
          <Button 
            size="small" 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleMarcarComoVisto(asignacion._id)}
            style={{ padding: '4px 8px', fontSize: 11 }}
          >
            Marcar como visto
          </Button>
        )}
        {ultimoIntento && (
          <div style={{ fontSize: 11, color: PALETTE.textMuted, marginTop: 2 }}>
            Último: {ultimoIntento.puntajeTotal}/{getTestById(tipoTest)?.puntajeMaximo} - {ultimoIntento.diagnostico}
          </div>
        )}
      </div>
    );
  };

  // Agrupar asignaciones por paciente
  const pacientesConAsignaciones = new Map<string, { pacienteId: string; nombre: string; tendencias?: AsignacionTest; bienestar?: AsignacionTest }>();
  
  asignaciones.forEach(a => {
    const key = a.pacienteId;
    if (!pacientesConAsignaciones.has(key)) {
      pacientesConAsignaciones.set(key, {
        pacienteId: a.pacienteId,
        nombre: pacientes[a.pacienteId] || 'Paciente desconocido',
      });
    }
    const entry = pacientesConAsignaciones.get(key)!;
    if (a.tipoTest === 'TENDENCIAS_PERSONALES') entry.tendencias = a;
    if (a.tipoTest === 'BIENESTAR_ACTUAL') entry.bienestar = a;
  });

  const dataSource = Array.from(pacientesConAsignaciones.values());

  const columns = [
    {
      title: 'Paciente',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (nombre: string) => <Text strong>{nombre}</Text>,
    },
    {
      title: 'Tendencias Personales',
      key: 'tendencias',
      render: (_: any, record: any) => renderCeldaTest(record.tendencias, 'TENDENCIAS_PERSONALES'),
    },
    {
      title: 'Bienestar Actual',
      key: 'bienestar',
      render: (_: any, record: any) => renderCeldaTest(record.bienestar, 'BIENESTAR_ACTUAL'),
    },
  ];

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
        .cm-tests-psico .ant-table { background: transparent; }
        .cm-tests-psico .ant-table-thead > tr > th {
          background: #f2f9f9;
          color: ${PALETTE.primary};
          font-weight: 700;
          font-size: 12.5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: none;
        }
        .cm-tests-psico .ant-table-tbody > tr > td {
          border-bottom: 1px solid #eef2f2;
          padding-top: 14px;
          padding-bottom: 14px;
        }
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
          Tests Psicométricos
        </Title>
        <Text style={{ color: PALETTE.textMuted, fontSize: 14, marginTop: 4, display: 'block' }}>
          Gestiona y revisa los tests psicométricos de tus pacientes
        </Text>
      </div>

      {/* Tests Disponibles para Asignar */}
      <Card style={{ borderRadius: 20, border: `1px solid ${PALETTE.border}`, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={4} style={{ color: PALETTE.primary, margin: 0 }}>
              Tests Disponibles
            </Title>
            <Text style={{ color: PALETTE.textMuted, fontSize: 13 }}>
              Asigna tests a tus pacientes
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={abrirModalAsignar}
            style={{ background: PALETTE.primary, borderColor: PALETTE.primary }}
          >
            Asignar Test
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {TESTS_PREDEFINIDOS.map(test => (
            <Col xs={24} sm={12} key={test.id}>
              <Card 
                size="small"
                style={{ 
                  borderRadius: 12, 
                  border: `1px solid ${PALETTE.border}`,
                  background: PALETTE.bg 
                }}
              >
                <Text strong style={{ color: PALETTE.primary, fontSize: 15 }}>
                  {test.nombre}
                </Text>
                <br />
                <Text style={{ fontSize: 12, color: PALETTE.textMuted }}>
                  {test.preguntas.length} preguntas · Puntaje máx: {test.puntajeMaximo}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Tabla de Asignaciones */}
      <Card style={{ borderRadius: 20, border: `1px solid ${PALETTE.border}` }}>
        <Table
          className="cm-tests-psico"
          dataSource={dataSource}
          columns={columns}
          rowKey="pacienteId"
          pagination={false}
        />
      </Card>

      {/* Modal Asignar Test */}
      <Modal
        title={<span style={{ color: PALETTE.primary, fontWeight: 800, fontSize: 18 }}>Asignar Test a Paciente</span>}
        open={isAsignarModalOpen}
        onCancel={() => setIsAsignarModalOpen(false)}
        footer={null}
        width={500}
      >
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, color: PALETTE.primary }}>
              Seleccionar Paciente
            </Text>
            <Select
              style={{ width: '100%' }}
              placeholder="Buscar paciente..."
              showSearch
              optionFilterProp="children"
              value={pacienteSeleccionado || undefined}
              onChange={(value) => setPacienteSeleccionado(value)}
            >
              {Object.entries(pacientes).map(([id, nombre]) => (
                <Select.Option key={id} value={id}>{nombre}</Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, color: PALETTE.primary }}>
              Seleccionar Test
            </Text>
            <Select
              style={{ width: '100%' }}
              placeholder="Seleccionar test..."
              value={testSeleccionado || undefined}
              onChange={(value) => setTestSeleccionado(value)}
            >
              {TESTS_PREDEFINIDOS.map(test => (
                <Select.Option key={test.id} value={test.id}>
                  {test.nombre} ({test.preguntas.length} preguntas)
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsAsignarModalOpen(false)}>Cancelar</Button>
              <Button 
                type="primary" 
                onClick={handleAsignarTest}
                loading={asignando}
                style={{ background: PALETTE.primary, borderColor: PALETTE.primary }}
              >
                Asignar Test
              </Button>
            </Space>
          </div>
        </div>
      </Modal>

      {/* Modal de historial */}
      <Modal
        title={
          <span style={{ color: PALETTE.primary, fontWeight: 800, fontSize: 18 }}>
            Historial: {pacientes[asignacionSeleccionada?.pacienteId || ''] || 'Paciente'} - {getTestById(asignacionSeleccionada?.tipoTest || 'TENDENCIAS_PERSONALES')?.nombre}
          </span>
        }
        open={historialVisible}
        onCancel={() => setHistorialVisible(false)}
        footer={null}
        width={800}
      >
        {asignacionSeleccionada && (
          <div style={{ marginTop: 16 }}>
            {asignacionSeleccionada.intentos.map((intento, index) => (
              <Card 
                key={index} 
                style={{ 
                  marginBottom: 16, 
                  borderRadius: 12,
                  border: `1px solid ${PALETTE.border}`,
                  background: index === asignacionSeleccionada.intentos.length - 1 ? PALETTE.accentSoft : PALETTE.bg
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text strong>Intento #{index + 1}</Text>
                  <Text type="secondary">{new Date(intento.fecha).toLocaleDateString()}</Text>
                </div>
                
                <div style={{ marginBottom: 12 }}>
                  <Text>Puntaje: </Text>
                  <Text strong style={{ color: PALETTE.primary }}>
                    {intento.puntajeTotal}/{getTestById(asignacionSeleccionada.tipoTest)?.puntajeMaximo}
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

export default TestsPsicometricos;