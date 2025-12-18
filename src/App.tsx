import { Routes, Route, useLocation, HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';

import { MainNavbar } from './components/MainNavBar';
import { Dashboard } from './pages/Dashboard';
import { Produtos } from './pages/Produtos';
import { Clientes } from './pages/Clientes';
import { HistoricoVendas } from './pages/HistoricoVendas';
import { Vendas } from './pages/Vendas';
import { Login } from './pages/Login';
import { Perfil } from './pages/Perfil';

function Layout() {
  const location = useLocation();
  
  const hideNavbarRoutes = ['/'];

  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <MainNavbar />}
      
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/historico" element={<HistoricoVendas />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>

      </Routes>
    </>
  );
}

function App() {
  return (
    <HashRouter>
    <AuthProvider>
      <Layout />
    </AuthProvider>
    </HashRouter>
  );
}

export default App;