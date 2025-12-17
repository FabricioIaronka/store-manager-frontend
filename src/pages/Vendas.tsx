import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, InputGroup, Modal, Spinner } from 'react-bootstrap';
import { api } from '../services/api';
import { useProdutos, type Produto } from '../hooks/useProdutos';
import { type Cliente } from '../hooks/useClientes';
import { useVendas, type PaymentType } from '../hooks/useVendas'; 
import { useAuth } from '../context/AuthContext';

interface ItemVenda {
  produto: Produto;
  quantidade: number;
}


const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

export function Vendas() {
  const { user } = useAuth();
  const { createVenda } = useVendas(); 
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [pagamento, setPagamento] = useState<PaymentType>('Money'); // Default atualizado
  
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  const [cpfPesquisa, setCpfPesquisa] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [loadingCliente, setLoadingCliente] = useState(false);

  const { produtos: produtosDisponiveis, isLoading: loadingProdutos } = useProdutos();
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [filtroProdutoModal, setFiltroProdutoModal] = useState('');

  const exibirSucesso = (msg: string) => {
    setMensagemSucesso(msg);
    setTimeout(() => setMensagemSucesso(''), 3000);
  };

  const exibirErro = (msg: string) => {
    setMensagemErro(msg);
    setTimeout(() => setMensagemErro(''), 4000);
  };

  const handleBuscarCliente = async () => {
    if (!cpfPesquisa) return;
    setLoadingCliente(true);
    setClienteSelecionado(null);
    try {
      const response = await api.get(`/clients/cpf/${cpfPesquisa}`);
      setClienteSelecionado(response.data);
    } catch (error) {
      console.error(error);
      alert('Cliente não encontrado com este CPF.');
    } finally {
      setLoadingCliente(false);
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
    p.name.toLowerCase().includes(filtroProdutoModal.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(filtroProdutoModal.toLowerCase()))
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
    
    if (!user) {
      exibirErro("Erro: Usuário não autenticado.");
      return;
    }

    const payload = {
      user_id: user.id,
      payment_type: pagamento,
      items: carrinho.map(item => ({
        product_id: item.produto.id,
        quantity: item.quantidade
      })),
      ...(clienteSelecionado ? { client_id: clienteSelecionado.id } : {})
    };

    createVenda.mutate(payload as any, {
      onSuccess: () => {
        exibirSucesso(`Venda realizada com sucesso! Total: ${formatarMoeda(calcularTotal())}`);
        setCarrinho([]);
        handleLimparCliente();
        setProdutoSelecionado(null);
        setPagamento('Money'); 
      },
      onError: (error: any) => {
        const msg = error.response?.data?.detail || 'Erro ao finalizar venda.';
        exibirErro(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    });
  };


  return (
    <Container>
      <div className="position-fixed start-50 translate-middle-x" style={{ zIndex: 1050, top: '80px', width: '90%', maxWidth: '600px' }}>
        {mensagemSucesso && <Alert variant="success" onClose={() => setMensagemSucesso('')} dismissible className="text-center shadow-lg"><i className="bi bi-check-circle-fill me-2"></i>{mensagemSucesso}</Alert>}
        {mensagemErro && <Alert variant="danger" onClose={() => setMensagemErro('')} dismissible className="text-center shadow-lg"><i className="bi bi-exclamation-triangle-fill me-2"></i>{mensagemErro}</Alert>}
      </div>

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
                    disabled={!!clienteSelecionado || loadingCliente}
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscarCliente()}
                  />
                  <Button variant="primary" onClick={handleBuscarCliente} disabled={!!clienteSelecionado || loadingCliente || !cpfPesquisa}>
                    {loadingCliente ? <Spinner size="sm" animation="border" /> : <i className="bi bi-search"></i>}
                  </Button>
                </InputGroup>

                <Alert
                  variant={clienteSelecionado ? 'success' : 'secondary'}
                  className="d-flex justify-content-between align-items-center p-2 mb-0"
                >
                  <small>
                    {clienteSelecionado ?
                      <strong>{clienteSelecionado.name} {clienteSelecionado.surname}</strong>
                      : 'Consumidor Final'}
                  </small>
                  {clienteSelecionado &&
                    <Button variant="danger" size="sm" onClick={handleLimparCliente}>
                      <i className="bi bi-x-lg"></i>
                    </Button>}
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
                <Alert variant="secondary" className="text-center">Nenhum item adicionado.</Alert>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr><th>Produto</th><th className="text-center">Qtd</th><th className="text-end">Unitário</th><th className="text-end">Subtotal</th><th className="text-center">Ações</th></tr>
                  </thead>
                  <tbody>
                    {carrinho.map((item, index) => (
                      <tr key={index}>
                        <td>{item.produto.name}</td>
                        <td className="text-center">{item.quantidade}</td>
                        <td className="text-end">{formatarMoeda(item.produto.price)}</td>
                        <td className="text-end fw-bold">{formatarMoeda(item.produto.price * item.quantidade)}</td>
                        <td className="text-center"><Button variant="outline-danger" size="sm" onClick={() => removerDoCarrinho(index)}><i className="bi bi-trash"></i></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
            <Card.Footer className="p-3">
               <Row className="align-items-center">
                 <Col md={6}>
                    <Form.Group className="mb-2 mb-md-0">
                      <Form.Label className="fw-bold mb-1">Forma de Pagamento</Form.Label>
                      <Form.Select 
                        value={pagamento} 
                        onChange={(e) => setPagamento(e.target.value as PaymentType)}
                      >
                        {/* CORREÇÃO: Valores exatos do Swagger */}
                        <option value="Money">Dinheiro</option>
                        <option value="Debit">Débito</option>
                        <option value="Credit">Crédito</option>
                        <option value="PIX">PIX</option>
                        <option value="Other">Outro</option>
                      </Form.Select>
                    </Form.Group>
                 </Col>
                 <Col md={6} className="text-md-end">
                    <h4 className="mb-2">Total: {formatarMoeda(calcularTotal())}</h4>
                    <Button 
                      variant="success" 
                      size="lg" 
                      onClick={finalizarVenda} 
                      disabled={carrinho.length === 0 || createVenda.isPending}
                      className="w-100"
                    >
                      {createVenda.isPending ? <Spinner size="sm" animation="border" /> : <><i className="bi bi-check-circle me-2"></i> Finalizar Venda</>}
                    </Button>
                 </Col>
               </Row>
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

          {loadingProdutos ? (
            <div className="text-center py-4"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Carregando estoque...</p></div>
          ) : (
            <Table striped bordered hover responsive>
              <thead><tr><th>Produto</th><th>Categoria</th><th className="text-end">Preço</th><th className="text-center">Estoque</th><th className="text-center">Ação</th></tr></thead>
              <tbody>
                {produtosFiltradosModal.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td><td>{p.category || 'N/A'}</td><td className="text-end">{formatarMoeda(p.price)}</td><td className="text-center">{p.qnt}</td>
                    <td className="text-center"><Button size="sm" onClick={() => handleSelecionarProduto(p)} disabled={p.qnt <= 0}>{p.qnt > 0 ? 'Selecionar' : 'Esgotado'}</Button></td>
                  </tr>
                ))}
                {produtosFiltradosModal.length === 0 && <tr><td colSpan={5} className="text-center text-muted">Nenhum produto encontrado.</td></tr>}
              </tbody>
            </Table>
          )}

        </Modal.Body>
      </Modal>
    </Container>
  );
}