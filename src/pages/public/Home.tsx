import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Input,
  Drawer,
} from "antd";

import {
  SearchOutlined,
  VideoCameraOutlined,
  BookOutlined,
  FolderOpenOutlined,
  MailOutlined,
  EnvironmentOutlined,
  MenuOutlined,
  TeamOutlined,
  ReadOutlined,
  UserOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import Logo from "../../components/Logo";

import imgHero from "../../assets/home/hero.png";
import imgAtencion from "../../assets/home/atencion-psicologica.jpeg";
import imgAgenda from "../../assets/home/agenda-flexible.png";
import imgComunicacion from "../../assets/home/comunicacion-segura.jpeg";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const SERVICIOS_DESTACADOS = [
  {
    icono: "🧠",
    titulo: "Atención Psicológica",
    imagen: imgAtencion,
    descripcion: "Sesiones individuales con psicólogos acreditados, enfocadas en tu proceso de sanación y crecimiento personal.",
  },
  {
    icono: "📅",
    titulo: "Agenda Flexible",
    imagen: imgAgenda,
    descripcion: "Elige el día y la hora que mejor se adapte a tu rutina. Reagenda o cancela tus sesiones con facilidad.",
  },
  {
    icono: "💬",
    titulo: "Comunicación Segura",
    imagen: imgComunicacion,
    descripcion: "Todas tus conversaciones y sesiones se mantienen privadas y protegidas en todo momento.",
  },
];

// Ítems del menú principal (compartidos entre el header de escritorio y el drawer móvil)
const NAV_ITEMS = [
  { key: "servicios", label: "Servicios", path: "/servicios", icon: <TeamOutlined /> },
  { key: "recursos", label: "Recursos", path: "/recursos", icon: <ReadOutlined /> },
  { key: "profesionales", label: "Profesionales", path: "/profesionales", icon: <UserOutlined /> },
  { key: "contacto", label: "Contacto", path: "/contacto", icon: <PhoneOutlined /> },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSearch = () => {
    alert(`Buscando recursos para: ${searchQuery}`);
  };

  const goTo = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <Layout style={{ background: "#f4f9f9", fontFamily: "'Inter', sans-serif" }}>

      <style>{`
        .cm-flip-container {
          perspective: 1200px;
          height: 220px;
        }
        .cm-flip-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          border-radius: 16px;
          cursor: pointer;
        }
        .cm-flip-container:hover .cm-flip-inner {
          transform: rotateY(180deg);
        }
        .cm-flip-front, .cm-flip-back {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .cm-flip-back {
          transform: rotateY(180deg);
          background: linear-gradient(135deg, #12414a, #1d5863);
          padding: 24px;
          text-align: center;
        }

        /* ===== HEADER ===== */
        .cm-nav-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #4a5568;
          cursor: pointer;
          font-weight: 500;
          font-size: 15px;
          padding: 8px 4px;
          position: relative;
          transition: color 0.25s ease;
        }
        .cm-nav-link .cm-nav-icon {
          font-size: 15px;
          color: #4da6b0;
          transition: transform 0.25s ease;
        }
        .cm-nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0%;
          height: 2px;
          border-radius: 2px;
          background: #4da6b0;
          transition: width 0.25s ease;
        }
        .cm-nav-link:hover {
          color: #1d5863;
        }
        .cm-nav-link:hover .cm-nav-icon {
          transform: translateY(-2px);
        }
        .cm-nav-link:hover::after {
          width: 100%;
        }

        .cm-mobile-toggle {
          display: none;
        }

        .cm-header-cta {
          display: inline-flex;
        }

        @media (max-width: 900px) {
          .cm-desktop-menu {
            display: none !important;
          }
          .cm-mobile-toggle {
            display: inline-flex !important;
          }
          .cm-header-inner {
            padding: 0 20px !important;
          }
        }

        @media (max-width: 480px) {
          .cm-header-cta-text {
            display: none;
          }
        }

        .cm-drawer-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 12px;
          color: #1d5863;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .cm-drawer-link .cm-nav-icon {
          font-size: 17px;
          color: #4da6b0;
        }
        .cm-drawer-link:hover {
          background: #eef7f7;
          color: #00838f;
        }
      `}</style>

      {/* ================= HEADER (Estilo Mente Sana) ================= */}
      <Header
        className="cm-header-inner"
        style={{
          position: "fixed",
          zIndex: 999,
          width: "100%",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 2px 16px rgba(29, 88, 99, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 60px",
          height: 80,
        }}
      >
        {/* LOGO */}
        <Logo size={40} onClick={() => navigate("/")} />

        {/* MENU DE ESCRITORIO */}
        <nav
          className="cm-desktop-menu"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
            flex: 1,
            marginLeft: 40,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <span key={item.key} className="cm-nav-link" onClick={() => navigate(item.path)}>
              <span className="cm-nav-icon">{item.icon}</span>
              {item.label}
            </span>
          ))}
        </nav>

        {/* ACCIONES (Iniciar sesión + botón hamburguesa) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button
            size="large"
            className="cm-header-cta"
            onClick={() => navigate("/login")}
            style={{
              borderRadius: 20,
              height: 40,
              padding: "0 24px",
              background: "linear-gradient(135deg, #4da6b0, #00838f)",
              color: "#ffffff",
              border: "none",
              fontWeight: 600,
              fontSize: 14,
              boxShadow: "0 4px 12px rgba(77, 166, 176, 0.35)",
              alignItems: "center",
            }}
          >
            <span className="cm-header-cta-text">Iniciar Sesión</span>
          </Button>

          <Button
            className="cm-mobile-toggle"
            shape="circle"
            size="large"
            icon={<MenuOutlined style={{ fontSize: 18 }} />}
            onClick={() => setDrawerOpen(true)}
            style={{
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #cfe8ea",
              color: "#1d5863",
              background: "#ffffff",
            }}
          />
        </div>
      </Header>

      {/* DRAWER DE NAVEGACIÓN MÓVIL */}
      <Drawer
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={280}
        closeIcon={null}
        styles={{ body: { padding: 16 } }}
        title={<Logo size={32} onClick={() => goTo("/")} />}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {NAV_ITEMS.map((item) => (
            <div key={item.key} className="cm-drawer-link" onClick={() => goTo(item.path)}>
              <span className="cm-nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        <Button
          block
          size="large"
          onClick={() => goTo("/login")}
          style={{
            marginTop: 24,
            borderRadius: 20,
            height: 44,
            background: "linear-gradient(135deg, #4da6b0, #00838f)",
            color: "#ffffff",
            border: "none",
            fontWeight: 600,
            fontSize: 14,
            boxShadow: "0 4px 12px rgba(77, 166, 176, 0.35)",
          }}
        >
          Iniciar Sesión
        </Button>
      </Drawer>

      {/* ================= CONTENT ================= */}
      <Content style={{ marginTop: 80 }}>

        {/* 1. HERO SECTION */}
        <section
          style={{
            height: "75vh",
            backgroundImage: `linear-gradient(to right, rgba(29, 88, 99, 0.5), rgba(255, 255, 255, 0.1)), url(${imgHero})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "0 10%"
          }}
        >
          <div style={{ maxWidth: 600, textAlign: "left" }}>
            <Title
              style={{
                color: "#ffffff",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 52,
                fontWeight: 800,
                marginBottom: 20,
                letterSpacing: "-1px",
                lineHeight: 1.15,
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)"
              }}
            >
              Cuida tu bienestar.
              <br />
              Transforma tu vida.
            </Title>

            <Button
              size="large"
              type="primary"
              onClick={() => navigate("/login")}
              style={{
                height: 48,
                padding: "0 36px",
                borderRadius: 24,
                border: "none",
                fontWeight: 700,
                fontSize: 15,
                background: "#00838f",
                boxShadow: "0 6px 20px rgba(0, 131, 143, 0.4)"
              }}
            >
              Empieza Hoy
            </Button>
          </div>
        </section>

        {/* 2. BARRA DE BÚSQUEDA Y BIENVENIDA */}
        <section style={{ padding: "60px 20px 40px", textAlign: "center", background: "#eef7f7" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <Title level={3} style={{ color: "#1d5863", fontWeight: 700, fontSize: 24, margin: 0 }}>
              Conectamente: <span style={{ fontWeight: 400, color: "#4a5568" }}>Tu refugio para el bienestar mental.</span>
            </Title>
            <Paragraph style={{ color: "#4a5568", fontSize: 18, marginTop: 4, marginBottom: 24 }}>
              Encuentra apoyo, herramientas y guía.
            </Paragraph>

            <Input
              placeholder="¿Qué necesitas hoy? Ej. Terapia Online"
              prefix={<SearchOutlined style={{ color: "#1d5863", marginRight: 8 }} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPressEnter={handleSearch}
              style={{
                maxWidth: 550,
                height: 50,
                borderRadius: 25,
                fontSize: 16,
                boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
                border: "1px solid #cbd5e1"
              }}
            />
          </div>
        </section>

        {/* 3. GRID DE SERVICIOS */}
        <section style={{ padding: "40px 60px 80px", background: "#eef7f7" }}>
          <Row gutter={[24, 24]} justify="center" style={{ display: "flex" }}>
            
            {/* Terapia Online */}
            <Col xs={24} sm={12} md={6} style={{ display: "flex" }}>
              <Card hoverable style={styles.serviceCard}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <div style={{ ...styles.iconContainer, backgroundColor: "#1e88e5" }}>
                    <VideoCameraOutlined style={{ fontSize: 24, color: "#ffffff" }} />
                  </div>
                  <Title level={4} style={styles.cardTitle}>Terapia Online</Title>
                  <Paragraph style={styles.cardText}>
                    Terapia individual online con profesionales acreditados para tu crecimiento y sanación personal.
                  </Paragraph>
                </div>
                <Button type="primary" onClick={() => navigate('/terapias-online')} style={styles.cardButton}>
                  Conocer más
                </Button>
              </Card>
            </Col>


            {/* Únete como Psicólogo */}
            <Col xs={24} sm={12} md={6} style={{ display: "flex" }}>
              <Card hoverable style={styles.serviceCard}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <div style={{ ...styles.iconContainer, backgroundColor: "#f3a738" }}>
                    <BookOutlined style={{ fontSize: 24, color: "#ffffff" }} />
                  </div>
                  <Title level={4} style={styles.cardTitle}>Únete como Psicólogo</Title>
                  <Paragraph style={styles.cardText}>
                    Regístrate como profesional de la salud mental, gestiona tu perfil, agenda citas y brinda atención a usuarios.
                  </Paragraph>
                </div>
                <Button type="primary" onClick={() => navigate('/unete-psicologo')} style={styles.cardButton}>
                  Ser Psicólogo
                </Button>
              </Card>
            </Col>

            {/* Seguimiento y bienestar */}
            <Col xs={24} sm={12} md={6} style={{ display: "flex" }}>
              <Card hoverable style={styles.serviceCard}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <div style={{ ...styles.iconContainer, backgroundColor: "#6ba283" }}>
                    <FolderOpenOutlined style={{ fontSize: 24, color: "#ffffff" }} />
                  </div>
                  <Title level={4} style={styles.cardTitle}>Seguimiento y bienestar</Title>
                  <Paragraph style={styles.cardText}>
                    Accede a herramientas y recursos que te acompañan en tu proceso de bienestar emocional y crecimiento personal.
                  </Paragraph>
                </div>
                <Button type="primary" onClick={() => navigate('/bienestar')} style={styles.cardButton}>
                  Conocer más
                </Button>
              </Card>
            </Col>

          </Row>
        </section>

        {/* 4. RECURSOS DESTACADOS (Flip Cards con imágenes locales) */}
        <section style={{ padding: "60px 60px 100px", background: "#ffffff" }}>
          <Title level={3} style={{ textAlign: "center", color: "#1c3c42", marginBottom: 40, fontWeight: 800 }}>
            Servicios Destacados
          </Title>

          <Row gutter={[24, 24]} justify="center">

            {SERVICIOS_DESTACADOS.map((s) => (
              <Col xs={24} md={8} key={s.titulo}>
                <div className="cm-flip-container">
                  <div className="cm-flip-inner">

                    {/* CARA FRONTAL - imagen */}
                    <div
                      className="cm-flip-front"
                      style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${s.imagen})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <span style={{ fontSize: 42, marginBottom: 12 }}>{s.icono}</span>
                      <Title level={4} style={{ color: "#ffffff", margin: 0, fontWeight: 600 }}>
                        {s.titulo}
                      </Title>
                    </div>

                    {/* CARA TRASERA - información */}
                    <div className="cm-flip-back">
                      <Title level={5} style={{ color: "#ffffff", margin: "0 0 10px", fontWeight: 700 }}>
                        {s.titulo}
                      </Title>
                      <Paragraph style={{ color: "#bce3e6", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
                        {s.descripcion}
                      </Paragraph>
                    </div>

                  </div>
                </div>
              </Col>
            ))}

          </Row>
        </section>

      </Content>

      {/* ================= FOOTER (simplificado) ================= */}
      <Footer style={{ background: "#1d5863", color: "#ffffff", padding: "60px 60px 30px" }}>
        <Row gutter={[40, 32]} justify="space-between">

          {/* Columna Marca */}
          <Col xs={24} md={12}>
            

            <Paragraph 
              style={{ 
                color: "#bce3e6", 
                marginTop: 16, 
                fontSize: 15, 
                lineHeight: 1.7,
                maxWidth: 420,
              }}
            >
              Plataforma digital que conecta pacientes y profesionales de la salud mental,
              ofreciendo un espacio seguro para la atención psicológica y el acompañamiento emocional.
            </Paragraph>

            {/* Redes sociales */}
            <div style={{ marginTop: 25 }}>
              
            </div>
          </Col>

          {/* Columna Contacto */}
          <Col xs={24} md={10}>
            <Title level={5} style={{ color: "#ffffff", marginTop: 0, marginBottom: 16, fontWeight: 700 }}>
              Contacto
            </Title>

            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 12 }}>
              <a
                href="mailto:conectaMente@gmail.com"
                style={{ color: "#bce3e6", display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
              >
                <MailOutlined style={{ color:"#4da6b0", fontSize:18 }} />
                conectaMente@gmail.com
              </a>

              <span 
                style={{ 
                  color:"#bce3e6", 
                  display:"flex", 
                  alignItems:"center", 
                  gap:10 
                }}
              >
                <EnvironmentOutlined style={{ color:"#4da6b0", fontSize:18 }} />
                Quito, Ecuador
              </span>
            </div>

            <Paragraph style={{ color: "#bce3e6", fontSize: 14, marginTop: 20, marginBottom: 8 }}>
              ¿Tienes dudas sobre la plataforma?{" "}
              <span
                onClick={() => navigate("/contacto")}
                style={{ color: "#ffffff", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              >
                Escríbenos aquí
              </span>
            </Paragraph>
          </Col>

        </Row>

        {/* Copyright */}
        <div
          style={{
            marginTop: 50,
            paddingTop: 25,
            borderTop: "1px solid rgba(255,255,255,0.2)",
            textAlign: "center",
            color: "#bce3e6",
            fontSize: 14
          }}
        >
          © 2026 ConectaMente. Todos los derechos reservados.
        </div>
      </Footer>

    </Layout>
  );
};

// --- ESTILOS EN JS ---
const styles: { [key: string]: React.CSSProperties } = {
  serviceCard: {
    borderRadius: "16px",
    border: "none",
    textAlign: "center",
    padding: "24px 16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center"
  },
  iconContainer: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px"
  },
  cardTitle: {
    fontSize: "18px",
    color: "#1d5863",
    fontWeight: 700,
    marginBottom: "12px"
  },
  cardText: {
    fontSize: "13.5px",
    color: "#64748b",
    lineHeight: 1.5,
    marginBottom: "20px"
  },
  cardButton: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
    borderRadius: "25px",
    padding: "0 25px",
    height: "40px",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(33, 150, 243, 0.35)",
    marginTop: "auto"
  }
};

export default Home;