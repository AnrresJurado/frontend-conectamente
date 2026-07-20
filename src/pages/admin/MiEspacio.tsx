import React, { useState } from 'react';
import { Tabs, Card, Button, Progress, Timeline, Input, Avatar, Space, Typography, Row, Col, Statistic } from 'antd';
import { 
  HomeOutlined, 
  TeamOutlined, 
  LineChartOutlined, 
  FileTextOutlined, 
  UserOutlined, 
  SendOutlined,
  CalendarOutlined,
  SmileOutlined,
  HeartOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export const MiEspacio: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'psicologo', text: '¡Hola! ¿Cómo te has sentido durante estos últimos días?' },
    { sender: 'paciente', text: 'Hola, un poco mejor gracias a los ejercicios de respiración.' }
  ]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setMessages([...messages, { sender: 'paciente', text: chatMessage }]);
    setChatMessage('');
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Cabecera de bienvenida inspiradora */}
      <div style={{ 
        background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)', 
        padding: '32px', 
        borderRadius: '24px', 
        marginBottom: '24px',
        border: '1px solid #E0E7FF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#312E81', fontWeight: 800 }}>
            Tu espacio seguro de bienestar 🌿
          </Title>
          <Paragraph style={{ margin: '8px 0 0 0', color: '#4B5563', fontSize: '16px' }}>
            Un lugar diseñado exclusivamente para tu tranquilidad, evolución y acompañamiento profesional.
          </Paragraph>
        </div>
        <div style={{ background: '#ffffff', padding: '12px 20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)' }}>
          <Space>
            <CalendarOutlined style={{ color: '#6366F1', fontSize: '20px' }} />
            <div>
              <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>Próxima sesión</Text>
              <Text strong style={{ color: '#1E293B' }}>Miércoles, 4:00 PM</Text>
            </div>
          </Space>
        </div>
      </div>

      {/* Navegación por pestañas estilizadas */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        items={[
          {
            key: '1',
            label: (<span><HomeOutlined /> Inicio</span>),
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} md={16}>
                  <Card bordered={false} style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <Title level={4} style={{ color: '#1E293B' }}>¡Qué bueno verte de nuevo!</Title>
                    <Paragraph style={{ color: '#64748B' }}>
                      Aquí puedes ver un resumen rápido de tus actividades pendientes y tu estado actual de ánimo. Recuerda que cada pequeño paso cuenta en tu proceso.
                    </Paragraph>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
                      <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <Text type="secondary">Progreso General</Text>
                        <Progress percent={70} strokeColor={{ '0%': '#6366F1', '100%': '#A855F7' }} style={{ marginTop: '8px' }} />
                      </div>
                      <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <Text type="secondary">Encuestas Respondidas</Text>
                        <Statistic value={4} suffix="/ 5" valueStyle={{ color: '#6366F1', fontWeight: 700 }} />
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card bordered={false} style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', color: '#fff', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)' }}>
                    <Title level={4} style={{ color: '#fff' }}><HeartOutlined /> Frase del día</Title>
                    <Paragraph style={{ color: '#E0E7FF', fontSize: '15px', fontStyle: 'italic', marginTop: '12px' }}>
                      "No tienes que controlarlo todo. A veces solo necesitas dejar ir, confiar y dar el siguiente paso con amor propio."
                    </Paragraph>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: '2',
            label: (<span><TeamOutlined /> Mi Psicólogo & Chat</span>),
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <Card bordered={false} style={{ borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <Avatar size={96} src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" style={{ border: '4px solid #EEF2FF', marginBottom: '16px' }} />
                    <Title level={4} style={{ margin: 0, color: '#1E293B' }}>Dra. Elena Ruiz</Title>
                    <Text type="secondary">Psicóloga Clínica Principal</Text>
                    <div style={{ marginTop: '20px', textAlign: 'left', background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px' }}>
                      <Text strong style={{ display: 'block', color: '#334155', marginBottom: '4px' }}>Especialidad:</Text>
                      <Text type="secondary" style={{ fontSize: '13px' }}>Terapia Cognitivo-Conductual y Manejo de Ansiedad.</Text>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={16}>
                  <Card 
                    bordered={false} 
                    title={<Space><SmileOutlined style={{ color: '#6366F1' }} /><span>Chat Directo con tu Psicólogo</span></Space>}
                    style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}
                    bodyStyle={{ display: 'flex', flexDirection: 'column', height: '400px', padding: '16px' }}
                  >
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {messages.map((msg, index) => (
                        <div 
                          key={index} 
                          style={{ 
                            alignSelf: msg.sender === 'paciente' ? 'flex-end' : 'flex-start',
                            background: msg.sender === 'paciente' ? '#6366F1' : '#F1F5F9',
                            color: msg.sender === 'paciente' ? '#fff' : '#1E293B',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            maxWidth: '75%',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                          }}
                        >
                          <Text style={{ color: 'inherit' }}>{msg.text}</Text>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Input 
                        placeholder="Escribe un mensaje para tu psicólogo..." 
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onPressEnter={handleSendMessage}
                        style={{ borderRadius: '12px', padding: '10px 16px' }}
                      />
                      <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} style={{ height: 'auto', borderRadius: '12px', background: '#6366F1' }}>
                        Enviar
                      </Button>
                    </div>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: '3',
            label: (<span><LineChartOutlined /> Progreso</span>),
            children: (
              <Card bordered={false} style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Title level={4} style={{ color: '#1E293B', marginBottom: '24px' }}>Tu Línea de Evolución Emocional</Title>
                <Timeline
                  mode="left"
                  items={[
                    {
                      color: '#6366F1',
                      children: (
                        <div>
                          <Text strong style={{ color: '#1E293B' }}>Sesión Inicial de Evaluación</Text>
                          <Paragraph type="secondary" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Se establecieron los objetivos principales de bienestar y pautas iniciales.</Paragraph>
                        </div>
                      ),
                    },
                    {
                      color: '#10B981',
                      children: (
                        <div>
                          <Text strong style={{ color: '#1E293B' }}>Avance en Control de Ansiedad</Text>
                          <Paragraph type="secondary" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Excelente aplicación de las técnicas de respiración autónoma.</Paragraph>
                        </div>
                      ),
                    },
                    {
                      color: '#A855F7',
                      children: (
                        <div>
                          <Text strong style={{ color: '#1E293B' }}>Próxima meta: Consolidación de hábitos</Text>
                          <Paragraph type="secondary" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>En proceso de revisión durante la cita semanal.</Paragraph>
                        </div>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: '4',
            label: (<span><FileTextOutlined /> Encuestas</span>),
            children: (
              <Card bordered={false} style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Title level={4} style={{ color: '#1E293B' }}>Tus Evaluaciones Pendientes</Title>
                <Paragraph type="secondary">Responde las siguientes encuestas asignadas por tu especialista para medir tu evolución semanal.</Paragraph>
                
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <Space direction="vertical" size={2}>
                      <Text strong style={{ color: '#1E293B' }}>Test de Bienestar Semanal (PHQ-9)</Text>
                      <Text type="secondary" style={{ fontSize: '13px' }}>Asignado el 15 de Julio — Pendiente</Text>
                    </Space>
                    <Button type="primary" style={{ background: '#6366F1', borderRadius: '10px' }}>Comenzar</Button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <Space direction="vertical" size={2}>
                      <Space>
                        <Text strong style={{ color: '#1E293B' }}>Evaluación de Estrés Cotidiano</Text>
                        <CheckCircleOutlined style={{ color: '#10B981' }} />
                      </Space>
                      <Text type="secondary" style={{ fontSize: '13px' }}>Completado el 8 de Julio</Text>
                    </Space>
                    <Button disabled style={{ borderRadius: '10px' }}>Completado</Button>
                  </div>
                </div>
              </Card>
            ),
          },
          {
            key: '5',
            label: (<span><UserOutlined /> Perfil</span>),
            children: (
              <Card bordered={false} style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#6366F1', marginBottom: '12px' }} />
                  <Title level={4} style={{ margin: 0, color: '#1E293B' }}>Datos Personales</Title>
                  <Text type="secondary">Actualiza tu información de contacto y preferencias</Text>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '6px' }}>Nombre completo</Text>
                    <Input defaultValue="Paciente ConectaMente" style={{ borderRadius: '10px', padding: '8px 12px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '6px' }}>Correo electrónico</Text>
                    <Input defaultValue="paciente@conectamente.com" disabled style={{ borderRadius: '10px', padding: '8px 12px' }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '6px' }}>Teléfono de contacto</Text>
                    <Input defaultValue="+593 99 999 9999" style={{ borderRadius: '10px', padding: '8px 12px' }} />
                  </div>
                  <Button type="primary" style={{ background: '#6366F1', borderRadius: '10px', marginTop: '12px', height: '40px', fontWeight: 600 }}>
                    Guardar Cambios
                  </Button>
                </div>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};