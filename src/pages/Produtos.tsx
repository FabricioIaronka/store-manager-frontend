import { useState } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useProdutos, type Produto } from '../hooks/useProdutos';


const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

export function Produtos() {
  const { 
    produtos, 
    isLoading, 
    isError, 
    createProduto, 
    updateProduto, 
    deleteProduto 
  } = useProdutos();

  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [modalErro, setModalErro] = useState('');

  const [name, setName] = useState('');
  const [qnt, setQnt] = useState(0);
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

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
    setQnt(0);
    setPrice(0);
    setCategory('');
    setDescription('');
    setEditandoId(null);
    setModalErro('');
  };

  const handleSalvar = () => {
    // Validação de UI
    if (!name || name.length < 3) {
      setModalErro("O nome deve ter pelo menos 3 caracteres.");
      return;
    }
    if (price <= 0) {
      setModalErro("O preço deve ser maior que zero.");
      return;
    }
    setModalErro('');

    const payload = {
      name,
      qnt,
      price,
      category: category || null,
      description: description || null
    };

    if (editandoId) {
      updateProduto.mutate({ id: editandoId, produto: payload }, {
        onSuccess: () => {
          handleClose();
          exibirSucesso('Produto atualizado com sucesso!');
        },
        onError: (error: any) => {
          const msg = error.response?.data?.detail || 'Erro ao atualizar produto.';
          setModalErro(Array.isArray(msg) ? msg[0].msg : msg);
        }
      });
    } else {
      createProduto.mutate(payload, {
        onSuccess: () => {
          handleClose();
          exibirSucesso('Produto criado com sucesso!');
        },
        onError: (error: any) => {
          const msg = error.response?.data?.detail || 'Erro ao criar produto.';
          setModalErro(Array.isArray(msg) ? msg[0].msg : msg);
        }
      });
    }
  };

  const handleEditar = (produto: Produto) => {
    setEditandoId(produto.id);
    setName(produto.name);
    setQnt(produto.qnt);
    setPrice(produto.price);
    setCategory(produto.category || '');
    setDescription(produto.description || '');
    handleShow();
  };

  const handleExcluir = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduto.mutate(id, {
        onSuccess: () => exibirSucesso('Produto excluído com sucesso!'),
        onError: () => exibirErro('Erro ao excluir produto.')
      });
    }
  };
  
  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando produtos...</p>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          Erro ao carregar produtos. Verifique se o backend está rodando.
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div 
        className="position-fixed start-50 translate-middle-x" 
        style={{ 
            zIndex: 1050, 
            top: '80px',
            width: '90%', 
            maxWidth: '600px'
        }}
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
        <h2>Estoque de Produtos</h2>
        <Button variant="primary" onClick={handleShow}>
          <i className="bi bi-plus-lg me-2"></i>
          Novo Produto
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-primary">
          <tr>
            <th>#</th>
            <th>Nome</th>
            <th>Categoria</th>
            <th className="text-end">Preço</th>
            <th className="text-center">Estoque (Qtd)</th>
            <th className="text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-muted">
                Nenhum produto cadastrado.
              </td>
            </tr>
          ) : (
            produtos.map((produto: Produto) => (
              <tr key={produto.id}>
                <td>{produto.id}</td>
                <td>{produto.name}</td>
                <td>{produto.category || 'N/A'}</td>
                <td className="text-end">{formatarMoeda(produto.price)}</td>
                <td className="text-center">{produto.qnt}</td>
                <td className="text-center">
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditar(produto)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleExcluir(produto.id)}
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
          <Modal.Title>{editandoId ? 'Editar Produto' : 'Novo Produto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalErro && (
            <Alert variant="danger" onClose={() => setModalErro('')} dismissible>
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {modalErro}
            </Alert>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nome do Produto</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: Teclado Mecânico"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Preço (R$)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0,00"
                    value={price}
                    onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantidade (Estoque)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="0"
                    value={qnt}
                    onChange={e => setQnt(parseInt(e.target.value) || 0)}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Categoria (Opcional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: Periféricos"
                value={category}
                onChange={e => setCategory(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descrição (Opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Detalhes do produto..."
                value={description}
                onChange={e => setDescription(e.target.value)}
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