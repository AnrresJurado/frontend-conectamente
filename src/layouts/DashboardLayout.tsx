import React, { useState, useEffect } from 'react'; 
import { Layout, Avatar, Space, Drawer } from 'antd'; 
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  DashboardOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  LogoutOutlined, 
  TeamOutlined, 
  ScheduleOutlined, 
  MessageOutlined, 
  SolutionOutlined, 
  InboxOutlined,
  FileTextOutlined, 
  ExperimentOutlined, 
  HeartOutlined,
  MenuOutlined
} from '@ant-design/icons'; 
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'; 
import { useAuth } from '../hooks/useAuth'; 
import Logo from '../components/Logo'; 
import NotificationBell from '../components/NotificationBell'; 

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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 400);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);

  const { user, logout } = useAuth(); 
  const navigate = useNavigate(); 
  const location = useLocation(); 

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      const tablet = width > 768 && width <= 1024;
      setIsMobile(mobile);
      setIsSmallMobile(width <= 400);
      setIsTablet(tablet);
      if (!mobile) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-colapsa el sidebar al entrar en rango tablet
  useEffect(() => {
    if (isTablet) {
      setCollapsed(true);
    }
  }, [isTablet]);

  const handleLogout = () => { 
    logout(); 
    navigate('/login'); 
  }; 

  if (!user) return <Navigate to="/login" replace />; 

  const menuItems = [ 
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' }, 
    ...(user?.rol === 'ADMIN' || user?.rol === 'PSICOLOGO' ? [{ key: '/dashboard/pacientes', icon: <UserOutlined />, label: 'Pacientes' }] : []), 
    ...(user?.rol === 'ADMIN' || user?.rol === 'PSICOLOGO' ? [{ key: '/dashboard/solicitudes', icon: <InboxOutlined />, label: 'Bandeja Solicitudes' }] : []), 
    ...(user?.rol === 'ADMIN' ? [{ key: '/dashboard/psicologos', icon: <TeamOutlined />, label: 'Psicólogos' }] : []), 
    ...(user?.rol === 'ADMIN' ? [{ key: '/dashboard/solicitudes-psicologos', icon: <SolutionOutlined />, label: 'Postulaciones Psicólogos' }] : []), 
    ...(user?.rol === 'ADMIN' ? [{ key: '/dashboard/usuarios', icon: <TeamOutlined />, label: 'Control de Usuarios' }] : []), 
    { key: '/dashboard/citas', icon: <CalendarOutlined />, label: 'Citas' }, 
    ...(user?.rol === 'PACIENTE' || user?.rol === 'PSICOLOGO' ? [{ key: '/dashboard/chats', icon: <MessageOutlined />, label: 'Chats' }] : []), 
    ...(user?.rol === 'ADMIN' || user?.rol === 'PSICOLOGO' ? [{ key: '/dashboard/agenda', icon: <ScheduleOutlined />, label: 'Mi Agenda' }] : []),
    ...(user?.rol === 'ADMIN' || user?.rol === 'PSICOLOGO' ? [{ key: '/dashboard/encuestas', icon: <FileTextOutlined />, label: 'Encuestas' }] : []),
    ...(user?.rol === 'ADMIN' || user?.rol === 'PSICOLOGO' ? [{ key: '/dashboard/tests-psicometricos', icon: <ExperimentOutlined />, label: 'Tests Psicométricos' }] : []), 
    ...(user?.rol === 'ADMIN' || user?.rol === 'PSICOLOGO' ? [{ key: '/dashboard/recomendaciones', icon: <HeartOutlined />, label: 'Recomendaciones' }] : []), 
  ]; 

  const iniciales = `${user?.nombre?.charAt(0) || ''}${user?.apellido?.charAt(0) || ''}`.toUpperCase() || 'CM'; 

  const renderNavContent = (isDrawer = false) => (
    <>
      <div style={{ ...styles.logoBlock, height: isMobile ? 64 : 80 }}> 
        <Logo size={!isDrawer && collapsed ? 34 : 34} showText={isDrawer || !collapsed} textColor={COLORS.primary} accentColor={COLORS.accent} /> 
      </div> 
      <nav style={{ ...styles.nav, padding: isMobile ? 12 : 16 }}> 
        {menuItems.map((item) => { 
          const activo = location.pathname === item.key; 
          return ( 
            <button 
              key={item.key} 
              onClick={() => {
                navigate(item.key);
                if (isDrawer) setMobileDrawerOpen(false);
              }} 
              style={{ 
                ...styles.navItem, 
                ...(activo ? styles.navItemActivo : {}), 
                justifyContent: !isDrawer && collapsed ? 'center' : 'flex-start', 
                padding: isDrawer ? '12px 16px' : styles.navItem.padding,
              }} 
            > 
              <span style={{ fontSize: 17, display: 'flex', flexShrink: 0 }}>{item.icon}</span> 
              {(isDrawer || !collapsed) && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>} 
            </button> 
          ); 
        })} 
      </nav> 
      <div style={isDrawer ? styles.logoutWrapperDrawer : styles.logoutWrapper}> 
        <button onClick={handleLogout} style={styles.logoutButton}> 
          <LogoutOutlined style={{ fontSize: 16 }} /> 
          {(isDrawer || !collapsed) && <span>Cerrar Sesión</span>} 
        </button> 
      </div> 
    </>
  );

  return ( 
    <Layout style={{ minHeight: '100vh', background: COLORS.bg }}> 
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed} 
          width={260} 
          style={{ background: '#ffffff', borderRight: `1px solid ${COLORS.border}`, position: 'relative' }} 
        > 
          {renderNavContent(false)}
        </Sider> 
      )}

      {isMobile && (
        <Drawer
          placement="left"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          closable={false}
          bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
          width={Math.min(280, Math.floor(window.innerWidth * 0.85))}
        >
          {renderNavContent(true)}
        </Drawer>
      )}

      <Layout style={{ background: 'transparent', minWidth: 0 }}> 
        <Header style={{ ...styles.header, padding: isMobile ? '0 12px' : '0 16px' }}> 
          <button 
            onClick={() => {
              if (isMobile) {
                setMobileDrawerOpen(true);
              } else {
                setCollapsed(!collapsed);
              }
            }} 
            style={styles.collapseButton} 
            aria-label="Alternar menú" 
          > 
            {isMobile ? <MenuOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)} 
          </button> 
          <Space size={isMobile ? 8 : 16} align="center" style={{ justifyContent: 'flex-end', minWidth: 0, flexShrink: 1 }}> 
            <NotificationBell /> 
            {!isSmallMobile && (
              <div style={styles.userInfoContainer}> 
                <div style={{ ...styles.userName, fontSize: isMobile ? 13 : 14 }}>
                  {user?.nombre} {user?.apellido}
                </div> 
                {!isMobile && <div style={styles.userRol}>{user?.rol}</div>}
              </div>
            )} 
            <Avatar size={isMobile ? 32 : 40} style={styles.avatar}> 
              {iniciales} 
            </Avatar> 
          </Space> 
        </Header> 
        <Content style={{ overflowY: 'auto', overflowX: 'hidden', padding: isMobile ? '12px' : '24px' }}> 
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
    overflowY: 'auto',
    flex: 1,
    paddingBottom: '90px',
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
    background: '#ffffff',
  }, 
  logoutWrapperDrawer: { 
    position: 'absolute', 
    bottom: 20, 
    width: '100%', 
    padding: '0 16px', 
    background: '#ffffff',
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
    padding: '0 16px', 
    background: '#ffffff', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderBottom: `1px solid ${COLORS.border}`, 
    boxShadow: 'none', 
    height: 'auto',
    minHeight: 64,
    flexWrap: 'nowrap',
    gap: 8,
  }, 
  collapseButton: { 
    border: 'none', 
    background: 'transparent', 
    fontSize: 17, 
    color: COLORS.primary, 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    padding: '8px 0',
    flexShrink: 0,
  }, 
  userInfoContainer: {
    textAlign: 'right',
    display: 'block',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userName: { 
    fontFamily: "'Plus Jakarta Sans', sans-serif", 
    fontWeight: 700, 
    color: COLORS.primary, 
    fontSize: 14, 
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 180,
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
    flexShrink: 0,
  }, 
}; 

export default DashboardLayout;