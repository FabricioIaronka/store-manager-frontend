import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, ProgressBar, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const navigate = useNavigate();
  const { signIn } = useAuth(); 

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

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [storeData, setStoreData] = useState({
    name: '',
    cnpj: ''
  });

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleStoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreData({ ...storeData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (userData.password !== userData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (userData.password.length < 4) {
      setError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/users/', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'admin' 
      });

      await signIn(userData.email, userData.password);

      await api.post('/stores/', {
        name: storeData.name,
        cnpj: storeData.cnpj
      });

      navigate('/dashboard');

    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Erro ao realizar cadastro.';
      setError(Array.isArray(msg) ? msg[0].msg : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 position-relative">
      <Container style={{ maxWidth: '500px' }}>
        <Card className="shadow-lg border-0">
          <Card.Body className="p-5">
            
            <div className="text-center mb-4">
              <h2 className="fw-bold">Criar Conta</h2>
              <p className="text-muted small">
                Passo {step} de 2: {step === 1 ? 'Seus Dados' : 'Dados da Loja'}
              </p>
              <ProgressBar now={step === 1 ? 50 : 100} variant="primary" style={{ height: '5px' }} />
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {step === 1 && (
              <Form onSubmit={handleNext}>
                <Form.Floating className="mb-3">
                  <Form.Control
                    id="nameInput"
                    name="name"
                    type="text"
                    placeholder="Seu Nome"
                    value={userData.name}
                    onChange={handleUserChange}
                    required
                    autoFocus
                  />
                  <label htmlFor="nameInput">Nome Completo</label>
                </Form.Floating>

                <Form.Floating className="mb-3">
                  <Form.Control
                    id="emailInput"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={userData.email}
                    onChange={handleUserChange}
                    required
                  />
                  <label htmlFor="emailInput">E-mail</label>
                </Form.Floating>

                <Row>
                  <Col md={6}>
                    <Form.Floating className="mb-3">
                      <Form.Control
                        id="passInput"
                        name="password"
                        type="password"
                        placeholder="Senha"
                        value={userData.password}
                        onChange={handleUserChange}
                        required
                      />
                      <label htmlFor="passInput">Senha</label>
                    </Form.Floating>
                  </Col>
                  <Col md={6}>
                    <Form.Floating className="mb-3">
                      <Form.Control
                        id="confPassInput"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirmar"
                        value={userData.confirmPassword}
                        onChange={handleUserChange}
                        required
                      />
                      <label htmlFor="confPassInput">Confirmar</label>
                    </Form.Floating>
                  </Col>
                </Row>

                <Button variant="primary" type="submit" className="w-100 btn-lg mb-3">
                  Próximo <i className="bi bi-arrow-right ms-2"></i>
                </Button>
              </Form>
            )}

            {step === 2 && (
              <Form onSubmit={handleSubmit}>
                <Alert variant="info" className="small">
                  <i className="bi bi-shop me-2"></i>
                  Cadastre sua primeira loja.
                </Alert>

                <Form.Floating className="mb-3">
                  <Form.Control
                    id="storeInput"
                    name="name"
                    type="text"
                    placeholder="Nome da Loja"
                    value={storeData.name}
                    onChange={handleStoreChange}
                    required
                    autoFocus
                  />
                  <label htmlFor="storeInput">Nome da Loja</label>
                </Form.Floating>

                <Form.Floating className="mb-4">
                  <Form.Control
                    id="cnpjInput"
                    name="cnpj"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={storeData.cnpj}
                    onChange={handleStoreChange}
                    required
                  />
                  <label htmlFor="cnpjInput">CNPJ</label>
                </Form.Floating>

                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" className="w-50" onClick={() => setStep(1)}>
                    Voltar
                  </Button>
                  <Button variant="success" type="submit" className="w-50" disabled={loading}>
                    {loading ? 'Criando...' : 'Finalizar'}
                  </Button>
                </div>
              </Form>
            )}

            <div className="text-center mt-4 border-top pt-3">
              <span className="text-muted small">Já tem uma conta? </span>
              <Link to="/" className="text-decoration-none small fw-bold">
                Fazer Login
              </Link>
            </div>

          </Card.Body>
        </Card>
      </Container>
\
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