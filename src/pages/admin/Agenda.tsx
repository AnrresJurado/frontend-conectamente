import React, { useEffect, useState } from 'react';
import { Card, Tabs, Table, Button, Space, Modal, Form, DatePicker, TimePicker, Select, Input, Popconfirm, message, Typography, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, ClockCircleOutlined, CalendarOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { agendasService, AgendaBlock, HorarioTrabajo, ExcepcionDisponibilidad } from '../../services/agendasService';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const AgendaView: React.FC = () => {
  const [agendas, setAgendas] = useState<AgendaBlock[]>([]);
  const [horarios, setHorarios] = useState<HorarioTrabajo[]>([]);
  const [excepciones, setExcepciones] = useState<ExcepcionDisponibilidad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modales
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

  // Definición de columnas
  const columnasBloques = [
    {
      title: 'Fecha y Hora',
      dataIndex: 'fechaHoraInicio',
      render: (text: string) => <span>{new Date(text).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })}</span>,
    },
    {
      title: 'Estado',
      dataIndex: 'estaReservado',
      render: (reservado: boolean) => (
        <Tag color={reservado ? 'red' : 'green'}>{reservado ? 'RESERVADO' : 'DISPONIBLE'}</Tag>
      )
    },
    {
      title: 'Acción',
      key: 'accion',
      render: (_: any, record: AgendaBlock) => !record.estaReservado && (
        <Popconfirm title="¿Eliminar este bloque libre?" onConfirm={() => handleEliminarBloque(record.id)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  const columnasHorarios = [
    {
      title: 'Día de la Semana',
      dataIndex: 'diaSemana',
      render: (dia: number) => <strong>{diasSemana[dia]}</strong>,
    },
    {
      title: 'Apertura',
      dataIndex: 'horaApertura',
    },
    {
      title: 'Cierre',
      dataIndex: 'horaCierre',
    },
    {
      title: 'Acción',
      key: 'accion',
      render: (_: any, record: HorarioTrabajo) => (
        <Popconfirm title="¿Eliminar este horario de trabajo?" onConfirm={() => handleEliminarHorario(record.id)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  const columnasExcepciones = [
    {
      title: 'Desde',
      dataIndex: 'fechaInicio',
      render: (text: string) => <span>{new Date(text).toLocaleString()}</span>,
    },
    {
      title: 'Hasta',
      dataIndex: 'fechaFin',
      render: (text: string) => <span>{new Date(text).toLocaleString()}</span>,
    },
    {
      title: 'Motivo / Evento',
      dataIndex: 'motivo',
    },
    {
      title: 'Acción',
      key: 'accion',
      render: (_: any, record: ExcepcionDisponibilidad) => (
        <Popconfirm title="¿Remover esta excepción?" onConfirm={() => handleEliminarExcepcion(record.id)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  return (
    <Card bordered={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Planificación Profesional de la Agenda</Title>
      </div>

      <Tabs defaultActiveKey="1" type="card">
        <TabPane tab={<span><CalendarOutlined />Bloques Activos</span>} key="1">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalType('BLOQUE')}>
              Nuevo Bloque de Atención
            </Button>
          </div>
          <Table columns={columnasBloques} dataSource={agendas} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />
        </TabPane>

        <TabPane tab={<span><ClockCircleOutlined />Horario Semanal Base</span>} key="2">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalType('HORARIO')}>
              Registrar Horario de Trabajo
            </Button>
          </div>
          <Table columns={columnasHorarios} dataSource={horarios} rowKey="id" loading={loading} />
        </TabPane>

        <TabPane tab={<span><ExclamationCircleOutlined />Bloqueos y Excepciones</span>} key="3">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalType('EXCEPCION')}>
              Registrar Excepción (Feriado/Permiso)
            </Button>
          </div>
          <Table columns={columnasExcepciones} dataSource={excepciones} rowKey="id" loading={loading} />
        </TabPane>
      </Tabs>

      {/* MODALES REUTILIZABLES */}
      <Modal
        title={
          modalType === 'BLOQUE' ? 'Crear Nuevo Bloque de Disponibilidad' :
          modalType === 'HORARIO' ? 'Establecer Horario Semanal de Trabajo' : 'Registrar Excepción / Bloqueo'
        }
        open={modalType !== null}
        onCancel={() => { setModalType(null); form.resetFields(); }}
        footer={null}
        destroyOnClose
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

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => { setModalType(null); form.resetFields(); }}>Cancelar</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Guardar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AgendaView;