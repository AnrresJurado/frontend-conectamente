import React, { useEffect, useState } from 'react';
import { Table, Popconfirm, message, Modal, Form, Select, Input, Empty } from 'antd';
import { PlusOutlined, CloseCircleOutlined, CheckCircleOutlined, MailOutlined } from '@ant-design/icons';
import { citasService, Cita } from '../../services/citasService';
import { pacientesService } from '../../services/pacientesService';
import api from '../../api/axiosConfig';
import { useAuth } from '../../hooks/useAuth';
import { Paciente } from '../../types';

const { Option } = Select;

// Misma identidad visual que Login / Register / Home / Dashboard / Pacientes
const PALETTE = {
  primary: '#1d5863',
  primaryDark: '#12414a',
  accent: '#4da6b0',
  bg: '#eef7f7',
  card: '#ffffff',
  border: '#e2e8f0',
  textMuted: '#64748b',
};

const ESTADO_META: Record<string, { color: string; label: string }> = {
  PENDIENTE: { color: '#e0a13a', label: 'Pendiente' },
  REALIZADA: { color: '#3f9d6f', label: 'Realizada' },
  CANCELADA: { color: '#c0564e', label: 'Cancelada' },
};

const obtenerIniciales = (nombre?: string, apellido?: string) => {
  const n = nombre?.charAt(0) ?? '';
  const a = apellido?.charAt(0) ?? '';
  return (n + a).toUpperCase() || 'PA';
};

const Citas: React.FC = () => {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [agendasDisponibles, setAgendasDisponibles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const cargarCitasYDatos = async () => {
    setLoading(true);
    try {
      const [dataCitas, dataPacientes] = await Promise.all([
        citasService.getAll(),
        pacientesService.getAll()
      ]);
      setCitas(dataCitas);
      setPacientes(dataPacientes);

      const { data: agendas } = await api.get<any[]>('/agendas');
      setAgendasDisponibles(agendas.filter(a => !a.estaReservado));
    } catch (error) {
      console.error(error);
      message.error('Error al cargar la información del módulo de citas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      cargarCitasYDatos();
    }
  }, [user]);

  const handleAgendarCita = async (values: { pacienteId: string; agendaId: string; motivo: string }) => {
    setFormLoading(true);
    try {
      const nuevaCita = await citasService.create(values.agendaId, values.motivo, values.pacienteId);
      message.success('Cita médica agendada de manera exitosa.');

      setIsModalOpen(false);
      form.resetFields();

      setCitas(prev => [nuevaCita, ...prev]);

      setTimeout(async () => {
        await cargarCitasYDatos();
      }, 500);

    } catch (error: any) {
      console.error(error);
      message.error('No se pudo agendar la cita. Verifica que el horario esté libre.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCompletarCita = async (id: string) => {
    try {
      await citasService.update(id, 'REALIZADA', 'Consulta completada satisfactoriamente.');
      message.success('Cita marcada como realizada con éxito.');
      cargarCitasYDatos();
    } catch (error) {
      message.error('No se pudo actualizar el estado de la cita.');
    }
  };

  const handleCancelarCita = async (id: string) => {
    try {
      await citasService.remove(id);
      message.success('Cita cancelada y horario liberado.');
      cargarCitasYDatos();
    } catch (error) {
      message.error('Error al intentar cancelar la cita.');
    }
  };

  const columns = [
    {
      title: 'Fecha y Hora',
      dataIndex: 'fechaHora',
      key: 'fechaHora',
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
      title: 'Paciente',
      key: 'paciente',
      render: (_: any, record: Cita) => (
        <div style={styles.pacienteCell}>
          <div style={styles.avatar}>
            {obtenerIniciales(record.paciente?.nombre, record.paciente?.apellido)}
          </div>
          <span style={styles.pacienteNombre}>
            {record.paciente?.nombre} {record.paciente?.apellido}
          </span>
        </div>
      ),
    },
    {
      title: 'Motivo de Consulta',
      dataIndex: 'motivoConsulta',
      key: 'motivoConsulta',
      ellipsis: true,
      render: (texto: string) => <span style={styles.motivoTexto}>{texto || '—'}</span>,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => {
        const meta = ESTADO_META[estado] || { color: PALETTE.accent, label: estado };
        return (
          <span style={{ ...styles.estadoPill, color: meta.color, borderColor: meta.color }}>
            {meta.label}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'acciones',
      width: 210,
      render: (_: any, record: Cita) => (
        <div style={styles.accionesCell}>
          {record.estado === 'PENDIENTE' && (
            <>
              <button style={styles.pillSuccess} onClick={() => handleCompletarCita(record.id)}>
                <CheckCircleOutlined />
                Completar
              </button>
              <Popconfirm
                title="¿Deseas cancelar esta cita?"
                description="Se liberará el espacio en la agenda."
                onConfirm={() => handleCancelarCita(record.id)}
                okText="Sí, cancelar"
                cancelText="Mantener"
                okButtonProps={{ danger: true }}
              >
                <button style={styles.pillDanger}>
                  <CloseCircleOutlined />
                  Cancelar
                </button>
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={styles.page}>
      {/* Estilos con alcance local, mismo criterio que Pacientes.tsx */}
      <style>{`
        .cm-citas .ant-table { background: transparent; }
        .cm-citas .ant-table-thead > tr > th {
          background: #f2f9f9;
          color: ${PALETTE.primary};
          font-weight: 700;
          font-size: 12.5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: none;
        }
        .cm-citas .ant-table-thead > tr > th::before { display: none; }
        .cm-citas .ant-table-tbody > tr > td {
          border-bottom: 1px solid #eef2f2;
          padding-top: 14px;
          padding-bottom: 14px;
        }
        .cm-citas .ant-table-tbody > tr:hover > td { background: #f7fcfc; }
        .cm-citas .ant-table-tbody > tr:last-child > td { border-bottom: none; }
        .cm-citas .ant-pagination-item-active { border-color: ${PALETTE.primary}; }
        .cm-citas .ant-pagination-item-active a { color: ${PALETTE.primary}; }
        .cm-citas-modal .ant-modal-content { border-radius: 20px; overflow: hidden; }
      `}</style>

      {/* ═══════════════ ENCABEZADO ═══════════════ */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Agenda y Citas Médicas</h1>
          <p style={styles.subtitle}>
            {citas.length} cita{citas.length === 1 ? '' : 's'} registrada{citas.length === 1 ? '' : 's'} en el sistema
          </p>
        </div>

        <button style={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
          <PlusOutlined />
          Agendar Nueva Cita
        </button>
      </div>

      {/* ═══════════════ TABLA ═══════════════ */}
      <div style={styles.panel} className="cm-citas">
        <Table
          columns={columns as any}
          dataSource={citas}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description="No hay citas registradas todavía." /> }}
        />
      </div>

      {/* MODAL PARA AGENDAR CITA */}
      <Modal
        title={<span style={styles.modalTitle}>Agendar Cita Médica de Paciente</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        className="cm-citas-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleAgendarCita} style={{ marginTop: 20 }}>
          <Form.Item
            name="pacienteId"
            label="Seleccionar Paciente"
            rules={[{ required: true, message: 'Por favor selecciona el paciente' }]}
          >
            <Select
              showSearch
              placeholder="Buscar por nombre..."
              optionFilterProp="children"
            >
              {pacientes.map(p => (
                <Option key={p.id} value={p.usuario?.id}>
                  {p.usuario?.nombre} {p.usuario?.apellido} ({p.usuario?.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="agendaId"
            label="Horario Disponible de Agenda"
            rules={[{ required: true, message: 'Por favor selecciona un horario libre' }]}
          >
            <Select placeholder="Selecciona un bloque de tiempo libre de tu agenda">
              {agendasDisponibles.map(a => (
                <Option key={a.id} value={a.id}>
                  {new Date(a.fechaHoraInicio).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="motivo"
            label="Motivo de la Cita"
            rules={[{ required: true, message: 'Por favor describe brevemente el motivo' }]}
          >
            <Input.TextArea rows={3} placeholder="Ej. Sesión de seguimiento para control de crisis de pánico." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" style={styles.btnSecundario} onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button
                type="submit"
                style={{ ...styles.btnPrimary, opacity: formLoading ? 0.7 : 1 }}
                disabled={formLoading}
              >
                {formLoading ? 'Guardando...' : 'Confirmar Reserva'}
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
  pacienteCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.accent})`,
    color: '#ffffff',
    fontWeight: 700,
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pacienteNombre: {
    fontWeight: 600,
    color: '#1e293b',
    fontSize: 14,
  },
  motivoTexto: {
    color: '#475569',
    fontSize: 13.5,
  },
  estadoPill: {
    fontSize: 11.5,
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: 20,
    border: '1.5px solid',
    background: '#ffffff',
    whiteSpace: 'nowrap',
  },
  accionesCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  pillSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    border: '1.5px solid #3f9d6f',
    background: 'transparent',
    color: '#3f9d6f',
    borderRadius: 18,
    padding: '6px 12px',
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
  },
  pillDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    border: '1.5px solid #c0564e',
    background: 'transparent',
    color: '#c0564e',
    borderRadius: 18,
    padding: '6px 12px',
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
  },
  modalTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primary,
    fontWeight: 800,
    fontSize: 18,
  },
};

export default Citas;