import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function CreateStore() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [theme] = useState(() => localStorage.getItem('app-theme') || 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/stores/', { name, cnpj });

      await refreshUser();

      navigate('/dashboard');

    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Erro ao criar loja.';
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
              <h2 className="fw-bold text-primary">Bem-vindo, {user?.name}!</h2>
              <p className="text-muted">
                Para começar a usar o sistema, você precisa cadastrar sua primeira loja.
              </p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Floating className="mb-3">
                <Form.Control
                  id="storeInput"
                  type="text"
                  placeholder="Nome da Loja"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
                <label htmlFor="storeInput">Nome da Loja</label>
              </Form.Floating>

              <Form.Floating className="mb-4">
                <Form.Control
                  id="cnpjInput"
                  type="text"
                  placeholder="CNPJ"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  required
                />
                <label htmlFor="cnpjInput">CNPJ</label>
              </Form.Floating>

              <Button 
                variant="success" 
                type="submit" 
                className="w-100 btn-lg"
                disabled={loading}
              >
                {loading ? 'Criando Loja...' : 'Criar Loja e Acessar'}
              </Button>
            </Form>

          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}