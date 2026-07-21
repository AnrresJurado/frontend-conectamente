import React from 'react';
import { Button } from 'antd';
import {
  ArrowLeftOutlined, VideoCameraOutlined,
  ExperimentOutlined, FileTextOutlined, BulbOutlined,
  RocketOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from "../../components/Logo";

import imgHero from '../../assets/servicios/hero.jpg';

const COLORS = {
  primary: '#1d5863',
  primaryDark: '#12414a',
  accent: '#4da6b0',
  accentSoft: '#bce3e6',
  bg: '#f4f9f9',
  card: '#ffffff',
  border: '#e2e8f0',
  textMuted: '#64748b',
  text: '#334155',
};

const SERVICIOS = [
  {
    icon: <VideoCameraOutlined />,
    titulo: 'Terapias en línea',
    texto: 'Sesiones individuales por videollamada con un psicólogo acreditado, desde donde estés.',
    ruta: '/terapias-online',
    color: '#1e88e5',
  },
  {
    icon: <ExperimentOutlined />,
    titulo: 'Test psicométricos',
    texto: 'Evaluaciones aplicadas por tu psicólogo para entender mejor tu estado emocional.',
    ruta: null,
    color: '#8e6bbf',
  },
  {
    icon: <FileTextOutlined />,
    titulo: 'Encuestas y tareas',
    texto: 'Actividades y encuestas que tu psicólogo te asigna para acompañar tu proceso entre sesiones.',
    ruta: null,
    color: '#f3a738',
  },
  {
    icon: <BulbOutlined />,
    titulo: 'Recomendaciones del psicólogo',
    texto: 'Sugerencias personalizadas que tu profesional comparte contigo según tu avance.',
    ruta: null,
    color: '#6ba283',
  },
];

const Servicios: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <style>{`
        .cm-serv-row {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .cm-serv-row:hover {
          transform: translateX(6px);
          box-shadow: 0 14px 30px rgba(29, 88, 99, 0.10);
          border-color: rgba(29, 88, 99, 0.18);
        }
        .cm-serv-cta:hover {
          filter: brightness(1.08);
        }
        .cm-serv-link:hover {
          gap: 10px;
        }
        .cm-serv-link {
          transition: gap 0.2s ease;
        }
        .cm-serv-num {
          transition: color 0.25s ease;
        }
        .cm-serv-row:hover .cm-serv-num {
          color: var(--num-hover-color, ${COLORS.accent});
        }
        @media (max-width: 820px) {
          .cm-hero-grid { grid-template-columns: 1fr !important; }
          .cm-hero-image-wrap { order: -1; clip-path: none !important; height: 260px !important; margin-left: 0 !important; border-radius: 20px; overflow: hidden; }
        }
        @media (max-width: 768px) {
          .cm-page-root { padding: 12px 16px 0 !important; }
          .cm-hero-text { padding-right: 0 !important; }
          .cm-hero-title { font-size: 32px !important; letter-spacing: -0.8px !important; }
          .cm-stats-inner { padding: 20px 16px !important; justify-content: center !important; }
          .cm-stat-divider { display: none !important; }
          .cm-stat-item { min-width: 100% !important; margin-bottom: 8px; }
          .cm-serv-row { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; padding: 18px 20px !important; }
          .cm-serv-action { width: 100%; display: flex; justify-content: flex-end; }
          .cm-bridge-card { padding: 28px 20px !important; text-align: left; }
          .cm-bridge-card .cm-bridge-cta-wrap { width: 100%; }
        }
      `}</style>

      <div className="cm-page-root" style={styles.pageInner}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={styles.backButton}
        >
          Volver
        </Button>

        {/* HERO — diagonal split */}
        <div className="cm-hero-grid" style={styles.heroGrid}>
          <div className="cm-hero-text" style={styles.heroText}>
            <Logo size={40} textColor={COLORS.primary} accentColor={COLORS.accent} />

            <div style={styles.eyebrowRow}>
              <span style={styles.eyebrowLine} />
              <span style={styles.eyebrow}>Todo en un mismo lugar</span>
            </div>

            <h1 className="cm-hero-title" style={styles.heroTitle}>
              Servicios pensados
              <br />
              para <span style={styles.heroTitleAccent}>tu proceso</span>
            </h1>

            <p style={styles.heroSubtitle}>
              En ConectaMente encuentras acompañamiento profesional en distintos
              formatos: sesiones individuales, grupos de apoyo, evaluaciones y
              seguimiento cercano de tu psicólogo, todo en un solo lugar.
            </p>

            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              className="cm-serv-cta"
              style={styles.ctaButtonHero}
              onClick={() => navigate('/register')}
            >
              Empezar ahora
            </Button>
          </div>

          <div className="cm-hero-image-wrap" style={styles.heroImageWrap}>
            <img src={imgHero} alt="Servicios ConectaMente" style={styles.heroImage} />
            <div style={styles.heroOverlay} />
          </div>
        </div>

        {/* FRANJA DE ESTADÍSTICAS */}
        <div style={styles.statsStrip}>
          <div className="cm-stats-inner" style={styles.statsInner}>
            <div className="cm-stat-item" style={styles.statItem}>
              <span style={styles.statNumber}>5</span>
              <span style={styles.statLabel}>servicios integrados</span>
            </div>
            <div className="cm-stat-divider" style={styles.statDivider} />
            <div className="cm-stat-item" style={styles.statItem}>
              <span style={styles.statNumber}>100%</span>
              <span style={styles.statLabel}>acompañamiento profesional</span>
            </div>
            <div className="cm-stat-divider" style={styles.statDivider} />
            <div className="cm-stat-item" style={styles.statItem}>
              <span style={styles.statNumber}>24/7</span>
              <span style={styles.statLabel}>acceso a tu plataforma</span>
            </div>
          </div>
        </div>

        {/* LISTA EDITORIAL DE SERVICIOS */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionKicker}>Explora</span>
            <h2 style={styles.sectionTitle}>¿Qué puedes hacer en ConectaMente?</h2>
            <p style={styles.sectionSubtitle}>
              Cada servicio está pensado para acompañarte antes, durante y después de tus sesiones.
            </p>
          </div>

          <div style={styles.list}>
            {SERVICIOS.map((s, i) => (
              <div
                key={s.titulo}
                className="cm-serv-row"
                style={styles.servRow}
              >
                <span
                  className="cm-serv-num"
                  style={{ ...styles.servNum, ['--num-hover-color' as any]: s.color }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div style={{ ...styles.servIconCircle, background: `${s.color}1A`, color: s.color }}>
                  {s.icon}
                </div>

                <div style={styles.servBody}>
                  <h3 style={styles.servTitulo}>{s.titulo}</h3>
                  <p style={styles.servTexto}>{s.texto}</p>
                </div>

                <div className="cm-serv-action" style={styles.servAction}>
                  {s.ruta ? (
                    <span
                      className="cm-serv-link"
                      style={styles.servLink}
                      onClick={() => navigate(s.ruta as string)}
                    >
                      Conocer más <ArrowRightOutlined style={{ fontSize: 12 }} />
                    </span>
                  ) : (
                    <span style={styles.servTag}>Guiado por tu psicólogo</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PUENTE HACIA RECURSOS */}
        <div style={styles.bridgeSection}>
          <div className="cm-bridge-card" style={styles.bridgeCard}>
            <div style={styles.bridgePattern} />
            <div style={styles.bridgeText}>
              <span style={styles.infoEyebrow}>¿Buscas herramientas de autoayuda?</span>
              <h3 style={styles.bridgeTitle}>Explora también nuestros Recursos</h3>
              <p style={styles.bridgeSubtitle}>
                Historial, notificaciones y seguimiento de tu progreso, siempre disponibles para ti.
              </p>
            </div>
            <div className="cm-bridge-cta-wrap" style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <Button
                type="primary"
                size="large"
                className="cm-serv-cta"
                style={styles.ctaButtonFinal}
                onClick={() => navigate('/recursos')}
              >
                Ver Recursos
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: COLORS.bg,
    minHeight: '100vh',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  pageInner: {
    padding: '20px 40px 0',
  },
  backButton: {
    color: COLORS.primary,
    fontWeight: 500,
    paddingLeft: 0,
  },

  // HERO
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr',
    alignItems: 'center',
    gap: 0,
    maxWidth: 1240,
    margin: '10px auto 0',
    padding: '20px 0 0',
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    paddingRight: 48,
  },
  eyebrowRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 26,
  },
  eyebrowLine: {
    width: 28,
    height: 2,
    background: COLORS.accent,
    display: 'inline-block',
  },
  eyebrow: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 46,
    fontWeight: 800,
    letterSpacing: '-1.2px',
    lineHeight: 1.12,
    margin: '14px 0 18px',
  },
  heroTitleAccent: {
    color: COLORS.accent,
    fontStyle: 'italic',
  },
  heroSubtitle: {
    color: COLORS.textMuted,
    fontSize: 16,
    lineHeight: 1.7,
    margin: '0 0 30px',
    maxWidth: 460,
  },
  ctaButtonHero: {
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
    borderColor: COLORS.primary,
    borderRadius: 26,
    fontWeight: 700,
    height: 50,
    paddingInline: 28,
    width: 'fit-content',
    boxShadow: '0 10px 24px rgba(29, 88, 99, 0.3)',
  },
  heroImageWrap: {
    position: 'relative',
    height: 460,
    clipPath: 'polygon(14% 0, 100% 0, 100% 100%, 0% 100%)',
    marginLeft: -8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(200deg, rgba(29,88,99,0.28) 0%, rgba(29,88,99,0) 45%)`,
  },

  // STATS STRIP
  statsStrip: {
    maxWidth: 980,
    margin: '56px auto 0',
    position: 'relative',
    zIndex: 2,
    padding: '0 20px',
  },
  statsInner: {
    background: COLORS.primary,
    borderRadius: 22,
    padding: '26px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 20px 40px rgba(18, 65, 74, 0.25)',
    flexWrap: 'wrap',
    gap: 20,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 140,
  },
  statNumber: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 800,
  },
  statLabel: {
    color: COLORS.accentSoft,
    fontSize: 12.5,
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
    background: 'rgba(255,255,255,0.18)',
  },

  // SERVICES LIST
  section: {
    maxWidth: 980,
    margin: '90px auto 0',
    padding: '0 0 20px',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: 44,
  },
  sectionKicker: {
    color: COLORS.accent,
    fontSize: 12.5,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: 800,
    margin: '8px 0 8px',
  },
  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14.5,
    margin: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  servRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 22,
    background: COLORS.card,
    borderRadius: 20,
    padding: '22px 26px',
    border: `1px solid ${COLORS.border}`,
  },
  servNum: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 22,
    fontWeight: 800,
    color: COLORS.border,
    minWidth: 40,
  },
  servIconCircle: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    fontSize: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  servBody: {
    flex: 1,
    minWidth: 180,
  },
  servTitulo: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 16.5,
    fontWeight: 700,
    margin: '0 0 4px',
  },
  servTexto: {
    color: COLORS.textMuted,
    fontSize: 13.5,
    lineHeight: 1.55,
    margin: 0,
  },
  servAction: {
    flexShrink: 0,
  },
  servLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: COLORS.accent,
    fontWeight: 700,
    fontSize: 13.5,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  servTag: {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    background: COLORS.accentSoft,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 700,
    padding: '6px 14px',
    borderRadius: 14,
  },

  // BRIDGE
  bridgeSection: {
    maxWidth: 1160,
    margin: '90px auto 0',
    padding: '0 0 90px',
  },
  bridgeCard: {
    position: 'relative',
    overflow: 'hidden',
    background: `linear-gradient(120deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
    borderRadius: 28,
    padding: '40px 48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 24,
    boxShadow: '0 20px 44px rgba(18, 65, 74, 0.28)',
  },
  bridgePattern: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
  },
  bridgeText: {
    maxWidth: 520,
    position: 'relative',
    zIndex: 1,
  },
  infoEyebrow: {
    color: COLORS.accentSoft,
    fontSize: 12.5,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  bridgeTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 800,
    margin: '10px 0 8px',
  },
  bridgeSubtitle: {
    color: COLORS.accentSoft,
    fontSize: 14.5,
    lineHeight: 1.6,
    margin: 0,
  },
  ctaButtonFinal: {
    background: '#ffffff',
    borderColor: '#ffffff',
    color: COLORS.primary,
    borderRadius: 26,
    fontWeight: 700,
    height: 48,
    paddingInline: 26,
    flexShrink: 0,
    position: 'relative',
    zIndex: 1,
  },
};

export default Servicios;