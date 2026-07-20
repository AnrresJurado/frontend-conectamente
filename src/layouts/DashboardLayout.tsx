import React, { useState } from 'react';
import { Layout, Avatar, Space } from 'antd';
import {
  MenuFoldOutlined, MenuUnfoldOutlined, DashboardOutlined, UserOutlined,
  CalendarOutlined, LogoutOutlined, TeamOutlined, ScheduleOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';

const { Header, Sider, Content } = Layout;

const COLORS = {
  primary: '#1d5863',
  primaryDark: '#12414a',
  accent: '#4da6b0',
  accentSoft: '#bce3e6',
  bg: '#f8fafc',
  border: '#e2e8f0',
  textMuted: '#94a3b8',
};

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) return <Navigate to="/login" replace />;

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    ...(user?.rol === 'ADMIN' || user?.rol === 'PSICOLOGO' ? [{ key: '/dashboard/pacientes', icon: <UserOutlined />, label: 'Pacientes' }] : []),
    ...(user?.rol === 'ADMIN' ? [{ key: '/dashboard/psicologos', icon: <TeamOutlined />, label: 'Psicólogos' }] : []),
    ...(user?.rol === 'ADMIN' ? [{ key: '/dashboard/usuarios', icon: <TeamOutlined />, label: 'Control de Usuarios' }] : []),
    { key: '/dashboard/citas', icon: <CalendarOutlined />, label: 'Citas' },
    // Chats: solo tiene sentido para quien participa en una conversación paciente <-> psicólogo
    ...(user?.rol === 'PACIENTE' || user?.rol === 'PSICOLOGO' ? [{ key: '/dashboard/chats', icon: <MessageOutlined />, label: 'Chats' }] : []),
    ...(user?.rol === 'ADMIN' || user?.rol === 'PSICOLOGO' ? [{ key: '/dashboard/agenda', icon: <ScheduleOutlined />, label: 'Mi Agenda' }] : []),
    ...(user?.rol === 'ADMIN' || user?.rol === 'PSICOLOGO' ? [{ key: '/dashboard/analitica', icon: <TeamOutlined />, label: 'Analítica' }] : []),
  ];

  const iniciales = `${user?.nombre?.charAt(0) || ''}${user?.apellido?.charAt(0) || ''}`.toUpperCase() || 'CM';

  return (
    <Layout style={{ minHeight: '100vh', background: COLORS.bg }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{ background: '#ffffff', borderRight: `1px solid ${COLORS.border}` }}
      >
        {/* Logo con acento de marca */}
        <div style={styles.logoBlock}>
          <Logo size={collapsed ? 34 : 34} showText={!collapsed} textColor={COLORS.primary} accentColor={COLORS.accent} />
        </div>

        {/* Navegación propia (sin Menu genérico de antd) */}
        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const activo = location.pathname === item.key;
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                style={{
                  ...styles.navItem,
                  ...(activo ? styles.navItemActivo : {}),
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
              >
                <span style={{ fontSize: 17, display: 'flex' }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Cerrar sesión */}
        <div style={styles.logoutWrapper}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogoutOutlined style={{ fontSize: 16 }} />
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </Sider>

      <Layout style={{ background: 'transparent' }}>
        <Header style={styles.header}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={styles.collapseButton}
            aria-label="Alternar menú"
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>

          <Space size={16}>
            <div style={{ textAlign: 'right' }}>
              <div style={styles.userName}>{user?.nombre} {user?.apellido}</div>
              <div style={styles.userRol}>{user?.rol}</div>
            </div>
            <Avatar size={40} style={styles.avatar}>
              {iniciales}
            </Avatar>
          </Space>
        </Header>

        <Content style={{ overflowY: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  logoBlock: {
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: 16,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 16px',
    borderRadius: 12,
    border: 'none',
    background: 'transparent',
    color: '#475569',
    fontWeight: 500,
    fontSize: 14.5,
    fontFamily: "'Inter', system-ui, sans-serif",
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s ease, color 0.15s ease',
  },
  navItemActivo: {
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
    color: '#ffffff',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(29, 88, 99, 0.25)',
  },
  logoutWrapper: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    padding: '0 16px',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    padding: '11px 16px',
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    background: '#ffffff',
    color: '#c0564e',
    fontWeight: 600,
    fontSize: 14,
    fontFamily: "'Inter', system-ui, sans-serif",
    cursor: 'pointer',
  },
  header: {
    padding: '0 32px',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${COLORS.border}`,
    boxShadow: 'none',
  },
  collapseButton: {
    border: 'none',
    background: 'transparent',
    fontSize: 17,
    color: COLORS.primary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  userName: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    color: COLORS.primary,
    fontSize: 14,
  },
  userRol: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  avatar: {
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
    fontWeight: 700,
  },
};

export default DashboardLayout;