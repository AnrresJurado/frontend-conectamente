import React from 'react';
import { Button } from 'antd';
import {
  ArrowLeftOutlined, CalendarOutlined, TeamOutlined,
  DollarCircleOutlined, SafetyCertificateOutlined, RocketOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from "../../components/Logo";

import imgHero from '../../assets/unete-psicologo/hero.jpeg';
import imgConsulta from '../../assets/unete-psicologo/consulta.jpeg';

const COLORS = {
  primary: '#1d5863',
  primaryDark: '#12414a',
  accent: '#4da6b0',
  accentSoft: '#bce3e6',
  bg: '#f4f9f9',
  card: '#ffffff',
  border: '#e2e8f0',
  textMuted: '#64748b',
};

const BENEFICIOS = [
  {
    icon: <CalendarOutlined />,
    titulo: 'Gestiona tu agenda a tu ritmo',
    texto: 'Define tus propios horarios de atención y bloques disponibles desde tu panel.',
  },
  {
    icon: <TeamOutlined />,
    titulo: 'Conecta con nuevos pacientes',
    texto: 'Accede a personas que buscan activamente acompañamiento psicológico.',
  },
  {
    icon: <DollarCircleOutlined />,
    titulo: 'Impulsa tu práctica profesional',
    texto: 'Haz crecer tu cartera de pacientes sin preocuparte por la parte administrativa.',
  },
  {
    icon: <SafetyCertificateOutlined />,
    titulo: 'Plataforma segura y confiable',
    texto: 'Tus datos y los de tus pacientes están protegidos en todo momento.',
  },
];

const UnetePsicologo: React.FC = () => {
  const navigate = useNavigate();

  const irARegistro = () => {
    // Le pasamos el rol sugerido a Register.tsx para preseleccionar "Psicólogo"
    navigate('/register/psicologo', { state: { rolSugerido: 'PSICOLOGO' } });
  };

  return (
    <div style={styles.page}>
      <style>{`
        .cm-unete-beneficio {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .cm-unete-beneficio:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 26px rgba(29, 88, 99, 0.12);
        }
        .cm-unete-cta:hover {
          filter: brightness(1.08);
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

      {/* HERO DIVIDIDO: texto + imagen */}
      <div style={styles.heroWrapper}>
        <div style={styles.heroText}>
          <Logo size={40} textColor={COLORS.primary} accentColor={COLORS.accent} />
          <span style={styles.eyebrow}>Para profesionales de la salud mental</span>
          <h1 style={styles.heroTitle}>
            Lleva tu práctica clínica
            <br />
            <span style={{ color: COLORS.accent }}>al siguiente nivel</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Únete a ConectaMente y forma parte de una red de psicólogos que
            acompañan a cientos de personas en su bienestar emocional, con
            todas las herramientas que necesitas en un solo lugar.
          </p>
        </div>

        <div style={styles.heroImageWrapper}>
          <img src={imgHero} alt="Psicólogo en sesión" style={styles.heroImage} />
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeNumber}>+500</span>
            <span style={styles.heroBadgeLabel}>pacientes acompañados</span>
          </div>
        </div>
      </div>

      {/* BENEFICIOS */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>¿Por qué unirte a ConectaMente?</h2>
        <p style={styles.sectionSubtitle}>
          Todo lo que necesitas para ejercer tu profesión de forma más simple y organizada.
        </p>

        <div style={styles.grid}>
          {BENEFICIOS.map((b) => (
            <div key={b.titulo} className="cm-unete-beneficio" style={styles.beneficioCard}>
              <div style={styles.beneficioIcon}>{b.icon}</div>
              <div>
                <h3 style={styles.beneficioTitulo}>{b.titulo}</h3>
                <p style={styles.beneficioTexto}>{b.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FRANJA FINAL — foto + CTA */}
      <div style={styles.ctaSection}>
        <div style={styles.ctaBlock}>
          <img src={imgConsulta} alt="Consulta psicológica" style={styles.ctaImage} />
          <div style={styles.ctaOverlay} />
          <div style={styles.ctaContent}>
            <h3 style={styles.ctaTitle}>Empieza a atender pacientes hoy mismo</h3>
            <p style={styles.ctaText}>
              Crea tu perfil profesional en minutos y comienza a recibir
              solicitudes de sesión.
            </p>
            <Button
              type="primary"
              size="large"
              className="cm-unete-cta"
              style={styles.ctaButtonFinal}
              onClick={irARegistro}
            >
              Registrarme como Psicólogo
            </Button>
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
  },
  section: {
    maxWidth: 1160,
    margin: '40px auto 0',
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
  beneficioCard: {
    background: COLORS.card,
    borderRadius: 20,
    padding: '26px 22px',
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 4px 16px rgba(29, 88, 99, 0.06)',
  },
  beneficioIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: COLORS.accentSoft,
    color: COLORS.primary,
    fontSize: 19,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  beneficioTitulo: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 15.5,
    fontWeight: 700,
    margin: '0 0 6px',
  },
  beneficioTexto: {
    color: COLORS.textMuted,
    fontSize: 13.5,
    lineHeight: 1.6,
    margin: 0,
  },
  ctaSection: {
    maxWidth: 1160,
    margin: '20px auto 0',
    padding: '20px 0 70px',
  },
  ctaBlock: {
    position: 'relative',
    borderRadius: 28,
    overflow: 'hidden',
    minHeight: 320,
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 20px 44px rgba(18, 65, 74, 0.28)',
  },
  ctaImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  ctaOverlay: {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(90deg, ${COLORS.primaryDark}f2 30%, ${COLORS.primaryDark}55)`,
  },
  ctaContent: {
    position: 'relative',
    zIndex: 1,
    padding: '40px 48px',
    maxWidth: 520,
  },
  ctaTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 800,
    margin: '0 0 10px',
    lineHeight: 1.25,
  },
  ctaText: {
    color: COLORS.accentSoft,
    fontSize: 15,
    lineHeight: 1.7,
    margin: '0 0 24px',
  },
  ctaButtonFinal: {
    background: '#ffffff',
    borderColor: '#ffffff',
    color: COLORS.primary,
    borderRadius: 26,
    fontWeight: 700,
    height: 48,
    paddingInline: 26,
  },
};

export default UnetePsicologo;