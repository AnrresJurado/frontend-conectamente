import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* 🚀 ¡AppRoutes DEBE estar adentro de BrowserRouter y AuthProvider obligatoriamente! */}
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
