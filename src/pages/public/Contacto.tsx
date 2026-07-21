import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import Logo from "../../components/Logo";

// TODO: reemplaza por tu número real, formato E.164 para que el tel: funcione bien
const PHONE_NUMBER = "+593 91 426 5478";
const PHONE_HREF = "tel:+593914265478";
const EMAIL_ADDRESS = "conectaMente@gmail.com";
const EMAIL_HREF = "mailto:conectaMente@gmail.com";

const Contacto: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 768px) {
          .cm-contact-header {
            padding: 0 16px !important;
            height: 64px !important;
          }
          .cm-contact-hero {
            padding: 50px 20px !important;
          }
          .cm-contact-title {
            font-size: 32px !important;
          }
          .cm-contact-content {
            padding: 40px 16px 80px !important;
          }
        }
      `}</style>

      {/* MINI HEADER */}
      <div className="cm-contact-header" style={styles.header}>
        <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <Logo size={36} />
        </div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/")}
          style={{ color: "#1d5863", fontWeight: 500 }}
        >
          Volver al inicio
        </Button>
      </div>

      {/* HERO */}
      <section className="cm-contact-hero" style={styles.hero}>
        <div style={styles.decorCircleTop} />
        <div style={styles.decorCircleBottom} />
        <div style={styles.heroContent}>
          <h1 className="cm-contact-title" style={styles.heroTitle}>Hablemos</h1>
          <p style={styles.heroSubtitle}>
            ¿Tienes dudas sobre la plataforma o quieres saber más sobre nuestros
            servicios? Estamos aquí para acompañarte.
          </p>
        </div>
      </section>

      {/* CONTENIDO - SOLO CONTACTOS */}
      <section className="cm-contact-content" style={styles.content}>
        <Row gutter={[24, 24]} justify="center" style={{ maxWidth: 840, margin: "0 auto" }}>
          
          <Col xs={24} sm={12} style={{ display: "flex" }}>
            <a href={EMAIL_HREF} style={styles.infoCard}>
              <div style={styles.infoIcon}>
                <MailOutlined style={{ fontSize: 20, color: "#ffffff" }} />
              </div>
              <div style={styles.infoTextContainer}>
                <span style={styles.infoLabel}>Correo electrónico</span>
                <span style={styles.infoValue}>{EMAIL_ADDRESS}</span>
              </div>
            </a>
          </Col>

          <Col xs={24} sm={12} style={{ display: "flex" }}>
            <a href={PHONE_HREF} style={styles.infoCard}>
              <div style={styles.infoIcon}>
                <PhoneOutlined style={{ fontSize: 20, color: "#ffffff" }} />
              </div>
              <div style={styles.infoTextContainer}>
                <span style={styles.infoLabel}>Teléfono</span>
                <span style={styles.infoValue}>{PHONE_NUMBER}</span>
              </div>
            </a>
          </Col>

          <Col xs={24} sm={12} style={{ display: "flex" }}>
            <div style={{ ...styles.infoCard, cursor: "default" }}>
              <div style={styles.infoIcon}>
                <EnvironmentOutlined style={{ fontSize: 20, color: "#ffffff" }} />
              </div>
              <div style={styles.infoTextContainer}>
                <span style={styles.infoLabel}>Ubicación</span>
                <span style={styles.infoValue}>Quito, Ecuador</span>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} style={{ display: "flex" }}>
            <div style={{ ...styles.infoCard, cursor: "default" }}>
              <div style={styles.infoIcon}>
                <ClockCircleOutlined style={{ fontSize: 20, color: "#ffffff" }} />
              </div>
              <div style={styles.infoTextContainer}>
                <span style={styles.infoLabel}>Horario de atención</span>
                <span style={styles.infoValue}>Lunes a viernes, 8:00 - 18:00</span>
              </div>
            </div>
          </Col>

        </Row>
      </section>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "#f4f9f9",
    fontFamily: "'Inter', sans-serif",
    width: "100%",
    overflowX: "hidden",
  },
  header: {
    height: 72,
    background: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 60px",
    width: "100%",
    boxSizing: "border-box",
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(160deg, #1d5863 0%, #164048 100%)",
    padding: "70px 60px",
    textAlign: "center",
  },
  decorCircleTop: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "rgba(77, 166, 176, 0.18)",
  },
  decorCircleBottom: {
    position: "absolute",
    bottom: -120,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.05)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: 600,
    margin: "0 auto",
  },
  heroTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 42,
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "-1px",
    margin: 0,
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 16.5,
    lineHeight: 1.7,
    color: "#c8e6e9",
    margin: 0,
  },
  content: {
    padding: "60px 60px 100px",
    boxSizing: "border-box",
    width: "100%",
  },
  infoCard: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "#ffffff",
    borderRadius: 18,
    padding: "24px 22px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
    textDecoration: "none",
    transition: "transform 0.2s ease",
    height: "100%",
    width: "100%",
    boxSizing: "border-box",
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "#1d5863",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoTextContainer: {
    minWidth: 0,
    overflow: "hidden",
  },
  infoLabel: {
    display: "block",
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 3,
  },
  infoValue: {
    display: "block",
    fontSize: 15,
    fontWeight: 600,
    color: "#1d5863",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};

export default Contacto;