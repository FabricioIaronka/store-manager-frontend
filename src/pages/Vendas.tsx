import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, InputGroup, Modal } from 'react-bootstrap';

interface Produto {
  id: number;
  name: string;
  qnt: number;
  description: string | null;
  price: number;
  category: string | null;
}

interface Cliente {
  id: number;
  nome: string;
  sobrenome: string;
  numero:string;
  email: string;
  cpf: string;
}

interface ItemVenda {
  produto: Produto;
  quantidade: number;
}


const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

export function Vendas() {
  const clientesDisponiveis: Cliente[] = [
      { id: 1, nome: 'João', sobrenome:'da Silva', numero:'(49) 99911-2233', email: 'joao@gmail.com', cpf: '111.222.333-44' },
      { id: 2, nome: 'Maria', sobrenome:' Souza', numero:'(11) 98877-6655', email: 'maria@hotmail.com', cpf: '555.666.777-88' },
  ];

  const produtosDisponiveis: Produto[] = [
    { id: 1, name: 'Teclado Mecânico', qnt: 50, price: 150.99, description: 'Switches blue', category: 'Periféricos' },
    { id: 2, name: 'Mouse Gamer', qnt: 100, price: 80.50, description: '8000 DPI', category: 'Periféricos' },
    { id: 3, name: 'Monitor 24"', qnt: 20, price: 800.00, description: null, category: 'Monitores' },
    { id: 4, name: 'Cadeira de Escritório', qnt: 15, price: 450.00, description: 'Ergonômica', category: 'Móveis' },
  ];

  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [quantidade, setQuantidade] = useState<number>(1);
  
  const [cpfPesquisa, setCpfPesquisa] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [filtroProdutoModal, setFiltroProdutoModal] = useState('');

  const handleBuscarCliente = () => {
    const clienteEncontrado = clientesDisponiveis.find(c => c.cpf === cpfPesquisa);
    if (clienteEncontrado) {
      setClienteSelecionado(clienteEncontrado);
    } else {
      setClienteSelecionado(null);
      alert('Nenhum cliente encontrado com este CPF.');
    }
  };

  const handleLimparCliente = () => {
    setClienteSelecionado(null);
    setCpfPesquisa('');
  };

  const handleShowProdutoModal = () => setShowProdutoModal(true);
  const handleCloseProdutoModal = () => {
    setShowProdutoModal(false);
    setFiltroProdutoModal(''); 
  };

  const produtosFiltradosModal = produtosDisponiveis.filter(p => 
    p.name.toLowerCase().includes(filtroProdutoModal.toLowerCase())
  );

  const handleSelecionarProduto = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setQuantidade(1); 
    handleCloseProdutoModal();
  };

  const adicionarAoCarrinho = () => {
    if (!produtoSelecionado) {
      alert('Por favor, selecione um produto primeiro.');
      return;
    }

    const produto = produtoSelecionado;

    const itemNoCarrinho = carrinho.find(item => item.produto.id === produto.id);
    const qtdAtualNoCarrinho = itemNoCarrinho ? itemNoCarrinho.quantidade : 0;
    
    if (qtdAtualNoCarrinho + quantidade > produto.qnt) {
      alert(`Estoque insuficiente. Disponível: ${produto.qnt}`);
      return;
    }

    const itemExistenteIndex = carrinho.findIndex(item => item.produto.id === produto.id);
    if (itemExistenteIndex >= 0) {
      const novoCarrinho = [...carrinho];
      novoCarrinho[itemExistenteIndex].quantidade += quantidade;
      setCarrinho(novoCarrinho);
    } else {
      setCarrinho([...carrinho, { produto, quantidade }]);
    }

    setProdutoSelecionado(null);
    setQuantidade(1);
  };

  const removerDoCarrinho = (indexParaRemover: number) => {
    setCarrinho(carrinho.filter((_, index) => index !== indexParaRemover));
  };

  const calcularTotal = () => {
    return carrinho.reduce((acc, item) => acc + (item.produto.price * item.quantidade), 0);
  };

  const finalizarVenda = () => {
    if (carrinho.length === 0) return;
    const nomeCliente = clienteSelecionado ? `${clienteSelecionado.nome} ${clienteSelecionado.sobrenome}` : 'Consumidor Final';
    alert(`Venda finalizada para: ${nomeCliente}\nTotal: ${formatarMoeda(calcularTotal())}`);
    setCarrinho([]);
    handleLimparCliente();
    setProdutoSelecionado(null);
  };


  return (
    <Container>
      <h2 className="mb-4">Nova Venda</h2>

      <Row>
        <Col md={5}>
          <Card className="mb-4 shadow-sm">
            <Card.Header>Adicionar Item</Card.Header>
            <Card.Body>
              
              <Form.Group className="mb-3 border-bottom pb-3">
                <Form.Label className="fw-bold text-primary">
                  <i className="bi bi-person-lines-fill me-2"></i>
                  Cliente (Opcional)
                </Form.Label>
                
                <InputGroup className="mb-2">
                  <Form.Control 
                    placeholder="Digitar CPF do cliente..."
                    value={cpfPesquisa}
                    onChange={(e) => setCpfPesquisa(e.target.value)}
                    disabled={!!clienteSelecionado} 
                  />
                  <Button variant="primary" onClick={handleBuscarCliente} disabled={!!clienteSelecionado}>
                    <i className="bi bi-search"></i>
                  </Button>
                </InputGroup>
                
                <Alert 
                  variant={clienteSelecionado ? 'success' : 'secondary'} 
                  className="d-flex justify-content-between align-items-center p-2 mb-0"
                >
                  <small>
                    {clienteSelecionado 
                      ? `${clienteSelecionado.nome} ${clienteSelecionado.sobrenome}`
                      : 'Consumidor Final'}
                  </small>
                  {clienteSelecionado && (
                    <Button variant="danger" size="sm" onClick={handleLimparCliente}>
                      <i className="bi bi-x-lg"></i>
                    </Button>
                  )}
                </Alert>
              </Form.Group>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Produto Selecionado</Form.Label>
                  <InputGroup>
                    <Form.Control
                      placeholder="Nenhum produto selecionado"
                      value={produtoSelecionado?.name || ''}
                      readOnly
                    />
                    <Button variant="primary" onClick={handleShowProdutoModal}>
                      <i className="bi bi-search me-2"></i>Procurar
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Quantidade</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    disabled={!produtoSelecionado} 
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  className="w-100"
                  onClick={adicionarAoCarrinho}
                  disabled={!produtoSelecionado}
                >
                  <i className="bi bi-cart-plus me-2"></i>
                  Adicionar ao Carrinho
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={7}>
          <Card className="shadow-sm">
            <Card.Header>Itens da Venda</Card.Header>
            <Card.Body>
              {carrinho.length === 0 ? (
                <Alert variant="secondary" className="text-center">
                  Nenhum item adicionado ainda.
                </Alert>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th className="text-center">Qtd</th>
                      <th className="text-end">Unitário</th>
                      <th className="text-end">Subtotal</th>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrinho.map((item, index) => (
                      <tr key={index}>
                        <td>{item.produto.name}</td>
                        <td className="text-center">{item.quantidade}</td>
                        <td className="text-end">{formatarMoeda(item.produto.price)}</td>
                        <td className="text-end fw-bold">
                          {formatarMoeda(item.produto.price * item.quantidade)}
                        </td>
                        <td className="text-center">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removerDoCarrinho(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
            
            <Card.Footer className="d-flex justify-content-between align-items-center p-3">
               <h4 className="m-0">Total: {formatarMoeda(calcularTotal())}</h4>
               <Button 
                  variant="success" 
                  size="lg" 
                  onClick={finalizarVenda}
                  disabled={carrinho.length === 0}
               >
                 <i className="bi bi-check-circle me-2"></i>
                 Finalizar Venda
               </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      <Modal show={showProdutoModal} onHide={handleCloseProdutoModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Buscar Produto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Control
              placeholder="Digite o nome ou categoria do produto..."
              value={filtroProdutoModal}
              onChange={(e) => setFiltroProdutoModal(e.target.value)}
              autoFocus
            />
          </Form.Group>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th className="text-end">Preço</th>
                <th className="text-center">Estoque</th>
                <th className="text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltradosModal.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category || 'N/A'}</td>
                  <td className="text-end">{formatarMoeda(p.price)}</td>
                  <td className="text-center">{p.qnt}</td>
                  <td className="text-center">
                    <Button 
                      size="sm" 
                      onClick={() => handleSelecionarProduto(p)}
                      disabled={p.qnt <= 0}
                    >
                      {p.qnt > 0 ? 'Selecionar' : 'Esgotado'}
                    </Button>
                  </td>
                </tr>
              ))}
              {produtosFiltradosModal.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">Nenhum produto encontrado.</td>
                </tr>
              )}
            </tbody>
          </Table>

        </Modal.Body>
      </Modal>
    </Container>
  );
}