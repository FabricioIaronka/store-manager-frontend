import { useState } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useClientes, type Cliente } from '../hooks/useClientes';


export function Clientes() {
  const { 
    clientes, 
    isLoading, 
    isError, 
    createCliente, 
    updateCliente, 
    deleteCliente 
  } = useClientes();

  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [modalErro, setModalErro] = useState('');

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');

  const exibirSucesso = (msg: string) => {
    setMensagemSucesso(msg);
    setTimeout(() => setMensagemSucesso(''), 3000);
  };

  const exibirErro = (msg: string) => {
    setMensagemErro(msg);
    setTimeout(() => setMensagemErro(''), 4000);
  };

  const handleClose = () => {
    setShowModal(false);
    limparForm();
  };

  const handleShow = () => setShowModal(true);

  const limparForm = () => {
    setName('');
    setSurname('');
    setNumber('');
    setEmail('');
    setCpf('');
    setEditandoId(null);
    setModalErro('');
  };

  const handleSalvar = () => {
    if (!name || !surname || !cpf) {
      setModalErro("Preencha pelo menos Nome, Sobrenome e CPF.");
      return;
    }
    setModalErro('');

    const payload = {
      name,
      surname,
      number,
      email,
      cpf
    };

    if (editandoId) {
      updateCliente.mutate({ id: editandoId, cliente: payload }, {
        onSuccess: () => {
          handleClose();
          exibirSucesso('Cliente atualizado com sucesso!');
        },
        onError: (error: any) => {
          const msg = error.response?.data?.detail || 'Erro ao atualizar cliente.';
          setModalErro(Array.isArray(msg) ? msg[0].msg : msg);
        }
      });
    } else {
      createCliente.mutate(payload, {
        onSuccess: () => {
          handleClose();
          exibirSucesso('Cliente cadastrado com sucesso!');
        },
        onError: (error: any) => {
          const msg = error.response?.data?.detail || 'Erro ao cadastrar cliente.';
          setModalErro(Array.isArray(msg) ? msg[0].msg : msg);
        }
      });
    }
  };

  const handleEditar = (cliente: Cliente) => {
    setEditandoId(cliente.id);
    setName(cliente.name);
    setSurname(cliente.surname);
    setNumber(cliente.number);
    setEmail(cliente.email);
    setCpf(cliente.cpf);
    handleShow();
  };

  const handleExcluir = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteCliente.mutate(id, {
        onSuccess: () => exibirSucesso('Cliente removido com sucesso!'),
        onError: () => exibirErro('Erro ao remover cliente.')
      });
    }
  };

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando clientes...</p>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          Erro ao carregar clientes. Verifique a conexão com o servidor.
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div
        className="position-fixed start-50 translate-middle-x"
        style={{ zIndex: 1050, top: '80px', width: '90%', maxWidth: '600px' }}
      >
        {mensagemSucesso && (
          <Alert variant="success" onClose={() => setMensagemSucesso('')} dismissible className="text-center shadow-lg">
            <i className="bi bi-check-circle-fill me-2"></i>
            {mensagemSucesso}
          </Alert>
        )}
        {mensagemErro && (
          <Alert variant="danger" onClose={() => setMensagemErro('')} dismissible className="text-center shadow-lg">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {mensagemErro}
          </Alert>
        )}
      </div>

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
          {clientes.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-muted">
                Nenhum cliente cadastrado.
              </td>
            </tr>
          ) : (
            clientes.map((cliente: Cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.name} {cliente.surname}</td>
                <td>{cliente.number}</td>
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
            ))
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editandoId ? 'Editar Cliente' : 'Novo Cliente'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalErro && (
            <Alert variant="danger" onClose={() => setModalErro('')} dismissible>
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {modalErro}
            </Alert>
          )}

          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ex: João"
                    value={name}
                    onChange={e => setName(e.target.value)}
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
                    value={surname}
                    onChange={e => setSurname(e.target.value)}
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
                    value={number}
                    onChange={e => setNumber(e.target.value)}
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
          <Button 
            variant="primary" 
            onClick={handleSalvar}
            disabled={createCliente.isPending || updateCliente.isPending}
          >
            {createCliente.isPending || updateCliente.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}