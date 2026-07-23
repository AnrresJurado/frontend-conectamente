import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Avatar, Row, Col, message, Spin, Typography, Tag, Divider } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  SafetyOutlined,
  CameraOutlined,
  CalendarOutlined,
  HeartOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { pacientesService } from '../../services/pacientesService';
import { perfilService } from '../../services/perfilService';
import { citasService } from '../../services/citasService';
import { progresoService } from '../../services/progresoService';
import { useAuth } from '../../hooks/useAuth';

const { Title, Paragraph, Text } = Typography;

// misma paleta que MiEspacio / Dashboard, para mantener identidad visual
const PALETTE = {
  primaryDark: '#12414a',
  primary: '#1d5863',
  accent: '#4da6b0',
  accentSoft: '#bce3e6',
  bg: '#eef7f7',
  card: '#ffffff',
  textMuted: '#64748b',
  border: '#e2e8f0',
};

// 🖼️ RUTAS DE IMÁGENES REALES
// Coloca aquí tus archivos descargados, dentro de la carpeta `public/assets/miPerfil/`
// de tu proyecto (NO dentro de `src/`). Ejemplo de estructura:
//   public/
//     assets/
//       miPerfil/
//         portada.jpg      <- foto de portada del perfil
//         bienestar.jpg    <- ilustración de la tarjeta "Tu bienestar, en un solo lugar"
// Si usas otro nombre de archivo o extensión, solo actualiza las rutas de abajo.
const IMG_PORTADA = '/assets/miPerfil/portada.jpg';
const IMG_BIENESTAR = '/assets/miPerfil/bienestar.jpeg';

export const MiPerfil: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // 🎯 Ahora la info viene de DOS fuentes combinadas:
  // - perfilData: GET /perfil                -> nombre, apellido, email (entidad Usuario)
  // - pacienteData: GET /pacientes/me/perfil  -> telefonoEmergencia, id del paciente (entidad Paciente)
  const [perfilData, setPerfilData] = useState<any>(null);
  const [pacienteData, setPacienteData] = useState<any>(null);

  // campos editables del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  // datos de contexto adicionales, solo para enriquecer la vista (no cambian lógica de guardado)
  const [totalCitas, setTotalCitas] = useState(0);
  const [totalProgreso, setTotalProgreso] = useState(0);

  useEffect(() => {
    fetchDataPaciente();
  }, []);

  const fetchDataPaciente = async () => {
    setLoading(true);
    try {
      const [perfil, paciente] = await Promise.all([
        perfilService.getMe().catch(() => null),
        pacientesService.getMe().catch((e) => {
          console.warn('No se pudo cargar el expediente de paciente:', e);
          return null;
        }),
      ]);

      if (!perfil) {
        message.warning('No encontramos tu perfil todavía.');
        setLoading(false);
        return;
      }

      setPerfilData(perfil);
      setPacienteData(paciente);

      setNombre(perfil.nombre || '');
      setApellido(perfil.apellido || '');
      setTelefono(paciente?.telefonoEmergencia || '');

      try {
        const citasData = await citasService.getAll();
        setTotalCitas((citasData || []).length);
      } catch (e) {
        console.warn('No se pudo cargar el total de citas:', e);
      }

      try {
        const usuarioId = paciente?.usuario?.id || paciente?.usuarioId;
        const resProgreso = usuarioId
          ? await progresoService.getByPaciente(usuarioId)
          : [];
        setTotalProgreso((resProgreso || []).length);
      } catch (e) {
        console.warn('No se pudo cargar el progreso:', e);
      }
    } catch (err) {
      console.error('Error al cargar la información:', err);
      message.error('No se pudo cargar tu perfil.');
    } finally {
      setLoading(false);
    }
  };

  // ── guardado: dos llamadas separadas, cada una a su propio recurso ──
  const handleUpdateProfile = async () => {
    setGuardandoPerfil(true);
    try {
      // 1) Nombre/apellido viven en Usuario -> PATCH /perfil (no necesita id, usa el JWT)
      const perfilActualizado = await perfilService.update({ nombre, apellido });
      setPerfilData(perfilActualizado);

      // 2) Teléfono de emergencia vive en Paciente -> PATCH /pacientes/:id
      if (pacienteData?.id) {
        await pacientesService.update(pacienteData.id, {
          telefonoEmergencia: telefono,
        } as any);
      }

      message.success('¡Perfil actualizado con éxito!');
      fetchDataPaciente();
    } catch (err) {
      console.error(err);
      message.error('Error al actualizar el perfil.');
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const nombreMostrar = nombre || user?.nombre || 'Paciente';

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '160px 0', background: PALETTE.bg, minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        .miperfil-input .ant-input, .miperfil-input.ant-input { border-radius: 12px !important; padding: 10px 14px !important; }
        .miperfil-input .ant-input-disabled { color: ${PALETTE.textMuted} !important; }
      `}</style>

      {/* volver */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ borderRadius: 12, marginBottom: 20, border: `1px solid ${PALETTE.border}`, color: PALETTE.primary, fontWeight: 600 }}
      >
        Volver a Mi Espacio
      </Button>

      {/* ═══════════════ PORTADA + AVATAR ═══════════════ */}
      <div style={styles.cover}>
        <svg style={styles.coverDecoration} viewBox="0 0 1000 260" preserveAspectRatio="none" aria-hidden="true">
          <circle cx="880" cy="40" r="160" fill="rgba(255,255,255,0.05)" />
          <circle cx="120" cy="220" r="110" fill="rgba(255,255,255,0.04)" />
        </svg>

        {/* 🖼️ Foto de portada real */}
        <div style={styles.coverImageSlot}>
          <img
            src={IMG_PORTADA}
            alt="Foto de portada"
            style={styles.coverImage}
            onError={(e) => {
              // si el archivo aún no existe en public/assets/miPerfil/, ocultamos el <img> roto
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        <div style={styles.coverContent}>
          <div style={{ position: 'relative' }}>
            <Avatar
              size={128}
              icon={<UserOutlined />}
              style={{
                backgroundColor: PALETTE.primary,
                border: '5px solid #ffffff',
                boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
              }}
            />
            <div style={styles.cameraBadge}>
              <CameraOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <Title level={2} style={{ color: '#fff', margin: 0 }}>
              {nombreMostrar}
            </Title>
            <Text style={{ color: PALETTE.accentSoft, fontSize: 15 }}>
              {perfilData?.email || 'Tu espacio de bienestar personal'}
            </Text>
          </div>
        </div>
      </div>

      {/* ═══════════════ MÉTRICAS RÁPIDAS ═══════════════ */}
      <Row gutter={[16, 16]} style={{ marginTop: -28, position: 'relative', zIndex: 2 }}>
        <Col xs={24} sm={8}>
          <div style={styles.metricCard}>
            <span style={{ ...styles.metricIcon, background: `${PALETTE.primary}1a`, color: PALETTE.primary }}>
              <CalendarOutlined />
            </span>
            <div>
              <span style={styles.metricValue}>{totalCitas}</span>
              <span style={styles.metricLabel}>Citas registradas</span>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div style={styles.metricCard}>
            <span style={{ ...styles.metricIcon, background: '#8B5CF61a', color: '#8B5CF6' }}>
              <HeartOutlined />
            </span>
            <div>
              <span style={styles.metricValue}>{totalProgreso}</span>
              <span style={styles.metricLabel}>Registros emocionales</span>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div style={styles.metricCard}>
            <span style={{ ...styles.metricIcon, background: '#10B9811a', color: '#10B981' }}>
              <SafetyOutlined />
            </span>
            <div>
              <span style={styles.metricValue}>Activo</span>
              <span style={styles.metricLabel}>Estado de la cuenta</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* ═══════════════ CONTENIDO PRINCIPAL ═══════════════ */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Columna de datos editables */}
        <Col xs={24} lg={16}>
          <Card bordered={false} style={styles.card}>
            <Title level={4} style={{ margin: '0 0 4px', color: PALETTE.primary }}>
              <IdcardOutlined style={{ marginRight: 8 }} />
              Información personal
            </Title>
            <Paragraph type="secondary" style={{ margin: '0 0 24px' }}>
              Mantén tus datos de contacto actualizados para que tu psicólogo y la plataforma puedan comunicarse contigo.
            </Paragraph>

            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                  Nombre
                </Text>
                <Input
                  className="miperfil-input"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  size="large"
                  prefix={<UserOutlined style={{ color: PALETTE.textMuted }} />}
                />
              </Col>
              <Col xs={24} md={12}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                  Apellido
                </Text>
                <Input
                  className="miperfil-input"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  size="large"
                  prefix={<UserOutlined style={{ color: PALETTE.textMuted }} />}
                />
              </Col>
              <Col xs={24} md={12}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                  Teléfono de contacto / Emergencia
                </Text>
                <Input
                  className="miperfil-input"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  size="large"
                  prefix={<PhoneOutlined style={{ color: PALETTE.textMuted }} />}
                />
              </Col>
              <Col xs={24} md={12}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                  Correo electrónico
                </Text>
                <Input
                  className="miperfil-input"
                  value={perfilData?.email || ''}
                  disabled
                  size="large"
                  prefix={<MailOutlined style={{ color: PALETTE.textMuted }} />}
                />
              </Col>
            </Row>

            <Divider style={{ margin: '28px 0 20px' }} />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="primary"
                onClick={handleUpdateProfile}
                loading={guardandoPerfil}
                icon={<SaveOutlined />}
                size="large"
                style={{
                  background: PALETTE.primary,
                  border: 'none',
                  borderRadius: 12,
                  height: 48,
                  fontWeight: 600,
                  paddingLeft: 28,
                  paddingRight: 28,
                }}
              >
                Guardar cambios
              </Button>
            </div>
          </Card>
        </Col>

        {/* Columna lateral — tarjeta inspiracional + imagen real */}
        <Col xs={24} lg={8}>
          <Card bordered={false} style={styles.cardInspiracional}>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              <HeartOutlined style={{ marginRight: 8 }} />
              Tu bienestar, en un solo lugar
            </Title>
            <Paragraph style={{ color: '#E0E7FF', fontSize: 14, marginTop: 12, lineHeight: 1.6 }}>
              Aquí puedes gestionar tus datos personales. Toda tu información está protegida y solo es visible para ti y tu psicólogo asignado.
            </Paragraph>
            {/* 🖼️ Ilustración de bienestar real */}
            <div style={{ marginTop: 16 }}>
              <img
                src={IMG_BIENESTAR}
                alt="Ilustración de bienestar"
                style={styles.bienestarImage}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </Card>

          <Card bordered={false} style={{ ...styles.card, marginTop: 20 }}>
            <Title level={5} style={{ margin: '0 0 12px', color: PALETTE.primary }}>
              <SafetyOutlined style={{ marginRight: 8 }} />
              Privacidad
            </Title>
            <Paragraph type="secondary" style={{ fontSize: 13, margin: 0 }}>
              Tus datos de contacto solo se usan para que tu psicólogo y la plataforma puedan comunicarse contigo en caso de ser necesario.
            </Paragraph>
            <Tag color="success" style={{ borderRadius: 10, marginTop: 12 }}>Conexión segura</Tag>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────────────────────
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: PALETTE.bg,
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    padding: 'clamp(16px, 3vw, 40px)',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  cover: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 28,
    background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.primaryDark})`,
    boxShadow: '0 12px 30px rgba(18, 65, 74, 0.25)',
    minHeight: 260,
    display: 'flex',
    alignItems: 'flex-end',
    padding: 'clamp(24px, 3vw, 40px)',
  },
  coverDecoration: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  coverImageSlot: {
    position: 'absolute',
    inset: 0,
    opacity: 0.5,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  bienestarImage: {
    width: '100%',
    height: 160,
    objectFit: 'cover',
    borderRadius: 18,
    display: 'block',
  },
  coverContent: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: PALETTE.accent,
    border: '3px solid #ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  metricCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: PALETTE.card,
    borderRadius: 18,
    padding: '18px 20px',
    border: `1px solid ${PALETTE.border}`,
    boxShadow: '0 8px 20px rgba(29, 88, 99, 0.1)',
  },
  metricIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 12,
    fontSize: 19,
    flexShrink: 0,
  },
  metricValue: {
    display: 'block',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primaryDark,
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.15,
  },
  metricLabel: {
    display: 'block',
    color: PALETTE.textMuted,
    fontSize: 12.5,
    marginTop: 2,
  },
  card: {
    borderRadius: 20,
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
    border: `1px solid ${PALETTE.border}`,
  },
  cardInspiracional: {
    borderRadius: 20,
    background: `linear-gradient(135deg, ${PALETTE.primary} 0%, ${PALETTE.primaryDark} 100%)`,
    color: '#fff',
    boxShadow: '0 8px 24px rgba(18, 65, 74, 0.25)',
  },
};

export default MiPerfil;