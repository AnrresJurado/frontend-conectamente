// Flujo 2: Agendamiento o Solicitud de Cita
// Cubre las dos vistas reales donde un usuario autenticado interactúa con citas/psicólogos:
//   1. /buscar-psicologo (rol PACIENTE): solicitud de vinculación con un psicólogo.
//   2. /dashboard/citas (rol PSICOLOGO/ADMIN): agendamiento real de la cita.
//
// NOTA: la app no expone ningún data-testid, por lo que los selectores de los
// <Select> de AntD se ubican por posición dentro del formulario. Si se agregan
// data-testid en el futuro, reemplazar estos selectores por algo más robusto.
//
// Requiere backend real con datos sembrados:
//   - Un usuario PACIENTE y un usuario PSICOLOGO/ADMIN de prueba (ver credenciales abajo).
//   - Al menos un psicólogo visible en /buscar-psicologo.
//   - Para /dashboard/citas: al menos un paciente ya vinculado al psicólogo de prueba
//     y al menos un bloque de agenda libre (estaReservado: false).

// Los modales de AntD entran/salen con una animación CSS por keyframes
// (.ant-zoom-appear). En Electron headless a veces no termina de correr dentro
// del timeout por defecto y el modal queda "atascado" en opacity:0. En vez de
// desactivarla del todo (eso la deja congelada en el keyframe 0%, que es
// justo el estado con opacity:0), se acorta su duración a casi cero para que
// siga corriendo hasta su estado final (opacity:1) de forma casi instantánea.
const visitarConAnimacionesRapidas = (url: string) => {
  cy.visit(url, {
    onBeforeLoad(win) {
      const estilo = win.document.createElement('style');
      estilo.innerHTML = '*, *::before, *::after { transition-duration: 0.15s !important; animation-duration: 0.15s !important; }';
      win.document.head.appendChild(estilo);
    },
  });
};

const iniciarSesionComo = (email: string, password: string, rutaEsperada: string) => {
  visitarConAnimacionesRapidas('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', rutaEsperada);
};

describe('Flujo 2: Solicitud de vinculación (paciente) — /buscar-psicologo', () => {
  const email = Cypress.env('PACIENTE_EMAIL') || 'paciente.demo@conectamente.com';
  const password = Cypress.env('PACIENTE_PASSWORD') || 'Paciente123*';

  beforeEach(() => {
    iniciarSesionComo(email, password, '/mi-espacio');
    visitarConAnimacionesRapidas('/buscar-psicologo');
  });

  it('Happy path: envía una solicitud de atención a un psicólogo del catálogo', () => {
    cy.contains('button', 'Solicitar atención').first().click();

    cy.get('.ant-modal').should('be.visible');
    cy.get('.ant-modal textarea').type(
      'Hola, requiero acompañamiento por estrés y ansiedad constante.'
    );
    cy.contains('.ant-modal-footer button', 'Enviar solicitud').click();

    cy.contains(/solicitud enviada con éxito/i).should('be.visible');
    // Este Modal no usa destroyOnClose, así que el nodo persiste oculto en el DOM
    cy.get('.ant-modal').should('not.be.visible');
  });

  it('Escenario de error: bloquea el envío si el mensaje queda vacío', () => {
    cy.contains('button', 'Solicitar atención').first().click();
    cy.get('.ant-modal').should('be.visible');

    cy.contains('.ant-modal-footer button', 'Enviar solicitud').click();

    cy.contains(/cuéntanos brevemente el motivo de tu consulta/i).should('be.visible');
    cy.get('.ant-modal').should('be.visible');
  });
});

describe('Flujo 2: Agendamiento de cita (psicólogo/admin) — /dashboard/citas', () => {
  const email = Cypress.env('PSICOLOGO_EMAIL') || 'psicologo.demo@conectamente.com';
  const password = Cypress.env('PSICOLOGO_PASSWORD') || 'Psicologo123*';
  const apiUrl = Cypress.env('API_URL') || 'http://localhost:3000';

  // El happy path consume el bloque de agenda libre que selecciona (queda
  // reservado al crear la cita). Se siembra uno nuevo por API antes de correr
  // el spec para que sea repetible sin depender de datos creados a mano.
  before(() => {
    cy.request('POST', `${apiUrl}/auth/login`, { email, password }).then((resp) => {
      const token = resp.body.accessToken;
      const fechaHoraInicio = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * (3 + Math.floor(Math.random() * 90))
      ).toISOString();
      cy.request({
        method: 'POST',
        url: `${apiUrl}/agendas`,
        headers: { Authorization: `Bearer ${token}` },
        body: { fechaHoraInicio },
      });
    });
  });

  beforeEach(() => {
    iniciarSesionComo(email, password, '/dashboard');
    visitarConAnimacionesRapidas('/dashboard/citas');
  });

  it('Happy path: agenda una cita seleccionando paciente, horario y motivo', () => {
    cy.contains('button', 'Agendar Nueva Cita').click();
    cy.get('.ant-modal').should('be.visible');

    // Selector de paciente (primer <Select> del formulario)
    cy.get('.ant-modal .ant-select').eq(0).click();
    cy.get('.ant-select-dropdown:visible .ant-select-item-option').first().click();

    // Selector de horario de agenda (segundo <Select> del formulario)
    cy.get('.ant-modal .ant-select').eq(1).click();
    cy.get('.ant-select-dropdown:visible .ant-select-item-option').first().click();

    cy.get('.ant-modal textarea').type('Sesión de seguimiento de control mensual.');
    cy.contains('.ant-modal button', 'Confirmar Reserva').click();

    cy.contains(/cita médica agendada de manera exitosa/i).should('be.visible');
    cy.get('.ant-modal').should('not.exist');
  });

  it('Escenario de error: bloquea la reserva si faltan campos obligatorios', () => {
    cy.contains('button', 'Agendar Nueva Cita').click();
    cy.get('.ant-modal').should('be.visible');

    cy.contains('.ant-modal button', 'Confirmar Reserva').click();

    cy.contains('Por favor selecciona el paciente').should('be.visible');
    cy.contains('Por favor selecciona un horario libre').should('be.visible');
    cy.contains('Por favor describe brevemente el motivo').should('be.visible');
    cy.get('.ant-modal').should('be.visible');
  });
});
