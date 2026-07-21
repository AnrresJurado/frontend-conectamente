import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Col, Progress, Row, Spin, Tag, Typography, message } from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  MailOutlined,
  PhoneOutlined,
  RiseOutlined,
  SafetyOutlined,
  StarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { progresoService } from '../../services/progresoService';
import { pacientesService } from '../../services/pacientesService';
import { citasService } from '../../services/citasService';
import { useAuth } from '../../hooks/useAuth';
import { recomendacionesService } from '../../services/recomendacionesService';

const { Title, Paragraph, Text } = Typography;

// ─────────────────────────────────────────────────────────────
// Paleta e identidad visual
// ─────────────────────────────────────────────────────────────
const PALETTE = {
  primaryDark: '#0f363d',
  primary: '#1d5863',
  primaryLight: '#2f7986',
  accent: '#4da6b0',
  accentSoft: '#bce3e6',
  warm: '#e2a558',
  warmDeep: '#c97f34',
  ink: '#0c2226',
  bg: '#f3f9f9',
  card: '#ffffff',
  textMuted: '#5b7278',
  border: '#dfeceb',
};

const frasesDelDia = [
  '"No tienes que controlarlo todo. A veces solo necesitas dejar ir, confiar y dar el siguiente paso con amor propio."',
  '"El autocuidado no es egoísmo, es la base para poder cuidar de los demás."',
  '"Cada pequeño paso que das hacia tu bienestar es una victoria que merece ser celebrada."',
  '"Tu salud mental es tan importante como tu salud física. Ambas merecen atención y cuidado."',
  '"No estás solo en este camino. Pedir ayuda es un acto de valentía, no de debilidad."',
  '"La sanación no es lineal. Permítete sentir, procesar y crecer a tu propio ritmo."',
  '"Hoy es un buen día para empezar de nuevo. Cada amanecer trae una nueva oportunidad."',
];

const saludoSegunHora = () => {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const fechaLarga = () =>
  new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

const formatearFecha = (fechaStr: string) => {
  const d = new Date(fechaStr);
  return d.toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatearHora = (fechaStr: string) => {
  const d = new Date(fechaStr);
  return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
};

const getEmojiPorEstado = (estado: string) => {
  const map: Record<string, string> = {
    'FELIZ': '😊',
    'TRISTE': '😢',
    'ANSIEDAD': '😰',
    'TRANQUILO': '😌',
    'ESTRES': '😤',
    'MOTIVADO': '🔥',
    'CANSADO': '😴',
    'NEUTRO': '😐',
    'ESPERANZA': '🌟',
    'AGRADECIDO': '🙏',
  };
  return map[estado?.toUpperCase()] || '💚';
};

const getColorPorEstado = (estado: string) => {
  const map: Record<string, string> = {
    'FELIZ': '#10B981',
    'TRISTE': '#6366F1',
    'ANSIEDAD': '#F59E0B',
    'TRANQUILO': '#06B6D4',
    'ESTRES': '#EF4444',
    'MOTIVADO': '#F97316',
    'CANSADO': '#8B5CF6',
    'NEUTRO': '#94A3B8',
    'ESPERANZA': '#14B8A6',
    'AGRADECIDO': '#EC4899',
  };
  return map[estado?.toUpperCase()] || '#4da6b0';
};

export const MiEspacio: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // 🎯 SINTAXIS DE HOOKS CORREGIDA
  const [pacienteData, setPacienteData] = useState<any>(null);
  const [psicologoData, setPsicologoData] = useState<any>(null);
  const [citas, setCitas] = useState<any[]>([]);
  const [progreso, setProgreso] = useState<any[]>([]);
  const [recomendaciones, setRecomendaciones] = useState<any[]>([]);

  // Nombre/apellido para el saludo
  const [nombre, setNombre] = useState('');

  const fraseDelDia = useMemo(() => {
    const dia = new Date().getDate();
    return frasesDelDia[dia % frasesDelDia.length];
  }, []);

  useEffect(() => {
    fetchDataPaciente();
  }, []);

  const fetchDataPaciente = async () => {
    setLoading(true);
    try {
      let dataPac: any = null;
      try {
        dataPac = await pacientesService.getMe();
      } catch (e) {
        const pacientes = await pacientesService.getAll();
        dataPac = pacientes?.[0];
      }

      if (dataPac) {
        setPacienteData(dataPac);
        setNombre(dataPac.usuario?.nombre || '');

        if (dataPac.psicologo) {
          setPsicologoData(dataPac.psicologo);
        }
      }

      // Cargar citas
      const citasData = await citasService.getAll();
      setCitas(citasData || []);

      // Cargar progreso emocional
      try {
        if (dataPac?.id) {
          const resProgreso = await progresoService.getByPaciente(dataPac.id);
          setProgreso(resProgreso || []);
        } else {
          const resProgresoGen = await progresoService.getAll();
          setProgreso(resProgresoGen || []);
        }
      } catch (errProg) {
        console.warn("No se pudo cargar el progreso:", errProg);
      }

      // 🎯 Cargar recomendaciones y actualizar el contador del dashboard
      try {
        const recomendacionesData = await recomendacionesService.getAll();
        setRecomendaciones(recomendacionesData || []);
      } catch (errRec) {
        console.warn("No se pudieron cargar las recomendaciones:", errRec);
        setRecomendaciones([]);
      }

    } catch (err) {
      console.error("Error al cargar la información:", err);
      message.error("No se pudieron cargar todos los datos de tu espacio.");
    } finally {
      setLoading(false);
    }
  };

  const progresoGeneral = useMemo(() => {
    if (progreso.length === 0) return 0;
    const objetivo = 10;
    const porcentaje = Math.min(Math.round((progreso.length / objetivo) * 100), 100);
    return porcentaje;
  }, [progreso]);

  const proximaCita = useMemo(() => {
    return citas
      .filter(c => c.estado === 'PROGRAMADA' || c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA')
      .sort((a, b) => new Date(a.fechaHora || a.fecha).getTime() - new Date(b.fechaHora || b.fecha).getTime())
      [0] || null;
  }, [citas]);

  const ultimosProgresos = useMemo(() => {
    return [...progreso]
      .sort((a, b) => new Date(b.fecha || b.createdAt).getTime() - new Date(a.fecha || a.createdAt).getTime())
      .slice(0, 4);
  }, [progreso]);

  const citasCompletadas = useMemo(() => {
    return citas.filter(c => c.estado === 'REALIZADA' || c.estado === 'COMPLETADA').length;
  }, [citas]);

  // Nombre para mostrar: prioridad del backend, luego user de auth, luego fallback
  const nombreMostrar = nombre || user?.nombre || 'Paciente';

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        .hover-lift { transition: transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(15, 54, 61, 0.14); }
      `}</style>

      {/* ═══════════════ HERO — solo lectura, sin navegación ni botones ═══════════════ */}
      <section style={styles.hero}>
        <div style={styles.heroDecoration}>
          <svg viewBox="0 0 800 400" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }} aria-hidden="true">
            <circle cx="700" cy="60" r="220" fill="rgba(255,255,255,0.06)" />
            <circle cx="600" cy="360" r="150" fill="rgba(255,255,255,0.05)" />
            <circle cx="90" cy="380" r="110" fill="rgba(226,165,88,0.10)" />
          </svg>
        </div>

        <div style={styles.heroContent}>
          <span style={styles.eyebrow}>{fechaLarga()}</span>
          <Title level={1} style={styles.heroTitle}>
            {saludoSegunHora()}, {nombreMostrar} 🌿
          </Title>
          <Paragraph style={styles.heroSubtitle}>
            Este es un resumen de tu espacio de bienestar — tu progreso, tu próxima sesión
            y tu acompañamiento profesional, todo en un solo lugar.
          </Paragraph>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 26 }}>
            <div style={styles.heroStat}>
              <span style={styles.heroStatValue}>
                {proximaCita ? formatearHora(proximaCita.fechaHora || proximaCita.fecha) : '—'}
              </span>
              <span style={styles.heroStatLabel}>
                {proximaCita
                  ? `Próxima sesión · ${formatearFecha(proximaCita.fechaHora || proximaCita.fecha)}`
                  : 'Sin cita próxima'}
              </span>
            </div>
            <div style={styles.heroStat}>
              <span style={styles.heroStatValue}>{progresoGeneral}%</span>
              <span style={styles.heroStatLabel}>Progreso general</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TARJETAS RESUMEN ═══════════════ */}
      <div style={styles.statsWrap}>
        <div style={styles.statsGrid}>
          <div className="hover-lift" style={styles.statCard}>
            <span style={{ ...styles.statIcon, background: `${PALETTE.primary}14`, color: PALETTE.primary }}>
              <CalendarOutlined />
            </span>
            <div>
              <span style={styles.statValue}>{citas.length}</span>
              <span style={styles.statLabel}>Citas registradas</span>
            </div>
          </div>

          <div className="hover-lift" style={styles.statCard}>
            <span style={{ ...styles.statIcon, background: '#10B98114', color: '#10B981' }}>
              <CheckCircleOutlined />
            </span>
            <div>
              <span style={styles.statValue}>{citasCompletadas}</span>
              <span style={styles.statLabel}>Sesiones completadas</span>
            </div>
          </div>

          <div className="hover-lift" style={styles.statCard}>
            <span style={{ ...styles.statIcon, background: `${PALETTE.warm}22`, color: PALETTE.warmDeep }}>
              <RiseOutlined />
            </span>
            <div>
              <span style={styles.statValue}>{progreso.length}</span>
              <span style={styles.statLabel}>Registros emocionales</span>
            </div>
          </div>

          <div className="hover-lift" style={styles.statCard}>
            <span style={{ ...styles.statIcon, background: '#8B5CF614', color: '#8B5CF6' }}>
              <StarOutlined />
            </span>
            <div>
              <span style={styles.statValue}>{recomendaciones.length}</span>
              <span style={styles.statLabel}>Recomendaciones</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ CUERPO ═══════════════ */}
      <div style={styles.body}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            {/* Progreso general */}
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0, color: PALETTE.primary }}>
                  <RiseOutlined style={{ marginRight: 8 }} />
                  Tu progreso general
                </Title>
                <Tag color={progresoGeneral >= 70 ? 'success' : progresoGeneral >= 40 ? 'processing' : 'warning'} style={{ borderRadius: 20, padding: '2px 14px' }}>
                  {progresoGeneral}%
                </Tag>
              </div>
              <Progress
                percent={progresoGeneral}
                strokeColor={{ '0%': PALETTE.accent, '100%': PALETTE.primary }}
                trailColor={PALETTE.border}
                style={{ marginBottom: 16 }}
              />
              <Paragraph style={{ color: PALETTE.textMuted, margin: 0 }}>
                {progreso.length === 0
                  ? 'Aún no tienes registros de progreso.'
                  : `Llevas ${progreso.length} registro${progreso.length !== 1 ? 's' : ''} de tu evolución emocional. ¡Sigue así!`
                }
              </Paragraph>
            </div>

            {/* Últimos registros emocionales */}
            <div style={{ ...styles.card, marginTop: 20 }}>
              <Title level={4} style={{ margin: '0 0 16px', color: PALETTE.primary }}>
                <HeartOutlined style={{ marginRight: 8 }} />
                Últimos registros emocionales
              </Title>
              {ultimosProgresos.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {ultimosProgresos.map((item: any, idx: number) => (
                    <div key={idx} style={styles.progresoItem}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 28 }}>{getEmojiPorEstado(item.estadoEmocional)}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <Text strong style={{ color: PALETTE.ink }}>
                              {item.estadoEmocional || 'Sin estado'}
                            </Text>
                            <Tag color={getColorPorEstado(item.estadoEmocional)} style={{ borderRadius: 12, fontSize: 11 }}>
                              {formatearFecha(item.fecha || item.createdAt)}
                            </Tag>
                          </div>
                          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
                            {item.avance || item.observaciones || 'Sin notas'}
                          </Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Text type="secondary">Tu historial de evolución emocional aparecerá aquí.</Text>
              )}
            </div>
          </Col>

          <Col xs={24} lg={10}>
            {/* Frase del día */}
            <div style={styles.cardInspiracional}>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>
                <HeartOutlined style={{ marginRight: 8 }} />
                Frase del día
              </Title>
              <Paragraph style={{ color: PALETTE.accentSoft, fontSize: 15, fontStyle: 'italic', marginTop: 16, lineHeight: 1.6 }}>
                {fraseDelDia}
              </Paragraph>
              <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 12 }}>
                <Text style={{ color: PALETTE.accentSoft, fontSize: 12 }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  Reflexiona sobre esta frase hoy
                </Text>
              </div>
            </div>

            {/* Próxima sesión */}
            <div style={{ ...styles.card, marginTop: 20 }}>
              <Title level={4} style={{ margin: '0 0 12px', color: PALETTE.primary, fontSize: 15 }}>
                <CalendarOutlined style={{ marginRight: 8 }} />
                Próxima sesión
              </Title>
              {proximaCita ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ background: PALETTE.bg, borderRadius: 12, padding: '8px 12px', textAlign: 'center', minWidth: 60 }}>
                      <Text strong style={{ color: PALETTE.primary, fontSize: 18, display: 'block' }}>
                        {new Date(proximaCita.fechaHora || proximaCita.fecha).getDate()}
                      </Text>
                      <Text style={{ color: PALETTE.textMuted, fontSize: 11 }}>
                        {new Date(proximaCita.fechaHora || proximaCita.fecha).toLocaleDateString('es-EC', { month: 'short' })}
                      </Text>
                    </div>
                    <div>
                      <Text strong style={{ color: PALETTE.ink, display: 'block' }}>
                        {formatearHora(proximaCita.fechaHora || proximaCita.fecha)}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {proximaCita.motivoConsulta || 'Sesión de seguimiento'}
                      </Text>
                    </div>
                  </div>
                  <Tag color="processing" style={{ borderRadius: 12 }}>{proximaCita.estado}</Tag>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <Text type="secondary">No tienes citas programadas</Text>
                </div>
              )}
            </div>

            {/* Tu psicólogo asignado */}
            <div style={{ ...styles.card, marginTop: 20 }}>
              <Title level={4} style={{ margin: '0 0 12px', color: PALETTE.primary, fontSize: 15 }}>
                <TeamOutlined style={{ marginRight: 8 }} />
                Tu psicólogo
              </Title>
              {psicologoData ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Avatar
                    size={52}
                    style={{
                      background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.accent})`,
                      color: '#ffffff',
                      fontWeight: 700,
                    }}
                  >
                    {`${psicologoData?.usuario?.nombre?.charAt(0) || ''}${psicologoData?.usuario?.apellido?.charAt(0) || ''}`.toUpperCase() || <TeamOutlined />}
                  </Avatar>
                  <div>
                    <Text strong style={{ color: PALETTE.ink, display: 'block' }}>
                      {psicologoData.usuario?.nombre || ''} {psicologoData.usuario?.apellido || ''}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12.5 }}>
                      {psicologoData?.especialidad || 'Especialista en Salud Mental'}
                    </Text>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6 }}>
                      {psicologoData.usuario?.email && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <MailOutlined style={{ marginRight: 4 }} />
                          {psicologoData.usuario.email}
                        </Text>
                      )}
                      {psicologoData.telefono && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <PhoneOutlined style={{ marginRight: 4 }} />
                          {psicologoData.telefono}
                        </Text>
                      )}
                      {(psicologoData.numColegiatura || psicologoData.licenciaProfesional) && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <SafetyOutlined style={{ marginRight: 4 }} />
                          {psicologoData.numColegiatura || psicologoData.licenciaProfesional}
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <Text type="secondary">Aún no tienes un psicólogo asignado.</Text>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────────────────────
const styles: { [key: string]: React.CSSProperties } = {
  loadingScreen: {
    textAlign: 'center',
    padding: '160px 0',
    background: PALETTE.bg,
    minHeight: '100vh',
  },
  page: {
    background: PALETTE.bg,
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    overflowX: 'hidden',
  },

  // ── Hero ──
  hero: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.primaryDark})`,
    padding: 'clamp(40px, 6vw, 88px) clamp(20px, 6vw, 88px) clamp(56px, 7vw, 96px)',
  },
  heroDecoration: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 780,
  },
  eyebrow: {
    display: 'inline-block',
    color: PALETTE.warm,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 999,
    padding: '6px 16px',
  },
  heroTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#ffffff',
    fontSize: 'clamp(30px, 4.5vw, 48px)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    margin: '16px 0 10px',
    lineHeight: 1.1,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 'clamp(14px, 1.3vw, 17px)',
    margin: 0,
    maxWidth: 560,
    lineHeight: 1.6,
  },
  heroStat: {
    background: 'rgba(255,255,255,0.10)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.20)',
    borderRadius: 18,
    padding: '14px 26px',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 190,
  },
  heroStatValue: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1,
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12.5,
    marginTop: 6,
    letterSpacing: '0.02em',
  },

  // ── Tarjetas resumen ──
  statsWrap: {
    position: 'relative',
    zIndex: 3,
    marginTop: -48,
    padding: '0 clamp(16px, 5vw, 64px)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 18,
    width: '100%',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    background: PALETTE.card,
    borderRadius: 20,
    padding: '22px 24px',
    border: `1px solid ${PALETTE.border}`,
    boxShadow: '0 16px 40px rgba(15, 54, 61, 0.12)',
  },
  statIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 14,
    fontSize: 21,
    flexShrink: 0,
  },
  statValue: {
    display: 'block',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: PALETTE.primaryDark,
    fontSize: 26,
    fontWeight: 800,
    lineHeight: 1.15,
  },
  statLabel: {
    display: 'block',
    color: PALETTE.textMuted,
    fontSize: 13,
    marginTop: 3,
  },

  // ── Cuerpo ──
  body: {
    padding: 'clamp(24px, 4vw, 48px) clamp(16px, 5vw, 64px) clamp(48px, 6vw, 88px)',
  },
  card: {
    borderRadius: 20,
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
    border: `1px solid ${PALETTE.border}`,
    background: PALETTE.card,
    padding: 24,
  },
  cardInspiracional: {
    borderRadius: 20,
    background: `linear-gradient(135deg, ${PALETTE.primary} 0%, ${PALETTE.primaryDark} 100%)`,
    boxShadow: '0 8px 24px rgba(18, 65, 74, 0.25)',
    padding: 24,
  },
  progresoItem: {
    background: PALETTE.bg,
    borderRadius: 14,
    padding: '14px 16px',
    border: `1px solid ${PALETTE.border}`,
  },
};

export default MiEspacio;