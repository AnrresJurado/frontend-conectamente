import React, { useEffect, useState } from 'react';
import { Table, Popconfirm, message, Input, Modal, Form, Empty, Spin } from 'antd';
import {
  EditOutlined, DeleteOutlined, SearchOutlined,
  FolderOpenOutlined, SaveOutlined, MailOutlined,
} from '@ant-design/icons';
import { pacientesService } from '../../services/pacientesService';
import { historialService, HistorialClinico } from '../../services/historialService';
import { useAuth } from '../../hooks/useAuth';
import { Paciente } from '../../types';

// Misma identidad visual que Login / Register / Home / Dashboard / DashboardLayout
const PALETTE = {
  primary: '#1d5863',
  primaryDark: '#12414a',
  accent: '#4da6b0',
  bg: '#eef7f7',
  card: '#ffffff',
  border: '#e2e8f0',
  textMuted: '#64748b',
  danger: '#c0564e',
};

const obtenerIniciales = (nombre?: string, apellido?: string) => {
  const n = nombre?.charAt(0) ?? '';
  const a = apellido?.charAt(0) ?? '';
  return (n + a).toUpperCase() || 'PA';
};

const Pacientes: React.FC = () => {
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');

  // Estados para el Modal de edición de pacientes
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);

  // Estados para el Modal de Historial / Avances Clínicos
  const [isHistorialModalOpen, setIsHistorialModalOpen] = useState<boolean>(false);
  const [historiales, setHistoriales] = useState<HistorialClinico[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState<boolean>(false);
  const [nuevaNota, setNuevaNota] = useState<string>('');
  const [nuevoDiagnostico, setNuevoDiagnostico] = useState<string>('');

  const puedeGestionar = user?.rol === 'ADMIN' || user?.rol === 'PSICOLOGO';

  const cargarPacientes = async () => {
    setLoading(true);
    try {
      const data = await pacientesService.getAll();
      setPacientes(data);
    } catch (error) {
      console.error(error);
      message.error('Error al cargar el listado de pacientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  // Abrir gestión de historial clínico
  const abrirHistorial = async (paciente: Paciente) => {
    if (!paciente.usuario?.id) {
      message.error('El paciente no tiene un usuario válido asignado.');
      return;
    }
    setPacienteSeleccionado(paciente);
    setIsHistorialModalOpen(true);
    setLoadingHistorial(true);
    try {
      const data = await historialService.getByPacienteUsuarioId(paciente.usuario.id);
      setHistoriales(data);
    } catch (error) {
      console.error(error);
      message.error('Error al cargar el historial clínico de avances.');
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Guardar una nueva sesión de avance (Historial)
  const guardarAvanceClinico = async () => {
    if (!pacienteSeleccionado || !pacienteSeleccionado.usuario?.id) return;
    if (!nuevaNota.trim()) {
      message.warning('Por favor escribe las notas de evolución de la sesión.');
      return;
    }

    setLoadingHistorial(true);
    try {
      await historialService.create(pacienteSeleccionado.usuario.id, {
        diagnostico: nuevoDiagnostico || 'Sin cambios en el diagnóstico',
        observaciones: nuevaNota,
      });
      message.success('Sesión de avance guardada exitosamente.');
      setNuevaNota('');
      setNuevoDiagnostico('');

      const data = await historialService.getByPacienteUsuarioId(pacienteSeleccionado.usuario.id);
      setHistoriales(data);
    } catch (error) {
      console.error(error);
      message.error('No se pudo registrar el avance clínico.');
    } finally {
      setLoadingHistorial(false);
    }
  };

  const abrirEditar = (paciente: Paciente) => {
    setPacienteSeleccionado(paciente);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setFormLoading(true);
    try {
      if (pacienteSeleccionado) {
        await pacientesService.update(pacienteSeleccionado.id, data);
        message.success('Paciente actualizado de manera exitosa.');
      }
      setIsModalOpen(false);
      setPacienteSeleccionado(null);
      cargarPacientes();
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 409) {
        message.error('El correo electrónico ya se encuentra registrado.');
      } else {
        message.error('Error al procesar la solicitud en el servidor.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      await pacientesService.remove(id);
      message.success('Registro de paciente eliminado exitosamente.');
      cargarPacientes();
    } catch (error) {
      console.error(error);
      message.error('No se pudo eliminar el paciente.');
    }
  };

  const obtenerValoresIniciales = () => {
    if (!pacienteSeleccionado) return undefined;
    return {
      nombre: pacienteSeleccionado.usuario?.nombre || '',
      apellido: pacienteSeleccionado.usuario?.apellido || '',
      email: pacienteSeleccionado.usuario?.email || '',
      fechaNacimiento: pacienteSeleccionado.fechaNacimiento,
      genero: pacienteSeleccionado.genero,
      ocupacion: pacienteSeleccionado.ocupacion,
      telefonoEmergencia: pacienteSeleccionado.telefonoEmergencia,
      contactoEmergenciaNombre: pacienteSeleccionado.contactoEmergenciaNombre,
      tipoSangre: pacienteSeleccionado.tipoSangre,
      antecedentesMedicos: pacienteSeleccionado.antecedentesMedicos,
      motivoConsultaInicial: pacienteSeleccionado.motivoConsultaInicial,
    };
  };

  const columns = [
    {
      title: 'Paciente',
      key: 'paciente',
      render: (_: any, record: Paciente) => (
        <div style={styles.pacienteCell}>
          <div style={styles.avatar}>
            {obtenerIniciales(record.usuario?.nombre, record.usuario?.apellido)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={styles.pacienteNombre}>
              {record.usuario?.nombre} {record.usuario?.apellido}
            </div>
            <div style={styles.pacienteEmail}>
              <MailOutlined style={{ fontSize: 11, marginRight: 5 }} />
              {record.usuario?.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Motivo de Consulta',
      dataIndex: 'motivoConsultaInicial',
      key: 'motivoConsultaInicial',
      ellipsis: true,
      render: (texto: string) => <span style={styles.motivoTexto}>{texto || '—'}</span>,
    },
    {
      title: '',
      key: 'acciones',
      width: puedeGestionar ? 190 : 140,
      render: (_: any, record: Paciente) => (
        <div style={styles.accionesCell}>
          <button style={styles.pillPrimary} onClick={() => abrirHistorial(record)}>
            <FolderOpenOutlined />
            Historial
          </button>

          {puedeGestionar && (
            <>
              <button style={styles.iconBtn} onClick={() => abrirEditar(record)} title="Editar">
                <EditOutlined />
              </button>
              <Popconfirm
                title="¿Eliminar este paciente?"
                onConfirm={() => handleEliminar(record.id)}
                okText="Sí"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <button style={{ ...styles.iconBtn, color: PALETTE.danger }} title="Eliminar">
                  <DeleteOutlined />
                </button>
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];

  const datosFiltrados = pacientes.filter((p) => {
    const term = searchText.toLowerCase();
    const nombreCompleto = `${p.usuario?.nombre || ''} ${p.usuario?.apellido || ''}`.toLowerCase();
    const email = (p.usuario?.email || '').toLowerCase();
    return nombreCompleto.includes(term) || email.includes(term);
  });

  return (
    <div style={styles.page}>
      {/* Estilos con alcance local para el look propio de la tabla y modales */}
      <style>{`
        .cm-pacientes .ant-table { background: transparent; }
        .cm-pacientes .ant-table-thead > tr > th {
          background: #f2f9f9;
          color: ${PALETTE.primary};
          font-weight: 700;
          font-size: 12.5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: none;
        }
        .cm-pacientes .ant-table-thead > tr > th::before { display: none; }
        .cm-pacientes .ant-table-tbody > tr > td {
          border-bottom: 1px solid #eef2f2;
          padding-top: 14px;
          padding-bottom: 14px;
        }
        .cm-pacientes .ant-table-tbody > tr:hover > td { background: #f7fcfc; }
        .cm-pacientes .ant-table-tbody > tr:last-child > td { border-bottom: none; }
        .cm-pacientes .ant-pagination-item-active { border-color: ${PALETTE.primary}; }
        .cm-pacientes .ant-pagination-item-active a { color: ${PALETTE.primary}; }
        .cm-historial-modal .ant-modal-content { border-radius: 20px; overflow: hidden; }
        .cm-form-modal .ant-modal-content { border-radius: 20px; overflow: hidden; }
      `}</style>

      {/* ═══════════════ ENCABEZADO ═══════════════ */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestión de Pacientes Clínicos</h1>
          <p style={styles.subtitle}>
            {pacientes.length} paciente{pacientes.length === 1 ? '' : 's'} registrado{pacientes.length === 1 ? '' : 's'} en la plataforma
          </p>
        </div>

      </div>

      {/* ═══════════════ BUSCADOR ═══════════════ */}
      <div style={{ marginBottom: 20 }}>
        <Input
          placeholder="Buscar por nombre o correo..."
          prefix={<SearchOutlined style={{ color: PALETTE.accent }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={styles.searchInput}
        />
      </div>

      {/* ═══════════════ TABLA ═══════════════ */}
      <div style={styles.panel} className="cm-pacientes">
        <Table
          columns={columns as any}
          dataSource={datosFiltrados}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description="No se encontraron pacientes." /> }}
        />
      </div>

      {/* MODAL EDICIÓN DE PACIENTE */}
      <Modal
        title={
          <span style={styles.modalTitle}>
            Modificar Registro de Paciente
          </span>
        }
        open={isModalOpen}
        onCancel={() => !formLoading && setIsModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
        className="cm-form-modal"
      >
        <div style={{ marginTop: 20 }}>
          <Form
            layout="vertical"
            onFinish={handleFormSubmit}
            initialValues={obtenerValoresIniciales()}
          >
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[{ required: true, message: 'El nombre es obligatorio' }]}
            >
              <Input placeholder="Nombre del paciente" />
            </Form.Item>
            <Form.Item
              name="apellido"
              label="Apellido"
              rules={[{ required: true, message: 'El apellido es obligatorio' }]}
            >
              <Input placeholder="Apellido del paciente" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Correo electrónico"
              rules={[
                { required: true, message: 'El correo es obligatorio' },
                { type: 'email', message: 'Correo inválido' }
              ]}
            >
              <Input placeholder="correo@ejemplo.com" />
            </Form.Item>
            <Form.Item
              name="fechaNacimiento"
              label="Fecha de nacimiento"
              rules={[{ required: true, message: 'La fecha es obligatoria' }]}
            >
              <Input type="date" />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <button
                type="button"
                style={styles.btnSecundario}
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ ...styles.btnPrimary, opacity: formLoading ? 0.7 : 1 }}
                disabled={formLoading}
              >
                {formLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* MODAL DE HISTORIAL DE SESIONES / AVANCES */}
      <Modal
        title={
          <span style={styles.modalTitle}>
            Historial Clínico: {pacienteSeleccionado?.usuario?.nombre || ''} {pacienteSeleccionado?.usuario?.apellido || ''}
          </span>
        }
        open={isHistorialModalOpen}
        onCancel={() => setIsHistorialModalOpen(false)}
        footer={null}
        width={800}
        destroyOnClose
        className="cm-historial-modal"
      >
        <div style={{ marginTop: 16 }}>
          <h4 style={styles.sectionLabel}>Nueva sesión de evolución</h4>

          <Form layout="vertical">
            <Form.Item label="Diagnóstico clínico / foco de trabajo" style={{ marginBottom: 14 }}>
              <Input
                placeholder="Ej. Trastorno de ansiedad generalizada..."
                value={nuevoDiagnostico}
                onChange={(e) => setNuevoDiagnostico(e.target.value)}
                style={styles.formInput}
              />
            </Form.Item>
            <Form.Item label="Notas de evolución y observaciones clínicas" style={{ marginBottom: 16 }}>
              <Input.TextArea
                rows={3}
                placeholder="Registra el progreso del paciente, conducta observada, etc..."
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
                style={styles.formInput}
              />
            </Form.Item>

            <button
              style={{ ...styles.btnPrimary, marginBottom: 28, opacity: loadingHistorial ? 0.7 : 1 }}
              onClick={guardarAvanceClinico}
              disabled={loadingHistorial}
            >
              <SaveOutlined />
              Registrar Avance de Sesión
            </button>
          </Form>

          <div style={styles.divider} />

          <h4 style={styles.sectionLabel}>Historial de sesiones registradas</h4>

          {loadingHistorial ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <Spin />
            </div>
          ) : historiales.length === 0 ? (
            <Empty description="No hay sesiones clínicas registradas aún para este paciente." />
          ) : (
            <div style={styles.timeline}>
              {historiales.map((item) => (
                <div key={item.id} style={styles.timelineItem}>
                  <div style={styles.timelineHeaderRow}>
                    <span style={styles.diagnosticoChip}>{item.diagnostico}</span>
                    <span style={styles.fechaSesion}>
                      {new Date(item.fechaSesion).toLocaleDateString('es-EC', { dateStyle: 'medium' } as any)}
                    </span>
                  </div>
                  <p style={styles.observaciones}>{item.observaciones}</p>
                </div>
              ))}
            </div>
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
    marginRight: 8,
  },
  searchInput: {
    maxWidth: 340,
    height: 44,
    borderRadius: 22,
    border: `1px solid ${PALETTE.border}`,
    background: PALETTE.card,
  },
  panel: {
    background: PALETTE.card,
    borderRadius: 20,
    padding: '8px 20px',
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
    border: `1px solid ${PALETTE.border}`,
  },
  pacienteCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.accent})`,
    color: '#ffffff',
    fontWeight: 700,
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pacienteNombre: {
    fontWeight: 600,
    color: '#1e293b',
    fontSize: 14.5,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pacienteEmail: {
    fontSize: 12.5,
    color: PALETTE.textMuted,
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  motivoTexto: {
    color: '#475569',
    fontSize: 13.5,
  },
  accionesCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
  },
  pillPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    border: `1.5px solid ${PALETTE.primary}`,
    background: 'transparent',
    color: PALETTE.primary,
    borderRadius: 18,
    padding: '6px 14px',
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: 'none',
    background: '#f1f5f9',
    color: PALETTE.primary,
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
  sectionLabel: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primary,
    fontWeight: 700,
    fontSize: 15,
    margin: '0 0 14px',
  },
  formInput: {
    borderRadius: 10,
    border: `1px solid ${PALETTE.border}`,
  },
  divider: {
    height: 1,
    background: PALETTE.border,
    margin: '4px 0 20px',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxHeight: 320,
    overflowY: 'auto',
  },
  timelineItem: {
    background: PALETTE.bg,
    borderLeft: `3px solid ${PALETTE.accent}`,
    borderRadius: 12,
    padding: '12px 16px',
  },
  timelineHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 8,
  },
  diagnosticoChip: {
    fontWeight: 700,
    color: PALETTE.primary,
    fontSize: 13.5,
  },
  fechaSesion: {
    color: PALETTE.textMuted,
    fontSize: 12,
  },
  observaciones: {
    color: '#475569',
    fontSize: 13.5,
    margin: 0,
    lineHeight: 1.5,
  },
};

export default Pacientes;