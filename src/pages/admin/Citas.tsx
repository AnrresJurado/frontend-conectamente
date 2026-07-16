import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Select, Input, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { citasService, Cita } from '../../services/citasService';
import { pacientesService } from '../../services/pacientesService';
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

      // Traer bloques de agenda del psicólogo que estén libres
      // 🚀 CORREGIDO:
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
    // 🚀 Evitamos disparar peticiones antes de que la sesión del usuario cargue de verdad
    if (user) {
      cargarCitasYDatos();
    }
  }, [user]);

  const handleAgendarCita = async (values: { pacienteId: string; agendaId: string; motivo: string }) => {
    setFormLoading(true);
    try {
      // 1. Guardamos la cita en el backend
      const nuevaCita = await citasService.create(values.agendaId, values.motivo, values.pacienteId);
      message.success('Cita médica agendada de manera exitosa.');
      
      // 2. Cerramos el modal de inmediato para dar sensación de velocidad
      setIsModalOpen(false);
      form.resetFields();

      // 3. Actualizamos el estado local de citas metiendo la nueva cita al principio de la lista
      setCitas(prev => [nuevaCita, ...prev]);

      // 4. Volvemos a consultar al servidor con un mini delay para asegurar consistencia en las agendas
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
                onClick={() => handleCompletarCita(record.id)}
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
          {/* 1. Selector de Pacientes */}
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

          {/* 2. Selector de Horarios */}
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

          {/* 3. Motivo */}
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
    </Card>
  );
};

export default Citas;