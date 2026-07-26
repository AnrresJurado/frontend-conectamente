// Flujo 1: Autenticación e Inicio de Sesión
// Requiere backend real corriendo en VITE_API_URL (por defecto http://localhost:3000)
// y un paciente ya existente en la base de datos. Las credenciales se leen de
// variables de entorno de Cypress (ver cypress.env.json, no versionado) con un
// fallback de datos de prueba local para no romper el spec si no se configuran.
describe('Flujo 1: Autenticación e Inicio de Sesión', () => {
  const email = Cypress.env('PACIENTE_EMAIL') || 'paciente.demo@conectamente.com';
  const password = Cypress.env('PACIENTE_PASSWORD') || 'Paciente123*';

  beforeEach(() => {
    cy.visit('/login');
  });

  it('Happy path: inicia sesión con credenciales válidas y navega a la ruta protegida del paciente', () => {
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/mi-espacio');
    cy.contains('Este es un resumen de tu espacio de bienestar').should('be.visible');
  });

  it('Escenario de error: muestra la alerta de credenciales inválidas con clave incorrecta', () => {
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type('ClaveIncorrectaXYZ1');
    cy.get('button[type="submit"]').click();

    cy.contains(/credenciales inválidas/i).should('be.visible');
    cy.url().should('include', '/login');
  });
});
