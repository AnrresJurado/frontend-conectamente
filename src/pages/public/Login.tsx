import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // Consumo real de la API
      await login(email, password);
      
      // Redirección al área privada
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError("Credenciales inválidas. Por favor, verifica tu correo y contraseña.");
      } else {
        setError("Error de conexión con el servidor. Inténtalo más tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* PANEL IZQUIERDO */}
      <section style={styles.leftPanel}>

        <div style={styles.brand}>
          <span style={styles.logoEmoji}>🧠</span>
          <span style={styles.brandName}>
            ConectaMente
          </span>
        </div>

        <p style={styles.description}>
          Conecta con profesionales de la salud mental,
          agenda tus sesiones y encuentra acompañamiento
          personalizado en cada etapa de tu proceso.
        </p>

        <div style={styles.features}>

          <div style={styles.feature}>
            <span style={styles.check}>✓</span>
            Psicólogos especializados
          </div>

          <div style={styles.feature}>
            <span style={styles.check}>✓</span>
            Atención segura y personalizada
          </div>

          <div style={styles.feature}>
            <span style={styles.check}>✓</span>
            Seguimiento de tu proceso emocional
          </div>

        </div>

        <div style={styles.messageCard}>
          <p>
            "Un espacio donde cuidar tu mente es nuestra prioridad."
          </p>
        </div>

      </section>

      {/* PANEL DERECHO */}
      <section style={styles.rightPanel}>

        <div style={styles.formCard}>

          <h2 style={styles.title}>
            Bienvenido
          </h2>

          <p style={styles.subtitle}>
            Ingresa a tu cuenta para continuar
          </p>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <form 
            onSubmit={handleSubmit}
            style={styles.form}
          >

            <div style={styles.group}>
              <label style={styles.label}>
                Correo electrónico
              </label>

              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.inputEmail}
                disabled={loading}
              />
            </div>

            <div style={styles.group}>

              <div style={styles.passwordHeader}>
                <label style={styles.label}>
                  Contraseña
                </label>

                <a href="#" style={styles.forgot}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.inputPassword}
                disabled={loading}
              />

            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Ingresar a ConectaMente"}
            </button>

          </form>

          <p style={styles.register}>
            ¿Aún no tienes una cuenta?{" "}
            <Link to="/register" style={styles.link}>
              Crear cuenta
            </Link>
          </p>

        </div>

      </section>

    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Montserrat', 'Inter', system-ui, -apple-system, sans-serif",
    background: "#ffffff",
    width: "100%"
  },

  leftPanel: {
    flex: 1,
    background: "linear-gradient(135deg,#1d5863,#2c7a85)",
    color: "#ffffff",
    padding: "70px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 60
  },

  logoEmoji: {
    fontSize: "36px",
    lineHeight: "1",
    display: "flex",
    alignItems: "center"
  },

  brandName: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.5px",
    display: "flex",
    alignItems: "center"
  },

  mainTitle: {
    fontSize: 42,
    lineHeight: 1.2,
    margin: 0,
    marginBottom: 25,
    fontWeight: 800
  },

  description: {
    maxWidth: 520,
    fontSize: 17,
    lineHeight: 1.7,
    color: "#d7edef"
  },

  features: {
    marginTop: 40,
    display: "flex",
    flexDirection: "column",
    gap: 18
  },

  feature: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 16
  },

  check: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#4da6b0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 700
  },

  messageCard: {
    marginTop: 45,
    background: "rgba(255,255,255,0.15)",
    padding: 20,
    borderRadius: 16,
    maxWidth: 350
  },

  rightPanel: {
    flex: 1,
    background: "#eef7f7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 40
  },

  formCard: {
    background: "#ffffff",
    width: "100%",
    maxWidth: 440,
    padding: "45px 35px",
    borderRadius: 22,
    boxShadow: "0 15px 40px rgba(0,0,0,0.08)"
  },

  title: {
    color: "#1d5863",
    fontSize: 32,
    marginBottom: 8,
    fontWeight: 800,
    textAlign: "center"
  },

  subtitle: {
    color: "#64748b",
    marginBottom: 30,
    textAlign: "center"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20
  },

  group: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },

  label: {
    fontSize: 14,
    fontWeight: 600,
    color: "#334155",
    textAlign: "left"
  },

  passwordHeader: {
    display: "flex",
    justifyContent: "space-between"
  },

  forgot: {
    color: "#1d5863",
    fontSize: 13,
    textDecoration: "none"
  },

  inputEmail: {
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#f8fafc",
    fontSize: 15,
    outline: "none",
    color: "#000000",
    textAlign: "left",
    fontFamily: "inherit"
  },

  inputPassword: {
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#f8fafc",
    fontSize: 15,
    outline: "none",
    color: "#000000",
    fontFamily: "inherit"
  },

  button: {
    marginTop: 10,
    padding: 15,
    borderRadius: 30,
    border: "none",
    background: "#1d5863",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "inherit",
    transition: "background 0.2s ease"
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    textAlign: "center"
  },

  register: {
    textAlign: "center",
    marginTop: 25,
    color: "#64748b",
    fontSize: "14px"
  },

  link: {
    color: "#1d5863",
    fontWeight: 700,
    textDecoration: "none"
  }
};

export default Login;
import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd'; 
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Función que se ejecuta cuando el usuario pasa las validaciones visuales de Antd
  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      // Consumo real acoplado a nuestro AuthContext
      await login(values.email, values.password);
      message.success('¡Inicio de sesión exitoso! Bienvenido al sistema.');
      
      // Redirección inmediata al área privada protegida
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      // Manejo de errores dinámico según la respuesta del backend
      if (error.response && error.response.status === 401) {
        message.error('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
      } else {
        message.error('Error de conexión con el servidor. Inténtalo más tarde.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#f0f2f5' 
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>ConectaMente</Title>
          <Text type="secondary">Plataforma de Gestión Integral de Transportes y Salud</Text>
        </div>

        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          {/* Campo Email con validaciones integradas de Antd */}
          <Form.Item
            name="email"
            label="Correo Electrónico"
            rules={[
              { required: true, message: 'Por favor, ingresa tu correo electrónico.' },
              { type: 'email', message: 'El formato del correo no es válido.' }
            ]}
          >
            <Input 
              prefix={<MailOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />} 
              placeholder="ejemplo@ute.edu.ec" 
              size="large"
            />
          </Form.Item>

          {/* Campo Contraseña */}
          <Form.Item
            name="password"
            label="Contraseña"
            rules={[
              { required: true, message: 'Por favor, ingresa tu contraseña.' },
              { min: 8, message: 'La contraseña debe tener al menos 8 caracteres.' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="••••••••••••"
              size="large"
            />
          </Form.Item>

          {/* Botón de Envío con indicador de carga */}
          <Form.Item style={{ marginTop: 32, marginBottom: 16 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large" 
              loading={submitting}
            >
              Iniciar Sesión
            </Button>
          </Form.Item>

          {/* Enlace dinámico a la pantalla de registro público */}
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
            </Text>
          </div>
        </Form>
      </Card>
>>>>>>> 838cd519bc437b571eed7e3f6d22fd6820e0ab4e
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Montserrat', 'Inter', system-ui, -apple-system, sans-serif",
    background: "#ffffff"
  },

  leftPanel: {
    flex: 1,
    background: "linear-gradient(135deg,#1d5863,#2c7a85)",
    color: "#ffffff",
    padding: "70px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 60
  },

  logoEmoji: {
    fontSize: "36px",
    lineHeight: "1",
    display: "flex",
    alignItems: "center"
  },

  brandName: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.5px",
    display: "flex",
    alignItems: "center"
  },

  mainTitle: {
    fontSize: 42,
    lineHeight: 1.2,
    margin: 0,
    marginBottom: 25,
    fontWeight: 800
  },

  description: {
    maxWidth: 520,
    fontSize: 17,
    lineHeight: 1.7,
    color: "#d7edef"
  },

  features: {
    marginTop: 40,
    display: "flex",
    flexDirection: "column",
    gap: 18
  },

  feature: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 16
  },

  check: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#4da6b0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 700
  },

  messageCard: {
    marginTop: 45,
    background: "rgba(255,255,255,0.15)",
    padding: 20,
    borderRadius: 16,
    maxWidth: 350
  },

  rightPanel: {
    flex: 1,
    background: "#eef7f7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 40
  },

  formCard: {
    background: "#ffffff",
    width: "100%",
    maxWidth: 440,
    padding: "45px 35px",
    borderRadius: 22,
    boxShadow: "0 15px 40px rgba(0,0,0,0.08)"
  },

  title: {
    color: "#1d5863",
    fontSize: 32,
    marginBottom: 8,
    fontWeight: 800,
    textAlign: "center"
  },

  subtitle: {
    color: "#64748b",
    marginBottom: 30,
    textAlign: "center"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20
  },

  group: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },

  label: {
    fontSize: 14,
    fontWeight: 600,
    color: "#334155",
    textAlign: "left" // Asegura alineación a la izquierda
  },

  passwordHeader: {
    display: "flex",
    justifyContent: "space-between"
  },

  forgot: {
    color: "#1d5863",
    fontSize: 13,
    textDecoration: "none"
  },

  inputEmail: {
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#f8fafc",
    fontSize: 15,
    outline: "none",
    color: "#000000", // Escribe en negro
    textAlign: "left", // Escribe desde la izquierda
    fontFamily: "inherit"
  },

  inputPassword: {
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#f8fafc",
    fontSize: 15,
    outline: "none",
    color: "#000000", // Escribe en negro
    fontFamily: "inherit"
  },

  button: {
    marginTop: 10,
    padding: 15,
    borderRadius: 30,
    border: "none",
    background: "#1d5863",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.2s ease"
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    textAlign: "center"
  },

  register: {
    textAlign: "center",
    marginTop: 25,
    color: "#64748b",
    fontSize: "14px"
  },

  link: {
    color: "#1d5863",
    fontWeight: 700,
    textDecoration: "none"
  }
};

export default Login;