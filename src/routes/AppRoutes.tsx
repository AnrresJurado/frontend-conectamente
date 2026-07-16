import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Importaciones de tus páginas reales
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Dashboard from '../pages/admin/Dashboard';
import Pacientes from '../pages/admin/Pacientes';
import Register from "../pages/public/Register";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ---------------- RUTAS PÚBLICAS ---------------- */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* ---------------- RUTAS PRIVADAS PROTEGIDAS ---------------- */}
      {/* Accesible por cualquier usuario autenticado */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Rutas exclusivas para Personal Administrativo o Médicos */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PSICOLOGO']} />}>
        <Route path="/dashboard/pacientes" element={<Pacientes />} />
        {/* Aquí tus compañeros irán acoplando el resto de CRUDs (Citas, Historial, etc.) */}
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />


      <Route path="/registro" element={<Register />} />
    </Routes>

  );
};

export default AppRoutes;