import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Card, Input, Typography, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { psicologosService } from '../../services/psicologosService';
import { useAuth } from '../../hooks/useAuth';
import { Psicologo, PsicologoFormData } from '../../types';
import FormPsicologo from '../../components/FormPsicologo';

const { Title } = Typography;

const Psicologos: React.FC = () => {
  const { user } = useAuth();
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [psicologoSeleccionado, setPsicologoSeleccionado] = useState<Psicologo | null>(null);

  const cargarPsicologos = async () => {
    setLoading(true);
    try {
      const data = await psicologosService.getAll();
      setPsicologos(data);
    } catch (error) {
      console.error(error);
      message.error('Error al cargar el listado de psicólogos desde el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPsicologos();
  }, []);

  const abrirEditar = (psicologo: Psicologo) => {
    setPsicologoSeleccionado(psicologo);
    setIsModalOpen(true);
  };

  const abrirCrear = () => {
    setPsicologoSeleccionado(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: PsicologoFormData) => {
    setFormLoading(true);
    try {
      if (psicologoSeleccionado) {
        const usuarioId = psicologoSeleccionado.usuario?.id;
        if (!usuarioId) {
          throw new Error('No se encontró el ID de usuario del psicólogo seleccionado.');
        }

        await psicologosService.update(usuarioId, {
          especialidad: data.especialidad,
          registroProfesional: data.licenciaProfesional
        });
        message.success('Perfil de psicólogo actualizado correctamente.');
      } else {
        await psicologosService.create(data);
        message.success('Psicólogo registrado y cuenta asignada con éxito.');
      }
      
      setIsModalOpen(false);
      setPsicologoSeleccionado(null);
      await cargarPsicologos();

    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 409) {
        message.error('Este correo electrónico ya está en uso por otro usuario.');
      } else {
        message.error('Error al intentar guardar el registro en el servidor.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEliminar = async (record: Psicologo) => {
    const usuarioId = record.usuario?.id;
    if (!usuarioId) {
      return message.error('No se pudo encontrar el ID de usuario para realizar la desactivación.');
    }

    try {
      await psicologosService.remove(usuarioId);
      message.success('Psicólogo desactivado correctamente.');
      setPsicologos(psicologos.filter(p => p.id !== record.id));
    } catch (error) {
      console.error(error);
      message.error('No se pudo procesar la desactivación en el servidor.');
    }
  };

  const esAdmin = user?.rol === 'ADMIN';

  const columns = [
    {
      title: 'Nombre Completo',
      key: 'nombreCompleto',
      render: (_: any, record: Psicologo) => 
        `${record.usuario?.nombre || ''} ${record.usuario?.apellido || ''}`,
    },
    {
      title: 'Correo Electrónico',
      dataIndex: ['usuario', 'email'],
      key: 'email',
    },
    {
      title: 'Especialidad',
      dataIndex: 'especialidad',
      key: 'especialidad',
    },
    {
      title: 'Reg. Profesional / Licencia',
      dataIndex: 'licenciaProfesional',
      key: 'licenciaProfesional',
    },
    ...(esAdmin
      ? [
          {
            title: 'Acciones',
            key: 'acciones',
            render: (_: any, record: Psicologo) => (
              <Space size="middle">
                <Button 
                  type="text" 
                  icon={<EditOutlined style={{ color: '#1890ff' }} />} 
                  onClick={() => abrirEditar(record)}
                />
                <Popconfirm
                  title="¿Estás seguro de inhabilitar este profesional?"
                  description="Se desactivará su cuenta de acceso al sistema."
                  onConfirm={() => handleEliminar(record)}
                  okText="Sí, desactivar"
                  cancelText="Cancelar"
                  okButtonProps={{ danger: true }}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  const datosFiltrados = psicologos.filter(p => {
    const nombreCompleto = `${p.usuario?.nombre || ''} ${p.usuario?.apellido || ''}`.toLowerCase();
    const email = (p.usuario?.email || '').toLowerCase();
    return nombreCompleto.includes(searchText.toLowerCase()) || email.includes(searchText.toLowerCase());
  });

  const obtenerValoresIniciales = (): Partial<PsicologoFormData> | undefined => {
    if (!psicologoSeleccionado) return undefined;
    return {
      nombre: psicologoSeleccionado.usuario?.nombre || '',
      apellido: psicologoSeleccionado.usuario?.apellido || '',
      email: psicologoSeleccionado.usuario?.email || '',
      especialidad: psicologoSeleccionado.especialidad || '',
      licenciaProfesional: psicologoSeleccionado.licenciaProfesional || '',
      telefono: psicologoSeleccionado.telefono || '',
    };
  };

  return (
    <Card variant="borderless">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Gestión de Psicólogos Clínicos</Title>
        </div>
        {esAdmin && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={abrirCrear}
          >
            Nuevo Psicólogo
          </Button>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Buscar por nombre o correo profesional..."
          prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 320 }}
          allowClear
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={datosFiltrados} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 8 }}
        scroll={{ x: true }}
      />

      <Modal
        title={psicologoSeleccionado ? "Modificar Perfil de Psicólogo" : "Registrar Nuevo Especialista Clínico"}
        open={isModalOpen}
        onCancel={() => !formLoading && setIsModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <div style={{ marginTop: 20 }}>
          <FormPsicologo 
            onSubmit={handleFormSubmit} 
            loading={formLoading} 
            initialValues={obtenerValoresIniciales()} 
          />
        </div>
      </Modal>
    </Card>
  );
};

export default Psicologos;