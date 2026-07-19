import React from 'react';
import { Button } from 'antd';
import {
  ArrowLeftOutlined, VideoCameraOutlined, CommentOutlined,
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
    icon: <CommentOutlined />,
    titulo: 'Chats grupales',
    texto: 'Grupos de apoyo guiados para compartir experiencias con otras personas y un profesional.',
    ruta: '/grupos-apoyo',
    color: '#e07a5f',
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
        .cm-serv-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .cm-serv-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 30px rgba(29, 88, 99, 0.12);
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
      <div style={styles.heroWrapper}>
        <div style={styles.heroText}>
          <Logo size={40} textColor={COLORS.primary} accentColor={COLORS.accent} />
          <span style={styles.eyebrow}>Todo en un mismo lugar</span>
          <h1 style={styles.heroTitle}>
            Nuestros
            <br />
            <span style={{ color: COLORS.accent }}>servicios</span>
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

        <div style={styles.heroImageWrapper}>
          <img src={imgHero} alt="Servicios ConectaMente" style={styles.heroImage} />
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeNumber}>5</span>
            <span style={styles.heroBadgeLabel}>servicios integrados a tu proceso</span>
          </div>
        </div>
      </div>

      {/* GRID DE SERVICIOS */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>¿Qué puedes hacer en ConectaMente?</h2>
        <p style={styles.sectionSubtitle}>
          Cada servicio está pensado para acompañarte antes, durante y después de tus sesiones.
        </p>

        <div style={styles.grid}>
          {SERVICIOS.map((s) => (
            <div key={s.titulo} className="cm-serv-card" style={styles.servCard}>
              <div style={{ ...styles.servIcon, background: `${s.color}1A`, color: s.color }}>
                {s.icon}
              </div>
              <h3 style={styles.servTitulo}>{s.titulo}</h3>
              <p style={styles.servTexto}>{s.texto}</p>

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
          ))}
        </div>
      </div>

      {/* PUENTE HACIA RECURSOS */}
      <div style={styles.bridgeSection}>
        <div style={styles.bridgeCard}>
          <div style={styles.bridgeText}>
            <span style={styles.infoEyebrow}>¿Buscas herramientas de autoayuda?</span>
            <h3 style={styles.bridgeTitle}>Explora también nuestros Recursos</h3>
            <p style={styles.bridgeSubtitle}>
              Historial, notificaciones y seguimiento de tu progreso, siempre disponibles para ti.
            </p>
          </div>
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
  heroWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 48,
    flexWrap: 'wrap',
    maxWidth: 1160,
    margin: '20px auto 0',
    padding: '20px 0 40px',
  },
  heroText: {
    flex: '1 1 420px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  eyebrow: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginTop: 22,
  },
  heroTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 42,
    fontWeight: 800,
    letterSpacing: '-1px',
    lineHeight: 1.15,
    margin: '10px 0 16px',
  },
  heroSubtitle: {
    color: COLORS.textMuted,
    fontSize: 16,
    lineHeight: 1.7,
    margin: '0 0 28px',
    maxWidth: 480,
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
  heroImageWrapper: {
    position: 'relative',
    flex: '1 1 380px',
    maxWidth: 460,
  },
  heroImage: {
    width: '100%',
    height: 380,
    objectFit: 'cover',
    borderRadius: 28,
    boxShadow: '0 20px 50px rgba(29, 88, 99, 0.18)',
  },
  heroBadge: {
    position: 'absolute',
    bottom: -22,
    left: -22,
    background: '#ffffff',
    borderRadius: 18,
    padding: '14px 20px',
    boxShadow: '0 10px 26px rgba(29, 88, 99, 0.18)',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${COLORS.border}`,
  },
  heroBadgeNumber: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1,
  },
  heroBadgeLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
    maxWidth: 140,
  },
  section: {
    maxWidth: 1160,
    margin: '80px auto 0',
    padding: '0 0 20px',
  },
  sectionTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: 800,
    margin: 0,
    textAlign: 'center',
  },
  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14.5,
    textAlign: 'center',
    margin: '8px 0 34px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 20,
  },
  servCard: {
    background: COLORS.card,
    borderRadius: 20,
    padding: '28px 24px',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 4px 16px rgba(29, 88, 99, 0.06)',
    display: 'flex',
    flexDirection: 'column',
  },
  servIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    fontSize: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  servTitulo: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 16.5,
    fontWeight: 700,
    margin: '0 0 8px',
  },
  servTexto: {
    color: COLORS.textMuted,
    fontSize: 13.5,
    lineHeight: 1.6,
    margin: '0 0 18px',
    flex: 1,
  },
  servLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: COLORS.accent,
    fontWeight: 700,
    fontSize: 13.5,
    cursor: 'pointer',
    width: 'fit-content',
  },
  servTag: {
    display: 'inline-block',
    width: 'fit-content',
    background: COLORS.accentSoft,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 700,
    padding: '5px 12px',
    borderRadius: 14,
  },
  bridgeSection: {
    maxWidth: 1160,
    margin: '80px auto 0',
    padding: '0 0 90px',
  },
  bridgeCard: {
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
  bridgeText: {
    maxWidth: 520,
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
  },
};

export default Servicios;