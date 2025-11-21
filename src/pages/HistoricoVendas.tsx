import { useState } from 'react';
import { Container, Table, Button, Modal, Row, Col, Badge, ListGroup } from 'react-bootstrap';

type PaymentType = 'MONEY' | 'DEBIT' | 'CREDIT' | 'PIX' | 'OTHER';

interface SaleItem {
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

interface Sale {
  id: number;
  user_id: number;
  client_id: number | null; 
  created_at: string;
  payment_type: PaymentType;
  items: SaleItem[];
  total_value: number;
}

const mockClientes = [
  { id: 1, nome: 'João da Silva' },
  { id: 2, nome: 'Maria Souza' },
];
const mockProdutos = [
  { id: 1, name: 'Teclado Mecânico', price: 150.99 },
  { id: 2, name: 'Mouse Gamer', price: 80.50 },
  { id: 3, name: 'Monitor 24"', price: 800.00 },
];
const mockVendedores = [
  { id: 1, nome: 'Admin Silva' },
];

const mockVendas: Sale[] = [
  {
    id: 1001,
    user_id: 1,
    client_id: 1,
    created_at: new Date(2025, 10, 14, 14, 30).toISOString(),
    payment_type: 'PIX',
    items: [
      { sale_id: 1001, product_id: 1, quantity: 1, unit_price: 150.99 },
      { sale_id: 1001, product_id: 2, quantity: 2, unit_price: 80.50 },
    ],
    total_value: (150.99 + (2 * 80.50)),
  },
  {
    id: 1002,
    user_id: 1,
    client_id: null,
    created_at: new Date(2025, 10, 15, 10, 15).toISOString(),
    payment_type: 'CREDIT',
    items: [
      { sale_id: 1002, product_id: 3, quantity: 1, unit_price: 800.00 },
    ],
    total_value: 800.00,
  },
  {
    id: 1003,
    user_id: 1,
    client_id: null, 
    created_at: new Date(2025, 10, 15, 10, 15).toISOString(),
    payment_type: 'DEBIT',
    items: [
      { sale_id: 1002, product_id: 3, quantity: 1, unit_price: 800.00 },
    ],
    total_value: 800.00,
  },
  {
    id: 1004,
    user_id: 1,
    client_id: null, 
    created_at: new Date(2025, 10, 15, 10, 15).toISOString(),
    payment_type: 'MONEY',
    items: [
      { sale_id: 1002, product_id: 3, quantity: 1, unit_price: 800.00 },
    ],
    total_value: 800.00,
  },
  {
    id: 1005,
    user_id: 1,
    client_id: null, 
    created_at: new Date(2025, 10, 15, 10, 15).toISOString(),
    payment_type: 'OTHER',
    items: [
      { sale_id: 1002, product_id: 3, quantity: 1, unit_price: 800.00 },
    ],
    total_value: 800.00,
  }
];

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
    case 'MONEY': return <Badge bg="success">Dinheiro</Badge>;
    case 'DEBIT': return <Badge bg="primary">Débito</Badge>;
    case 'CREDIT': return <Badge bg="warning" text="dark">Crédito</Badge>;
    case 'PIX': return <Badge bg="info">PIX</Badge>;
    default: return <Badge bg="secondary">Outro</Badge>;
  }
};

export function HistoricoVendas() {

  const [vendas] = useState<Sale[]>(mockVendas);
  const [showModal, setShowModal] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<Sale | null>(null);

  const getClienteNome = (id: number | null) => {
    if (id === null) return "Consumidor Final";
    return mockClientes.find(c => c.id === id)?.nome || "Cliente não encontrado";
  };

  const getProdutoNome = (id: number) => {
    return mockProdutos.find(p => p.id === id)?.name || "Produto não encontrado";
  };

  const handleShowModal = (venda: Sale) => {
    setVendaSelecionada(venda);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setVendaSelecionada(null);
  };

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
          {vendas.map((venda) => (
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
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalhes da Venda #{vendaSelecionada?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {vendaSelecionada ? (
            <>
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
                    <Col sm={3} as="strong">Vendedor:</Col>
                    <Col>{mockVendedores.find(v => v.id === vendaSelecionada.user_id)?.nome}</Col>
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