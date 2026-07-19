import React from 'react';
import { Button } from 'antd';
import {
  ArrowLeftOutlined, HeartOutlined, MessageOutlined,
  LockOutlined, ThunderboltOutlined, ClockCircleOutlined,
  SmileOutlined, CompassOutlined, TeamOutlined, HomeOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from "../../components/Logo";

import imgHero from '../../assets/grupos-apoyo/hero.jpg';

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

const TEMAS = [
  { icon: <ThunderboltOutlined />, titulo: 'Ansiedad', texto: 'Herramientas para manejar la preocupación constante.' },
  { icon: <HeartOutlined />, titulo: 'Duelo', texto: 'Un espacio para procesar la pérdida junto a otros.' },
  { icon: <ClockCircleOutlined />, titulo: 'Estrés laboral', texto: 'Comparte y aprende a poner límites saludables.' },
  { icon: <SmileOutlined />, titulo: 'Autoestima', texto: 'Trabaja tu relación contigo mismo en comunidad.' },
  { icon: <CompassOutlined />, titulo: 'Cambios de vida', texto: 'Acompañamiento en transiciones y nuevas etapas.' },
  { icon: <TeamOutlined />, titulo: 'Relaciones', texto: 'Reflexiona sobre tus vínculos con otras personas.' },
  { icon: <HomeOutlined />, titulo: 'Soledad', texto: 'Encuentra compañía real en quienes te entienden.' },
  { icon: <HeartOutlined />, titulo: 'Maternidad y paternidad', texto: 'Comparte la crianza con quienes viven lo mismo.' },
];

const GruposApoyo: React.FC = () => {
  const navigate = useNavigate();

  const irARegistro = () => {
    navigate('/register');
  };

  return (
    <div style={styles.page}>
      <style>{`
        .cm-ga-tema:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 26px rgba(29, 88, 99, 0.12);
        }
        .cm-ga-tema {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .cm-ga-bento:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 30px rgba(29, 88, 99, 0.14);
        }
        .cm-ga-bento {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .cm-ga-cta:hover {
          filter: brightness(1.08);
        }
      `}</style>

      <div style={styles.heroDark}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={styles.backButton}
        >
          Volver
        </Button>

        <div style={styles.heroInner}>
          <div style={styles.heroTextCol}>
            <Logo size={40} textColor="#ffffff" accentColor={COLORS.accentSoft} />
            <span style={styles.eyebrow}>Acompañamiento colectivo</span>
            <h1 style={styles.heroTitle}>
              No tienes que
              <br />
              <span style={{ color: COLORS.accentSoft }}>pasar por esto solo</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Espacios de escucha guiados por un psicólogo, donde varias
              personas comparten experiencias similares y encuentran
              respaldo colectivo.
            </p>
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              className="cm-ga-cta"
              style={styles.ctaButtonHero}
              onClick={irARegistro}
            >
              Unirme a un grupo
            </Button>
          </div>

          <div style={styles.heroImageCol}>
            <img src={imgHero} alt="Grupo de apoyo" style={styles.heroImage} />
          </div>
        </div>
      </div>

      {/* TEMAS - informativo, no filtro */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          Grupos disponibles según <span style={{ color: COLORS.accent }}>lo que estés viviendo</span>
        </h2>
        <p style={styles.sectionSubtitle}>
          Cada grupo está guiado por un psicólogo y reúne a personas que atraviesan un momento similar al tuyo.
        </p>

        <div style={styles.temasGrid}>
          {TEMAS.map((t) => (
            <div key={t.titulo} className="cm-ga-tema" style={styles.temaCard}>
              <div style={styles.temaIcon}>{t.icon}</div>
              <h3 style={styles.temaTitulo}>{t.titulo}</h3>
              <p style={styles.temaTexto}>{t.texto}</p>
            </div>
          ))}
        </div>
      </div>

      {/* QUÉ ES - texto con cifra destacada */}
      <div style={styles.infoSection}>
        <div style={styles.infoTextCol}>
          <span style={styles.infoEyebrow}>¿Qué es un grupo de apoyo?</span>
          <h2 style={styles.infoTitle}>
            Un espacio seguro para <span style={{ color: COLORS.accent }}>compartir, escuchar</span> y sentirte comprendido
          </h2>
          <p style={styles.infoText}>
            Reúne, de forma virtual, a un pequeño número de personas que
            atraviesan situaciones similares, junto a un psicólogo que guía
            la conversación. No reemplaza la terapia individual, la
            complementa: aquí se comparten vivencias, herramientas y se
            construye una red de apoyo real.
          </p>
        </div>
        <div style={styles.infoStatCol}>
          <span style={styles.infoStatNumber}>6–8</span>
          <span style={styles.infoStatLabel}>personas por grupo, para que cada voz tenga espacio</span>
        </div>
      </div>

      {/* BENEFICIOS - bento */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>La importancia de sentirte acompañado</h2>
        <p style={styles.sectionSubtitle}>
          Compartir tu proceso con otros reduce la sensación de aislamiento.
        </p>

        <div style={styles.bentoGrid}>
          <div className="cm-ga-bento" style={styles.bentoLarge}>
            <div style={styles.bentoIconLarge}><HeartOutlined /></div>
            <h3 style={styles.bentoTituloLarge}>Te sientes acompañado</h3>
            <p style={styles.bentoTextoLarge}>
              Descubrir que otras personas viven algo parecido a lo tuyo
              alivia el peso de sentirte solo en tu proceso, y abre la
              puerta a nuevas formas de mirar tu situación.
            </p>
          </div>

          <div className="cm-ga-bento" style={styles.bentoSmall}>
            <div style={styles.bentoIconSmall}><MessageOutlined /></div>
            <h3 style={styles.bentoTituloSmall}>Escucha real</h3>
            <p style={styles.bentoTextoSmall}>Habla y escucha sin juicio, guiado por un profesional.</p>
          </div>

          <div className="cm-ga-bento" style={styles.bentoSmall}>
            <div style={styles.bentoIconSmall}><LockOutlined /></div>
            <h3 style={styles.bentoTituloSmall}>Confidencial</h3>
            <p style={styles.bentoTextoSmall}>Lo que se comparte, se queda dentro del grupo.</p>
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
  heroDark: {
    background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
    padding: '20px 40px 60px',
  },
  backButton: {
    color: '#ffffff',
    fontWeight: 500,
    paddingLeft: 0,
  },
  heroInner: {
    maxWidth: 1160,
    margin: '10px auto 0',
    display: 'flex',
    alignItems: 'center',
    gap: 48,
    flexWrap: 'wrap',
  },
  heroTextCol: {
    flex: '1 1 420px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  eyebrow: {
    color: COLORS.accentSoft,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginTop: 22,
  },
  heroTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#ffffff',
    fontSize: 42,
    fontWeight: 800,
    letterSpacing: '-1px',
    lineHeight: 1.18,
    margin: '12px 0 16px',
  },
  heroSubtitle: {
    color: COLORS.accentSoft,
    fontSize: 16,
    lineHeight: 1.7,
    margin: '0 0 30px',
    maxWidth: 460,
  },
  ctaButtonHero: {
    background: '#ffffff',
    borderColor: '#ffffff',
    color: COLORS.primary,
    borderRadius: 26,
    fontWeight: 700,
    height: 50,
    paddingInline: 28,
    width: 'fit-content',
    boxShadow: '0 10px 24px rgba(0,0,0,0.2)',
  },
  heroImageCol: {
    flex: '1 1 380px',
    maxWidth: 460,
  },
  heroImage: {
    width: '100%',
    height: 340,
    objectFit: 'cover',
    borderRadius: 24,
    boxShadow: '0 24px 60px rgba(18, 65, 74, 0.35)',
    border: '6px solid rgba(255,255,255,0.9)',
    display: 'block',
  },
  section: {
    maxWidth: 1160,
    margin: '80px auto 0',
    padding: '0 40px 20px',
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
    maxWidth: 560,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  temasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 18,
  },
  temaCard: {
    background: COLORS.card,
    borderRadius: 18,
    padding: '22px 20px',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 4px 14px rgba(29, 88, 99, 0.05)',
  },
  temaIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    background: COLORS.accentSoft,
    color: COLORS.primary,
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  temaTitulo: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: 700,
    margin: '0 0 6px',
  },
  temaTexto: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 1.55,
    margin: 0,
  },
  infoSection: {
    maxWidth: 1160,
    margin: '10px auto 0',
    padding: '0 40px',
    display: 'flex',
    gap: 32,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  infoTextCol: {
    flex: '2 1 480px',
  },
  infoEyebrow: {
    color: COLORS.accent,
    fontSize: 12.5,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  infoTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: 800,
    margin: '12px 0 14px',
    lineHeight: 1.3,
  },
  infoText: {
    color: COLORS.textMuted,
    fontSize: 15.5,
    lineHeight: 1.8,
    margin: 0,
  },
  infoStatCol: {
    flex: '1 1 220px',
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 24,
    padding: '32px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    boxShadow: '0 10px 26px rgba(29, 88, 99, 0.08)',
  },
  infoStatNumber: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 40,
    fontWeight: 800,
  },
  infoStatLabel: {
    color: COLORS.textMuted,
    fontSize: 13.5,
    lineHeight: 1.6,
  },
  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridAutoRows: 'auto',
    gap: 20,
  },
  bentoLarge: {
    gridColumn: 'span 2',
    background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
    borderRadius: 24,
    padding: '36px 40px',
    color: '#ffffff',
  },
  bentoIconLarge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.15)',
    color: '#ffffff',
    fontSize: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  bentoTituloLarge: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 20,
    fontWeight: 800,
    margin: '0 0 8px',
  },
  bentoTextoLarge: {
    color: COLORS.accentSoft,
    fontSize: 14.5,
    lineHeight: 1.7,
    margin: 0,
    maxWidth: 560,
  },
  bentoSmall: {
    gridColumn: 'span 1',
    background: COLORS.card,
    borderRadius: 20,
    padding: '26px 22px',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 4px 16px rgba(29, 88, 99, 0.06)',
  },
  bentoIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: COLORS.accentSoft,
    color: COLORS.primary,
    fontSize: 17,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 14,
  },
  bentoTituloSmall: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 15.5,
    fontWeight: 700,
    margin: '0 0 6px',
  },
  bentoTextoSmall: {
    color: COLORS.textMuted,
    fontSize: 13.5,
    lineHeight: 1.6,
    margin: 0,
  },
  quoteSection: {
    maxWidth: 1160,
    margin: '80px auto 0',
    padding: '0 40px 90px',
    display: 'flex',
    justifyContent: 'center',
  },
  quoteCard: {
    maxWidth: 680,
    textAlign: 'center',
    position: 'relative',
  },
  quoteMark: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 64,
    color: COLORS.accentSoft,
    lineHeight: 1,
    display: 'block',
  },
  quoteText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 1.6,
    margin: '0 0 16px',
  },
  quoteAuthor: {
    color: COLORS.textMuted,
    fontSize: 13.5,
  },
};

export default GruposApoyo;