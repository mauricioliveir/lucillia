import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FileDown, UserPlus, Box, ShoppingCart, DollarSign, ArrowRightLeft, HandCoins, PiggyBank, Briefcase, Home, Users, Package, Banknote, FileText, Trash2, Edit, X, PlusCircle, CheckCircle } from 'lucide-react';

// --- DADOS INICIAIS DE SIMULAÇÃO ---
const initialColaboradores = [
  { id: 1, nome: 'Ana Silva', cpf: '111.222.333-44', rg: '12.345.678-9', filiacao: 'Maria Silva e João Silva', endereco: 'Rua das Flores, 123', telefone: '11987654321', email: 'ana.silva@email.com', cargo: 'Vendedora', salario: 2500.00 },
  { id: 2, nome: 'Carlos Pereira', cpf: '222.333.444-55', rg: '23.456.789-0', filiacao: 'Joana Pereira e Marcos Pereira', endereco: 'Avenida Principal, 456', telefone: '21912345678', email: 'carlos.p@email.com', cargo: 'Gerente de Vendas', salario: 5500.00 },
];

const initialClientes = [
    { id: 1, nome: 'Tech Solutions Ltda', cpfCnpj: '12.345.678/0001-99', tipo: 'Jurídica', endereco: 'Rua da Tecnologia, 1010', telefone: '1133334444', email: 'contato@techsolutions.com' },
    { id: 2, nome: 'João da Silva', cpfCnpj: '987.654.321-00', tipo: 'Física', endereco: 'Rua dos Consumidores, 20', telefone: '8199998888', email: 'joao.silva.cliente@email.com' },
];

const initialProdutos = [
  { id: 1, nome: 'Notebook Pro 15"', descricao: 'Notebook de alta performance com 16GB RAM e 512GB SSD', preco: 7500.00, estoque: 15 },
  { id: 2, nome: 'Mouse Sem Fio Ergonômico', descricao: 'Mouse com design vertical para maior conforto', preco: 250.00, estoque: 50 },
  { id: 3, nome: 'Teclado Mecânico RGB', descricao: 'Teclado para gamers e profissionais', preco: 450.00, estoque: 30 },
  { id: 4, nome: 'Monitor Ultrawide 29"', descricao: 'Monitor com proporção 21:9 para produtividade', preco: 1800.00, estoque: 10 },
];

const initialContasPagar = [
    { id: 1, descricao: 'Aluguel Escritório', fornecedor: 'Imobiliária Central', vencimento: '2025-08-10', valor: 3500.00, status: 'Pendente' },
    { id: 2, descricao: 'Fornecedor de Notebooks', fornecedor: 'Comp Distribuidora', vencimento: '2025-08-15', valor: 15000.00, status: 'Pendente' },
];

const initialContasReceber = [
    { id: 1, clienteId: 1, vendaId: 1, descricao: 'Venda de 2 Notebooks', vencimento: '2025-08-20', valorOriginal: 15000.00, valorFinal: 15000.00, status: 'Pendente' },
];

const initialVendas = [
    { id: 1, clienteId: 1, colaboradorId: 1, data: '2025-07-28', valorTotal: 15000.00, itens: [{ produtoId: 1, quantidade: 2, precoUnitario: 7500.00 }] },
];

const initialLancamentosCaixa = [
    { id: 1, data: '2025-08-01', descricao: 'Saldo Inicial do Mês', tipo: 'Entrada', valor: 25000.00 },
    { id: 2, data: '2025-08-02', descricao: 'Compra de material de escritório', tipo: 'Saída', valor: 350.00 },
];

// --- FUNÇÃO DE GERAÇÃO DE PDF ---
const generatePdf = (title, head, body) => {
    const doc = new jsPDF();
    doc.autoTable({
        head: head,
        body: body,
        startY: 20,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
    });
    doc.save(`${title.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
};

// --- COMPONENTES DA UI ---
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
                {children}
            </div>
        </div>
    </div>
);

const Input = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
);

const Select = ({ label, children, ...props }) => (
     <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white">
            {children}
        </select>
    </div>
);

const Button = ({ children, onClick, className = 'bg-indigo-600 hover:bg-indigo-700', ...props }) => (
    <button onClick={onClick} className={`flex items-center justify-center gap-2 px-4 py-2 text-white font-semibold rounded-md shadow-sm transition-colors ${className}`} {...props}>
        {children}
    </button>
);

// --- COMPONENTES DAS PÁGINAS ---
const Dashboard = ({ data }) => {
    const totalColaboradores = data.colaboradores.length;
    const totalProdutos = data.produtos.length;
    const totalClientes = data.clientes.length;
    const totalVendas = data.vendas.length;
    const estoqueValor = data.produtos.reduce((acc, p) => acc + (p.estoque * p.preco), 0);
    const aReceber = data.contasReceber.filter(c => c.status === 'Pendente').reduce((acc, c) => acc + c.valorFinal, 0);

    const StatCard = ({ icon, title, value, color }) => (
        <div className={`bg-white p-6 rounded-lg shadow-md flex items-center gap-4 border-l-4 ${color}`}>
            {icon}
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard de Simulação</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<Users size={32} className="text-blue-500"/>} title="Colaboradores" value={totalColaboradores} color="border-blue-500" />
                <StatCard icon={<Package size={32} className="text-green-500"/>} title="Tipos de Produtos" value={totalProdutos} color="border-green-500" />
                <StatCard icon={<Briefcase size={32} className="text-purple-500"/>} title="Clientes Cadastrados" value={totalClientes} color="border-purple-500" />
                <StatCard icon={<ShoppingCart size={32} className="text-orange-500"/>} title="Total de Vendas" value={totalVendas} color="border-orange-500" />
                <StatCard icon={<Banknote size={32} className="text-teal-500"/>} title="Valor em Estoque" value={estoqueValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} color="border-teal-500" />
                <StatCard icon={<HandCoins size={32} className="text-yellow-500"/>} title="Total a Receber" value={aReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} color="border-yellow-500" />
            </div>
        </div>
    );
};

const Pessoal = ({ colaboradores, setColaboradores }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingColaborador, setEditingColaborador] = useState(null);

    const handleSave = (colaborador) => {
        if (editingColaborador) {
            setColaboradores(colaboradores.map(c => c.id === editingColaborador.id ? { ...c, ...colaborador } : c));
        } else {
            setColaboradores([...colaboradores, { ...colaborador, id: Date.now() }]);
        }
        setModalOpen(false);
        setEditingColaborador(null);
    };

    const handleEdit = (colaborador) => {
        setEditingColaborador(colaborador);
        setModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Tem certeza que deseja excluir este colaborador?')) {
            setColaboradores(colaboradores.filter(c => c.id !== id));
        }
    };
    
    const handleGeneratePdf = () => {
        const head = [['Nome', 'CPF', 'Cargo', 'Salário', 'Email']];
        const body = colaboradores.map(c => [c.nome, c.cpf, c.cargo, c.salario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), c.email]);
        generatePdf('Relatório de Colaboradores', head, body);
    };

    const ColaboradorForm = ({ onSave, onCancel, colaborador }) => {
        const [formData, setFormData] = useState(colaborador || { nome: '', cpf: '', rg: '', filiacao: '', endereco: '', telefone: '', email: '', cargo: '', salario: '' });
        
        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            onSave({...formData, salario: parseFloat(formData.salario)});
        };

        return (
            <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold mb-6">{colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nome Completo" name="nome" value={formData.nome} onChange={handleChange} required />
                    <Input label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} required />
                    <Input label="RG" name="rg" value={formData.rg} onChange={handleChange} />
                    <Input label="Filiação" name="filiacao" value={formData.filiacao} onChange={handleChange} />
                    <Input label="Endereço" name="endereco" value={formData.endereco} onChange={handleChange} />
                    <Input label="Telefone" name="telefone" value={formData.telefone} onChange={handleChange} />
                    <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <Input label="Cargo" name="cargo" value={formData.cargo} onChange={handleChange} required />
                    <Input label="Salário (R$)" name="salario" type="number" step="0.01" value={formData.salario} onChange={handleChange} required />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800">Cancelar</Button>
                    <Button type="submit">{colaborador ? 'Salvar Alterações' : 'Cadastrar'}</Button>
                </div>
            </form>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Departamento Pessoal</h1>
                <div className="flex gap-4">
                    <Button onClick={() => setModalOpen(true)}><UserPlus size={18} /> Novo Colaborador</Button>
                    <Button onClick={handleGeneratePdf} className="bg-green-600 hover:bg-green-700"><FileDown size={18} /> Gerar Relatório</Button>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-3">Nome</th>
                            <th className="p-3">Cargo</th>
                            <th className="p-3">Telefone</th>
                            <th className="p-3">Email</th>
                            <th className="p-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {colaboradores.map(c => (
                            <tr key={c.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{c.nome}</td>
                                <td className="p-3">{c.cargo}</td>
                                <td className="p-3">{c.telefone}</td>
                                <td className="p-3">{c.email}</td>
                                <td className="p-3 flex justify-center gap-2">
                                    <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {modalOpen && (
                <Modal onClose={() => { setModalOpen(false); setEditingColaborador(null); }}>
                    <ColaboradorForm onSave={handleSave} onCancel={() => { setModalOpen(false); setEditingColaborador(null); }} colaborador={editingColaborador} />
                </Modal>
            )}
        </div>
    );
};

const Estoque = ({ produtos, setProdutos }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduto, setEditingProduto] = useState(null);

    const handleSave = (produto) => {
        if (editingProduto) {
            setProdutos(produtos.map(p => p.id === editingProduto.id ? { ...p, ...produto } : p));
        } else {
            setProdutos([...produtos, { ...produto, id: Date.now() }]);
        }
        setModalOpen(false);
        setEditingProduto(null);
    };

    const handleEdit = (produto) => {
        setEditingProduto(produto);
        setModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Tem certeza que deseja excluir este produto?')) {
            setProdutos(produtos.filter(p => p.id !== id));
        }
    };
    
    const handleGeneratePdf = () => {
        const head = [['Produto', 'Descrição', 'Preço Unitário', 'Qtd. em Estoque', 'Valor Total']];
        const body = produtos.map(p => [
            p.nome, 
            p.descricao, 
            p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 
            p.estoque,
            (p.preco * p.estoque).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        ]);
        generatePdf('Relatório de Estoque', head, body);
    };

    const ProdutoForm = ({ onSave, onCancel, produto }) => {
        const [formData, setFormData] = useState(produto || { nome: '', descricao: '', preco: '', estoque: '' });
        
        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            onSave({
                ...formData, 
                preco: parseFloat(formData.preco),
                estoque: parseInt(formData.estoque, 10)
            });
        };

        return (
            <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold mb-6">{produto ? 'Editar Produto' : 'Novo Produto (Entrada via NF Fictícia)'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nome do Produto" name="nome" value={formData.nome} onChange={handleChange} required />
                    <Input label="Descrição" name="descricao" value={formData.descricao} onChange={handleChange} />
                    <Input label="Preço de Venda (R$)" name="preco" type="number" step="0.01" value={formData.preco} onChange={handleChange} required />
                    <Input label="Quantidade em Estoque" name="estoque" type="number" value={formData.estoque} onChange={handleChange} required />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800">Cancelar</Button>
                    <Button type="submit">{produto ? 'Salvar Alterações' : 'Adicionar ao Estoque'}</Button>
                </div>
            </form>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gestão de Estoque</h1>
                <div className="flex gap-4">
                    <Button onClick={() => setModalOpen(true)}><Box size={18} /> Novo Produto</Button>
                    <Button onClick={handleGeneratePdf} className="bg-green-600 hover:bg-green-700"><FileDown size={18} /> Gerar Relatório</Button>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-3">Produto</th>
                            <th className="p-3">Preço Unit.</th>
                            <th className="p-3 text-center">Estoque</th>
                            <th className="p-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {produtos.map(p => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">
                                    <div className="font-semibold">{p.nome}</div>
                                    <div className="text-xs text-gray-500">{p.descricao}</div>
                                </td>
                                <td className="p-3">{p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td className="p-3 text-center">{p.estoque}</td>
                                <td className="p-3 flex justify-center gap-2">
                                    <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {modalOpen && (
                <Modal onClose={() => { setModalOpen(false); setEditingProduto(null); }}>
                    <ProdutoForm onSave={handleSave} onCancel={() => { setModalOpen(false); setEditingProduto(null); }} produto={editingProduto} />
                </Modal>
            )}
        </div>
    );
};

const Vendas = ({ data, setData }) => {
    const { produtos, clientes, colaboradores, vendas, contasReceber, lancamentosCaixa } = data;
    const [modalOpen, setModalOpen] = useState(false);

    const handleNovaVenda = (vendaData) => {
        const { clienteId, colaboradorId, itens, tipoPagamento } = vendaData;
        
        // 1. Calcular valor total
        const valorTotal = itens.reduce((acc, item) => {
            const produto = produtos.find(p => p.id === item.produtoId);
            return acc + (produto.preco * item.quantidade);
        }, 0);

        // 2. Criar a nova venda
        const novaVenda = {
            id: Date.now(),
            clienteId,
            colaboradorId,
            data: new Date().toISOString().slice(0, 10),
            valorTotal,
            itens
        };

        // 3. Atualizar estoque
        const novosProdutos = produtos.map(p => {
            const itemVendido = itens.find(i => i.produtoId === p.id);
            if (itemVendido) {
                return { ...p, estoque: p.estoque - itemVendido.quantidade };
            }
            return p;
        });

        let novasContasReceber = [...contasReceber];
        let novosLancamentosCaixa = [...lancamentosCaixa];

        // 4. Lançar em Contas a Receber ou Caixa
        if (tipoPagamento === 'prazo') {
            const novaContaReceber = {
                id: Date.now(),
                clienteId,
                vendaId: novaVenda.id,
                descricao: `Venda #${novaVenda.id}`,
                vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Vencimento em 30 dias
                valorOriginal: valorTotal,
                valorFinal: valorTotal,
                status: 'Pendente'
            };
            novasContasReceber.push(novaContaReceber);
        } else { // À vista
            const novoLancamento = {
                id: Date.now(),
                data: new Date().toISOString().slice(0, 10),
                descricao: `Recebimento Venda #${novaVenda.id}`,
                tipo: 'Entrada',
                valor: valorTotal
            };
            novosLancamentosCaixa.push(novoLancamento);
        }

        setData(prev => ({
            ...prev,
            vendas: [...vendas, novaVenda],
            produtos: novosProdutos,
            contasReceber: novasContasReceber,
            lancamentosCaixa: novosLancamentosCaixa,
        }));

        setModalOpen(false);
        alert(`Venda #${novaVenda.id} realizada com sucesso! (NF Fictícia emitida)`);
    };

    const handleGeneratePdf = () => {
        const head = [['ID Venda', 'Data', 'Cliente', 'Vendedor', 'Valor Total']];
        const body = vendas.map(v => {
            const cliente = clientes.find(c => c.id === v.clienteId)?.nome || 'N/A';
            const vendedor = colaboradores.find(c => c.id === v.colaboradorId)?.nome || 'N/A';
            return [
                `#${v.id}`,
                new Date(v.data).toLocaleDateString('pt-BR'),
                cliente,
                vendedor,
                v.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            ];
        });
        generatePdf('Relatório de Vendas', head, body);
    };

    const VendaForm = ({ onSave, onCancel }) => {
        const [clienteId, setClienteId] = useState('');
        const [colaboradorId, setColaboradorId] = useState('');
        const [tipoPagamento, setTipoPagamento] = useState('vista');
        const [itens, setItens] = useState([]);
        const [produtoId, setProdutoId] = useState('');
        const [quantidade, setQuantidade] = useState(1);

        const handleAddItem = () => {
            if (!produtoId || quantidade <= 0) return;
            const produto = produtos.find(p => p.id === parseInt(produtoId));
            if (produto.estoque < quantidade) {
                alert(`Estoque insuficiente para ${produto.nome}. Disponível: ${produto.estoque}`);
                return;
            }
            if (itens.some(i => i.produtoId === produto.id)) {
                 alert('Produto já adicionado. Edite a quantidade na lista.');
                 return;
            }
            setItens([...itens, { produtoId: produto.id, quantidade: parseInt(quantidade) }]);
            setProdutoId('');
            setQuantidade(1);
        };
        
        const handleRemoveItem = (id) => {
            setItens(itens.filter(i => i.produtoId !== id));
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!clienteId || !colaboradorId || itens.length === 0) {
                alert('Preencha Cliente, Vendedor e adicione pelo menos um item.');
                return;
            }
            onSave({ 
                clienteId: parseInt(clienteId), 
                colaboradorId: parseInt(colaboradorId),
                tipoPagamento,
                itens
            });
        };
        
        const valorTotal = useMemo(() => {
            return itens.reduce((acc, item) => {
                const produto = produtos.find(p => p.id === item.produtoId);
                return acc + (produto.preco * item.quantidade);
            }, 0);
        }, [itens, produtos]);

        return (
            <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold mb-6">Realizar Nova Venda</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Select label="Cliente" value={clienteId} onChange={e => setClienteId(e.target.value)} required>
                        <option value="">Selecione...</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </Select>
                    <Select label="Vendedor" value={colaboradorId} onChange={e => setColaboradorId(e.target.value)} required>
                        <option value="">Selecione...</option>
                        {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </Select>
                    <Select label="Tipo de Pagamento" value={tipoPagamento} onChange={e => setTipoPagamento(e.target.value)} required>
                        <option value="vista">À Vista</option>
                        <option value="prazo">A Prazo</option>
                    </Select>
                </div>

                <div className="border-t border-b py-6 mb-6">
                    <h3 className="font-semibold text-lg mb-4">Itens da Venda</h3>
                    <div className="flex items-end gap-2 mb-4">
                        <div className="flex-grow">
                            <Select label="Produto" value={produtoId} onChange={e => setProdutoId(e.target.value)}>
                                <option value="">Selecione um produto...</option>
                                {produtos.filter(p => p.estoque > 0).map(p => <option key={p.id} value={p.id}>{p.nome} (Estoque: {p.estoque})</option>)}
                            </Select>
                        </div>
                        <div className="w-24">
                            <Input label="Qtd." type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} />
                        </div>
                        <Button type="button" onClick={handleAddItem} className="bg-blue-500 hover:bg-blue-600 h-10"><PlusCircle size={18} /></Button>
                    </div>
                    
                    <div className="space-y-2">
                        {itens.map(item => {
                            const produto = produtos.find(p => p.id === item.produtoId);
                            return (
                                <div key={item.produtoId} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                                    <span>{produto.nome} (Qtd: {item.quantidade})</span>
                                    <div className="flex items-center gap-4">
                                        <span>{(produto.preco * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                        <button type="button" onClick={() => handleRemoveItem(item.produtoId)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="text-right text-2xl font-bold mb-6">
                    Total: {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800">Cancelar</Button>
                    <Button type="submit">Finalizar Venda</Button>
                </div>
            </form>
        );
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Lançamento de Vendas</h1>
                <div className="flex gap-4">
                    <Button onClick={() => setModalOpen(true)}><ShoppingCart size={18} /> Nova Venda</Button>
                    <Button onClick={handleGeneratePdf} className="bg-green-600 hover:bg-green-700"><FileDown size={18} /> Gerar Relatório</Button>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-3">Data</th>
                            <th className="p-3">Cliente</th>
                            <th className="p-3">Vendedor</th>
                            <th className="p-3">Itens</th>
                            <th className="p-3">Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendas.map(v => (
                            <tr key={v.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{new Date(v.data).toLocaleDateString('pt-BR')}</td>
                                <td className="p-3">{clientes.find(c => c.id === v.clienteId)?.nome || 'N/A'}</td>
                                <td className="p-3">{colaboradores.find(c => c.id === v.colaboradorId)?.nome || 'N/A'}</td>
                                <td className="p-3">{v.itens.length}</td>
                                <td className="p-3 font-semibold">{v.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {modalOpen && (
                <Modal onClose={() => setModalOpen(false)}>
                    <VendaForm onSave={handleNovaVenda} onCancel={() => setModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

const Financeiro = ({ data, setData, subPage, setSubPage }) => {
    const { contasPagar, contasReceber, lancamentosCaixa, clientes } = data;

    const handleBaixarContaPagar = (id) => {
        if (!window.confirm('Confirmar pagamento desta conta? Uma saída será registrada no caixa.')) return;
        
        const conta = contasPagar.find(c => c.id === id);
        const novasContasPagar = contasPagar.map(c => c.id === id ? { ...c, status: 'Pago', dataPagamento: new Date().toISOString().slice(0,10) } : c);
        const novoLancamentoCaixa = {
            id: Date.now(),
            data: new Date().toISOString().slice(0,10),
            descricao: `Pagamento: ${conta.descricao}`,
            tipo: 'Saída',
            valor: conta.valor
        };

        setData(prev => ({
            ...prev,
            contasPagar: novasContasPagar,
            lancamentosCaixa: [...prev.lancamentosCaixa, novoLancamentoCaixa]
        }));
    };

    const handleBaixarContaReceber = (id) => {
        if (!window.confirm('Confirmar recebimento desta conta? Uma entrada será registrada no caixa.')) return;
        
        const conta = contasReceber.find(c => c.id === id);
        const novasContasReceber = contasReceber.map(c => c.id === id ? { ...c, status: 'Pago', dataPagamento: new Date().toISOString().slice(0,10) } : c);
        const novoLancamentoCaixa = {
            id: Date.now(),
            data: new Date().toISOString().slice(0,10),
            descricao: `Recebimento: ${conta.descricao}`,
            tipo: 'Entrada',
            valor: conta.valorFinal
        };

        setData(prev => ({
            ...prev,
            contasReceber: novasContasReceber,
            lancamentosCaixa: [...prev.lancamentosCaixa, novoLancamentoCaixa]
        }));
    };
    
    const handleAplicarJuros = (id) => {
        const conta = contasReceber.find(c => c.id === id);
        const juros = conta.valorOriginal * 0.02; // 2% de juros
        const multa = conta.valorOriginal * 0.01; // 1% de multa
        const novoValor = conta.valorOriginal + juros + multa;
        
        if (!window.confirm(`Aplicar juros e multa? Novo valor: ${novoValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`)) return;

        const novasContasReceber = contasReceber.map(c => c.id === id ? { ...c, valorFinal: novoValor, status: 'Atrasado' } : c);
        setData(prev => ({ ...prev, contasReceber: novasContasReceber }));
    };

    const [dataFluxo, setDataFluxo] = useState(new Date().toISOString().slice(0, 10));

    const fluxoDoDia = useMemo(() => {
        const saldoAnterior = lancamentosCaixa
            .filter(l => l.data < dataFluxo)
            .reduce((acc, l) => acc + (l.tipo === 'Entrada' ? l.valor : -l.valor), 0);
        
        const entradas = lancamentosCaixa.filter(l => l.data === dataFluxo && l.tipo === 'Entrada');
        const saidas = lancamentosCaixa.filter(l => l.data === dataFluxo && l.tipo === 'Saída');
        
        const totalEntradas = entradas.reduce((acc, l) => acc + l.valor, 0);
        const totalSaidas = saidas.reduce((acc, l) => acc + l.valor, 0);

        const saldoFinal = saldoAnterior + totalEntradas - totalSaidas;

        return { saldoAnterior, entradas, saidas, totalEntradas, totalSaidas, saldoFinal };
    }, [lancamentosCaixa, dataFluxo]);


    const FinanceiroNav = () => (
        <div className="flex border-b mb-6">
            <button onClick={() => setSubPage('caixa')} className={`px-4 py-2 ${subPage === 'caixa' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-gray-500'}`}>Fluxo de Caixa</button>
            <button onClick={() => setSubPage('pagar')} className={`px-4 py-2 ${subPage === 'pagar' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-gray-500'}`}>Contas a Pagar</button>
            <button onClick={() => setSubPage('receber')} className={`px-4 py-2 ${subPage === 'receber' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-gray-500'}`}>Contas a Receber</button>
        </div>
    );
    
    const renderSubPage = () => {
        switch (subPage) {
            case 'pagar':
                return <ContasPagar contas={contasPagar} onBaixar={handleBaixarContaPagar} setData={setData} />;
            case 'receber':
                return <ContasReceber contas={contasReceber} clientes={clientes} onBaixar={handleBaixarContaReceber} onJuros={handleAplicarJuros} setData={setData} />;
            case 'caixa':
            default:
                return <FluxoCaixa dataFluxo={dataFluxo} setDataFluxo={setDataFluxo} fluxo={fluxoDoDia} setData={setData} />;
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Financeiro</h1>
            <FinanceiroNav />
            {renderSubPage()}
        </div>
    );
};

const FluxoCaixa = ({ dataFluxo, setDataFluxo, fluxo, setData }) => {
    const [modalOpen, setModalOpen] = useState(false);

    const handleAddLancamento = (lancamento) => {
        setData(prev => ({
            ...prev,
            lancamentosCaixa: [...prev.lancamentosCaixa, { ...lancamento, id: Date.now() }]
        }));
        setModalOpen(false);
    };
    
    const handleGeneratePdf = () => {
        const doc = new jsPDF();
        doc.text(`Fluxo de Caixa - ${new Date(dataFluxo + 'T12:00:00').toLocaleDateString('pt-BR')}`, 14, 16);
        
        doc.autoTable({
            body: [
                ['Saldo Anterior', fluxo.saldoAnterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
                ['Total de Entradas', fluxo.totalEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
                ['Total de Saídas', fluxo.totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
                ['Saldo Final', fluxo.saldoFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
            ],
            startY: 20,
            theme: 'plain',
            styles: { fontSize: 12 },
            columnStyles: { 0: { fontStyle: 'bold' } }
        });

        if (fluxo.entradas.length > 0) {
            doc.autoTable({
                head: [['Entradas do Dia']],
                startY: doc.lastAutoTable.finalY + 10
            });
            doc.autoTable({
                head: [['Descrição', 'Valor']],
                body: fluxo.entradas.map(e => [e.descricao, e.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })]),
                startY: doc.lastAutoTable.finalY,
                theme: 'grid'
            });
        }
        
        if (fluxo.saidas.length > 0) {
            doc.autoTable({
                head: [['Saídas do Dia']],
                startY: doc.lastAutoTable.finalY + 10
            });
            doc.autoTable({
                head: [['Descrição', 'Valor']],
                body: fluxo.saidas.map(s => [s.descricao, s.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })]),
                startY: doc.lastAutoTable.finalY,
                theme: 'grid'
            });
        }

        doc.save(`fluxo_caixa_${dataFluxo}.pdf`);
    };

    const LancamentoForm = ({ onSave, onCancel }) => {
        const [formData, setFormData] = useState({ data: dataFluxo, descricao: '', tipo: 'Entrada', valor: '' });
        
        const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value });
        
        const handleSubmit = (e) => {
            e.preventDefault();
            onSave({...formData, valor: parseFloat(formData.valor)});
        };

        return (
            <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold mb-6">Novo Lançamento no Caixa</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Data" name="data" type="date" value={formData.data} onChange={handleChange} required />
                    <Input label="Descrição" name="descricao" value={formData.descricao} onChange={handleChange} required />
                    <Select label="Tipo" name="tipo" value={formData.tipo} onChange={handleChange}>
                        <option value="Entrada">Entrada</option>
                        <option value="Saída">Saída</option>
                    </Select>
                    <Input label="Valor (R$)" name="valor" type="number" step="0.01" value={formData.valor} onChange={handleChange} required />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800">Cancelar</Button>
                    <Button type="submit">Lançar</Button>
                </div>
            </form>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-700">Dia:</h2>
                    <Input type="date" value={dataFluxo} onChange={e => setDataFluxo(e.target.value)} />
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => setModalOpen(true)}><PlusCircle size={18} /> Novo Lançamento</Button>
                    <Button onClick={handleGeneratePdf} className="bg-green-600 hover:bg-green-700"><FileDown size={18} /> Gerar Relatório</Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-100 p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-600">Saldo Anterior</p>
                    <p className="text-xl font-bold">{fluxo.saldoAnterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg shadow">
                    <p className="text-sm text-green-800">Total Entradas</p>
                    <p className="text-xl font-bold text-green-900">{fluxo.totalEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div className="bg-red-100 p-4 rounded-lg shadow">
                    <p className="text-sm text-red-800">Total Saídas</p>
                    <p className="text-xl font-bold text-red-900">{fluxo.totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg shadow">
                    <p className="text-sm text-blue-800">Saldo Final</p>
                    <p className="text-xl font-bold text-blue-900">{fluxo.saldoFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2 border-b pb-2 text-green-700">Entradas do Dia</h3>
                    {fluxo.entradas.length > 0 ? (
                        <ul>{fluxo.entradas.map(l => <li key={l.id} className="flex justify-between py-1"><span>{l.descricao}</span> <span>{l.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></li>)}</ul>
                    ) : <p className="text-gray-500">Nenhuma entrada registrada.</p>}
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2 border-b pb-2 text-red-700">Saídas do Dia</h3>
                    {fluxo.saidas.length > 0 ? (
                        <ul>{fluxo.saidas.map(l => <li key={l.id} className="flex justify-between py-1"><span>{l.descricao}</span> <span>{l.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></li>)}</ul>
                    ) : <p className="text-gray-500">Nenhuma saída registrada.</p>}
                </div>
            </div>
            {modalOpen && <Modal onClose={() => setModalOpen(false)}><LancamentoForm onSave={handleAddLancamento} onCancel={() => setModalOpen(false)} /></Modal>}
        </div>
    );
};

const ContasPagar = ({ contas, onBaixar, setData }) => {
    const [modalOpen, setModalOpen] = useState(false);

    const handleSave = (conta) => {
        setData(prev => ({
            ...prev,
            contasPagar: [...prev.contasPagar, { ...conta, id: Date.now(), status: 'Pendente' }]
        }));
        setModalOpen(false);
    };

    const handleGeneratePdf = () => {
        const head = [['Descrição', 'Fornecedor', 'Vencimento', 'Valor', 'Status']];
        const body = contas.map(c => [
            c.descricao,
            c.fornecedor,
            new Date(c.vencimento + 'T12:00:00').toLocaleDateString('pt-BR'),
            c.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            c.status
        ]);
        generatePdf('Relatório de Contas a Pagar', head, body);
    };

    const ContaPagarForm = ({ onSave, onCancel }) => {
        const [formData, setFormData] = useState({ descricao: '', fornecedor: '', vencimento: '', valor: '' });
        const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value });
        const handleSubmit = (e) => {
            e.preventDefault();
            onSave({...formData, valor: parseFloat(formData.valor)});
        };

        return (
            <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold mb-6">Nova Conta a Pagar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Descrição" name="descricao" value={formData.descricao} onChange={handleChange} required />
                    <Input label="Fornecedor" name="fornecedor" value={formData.fornecedor} onChange={handleChange} required />
                    <Input label="Data de Vencimento" name="vencimento" type="date" value={formData.vencimento} onChange={handleChange} required />
                    <Input label="Valor (R$)" name="valor" type="number" step="0.01" value={formData.valor} onChange={handleChange} required />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800">Cancelar</Button>
                    <Button type="submit">Cadastrar Conta</Button>
                </div>
            </form>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-700">Contas a Pagar</h2>
                <div className="flex gap-4">
                    <Button onClick={() => setModalOpen(true)}><PlusCircle size={18} /> Nova Conta</Button>
                    <Button onClick={handleGeneratePdf} className="bg-green-600 hover:bg-green-700"><FileDown size={18} /> Gerar Relatório</Button>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead><tr className="border-b"><th className="p-3">Descrição</th><th className="p-3">Vencimento</th><th className="p-3">Valor</th><th className="p-3">Status</th><th className="p-3 text-center">Ações</th></tr></thead>
                    <tbody>
                        {contas.map(c => (
                            <tr key={c.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">
                                    <div className="font-semibold">{c.descricao}</div>
                                    <div className="text-xs text-gray-500">{c.fornecedor}</div>
                                </td>
                                <td className="p-3">{new Date(c.vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="p-3">{c.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.status === 'Pago' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{c.status}</span></td>
                                <td className="p-3 text-center">
                                    {c.status === 'Pendente' && <Button onClick={() => onBaixar(c.id)} className="bg-blue-500 hover:bg-blue-600 text-xs py-1 px-2"><CheckCircle size={14} /> Dar Baixa</Button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {modalOpen && <Modal onClose={() => setModalOpen(false)}><ContaPagarForm onSave={handleSave} onCancel={() => setModalOpen(false)} /></Modal>}
        </div>
    );
};

const ContasReceber = ({ contas, clientes, onBaixar, onJuros, setData }) => {
    const [modalOpen, setModalOpen] = useState(false);

    const handleSave = (conta) => {
        setData(prev => ({
            ...prev,
            contasReceber: [...prev.contasReceber, { ...conta, id: Date.now(), status: 'Pendente', valorFinal: conta.valorOriginal }]
        }));
        setModalOpen(false);
    };

    const handleGeneratePdf = () => {
        const head = [['Cliente', 'Descrição', 'Vencimento', 'Valor', 'Status']];
        const body = contas.map(c => {
            const cliente = clientes.find(cli => cli.id === c.clienteId)?.nome || 'N/A';
            return [
                cliente,
                c.descricao,
                new Date(c.vencimento + 'T12:00:00').toLocaleDateString('pt-BR'),
                c.valorFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                c.status
            ];
        });
        generatePdf('Relatório de Contas a Receber', head, body);
    };

    const isAtrasada = (vencimento) => new Date(vencimento) < new Date() && !vencimento.includes(new Date().toISOString().slice(0, 10));

    const ContaReceberForm = ({ onSave, onCancel }) => {
        const [formData, setFormData] = useState({ clienteId: '', descricao: '', vencimento: '', valorOriginal: '' });
        const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value });
        const handleSubmit = (e) => {
            e.preventDefault();
            onSave({
                ...formData, 
                clienteId: parseInt(formData.clienteId),
                valorOriginal: parseFloat(formData.valorOriginal)
            });
        };

        return (
            <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold mb-6">Nova Conta a Receber (Manual)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Cliente" name="clienteId" value={formData.clienteId} onChange={handleChange} required>
                        <option value="">Selecione...</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </Select>
                    <Input label="Descrição" name="descricao" value={formData.descricao} onChange={handleChange} required />
                    <Input label="Data de Vencimento" name="vencimento" type="date" value={formData.vencimento} onChange={handleChange} required />
                    <Input label="Valor (R$)" name="valorOriginal" type="number" step="0.01" value={formData.valorOriginal} onChange={handleChange} required />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800">Cancelar</Button>
                    <Button type="submit">Cadastrar Conta</Button>
                </div>
            </form>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-700">Contas a Receber</h2>
                <div className="flex gap-4">
                    <Button onClick={() => setModalOpen(true)}><PlusCircle size={18} /> Nova Conta</Button>
                    <Button onClick={handleGeneratePdf} className="bg-green-600 hover:bg-green-700"><FileDown size={18} /> Gerar Relatório</Button>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead><tr className="border-b"><th className="p-3">Cliente</th><th className="p-3">Vencimento</th><th className="p-3">Valor</th><th className="p-3">Status</th><th className="p-3 text-center">Ações</th></tr></thead>
                    <tbody>
                        {contas.map(c => (
                            <tr key={c.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{clientes.find(cli => cli.id === c.clienteId)?.nome || 'N/A'}</td>
                                <td className="p-3">{new Date(c.vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="p-3">{c.valorFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.status === 'Pago' ? 'bg-green-200 text-green-800' : c.status === 'Atrasado' || (c.status === 'Pendente' && isAtrasada(c.vencimento)) ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>{c.status === 'Pendente' && isAtrasada(c.vencimento) ? 'Atrasado' : c.status}</span></td>
                                <td className="p-3 text-center flex justify-center gap-2">
                                    {c.status === 'Pendente' && <Button onClick={() => onBaixar(c.id)} className="bg-blue-500 hover:bg-blue-600 text-xs py-1 px-2"><CheckCircle size={14} /> Dar Baixa</Button>}
                                    {c.status !== 'Pago' && isAtrasada(c.vencimento) && <Button onClick={() => onJuros(c.id)} className="bg-yellow-500 hover:bg-yellow-600 text-xs py-1 px-2">Aplicar Juros</Button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {modalOpen && <Modal onClose={() => setModalOpen(false)}><ContaReceberForm onSave={handleSave} onCancel={() => setModalOpen(false)} /></Modal>}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
    const [page, setPage] = useState('dashboard');
    const [financeSubPage, setFinanceSubPage] = useState('caixa');
    const [data, setData] = useState({
        colaboradores: initialColaboradores,
        clientes: initialClientes,
        produtos: initialProdutos,
        contasPagar: initialContasPagar,
        contasReceber: initialContasReceber,
        vendas: initialVendas,
        lancamentosCaixa: initialLancamentosCaixa,
    });

    const renderPage = () => {
        switch (page) {
            case 'pessoal':
                return <Pessoal colaboradores={data.colaboradores} setColaboradores={(colaboradores) => setData(d => ({ ...d, colaboradores }))} />;
            case 'estoque':
                return <Estoque produtos={data.produtos} setProdutos={(produtos) => setData(d => ({ ...d, produtos }))} />;
            case 'vendas':
                return <Vendas data={data} setData={setData} />;
            case 'financeiro':
                return <Financeiro data={data} setData={setData} subPage={financeSubPage} setSubPage={setFinanceSubPage} />;
            case 'dashboard':
            default:
                return <Dashboard data={data} />;
        }
    };
    
    const NavItem = ({ icon, label, pageName, currentPage, setPage }) => (
        <button 
            onClick={() => setPage(pageName)} 
            className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors ${currentPage === pageName ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'}`}
        >
            {icon}
            <span className="ml-3">{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <aside className="w-64 bg-indigo-600 text-white flex flex-col p-4">
                <div className="text-2xl font-bold mb-10 px-2 flex items-center gap-2">
                    <FileText />
                    <span>Rotinas Administrativas</span>
                </div>
                <nav className="flex flex-col gap-2">
                    <NavItem icon={<Home size={20} />} label="Dashboard" pageName="dashboard" currentPage={page} setPage={setPage} />
                    <NavItem icon={<Users size={20} />} label="Dep. Pessoal" pageName="pessoal" currentPage={page} setPage={setPage} />
                    <NavItem icon={<Package size={20} />} label="Estoque" pageName="estoque" currentPage={page} setPage={setPage} />
                    <NavItem icon={<ShoppingCart size={20} />} label="Vendas" pageName="vendas" currentPage={page} setPage={setPage} />
                    <NavItem icon={<DollarSign size={20} />} label="Financeiro" pageName="financeiro" currentPage={page} setPage={setPage} />
                </nav>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
}