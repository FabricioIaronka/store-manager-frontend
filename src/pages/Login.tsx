import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]); 

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const user = await signIn(email, senha);
      
      if (user.stores && user.stores.length > 0) {
        navigate('/dashboard');
      } else {
        navigate('/create-store');
      }
    } catch (error) {
      console.error(error);
      setErro('E-mail ou senha inválidos.');
      setCarregando(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 position-relative">
      <Container style={{ maxWidth: '400px' }}>
        <Card className="shadow-lg border-0">
          <Card.Body className="p-5">
            
            <div className="text-center mb-4">
              <div className="display-1 text-primary mb-3">
                <i className="bi bi-box-seam-fill"></i>
              </div>
              <h2 className="fw-bold">Bem-vindo</h2>
              <p className="text-muted">Faça login para gerenciar seu estoque</p>
            </div>

            {erro && <Alert variant="danger" className="text-center">{erro}</Alert>}

            <Form onSubmit={handleLogin}>
              <Form.Floating className="mb-3">
                <Form.Control
                  id="floatingInput"
                  type="email"
                  placeholder="nome@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label htmlFor="floatingInput">E-mail</label>
              </Form.Floating>

              <Form.Floating className="mb-4">
                <Form.Control
                  id="floatingPassword"
                  type="password"
                  placeholder="Senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
                <label htmlFor="floatingPassword">Senha</label>
              </Form.Floating>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 btn-lg mb-3"
                disabled={carregando}
              >
                {carregando ? 'Entrando...' : 'Entrar'}
              </Button>

              <div className="text-center mt-3">
                <span className="text-muted small">Não tem conta? </span>
                <Link to="/register" className="text-decoration-none small fw-bold">
                  Registre-se
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
        
        <div className="text-center mt-3 text-muted small">
          &copy; 2025 Sistema de Vendas
        </div>
      </Container>

      <Button
        variant="outline-secondary" 
        className="position-absolute bottom-0 end-0 m-3 rounded-circle p-0 d-flex align-items-center justify-content-center"
        onClick={toggleTheme}
        title="Alternar Tema"
        style={{ width: '40px', height: '40px' }}
      >
        {theme === 'light' ? (
          <i className="bi bi-moon-stars-fill"></i>
        ) : (
          <i className="bi bi-sun-fill"></i>
        )}
      </Button>
    </div>
  );
}