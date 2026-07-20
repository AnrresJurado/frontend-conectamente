import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div onClick={() => navigate('/mi-espacio')} style={{ cursor: 'pointer' }}>
          <Logo size={36} textColor={COLORS.primary} accentColor={COLORS.accent} />
        </div>

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
    height: 72,
    background: '#ffffff',
    borderBottom: `1px solid ${COLORS.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
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