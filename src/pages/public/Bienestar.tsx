import React from 'react';
import { Button } from 'antd';
import {
  ArrowLeftOutlined, BulbOutlined, SmileOutlined,
  CustomerServiceOutlined, ReadOutlined, LoginOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';

// Imágenes locales — colócalas en src/assets/bienestar/
import imgHero from '../../assets/bienestar/hero.jpeg';
import imgRespiracion from '../../assets/bienestar/respiracion.jpeg';
import imgGratitud from '../../assets/bienestar/gratitud.jpeg';
import imgDesconexion from '../../assets/bienestar/desconexion.jpeg';
import imgSueno from '../../assets/bienestar/sueno.jpeg';

const COLORS = {
  primary: '#1d5863',
  primaryDark: '#12414a',
  accent: '#4da6b0',
  accentSoft: '#bce3e6',
  bg: '#eef7f7',
  card: '#ffffff',
  border: '#e2e8f0',
  textMuted: '#64748b',
};

const RECURSOS = [
  {
    img: imgRespiracion,
    icon: <BulbOutlined />,
    titulo: 'Respiración consciente',
    texto: 'Dedica 5 minutos al día a respirar profundamente. Reduce la ansiedad y mejora tu enfoque.',
  },
  {
    img: imgGratitud,
    icon: <SmileOutlined />,
    titulo: 'Gratitud diaria',
    texto: 'Anota 3 cosas por las que te sientes agradecido cada noche. Cambia tu perspectiva con el tiempo.',
  },
  {
    img: imgDesconexion,
    icon: <CustomerServiceOutlined />,
    titulo: 'Desconexión digital',
    texto: 'Reserva bloques del día sin pantallas. Tu mente necesita pausas reales para descansar.',
  },
  {
    img: imgSueno,
    icon: <ReadOutlined />,
    titulo: 'Rutinas de sueño',
    texto: 'Dormir bien es la base del bienestar emocional. Mantén horarios consistentes.',
  },
];

const Bienestar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <style>{`
        .cm-bienestar-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .cm-bienestar-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(29, 88, 99, 0.16);
        }
        .cm-bienestar-cta:hover {
          filter: brightness(1.08);
        }
      `}</style>

      {/* HERO con foto real de fondo */}
      <div style={{ ...styles.hero, backgroundImage: `url(${imgHero})` }}>
        <div style={styles.heroOverlay} />

        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={styles.backButton}
        >
          Volver
        </Button>

        <div style={styles.heroContent}>
          <Logo size={42} textColor="#ffffff" accentColor={COLORS.accentSoft} />
          <span style={styles.heroEyebrow}>ConectaMente · Bienestar</span>
          <h1 style={styles.heroTitle}>
            Cuida tu mente,
            <br />
            un momento a la vez
          </h1>
          <p style={styles.heroSubtitle}>
            Herramientas simples y recursos pensados para acompañarte en tu
            proceso de bienestar emocional y crecimiento personal.
          </p>
        </div>
      </div>

      {/* GRID DE RECURSOS CON IMÁGENES */}
      <div style={styles.section}>

        <div style={styles.grid}>
          {RECURSOS.map((r) => (
            <div key={r.titulo} className="cm-bienestar-card" style={styles.card}>
              <div style={styles.cardImgWrapper}>
                <img src={r.img} alt={r.titulo} style={styles.cardImg} />
                <div style={styles.cardIcon}>{r.icon}</div>
              </div>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{r.titulo}</h3>
                <p style={styles.cardText}>{r.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BLOQUE CTA — Iniciar sesión */}
      <div style={styles.ctaSection}>
        <div style={styles.ctaBlock}>
          <div style={styles.ctaDecor} />
          <div style={styles.ctaContent}>
            <h3 style={styles.ctaTitle}>¿Listo para dar el siguiente paso?</h3>
            <p style={styles.ctaText}>
              Inicia sesión para agendar una sesión con nuestros psicólogos y
              continuar tu proceso de acompañamiento.
            </p>
          </div>
          <Button
            type="primary"
            icon={<LoginOutlined />}
            size="large"
            className="cm-bienestar-cta"
            style={styles.ctaButton}
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
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
  },
  hero: {
    position: 'relative',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '28px 40px 90px',
    minHeight: 420,
    display: 'flex',
    flexDirection: 'column',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(135deg, ${COLORS.primaryDark}ee, ${COLORS.primary}cc 60%, ${COLORS.primaryDark}66)`,
  },
  backButton: {
    position: 'relative',
    zIndex: 2,
    color: '#ffffff',
    fontWeight: 500,
    alignSelf: 'flex-start',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 8,
    maxWidth: 620,
    margin: '30px auto 0',
  },
  heroEyebrow: {
    color: COLORS.accentSoft,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginTop: 18,
  },
  heroTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 800,
    letterSpacing: '-1px',
    lineHeight: 1.2,
    margin: '10px 0 6px',
  },
  heroSubtitle: {
    color: COLORS.accentSoft,
    fontSize: 16,
    lineHeight: 1.7,
    margin: 0,
  },
  section: {
    maxWidth: 1160,
    margin: '-60px auto 0',
    padding: '0 40px 20px',
    position: 'relative',
    zIndex: 2,
  },
  sectionTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: 800,
    margin: 0,
    textAlign: 'center',
  },
  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14.5,
    textAlign: 'center',
    margin: '6px 0 32px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 24,
  },
  card: {
    background: COLORS.card,
    borderRadius: 22,
    overflow: 'hidden',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 6px 20px rgba(29, 88, 99, 0.08)',
    cursor: 'default',
  },
  cardImgWrapper: {
    position: 'relative',
    height: 150,
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  cardIcon: {
    position: 'absolute',
    bottom: -20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 14,
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
    color: '#ffffff',
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 16px rgba(29, 88, 99, 0.3)',
    border: '3px solid #ffffff',
  },
  cardBody: {
    padding: '32px 22px 22px',
  },
  cardTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 700,
    margin: '0 0 8px',
  },
  cardText: {
    color: COLORS.textMuted,
    fontSize: 13.5,
    lineHeight: 1.6,
    margin: 0,
  },
  ctaSection: {
    maxWidth: 1160,
    margin: '0 auto',
    padding: '20px 40px 70px',
  },
  ctaBlock: {
    position: 'relative',
    overflow: 'hidden',
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
    borderRadius: 24,
    padding: '36px 40px',
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    flexWrap: 'wrap',
    boxShadow: '0 16px 36px rgba(18, 65, 74, 0.3)',
  },
  ctaDecor: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
  },
  ctaContent: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    minWidth: 240,
  },
  ctaTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 800,
    margin: '0 0 6px',
  },
  ctaText: {
    color: COLORS.accentSoft,
    fontSize: 14.5,
    margin: 0,
    lineHeight: 1.6,
  },
  ctaButton: {
    position: 'relative',
    zIndex: 1,
    background: '#ffffff',
    borderColor: '#ffffff',
    color: COLORS.primary,
    borderRadius: 24,
    fontWeight: 700,
    height: 48,
    paddingInline: 28,
  },
};

export default Bienestar;