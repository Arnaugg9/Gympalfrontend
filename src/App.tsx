import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import EntrenoHoy from './pages/EntrenoHoy';
import Rutinas from './pages/Rutinas';
import VerRutinas from './pages/VerRutinas';
import VerEjercicio from './pages/VerEjercicio';
import CrearRutina from './pages/CrearRutina';
import AnadirEjercicios from './pages/AnadirEjercicios';
import Dietas from './pages/Dietas';
import VerDietas from './pages/VerDietas';
import CrearDieta from './pages/CrearDieta';
import Social from './pages/Social';
import VerPosts from './pages/VerPosts';
import Calendario from './pages/Calendario';
import VerDias from './pages/VerDias';
import RutinaDia from './pages/RutinaDia';
import Progreso from './pages/Progreso';
import ChatIA from './pages/ChatIA';
import CrearRutinaIA from './pages/CrearRutinaIA';
import CrearDietaIA from './pages/CrearDietaIA';
import OrganizarCalendarioIA from './pages/OrganizarCalendarioIA';
import Perfil from './pages/Perfil';
import EditarPerfil from './pages/EditarPerfil';
import ConfiguracionPerfil from './pages/ConfiguracionPerfil';
import Planes from './pages/Planes';
import VerPlanActual from './pages/VerPlanActual';
import ElegirPlan from './pages/ElegirPlan';
import ProcesoPago from './pages/ProcesoPago';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/entreno-hoy" element={<EntrenoHoy />} />
        
        {/* Rutinas */}
        <Route path="/rutinas" element={<Rutinas />} />
        <Route path="/rutinas/ver" element={<VerRutinas />} />
        <Route path="/rutinas/ejercicio/:id" element={<VerEjercicio />} />
        <Route path="/rutinas/crear" element={<CrearRutina />} />
        <Route path="/rutinas/anadir-ejercicios" element={<AnadirEjercicios />} />
        
        {/* Dietas */}
        <Route path="/dietas" element={<Dietas />} />
        <Route path="/dietas/ver" element={<VerDietas />} />
        <Route path="/dietas/crear" element={<CrearDieta />} />
        
        {/* Social */}
        <Route path="/social" element={<Social />} />
        <Route path="/social/posts" element={<VerPosts />} />
        
        {/* Calendario */}
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/calendario/dias" element={<VerDias />} />
        <Route path="/calendario/dia/:fecha" element={<RutinaDia />} />
        
        {/* Progreso */}
        <Route path="/progreso" element={<Progreso />} />
        
        {/* Chat IA */}
        <Route path="/chat-ia" element={<ChatIA />} />
        <Route path="/chat-ia/crear-rutina" element={<CrearRutinaIA />} />
        <Route path="/chat-ia/crear-dieta" element={<CrearDietaIA />} />
        <Route path="/chat-ia/organizar-calendario" element={<OrganizarCalendarioIA />} />
        
        {/* Perfil */}
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/perfil/editar" element={<EditarPerfil />} />
        <Route path="/perfil/configuracion" element={<ConfiguracionPerfil />} />
        
        {/* Planes */}
        <Route path="/planes" element={<Planes />} />
        <Route path="/planes/actual" element={<VerPlanActual />} />
        <Route path="/planes/elegir" element={<ElegirPlan />} />
        <Route path="/planes/pago" element={<ProcesoPago />} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}
