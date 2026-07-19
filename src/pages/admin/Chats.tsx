import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Avatar, Input, Button, Empty, Spin } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { chatsService, ChatMessage } from '../../services/chatsService';
import { pacientesService } from '../../services/pacientesService';
import { psicologosService } from '../../services/psicologosService';

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

const POLL_MS = 4000;

// ---------------------------------------------------------------------
// Helpers "a prueba de balas": tu tipo Paciente puede traer el id de
// usuario y el psicólogo asignado bajo distintos nombres de campo según
// cómo lo mapeaste en el backend/DTO. Estas funciones prueban varias
// rutas comunes. AJUSTA AQUÍ si tu campo real tiene otro nombre.
// ---------------------------------------------------------------------
const getPacienteUsuarioId = (p: any): string | undefined =>
  p?.usuario?.id ?? p?.usuarioId ?? p?.userId ?? p?.id;

const getPacienteNombre = (p: any): string =>
  `${p?.usuario?.nombre ?? p?.nombre ?? ''} ${p?.usuario?.apellido ?? p?.apellido ?? ''}`.trim() || 'Paciente';

const getPacientePsicologoId = (p: any): string | undefined =>
  p?.psicologo?.usuario?.id ??
  p?.psicologo?.id ??
  p?.psicologoId ??
  p?.perfilPsicologo?.usuario?.id ??
  undefined;

const getPacientePsicologoNombre = (p: any): string | undefined => {
  const nombre = p?.psicologo?.usuario?.nombre ?? p?.psicologo?.nombre;
  const apellido = p?.psicologo?.usuario?.apellido ?? p?.psicologo?.apellido;
  if (!nombre) return undefined;
  return `${nombre} ${apellido ?? ''}`.trim();
};

interface Contacto {
  id: string;       // id de usuario, usado como destinatarioId
  nombre: string;
}

const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('') || 'U';

const Chats: React.FC = () => {
  const { user } = useAuth();
  const esPsicologo = user?.rol === 'PSICOLOGO';
  const esPaciente = user?.rol === 'PACIENTE';

  const [cargandoContactos, setCargandoContactos] = useState(true);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [contactoActivo, setContactoActivo] = useState<Contacto | null>(null);

  const [mensajes, setMensajes] = useState<ChatMessage[]>([]);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // -------- Carga inicial de contactos según el rol --------
  useEffect(() => {
    const cargarContactos = async () => {
      setCargandoContactos(true);
      try {
        if (esPsicologo) {
          // Pacientes cuyo psicólogo asignado soy yo
          const pacientes = await pacientesService.getAll();
          const propios = pacientes.filter(
            (p: any) => getPacientePsicologoId(p) === user?.id
          );
          const lista: Contacto[] = propios
            .map((p: any) => ({
              id: getPacienteUsuarioId(p) as string,
              nombre: getPacienteNombre(p),
            }))
            .filter((c) => !!c.id);
          setContactos(lista);
          if (lista.length > 0) setContactoActivo(lista[0]);
        } else if (esPaciente) {
          // Mi propio expediente, para sacar mi psicólogo asignado
          const pacientes = await pacientesService.getAll();
          const yo = (pacientes as any[]).find(
            (p) => getPacienteUsuarioId(p) === user?.id
          );
          const psicologoId = yo ? getPacientePsicologoId(yo) : undefined;

          if (psicologoId) {
            let nombre = yo ? getPacientePsicologoNombre(yo) : undefined;
            if (!nombre) {
              // Fallback: buscamos su nombre en la lista general de psicólogos
              try {
                const psicologos = await psicologosService.getAll();
                const encontrado = psicologos.find((p: any) => p.id === psicologoId);
                nombre = encontrado
                  ? `${encontrado.usuario.nombre} ${encontrado.usuario.apellido}`.trim()
                  : 'Tu psicólogo';
              } catch {
                nombre = 'Tu psicólogo';
              }
            }
            const contacto = { id: psicologoId, nombre: nombre || 'Tu psicólogo' };
            setContactos([contacto]);
            setContactoActivo(contacto);
          } else {
            setContactos([]);
            setContactoActivo(null);
          }
        }
      } catch (err) {
        console.error('Error cargando contactos de chat', err);
        setContactos([]);
      } finally {
        setCargandoContactos(false);
      }
    };

    if (user) cargarContactos();
  }, [user, esPsicologo, esPaciente]);

  // -------- Carga + polling de historial con el contacto activo --------
  const cargarHistorial = useCallback(
    async (silencioso = false) => {
      if (!contactoActivo) return;
      if (!silencioso) setCargandoMensajes(true);
      try {
        const historial = await chatsService.obtenerHistorial(contactoActivo.id);
        setMensajes(historial);
      } catch (err) {
        console.error('Error cargando historial de chat', err);
      } finally {
        if (!silencioso) setCargandoMensajes(false);
      }
    },
    [contactoActivo]
  );

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    setMensajes([]);
    if (!contactoActivo) return;

    cargarHistorial(false);
    pollRef.current = setInterval(() => cargarHistorial(true), POLL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [contactoActivo, cargarHistorial]);

  // -------- Autoscroll al último mensaje --------
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = async () => {
    const mensaje = texto.trim();
    if (!mensaje || !contactoActivo || enviando) return;

    setEnviando(true);
    setTexto('');
    try {
      const nuevo = await chatsService.enviarMensaje({
        destinatarioId: contactoActivo.id,
        mensaje,
      });
      setMensajes((prev) => [...prev, nuevo]);
    } catch (err) {
      console.error('Error enviando mensaje', err);
      setTexto(mensaje); // devolvemos el texto si falló
    } finally {
      setEnviando(false);
    }
  };

  if (!user) return null;

  return (
    <div style={styles.page}>
      {/* SIDEBAR DE CONTACTOS: solo tiene sentido para el psicólogo (varios pacientes) */}
      {esPsicologo && (
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <span style={styles.sidebarTitle}>Mis pacientes</span>
          </div>

          {cargandoContactos ? (
            <div style={styles.centerBox}><Spin /></div>
          ) : contactos.length === 0 ? (
            <div style={styles.centerBox}>
              <Empty description="Aún no tienes pacientes asignados" />
            </div>
          ) : (
            <div style={styles.contactList}>
              {contactos.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setContactoActivo(c)}
                  style={{
                    ...styles.contactItem,
                    ...(contactoActivo?.id === c.id ? styles.contactItemActivo : {}),
                  }}
                >
                  <Avatar size={38} style={styles.avatar}>{iniciales(c.nombre)}</Avatar>
                  <span style={styles.contactNombre}>{c.nombre}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VENTANA DE CONVERSACIÓN */}
      <div style={styles.chatWindow}>
        {cargandoContactos ? (
          <div style={styles.centerBoxFull}><Spin size="large" /></div>
        ) : !contactoActivo ? (
          <div style={styles.centerBoxFull}>
            <Empty
              description={
                esPaciente
                  ? 'Aún no tienes un psicólogo asignado.'
                  : 'Selecciona un paciente para comenzar a chatear.'
              }
            />
          </div>
        ) : (
          <>
            <div style={styles.chatHeader}>
              <Avatar size={40} style={styles.avatar}>{iniciales(contactoActivo.nombre)}</Avatar>
              <div>
                <div style={styles.chatHeaderNombre}>{contactoActivo.nombre}</div>
                <div style={styles.chatHeaderRol}>{esPaciente ? 'Psicólogo/a' : 'Paciente'}</div>
              </div>
            </div>

            <div style={styles.messagesArea} ref={scrollRef}>
              {cargandoMensajes ? (
                <div style={styles.centerBox}><Spin /></div>
              ) : mensajes.length === 0 ? (
                <div style={styles.centerBox}>
                  <Empty description="Aún no hay mensajes. ¡Escribe el primero!" />
                </div>
              ) : (
                mensajes.map((m) => {
                  const esMio = m.remitenteId === user.id;
                  return (
                    <div
                      key={m._id}
                      style={{
                        ...styles.bubbleRow,
                        justifyContent: esMio ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div style={esMio ? styles.bubbleMio : styles.bubbleOtro}>
                        <span>{m.mensaje}</span>
                        {m.enviadoEn && (
                          <span style={esMio ? styles.horaMio : styles.horaOtro}>
                            {new Date(m.enviadoEn).toLocaleTimeString('es-EC', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={styles.inputBar}>
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
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    display: 'flex',
    height: 'calc(100vh - 80px)',
    background: COLORS.bg,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  sidebar: {
    width: 300,
    flexShrink: 0,
    background: '#ffffff',
    borderRight: `1px solid ${COLORS.border}`,
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: '20px 20px 14px',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  sidebarTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 700,
  },
  contactList: {
    flex: 1,
    overflowY: 'auto',
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 12,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
  },
  contactItemActivo: {
    background: COLORS.accentSoft,
  },
  contactNombre: {
    fontSize: 14,
    fontWeight: 600,
    color: '#334155',
  },
  chatWindow: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: COLORS.bg,
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 24px',
    background: '#ffffff',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  chatHeaderNombre: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: 700,
  },
  chatHeaderRol: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  bubbleRow: {
    display: 'flex',
    width: '100%',
  },
  bubbleMio: {
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: '16px 16px 4px 16px',
    maxWidth: '60%',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 14,
    lineHeight: 1.5,
  },
  bubbleOtro: {
    background: '#ffffff',
    color: '#334155',
    border: `1px solid ${COLORS.border}`,
    padding: '10px 16px',
    borderRadius: '16px 16px 16px 4px',
    maxWidth: '60%',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 14,
    lineHeight: 1.5,
  },
  horaMio: {
    fontSize: 10.5,
    color: COLORS.accentSoft,
    alignSelf: 'flex-end',
  },
  horaOtro: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    alignSelf: 'flex-end',
  },
  inputBar: {
    display: 'flex',
    gap: 10,
    padding: '16px 24px',
    background: '#ffffff',
    borderTop: `1px solid ${COLORS.border}`,
  },
  input: {
    borderRadius: 20,
    height: 42,
  },
  sendButton: {
    background: COLORS.primary,
    borderColor: COLORS.primary,
    borderRadius: 20,
    height: 42,
    width: 46,
  },
  avatar: {
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
    fontWeight: 700,
    flexShrink: 0,
  },
  centerBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 10px',
  },
  centerBoxFull: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default Chats;