import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function MainNavbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      signOut();
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  const usuarioNome = user?.name || "Usuário";
  const usuarioEmail = user?.email || "";

  return (
    <Navbar bg="primary" data-bs-theme="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold">
          Gestão de Vendas
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/produtos">Produtos</Nav.Link>
            <Nav.Link as={Link} to="/clientes">Clientes</Nav.Link>
            <Nav.Link as={Link} to="/historico">Vendas</Nav.Link>
            <Nav.Link as={Link} to="/vendas">Nova Venda</Nav.Link>
          </Nav>

          <Nav className="align-items-center gap-2">
            
            <NavDropdown 
              title={
                <span>
                  <i className="bi bi-person-circle me-2"></i>
                  {usuarioNome}
                </span>
              } 
              id="user-dropdown"
              align="end"
              menuVariant={theme}
            >
              <NavDropdown.Header className="text-body" style={{ maxWidth: '200px' }}>
                {usuarioEmail}
              </NavDropdown.Header>
              <NavDropdown.Divider />

              <NavDropdown.Item as={Link} to="/perfil">
                <i className="bi bi-person-gear me-2"></i> Meu Perfil
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/config">
              
                <i className="bi bi-gear me-2"></i> Configurações
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2"></i> Sair
              </NavDropdown.Item>
            </NavDropdown>

            <Button 
              variant="outline-light" 
              size="sm" 
              onClick={toggleTheme}
              title="Alternar Tema"
              className="d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
            >
              {theme === 'light' ? (
                <i className="bi bi-moon-stars-fill"></i> 
              ) : (
                <i className="bi bi-sun-fill"></i>
              )}
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}