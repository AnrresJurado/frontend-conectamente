import React from 'react';
import { Button } from 'antd';
import {
  ArrowLeftOutlined, FolderOpenOutlined, BellOutlined,
  LineChartOutlined, BulbOutlined, ExperimentOutlined,
  FileTextOutlined, RocketOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from "../../components/Logo";

import imgHero from '../../assets/recursos/hero.jpeg';

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

const RECURSOS = [
  {
    icon: <FolderOpenOutlined />,
    titulo: 'Historial clínico',
    texto: 'Consulta el registro de tus sesiones y avances pasados, siempre a tu alcance.',
    ruta: null,
    color: '#1e88e5',
    size: 'lg' as const,
  },
  {
    icon: <LineChartOutlined />,
    titulo: 'Seguimiento de progreso',
    texto: 'Visualiza tu evolución emocional a lo largo del tiempo, sesión tras sesión.',
    ruta: null,
    color: '#6ba283',
    size: 'lg' as const,
  },
  {
    icon: <BellOutlined />,
    titulo: 'Notificaciones',
    texto: 'Recordatorios de citas y avisos importantes de tu psicólogo, sin perderte nada.',
    ruta: null,
    color: '#e07a5f',
    size: 'sm' as const,
  },
  {
    icon: <BulbOutlined />,
    titulo: 'Recomendaciones',
    texto: 'Sugerencias personalizadas que tu profesional comparte según tu proceso.',
    ruta: null,
    color: '#f3a738',
    size: 'sm' as const,
  },
  {
    icon: <ExperimentOutlined />,
    titulo: 'Tests psicométricos',
    texto: 'Evaluaciones aplicadas por tu psicólogo para entender mejor tu estado emocional.',
    ruta: null,
    color: '#8e6bbf',
    size: 'sm' as const,
  },
  {
    icon: <FileTextOutlined />,
    titulo: 'Encuestas y tareas',
    texto: 'Actividades que tu psicólogo te asigna para acompañar tu proceso entre sesiones.',
    ruta: null,
    color: '#4da6b0',
    size: 'sm' as const,
  },
];

const Recursos: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <style>{`
        .cm-rec-tile {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .cm-rec-tile:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 34px rgba(29, 88, 99, 0.12);
          border-color: rgba(29, 88, 99, 0.16);
        }
        .cm-rec-cta:hover {
          filter: brightness(1.08);
        }
        .cm-rec-link:hover {
          gap: 10px;
        }
        .cm-rec-link {
          transition: gap 0.2s ease;
        }
        .cm-rec-bento {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }
        .cm-rec-bento .cm-rec-lg {
          grid-column: span 2;
        }
        @media (max-width: 620px) {
          .cm-rec-bento { grid-template-columns: 1fr; }
          .cm-rec-bento .cm-rec-lg { grid-column: span 1; }
          .cm-hero-grid-r { grid-template-columns: 1fr !important; }
          .cm-hero-image-wrap-r { order: -1; height: 240px !important; }
        }
      `}</style>

      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={styles.backButton}
      >
        Volver
      </Button>

      {/* HERO */}
      <div className="cm-hero-grid-r" style={styles.heroGrid}>
        <div style={styles.heroText}>
          <Logo size={40} textColor={COLORS.primary} accentColor={COLORS.accent} />

          <div style={styles.eyebrowRow}>
            <span style={styles.eyebrowLine} />
            <span style={styles.eyebrow}>Tu espacio de seguimiento</span>
          </div>

          <h1 style={styles.heroTitle}>
            Recursos para
            <br />
            acompañar <span style={styles.heroTitleAccent}>tu camino</span>
          </h1>

          <p style={styles.heroSubtitle}>
            Además de tus sesiones, ConectaMente te da herramientas para dar
            seguimiento a tu proceso: historial, progreso, recordatorios y
            actividades que tu psicólogo comparte contigo.
          </p>

          <Button
            type="primary"
            size="large"
            icon={<RocketOutlined />}
            className="cm-rec-cta"
            style={styles.ctaButtonHero}
            onClick={() => navigate('/register')}
          >
            Crear mi cuenta
          </Button>
        </div>

        <div className="cm-hero-image-wrap-r" style={styles.heroImageWrap}>
          <img src={imgHero} alt="Recursos ConectaMente" style={styles.heroImage} />
          <div style={styles.heroOverlay} />
        </div>
      </div>

      {/* BENTO GRID DE RECURSOS */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionKicker}>Disponible en tu cuenta</span>
          <h2 style={styles.sectionTitle}>Todo tu proceso, en un solo lugar</h2>
          <p style={styles.sectionSubtitle}>
            Estos recursos se activan en cuanto inicias tu acompañamiento con un psicólogo.
          </p>
        </div>

        <div className="cm-rec-bento">
          {RECURSOS.map((r) => (
            <div
              key={r.titulo}
              className={`cm-rec-tile ${r.size === 'lg' ? 'cm-rec-lg' : ''}`}
              style={styles.recTile}
            >
              <div style={{ ...styles.recIcon, background: `${r.color}1A`, color: r.color }}>
                {r.icon}
              </div>

              <div style={styles.recBody}>
                <h3 style={styles.recTitulo}>{r.titulo}</h3>
                <p style={styles.recTexto}>{r.texto}</p>

                {r.ruta ? (
                  <span
                    className="cm-rec-link"
                    style={styles.recLink}
                    onClick={() => navigate(r.ruta as string)}
                  >
                    Conocer más <ArrowRightOutlined style={{ fontSize: 12 }} />
                  </span>
                ) : (
                  <span style={styles.recTag}>Parte de tu acompañamiento</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PUENTE HACIA SERVICIOS */}
      <div style={styles.bridgeSection}>
        <div style={styles.bridgeCard}>
          <div style={styles.bridgePattern} />
          <div style={styles.bridgeText}>
            <span style={styles.infoEyebrow}>¿Aún no agendas tu primera sesión?</span>
            <h3 style={styles.bridgeTitle}>Conoce nuestros Servicios</h3>
            <p style={styles.bridgeSubtitle}>
              Terapias en línea, grupos de apoyo y más formas de empezar tu proceso.
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            className="cm-rec-cta"
            style={styles.ctaButtonFinal}
            onClick={() => navigate('/servicios')}
          >
            Ver Servicios
          </Button>
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
    gap: 40,
    maxWidth: 1240,
    margin: '10px auto 0',
    padding: '20px 0 0',
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
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
    fontSize: 44,
    fontWeight: 800,
    letterSpacing: '-1.2px',
    lineHeight: 1.14,
    margin: '14px 0 18px',
  },
  heroTitleAccent: {
    color: COLORS.accent,
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
    height: 400,
    borderRadius: 28,
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(29, 88, 99, 0.18)',
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
    background: `linear-gradient(200deg, rgba(29,88,99,0.24) 0%, rgba(29,88,99,0) 45%)`,
  },

  // BENTO SECTION
  section: {
    maxWidth: 1100,
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
  recTile: {
    background: COLORS.card,
    borderRadius: 22,
    border: `1px solid ${COLORS.border}`,
    padding: '26px',
    display: 'flex',
    flexDirection: 'column',
  },
  recIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    fontSize: 19,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    flexShrink: 0,
  },
  recBody: {
    display: 'flex',
    flexDirection: 'column',
  },
  recTitulo: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 16.5,
    fontWeight: 700,
    margin: '0 0 6px',
  },
  recTexto: {
    color: COLORS.textMuted,
    fontSize: 13.5,
    lineHeight: 1.55,
    margin: 0,
  },
  recLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: COLORS.accent,
    fontWeight: 700,
    fontSize: 13.5,
    cursor: 'pointer',
    width: 'fit-content',
    marginTop: 14,
  },
  recTag: {
    display: 'inline-block',
    width: 'fit-content',
    background: COLORS.accentSoft,
    color: COLORS.primary,
    fontSize: 11.5,
    fontWeight: 700,
    padding: '5px 12px',
    borderRadius: 14,
    marginTop: 14,
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

export default Recursos;