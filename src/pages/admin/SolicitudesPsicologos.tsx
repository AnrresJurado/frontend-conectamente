import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Card, message, Typography, Modal, Descriptions, Popconfirm } from 'antd';
import { CheckOutlined, CloseOutlined, UserOutlined, MailOutlined, IdcardOutlined, PhoneOutlined, CompassOutlined, MessageOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { solicitudesPsicologosService, SolicitudPsicologo } from "../../services/solicitudesPsicologosService";

const { Title, Paragraph, Text } = Typography;

const SolicitudesPsicologos: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudPsicologo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudPsicologo | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await solicitudesPsicologosService.getSolicitudes();
      setSolicitudes(data);
    } catch (error) {
      console.error(error);
      message.error('No se pudo cargar la lista de solicitudes de psicólogos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const verDetalle = (solicitud: SolicitudPsicologo) => {
    setSelectedSolicitud(solicitud);
    setDetailModalOpen(true);
  };

  const handleAprobar = async (solicitudId: string) => {
    setProcessingId(solicitudId);
    try {
      await solicitudesPsicologosService.aprobarSolicitud(solicitudId);
      message.success('Solicitud aprobada. La cuenta del psicólogo ha sido creada exitosamente.');
      setDetailModalOpen(false);
      setSelectedSolicitud(null);
      cargarSolicitudes();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Ocurrió un error al aprobar la solicitud.';
      message.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRechazar = async (solicitudId: string) => {
    setProcessingId(solicitudId);
    try {
      await solicitudesPsicologosService.rechazarSolicitud(solicitudId);
      message.success('Solicitud rechazada correctamente.');
      setDetailModalOpen(false);
      setSelectedSolicitud(null);
      cargarSolicitudes();
    } catch (error) {
      console.error(error);
      message.error('Ocurrió un error al rechazar la solicitud.');
    } finally {
      setProcessingId(null);
    }
  };

  const getEstadoTag = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return <Tag color="orange" style={{ borderRadius: 12, padding: '2px 12px' }}>PENDIENTE</Tag>;
      case 'APROBADA':
        return <Tag color="green" style={{ borderRadius: 12, padding: '2px 12px' }}>APROBADA</Tag>;
      case 'RECHAZADA':
        return <Tag color="red" style={{ borderRadius: 12, padding: '2px 12px' }}>RECHAZADA</Tag>;
      default:
        return <Tag>{estado}</Tag>;
    }
  };

  const columnas = [
    {
      title: 'Solicitante',
      key: 'solicitante',
      render: (_: any, record: SolicitudPsicologo) => (
        <Space>
          <UserOutlined style={{ color: '#1d5863' }} />
          <span style={{ fontWeight: 500 }}>{record.nombre} {record.apellido}</span>
        </Space>
      ),
    },
    {
      title: 'Correo Electrónico',
      key: 'email',
      render: (_: any, record: SolicitudPsicologo) => (
        <Space>
          <MailOutlined style={{ color: '#94a3b8' }} />
          <span>{record.email}</span>
        </Space>
      ),
    },
    {
      title: 'Licencia Profesional',
      dataIndex: 'licenciaProfesional',
      key: 'licenciaProfesional',
      render: (text: string) => (
        <Space>
          <IdcardOutlined style={{ color: '#94a3b8' }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Especialidad',
      dataIndex: 'especialidad',
      key: 'especialidad',
      render: (text: string) => text || <span style={{ color: '#94a3b8' }}>No especificada</span>,
    },
    {
      title: 'Fecha de Solicitud',
      dataIndex: 'creadoEn',
      key: 'creadoEn',
      render: (fecha: string) => {
        const d = new Date(fecha);
        return d.toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      },
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => getEstadoTag(estado),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: SolicitudPsicologo) => (
        record.estado === 'PENDIENTE' ? (
          <Space size="middle">
            <Button
              type="primary"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', borderRadius: 20 }}
              icon={<CheckOutlined />}
              onClick={() => handleAprobar(record.id)}
              loading={processingId === record.id}
            >
              Aprobar
            </Button>
            <Popconfirm
              title="¿Estás seguro de rechazar esta solicitud?"
              description="El solicitante será notificado del rechazo."
              onConfirm={() => handleRechazar(record.id)}
              okText="Sí, rechazar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<CloseOutlined />}
                style={{ borderRadius: 20 }}
                loading={processingId === record.id}
              >
                Rechazar
              </Button>
            </Popconfirm>
            <Button
              type="link"
              onClick={() => verDetalle(record)}
              style={{ color: '#1d5863' }}
            >
              Ver detalle
            </Button>
          </Space>
        ) : (
          <Button
            type="link"
            onClick={() => verDetalle(record)}
            style={{ color: '#1d5863' }}
          >
            Ver detalle
          </Button>
        )
      ),
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      <Card variant="borderless">
        <div style={{ marginBottom: 8 }}>
          <Title level={3} style={{ margin: 0, color: '#1d5863' }}>
            Solicitudes de Registro de Psicólogos
          </Title>
        </div>
        <Paragraph style={{ color: '#64748b', marginBottom: 24, marginTop: 8 }}>
          Aquí se muestran los psicólogos que han enviado una solicitud para registrarse en la plataforma.
          Al aprobar una solicitud, se creará automáticamente su cuenta de usuario con rol de PSICÓLOGO.
        </Paragraph>

        <Table
          columns={columnas}
          dataSource={solicitudes}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: true }}
          locale={{ emptyText: 'No hay solicitudes de registro de psicólogos pendientes.' }}
        />
      </Card>

      {/* Modal de detalle */}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: '#1d5863' }} />
            <span style={{ color: '#1d5863', fontWeight: 700 }}>Detalle de la Solicitud</span>
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => { setDetailModalOpen(false); setSelectedSolicitud(null); }}
        footer={selectedSolicitud?.estado === 'PENDIENTE' ? (
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Popconfirm
              title="¿Estás seguro de rechazar esta solicitud?"
              description="El solicitante será notificado del rechazo."
              onConfirm={() => selectedSolicitud && handleRechazar(selectedSolicitud.id)}
              okText="Sí, rechazar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<CloseOutlined />}
                style={{ borderRadius: 20 }}
                loading={!!processingId}
              >
                Rechazar Solicitud
              </Button>
            </Popconfirm>
            <Button
              type="primary"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', borderRadius: 20 }}
              icon={<CheckOutlined />}
              onClick={() => selectedSolicitud && handleAprobar(selectedSolicitud.id)}
              loading={!!processingId}
            >
              Aprobar y Crear Cuenta
            </Button>
          </Space>
        ) : null}
        width={600}
        destroyOnClose
      >
        {selectedSolicitud && (
          <div style={{ marginTop: 16 }}>
            <Descriptions
              column={2}
              bordered
              size="small"
              styles={{
                label: { fontWeight: 600, color: '#475569' },
              }}
            >
              <Descriptions.Item label={<><UserOutlined style={{ marginRight: 6 }} />Nombre</>} span={1}>
                {selectedSolicitud.nombre} {selectedSolicitud.apellido}
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined style={{ marginRight: 6 }} />Email</>} span={1}>
                {selectedSolicitud.email}
              </Descriptions.Item>
              <Descriptions.Item label={<><IdcardOutlined style={{ marginRight: 6 }} />Licencia</>} span={1}>
                {selectedSolicitud.licenciaProfesional}
              </Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined style={{ marginRight: 6 }} />Teléfono</>} span={1}>
                {selectedSolicitud.telefono || <span style={{ color: '#94a3b8' }}>No registrado</span>}
              </Descriptions.Item>
              <Descriptions.Item label={<><CompassOutlined style={{ marginRight: 6 }} />Especialidad</>} span={2}>
                {selectedSolicitud.especialidad || <span style={{ color: '#94a3b8' }}>No especificada</span>}
              </Descriptions.Item>
              <Descriptions.Item label={<><MessageOutlined style={{ marginRight: 6 }} />Mensaje</>} span={2}>
                {selectedSolicitud.mensajeAdicional ? (
                  <Text italic>{selectedSolicitud.mensajeAdicional}</Text>
                ) : (
                  <span style={{ color: '#94a3b8' }}>Sin mensaje adicional</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={<><ClockCircleOutlined style={{ marginRight: 6 }} />Estado</>} span={1}>
                {getEstadoTag(selectedSolicitud.estado)}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de Solicitud" span={1}>
                {new Date(selectedSolicitud.creadoEn).toLocaleDateString('es-EC', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </Descriptions.Item>
              {selectedSolicitud.adminObservaciones && (
                <Descriptions.Item label="Observaciones del Admin" span={2}>
                  <Text style={{ color: '#64748b' }}>{selectedSolicitud.adminObservaciones}</Text>
                </Descriptions.Item>
              )}
              {selectedSolicitud.procesadoEn && (
                <Descriptions.Item label="Fecha de Procesamiento" span={2}>
                  {new Date(selectedSolicitud.procesadoEn).toLocaleDateString('es-EC', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SolicitudesPsicologos;