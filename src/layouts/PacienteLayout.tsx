import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button, Space } from 'antd';
import {
  LogoutOutlined, HomeOutlined, UserOutlined, 
  MessageOutlined, FileTextOutlined, ExperimentOutlined, HeartOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';

const COLORS = {
  primary: '#1d5863',
  primaryDark: '#12414a',
  accent: '#4da6b0',
  bg: '#f4f9f9',
  border: '#e2e8f0',
};

const PacienteLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { key: '/mi-espacio', icon: <HomeOutlined />, label: 'Mi Espacio' },
    { key: '/mi-perfil', icon: <UserOutlined />, label: 'Mi Perfil' },
    { key: '/buscar-psicologo', icon: <UserOutlined />, label: 'Buscar Psicólogo' },
    { key: '/mis-tests-psicometricos', icon: <ExperimentOutlined />, label: 'Tests Psicométricos' },
    { key: '/mis-encuestas', icon: <FileTextOutlined />, label: 'Mis Encuestas' },
    { key: '/mis-recomendaciones', icon: <HeartOutlined />, label: 'Mis Recomendaciones' },
    { key: '/chats', icon: <MessageOutlined />, label: 'Chats' },
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div onClick={() => navigate('/mi-espacio')} style={{ cursor: 'pointer' }}>
          <Logo size={36} textColor={COLORS.primary} accentColor={COLORS.accent} />
        </div>

        <nav style={styles.nav}>
          <Space size={4}>
            {menuItems.map((item) => {
              const activo = location.pathname === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  style={{
                    ...styles.navItem,
                    ...(activo ? styles.navItemActivo : {}),
                  }}
                >
                  <span style={{ fontSize: 16, display: 'flex' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </Space>
        </nav>

        <div style={styles.headerRight}>
          <span style={styles.saludo}>
            Hola, <strong>{user?.nombre}</strong>
          </span>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={styles.logoutBtn}
          >
            Salir
          </Button>
        </div>
      </header>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    background: COLORS.bg,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  header: {
    height: 'auto',
    minHeight: 72,
    background: '#ffffff',
    borderBottom: `1px solid ${COLORS.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 32px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    flexWrap: 'wrap',
    gap: 12,
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 10,
    border: 'none',
    background: 'transparent',
    color: '#475569',
    fontWeight: 500,
    fontSize: 13.5,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  navItemActivo: {
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
    color: '#ffffff',
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(29, 88, 99, 0.25)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
  },
  saludo: {
    color: '#475569',
    fontSize: 14,
  },
  logoutBtn: {
    color: '#c0564e',
    fontWeight: 600,
  },
  main: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '32px 24px 60px',
  },
};

export default PacienteLayout;