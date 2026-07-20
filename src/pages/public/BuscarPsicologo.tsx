import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Input, Modal, message, List, Tag, Typography } from 'antd';
import { psicologosService } from '../../services/psicologosService';
import { solicitudesService } from '../../services/solicitudesService';
import { Psicologo } from '../../types';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const BuscarPsicologo: React.FC = () => {
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [psicologoSeleccionado, setPsicologoSeleccionado] = useState<Psicologo | null>(null);
  const [mensaje, setMensaje] = useState<string>('');
  const [enviando, setEnviando] = useState<boolean>(false);

  useEffect(() => {
    const cargarProfesionales = async () => {
      try {
        const data = await psicologosService.getAll();
        setPsicologos(data);
      } catch (error) {
        message.error('Error al cargar el catálogo de especialistas.');
      } finally {
        setLoading(false);
      }
    };
    cargarProfesionales();
  }, []);

  const abrirModalSolicitud = (psicologo: Psicologo) => {
    setPsicologoSeleccionado(psicologo);
    setModalOpen(true);
  };

  const handleEnviar = async () => {
    if (!psicologoSeleccionado) return;
    setEnviando(true);
    try {
      await solicitudesService.enviar(psicologoSeleccionado.id, mensaje);
      message.success(`Solicitud enviada con éxito al Dr/Dra. ${psicologoSeleccionado.usuario?.apellido}.`);
      setModalOpen(false);
      setMensaje('');
    } catch (error) {
      message.error('No se pudo enviar la solicitud en este momento.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Encuentra a tu Especialista Clínico</Title>
      <Paragraph style={{ color: '#64748b', marginBottom: 24 }}>
        Selecciona el profesional de la salud mental con el que deseas iniciar tu acompañamiento terapéutico y envíale una solicitud de vinculación.
      </Paragraph>

      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
        loading={loading}
        dataSource={psicologos}
        renderItem={(psico) => (
          <List.Item>
            <Card 
              title={`${psico.usuario?.nombre} ${psico.usuario?.apellido}`}
              bordered={false}
              actions={[
                <Button type="primary" onClick={() => abrirModalSolicitud(psico)}>
                  Solicitar Atención
                </Button>
              ]}
            >
              <p><strong>Especialidad:</strong> <Tag color="blue">{psico.especialidad}</Tag></p>
              <p><strong>Reg. Profesional:</strong> {psico.licenciaProfesional}</p>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={`Solicitar vinculación con el profesional`}
        open={modalOpen}
        onCancel={() => !enviando && setModalOpen(false)}
        onOk={handleEnviar}
        confirmLoading={enviando}
        okText="Enviar Solicitud"
        cancelText="Cancelar"
      >
        <div style={{ marginTop: 16 }}>
          <p>Cuéntale brevemente al <strong>Dr/Dra. {psicologoSeleccionado?.usuario?.apellido}</strong> el motivo de tu consulta inicial:</p>
          <TextArea 
            rows={4} 
            value={mensaje} 
            onChange={(e) => setMensaje(e.target.value)} 
            placeholder="Ej. Hola, requiero acompañamiento debido a problemas constantes de estrés y ansiedad..." 
          />
        </div>
      </Modal>
    </div>
  );
};

export default BuscarPsicologo;