import { useState } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';

interface Cliente {
  id: number;
  nome: string;
  sobrenome: string;
  numero:string;
  email: string;
  cpf: string;
}

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([
    { id: 1, nome: 'João', sobrenome:'da Silva', numero:'999112233', email: 'joao@gmail.com', cpf: '111.222.333-44' },
    { id: 2, nome: 'Maria', sobrenome:' Souza', numero:'999112233', email: 'maria@hotmail.com', cpf: '555.666.777-88' },
    { id: 3, nome: 'Pedro', sobrenome:' Cabral', numero:'999112233', email: 'maria@hotmail.com', cpf: '555.666.777-88' },
    { id: 4, nome: 'Michael', sobrenome:' Jordan', numero:'999112233', email: 'maria@hotmail.com', cpf: '555.666.777-88' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [numero, setNumero] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');

  const handleClose = () => {
    setShowModal(false);
    limparForm();
  };

  const handleShow = () => setShowModal(true);

  const limparForm = () => {
    setNome('');
    setSobrenome('');
    setNumero('');
    setEmail('');
    setCpf('');
    setEditandoId(null);
  };

  const handleSalvar = () => {
    if (editandoId) {
      setClientes(clientes.map(c => 
        c.id === editandoId ? { ...c, nome, sobrenome, numero, email, cpf } : c
      ));
    } else {
      const novoId = Math.max(...clientes.map(c => c.id), 0) + 1;
      setClientes([...clientes, { id: novoId, nome, sobrenome, numero, email, cpf }]);
    }
    handleClose();
  };

  const handleEditar = (cliente: Cliente) => {
    setEditandoId(cliente.id);
    setNome(cliente.nome);
    setSobrenome(cliente.sobrenome);
    setNumero(cliente.numero);
    setEmail(cliente.email);
    setCpf(cliente.cpf);
    handleShow();
  };

  const handleExcluir = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setClientes(clientes.filter(c => c.id !== id));
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gerenciar Clientes</h2>
        <Button variant="primary" onClick={handleShow}>
          <i className="bi bi-person-plus-fill me-2"></i>
          Novo Cliente
        </Button>
      </div>

      <Table striped bordered hover responsive >
        <thead className="table-primary" >
          <tr>
            <th>#</th>
            <th>Nome</th>
            <th>Numero</th>
            <th>CPF</th>
            <th>E-mail</th>
            <th className="text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.id}</td>
              <td>{cliente.nome} {cliente.sobrenome}</td>
              <td>{cliente.numero}</td>
              <td>{cliente.cpf}</td>
              <td>{cliente.email}</td>
              <td className="text-center">
                <Button 
                  variant="warning" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleEditar(cliente)}
                >
                  <i className="bi bi-pencil"></i>
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleExcluir(cliente.id)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editandoId ? 'Editar Cliente' : 'Novo Cliente'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Ex: João" 
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    autoFocus
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sobrenome</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Ex: da Silva" 
                    value={sobrenome}
                    onChange={e => setSobrenome(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={7}>
                <Form.Group className="mb-3">
                  <Form.Label>CPF</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="000.000.000-00" 
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                 <Form.Group className="mb-3">
                  <Form.Label>Telefone</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="(00) 00000-0000" 
                    value={numero}
                    onChange={e => setNumero(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>E-mail</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="nome@email.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvar}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}