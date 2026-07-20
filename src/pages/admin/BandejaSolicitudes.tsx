import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Card, message, Typography } from 'antd';
import { CheckOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { solicitudesService, SolicitudVinculacion } from '../../services/solicitudesService';

const { Title, Paragraph } = Typography;

const BandejaSolicitudes: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudVinculacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const cargarBandeja = async () => {
    try {
      const data = await solicitudesService.getBandeja();
      setSolicitudes(data);
    } catch (error) {
      message.error('No se pudo cargar la bandeja de solicitudes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBandeja();
  }, []);

  const handleProcesar = async (id: string, estado: 'ACEPTADA' | 'RECHAZADA') => {
    try {
      await solicitudesService.procesar(id, estado);
      message.success(`Solicitud ${estado === 'ACEPTADA' ? 'aprobada' : 'rechazada'} con éxito.`);
      // Refrescamos la tabla para remover la solicitud procesada
      cargarBandeja();
    } catch (error) {
      message.error('Ocurrió un error al procesar la solicitud.');
    }
  };

  const columnas = [
    {
      title: 'Paciente',
      key: 'paciente',
      render: (_: any, record: SolicitudVinculacion) => (
        <Space>
          <UserOutlined style={{ color: '#1d5863' }} />
          <span>{record.paciente?.nombre} {record.paciente?.apellido}</span>
        </Space>
      ),
    },
    {
      title: 'Correo Electrónico',
      dataIndex: ['paciente', 'email'],
      key: 'email',
    },
    {
      title: 'Mensaje de Consulta Inicial',
      dataIndex: 'mensajeInicial',
      key: 'mensajeInicial',
      render: (text: string) => text ? <i>"{text}"</i> : <span style={{ color: '#94a3b8' }}>Sin mensaje</span>,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => (
        <Tag color="orange">{estado}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: SolicitudVinculacion) => (
        <Space size="middle">
          <Button 
            type="primary" 
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            icon={<CheckOutlined />}
            onClick={() => handleProcesar(record.id, 'ACEPTADA')}
          >
            Aceptar
          </Button>
          <Button 
            danger 
            icon={<CloseOutlined />}
            onClick={() => handleProcesar(record.id, 'RECHAZADA')}
          >
            Rechazar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false}>
        <Title level={3}>Solicitudes de Vinculación Pendientes</Title>
        <Paragraph style={{ color: '#64748b', marginBottom: 24 }}>
          Aquí se muestran los pacientes que se registraron de forma externa y han solicitado que seas su psicólogo tratante. Al aceptarlos, se creará su expediente clínico formal bajo tu supervisión.
        </Paragraph>

        <Table 
          columns={columnas} 
          dataSource={solicitudes} 
          rowKey="id" 
          loading={loading}
          locale={{ emptyText: 'No tienes solicitudes de atención pendientes por el momento.' }}
        />
      </Card>
    </div>
  );
};

export default BandejaSolicitudes;