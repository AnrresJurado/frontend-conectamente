import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Alert, Row, Col, message } from "antd";
import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
import { solicitudesService } from "../../services/solicitudesService";
import Logo from "../../components/Logo";

const RegisterPsicologo: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setError("");
    setLoading(true);

    try {
      // Enviar solicitud de registro al administrador
      await solicitudesService.enviarSolicitudPsicologo({
        nombre: values.nombre,
        apellido: values.apellido,
        email: values.email,
        password: values.password,
        licenciaProfesional: values.licenciaProfesional,
        telefono: values.telefono || "",
        especialidad: values.especialidad || "",
        mensajeAdicional: values.mensajeAdicional || "",
      });

      setSuccess(true);
      form.resetFields();
      message.success("¡Solicitud enviada con éxito! Recibirás una respuesta del administrador.");
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        setError("El correo electrónico o la licencia profesional ya tienen una solicitud pendiente.");
      } else if (err.response && err.response.data && err.response.data.message) {
        const serverMsg = Array.isArray(err.response.data.message) 
          ? err.response.data.message[0] 
          : err.response.data.message;
        setError(serverMsg);
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

            <h1 style={styles.mainTitle}>Amplía tu alcance profesional</h1>

            <p style={styles.description}>
              Forma parte de la red de especialistas de ConectaMente, gestiona tus agendas y acompaña a nuevos pacientes de manera digital.
            </p>

            <div style={styles.cards}>
              <div style={styles.infoCard}>
                <span style={{ fontSize: "22px" }}>🩺</span>
                <strong style={styles.cardTitle}>Gestión Especializada</strong>
                <span style={styles.cardText}>
                  Controla tus citas, historiales médicos y sesiones en un solo entorno profesional.
                </span>
              </div>
              <div style={styles.infoCard}>
                <span style={{ fontSize: "22px" }}>📋</span>
                <strong style={styles.cardTitle}>Proceso de Validación</strong>
                <span style={styles.cardText}>
                  Tu solicitud será revisada por nuestro equipo administrativo antes de activar tu cuenta.
                </span>
              </div>
            </div>
          </div>
        </Col>

        {/* PANEL DERECHO (FORMULARIO) */}
        <Col xs={24} md={12} style={styles.rightPanel}>
          <div style={styles.formCard}>
            {success ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                <h2 style={{ ...styles.title, marginBottom: 12 }}>¡Solicitud Enviada!</h2>
                <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                  Hemos recibido tu solicitud para registrarte como psicólogo profesional.
                  Nuestro equipo administrativo la revisará y recibirás una respuesta por correo electrónico.
                </p>
                <Button
                  type="primary"
                  style={styles.button}
                  onClick={() => navigate("/")}
                  block
                >
                  Volver al inicio
                </Button>
                <p style={styles.loginText}>
                  ¿Ya tienes cuenta?{" "}
                  <Link to="/login" style={styles.link}>
                    Inicia sesión
                  </Link>
                </p>
              </div>
            ) : (
              <>
                <h2 style={styles.title}>Solicitud de Registro Profesional</h2>
                <p style={styles.subtitle}>
                  Completa tus datos y envía tu solicitud para que el administrador la revise
                </p>

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
                  <Row gutter={12}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="nombre"
                        rules={[{ required: true, message: "Ingresa tu nombre" }]}
                        style={{ marginBottom: 14 }}
                      >
                        <Input placeholder="Nombres" style={styles.antdInput} disabled={loading} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="apellido"
                        rules={[{ required: true, message: "Ingresa tu apellido" }]}
                        style={{ marginBottom: 14 }}
                      >
                        <Input placeholder="Apellidos" style={styles.antdInput} disabled={loading} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: "Ingresa tu correo electrónico" },
                      { type: "email", message: "Formato de correo no válido" }
                    ]}
                    style={{ marginBottom: 14 }}
                  >
                    <Input placeholder="Correo electrónico" style={styles.antdInput} disabled={loading} />
                  </Form.Item>

                  <Row gutter={12}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="password"
                        rules={[
                          { required: true, message: "Ingresa contraseña" },
                          { min: 8, message: "Mínimo 8 caracteres" }
                        ]}
                        style={{ marginBottom: 14 }}
                      >
                        <Input.Password placeholder="Contraseña" style={styles.antdInput} disabled={loading} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="confirmPassword"
                        dependencies={["password"]}
                        style={{ marginBottom: 14 }}
                        rules={[
                          { required: true, message: "Confirma contraseña" },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue("password") === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error("No coinciden"));
                            },
                          }),
                        ]}
                      >
                        <Input.Password placeholder="Confirmar contraseña" style={styles.antdInput} disabled={loading} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={12}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="licenciaProfesional"
                        rules={[{ required: true, message: "Ingresa tu licencia profesional" }]}
                        style={{ marginBottom: 14 }}
                      >
                        <Input placeholder="Licencia Profesional" style={styles.antdInput} disabled={loading} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="telefono"
                        style={{ marginBottom: 14 }}
                      >
                        <Input placeholder="Teléfono (Opcional)" style={styles.antdInput} disabled={loading} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="especialidad"
                    style={{ marginBottom: 14 }}
                  >
                    <Input placeholder="Especialidad (Opcional)" style={styles.antdInput} disabled={loading} />
                  </Form.Item>

                  <Form.Item
                    name="mensajeAdicional"
                    style={{ marginBottom: 20 }}
                  >
                    <Input.TextArea
                      placeholder="Mensaje adicional para el administrador (Opcional)"
                      style={{ ...styles.antdInput, minHeight: 80, resize: "vertical" }}
                      disabled={loading}
                      rows={3}
                    />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SendOutlined />}
                      style={{
                        ...styles.button,
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? "not-allowed" : "pointer"
                      }}
                      loading={loading}
                      block
                    >
                      {loading ? "Enviando solicitud..." : "Enviar Solicitud de Registro"}
                    </Button>
                  </Form.Item>
                </Form>

                <p style={styles.loginText}>
                  ¿Ya tienes cuenta?{" "}
                  <Link to="/login" style={styles.link}>
                    Inicia sesión
                  </Link>
                </p>
              </>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: { minHeight: "100vh", display: "flex", fontFamily: "'Inter', sans-serif", background: "#f4f9f9" },
  leftPanel: { position: "relative", overflow: "hidden", background: "linear-gradient(160deg, #1d5863 0%, #164048 100%)", padding: "70px", color: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "center" },
  decorCircleTop: { position: "absolute", top: -120, right: -120, width: 320, height: 320, borderRadius: "50%", background: "rgba(77, 166, 176, 0.18)" },
  decorCircleBottom: { position: "absolute", bottom: -140, left: -100, width: 300, height: 300, borderRadius: "50%", background: "rgba(255, 255, 255, 0.05)" },
  backButtonLeft: { position: "absolute", top: 24, left: 24, zIndex: 2, color: "#ffffff", fontWeight: 500 },
  leftContent: { position: "relative", zIndex: 1, maxWidth: 480 },
  mainTitle: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 40, fontWeight: 800, color: "#ffffff", marginBottom: 18, letterSpacing: "-1px", lineHeight: 1.2 },
  description: { fontSize: 16.5, lineHeight: 1.8, color: "#c8e6e9", marginBottom: 36 },
  cards: { display: "flex", gap: 16 },
  infoCard: { flex: 1, background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(4px)", padding: "20px", borderRadius: 18, display: "flex", flexDirection: "column", border: "1px solid rgba(255, 255, 255, 0.12)" },
  cardTitle: { fontSize: "15px", marginTop: "10px", fontWeight: 700, color: "#ffffff" },
  cardText: { fontSize: "13px", color: "#d8eeee", marginTop: "6px", lineHeight: "1.5" },
  rightPanel: { position: "relative", display: "flex", justifyContent: "center", alignItems: "center", padding: 30, background: "#f4f9f9", overflowY: "auto" },
  formCard: { background: "#ffffff", padding: "36px 30px", borderRadius: 24, width: "100%", maxWidth: 480, boxShadow: "0 20px 50px rgba(29, 88, 99, 0.08)", border: "1px solid #eef2f2" },
  title: { color: "#1d5863", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, margin: 0, textAlign: "center" },
  subtitle: { color: "#64748b", textAlign: "center", marginTop: 6, marginBottom: 20, fontSize: 14 },
  antdInput: { padding: "10px 16px", borderRadius: 20, fontSize: 14, color: "#000", background: "#f8fafc", border: "1px solid #cbd5e1" },
  button: { background: "#00838f", borderColor: "#00838f", color: "#ffffff", height: "46px", borderRadius: 22, fontSize: 15, fontWeight: 700, boxShadow: "0 8px 20px rgba(0, 131, 143, 0.3)" },
  loginText: { textAlign: "center", color: "#64748b", marginTop: 20, fontSize: "14px" },
  link: { color: "#1d5863", fontWeight: 700, textDecoration: "none" }
};

export default RegisterPsicologo;