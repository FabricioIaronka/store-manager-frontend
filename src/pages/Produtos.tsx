import { useState } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';

interface Produto {
  id: number;
  name: string;
  qnt: number;
  description: string | null;
  price: number;
  category: string | null;
}

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

export function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([
    { id: 1, name: 'Teclado Mecânico', qnt: 50, price: 150.99, description: 'Teclado com switches blue', category: 'Periféricos' },
    { id: 2, name: 'Mouse Gamer', qnt: 100, price: 80.50, description: 'Mouse com 8000 DPI', category: 'Periféricos' },
    { id: 3, name: 'Monitor 24"', qnt: 20, price: 800.00, description: null, category: 'Monitores' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [qnt, setQnt] = useState(0);
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

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
  };

  const handleSalvar = () => {
    if (!name || price <= 0) {
      alert("Preencha pelo menos Nome e Preço.");
      return;
    }

    if (editandoId) {
      setProdutos(produtos.map(p =>
        p.id === editandoId ? { ...p, name, qnt, price, category, description } : p
      ));
    } else {
      const novoId = Math.max(...produtos.map(p => p.id), 0) + 1;
      setProdutos([...produtos, { 
        id: novoId, 
        name, 
        qnt, 
        price, 
        category: category || null, 
        description: description || null 
      }]);
    }
    handleClose();
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
    console.log('Excluir produto ' + id);
    setProdutos(produtos.filter(p => p.id !== id));
  };

  return (
    <Container>
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
          {produtos.map((produto) => (
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
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editandoId ? 'Editar Produto' : 'Novo Produto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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