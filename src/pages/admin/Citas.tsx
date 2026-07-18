import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Select, Input, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, CloseCircleOutlined, CheckCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { citasService, Cita } from '../../services/citasService';
import { pacientesService } from '../../services/pacientesService';
import { historialService } from '../../services/historialService'; // 🚀 Importado para registrar el avance
import api from '../../api/axiosConfig'; 
import { useAuth } from '../../hooks/useAuth';
import { Paciente } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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

  // 🚀 Al pulsar Completar, abrimos el modal clínico en vez de mandar una cadena por defecto
  const abrirModalCompletar = (cita: Cita) => {
    setCitaSeleccionada(cita);
    setNuevoDiagnostico('');
    setNuevaNota('');
    setIsClinicoModalOpen(true);
  };

  // 🚀 Guardar el registro clínico e impactar la cita al mismo tiempo
  const handleGuardarCitaClinica = async () => {
    if (!citaSeleccionada) return;
    if (!nuevaNota.trim()) {
      message.warning('Por favor escribe las notas de evolución de la sesión.');
      return;
    }

    setFormLoading(true);
    try {
      // 1. Mandamos el historial clínico con el ID del paciente asociado
      if (citaSeleccionada.paciente?.id) {
        await historialService.create(citaSeleccionada.paciente.id, {
          diagnostico: nuevoDiagnostico || 'Consulta Completada',
          observaciones: nuevaNota,
        });
      }

      // 2. Actualizamos el estado de la cita pasándole las notas ingresadas en tiempo real
      await citasService.update(citaSeleccionada.id, 'REALIZADA', nuevaNota);
      
      message.success('Cita completada y registro clínico de avance guardado.');
      setIsClinicoModalOpen(false);
      setCitaSeleccionada(null);
      cargarCitasYDatos();
    } catch (error) {
      console.error(error);
      message.error('No se pudo procesar la evolución de la cita.');
    } finally {
      setFormLoading(false);
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
      render: (text: string) => (
        <span>{new Date(text).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })}</span>
      ),
    },
    {
      title: 'Paciente',
      key: 'paciente',
      render: (_: any, record: Cita) => (
        <Text strong>{record.paciente?.nombre} {record.paciente?.apellido}</Text>
      ),
    },
    {
      title: 'Motivo de Consulta',
      dataIndex: 'motivoConsulta',
      key: 'motivoConsulta',
      ellipsis: true,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => {
        let color = 'blue';
        if (estado === 'REALIZADA') color = 'green';
        if (estado === 'CANCELADA') color = 'red';
        return <Tag color={color}>{estado}</Tag>;
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Cita) => (
        <Space size="middle">
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
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Agenda y Citas Médicas</Title>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setIsModalOpen(true)}
        >
          Agendar Nueva Cita
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={citas} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      {/* MODAL PARA AGENDAR CITA */}
      <Modal
        title="Agendar Cita Médica de Paciente"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAgendarCita} style={{ marginTop: 20 }}>
          <Form.Item 
            name="pacienteId" 
            label="Seleccionar Paciente" 
            rules={[{ required: true, message: 'Por favor selecciona el paciente' }]}
          >
            <Select showSearch placeholder="Buscar por nombre..." optionFilterProp="children">
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
            <TextArea rows={3} placeholder="Ej. Sesión de seguimiento para control de crisis de pánico." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="primary" htmlType="submit" loading={formLoading}>
                Confirmar Reserva
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 🚀 NUEVO MODAL: FORMULARIO CLÍNICO AL COMPLETAR CITA */}
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
    </Card>
  );
};

export default Citas;