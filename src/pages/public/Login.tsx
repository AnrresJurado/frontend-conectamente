import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Logo from "../../components/Logo";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";

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
      // Llamamos a la función login del hook (asumiendo que puede retornar la respuesta del backend)
      const response: any = await login(email, password);
      
      // Obtenemos el rol utilizando las mismas variables y propiedades que maneja tu backend (rol)
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = response?.rol || response?.user?.rol || storedUser?.rol;

      // REDIRECCIÓN CONDICIONAL SEGÚN EL ROL DE PACIENTE VS PSICÓLOGO/ADMIN
      if (userRole === 'PACIENTE') {
        navigate('/mi-espacio');
      } else {
        navigate('/dashboard');
      }
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
        {/* Formas decorativas de fondo */}
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
          <div onClick={() => navigate("/")} style={{ cursor: "pointer", width: "fit-content" }}>
            <Logo size={44} textColor="#ffffff" accentColor="#a8dde2" />
          </div>

          <h1 style={styles.heroTitle}>
            Cuida tu bienestar,
            <br />
            un paso a la vez.
          </h1>

          <p style={styles.description}>
            Conecta con profesionales de la salud mental, agenda tus sesiones
            y encuentra acompañamiento personalizado en cada etapa de tu proceso.
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
            <p style={styles.messageText}>
              "Un espacio donde cuidar tu mente es nuestra prioridad."
            </p>
          </div>
        </div>
      </section>

      {/* PANEL DERECHO */}
      <section style={styles.rightPanel}>
        <div style={styles.formCard}>
          <h2 style={styles.title}>Bienvenido de nuevo</h2>
          <p style={styles.subtitle}>Ingresa a tu cuenta para continuar</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.group}>
              <label style={styles.label}>Correo electrónico</label>
              <input
                type="email"
                placeholder="conectaMente@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.inputEmail}
                disabled={loading}
              />
            </div>

            <div style={styles.group}>
              <div style={styles.passwordHeader}>
                <label style={styles.label}>Contraseña</label>
                <a href="#" style={styles.forgot}>¿Olvidaste tu contraseña?</a>
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
            <Link to="/register" style={styles.link}>Crear cuenta</Link>
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
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    background: "#ffffff",
    width: "100%"
  },
  leftPanel: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(160deg, #1d5863 0%, #164048 100%)",
    color: "#ffffff",
    padding: "70px",
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
  backButtonRight: {
    position: "absolute",
    top: 24,
    left: 24,
    zIndex: 2,
    color: "#1d5863",
    fontWeight: 500,
  },
  leftContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: 520,
  },
  heroTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 40,
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: "-1px",
    marginTop: 50,
    marginBottom: 20,
  },
  description: { fontSize: 16.5, lineHeight: 1.7, color: "#c8e6e9" },
  features: { marginTop: 36, display: "flex", flexDirection: "column", gap: 16 },
  feature: { display: "flex", alignItems: "center", gap: 12, fontSize: 15.5, color: "#eaf6f7" },
  check: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "#4da6b0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
  },
  messageCard: {
    marginTop: 40,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "20px 24px",
    borderRadius: 18,
    maxWidth: 380
  },
  messageText: {
    margin: 0,
    fontStyle: "italic",
    color: "#d7edef",
    fontSize: 15,
    lineHeight: 1.6,
  },
  rightPanel: {
    flex: 1,
    position: "relative",
    background: "#f4f9f9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 40
  },
  formCard: {
    background: "#ffffff",
    width: "100%",
    maxWidth: 440,
    padding: "48px 40px",
    borderRadius: 24,
    boxShadow: "0 20px 50px rgba(29, 88, 99, 0.08)",
    border: "1px solid #eef2f2",
  },
  title: {
    color: "#1d5863",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 28,
    marginBottom: 6,
    fontWeight: 800,
    textAlign: "center"
  },
  subtitle: { color: "#64748b", marginBottom: 32, textAlign: "center", fontSize: 15 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  group: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 14, fontWeight: 600, color: "#334155", textAlign: "left" },
  passwordHeader: { display: "flex", justifyContent: "space-between" },
  forgot: { color: "#4da6b0", fontSize: 13, textDecoration: "none", fontWeight: 500 },
  inputEmail: {
    padding: "14px 18px",
    borderRadius: 25,
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    fontSize: 15,
    outline: "none",
    color: "#000000",
    textAlign: "left",
    fontFamily: "inherit"
  },
  inputPassword: {
    padding: "14px 18px",
    borderRadius: 25,
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    fontSize: 15,
    outline: "none",
    color: "#000000",
    fontFamily: "inherit"
  },
  button: {
    marginTop: 8,
    padding: 16,
    borderRadius: 25,
    border: "none",
    background: "#00838f",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "inherit",
    boxShadow: "0 8px 20px rgba(0, 131, 143, 0.3)",
    transition: "opacity 0.2s ease"
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    textAlign: "center"
  },
  register: { textAlign: "center", marginTop: 26, color: "#64748b", fontSize: "14px" },
  link: { color: "#1d5863", fontWeight: 700, textDecoration: "none" }
};

export default Login;