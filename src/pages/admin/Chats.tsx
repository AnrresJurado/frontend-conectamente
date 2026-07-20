import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Spin, Input, Button, Avatar, Empty } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { chatsService, ChatMessage } from '../../services/chatsService';
import { pacientesService } from '../../services/pacientesService';
import { useAuth } from '../../hooks/useAuth';

// Misma identidad visual que el resto del dashboard
const COLORS = {
  primary: '#1d5863',
  primaryDark: '#12414a',
  accent: '#4da6b0',
  accentSoft: '#bce3e6',
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  textMuted: '#94a3b8',
};

// Contacto normalizado, sin importar si viene de "mi psicólogo" o "mis pacientes"
interface Contacto {
  usuarioId: string;
  nombre: string;
  apellido: string;
}

const POLL_INTERVAL_MS = 4000;

const Chats: React.FC = () => {
  const { user } = useAuth();
  const rol = user?.rol;

  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [contactoActivo, setContactoActivo] = useState<Contacto | null>(null);
  const [mensajes, setMensajes] = useState<ChatMessage[]>([]);
  const [texto, setTexto] = useState('');
  const [loadingContactos, setLoadingContactos] = useState(true);
  const [loadingMensajes, setLoadingMensajes] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Cargar contactos según el rol ──────────────────────────────
  useEffect(() => {
    const cargarContactos = async () => {
      setLoadingContactos(true);
      try {
        const pacientes = await pacientesService.getAll();

        if (rol === 'PACIENTE') {
          // El backend filtra /pacientes por token: para un PACIENTE, debería
          // devolver su propio expediente (con su psicólogo asignado adentro).
          const miExpediente: any = pacientes[0];
          const psic = miExpediente?.psicologo;

          if (psic?.usuario?.id) {
            setContactos([
              {
                usuarioId: psic.usuario.id,
                nombre: psic.usuario.nombre || 'Tu',
                apellido: psic.usuario.apellido || 'psicólogo',
              },
            ]);
          } else {
            setContactos([]);
          }
        } else if (rol === 'PSICOLOGO') {
          // Para un PSICOLOGO, /pacientes ya devuelve solo sus pacientes.
          const lista = (pacientes as any[])
            .filter((p) => p?.usuario?.id)
            .map((p) => ({
              usuarioId: p.usuario.id,
              nombre: p.usuario.nombre || '',
              apellido: p.usuario.apellido || '',
            }));
          setContactos(lista);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingContactos(false);
      }
    };

    if (user) cargarContactos();
  }, [user, rol]);

  // Selecciona automáticamente el primer contacto disponible
  useEffect(() => {
    if (!contactoActivo && contactos.length > 0) {
      setContactoActivo(contactos[0]);
    }
  }, [contactos, contactoActivo]);

  // ── Cargar historial + polling mientras haya un contacto activo ─
  useEffect(() => {
    if (!contactoActivo) return;

    const cargarHistorial = async (mostrarLoading: boolean) => {
      if (mostrarLoading) setLoadingMensajes(true);
      try {
        const data = await chatsService.obtenerHistorial(contactoActivo.usuarioId);
        setMensajes(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (mostrarLoading) setLoadingMensajes(false);
      }
    };

    cargarHistorial(true);

    pollRef.current = setInterval(() => cargarHistorial(false), POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [contactoActivo]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = async () => {
    const mensaje = texto.trim();
    if (!mensaje || !contactoActivo || enviando) return;

    setEnviando(true);
    try {
      const nuevo = await chatsService.enviarMensaje({
        destinatarioId: contactoActivo.usuarioId,
        mensaje,
      });
      setMensajes((prev) => [...prev, nuevo]);
      setTexto('');
    } catch (error) {
      console.error(error);
    } finally {
      setEnviando(false);
    }
  };

  const iniciales = (nombre: string, apellido: string) =>
    `${nombre.charAt(0) || ''}${apellido.charAt(0) || ''}`.toUpperCase() || 'CM';

  const tituloVacio = useMemo(() => {
    if (rol === 'PACIENTE') return 'Aún no tienes un psicólogo asignado.';
    return 'Aún no tienes pacientes asignados para chatear.';
  }, [rol]);

  if (loadingContactos) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0', background: COLORS.bg, minHeight: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        {/* LISTA DE CONTACTOS */}
        <div style={styles.contactsPanel}>
          <div style={styles.contactsHeader}>
            <span style={styles.contactsTitle}>
              {rol === 'PACIENTE' ? 'Tu psicólogo' : 'Tus pacientes'}
            </span>
          </div>

          {contactos.length === 0 ? (
            <div style={styles.emptyContacts}>
              <Empty description={tituloVacio} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ) : (
            <div style={styles.contactsList}>
              {contactos.map((c) => {
                const activo = contactoActivo?.usuarioId === c.usuarioId;
                return (
                  <button
                    key={c.usuarioId}
                    onClick={() => setContactoActivo(c)}
                    style={{ ...styles.contactItem, ...(activo ? styles.contactItemActivo : {}) }}
                  >
                    <Avatar
                      size={38}
                      style={{
                        background: activo
                          ? 'rgba(255,255,255,0.2)'
                          : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
                        color: '#ffffff',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {iniciales(c.nombre, c.apellido)}
                    </Avatar>
                    <span style={styles.contactName}>
                      {c.nombre} {c.apellido}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* CONVERSACIÓN */}
        <div style={styles.chatPanel}>
          {!contactoActivo ? (
            <div style={styles.emptyChat}>
              <Empty description={tituloVacio} />
            </div>
          ) : (
            <>
              <div style={styles.chatHeader}>
                <Avatar
                  size={36}
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                >
                  {iniciales(contactoActivo.nombre, contactoActivo.apellido)}
                </Avatar>
                <span style={styles.chatHeaderName}>
                  {contactoActivo.nombre} {contactoActivo.apellido}
                </span>
              </div>

              <div ref={scrollRef} style={styles.messagesArea}>
                {loadingMensajes ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin />
                  </div>
                ) : mensajes.length === 0 ? (
                  <div style={styles.emptyChat}>
                    <Empty description="Todavía no hay mensajes. ¡Escribe el primero!" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  </div>
                ) : (
                  mensajes.map((m) => {
                    const esMio = m.remitenteId === user?.id;
                    return (
                      <div
                        key={m._id}
                        style={{
                          ...styles.bubbleRow,
                          justifyContent: esMio ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            ...styles.bubble,
                            ...(esMio ? styles.bubbleMio : styles.bubbleOtro),
                          }}
                        >
                          <span>{m.mensaje}</span>
                          {m.enviadoEn && (
                            <span style={{ ...styles.bubbleTime, ...(esMio ? { color: 'rgba(255,255,255,0.7)' } : {}) }}>
                              {new Date(m.enviadoEn).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={styles.inputRow}>
                <Input
                  placeholder="Escribe un mensaje..."
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onPressEnter={handleEnviar}
                  disabled={enviando}
                  style={styles.input}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleEnviar}
                  loading={enviando}
                  disabled={!texto.trim()}
                  style={styles.sendButton}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: COLORS.bg,
    minHeight: '100%',
    padding: '36px 40px 40px',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  shell: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: 20,
    height: 'calc(100vh - 160px)',
    minHeight: 480,
  },
  contactsPanel: {
    background: COLORS.card,
    borderRadius: 20,
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  contactsHeader: {
    padding: '18px 20px',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  contactsTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontWeight: 700,
    fontSize: 15,
  },
  contactsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 10,
    overflowY: 'auto',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 14,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s ease',
  },
  contactItemActivo: {
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
  },
  contactName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#334155',
  },
  emptyContacts: {
    padding: '40px 16px',
  },
  chatPanel: {
    background: COLORS.card,
    borderRadius: 20,
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 4px 20px rgba(29, 88, 99, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 22px',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  chatHeaderName: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    color: COLORS.primary,
    fontSize: 15,
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    background: COLORS.bg,
  },
  bubbleRow: {
    display: 'flex',
  },
  bubble: {
    maxWidth: '65%',
    padding: '10px 14px',
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 1.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  bubbleMio: {
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
    color: '#ffffff',
    borderBottomRightRadius: 4,
  },
  bubbleOtro: {
    background: '#ffffff',
    color: '#334155',
    border: `1px solid ${COLORS.border}`,
    borderBottomLeftRadius: 4,
  },
  bubbleTime: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    alignSelf: 'flex-end',
  },
  emptyChat: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    display: 'flex',
    gap: 10,
    padding: '14px 18px',
    borderTop: `1px solid ${COLORS.border}`,
  },
  input: {
    borderRadius: 20,
    padding: '8px 16px',
  },
  sendButton: {
    borderRadius: '50%',
    width: 42,
    height: 42,
    background: COLORS.primary,
    borderColor: COLORS.primary,
    flexShrink: 0,
  },
};

export default Chats;