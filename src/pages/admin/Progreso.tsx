import React, { useEffect, useState } from 'react';
import { Table, Tag, Spin, Alert, message, Select, DatePicker, Card, Statistic, Modal, Form, InputNumber, Input, Button, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { progresoService, Progreso } from '../../services/progresoService';
import { pacientesService } from '../../services/pacientesService';
import { historialService, HistorialClinico } from '../../services/historialService';
import { Paciente } from '../../types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const ESTADOS_EMOCIONALES = ['Excelente', 'Bien', 'Regular', 'Malo', 'Muy malo'];

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

const ESTADO_EMOCIONAL_COLORS: Record<string, string> = {
  'Excelente': '#3f9d6f',
  'Bien': '#4da6b0',
  'Regular': '#e0a13a',
  'Malo': '#c0564e',
  'Muy malo': '#a83232',
};

const Progreso: React.FC = () => {
  const [progresos, setProgresos] = useState<Progreso[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroPaciente, setFiltroPaciente] = useState<string>('todos');
  const [filtroFechas, setFiltroFechas] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [progresoEditar, setProgresoEditar] = useState<Progreso | null>(null);
  const [historialesPaciente, setHistorialesPaciente] = useState<HistorialClinico[]>([]);
  const [loadingHistoriales, setLoadingHistoriales] = useState(false);
  const [form] = Form.useForm();
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async (esRefrescoManual = false) => {
    if (esRefrescoManual) {
      setRefrescando(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const [progresosData, pacientesData] = await Promise.all([
        progresoService.getAll(),
        pacientesService.getAll(),
      ]);
      setProgresos(progresosData);
      setPacientes(pacientesData);
      if (esRefrescoManual) {
        message.success('Datos actualizados.');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos de progreso.');
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
      setRefrescando(false);
    }
  };

  const cargarHistorialesPaciente = async (usuarioId: string) => {
    setLoadingHistoriales(true);
    try {
      const data = await historialService.getByPacienteUsuarioId(usuarioId);
      const ordenados = [...data].sort(
        (a, b) => dayjs(b.fechaSesion).valueOf() - dayjs(a.fechaSesion).valueOf()
      );
      setHistorialesPaciente(ordenados);
      return ordenados;
    } catch (err) {
      console.error(err);
      message.error('No se pudieron cargar las sesiones clínicas de este paciente.');
      setHistorialesPaciente([]);
      return [];
    } finally {
      setLoadingHistoriales(false);
    }
  };

  const handlePacienteChangeEnForm = async (usuarioId: string) => {
    form.setFieldsValue({ historialId: undefined });
    const ordenados = await cargarHistorialesPaciente(usuarioId);
    if (ordenados.length > 0) {
      form.setFieldsValue({ historialId: ordenados[0].id });
    }
  };

  const abrirModalCrear = () => {
    setProgresoEditar(null);
    setHistorialesPaciente([]);
    form.resetFields();
    setIsModalOpen(true);
  };

  const abrirModalEditar = async (record: Progreso) => {
    setProgresoEditar(record);
    setIsModalOpen(true);
    const usuarioId = record.historial?.paciente?.id;
    form.setFieldsValue({
      pacienteUsuarioId: usuarioId,
      historialId: record.historial?.id,
      fecha: dayjs(record.fecha),
      estadoEmocional: record.estadoEmocional,
      avance: parseInt(record.avance) || 0,
      observaciones: record.observaciones,
    });
    if (usuarioId) {
      await cargarHistorialesPaciente(usuarioId);
    }
  };

  const handleSubmit = async (values: any) => {
    setFormLoading(true);
    try {
      const payload = {
        historialId: values.historialId,
        fecha: values.fecha.toISOString(),
        estadoEmocional: values.estadoEmocional,
        avance: String(values.avance),
        observaciones: values.observaciones,
      };

      if (progresoEditar) {
        await progresoService.update(progresoEditar.id, payload);
        message.success('Registro de progreso actualizado exitosamente.');
      } else {
        await progresoService.create(payload);
        message.success('Registro de progreso creado exitosamente.');
      }

      setIsModalOpen(false);
      setProgresoEditar(null);
      form.resetFields();
      cargarDatos();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || 'No se pudo guardar el registro de progreso.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      await progresoService.remove(id);
      message.success('Registro de progreso eliminado exitosamente.');
      setProgresos((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || 'No se pudo eliminar el registro de progreso.');
    }
  };

  // Filtrar progresos
  const progresosFiltrados = progresos.filter((p) => {
    if (filtroPaciente !== 'todos' && p.historial?.paciente?.id !== filtroPaciente) {
      return false;
    }
    if (filtroFechas) {
      const fechaProgreso = dayjs(p.fecha);
      if (fechaProgreso.isBefore(filtroFechas[0], 'day') || fechaProgreso.isAfter(filtroFechas[1], 'day')) {
        return false;
      }
    }
    return true;
  });

  // Datos para el gráfico de estados emocionales
  const datosEstadosEmocionales = Object.entries(
    progresosFiltrados.reduce((acc, p) => {
      acc[p.estadoEmocional] = (acc[p.estadoEmocional] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([estado, cantidad]) => ({
    estado,
    cantidad,
    color: ESTADO_EMOCIONAL_COLORS[estado] || PALETTE.accent,
  }));

  // Datos para el gráfico de avances
  const datosAvances = progresosFiltrados.reduce((acc, p) => {
    const mes = dayjs(p.fecha).format('MMM YYYY');
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const datosAvancesGrafico = Object.entries(datosAvances)
    .map(([mes, cantidad]) => ({ mes, cantidad }))
    .slice(-6);

  // Estadísticas generales
  const estadisticas = {
    total: progresosFiltrados.length,
    ultimos30Dias: progresosFiltrados.filter((p) =>
      dayjs(p.fecha).isAfter(dayjs().subtract(30, 'day'))
    ).length,
    promedioAvance: progresosFiltrados.length > 0
      ? Math.round(
          progresosFiltrados.reduce((acc, p) => {
            const valor = parseInt(p.avance) || 0;
            return acc + valor;
          }, 0) / progresosFiltrados.length
        )
      : 0,
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      sorter: (a: Progreso, b: Progreso) =>
        dayjs(a.fecha).unix() - dayjs(b.fecha).unix(),
      render: (fecha: string) =>
        dayjs(fecha).format('DD/MM/YYYY'),
    },
    {
      title: 'Paciente',
      key: 'paciente',
      render: (_: any, record: Progreso) => {
        const paciente = pacientes.find((p) => p.usuario?.id === record.historial?.paciente?.id);
        return (
          <span>
            {paciente ? `${paciente.usuario?.nombre} ${paciente.usuario?.apellido || ''}` : 'Sin nombre'}
          </span>
        );
      },
    },
    {
      title: 'Estado Emocional',
      dataIndex: 'estadoEmocional',
      key: 'estadoEmocional',
      render: (estado: string) => {
        const color = ESTADO_EMOCIONAL_COLORS[estado] || PALETTE.textMuted;
        return <Tag color={color}>{estado}</Tag>;
      },
    },
    {
      title: 'Avance',
      dataIndex: 'avance',
      key: 'avance',
      render: (avance: string) => <span>{avance}%</span>,
    },
    {
      title: 'Observaciones',
      dataIndex: 'observaciones',
      key: 'observaciones',
      ellipsis: true,
      render: (text: string) => text || '—',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Progreso) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ color: PALETTE.accent }} />}
            onClick={() => abrirModalEditar(record)}
          />
          <Popconfirm
            title="¿Eliminar este registro de progreso?"
            okText="Eliminar"
            cancelText="Cancelar"
            onConfirm={() => handleEliminar(record.id)}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
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
      <div style={{ ...styles.header, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={styles.title}>Registro de Progreso Clínico</h1>
          <p style={styles.subtitle}>
            Seguimiento del estado emocional y avance de pacientes
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={abrirModalCrear}
          style={{
            background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.primaryDark})`,
            border: 'none',
            borderRadius: 24,
            height: 40,
            fontWeight: 700,
            boxShadow: '0 6px 16px rgba(29, 88, 99, 0.25)',
          }}
        >
          Nuevo Registro
        </Button>
      </div>

      {/* ═══════════════ FILTROS ═══════════════ */}
      <Card style={styles.filtersCard}>
        <div style={styles.filtersRow}>
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Paciente:</label>
            <Select
              value={filtroPaciente}
              onChange={setFiltroPaciente}
              style={{ width: '100%' }}
              placeholder="Todos los pacientes"
            >
              <Option value="todos">Todos los pacientes</Option>
              {pacientes.map((p) => (
                <Option key={p.id} value={p.usuario?.id}>
                  {p.usuario?.nombre} {p.usuario?.apellido}
                </Option>
              ))}
            </Select>
          </div>
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Rango de fechas:</label>
            <RangePicker
              value={filtroFechas}
              onChange={(dates) => setFiltroFechas(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </div>
          <Button
            type="primary"
            loading={refrescando}
            onClick={() => cargarDatos(true)}
            style={{ ...styles.btnPrimary, border: 'none' }}
          >
            Actualizar Datos
          </Button>
        </div>
      </Card>

      {/* ═══════════════ ESTADÍSTICAS ═══════════════ */}
      <div style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Statistic
            title="Total de Registros"
            value={estadisticas.total}
            prefix="📊"
            valueStyle={{ color: PALETTE.primary, fontWeight: 700 }}
          />
        </Card>
        <Card style={styles.statCard}>
          <Statistic
            title="Últimos 30 Días"
            value={estadisticas.ultimos30Dias}
            prefix="📅"
            valueStyle={{ color: PALETTE.accent, fontWeight: 700 }}
          />
        </Card>
        <Card style={styles.statCard}>
          <Statistic
            title="Avance Promedio"
            value={estadisticas.promedioAvance}
            suffix="%"
            prefix="📈"
            valueStyle={{ color: PALETTE.success, fontWeight: 700 }}
          />
        </Card>
      </div>

      {/* ═══════════════ GRÁFICOS ═══════════════ */}
      <div style={styles.chartsGrid}>
        <Card style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Distribución por Estado Emocional</h3>
          {datosEstadosEmocionales.length === 0 ? (
            <p style={styles.emptyText}>No hay datos para mostrar</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                  <Pie
                    data={datosEstadosEmocionales}
                    dataKey="cantidad"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }: any) => `${name}: ${value}`}
                  >
                  {datosEstadosEmocionales.map((entry) => (
                    <Cell key={entry.estado} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Registros por Mes</h3>
          {datosAvancesGrafico.length === 0 ? (
            <p style={styles.emptyText}>No hay datos para mostrar</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosAvancesGrafico}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={PALETTE.border} />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: PALETTE.textMuted }} />
                <YAxis tick={{ fontSize: 12, fill: PALETTE.textMuted }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${PALETTE.border}` }} />
                <Bar dataKey="cantidad" name="Registros" fill={PALETTE.primary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ═══════════════ TABLA DE REGISTROS ═══════════════ */}
      <Card style={styles.tableCard}>
        <h3 style={styles.chartTitle}>Registros de Progreso</h3>
        {progresosFiltrados.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 30 }}>📋</span>
            <p style={styles.emptyText}>No hay registros de progreso para mostrar</p>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={progresosFiltrados}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>

      <Modal
        title={progresoEditar ? 'Editar Registro de Progreso' : 'Nuevo Registro de Progreso'}
        open={isModalOpen}
        onCancel={() => !formLoading && setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item
            name="pacienteUsuarioId"
            label="Paciente"
            rules={[{ required: true, message: 'Selecciona un paciente' }]}
          >
            <Select
              placeholder="Buscar por nombre..."
              optionFilterProp="children"
              showSearch
              disabled={!!progresoEditar}
              onChange={handlePacienteChangeEnForm}
            >
              {pacientes.map((p) => (
                <Option key={p.id} value={p.usuario?.id}>
                  {p.usuario?.nombre} {p.usuario?.apellido}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="historialId"
            label="Sesión clínica asociada"
            rules={[{ required: true, message: 'Selecciona la sesión de historial clínico' }]}
            extra={
              historialesPaciente.length === 0 && !loadingHistoriales
                ? 'Este paciente no tiene sesiones de historial clínico registradas todavía.'
                : undefined
            }
          >
            <Select loading={loadingHistoriales} placeholder="Selecciona una sesión">
              {historialesPaciente.map((h) => (
                <Option key={h.id} value={h.id}>
                  {dayjs(h.fechaSesion).format('DD/MM/YYYY')} — {h.diagnostico}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="fecha"
            label="Fecha del registro"
            rules={[{ required: true, message: 'Selecciona la fecha' }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="estadoEmocional"
            label="Estado emocional"
            rules={[{ required: true, message: 'Selecciona el estado emocional' }]}
          >
            <Select placeholder="Selecciona un estado">
              {ESTADOS_EMOCIONALES.map((estado) => (
                <Option key={estado} value={estado}>
                  {estado}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="avance"
            label="Avance (%)"
            rules={[{ required: true, message: 'Ingresa el porcentaje de avance' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="observaciones" label="Observaciones">
            <TextArea rows={3} placeholder="Notas adicionales (opcional)" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }} disabled={formLoading}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" loading={formLoading}>
              Guardar
            </Button>
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
  filtersCard: {
    marginBottom: 24,
    borderRadius: 20,
    border: `1px solid ${PALETTE.border}`,
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
  },
  filtersRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  filterItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
    minWidth: 200,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: PALETTE.primary,
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 24,
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
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: 24,
    marginBottom: 24,
  },
  chartCard: {
    borderRadius: 20,
    border: `1px solid ${PALETTE.border}`,
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
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
};

export default Progreso;