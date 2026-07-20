import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Alert, Row, Col, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import api from "../../api/axiosConfig";
import Logo from "../../components/Logo";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setError("");
    setLoading(true);
    
    try {
      // 🎯 FORZADO HERMÉTICO: Todo registro público es única y exclusivamente un PACIENTE
      await api.post("/usuarios", {
        nombre: values.nombre,
        apellido: values.apellido,
        email: values.email,
        password: values.password,
        rol: "PACIENTE",
      });

      message.success("¡Cuenta creada con éxito! Ya puedes iniciar sesión.");
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        setError("El correo electrónico ya está registrado en la plataforma.");
      } else {
        setError("Error al comunicarse con el servidor. Inténtalo más tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Row style={{ width: "100%", minHeight: "100vh" }}>

        {/* PANEL IZQUIERDO */}
        <Col xs={0} md={12} style={styles.leftPanel}>
          <div style={styles.decorCircleTop} />
          <div style={styles.decorCircleBottom} />

          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/")}
            style={styles.backButtonLeft}
          >
            Volver al inicio
          </Button>

          <div style={styles.leftContent}>
            <div style={{ marginBottom: 44 }}>
              <Logo size={44} textColor="#ffffff" accentColor="#a8dde2" onClick={() => navigate("/")} />
            </div>

            <h1 style={styles.mainTitle}>Únete a nuestra comunidad</h1>

            <p style={styles.description}>
              Crea tu cuenta de paciente y accede a una plataforma diseñada para conectar de forma segura 
              con profesionales especializados de la salud mental.
            </p>

            <div style={styles.cards}>
              <div style={styles.infoCard}>
                <span style={{ fontSize: "24px" }}>🌱</span>
                <strong style={styles.cardTitle}>Tu Bienestar Emocional</strong>
                <span style={styles.cardText}>
                  Encuentra el especialista ideal para ti, gestiona citas y lleva el control de tu progreso personal.
                </span>
              </div>
            </div>
          </div>
        </Col>

        {/* PANEL DERECHO (FORMULARIO) */}
        <Col xs={24} md={12} style={styles.rightPanel}>
          <div style={styles.formCard}>
            <h2 style={styles.title}>Crear cuenta</h2>
            <p style={styles.subtitle}>Regístrate como paciente para comenzar tu proceso</p>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: 20, borderRadius: 14 }}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
            >
              <Form.Item
                name="nombre"
                rules={[{ required: true, message: "Ingresa tu nombre" }]}
                style={{ marginBottom: 14 }}
              >
                <Input placeholder="Nombres" style={styles.antdInput} disabled={loading} />
              </Form.Item>

              <Form.Item
                name="apellido"
                rules={[{ required: true, message: "Ingresa tu apellido" }]}
                style={{ marginBottom: 14 }}
              >
                <Input placeholder="Apellidos" style={styles.antdInput} disabled={loading} />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Ingresa tu correo electrónico" },
                  { type: "email", message: "Ingresa un formato de correo válido" }
                ]}
                style={{ marginBottom: 14 }}
              >
                <Input placeholder="Correo electrónico" style={styles.antdInput} disabled={loading} />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Ingresa una contraseña" },
                  { min: 8, message: "La contraseña debe tener al menos 8 caracteres" }
                ]}
                style={{ marginBottom: 14 }}
              >
                <Input.Password placeholder="Contraseña" style={styles.antdInput} disabled={loading} />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                style={{ marginBottom: 20 }}
                rules={[
                  { required: true, message: "Confirma tu contraseña" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Las contraseñas no coinciden."));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirmar contraseña" style={styles.antdInput} disabled={loading} />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    ...styles.button,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                  loading={loading}
                  block
                >
                  {loading ? "Creando cuenta..." : "Registrarme"}
                </Button>
              </Form.Item>
            </Form>

            <p style={styles.loginText}>
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" style={styles.link}>
                Inicia sesión
              </Link>
            </p>
          </div>
        </Col>

      </Row>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    background: "#f4f9f9"
  },
  leftPanel: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(160deg, #1d5863 0%, #164048 100%)",
    padding: "70px",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  decorCircleTop: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: "50%",
    background: "rgba(77, 166, 176, 0.18)",
  },
  decorCircleBottom: {
    position: "absolute",
    bottom: -140,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.05)",
  },
  backButtonLeft: {
    position: "absolute",
    top: 24,
    left: 24,
    zIndex: 2,
    color: "#ffffff",
    fontWeight: 500,
  },
  leftContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: 480,
  },
  mainTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 40,
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: 18,
    letterSpacing: "-1px",
    lineHeight: 1.2
  },
  description: {
    fontSize: 16.5,
    lineHeight: 1.8,
    color: "#c8e6e9",
    marginBottom: 36,
  },
  cards: {
    display: "flex",
    gap: 16,
  },
  infoCard: {
    flex: 1,
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(4px)",
    padding: "24px",
    borderRadius: 18,
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgba(255, 255, 255, 0.12)"
  },
  cardTitle: {
    fontSize: "16px",
    marginTop: "12px",
    letterSpacing: "0.2px",
    fontWeight: 700,
    color: "#ffffff",
  },
  cardText: {
    fontSize: "13.5px",
    color: "#d8eeee",
    marginTop: "6px",
    lineHeight: "1.6",
  },
  rightPanel: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    background: "#f4f9f9",
  },
  formCard: {
    background: "#ffffff",
    padding: "48px 40px",
    borderRadius: 24,
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 20px 50px rgba(29, 88, 99, 0.08)",
    border: "1px solid #eef2f2",
  },
  title: {
    color: "#1d5863",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
    textAlign: "center",
  },
  subtitle: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 32,
    fontSize: 15,
  },
  antdInput: {
    padding: "12px 18px",
    borderRadius: 25,
    fontSize: 15,
    color: "#000000",
    textAlign: "left",
    background: "#f8fafc",
    fontFamily: "inherit",
    border: "1px solid #cbd5e1",
  },
  button: {
    background: "#00838f",
    borderColor: "#00838f",
    color: "#ffffff",
    height: "50px",
    borderRadius: 25,
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "inherit",
    boxShadow: "0 8px 20px rgba(0, 131, 143, 0.3)",
  },
  loginText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 26,
    fontSize: "14px",
  },
  link: {
    color: "#1d5863",
    fontWeight: 700,
    textDecoration: "none",
  }
};

export default Register;