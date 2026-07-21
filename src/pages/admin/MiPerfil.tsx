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
  PictureOutlined,
  CameraOutlined,
  CalendarOutlined,
  HeartOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { pacientesService } from '../../services/pacientesService';
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

// Placeholder de imagen reutilizable — reemplázalo por tu <img /> real
const ImagePlaceholder: React.FC<{ height?: number | string; label?: string; radius?: number; icon?: React.ReactNode }> = ({
  height = 160,
  label = 'Espacio para imagen',
  radius = 18,
  icon = <PictureOutlined style={{ fontSize: 26 }} />,
}) => (
  <div
    style={{
      height,
      borderRadius: radius,
      border: '2px dashed rgba(255,255,255,0.35)',
      background: 'rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      color: 'rgba(255,255,255,0.75)',
    }}
  >
    {icon}
    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12.5, textAlign: 'center', padding: '0 16px' }}>
      {label}
    </Text>
  </div>
);

export const MiPerfil: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [pacienteData, setPacienteData] = useState<any>(null);

  // mismos campos y misma lógica que existían en la pestaña "Perfil" de MiEspacio
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
      const pacientes = await pacientesService.getAll();
      const dataPac: any = pacientes?.[0];

      if (!dataPac) {
        message.warning('No encontramos tu expediente de paciente todavía.');
        setLoading(false);
        return;
      }

      setPacienteData(dataPac);
      setNombre(dataPac.usuario?.nombre || '');
      setApellido(dataPac.usuario?.apellido || '');
      setTelefono(dataPac.telefonoEmergencia || '');

      try {
        const citasData = await citasService.getAll();
        setTotalCitas((citasData || []).length);
      } catch (e) {
        console.warn('No se pudo cargar el total de citas:', e);
      }

      try {
        const resProgreso = dataPac.id
          ? await progresoService.getByPaciente(dataPac.id)
          : await progresoService.getAll();
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

  // ── misma lógica de guardado que tenía MiEspacio.tsx ──
  const handleUpdateProfile = async () => {
    if (!pacienteData?.id) return;
    setGuardandoPerfil(true);
    try {
      // 🎯 Usa PATCH /pacientes/:id (real) para guardar el teléfono de emergencia.
      // ⏳ Nombre y apellido viven en la entidad Usuario, no en Paciente — todavía no
      // tenemos confirmado un endpoint real para editarlos (ej. PATCH /usuarios/:id),
      // así que por ahora esos campos quedan de solo lectura para no romper nada.
      await pacientesService.update(pacienteData.id, {
        telefonoEmergencia: telefono,
      } as any);
      message.success('¡Teléfono actualizado con éxito!');
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

        <div style={styles.coverImageSlot}>
          <ImagePlaceholder height="100%" radius={0} label="Foto de portada — reemplaza este bloque por tu <img />" icon={<PictureOutlined style={{ fontSize: 30 }} />} />
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
              {pacienteData?.usuario?.email || 'Tu espacio de bienestar personal'}
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
                  Nombre <Text type="secondary" style={{ fontSize: 11 }}>(contacta a soporte para cambiarlo)</Text>
                </Text>
                <Input
                  className="miperfil-input"
                  value={nombre}
                  disabled
                  size="large"
                  prefix={<UserOutlined style={{ color: PALETTE.textMuted }} />}
                />
              </Col>
              <Col xs={24} md={12}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                  Apellido <Text type="secondary" style={{ fontSize: 11 }}>(contacta a soporte para cambiarlo)</Text>
                </Text>
                <Input
                  className="miperfil-input"
                  value={apellido}
                  disabled
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
                  value={pacienteData?.usuario?.email || ''}
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

        {/* Columna lateral — tarjeta inspiracional + espacio de imagen */}
        <Col xs={24} lg={8}>
          <Card bordered={false} style={styles.cardInspiracional}>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              <HeartOutlined style={{ marginRight: 8 }} />
              Tu bienestar, en un solo lugar
            </Title>
            <Paragraph style={{ color: '#E0E7FF', fontSize: 14, marginTop: 12, lineHeight: 1.6 }}>
              Aquí puedes gestionar tus datos personales. Toda tu información está protegida y solo es visible para ti y tu psicólogo asignado.
            </Paragraph>
            <div style={{ marginTop: 16 }}>
              <ImagePlaceholder height={160} label="Ilustración o foto de bienestar" />
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