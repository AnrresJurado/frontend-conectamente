import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import Dashboard from '../pages/admin/Dashboard';
import Pacientes from '../pages/admin/Pacientes';
import Psicologos from '../pages/admin/Psicologos'; 
import Citas from '../pages/admin/Citas'; 
import Agenda from '../pages/admin/Agenda'; // 🚀 Importamos tu nueva pantalla de Agenda
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* --- RUTAS PÚBLICAS --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* --- RUTAS PRIVADAS COMPARTIDAS --- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>

      {/* --- RUTAS PRIVADAS COMPARTIDAS (ADMIN / PSICOLOGO) --- */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PSICOLOGO']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/pacientes" element={<Pacientes />} />
          <Route path="/dashboard/citas" element={<Citas />} /> 
          <Route path="/dashboard/agenda" element={<Agenda />} /> {/* 🚀 Registramos la ruta protegida de la Agenda */}
        </Route>
      </Route>

      {/* --- RUTAS PRIVADAS EXCLUSIVAS DE ADMINISTRACIÓN --- */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/psicologos" element={<Psicologos />} />
        </Route>
      </Route>

      {/* Redirección por defecto si entran a una ruta inexistente */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;