import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Input, Button, message } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import Logo from "../../components/Logo";

const { TextArea } = Input;

// TODO: reemplaza por tu número real, formato E.164 para que el tel: funcione bien
const PHONE_NUMBER = "+593 99 999 9999";
const PHONE_HREF = "tel:+593999999999";
const EMAIL_ADDRESS = "conectaMente@gmail.com";
const EMAIL_HREF = "mailto:conectaMente@gmail.com";

const Contacto: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: conectar con tu endpoint real, ej: await api.post('/contacto', form)
      await new Promise((res) => setTimeout(res, 800));
      message.success(`Gracias por escribirnos, ${form.name}. Nos pondremos en contacto contigo pronto.`);
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error(error);
      message.error("No pudimos enviar tu mensaje. Inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* MINI HEADER */}
      <div style={styles.header}>
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
      <section style={styles.hero}>
        <div style={styles.decorCircleTop} />
        <div style={styles.decorCircleBottom} />
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Hablemos</h1>
          <p style={styles.heroSubtitle}>
            ¿Tienes dudas sobre la plataforma o quieres saber más sobre nuestros
            servicios? Estamos aquí para acompañarte.
          </p>
        </div>
      </section>

      {/* CONTENIDO */}
      <section style={styles.content}>
        <Row gutter={[40, 40]} justify="center" style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* COLUMNA INFO */}
          <Col xs={24} md={9}>
            <div style={styles.infoStack}>

              <a href={EMAIL_HREF} style={styles.infoCard}>
                <div style={styles.infoIcon}>
                  <MailOutlined style={{ fontSize: 20, color: "#ffffff" }} />
                </div>
                <div>
                  <span style={styles.infoLabel}>Correo electrónico</span>
                  <span style={styles.infoValue}>{EMAIL_ADDRESS}</span>
                </div>
              </a>

              <a href={PHONE_HREF} style={styles.infoCard}>
                <div style={styles.infoIcon}>
                  <PhoneOutlined style={{ fontSize: 20, color: "#ffffff" }} />
                </div>
                <div>
                  <span style={styles.infoLabel}>Teléfono</span>
                  <span style={styles.infoValue}>{PHONE_NUMBER}</span>
                </div>
              </a>

              <div style={{ ...styles.infoCard, cursor: "default" }}>
                <div style={styles.infoIcon}>
                  <EnvironmentOutlined style={{ fontSize: 20, color: "#ffffff" }} />
                </div>
                <div>
                  <span style={styles.infoLabel}>Ubicación</span>
                  <span style={styles.infoValue}>Quito, Ecuador</span>
                </div>
              </div>

              <div style={{ ...styles.infoCard, cursor: "default" }}>
                <div style={styles.infoIcon}>
                  <ClockCircleOutlined style={{ fontSize: 20, color: "#ffffff" }} />
                </div>
                <div>
                  <span style={styles.infoLabel}>Horario de atención</span>
                  <span style={styles.infoValue}>Lunes a viernes, 8:00 - 18:00</span>
                </div>
              </div>

            </div>
          </Col>

          {/* COLUMNA FORMULARIO */}
          <Col xs={24} md={15}>
            <div style={styles.formCard}>
              <h2 style={styles.formTitle}>Envíanos un mensaje</h2>
              <p style={styles.formSubtitle}>
                Completa el formulario y te responderemos a la brevedad.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Row gutter={12}>
                  <Col xs={24} sm={12}>
                    <Input
                      placeholder="Tu nombre"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={styles.input}
                      disabled={loading}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Input
                      type="email"
                      placeholder="Tu correo"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      style={styles.input}
                      disabled={loading}
                    />
                  </Col>
                </Row>

                <TextArea
                  rows={5}
                  placeholder="Escribe tu mensaje..."
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  style={styles.textarea}
                  disabled={loading}
                />

                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  loading={loading}
                  style={styles.submitButton}
                >
                  {loading ? "Enviando..." : "Enviar mensaje"}
                </Button>
              </form>
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
  },
  header: {
    height: 72,
    background: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 60px",
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
  },
  infoStack: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  infoCard: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "#ffffff",
    borderRadius: 18,
    padding: "20px 22px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
    textDecoration: "none",
    transition: "transform 0.2s ease",
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
  },
  formCard: {
    background: "#ffffff",
    borderRadius: 24,
    padding: "40px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
  },
  formTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 24,
    fontWeight: 800,
    color: "#1d5863",
    margin: 0,
    marginBottom: 6,
  },
  formSubtitle: {
    color: "#64748b",
    fontSize: 15,
    marginBottom: 26,
  },
  input: {
    height: 46,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    fontSize: 14,
  },
  textarea: {
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    resize: "none",
  },
  submitButton: {
    alignSelf: "flex-start",
    height: 48,
    padding: "0 32px",
    borderRadius: 24,
    background: "#00838f",
    borderColor: "#00838f",
    fontWeight: 700,
    fontSize: 15,
    boxShadow: "0 8px 20px rgba(0, 131, 143, 0.3)",
  },
};

export default Contacto;