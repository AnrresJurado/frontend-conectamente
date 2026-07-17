import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Avatar, Tag, Button, Spin, Row, Col, Divider, Result } from 'antd';
import {
  PhoneOutlined, MailOutlined, IdcardOutlined, CalendarOutlined,
  ArrowLeftOutlined, CheckCircleFilled
} from '@ant-design/icons';
import { psicologosService } from '../../services/psicologosService';
import { useAuth } from '../../hooks/useAuth';
import { Psicologo } from '../../types';

const { Title, Paragraph, Text } = Typography;

const COLORS = {
  primary: '#1d5863',
  accent: '#4da6b0',
  bg: '#f8fafc',
  text: '#334155',
};

const ProfesionalDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [psicologo, setPsicologo] = useState<Psicologo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    const cargar = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await psicologosService.getById(id);
        setPsicologo(data);
      } catch (error) {
        console.error(error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  const handleAgendarCita = () => {
    if (!user) {
      navigate('/login', { state: { from: `/citas?psicologo=${id}` } });
      return;
    }
    navigate(`/citas?psicologo=${id}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '150px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (notFound || !psicologo) {
    return (
      <Result
        status="404"
        title="No encontramos a este especialista"
        subTitle="Puede que el perfil ya no esté disponible."
        extra={
          <Button type="primary" onClick={() => navigate('/profesionales')}>
            Volver al listado
          </Button>
        }
        style={{ paddingTop: 80 }}
      />
    );
  }

  const nombreCompleto = `${psicologo.usuario?.nombre || ''} ${psicologo.usuario?.apellido || ''}`;

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', padding: '40px 60px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/profesionales')}
          style={{ marginBottom: 24, color: COLORS.primary, fontWeight: 500 }}
        >
          Volver a especialistas
        </Button>

        <div
          style={{
            background: '#fff',
            borderRadius: 28,
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Banda superior de marca */}
          <div style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`, height: 96 }} />

          <div style={{ padding: '0 48px 48px' }}>
            <Row gutter={[40, 24]} style={{ marginTop: -56 }}>
              <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                <Avatar
                  size={128}
                  style={{
                    backgroundColor: '#e0f2f1',
                    color: COLORS.primary,
                    fontSize: 44,
                    fontWeight: 'bold',
                    border: '5px solid #fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  {`${psicologo.usuario?.nombre?.charAt(0) || ''}${psicologo.usuario?.apellido?.charAt(0) || ''}`.toUpperCase()}
                </Avatar>

                <Title level={3} style={{ color: COLORS.primary, margin: '16px 0 8px' }}>
                  {nombreCompleto}
                </Title>

                <Tag color="cyan" style={{ borderRadius: 6, padding: '3px 12px', fontSize: 13 }}>
                  {psicologo.especialidad || 'Psicología General'}
                </Tag>

                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<CalendarOutlined />}
                  onClick={handleAgendarCita}
                  style={{
                    marginTop: 24,
                    borderRadius: 25,
                    background: COLORS.primary,
                    fontWeight: 600,
                    height: 50,
                  }}
                >
                  Agendar Cita
                </Button>

                {!user && (
                  <Text type="secondary" style={{ display: 'block', marginTop: 10, fontSize: 12 }}>
                    Te pediremos iniciar sesión para confirmar tu cita.
                  </Text>
                )}
              </Col>

              <Col xs={24} md={16} style={{ paddingTop: 72 }}>
                <Title level={5} style={{ color: COLORS.text }}>Sobre el especialista</Title>
                <Paragraph style={{ color: '#64748b' }}>
                  {psicologo.usuario?.nombre} es especialista en{' '}
                  <Text strong style={{ color: COLORS.primary }}>
                    {psicologo.especialidad || 'psicología general'}
                  </Text>
                  , comprometido/a con brindar acompañamiento profesional y confidencial
                  para ayudarte a alcanzar tu bienestar emocional.
                </Paragraph>

                <Divider style={{ margin: '24px 0' }} />

                <Title level={5} style={{ color: COLORS.text, marginBottom: 16 }}>Información profesional</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <DetalleItem
                      icon={<IdcardOutlined />}
                      label="Licencia / Registro"
                      value={psicologo.licenciaProfesional || 'No especificado'}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <DetalleItem
                      icon={<MailOutlined />}
                      label="Correo"
                      value={psicologo.usuario?.email || 'No especificado'}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <DetalleItem
                      icon={<PhoneOutlined />}
                      label="Teléfono"
                      value={psicologo.telefono || 'No especificado'}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <DetalleItem
                      icon={<CheckCircleFilled />}
                      label="Estado"
                      value="Disponible para citas"
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetalleItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
    <div
      style={{
        width: 36, height: 36, borderRadius: 10,
        background: '#e0f2f1', color: COLORS.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 16,
      }}
    >
      {icon}
    </div>
    <div>
      <Text style={{ display: 'block', fontSize: 12, color: '#94a3b8' }}>{label}</Text>
      <Text style={{ color: COLORS.text, fontWeight: 500 }}>{value}</Text>
    </div>
  </div>
);

export default ProfesionalDetalle;