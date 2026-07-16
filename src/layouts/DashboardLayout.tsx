import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Space, Divider, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  LogoutOutlined,
  TeamOutlined, 
  HeartTwoTone,
  ScheduleOutlined, // 🚀 Importamos el icono ideal para la Agenda
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'; 
import { useAuth } from '../hooks/useAuth';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🎯 FILTRADO DINÁMICO DE MENÚ SEGÚN EL ROL (Actualizado con Agenda)
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined style={{ fontSize: '16px' }} />,
      label: 'Dashboard',
    },
    // Solo ADMIN y PSICOLOGO pueden gestionar la lista de pacientes
    ...(user?.rol === 'ADMIN' || user?.rol === 'PSICOLOGO'
      ? [
          {
            key: '/dashboard/pacientes',
            icon: <UserOutlined style={{ fontSize: '16px' }} />,
            label: 'Pacientes',
          },
        ]
      : []),
    // 🚀 NUEVO ACCESO A PSICÓLOGOS (Solo visible para ADMIN)
    ...(user?.rol === 'ADMIN'
      ? [
          {
            key: '/dashboard/psicologos',
            icon: <TeamOutlined style={{ fontSize: '16px' }} />,
            label: 'Psicólogos',
          },
        ]
      : []),
    {
      key: '/dashboard/citas',
      icon: <CalendarOutlined style={{ fontSize: '16px' }} />,
      label: 'Citas',
    },
    // 🚀 NUEVO ACCESO A AGENDA (Solo visible para ADMIN y PSICOLOGO)
    ...(user?.rol === 'ADMIN' || user?.rol === 'PSICOLOGO'
      ? [
          {
            key: '/dashboard/agenda',
            icon: <ScheduleOutlined style={{ fontSize: '16px' }} />,
            label: 'Mi Agenda',
          },
        ]
      : []),
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* SIDEBAR LATERAL REDISEÑADO */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light" 
        width={250}
        style={{
          borderRight: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo Corporativo */}
          <div style={{ padding: '20px 16px', textAlign: 'center', background: '#fafafa' }}>
            <Title level={4} style={{ margin: 0, color: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: '8px' }}>
              <HeartTwoTone twoToneColor="#eb2f96" />
              {!collapsed && <span style={{ fontWeight: 700, letterSpacing: '-0.5px' }}>ConectaMente</span>}
            </Title>
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Menú de Navegación */}
          <div style={{ flex: 1, paddingTop: '12px' }}>
            <Menu
              theme="light"
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              style={{ borderRight: 0 }}
            />
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Botón de Salida en la parte inferior del Sider */}
          <div style={{ padding: '16px' }}>
            <Button
              type="text"
              danger
              icon={<LogoutOutlined />}
              block
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '8px',
                height: '40px',
              }}
            >
              {!collapsed && 'Cerrar Sesión'}
            </Button>
          </div>
        </div>
      </Sider>

      <Layout>
        {/* HEADER SUPERIOR */}
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 44, height: 44, borderRadius: '8px' }}
          />

          {/* Perfil del Usuario de Forma Profesional */}
          <Space size="middle">
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right', lineHeight: '1.2' }}>
              <Text style={{ fontWeight: 600 }}>
                {user?.nombre} {user?.apellido}
              </Text>
              <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {user?.rol}
              </Text>
            </div>
            <Avatar
              size="large"
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.nombre || 'User'}`}
              style={{ backgroundColor: '#1890ff', verticalAlign: 'middle' }}
            />
          </Space>
        </Header>

        {/* CONTENEDOR DE CONTENIDO PRINCIPAL */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;