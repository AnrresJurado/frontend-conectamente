// Flujo 3: Diligenciamiento de Test Psicométrico
// Vista real: /mis-tests-psicometricos (rol PACIENTE).
//
// Requiere backend real con datos sembrados: al menos un test psicométrico
// (TENDENCIAS_PERSONALES o BIENESTAR_ACTUAL) ya activado por un psicólogo
// para el paciente de prueba (asignación en estado ACTIVO), de lo contrario
// no aparecerá ningún botón "Comenzar Test" habilitado.
//
// El escenario de error se ejecuta ANTES del happy path y cancela el modal
// sin enviar, para no consumir el único test activo que necesita el happy path.

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

describe('Flujo 3: Diligenciamiento de Test Psicométrico', () => {
  const email = Cypress.env('PACIENTE_EMAIL') || 'paciente.demo@conectamente.com';
  const password = Cypress.env('PACIENTE_PASSWORD') || 'Paciente123*';
  const psicologoEmail = Cypress.env('PSICOLOGO_EMAIL') || 'psicologo.demo@conectamente.com';
  const psicologoPassword = Cypress.env('PSICOLOGO_PASSWORD') || 'Psicologo123*';
  const apiUrl = Cypress.env('API_URL') || 'http://localhost:3000';

  // El happy path completa el test y lo deja en estado COMPLETADO, así que no
  // quedaría ningún "Comenzar Test" habilitado en la siguiente corrida. Se
  // (re)activa por API antes del spec para que sea repetible sin pasos manuales.
  before(() => {
    cy.request('POST', `${apiUrl}/auth/login`, { email, password }).then((pacienteResp) => {
      const payload = JSON.parse(atob(pacienteResp.body.accessToken.split('.')[1]));
      const pacienteId = payload.sub;

      cy.request('POST', `${apiUrl}/auth/login`, {
        email: psicologoEmail,
        password: psicologoPassword,
      }).then((psicologoResp) => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/tests-psicometricos/asignar`,
          headers: { Authorization: `Bearer ${psicologoResp.body.accessToken}` },
          body: { pacienteId, tipoTest: 'TENDENCIAS_PERSONALES' },
        });
      });
    });
  });

  beforeEach(() => {
    iniciarSesionComo(email, password, '/mi-espacio');
    visitarConAnimacionesRapidas('/mis-tests-psicometricos');
  });

  it('Escenario de error: bloquea el envío si quedan preguntas sin responder', () => {
    cy.contains('button', 'Comenzar Test').first().click();
    // El modal tiene 5 preguntas y puede necesitar scroll interno: se valida
    // visibilidad sobre el header (siempre anclado arriba) en vez del
    // contenedor completo, que Cypress puede marcar como "overflowed".
    cy.get('.ant-modal-header').should('be.visible');

    // Responde solo la primera pregunta y deja el resto sin contestar
    cy.get('.ant-modal .cm-pregunta-card')
      .first()
      .find('input[type="radio"]')
      .first()
      .check({ force: true });

    cy.contains('.ant-modal button', 'Enviar Test').click();

    cy.contains(/por favor responde la pregunta/i).should('be.visible');
    // Este Modal no tiene footer propio (footer={null}); al hacer scroll
    // hasta el botón "Enviar Test" el header queda fuera de vista, así que
    // se valida el body, que es lo que permanece visible en cualquier scroll.
    cy.get('.ant-modal-body').should('be.visible');

    // Cierra sin enviar para no consumir el intento del test activo
    cy.get('.ant-modal .ant-modal-close').click({ force: true });
  });

  it('Happy path: responde todas las preguntas y envía el test', () => {
    cy.contains('button', 'Comenzar Test').first().click();
    cy.get('.ant-modal-header', { timeout: 8000 }).should('be.visible');

    cy.get('.ant-modal .cm-pregunta-card').each(($pregunta) => {
      cy.wrap($pregunta).find('input[type="radio"]').first().check({ force: true });
    });

    cy.contains('.ant-modal button', 'Enviar Test').click();

    // El toast de éxito de AntD se autodestruye a los pocos segundos; basta con
    // que haya existido (evita una carrera con su propia animación de salida).
    cy.contains(/test completado exitosamente/i).should('exist');
    cy.get('.ant-modal-header', { timeout: 8000 }).should('not.exist');
    cy.contains('button', 'Test Completado').should('be.disabled');
  });
});
