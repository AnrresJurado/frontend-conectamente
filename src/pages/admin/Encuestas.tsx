import React, { useEffect, useState } from 'react';
import { Tag, Spin, Alert, message, Card, Statistic, Button, Modal, Table, Form, Input, Select, Space, Popconfirm, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, MinusCircleOutlined } from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { encuestasService, Encuesta, Respuesta, CreateEncuestaDto } from '../../services/encuestasService';
import { pacientesService } from '../../services/pacientesService';

const { Option } = Select;
const { TextArea } = Input;

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

interface PacienteOption {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

const Encuestas: React.FC = () => {
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [encuestaSeleccionada, setEncuestaSeleccionada] = useState<Encuesta | null>(null);
  const [isModalRespuestasOpen, setIsModalRespuestasOpen] = useState(false);
  const [respuestasLoading, setRespuestasLoading] = useState(false);

  // Modal CRUD
  const [isCrudModalOpen, setIsCrudModalOpen] = useState(false);
  const [encuestaEditando, setEncuestaEditando] = useState<Encuesta | null>(null);
  const [crudLoading, setCrudLoading] = useState(false);
  const [form] = Form.useForm();

  // Modal Asignar
  const [isAsignarModalOpen, setIsAsignarModalOpen] = useState(false);
  const [encuestaAsignar, setEncuestaAsignar] = useState<Encuesta | null>(null);
  const [pacientes, setPacientes] = useState<PacienteOption[]>([]);
  const [asignarLoading, setAsignarLoading] = useState(false);

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

  // ─── VER RESPUESTAS ──────────────────────────────────
  const verRespuestas = async (encuesta: Encuesta) => {
    setEncuestaSeleccionada(encuesta);
    setIsModalRespuestasOpen(true);
    setRespuestasLoading(true);
    try {
      const data = await encuestasService.getRespuestas(encuesta._id);
      setRespuestas(data);
    } catch (err) {
      console.error(err);
      message.error('Error al cargar las respuestas');
    } finally {
      setRespuestasLoading(false);
    }
  };

  // ─── CREAR / EDITAR ──────────────────────────────────
  const abrirModalCrear = () => {
    setEncuestaEditando(null);
    form.resetFields();
    form.setFieldsValue({ preguntas: [{ pregunta: '', tipo: 'TEXTO', opciones: [] }] });
    setIsCrudModalOpen(true);
  };

  const abrirModalEditar = (encuesta: Encuesta) => {
    setEncuestaEditando(encuesta);
    form.setFieldsValue({
      titulo: encuesta.titulo,
      descripcion: encuesta.descripcion,
      preguntas: encuesta.preguntas.map(p => ({
        pregunta: p.pregunta,
        tipo: p.tipo,
        opciones: p.opciones || [],
      })),
    });
    setIsCrudModalOpen(true);
  };

  const handleGuardarEncuesta = async (values: any) => {
    setCrudLoading(true);
    try {
      const payload: CreateEncuestaDto = {
        titulo: values.titulo,
        descripcion: values.descripcion,
        preguntas: values.preguntas.map((p: any) => {
          // Convertir opciones de string separado por comas a array
          let opciones: string[] = [];
          if (p.tipo === 'ESCALA' || p.tipo === 'MULTIPLE') {
            if (Array.isArray(p.opciones)) {
              opciones = p.opciones;
            } else if (typeof p.opciones === 'string' && p.opciones.trim()) {
              opciones = p.opciones.split(',').map((o: string) => o.trim()).filter(Boolean);
            }
          }
          return {
            pregunta: p.pregunta,
            tipo: p.tipo,
            opciones,
          };
        }),
      };

      if (encuestaEditando) {
        await encuestasService.update(encuestaEditando._id, payload);
        message.success('Encuesta actualizada exitosamente.');
      } else {
        await encuestasService.create(payload);
        message.success('Encuesta creada exitosamente.');
      }

      setIsCrudModalOpen(false);
      form.resetFields();
      
      // Si estaba viendo respuestas de la encuesta editada, cerrar modal
      if (encuestaSeleccionada?._id === encuestaEditando?._id) {
        setIsModalRespuestasOpen(false);
        setEncuestaSeleccionada(null);
      }
      
      cargarDatos();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || 'Error al guardar la encuesta.');
    } finally {
      setCrudLoading(false);
    }
  };

  // ─── ELIMINAR ────────────────────────────────────────
  const handleEliminar = async (id: string) => {
    try {
      await encuestasService.delete(id);
      message.success('Encuesta eliminada exitosamente.');
      setEncuestas(prev => prev.filter(e => e._id !== id));
      if (encuestaSeleccionada?._id === id) {
        setIsModalRespuestasOpen(false);
        setEncuestaSeleccionada(null);
      }
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || 'Error al eliminar la encuesta.');
    }
  };

  // ─── ASIGNAR A PACIENTE ──────────────────────────────
  const abrirModalAsignar = async (encuesta: Encuesta) => {
    setEncuestaAsignar(encuesta);
    setIsAsignarModalOpen(true);
    try {
      const data = await pacientesService.getAll();
      setPacientes(data.map((p: any) => ({
        id: p.id || p._id,
        nombre: p.usuario?.nombre || '',
        apellido: p.usuario?.apellido || '',
        email: p.usuario?.email || '',
      })));
    } catch (err) {
      console.error(err);
      message.error('Error al cargar pacientes.');
    }
  };

  const handleAsignar = async (values: { pacienteId: string }) => {
    if (!encuestaAsignar) return;
    setAsignarLoading(true);
    try {
      await encuestasService.asignarEncuesta(encuestaAsignar._id, values.pacienteId);
      message.success('Encuesta asignada al paciente exitosamente.');
      setIsAsignarModalOpen(false);
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || 'Error al asignar la encuesta.');
    } finally {
      setAsignarLoading(false);
    }
  };

  // ─── DATOS PARA GRÁFICO ──────────────────────────────
  const datosRespuestasPorEncuesta = metricas?.respuestasPorEncuesta?.map((item: any, index: number) => ({
    nombre: item.encuestaTitulo?.length > 20 ? item.encuestaTitulo.substring(0, 20) + '…' : item.encuestaTitulo,
    cantidad: item.cantidad,
    color: COLORS[index % COLORS.length],
  })) || [];

  // ─── COLUMNAS DE TABLA ───────────────────────────────
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
      width: 320,
      render: (_: any, record: Encuesta) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            size="small"
            onClick={() => verRespuestas(record)}
            style={{ background: PALETTE.primary, borderColor: PALETTE.primary }}
          >
            Ver Respuestas
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => abrirModalEditar(record)}
          >
            Editar
          </Button>
          <Button
            size="small"
            icon={<UserAddOutlined />}
            style={{ borderColor: PALETTE.accent, color: PALETTE.accent }}
            onClick={() => abrirModalAsignar(record)}
          >
            Asignar
          </Button>
          <Popconfirm
            title="¿Deseas eliminar esta encuesta?"
            description="Esta acción no se puede deshacer. Las respuestas asociadas también se eliminarán."
            onConfirm={() => handleEliminar(record._id)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ─── LOADING ─────────────────────────────────────────
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
      <style>{`
        .cm-encuestas .ant-table { background: transparent; }
        .cm-encuestas .ant-table-thead > tr > th {
          background: #f2f9f9;
          color: ${PALETTE.primary};
          font-weight: 700;
          font-size: 12.5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: none;
        }
        .cm-encuestas .ant-table-thead > tr > th::before { display: none; }
        .cm-encuestas .ant-table-tbody > tr > td {
          border-bottom: 1px solid #eef2f2;
          padding-top: 14px;
          padding-bottom: 14px;
        }
        .cm-encuestas .ant-table-tbody > tr:hover > td { background: #f7fcfc; }
        .cm-encuestas .ant-table-tbody > tr:last-child > td { border-bottom: none; }
        .cm-encuestas .ant-pagination-item-active { border-color: ${PALETTE.primary}; }
        .cm-encuestas .ant-pagination-item-active a { color: ${PALETTE.primary}; }
        .cm-encuestas-modal .ant-modal-content { border-radius: 20px; overflow: hidden; }
        .cm-btn-gradient {
          background: linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.primaryDark});
          color: #ffffff;
          border: none;
          border-radius: 24px;
          padding: '11px 22px';
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(29, 88, 99, 0.25);
        }
        .cm-btn-gradient:hover {
          opacity: 0.9;
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

      {/* ═══════════════ ENCABEZADO ═══════════════ */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestión de Encuestas</h1>
          <p style={styles.subtitle}>
            Administra encuestas, asígnalas a pacientes y visualiza respuestas
          </p>
        </div>
        <button
          style={styles.btnPrimary}
          onClick={abrirModalCrear}
        >
          <PlusOutlined />
          Crear Encuesta
        </button>
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
            <p style={{ ...styles.emptyText, fontSize: 12 }}>
              Haz clic en "Crear Encuesta" para agregar la primera
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={encuestas}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            className="cm-encuestas"
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
        open={isModalRespuestasOpen}
        onCancel={() => {
          setIsModalRespuestasOpen(false);
          setEncuestaSeleccionada(null);
          setRespuestas([]);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <div style={{ marginTop: 16 }}>
          {respuestasLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : respuestas.length === 0 ? (
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
                        hour: '2-digit',
                        minute: '2-digit',
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

      {/* ═══════════════ MODAL CREAR/EDITAR ENCUESTA ═══════════════ */}
      <Modal
        title={
          <span style={styles.modalTitle}>
            {encuestaEditando ? 'Editar Encuesta' : 'Nueva Encuesta'}
          </span>
        }
        open={isCrudModalOpen}
        onCancel={() => { setIsCrudModalOpen(false); setEncuestaEditando(null); form.resetFields(); }}
        footer={null}
        destroyOnClose
        width={750}
        className="cm-encuestas-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleGuardarEncuesta} style={{ marginTop: 16 }}>
          <Form.Item
            name="titulo"
            label="Título de la Encuesta"
            rules={[{ required: true, message: 'Por favor ingresa el título' }]}
          >
            <Input placeholder="Ej. Evaluación de Ansiedad Semanal" />
          </Form.Item>

          <Form.Item
            name="descripcion"
            label="Descripción"
            rules={[{ required: true, message: 'Por favor ingresa la descripción' }]}
          >
            <TextArea rows={2} placeholder="Describe el propósito de esta encuesta..." />
          </Form.Item>

          <Divider style={{ borderColor: PALETTE.border, fontSize: 14, fontWeight: 600, color: PALETTE.primary }}>
            Preguntas
          </Divider>

          <Form.List name="preguntas">
            {(fields, { add, remove }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card
                    key={key}
                    size="small"
                    style={{
                      borderRadius: 12,
                      border: `1px solid ${PALETTE.border}`,
                      background: PALETTE.bg,
                    }}
                    extra={
                      fields.length > 1 && (
                        <MinusCircleOutlined
                          style={{ color: PALETTE.danger, cursor: 'pointer' }}
                          onClick={() => remove(name)}
                        />
                      )
                    }
                    title={<span style={{ fontSize: 13, color: PALETTE.primary }}>Pregunta #{index + 1}</span>}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'pregunta']}
                        rules={[{ required: true, message: 'Ingresa la pregunta' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Texto de la pregunta" />
                      </Form.Item>

                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <Form.Item
                          {...restField}
                          name={[name, 'tipo']}
                          rules={[{ required: true, message: 'Selecciona el tipo' }]}
                          style={{ marginBottom: 0, minWidth: 150 }}
                        >
                          <Select placeholder="Tipo de respuesta">
                            <Option value="TEXTO">Texto libre</Option>
                            <Option value="ESCALA">Escala numérica</Option>
                            <Option value="MULTIPLE">Opción múltiple</Option>
                          </Select>
                        </Form.Item>
                      </div>

                      {/* Opciones para ESCALA y MULTIPLE */}
                      <Form.Item
                        {...restField}
                        name={[name, 'opciones']}
                        label={false}
                        style={{ marginBottom: 0 }}
                      >
                        <Input
                          placeholder={
                            "Para ESCALA o MÚLTIPLE: opciones separadas por coma. Ej: 1,2,3,4,5 o Sí,No,Tal vez"
                          }
                          style={{ fontSize: 12 }}
                        />
                      </Form.Item>
                    </div>
                  </Card>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add({ pregunta: '', tipo: 'TEXTO', opciones: '' })}
                  icon={<PlusOutlined />}
                  style={{
                    borderColor: PALETTE.accent,
                    color: PALETTE.accent,
                    borderRadius: 12,
                  }}
                >
                  Agregar Pregunta
                </Button>
              </div>
            )}
          </Form.List>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 24 }}>
            <Space>
              <button
                type="button"
                style={styles.btnSecundario}
                onClick={() => { setIsCrudModalOpen(false); setEncuestaEditando(null); form.resetFields(); }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ ...styles.btnPrimary, opacity: crudLoading ? 0.7 : 1 }}
                disabled={crudLoading}
              >
                {crudLoading ? 'Guardando...' : encuestaEditando ? 'Actualizar Encuesta' : 'Crear Encuesta'}
              </button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ═══════════════ MODAL ASIGNAR A PACIENTE ═══════════════ */}
      <Modal
        title={
          <span style={styles.modalTitle}>
            Asignar: {encuestaAsignar?.titulo}
          </span>
        }
        open={isAsignarModalOpen}
        onCancel={() => { setIsAsignarModalOpen(false); setEncuestaAsignar(null); }}
        footer={null}
        destroyOnClose
        className="cm-encuestas-modal"
        width={500}
      >
        <Form layout="vertical" onFinish={handleAsignar} style={{ marginTop: 16 }}>
          <Form.Item
            name="pacienteId"
            label="Seleccionar Paciente"
            rules={[{ required: true, message: 'Selecciona un paciente' }]}
          >
            <Select
              placeholder="Buscar paciente..."
              showSearch
              optionFilterProp="children"
            >
              {pacientes.map(p => (
                <Option key={p.id} value={p.id}>
                  {p.nombre} {p.apellido} ({p.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ background: PALETTE.bg, borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: PALETTE.textMuted }}>
              <strong style={{ color: PALETTE.primary }}>Información:</strong> Al asignar esta encuesta,
              el paciente podrá verla en su sección <strong>"Mis Encuestas"</strong> y responderla.
            </p>
          </div>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <button
                type="button"
                style={styles.btnSecundario}
                onClick={() => { setIsAsignarModalOpen(false); setEncuestaAsignar(null); }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ ...styles.btnPrimary, opacity: asignarLoading ? 0.7 : 1 }}
                disabled={asignarLoading}
              >
                {asignarLoading ? 'Asignando...' : 'Asignar a Paciente'}
              </button>
            </Space>
          </Form.Item>
        </Form>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
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
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.primaryDark})`,
    color: '#ffffff',
    border: 'none',
    borderRadius: 24,
    padding: '11px 22px',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(29, 88, 99, 0.25)',
  },
  btnSecundario: {
    background: '#ffffff',
    color: '#475569',
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 24,
    padding: '11px 22px',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
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