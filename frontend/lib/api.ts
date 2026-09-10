import axios from 'axios';

const api = axios.create({
    baseURL: typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'),
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Interfaces alinhadas com os Schemas do Backend ─────────────────────────

export interface Usuario {
    id_usuario: number;
    nome: string;
    email: string;
    renda_mensal?: number;
    data_criacao: string;
    data_atualizacao?: string | null;
    ativo: boolean;
}

export interface Categoria {
    id_categoria: number;
    nome: string;
    tipo: 'Receita' | 'Despesa';
    grupo_50_30_20?: 'Essencial' | 'Desejável' | 'Poupança' | null;
    cor?: string | null;
    id_usuario: number;
    ativa: boolean;
}

export interface Conta {
    id_conta: number;
    nome: string;
    tipo: 'Conta Corrente' | 'Poupança' | 'Carteira' | 'Outro';
    saldo_inicial: number;
    id_usuario: number;
    data_criacao: string;
    ativa: boolean;
    cor?: string | null;        // Cor de identificação visual da conta (hex)
    // vem de ContaFinanceiraComSaldo
    saldo_atual?: number;
    total_receitas?: number;
    total_despesas?: number;
}

export interface Lancamento {
    id_lancamento: number;
    id_usuario: number;
    id_conta: number;
    id_categoria: number;
    tipo: 'Receita' | 'Despesa';
    valor: number;
    data: string;
    descricao?: string | null;
    pago: boolean;
    origem: string;
    id_recorrencia?: number | null;
    data_criacao: string;
    // vem de LancamentoComDetalhes
    nome_conta?: string;
    tipo_conta?: string;
    nome_categoria?: string;
    grupo_categoria?: string;
    cor_categoria?: string | null;
}

export interface Meta {
    id_meta: number;
    id_usuario: number;
    nome: string;
    valor_alvo: number;
    valor_atual: number;
    data_inicio: string;
    data_fim_prev?: string | null;
    status: 'Em Andamento' | 'Concluída' | 'Cancelada';
    data_criacao: string;
    percentual_atingido?: number | null;
    valor_faltante?: number | null;
    dias_restantes?: number | null;
}

export interface TotaisPeriodo {
    total_receitas: number;
    total_despesas: number;
    saldo: number;
}

export interface GastosPorCategoria {
    categoria: string;
    tipo_categoria: string;
    grupo_50_30_20?: string;
    valor: number;
}

export interface EvolucaoSaldo {
    mes_ano: string;
    receitas: number;
    despesas: number;
}

export interface DashboardWidget {
    id_widget: string;
    tipo: string;
    x: number;
    y: number;
    w: number;
    h: number;
    configuracao?: any;
    data_criacao?: string;
}

export interface DashboardLayoutUpdate {
    widgets: DashboardWidget[];
}

export interface LoginRequest {
    email: string;
    senha: string;
}

export interface RegisterRequest {
    email: string;
    senha: string;
    nome: string;
    renda_mensal?: number;
}

export interface UpdateUserRequest {
    nome?: string;
    email?: string;
    senha?: string;
    renda_mensal?: number;
}

// ─── APIs ────────────────────────────────────────────────────────────────────

export const authAPI = {
    login: (data: LoginRequest) =>
        api.post<{ access_token: string; token_type: string; usuario: Usuario }>('/api/v1/auth/login', data),
    register: (data: RegisterRequest) =>
        api.post<Usuario>('/api/v1/auth/register', data),
    me: () =>
        api.get<Usuario>('/api/v1/auth/me'),
    updateMe: (data: UpdateUserRequest) =>
        api.put<Usuario>('/api/v1/auth/me', data),
};

export const contasAPI = {
    listar: () =>
        api.get<Conta[]>('/api/v1/contas'),
    listarComSaldo: () =>
        api.get<Conta[]>('/api/v1/contas/com-saldo'),
    criar: (data: Partial<Conta>) =>
        api.post<Conta>('/api/v1/contas', data),
    atualizar: (id: number, data: Partial<Conta>) =>
        api.put<Conta>(`/api/v1/contas/${id}`, data),
    desativar: (id: number) =>
        api.patch<Conta>(`/api/v1/contas/${id}/desativar`),
    excluir: (id: number) =>
        api.delete(`/api/v1/contas/${id}`),
};

export const categoriasAPI = {
    listar: (tipo?: string) =>
        api.get<Categoria[]>('/api/v1/categorias', { params: { tipo } }),
    criar: (data: Partial<Categoria>) =>
        api.post<Categoria>('/api/v1/categorias', data),
    atualizar: (id: number, data: Partial<Categoria>) =>
        api.put<Categoria>(`/api/v1/categorias/${id}`, data),
    desativar: (id: number) =>
        api.delete(`/api/v1/categorias/${id}`),
    excluir: (id: number) =>
        api.delete(`/api/v1/categorias/${id}`),
};

export const lancamentosAPI = {
    listar: (params?: {
        data_inicio?: string;
        data_fim?: string;
        tipo?: string;
        id_conta?: number;
        id_categoria?: number;
        pago?: boolean;
        skip?: number;
        limit?: number;
    }) =>
        api.get<Lancamento[]>('/api/v1/lancamentos', { params }),
    listarComDetalhes: (params?: {
        data_inicio?: string;
        data_fim?: string;
        tipo?: string;
        skip?: number;
        limit?: number;
    }) =>
        api.get<Lancamento[]>('/api/v1/lancamentos/detalhes', { params }),
    obterTotais: (data_inicio: string, data_fim: string) =>
        api.get<TotaisPeriodo>('/api/v1/lancamentos/totais', { params: { data_inicio, data_fim } }),
    obterGastosPorCategoria: (mes_ano: string) =>
        api.get<GastosPorCategoria[]>('/api/v1/lancamentos/analytics/gastos-por-categoria', { params: { mes_ano } }),
    obterEvolucaoSaldo: (limite_meses: number = 6) =>
        api.get<EvolucaoSaldo[]>('/api/v1/lancamentos/analytics/evolucao-saldo', { params: { limite_meses } }),
    criar: (data: Partial<Lancamento>) =>
        api.post<Lancamento>('/api/v1/lancamentos', data),
    atualizar: (id: number, data: Partial<Lancamento>) =>
        api.put<Lancamento>(`/api/v1/lancamentos/${id}`, data),
    marcarPago: (id: number) =>
        api.patch<Lancamento>(`/api/v1/lancamentos/${id}/marcar-pago`),
    deletar: (id: number) =>
        api.delete(`/api/v1/lancamentos/${id}`),
    excluir: (id: number) =>
        api.delete(`/api/v1/lancamentos/${id}`),
};

export const metasAPI = {
    listar: (status?: string) =>
        api.get<Meta[]>('/api/v1/metas', { params: status ? { status } : undefined }),
    criar: (data: Partial<Meta>) =>
        api.post<Meta>('/api/v1/metas', data),
    atualizar: (id: number, data: Partial<Meta>) =>
        api.put<Meta>(`/api/v1/metas/${id}`, data),
    concluir: (id: number) =>
        api.patch<Meta>(`/api/v1/metas/${id}/concluir`),
    cancelar: (id: number) =>
        api.patch<Meta>(`/api/v1/metas/${id}/cancelar`),
    adicionarValor: (id: number, valor: number) =>
        api.patch<Meta>(`/api/v1/metas/${id}/adicionar-valor`, null, { params: { valor } }),
    deletar: (id: number) =>
        api.delete(`/api/v1/metas/${id}`),
    excluir: (id: number) =>
        api.delete(`/api/v1/metas/${id}`),
};

// ─── Importação ───────────────────────────────────────────────────────────────

export interface ImportResult {
    total_importados: number;
    total_duplicados: number;
    erros: string[];
}

export interface PreviewItem {
    date: string;
    title: string;
    amount: number;
    tipo: string;
    suggested_category: string;
    suggested_grupo: string;
}

export interface PreviewResult {
    items: PreviewItem[];
}

export interface ConfirmItem {
    date: string;
    title: string;
    amount: number;
    tipo: string;
    category: string;
    grupo: string;
}

export interface ConfirmRequest {
    id_conta: number;
    items: ConfirmItem[];
}

export const importacaoAPI = {
    previewNubank: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post<PreviewResult>('/api/v1/importacao/nubank/preview', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    confirmarNubank: (data: ConfirmRequest) =>
        api.post<ImportResult>('/api/v1/importacao/nubank/confirm', data),
    importarNubank: (file: File, id_conta: number) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('id_conta', id_conta.toString());
        return api.post<ImportResult>('/api/v1/importacao/nubank', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

// ─── Copilot IA ───────────────────────────────────────────────────────────────

export interface CopilotMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface CopilotResponse {
    resposta: string;
}

export const copilotAPI = {
    enviarMensagem: (mensagem: string, historico?: CopilotMessage[]) =>
        api.post<CopilotResponse>('/api/v1/copilot/chat', { mensagem, historico }),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
    obterLayout: () => 
        api.get<DashboardWidget[]>('/api/v1/dashboard/layout'),
    salvarLayout: (data: DashboardLayoutUpdate) => 
        api.post<{ status: string; message: string }>('/api/v1/dashboard/layout', data),
};

export default api;
