
export interface ProfessionalData {
  nome_profissional: string;
  telefone_profissional: string;
  email_profissional: string;
  cpf_cnpj: string;
  endereco_profissional: string;
  logo_profissional?: string;
  chave_pix?: string;
  formas_pagamento_aceitas?: string;
  condicoes_aceitas?: string;
}

export interface User extends ProfessionalData {
  password?: string;
  id: string;
}

export interface ClientData {
  nome_cliente: string;
  telefone_cliente: string;
  endereco_cliente: string;
  observacoes_cliente: string;
}

export interface ServiceItem {
  descricao: string;
  valor: string;
}

export interface ServiceData {
  items: ServiceItem[];
  observacoes_servico: string;
  descricao_servico: string;
  metragem: string;
  valor_servico: string;
}

export interface ValuesData {
  valor_mao_de_obra: string;
  valor_material: string;
  valor_total: string;
  desconto: string;
  forma_pagamento: string;
}

export interface LegalData {
  data_orcamento: string;
  validade_orcamento: string;
  garantia_servico: string;
  assinatura_profissional: string;
}

export enum BudgetStatus {
  PENDENTE = 'Pendente',
  APROVADO = 'Aprovado',
  RECUSADO = 'Recusado'
}

export interface Budget {
  id_orcamento: string;
  user_id: string; // Relaciona o orçamento ao usuário SaaS
  numero_sequencial: number;
  status_orcamento: BudgetStatus;
  data_criacao: string;
  profissional: ProfessionalData;
  cliente: ClientData;
  servico: ServiceData;
  valores: ValuesData;
  legal: LegalData;
  texto_transcrito?: string;
  enviado_whatsapp: boolean;
}

export interface ExtractedBudget {
  nome_cliente?: string;
  telefone_cliente?: string;
  endereco_cliente?: string;
  descricao_servico?: string;
  valor_total?: string;
  valor_mao_de_obra?: string;
  valor_material?: string;
  observacoes_servico?: string;
  forma_pagamento?: string;
}
