import { useState } from 'react';
import { Container, Table, Button, Modal, Row, Col, Badge, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { useVendas, type Sale, type PaymentType } from '../hooks/useVendas';
import { useClientes } from '../hooks/useClientes';
import { useProdutos } from '../hooks/useProdutos';



const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

const formatarData = (dataString: string) => {
  return new Date(dataString).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

const formatarPagamento = (tipo: PaymentType) => {
  switch (tipo) {
    case 'Money': return <Badge bg="success">Dinheiro</Badge>;
    case 'Debit': return <Badge bg="primary">Débito</Badge>;
    case 'Credit': return <Badge bg="warning" text="dark">Crédito</Badge>;
    case 'PIX': return <Badge bg="info">PIX</Badge>;
    default: return <Badge bg="secondary">Outro</Badge>;
  }
};

export function HistoricoVendas() {

  const { vendas, isLoading, isError } = useVendas();
  
  const { clientes } = useClientes();
  const { produtos } = useProdutos();

  const [showModal, setShowModal] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<Sale | null>(null);

  const getClienteNome = (id: number | null) => {
    if (id === null) return "Consumidor Final";
    const cliente = clientes.find(c => c.id === id);
    return cliente ? `${cliente.name} ${cliente.surname}` : `Cliente #${id}`;
  };

  const getProdutoNome = (id: number) => {
    const produto = produtos.find(p => p.id === id);
    return produto ? produto.name : `Produto #${id}`;
  };

  const handleShowModal = (venda: Sale) => {
    setVendaSelecionada(venda);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setVendaSelecionada(null);
  };

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando histórico...</p>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          Erro ao carregar o histórico de vendas. Verifique a conexão.
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Histórico de Vendas</h2>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-primary">
          <tr>
            <th>ID Venda</th>
            <th>Data/Hora</th>
            <th>Cliente</th>
            <th>Pagamento</th>
            <th className="text-end">Total</th>
            <th className="text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {vendas.length === 0 ? (
            <tr><td colSpan={6} className="text-center text-muted">Nenhuma venda registrada.</td></tr>
          ) : (
            vendas.map((venda) => (
              <tr key={venda.id}>
                <td>{venda.id}</td>
                <td>{formatarData(venda.created_at)}</td>
                <td>{getClienteNome(venda.client_id)}</td>
                <td>{formatarPagamento(venda.payment_type)}</td>
                <td className="text-end">{formatarMoeda(venda.total_value)}</td>
                <td className="text-center">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleShowModal(venda)}
                    title="Visualizar Detalhes"
                  >
                    <i className="bi bi-eye-fill"></i>
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalhes da Venda #{vendaSelecionada?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {vendaSelecionada ? (
            <>
              {/* Informações Principais */}
              <ListGroup variant="flush" className="mb-4">
                <ListGroup.Item>
                  <Row>
                    <Col sm={3} as="strong">Cliente:</Col>
                    <Col>{getClienteNome(vendaSelecionada.client_id)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col sm={3} as="strong">Data:</Col>
                    <Col>{formatarData(vendaSelecionada.created_at)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col sm={3} as="strong">Pagamento:</Col>
                    <Col>{formatarPagamento(vendaSelecionada.payment_type)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col sm={3} as="strong">Vendedor (ID):</Col>
                    <Col>{vendaSelecionada.user_id}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item className="table-primary">
                  <Row>
                    <Col sm={3} as="strong" className="fs-5">Total da Venda:</Col>
                    <Col className="fs-5 fw-bold text-end">
                      {formatarMoeda(vendaSelecionada.total_value)}
                    </Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>

              {/* Tabela de Itens */}
              <h5 className="mt-4">Itens Inclusos</h5>
              <Table striped bordered size="sm">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th className="text-center">Qtd</th>
                    <th className="text-end">Preço Unitário</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {vendaSelecionada.items.map((item, index) => (
                    <tr key={index}>
                      <td>{getProdutoNome(item.product_id)}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">{formatarMoeda(item.unit_price)}</td>
                      <td className="text-end fw-bold">
                        {formatarMoeda(item.unit_price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : (
            <p>Carregando detalhes da venda...</p>
          )}  
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}