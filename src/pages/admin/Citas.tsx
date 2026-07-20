// 🎯 CORREGIDO: Agregado CheckCircleOutlined a la lista de importaciones
import { PlusOutlined, CloseCircleOutlined, CheckCircleOutlined, SaveOutlined, DollarCircleOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Typography, message } from 'antd';
import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../hooks/useAuth';
import { Cita, citasService } from '../../services/citasService';
import { historialService } from '../../services/historialService';
import { pacientesService } from '../../services/pacientesService';
import { Paciente } from '../../types';

const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;

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
  
  // Modales
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isClinicoModalOpen, setIsClinicoModalOpen] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  
  // Form de Citas y Estado de Cita Seleccionada
  const [form] = Form.useForm();
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

  // Campos para el Formulario Clínico Integrado
  const [nuevoDiagnostico, setNuevoDiagnostico] = useState<string>('');
  const [nuevaNota, setNuevaNota] = useState<string>(''); 

  const cargarCitasYDatos = async () => {
    setLoading(true);
    try {
      // 🎯 CORREGIDO: Ambos servicios usan getAll() para respetar estrictamente la privacidad del rol/token
      const [dataCitas, dataMisPacientes] = await Promise.all([
        citasService.getAll(),
        pacientesService.getAll() // 👈 Cambiado para restringir el modal a sus propios pacientes asignados
      ]);
      setCitas(dataCitas);
      setPacientes(dataMisPacientes);

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

  // 🚀 REFACTORIZADO FUSIONADO: Optimiza renderizado de main e incluye la recarga limpia de datos
  const handleAgendarCita = async (values: { pacienteId: string; agendaId: string; motivo: string }) => {
    setFormLoading(true);
    try {
      const nuevaCita = await citasService.create(values.agendaId, values.motivo, values.pacienteId);
      message.success('Cita médica agendada de manera exitosa.');
      
      setIsModalOpen(false);
      form.resetFields();

      // Mantenemos la actualización reactiva que querían en main para evitar saltos visuales
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

  const abrirModalCompletar = (cita: Cita) => {
    setCitaSeleccionada(cita);
    setNuevoDiagnostico('');
    setNuevaNota('');
    setIsClinicoModalOpen(true);
  };

  // 🚀 OPTIMIZADO: Coherencia cronológica e inyección de fecha real de la cita
  const handleGuardarCitaClinica = async () => {
    if (!citaSeleccionada) return;
    if (!nuevaNota.trim()) {
      message.warning('Por favor escribe las notas de evolución de la sesión.');
      return;
    }

    setFormLoading(true); // 🎯 Bloquea dobles clics de inmediato
    try {
      if (citaSeleccionada.paciente?.id) {
        await historialService.create(citaSeleccionada.paciente.id, {
          diagnostico: nuevoDiagnostico || 'Consulta Completada',
          observaciones: nuevaNota,
          fechaSesion: citaSeleccionada.fechaHora, // 🚀 ENVIAMOS LA FECHA REAL DE LA CITA AL HISTORIAL
        });
      }

      await citasService.update(citaSeleccionada.id, 'REALIZADA', nuevaNota);
      
      message.success('Cita completada y registro clínico de avance guardado.');
      setIsClinicoModalOpen(false);
      setCitaSeleccionada(null);
      cargarCitasYDatos();
    } catch (error) {
      console.error(error);
      message.error('No se pudo procesar la evolución de la cita.');
    } finally {
      setFormLoading(false); // Libera el estado de carga
    }
  };

  const handleRegistrarPago = async (pagoId: string) => {
    try {
      await citasService.updatePagoStatus(pagoId, 'PAGADO');
      message.success('Cobro de consulta registrado de manera exitosa.');
      cargarCitasYDatos();
    } catch (error) {
      console.error(error);
      message.error('No se pudo actualizar el estado de la transacción.');
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
      title: 'Estado Cita',
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
      title: 'Monto y Estado de Pago',
      key: 'pago',
      render: (_: any, record: Cita) => {
        if (!record.pago) return <Tag color="default">N/A</Tag>;
        const esPagado = record.pago.estado === 'PAGADO';
        return (
          <Space direction="vertical" size={2}>
            <Text strong>${Number(record.pago.monto).toFixed(2)}</Text>
            <Tag color={esPagado ? 'gold' : 'volcano'}>{record.pago.estado}</Tag>
          </Space>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 210,
      render: (_: any, record: Cita) => (
        <Space size="small">
          {record.estado === 'PENDIENTE' && (
            <>
              <Button 
                type="text" 
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />} 
                onClick={() => abrirModalCompletar(record)}
              >
                Completar
              </Button>
              <Popconfirm
                title="¿Deseas cancelar esta cita?"
                description="Se liberará el espacio en la agenda."
                onConfirm={() => handleCancelarCita(record.id)}
                okText="Sí, cancelar"
                cancelText="Mantener"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" danger icon={<CloseCircleOutlined />}>
                  Cancelar
                </Button>
              </Popconfirm>
            </>
          )}

          {record.pago && record.pago.estado === 'PENDIENTE' && record.estado !== 'CANCELADA' && (
            <Popconfirm
              title="¿Confirmar el cobro?"
              description={`Se registrará el abono de $${Number(record.pago.monto).toFixed(2)} como liquidado.`}
              onConfirm={() => handleRegistrarPago(record.pago!.id)}
              okText="Marcar Pagado"
              cancelText="Volver"
            >
              <Button 
                type="text" 
                icon={<DollarCircleOutlined style={{ color: '#fa8c16' }} />}
              >
                Cobrar
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={styles.page}>
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
          locale={{ emptyText: <Tag color="default">No hay citas registradas todavía.</Tag> }}
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
              onChange={(value: string) => {
                const pacienteEncontrado = pacientes.find(p => p.usuario?.id === value);
                if (pacienteEncontrado && pacienteEncontrado.motivoConsultaInicial) {
                  form.setFieldsValue({ motivo: pacienteEncontrado.motivoConsultaInicial });
                } else {
                  form.setFieldsValue({ motivo: '' });
                }
              }}
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

      {/* FORMULARIO CLÍNICO AL COMPLETAR CITA */}
      <Modal
        title={`Registrar Evolución Clínica: ${citaSeleccionada?.paciente?.nombre || ''} ${citaSeleccionada?.paciente?.apellido || ''}`}
        open={isClinicoModalOpen}
        onCancel={() => { setIsClinicoModalOpen(false); setCitaSeleccionada(null); }}
        footer={null}
        width={650}
        destroyOnClose
      >
        <div style={{ marginTop: 16 }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Al marcar esta sesión como realizada, se creará de forma automática el avance en el historial del paciente.
          </Text>
          <Form layout="vertical">
            <Form.Item label="Diagnóstico Clínico / Foco de Trabajo de la Sesión" required>
              <Input 
                placeholder="Ej. Trastorno de ansiedad generalizada, evolución favorable..." 
                value={nuevoDiagnostico} 
                onChange={(e) => setNuevoDiagnostico(e.target.value)} 
              />
            </Form.Item>
            <Form.Item label="Notas de Evolución y Observaciones Clínicas" required>
              <TextArea 
                rows={4} 
                placeholder="Registra detalladamente el progreso observado en esta sesión clínica..." 
                value={nuevaNota} 
                onChange={(e) => setNuevaNota(e.target.value)} 
              />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Space>
                <Button onClick={() => { setIsClinicoModalOpen(false); setCitaSeleccionada(null); }}>
                  Cancelar
                </Button>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={handleGuardarCitaClinica} 
                  loading={formLoading}
                >
                  Confirmar y Finalizar Cita
                </Button>
              </Space>
            </Form.Item>
          </Form>
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
  modalTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primary,
    fontWeight: 800,
    fontSize: 18,
  },
};

export default Citas;