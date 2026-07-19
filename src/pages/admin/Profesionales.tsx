import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Typography, Avatar, Tag, Button, Empty, Spin, Row, Col } from 'antd';
import { SearchOutlined, PhoneOutlined, MailOutlined, IdcardOutlined, CalendarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { psicologosService } from '../../services/psicologosService';
import { useAuth } from '../../hooks/useAuth';
import { Psicologo } from '../../types';
import Logo from '../../components/Logo';

const { Title, Paragraph } = Typography;

const COLORS = {
  primary: '#1d5863',
  accent: '#4da6b0',
  bg: '#f8fafc',
  text: '#334155',
};

const Profesionales: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');

  const cargarProfesionales = async () => {
    setLoading(true);
    try {
      const data = await psicologosService.getAll();
      setPsicologos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProfesionales();
  }, []);

  const datosFiltrados = psicologos.filter((p) => {
    const term = searchText.toLowerCase();
    const nombreCompleto = `${p.usuario?.nombre || ''} ${p.usuario?.apellido || ''}`.toLowerCase();
    const especialidad = (p.especialidad || '').toLowerCase();
    return nombreCompleto.includes(term) || especialidad.includes(term);
  });

  const irAPerfil = (id: string) => navigate(`/profesionales/${id}`);

  const handleAgendarCita = (e: React.MouseEvent, psicologoId: string) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: `/citas?psicologo=${psicologoId}` } });
      return;
    }
    navigate(`/citas?psicologo=${psicologoId}`);
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh' }}>

      {/* MINI HEADER DE NAVEGACIÓN */}
      <div
        style={{
          background: '#ffffff',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          padding: '0 60px',
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <Logo size={40} onClick={() => navigate("/")} />
        </div>

        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          style={{ color: COLORS.primary, fontWeight: 500 }}
        >
          Volver al inicio
        </Button>
      </div>

      <div style={{ padding: '40px 60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <Title level={2} style={{ color: COLORS.primary, marginBottom: 12 }}>Nuestros Especialistas</Title>
            <Paragraph style={{ color: '#64748b', fontSize: '16px', maxWidth: 600, margin: '0 auto' }}>
              Selecciona el profesional que mejor se adapte a tus necesidades y comienza tu camino al bienestar.
            </Paragraph>

            <Input
              placeholder="Busca por nombre o especialidad..."
              prefix={<SearchOutlined style={{ color: COLORS.accent }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{
                marginTop: 32,
                maxWidth: 500,
                height: 50,
                borderRadius: 25,
                padding: '0 20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: 'none'
              }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>
          ) : datosFiltrados.length === 0 ? (
            <Empty description="No encontramos especialistas con esos criterios." style={{ marginTop: 60 }} />
          ) : (
            <Row gutter={[24, 24]}>
              {datosFiltrados.map((p) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={p.id}>
                  <Card
                    hoverable
                    bordered={false}
                    onClick={() => irAPerfil(p.id)}
                    style={{
                      borderRadius: 24,
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                    }}
                    bodyStyle={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <Avatar
                      size={80}
                      style={{
                        backgroundColor: '#e0f2f1',
                        color: COLORS.primary,
                        fontSize: 28,
                        fontWeight: 'bold',
                        marginBottom: 16
                      }}
                    >
                      {`${p.usuario?.nombre?.charAt(0) || ''}${p.usuario?.apellido?.charAt(0) || ''}`.toUpperCase()}
                    </Avatar>

                    <Title level={4} style={{ margin: '0 0 8px 0', color: COLORS.primary }}>
                      {p.usuario?.nombre} {p.usuario?.apellido}
                    </Title>

                    <Tag color="cyan" style={{ borderRadius: 6, padding: '2px 10px', marginBottom: 20 }}>
                      {p.especialidad || 'Psicología General'}
                    </Tag>

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                      <InfoRow icon={<IdcardOutlined />} text={p.licenciaProfesional || 'Licencia activa'} />
                      <InfoRow icon={<MailOutlined />} text={p.usuario?.email || ''} />
                      <InfoRow icon={<PhoneOutlined />} text={p.telefono || 'Sin contacto'} />
                    </div>

                    <Button
                      type="primary"
                      block
                      size="large"
                      icon={<CalendarOutlined />}
                      onClick={(e) => handleAgendarCita(e, p.id)}
                      style={{
                        borderRadius: 12,
                        background: COLORS.primary,
                        fontWeight: 600,
                        height: 48
                      }}
                    >
                      Agendar Cita
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: '13px' }}>
    {React.cloneElement(icon as React.ReactElement, { style: { color: COLORS.accent } })}
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
  </div>
);

export default Profesionales;