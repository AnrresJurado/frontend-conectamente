import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button, Space, Drawer } from 'antd';
import {
  LogoutOutlined,
  HomeOutlined,
  UserOutlined,
  MessageOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  HeartOutlined,
  MenuOutlined,
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

export const PacienteLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleNavClick = (key: string) => {
    navigate(key);
    setMobileMenuOpen(false);
  };

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 1024px) {
          .nav-desktop-paciente { display: none !important; }
          .menu-burger-paciente { display: inline-flex !important; }
        }
        @media (max-width: 640px) {
          .saludo-paciente { display: none !important; }
        }
      `}</style>

      <header style={styles.header}>
        <div
          onClick={() => navigate('/mi-espacio')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Logo size={36} textColor={COLORS.primary} accentColor={COLORS.accent} />
        </div>

        {/* Navegación para pantallas medianas/grandes */}
        <nav className="nav-desktop-paciente" style={styles.navDesktop}>
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
          <span className="saludo-paciente" style={styles.saludo}>
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

          {/* Botón de Menú Hamburguesa para Móvil */}
          <Button
            type="text"
            className="menu-burger-paciente"
            icon={<MenuOutlined style={{ fontSize: 20 }} />}
            onClick={() => setMobileMenuOpen(true)}
            style={styles.menuBurgerBtn}
          />
        </div>
      </header>

      {/* Drawer para Móviles */}
      <Drawer
        title={<Logo size={30} textColor={COLORS.primary} accentColor={COLORS.accent} />}
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ body: { padding: '16px 0' } }}
      >
        <div style={styles.mobileNavContainer}>
          {menuItems.map((item) => {
            const activo = location.pathname === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                style={{
                  ...styles.mobileNavItem,
                  ...(activo ? styles.mobileNavItemActivo : {}),
                }}
              >
                <span style={{ fontSize: 18, display: 'flex' }}>{item.icon}</span>
                <span style={{ fontSize: 15 }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </Drawer>

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
    padding: '12px 24px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  navDesktop: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: '0 16px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    borderRadius: 10,
    border: 'none',
    background: 'transparent',
    color: '#475569',
    fontWeight: 500,
    fontSize: 13,
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
    gap: 12,
  },
  saludo: {
    color: '#475569',
    fontSize: 14,
  },
  logoutBtn: {
    color: '#c0564e',
    fontWeight: 600,
  },
  menuBurgerBtn: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileNavContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '0 12px',
  },
  mobileNavItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 10,
    border: 'none',
    background: 'transparent',
    color: '#475569',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'background 0.2s',
  },
  mobileNavItemActivo: {
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
    color: '#ffffff',
    fontWeight: 600,
  },
  main: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '32px 20px 60px',
  },
};

export default PacienteLayout;