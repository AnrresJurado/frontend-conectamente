import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Modal, Form, Select, Input, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { recomendacionesService, Recomendacion } from '../../services/recomendacionesService';
import { pacientesService } from '../../services/pacientesService';
import { Paciente } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const { Option } = Select;
const { TextArea } = Input;

const PALETTE = {
  primary: '#1d5863',
  primaryDark: '#12414a',
  accent: '#4da6b0',
  bg: '#eef7f7',
  card: '#ffffff',
  border: '#e2e8f0',
  textMuted: '#64748b',
};

const Recomendaciones: React.FC = () => {
  const { user } = useAuth();
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [recomendacionEditar, setRecomendacionEditar] = useState<Recomendacion | null>(null);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [dataRecomendaciones, dataPacientes] = await Promise.all([
        recomendacionesService.getAll(),
        pacientesService.getAll(),
      ]);
      setRecomendaciones(dataRecomendaciones);
      setPacientes(dataPacientes);
    } catch (error) {
      console.error(error);
      message.error('Error al cargar las recomendaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      cargarDatos();
    }
  }, [user]);

  const handleCrear = async (values: { pacienteId: string; titulo: string; descripcion: string; fecha: string }) => {
    setFormLoading(true);
    try {
      const nuevaRecomendacion = await recomendacionesService.create({
        pacienteId: values.pacienteId,
        titulo: values.titulo,
        descripcion: values.descripcion,
        fecha: values.fecha,
      });
      message.success('Recomendación creada exitosamente.');
      setIsModalOpen(false);
      form.resetFields();
      setRecomendaciones(prev => [nuevaRecomendacion, ...prev]);
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || 'No se pudo crear la recomendación.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleActualizar = async (values: { pacienteId: string; titulo: string; descripcion: string; fecha: string }) => {
    if (!recomendacionEditar) return;
    setFormLoading(true);
    try {
      const recomendacionActualizada = await recomendacionesService.update(recomendacionEditar.id, {
        pacienteId: values.pacienteId,
        titulo: values.titulo,
        descripcion: values.descripcion,
        fecha: values.fecha,
      });
      message.success('Recomendación actualizada exitosamente.');
      setIsModalOpen(false);
      setRecomendacionEditar(null);
      form.resetFields();
      setRecomendaciones(prev => prev.map(r => r.id === recomendacionEditar.id ? recomendacionActualizada : r));
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || 'No se pudo actualizar la recomendación.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      await recomendacionesService.delete(id);
      message.success('Recomendación eliminada exitosamente.');
      setRecomendaciones(prev => prev.filter(r => r.id !== id));
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || 'No se pudo eliminar la recomendación.');
    }
  };

  const abrirModalCrear = () => {
    setRecomendacionEditar(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const abrirModalEditar = (recomendacion: Recomendacion) => {
    setRecomendacionEditar(recomendacion);
    form.setFieldsValue({
      pacienteId: recomendacion.paciente?.id,
      titulo: recomendacion.titulo,
      descripcion: recomendacion.descripcion,
      fecha: recomendacion.fecha ? new Date(recomendacion.fecha).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (text: string) => {
        const fecha = new Date(text);
        return <span>{fecha.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}</span>;
      },
    },
    {
      title: 'Paciente',
      key: 'paciente',
      render: (_: any, record: Recomendacion) => (
        <span>
          {record.paciente?.usuario?.nombre} {record.paciente?.usuario?.apellido}
        </span>
      ),
    },
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
      ellipsis: true,
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      ellipsis: true,
      render: (text: string) => <span style={{ color: '#475569', fontSize: 13 }}>{text}</span>,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 150,
      render: (_: any, record: Recomendacion) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: PALETTE.accent }} />} 
            onClick={() => abrirModalEditar(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Deseas eliminar esta recomendación?"
            description="Esta acción no se puede deshacer."
            onConfirm={() => handleEliminar(record.id)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={styles.page}>
      <style>{`
        .cm-recomendaciones .ant-table { background: transparent; }
        .cm-recomendaciones .ant-table-thead > tr > th {
          background: #f2f9f9;
          color: ${PALETTE.primary};
          font-weight: 700;
          font-size: 12.5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: none;
        }
        .cm-recomendaciones .ant-table-thead > tr > th::before { display: none; }
        .cm-recomendaciones .ant-table-tbody > tr > td {
          border-bottom: 1px solid #eef2f2;
          padding-top: 14px;
          padding-bottom: 14px;
        }
        .cm-recomendaciones .ant-table-tbody > tr:hover > td { background: #f7fcfc; }
        .cm-recomendaciones .ant-table-tbody > tr:last-child > td { border-bottom: none; }
        .cm-recomendaciones .ant-pagination-item-active { border-color: ${PALETTE.primary}; }
        .cm-recomendaciones .ant-pagination-item-active a { color: ${PALETTE.primary}; }
        .cm-recomendaciones-modal .ant-modal-content { border-radius: 20px; overflow: hidden; }
      `}</style>

      {/* ═══════════════ ENCABEZADO ═══════════════ */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Recomendaciones a Pacientes</h1>
          <p style={styles.subtitle}>
            {recomendaciones.length} recomendación{recomendaciones.length === 1 ? '' : 'es'} registrada{recomendaciones.length === 1 ? '' : 's'}
          </p>
        </div>

        <button style={styles.btnPrimary} onClick={abrirModalCrear}>
          <PlusOutlined />
          Nueva Recomendación
        </button>
      </div>

      {/* ═══════════════ TABLA ═══════════════ */}
      <div style={styles.panel} className="cm-recomendaciones">
        <Table
          columns={columns as any}
          dataSource={recomendaciones}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Tag color="default">No hay recomendaciones registradas todavía.</Tag> }}
        />
      </div>

      {/* MODAL PARA CREAR/EDITAR RECOMENDACIÓN */}
      <Modal
        title={<span style={styles.modalTitle}>{recomendacionEditar ? 'Editar Recomendación' : 'Nueva Recomendación'}</span>}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setRecomendacionEditar(null); form.resetFields(); }}
        footer={null}
        destroyOnClose
        className="cm-recomendaciones-modal"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={recomendacionEditar ? handleActualizar : handleCrear} style={{ marginTop: 20 }}>
          <Form.Item 
            name="pacienteId" 
            label="Seleccionar Paciente" 
            rules={[{ required: true, message: 'Por favor selecciona el paciente' }]}
          >
            <Select placeholder="Buscar por nombre..." optionFilterProp="children">
              {pacientes.map(p => (
                <Option key={p.id} value={p.usuario?.id}>
                  {p.usuario?.nombre} {p.usuario?.apellido} ({p.usuario?.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="titulo" 
            label="Título de la Recomendación" 
            rules={[{ required: true, message: 'Por favor ingresa el título' }]}
          >
            <Input placeholder="Ej. Ejercicios de respiración" />
          </Form.Item>

          <Form.Item 
            name="descripcion" 
            label="Descripción" 
            rules={[{ required: true, message: 'Por favor ingresa la descripción' }]}
          >
            <TextArea rows={4} placeholder="Describe la recomendación de manera clara y detallada..." />
          </Form.Item>

          <Form.Item 
            name="fecha" 
            label="Fecha" 
            rules={[{ required: true, message: 'Por favor selecciona la fecha' }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" style={styles.btnSecundario} onClick={() => { setIsModalOpen(false); setRecomendacionEditar(null); form.resetFields(); }}>
                Cancelar
              </button>
              <button
                type="submit"
                style={{ ...styles.btnPrimary, opacity: formLoading ? 0.7 : 1 }}
                disabled={formLoading}
              >
                {formLoading ? 'Guardando...' : recomendacionEditar ? 'Actualizar' : 'Crear Recomendación'}
              </button>
            </div>
          </Form.Item>
        </Form>
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
  modalTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primary,
    fontWeight: 800,
    fontSize: 18,
  },
};

export default Recomendaciones;