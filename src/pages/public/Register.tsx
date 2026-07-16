import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Input, Button, Alert, Row, Col } from "antd";

const Register: React.FC = () => {
  const [tipoUsuario, setTipoUsuario] = useState<"PACIENTE" | "PSICOLOGO" | null>(null);
  const [error, setError] = useState<string>("");
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    setError("");

    if (!tipoUsuario) {
      setError("Por favor, selecciona el tipo de cuenta.");
      return;
    }

    alert(`Registro exitoso como ${tipoUsuario}\nEmail: ${values.email}`);
  };

  return (
    <div style={styles.page}>
      <Row style={{ width: "100%", minHeight: "100vh" }}>
        
        {/* PANEL IZQUIERDO */}
        <Col xs={0} md={12} style={styles.leftPanel}>

          <h1 style={styles.mainTitle}>Únete a nuestra comunidad</h1>

          <p style={styles.description}>
            Crea tu cuenta y accede a una plataforma diseñada para conectar pacientes 
            y profesionales de la salud mental.
          </p>

          <div style={styles.cards}>
            <div style={styles.infoCard}>
              <span style={{ fontSize: "24px" }}>🧑‍🤝‍🧑</span>
              <strong style={styles.cardTitle}>Paciente</strong>
              <span style={styles.cardText}>
                Encuentra apoyo psicológico y agenda tus sesiones.
              </span>
            </div>

            <div style={styles.infoCard}>
              <span style={{ fontSize: "24px" }}>🧠</span>
              <strong style={styles.cardTitle}>Psicólogo</strong>
              <span style={styles.cardText}>
                Ofrece tus servicios y acompaña nuevos pacientes.
              </span>
            </div>
          </div>
        </Col>

        {/* PANEL DERECHO (FORMULARIO) */}
        <Col xs={24} md={12} style={styles.rightPanel}>
          <div style={styles.formCard}>
            <h2 style={styles.title}>Crear cuenta</h2>
            <p style={styles.subtitle}>Selecciona cómo deseas registrarte</p>

            {/* SELECCION ROL */}
            <div style={styles.roles}>
              <Button
                type="default"
                style={{
                  ...styles.roleButton,
                  background: tipoUsuario === "PACIENTE" ? "#1d5863" : "#ffffff",
                  color: tipoUsuario === "PACIENTE" ? "#ffffff" : "#1d5863",
                  borderColor: "#1d5863",
                }}
                onClick={() => setTipoUsuario("PACIENTE")}
              >
                🧑 Paciente
              </Button>

              <Button
                type="default"
                style={{
                  ...styles.roleButton,
                  background: tipoUsuario === "PSICOLOGO" ? "#1d5863" : "#ffffff",
                  color: tipoUsuario === "PSICOLOGO" ? "#ffffff" : "#1d5863",
                  borderColor: "#1d5863",
                }}
                onClick={() => setTipoUsuario("PSICOLOGO")}
              >
                🧠 Psicólogo
              </Button>
            </div>

            {/* Alerta de Error de Ant Design */}
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: 20, borderRadius: 10 }}
              />
            )}

            {/* Formulario de Ant Design */}
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
                <Input placeholder="Nombres" style={styles.antdInput} />
              </Form.Item>

              <Form.Item
                name="apellido"
                rules={[{ required: true, message: "Ingresa tu apellido" }]}
                style={{ marginBottom: 14 }}
              >
                <Input placeholder="Apellidos" style={styles.antdInput} />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Ingresa tu correo electrónico" },
                  { type: "email", message: "Ingresa un formato de correo válido" }
                ]}
                style={{ marginBottom: 14 }}
              >
                <Input placeholder="Correo electrónico" style={styles.antdInput} />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Ingresa una contraseña" }]}
                style={{ marginBottom: 14 }}
              >
                <Input.Password placeholder="Contraseña" style={styles.antdInput} />
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
                <Input.Password placeholder="Confirmar contraseña" style={styles.antdInput} />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={styles.button}
                  block
                >
                  Crear cuenta
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
    fontFamily: "'Montserrat', 'Inter', system-ui, -apple-system, sans-serif",
    background: "#eef7f7"
  },

  leftPanel: {
    // Gradiente oscuro + Imagen sutil de fondo de bosque/niebla para transmitir paz mental
    background: "linear-gradient(rgba(29, 88, 99, 0.9), rgba(15, 45, 51, 0.92)), url('https://terapygo.com/wp-content/uploads/2020/02/bienestarmental-thegem-blog-timeline-large.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "70px",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },

  mainTitle: {
    fontSize: 40,
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: 20,
    letterSpacing: "0.5px", // Mayor separación de letras
    lineHeight: "1.3" // Evita que se encimen los renglones
  },

  description: {
    fontSize: 17,
    lineHeight: 1.8,
    maxWidth: 500,
    color: "#d8eeee",
    marginBottom: 40,
    letterSpacing: "0.3px" // Letra más legible y espaciada
  },

  cards: {
    display: "flex",
    gap: 20
  },

  infoCard: {
    flex: 1,
    background: "rgba(255, 255, 255, 0.08)", // Más sutil
    backdropFilter: "blur(4px)", // Agrega un ligero desenfoque elegante
    padding: "20px",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },

  cardTitle: {
    fontSize: "16px",
    marginTop: "8px",
    letterSpacing: "0.5px",
    fontWeight: 700
  },

  cardText: {
    fontSize: "13px",
    color: "#d8eeee",
    marginTop: "6px",
    lineHeight: "1.5",
    letterSpacing: "0.2px"
  },

  rightPanel: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 40
  },

  formCard: {
    background: "#ffffff",
    padding: "45px 35px",
    borderRadius: 22,
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 15px 40px rgba(0,0,0,.08)"
  },

  title: {
    color: "#1d5863",
    fontSize: 30,
    fontWeight: 800,
    margin: 0,
    textAlign: "center",
    letterSpacing: "0.5px"
  },

  subtitle: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 20,
    letterSpacing: "0.2px"
  },

  roles: {
    display: "flex",
    gap: 12,
    marginBottom: 25
  },

  roleButton: {
    flex: 1,
    height: "45px",
    borderRadius: 12,
    fontWeight: 700,
    fontFamily: "inherit",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "14px",
    transition: "all 0.2s ease",
    letterSpacing: "0.3px"
  },

  antdInput: {
    padding: "11px 16px",
    borderRadius: 10,
    fontSize: 15,
    color: "#000000",
    textAlign: "left",
    background: "#f8fafc",
    fontFamily: "inherit",
    border: "1px solid #cbd5e1",
    letterSpacing: "0.2px"
  },

  button: {
    background: "#1d5863",
    borderColor: "#1d5863",
    color: "#ffffff",
    height: "48px",
    borderRadius: 30,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.5px"
  },

  loginText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 25,
    fontSize: "14px",
    letterSpacing: "0.2px"
  },

  link: {
    color: "#1d5863",
    fontWeight: 700,
    textDecoration: "none",
    letterSpacing: "0.2px"
  }
};

export default Register;