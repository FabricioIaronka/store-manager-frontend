import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

interface Loja {
    id: number;
    nome: string;
    cnpj: string;
    endereco: string;
}

export function Perfil() {
    const { user, selectStore, activeStoreId } = useAuth(); 

    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const [nome, setNome] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    useEffect(() => {
        if (user) {
        setNome(user.name);
        setEmail(user.email);
        }
    }, [user]);

    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmaSenha, setConfirmaSenha] = useState('');

    const lojasDoUsuario: Loja[] = useMemo(() => {
        return user?.stores?.map((store: any) => ({
        id: store.id,
        nome: store.name || store.nome || 'Loja sem nome', 
        cnpj: store.cnpj || 'CNPJ não informado',
        endereco: store.address || store.endereco || 'Endereço não informado'
        })) || [];
  }, [user]);

    const [lojaSelecionadaId, setLojaSelecionadaId] = useState<string>(activeStoreId || '');
    const [lojaSelecionada, setLojaSelecionada] = useState<Loja | null>(null);

    useEffect(() => {
    if (activeStoreId && lojasDoUsuario.length > 0) {
      if (lojaSelecionadaId !== activeStoreId) {
        const loja = lojasDoUsuario.find(l => String(l.id) === String(activeStoreId));
        if (loja) {
          setLojaSelecionadaId(String(activeStoreId));
          setLojaSelecionada(loja);
        }
      }
    }
  }, [activeStoreId, lojasDoUsuario, lojaSelecionadaId]);

    const handleCancel = () => {
        setNome(user?.name || '');
        setEmail(user?.email || '');
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmaSenha('');
        setIsEditing(false);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (novaSenha && (novaSenha !== confirmaSenha)) {
        alert("As novas senhas não coincidem!");
        return;
        }

        console.log("Salvando dados...", { nome, email });
        
        setShowAlert(true);
        setIsEditing(false);
  };

    const handleLojaChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setLojaSelecionadaId(id);
        
        if (id) {
            const lojaEncontrada = lojasDoUsuario.find(l => l.id === Number(id));
            setLojaSelecionada(lojaEncontrada || null);
        } else {
            setLojaSelecionada(null); 
        }

        selectStore(id);
  };


    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    {showAlert && (
                        <Alert variant="success" onClose={() => setShowAlert(false)} dismissible>
                            Perfil atualizado com sucesso!
                        </Alert>
                    )}

                    <Card className="shadow-sm mb-4">
                        <Card.Header as="h3" className="d-flex justify-content-between align-items-center">
                            Meu Perfil
                            {!isEditing && (
                                <Button variant="outline-primary" size="sm" onClick={() => setIsEditing(true)}>
                                    <i className="bi bi-pencil me-2"></i>
                                    Editar
                                </Button>
                            )}
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSave}>
                                <h5 className="mb-3">Dados Pessoais</h5>
                                <hr className="my-4" />
                                <Form.Group className="mb-3">
                                    <Form.Label>Nome Completo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={nome}
                                        onChange={e => setNome(e.target.value)}
                                        readOnly={!isEditing}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>E-mail</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        readOnly={!isEditing}
                                    />
                                </Form.Group>

                                {isEditing && (
                                    <>
                                        <hr className="my-4" />
                                        <h5 className="mb-3">Alterar Senha</h5>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Senha Atual</Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Digite sua senha atual"
                                                value={senhaAtual}
                                                onChange={e => setSenhaAtual(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nova Senha</Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Mínimo 6 caracteres"
                                                value={novaSenha}
                                                onChange={e => setNovaSenha(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Confirmar Nova Senha</Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Repita a nova senha"
                                                value={confirmaSenha}
                                                onChange={e => setConfirmaSenha(e.target.value)}
                                            />
                                        </Form.Group>
                                    </>
                                )}

                                {isEditing && (
                                    <div className="mt-4 d-flex justify-content-end gap-2">
                                        <Button variant="secondary" onClick={handleCancel}>
                                            Cancelar
                                        </Button>
                                        <Button variant="primary" type="submit">
                                            Salvar Alterações
                                        </Button>
                                    </div>
                                )}
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm">
            <Card.Header as="h5">
              Lojas Associadas
            </Card.Header>
            <Card.Body className="p-4">
              {lojasDoUsuario.length > 0 ? (
                  <>
                    <Form.Group className="mb-3">
                        <Form.Label>Selecionar Loja</Form.Label>
                        <Form.Select
                        value={lojaSelecionadaId}
                        onChange={handleLojaChange}
                        >
                        <option value="">Selecione uma loja...</option>
                        {lojasDoUsuario.map(loja => (
                            <option key={loja.id} value={loja.id}>
                            {loja.nome} (CNPJ: {loja.cnpj})
                            </option>
                        ))}
                        </Form.Select>
                    </Form.Group>

                    {lojaSelecionada && (
                        <div className="p-3 border rounded">
                        <Form.Group className="mb-3">
                            <Form.Label>Nome da Loja</Form.Label>
                            <Form.Control
                            type="text"
                            value={lojaSelecionada.nome}
                            readOnly
                            className="ps-2"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>CNPJ</Form.Label>
                            <Form.Control
                            type="text"
                            value={lojaSelecionada.cnpj}
                            readOnly
                            className="ps-2"
                            />
                        </Form.Group>
                        <Form.Group className="mb-0">
                            <Form.Label>Endereço</Form.Label>
                            <Form.Control
                            type="text"
                            value={lojaSelecionada.endereco}
                            readOnly
                            className="ps-2"
                            />
                        </Form.Group>
                        </div>
                    )}
                  </>
              ) : (
                  <Alert variant="info" className="m-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Este usuário não possui lojas associadas.
                  </Alert>
              )}
            </Card.Body>
          </Card>
                </Col>
            </Row>
        </Container>
    );
}