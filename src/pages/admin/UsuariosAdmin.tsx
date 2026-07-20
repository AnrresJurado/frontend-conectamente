import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Select, Input, Popconfirm, message, Typography } from 'antd';
import { UserAddOutlined, UserDeleteOutlined, CheckCircleOutlined } from '@ant-design/icons'; // 🎯 Importado CheckCircleOutlined
import { adminService, UsuarioStaff } from '../../services/adminService';

const { Title } = Typography;
const { Option } = Select;

const UsuariosAdmin: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioStaff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [rolFiltro, setRolFiltro] = useState<string | undefined>(undefined);

  // Modales y formularios
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const cargarUsuarios = async (page = 1, rol = rolFiltro) => {
    setLoading(true);
    try {
      const data = await adminService.listarUsuarios(page, 8, rol);
      if (Array.isArray(data)) {
        setUsuarios(data);
        setTotal(data.length);
      } else {
        setUsuarios(data.data || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error(error);
      message.error('No tienes permisos de ADMIN o hubo un error al consultar el staff.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios(1);
  }, []);

  const handleCrearStaff = async (values: any) => {
    setFormLoading(true);
    try {
      await adminService.crearStaff(values);
      message.success('Miembro del personal interno registrado de manera exitosa.');
      setIsModalOpen(false);
      form.resetFields();
      cargarUsuarios(paginaActual);
    } catch (error) {
      console.error(error);
      message.error('Error al registrar al usuario. Verifica que el correo no esté duplicado.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDesactivarUsuario = async (id: string) => {
    try {
      await adminService.darDeBaja(id);
      message.success('Usuario dado de baja en el sistema correctamente.');
      cargarUsuarios(paginaActual);
    } catch (error) {
      message.error('No se pudo desactivar al usuario seleccionado.');
    }
  };

  // 🎯 NUEVO: Manejador para devolverle el acceso a la cuenta
  const handleReactivarUsuario = async (id: string) => {
    try {
      await adminService.reactivarUsuario(id);
      message.success('Usuario reactivado de forma exitosa en el sistema.');
      cargarUsuarios(paginaActual);
    } catch (error) {
      message.error('No se pudo reactivar al usuario seleccionado.');
    }
  };

  const filtrarPorRol = (value: string) => {
    const rol = value === 'TODOS' ? undefined : value;
    setRolFiltro(rol);
    setPaginaActual(1);
    cargarUsuarios(1, rol);
  };

  const columns = [
    {
      title: 'Nombre Completo',
      key: 'nombreCompleto',
      render: (_: any, record: UsuarioStaff) => (
        <span>{record.nombre} {record.apellido}</span>
      ),
    },
    {
      title: 'Correo Electrónico',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rol Asignado',
      dataIndex: 'rol',
      key: 'rol',
      render: (rol: string) => {
        let color = 'cyan';
        if (rol === 'ADMIN') color = 'magenta';
        if (rol === 'PSICOLOGO') color = 'blue';
        return <Tag color={color}>{rol}</Tag>;
      },
    },
    {
      title: 'Estado Cuenta',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo: boolean) => (
        <Tag color={activo ? 'green' : 'red'}>{activo ? 'ACTIVO' : 'INACTIVO'}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: UsuarioStaff) => (
        <Space size="middle">
          {record.activo ? (
            // Botón para suspender accesos (Activo)
            <Popconfirm
              title="¿Dar de baja a este usuario?"
              description="Perderá los accesos a la plataforma de inmediato."
              onConfirm={() => handleDesactivarUsuario(record.id)}
              okText="Sí, desactivar"
              cancelText="Volver"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<UserDeleteOutlined />}>
                Dar de Baja
              </Button>
            </Popconfirm>
          ) : (
            // 🎯 NUEVO: Botón para reactivar accesos (Inactivo)
            <Popconfirm
              title="¿Reactivar a este usuario?"
              description="Se le concederán nuevamente sus accesos y permisos."
              onConfirm={() => handleReactivarUsuario(record.id)}
              okText="Sí, reactivar"
              cancelText="Volver"
            >
              <Button type="text" icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}>
                Reactivar Usuario
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Control de Usuarios y Personal Interno</Title>
        </div>
        <Space>
          <Select defaultValue="TODOS" style={{ width: 180 }} onChange={filtrarPorRol}>
            <Option value="TODOS">Todos los Roles</Option>
            <Option value="ADMIN">Administradores</Option>
            <Option value="PSICOLOGO">Psicólogos</Option>
            <Option value="PACIENTE">Pacientes</Option>
          </Select>
          <Button type="primary" icon={<UserAddOutlined />} size="large" onClick={() => setIsModalOpen(true)}>
            Registrar Personal
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={usuarios}
        rowKey="id"
        loading={loading}
        pagination={{
          current: paginaActual,
          pageSize: 8,
          total: total,
          onChange: (page) => {
            setPaginaActual(page);
            cargarUsuarios(page);
          }
        }}
      />

      {/* MODAL REGISTRO DE PERSONAL */}
      <Modal
        title="Registrar Nuevo Personal Interno (Staff)"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCrearStaff} style={{ marginTop: 20 }}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Ingresa el nombre' }]}>
            <Input placeholder="Ej. Francisco" />
          </Form.Item>
          <Form.Item name="apellido" label="Apellido" rules={[{ required: true, message: 'Ingresa el apellido' }]}>
            <Input placeholder="Ej. Higuera" />
          </Form.Item>
          <Form.Item name="email" label="Correo Electrónico" rules={[{ required: true, type: 'email', message: 'Ingresa un correo válido' }]}>
            <Input placeholder="correo@conectamente.com" />
          </Form.Item>
          <Form.Item name="rol" label="Rol del Staff" rules={[{ required: true, message: 'Selecciona un rol administrativo' }]}>
            <Select placeholder="Selecciona el rol interno">
              <Option value="PSICOLOGO">Psicólogo Clínico</Option>
              <Option value="ADMIN">Administrador del Sistema</Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="primary" htmlType="submit" loading={formLoading}>
                Guardar Registro
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UsuariosAdmin;