import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Card, Input, Typography, Modal, Form, List, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FolderOpenOutlined, SaveOutlined } from '@ant-design/icons';
import { pacientesService } from '../../services/pacientesService';
import { historialService, HistorialClinico } from '../../services/historialService';
import { useAuth } from '../../hooks/useAuth';
import { Paciente, PacienteFormData } from '../../types';
import FormPaciente from '../../components/FormPaciente';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const Pacientes: React.FC = () => {
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  
  // Estados para el Modal de creación/edición de pacientes
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
      // 🚀 Llamamos usando el ID de usuario del paciente
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
      // 🚀 Mandamos el id de usuario del paciente, y mapeamos observaciones y diagnóstico
      await historialService.create(pacienteSeleccionado.usuario.id, {
        diagnostico: nuevoDiagnostico || 'Sin cambios en el diagnóstico',
        observaciones: nuevaNota,
      });
      message.success('Sesión de avance guardada exitosamente.');
      setNuevaNota('');
      setNuevoDiagnostico('');
      
      // Recargar la lista de avances
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

  const abrirCrear = () => {
    setPacienteSeleccionado(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: PacienteFormData) => {
    setFormLoading(true);
    try {
      if (pacienteSeleccionado) {
        await pacientesService.update(pacienteSeleccionado.id, data);
        message.success('Paciente actualizado de manera exitosa.');
      } else {
        await pacientesService.create(data);
        message.success('Paciente registrado de manera exitosa.');
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

  const obtenerValoresIniciales = (): Partial<PacienteFormData> | undefined => {
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
        <span>{record.usuario?.nombre} {record.usuario?.apellido}</span>
      ),
    },
    {
      title: 'Correo Electrónico',
      key: 'email',
      render: (_: any, record: Paciente) => <span>{record.usuario?.email}</span>,
    },
    {
      title: 'Motivo de Consulta',
      dataIndex: 'motivoConsultaInicial',
      key: 'motivoConsultaInicial',
      ellipsis: true,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Paciente) => (
        <Space size="middle">
          {/* 🚀 Botón para gestionar el Historial Clínico y Avances */}
          <Button 
            type="primary"
            ghost
            icon={<FolderOpenOutlined />} 
            onClick={() => abrirHistorial(record)}
          >
            Avances/Historial
          </Button>

          {puedeGestionar && (
            <>
              <Button 
                type="text" 
                icon={<EditOutlined style={{ color: '#1890ff' }} />} 
                onClick={() => abrirEditar(record)}
              />
              <Popconfirm
                title="¿Estás seguro de eliminar este paciente?"
                onConfirm={() => handleEliminar(record.id)}
                okText="Sí"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
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
    <Card bordered={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Gestión de Pacientes Clínicos</Title>
        {puedeGestionar && (
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={abrirCrear}>
            Nuevo Paciente
          </Button>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Buscar por nombre o correo..."
          prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
      </div>

      <Table columns={columns} dataSource={datosFiltrados} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />

      {/* MODAL GESTIÓN DE PACIENTES */}
      <Modal
        title={pacienteSeleccionado ? "Modificar Registro de Paciente" : "Registrar Nuevo Paciente Médico"}
        open={isModalOpen}
        onCancel={() => !formLoading && setIsModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <div style={{ marginTop: 20 }}>
          <FormPaciente onSubmit={handleFormSubmit} loading={formLoading} initialValues={obtenerValoresIniciales()} />
        </div>
      </Modal>

      {/* 🚀 MODAL DE HISTORIAL DE SESIONES / AVANCES (Corregido a fechaSesion) */}
      <Modal
        title={`Historial Clínico y Avances: ${pacienteSeleccionado?.usuario?.nombre || ''} ${pacienteSeleccionado?.usuario?.apellido || ''}`}
        open={isHistorialModalOpen}
        onCancel={() => setIsHistorialModalOpen(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <div style={{ marginTop: 16 }}>
          <Title level={5}>Nueva Sesión de Evolución / Avance</Title>
          <Form layout="vertical">
            <Form.Item label="Diagnóstico Clínico / Foco de Trabajo">
              <Input 
                placeholder="Ej. Trastorno de ansiedad generalizada..." 
                value={nuevoDiagnostico} 
                onChange={(e) => setNuevoDiagnostico(e.target.value)} 
              />
            </Form.Item>
            <Form.Item label="Notas de Evolución y Observaciones Clínicas">
              <TextArea 
                rows={3} 
                placeholder="Registra el progreso del paciente, conducta observada, etc..." 
                value={nuevaNota} 
                onChange={(e) => setNuevaNota(e.target.value)} 
              />
            </Form.Item>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={guardarAvanceClinico} 
              loading={loadingHistorial}
              style={{ marginBottom: 24 }}
            >
              Registrar Avance de Sesión
            </Button>
          </Form>

          <Divider style={{ margin: '12px 0' }} />
          
          <Title level={5}>Historial de Sesiones Registradas</Title>
          <List
            loading={loadingHistorial}
            itemLayout="horizontal"
            dataSource={historiales}
            locale={{ emptyText: 'No hay sesiones clínicas registradas aún para este paciente.' }}
            renderItem={(item) => (
              <List.Item style={{ padding: '8px 0' }}>
                <Card size="small" style={{ width: '100%', backgroundColor: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text strong style={{ color: '#1890ff' }}>Diagnóstico: {item.diagnostico}</Text>
                    {/* 🚀 Cambiado a fechaSesion para que coincida con el backend */}
                    <Text type="secondary">{new Date(item.fechaSesion).toLocaleDateString()}</Text>
                  </div>
                  <Paragraph style={{ margin: 0 }}>
                    <Text strong>Notas de Evolución: </Text>
                    {item.observaciones}
                  </Paragraph>
                </Card>
              </List.Item>
            )}
          />
        </div>
      </Modal>
    </Card>
  );
};

export default Pacientes;