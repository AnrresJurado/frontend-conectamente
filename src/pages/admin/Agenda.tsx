import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, DatePicker, TimePicker, Select, Input, Popconfirm, message, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, ClockCircleOutlined, CalendarOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { agendasService, AgendaBlock, HorarioTrabajo, ExcepcionDisponibilidad } from '../../services/agendasService';
import dayjs from 'dayjs';

const { Option } = Select;

// Misma identidad visual que Login / Register / Home / Dashboard / Pacientes / Citas
const PALETTE = {
  primary: '#1d5863',
  primaryDark: '#12414a',
  accent: '#4da6b0',
  bg: '#eef7f7',
  card: '#ffffff',
  border: '#e2e8f0',
  textMuted: '#64748b',
};

const ESTADO_RESERVA: Record<string, { color: string; label: string }> = {
  RESERVADO: { color: '#c0564e', label: 'Reservado' },
  DISPONIBLE: { color: '#3f9d6f', label: 'Disponible' },
};

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

type TabKey = 'BLOQUES' | 'HORARIOS' | 'EXCEPCIONES';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'BLOQUES', label: 'Bloques Activos', icon: <CalendarOutlined /> },
  { key: 'HORARIOS', label: 'Horario Semanal Base', icon: <ClockCircleOutlined /> },
  { key: 'EXCEPCIONES', label: 'Bloqueos y Excepciones', icon: <ExclamationCircleOutlined /> },
];

const AgendaView: React.FC = () => {
  const [tabActivo, setTabActivo] = useState<TabKey>('BLOQUES');

  const [agendas, setAgendas] = useState<AgendaBlock[]>([]);
  const [horarios, setHorarios] = useState<HorarioTrabajo[]>([]);
  const [excepciones, setExcepciones] = useState<ExcepcionDisponibilidad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [modalType, setModalType] = useState<'BLOQUE' | 'HORARIO' | 'EXCEPCION' | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resAgendas, resHorarios, resExcepciones] = await Promise.all([
        agendasService.getAll(),
        agendasService.getHorariosTrabajo(),
        agendasService.getExcepciones()
      ]);
      setAgendas(resAgendas);
      setHorarios(resHorarios);
      setExcepciones(resExcepciones);
    } catch (error) {
      console.error(error);
      message.error('Error al cargar la planificación de la agenda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrearRegistro = async (values: any) => {
    setSubmitting(true);
    try {
      if (modalType === 'BLOQUE') {
        const fechaHora = values.fechaHora.toISOString();
        await agendasService.createBlock(fechaHora);
        message.success('Bloque de atención médica creado.');
      } else if (modalType === 'HORARIO') {
        await agendasService.createHorarioTrabajo({
          diaSemana: values.diaSemana,
          horaApertura: values.apertura.format('HH:mm:ss'),
          horaCierre: values.cierre.format('HH:mm:ss')
        });
        message.success('Horario de trabajo semanal guardado de forma exitosa.');
      } else if (modalType === 'EXCEPCION') {
        await agendasService.createExcepcion({
          fechaInicio: values.rango[0].toISOString(),
          fechaFin: values.rango[1].toISOString(),
          motivo: values.motivo
        });
        message.success('Excepción / Bloqueo de días registrado correctamente.');
      }
      setModalType(null);
      form.resetFields();
      cargarDatos();
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || 'Error al procesar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarBloque = async (id: string) => {
    try {
      await agendasService.deleteBlock(id);
      message.success('Bloque removido de la agenda.');
      cargarDatos();
    } catch (error) {
      message.error('No se pudo eliminar el bloque seleccionado.');
    }
  };

  const handleEliminarHorario = async (id: string) => {
    try {
      await agendasService.deleteHorarioTrabajo(id);
      message.success('Horario semanal eliminado.');
      cargarDatos();
    } catch (error) {
      message.error('No se pudo eliminar el horario semanal.');
    }
  };

  const handleEliminarExcepcion = async (id: string) => {
    try {
      await agendasService.deleteExcepcion(id);
      message.success('Excepción removida. Los horarios vuelven a estar disponibles.');
      cargarDatos();
    } catch (error) {
      message.error('No se pudo remover el bloqueo.');
    }
  };

  // ─────────────── Columnas ───────────────
  const columnasBloques = [
    {
      title: 'Fecha y Hora',
      dataIndex: 'fechaHoraInicio',
      render: (text: string) => {
        const fecha = new Date(text);
        return (
          <div style={styles.fechaBadge}>
            <span style={styles.fechaHora}>
              {fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span style={styles.fechaDia}>
              {fecha.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Estado',
      dataIndex: 'estaReservado',
      render: (reservado: boolean) => {
        const meta = reservado ? ESTADO_RESERVA.RESERVADO : ESTADO_RESERVA.DISPONIBLE;
        return (
          <span style={{ ...styles.estadoPill, color: meta.color, borderColor: meta.color }}>
            {meta.label}
          </span>
        );
      }
    },
    {
      title: '',
      key: 'accion',
      width: 70,
      render: (_: any, record: AgendaBlock) => !record.estaReservado && (
        <Popconfirm title="¿Eliminar este bloque libre?" onConfirm={() => handleEliminarBloque(record.id)}>
          <button style={styles.iconBtnDanger} title="Eliminar"><DeleteOutlined /></button>
        </Popconfirm>
      )
    }
  ];

  const columnasHorarios = [
    {
      title: 'Día de la Semana',
      dataIndex: 'diaSemana',
      render: (dia: number) => <span style={styles.diaChip}>{diasSemana[dia]}</span>,
    },
    {
      title: 'Apertura',
      dataIndex: 'horaApertura',
      render: (hora: string) => <span style={styles.horaTexto}>{hora}</span>,
    },
    {
      title: 'Cierre',
      dataIndex: 'horaCierre',
      render: (hora: string) => <span style={styles.horaTexto}>{hora}</span>,
    },
    {
      title: '',
      key: 'accion',
      width: 70,
      render: (_: any, record: HorarioTrabajo) => (
        <Popconfirm title="¿Eliminar este horario de trabajo?" onConfirm={() => handleEliminarHorario(record.id)}>
          <button style={styles.iconBtnDanger} title="Eliminar"><DeleteOutlined /></button>
        </Popconfirm>
      )
    }
  ];

  const columnasExcepciones = [
    {
      title: 'Desde',
      dataIndex: 'fechaInicio',
      render: (text: string) => <span style={styles.horaTexto}>{new Date(text).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })}</span>,
    },
    {
      title: 'Hasta',
      dataIndex: 'fechaFin',
      render: (text: string) => <span style={styles.horaTexto}>{new Date(text).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })}</span>,
    },
    {
      title: 'Motivo / Evento',
      dataIndex: 'motivo',
      render: (texto: string) => <span style={styles.motivoTexto}>{texto}</span>,
    },
    {
      title: '',
      key: 'accion',
      width: 70,
      render: (_: any, record: ExcepcionDisponibilidad) => (
        <Popconfirm title="¿Remover esta excepción?" onConfirm={() => handleEliminarExcepcion(record.id)}>
          <button style={styles.iconBtnDanger} title="Eliminar"><DeleteOutlined /></button>
        </Popconfirm>
      )
    }
  ];

  const contenidoTab = () => {
    if (tabActivo === 'BLOQUES') {
      return {
        columnas: columnasBloques,
        datos: agendas,
        botonLabel: 'Nuevo Bloque de Atención',
        onNuevo: () => setModalType('BLOQUE'),
        vacio: 'No hay bloques de atención creados todavía.',
      };
    }
    if (tabActivo === 'HORARIOS') {
      return {
        columnas: columnasHorarios,
        datos: horarios,
        botonLabel: 'Registrar Horario de Trabajo',
        onNuevo: () => setModalType('HORARIO'),
        vacio: 'Aún no defines tu horario semanal base.',
      };
    }
    return {
      columnas: columnasExcepciones,
      datos: excepciones,
      botonLabel: 'Registrar Excepción',
      onNuevo: () => setModalType('EXCEPCION'),
      vacio: 'No hay excepciones ni bloqueos registrados.',
    };
  };

  const { columnas, datos, botonLabel, onNuevo, vacio } = contenidoTab();

  return (
    <div style={styles.page}>
      <style>{`
        .cm-agenda .ant-table { background: transparent; }
        .cm-agenda .ant-table-thead > tr > th {
          background: #f2f9f9;
          color: ${PALETTE.primary};
          font-weight: 700;
          font-size: 12.5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: none;
        }
        .cm-agenda .ant-table-thead > tr > th::before { display: none; }
        .cm-agenda .ant-table-tbody > tr > td {
          border-bottom: 1px solid #eef2f2;
          padding-top: 14px;
          padding-bottom: 14px;
        }
        .cm-agenda .ant-table-tbody > tr:hover > td { background: #f7fcfc; }
        .cm-agenda .ant-table-tbody > tr:last-child > td { border-bottom: none; }
        .cm-agenda .ant-pagination-item-active { border-color: ${PALETTE.primary}; }
        .cm-agenda .ant-pagination-item-active a { color: ${PALETTE.primary}; }
        .cm-agenda-modal .ant-modal-content { border-radius: 20px; overflow: hidden; }
      `}</style>

      {/* ═══════════════ ENCABEZADO ═══════════════ */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Planificación Profesional de la Agenda</h1>
          <p style={styles.subtitle}>Define tus bloques de atención, tu horario base y tus excepciones.</p>
        </div>
      </div>

      {/* ═══════════════ TABS PROPIOS ═══════════════ */}
      <div style={styles.tabBar}>
        {TABS.map((t) => {
          const activo = tabActivo === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTabActivo(t.key)}
              style={{ ...styles.tabButton, ...(activo ? styles.tabButtonActivo : {}) }}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════ PANEL DE CONTENIDO ═══════════════ */}
      <div style={styles.panelHeaderRow}>
        <button style={styles.btnPrimary} onClick={onNuevo}>
          <PlusOutlined />
          {botonLabel}
        </button>
      </div>

      <div style={styles.panel} className="cm-agenda">
        <Table
          columns={columnas as any}
          dataSource={datos as any}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description={vacio} /> }}
        />
      </div>

      {/* ═══════════════ MODAL REUTILIZABLE ═══════════════ */}
      <Modal
        title={
          <span style={styles.modalTitle}>
            {modalType === 'BLOQUE' ? 'Crear Nuevo Bloque de Disponibilidad' :
              modalType === 'HORARIO' ? 'Establecer Horario Semanal de Trabajo' : 'Registrar Excepción / Bloqueo'}
          </span>
        }
        open={modalType !== null}
        onCancel={() => { setModalType(null); form.resetFields(); }}
        footer={null}
        destroyOnClose
        className="cm-agenda-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleCrearRegistro} style={{ marginTop: 20 }}>
          {modalType === 'BLOQUE' && (
            <Form.Item name="fechaHora" label="Fecha y Hora de la Consulta" rules={[{ required: true, message: 'Selecciona fecha y hora' }]}>
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          )}

          {modalType === 'HORARIO' && (
            <>
              <Form.Item name="diaSemana" label="Día de la Semana" rules={[{ required: true }]}>
                <Select placeholder="Seleccione el día">
                  {diasSemana.map((dia, idx) => <Option key={idx} value={idx}>{dia}</Option>)}
                </Select>
              </Form.Item>
              <div style={{ display: 'flex', gap: 16 }}>
                <Form.Item name="apertura" label="Hora de Apertura" style={{ flex: 1 }} rules={[{ required: true }]}>
                  <TimePicker format="HH:mm" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="cierre" label="Hora de Cierre" style={{ flex: 1 }} rules={[{ required: true }]}>
                  <TimePicker format="HH:mm" style={{ width: '100%' }} />
                </Form.Item>
              </div>
            </>
          )}

          {modalType === 'EXCEPCION' && (
            <>
              <Form.Item name="rango" label="Rango de Fechas / Horas Bloqueadas" rules={[{ required: true }]}>
                <DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="motivo" label="Motivo de la Excepción / Bloqueo" rules={[{ required: true }]}>
                <Input placeholder="Ej. Congreso médico internacional, vacaciones..." />
              </Form.Item>
            </>
          )}

          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" style={styles.btnSecundario} onClick={() => { setModalType(null); form.resetFields(); }}>
                Cancelar
              </button>
              <button type="submit" style={{ ...styles.btnPrimary, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
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
  tabBar: {
    display: 'flex',
    gap: 8,
    background: '#ffffff',
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 16,
    padding: 6,
    marginBottom: 20,
    width: 'fit-content',
    flexWrap: 'wrap',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: 'none',
    background: 'transparent',
    color: PALETTE.textMuted,
    borderRadius: 12,
    padding: '9px 18px',
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', system-ui, sans-serif",
    whiteSpace: 'nowrap',
  },
  tabButtonActivo: {
    background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.primaryDark})`,
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(29, 88, 99, 0.22)',
  },
  panelHeaderRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 16,
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
  panel: {
    background: PALETTE.card,
    borderRadius: 20,
    padding: '8px 20px',
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
    border: `1px solid ${PALETTE.border}`,
  },
  fechaBadge: {
    display: 'inline-flex',
    flexDirection: 'column',
    background: PALETTE.primary,
    color: '#ffffff',
    borderRadius: 10,
    padding: '6px 12px',
    lineHeight: 1.2,
  },
  fechaHora: { fontSize: 13.5, fontWeight: 700 },
  fechaDia: { fontSize: 10.5, opacity: 0.85, textTransform: 'capitalize' },
  estadoPill: {
    fontSize: 11.5,
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: 20,
    border: '1.5px solid',
    background: '#ffffff',
    whiteSpace: 'nowrap',
  },
  diaChip: {
    fontWeight: 700,
    color: PALETTE.primary,
    fontSize: 13.5,
  },
  horaTexto: {
    color: '#475569',
    fontSize: 13.5,
  },
  motivoTexto: {
    color: '#475569',
    fontSize: 13.5,
  },
  iconBtnDanger: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: 'none',
    background: '#fbeeec',
    color: '#c0564e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 14,
  },
  modalTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primary,
    fontWeight: 800,
    fontSize: 18,
  },
};

export default AgendaView;