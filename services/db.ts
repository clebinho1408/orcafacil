
import { Budget, User, BudgetStatus } from '../types';
import { sql, isConfigured } from './neon';

// Helper para gerar IDs únicos estilo UUID/CUID simples
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const db = {
  isCloudEnabled: () => isConfigured,

  getCurrentUser: async (): Promise<User | null> => {
    const savedUserId = localStorage.getItem('orca_voz_user_id');
    if (!savedUserId || !sql) return null;

    try {
      const result = await sql`SELECT * FROM profiles WHERE id = ${savedUserId} LIMIT 1`;
      return result.length > 0 ? (result[0] as User) : null;
    } catch (e) {
      console.error("Erro ao buscar usuário atual:", e);
      return null;
    }
  },

  login: async (email: string, pass: string): Promise<User | null> => {
    if (!sql) throw new Error("Banco de dados não configurado.");
    
    try {
      const result = await sql`SELECT * FROM profiles WHERE email_profissional = ${email.toLowerCase()} LIMIT 1`;
      
      if (result.length === 0) throw new Error("Usuário não encontrado.");
      
      const user = result[0] as User;
      if (user.password !== pass) throw new Error("Senha incorreta.");

      localStorage.setItem('orca_voz_user_id', user.id);
      return user;
    } catch (e: any) {
      throw new Error(e.message);
    }
  },

  resetPassword: async (email: string, phone: string, newPass: string): Promise<void> => {
    if (!sql) throw new Error("Banco de dados não configurado.");
    
    try {
      // Verifica se existe um perfil que combine email e telefone
      const result = await sql`
        SELECT id FROM profiles 
        WHERE email_profissional = ${email.toLowerCase()} 
        AND telefone_profissional = ${phone} 
        LIMIT 1
      `;

      if (result.length === 0) {
        throw new Error("Dados de validação incorretos. Verifique seu e-mail e telefone de cadastro.");
      }

      const userId = result[0].id;

      // Atualiza a senha
      await sql`
        UPDATE profiles 
        SET password = ${newPass} 
        WHERE id = ${userId}
      `;
    } catch (e: any) {
      throw new Error(e.message);
    }
  },

  register: async (user: User): Promise<User | null> => {
    if (!sql) throw new Error("Banco de dados não configurado");

    try {
      const id = generateId();
      const profileData = {
        id,
        email_profissional: user.email_profissional.toLowerCase(),
        password: user.password!,
        nome_profissional: user.nome_profissional,
        cpf_cnpj: user.cpf_cnpj || '',
        telefone_profissional: user.telefone_profissional || '',
        endereco_profissional: user.endereco_profissional || '',
        formas_pagamento_aceitas: user.formas_pagamento_aceitas || 'PIX, Cartão, Dinheiro',
        condicoes_aceitas: user.condicoes_aceitas || 'Validade de 7 dias; Garantia de 90 dias.'
      };

      await sql`
        INSERT INTO profiles (
          id, email_profissional, password, nome_profissional, cpf_cnpj, 
          telefone_profissional, endereco_profissional, formas_pagamento_aceitas, condicoes_aceitas
        ) VALUES (
          ${profileData.id}, ${profileData.email_profissional}, ${profileData.password}, 
          ${profileData.nome_profissional}, ${profileData.cpf_cnpj}, ${profileData.telefone_profissional}, 
          ${profileData.endereco_profissional}, ${profileData.formas_pagamento_aceitas}, ${profileData.condicoes_aceitas}
        )
      `;

      localStorage.setItem('orca_voz_user_id', id);
      return profileData as User;
    } catch (e: any) {
      if (e.message.includes('unique constraint')) throw new Error("Este e-mail já está cadastrado.");
      throw new Error(`Erro ao cadastrar: ${e.message}`);
    }
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
    if (!sql) throw new Error("Banco de dados não configurado");
    
    try {
      await sql`
        UPDATE profiles SET
          nome_profissional = COALESCE(${updates.nome_profissional}, nome_profissional),
          cpf_cnpj = COALESCE(${updates.cpf_cnpj}, cpf_cnpj),
          telefone_profissional = COALESCE(${updates.telefone_profissional}, telefone_profissional),
          endereco_profissional = COALESCE(${updates.endereco_profissional}, endereco_profissional),
          logo_profissional = COALESCE(${updates.logo_profissional}, logo_profissional),
          chave_pix = COALESCE(${updates.chave_pix}, chave_pix),
          formas_pagamento_aceitas = COALESCE(${updates.formas_pagamento_aceitas}, formas_pagamento_aceitas),
          condicoes_aceitas = COALESCE(${updates.condicoes_aceitas}, condicoes_aceitas)
        WHERE id = ${userId}
      `;
    } catch (e: any) {
      throw new Error(`Erro ao atualizar perfil: ${e.message}`);
    }
  },

  saveBudget: async (budget: Budget): Promise<void> => {
    if (!sql) throw new Error("Banco de dados não configurado.");
    
    try {
      await sql`
        INSERT INTO budgets (
          id_orcamento, user_id, numero_sequencial, status_orcamento, 
          profissional, cliente, servico, valores, legal, texto_transcrito
        ) VALUES (
          ${budget.id_orcamento}, ${budget.user_id}, ${budget.numero_sequencial}, ${budget.status_orcamento},
          ${JSON.stringify(budget.profissional)}, ${JSON.stringify(budget.cliente)}, 
          ${JSON.stringify(budget.servico)}, ${JSON.stringify(budget.valores)}, 
          ${JSON.stringify(budget.legal)}, ${budget.texto_transcrito || ''}
        )
      `;
    } catch (e: any) {
      throw new Error(`Erro ao salvar orçamento: ${e.message}`);
    }
  },

  getBudgets: async (userId: string): Promise<Budget[]> => {
    if (!sql) return [];
    try {
      const data = await sql`SELECT * FROM budgets WHERE user_id = ${userId} ORDER BY data_criacao DESC`;
      return (data || []) as Budget[];
    } catch (e) {
      console.error("Erro ao carregar orçamentos:", e);
      return [];
    }
  },

  updateBudgetStatus: async (id: string, userId: string, status: BudgetStatus): Promise<void> => {
    if (!sql) return;
    try {
      await sql`UPDATE budgets SET status_orcamento = ${status} WHERE id_orcamento = ${id} AND user_id = ${userId}`;
    } catch (e: any) {
      throw new Error(`Erro ao atualizar status: ${e.message}`);
    }
  },

  updateBudget: async (id: string, userId: string, updates: Partial<Budget>): Promise<void> => {
    if (!sql) return;
    try {
      if (updates.valores) {
        await sql`UPDATE budgets SET valores = ${JSON.stringify(updates.valores)} WHERE id_orcamento = ${id} AND user_id = ${userId}`;
      }
    } catch (e: any) {
      throw new Error(`Erro ao atualizar: ${e.message}`);
    }
  },

  deleteBudget: async (id: string, userId: string): Promise<void> => {
    if (!sql) return;
    try {
      await sql`DELETE FROM budgets WHERE id_orcamento = ${id} AND user_id = ${userId}`;
    } catch (e: any) {
      throw new Error(`Erro ao excluir: ${e.message}`);
    }
  },

  logout: () => {
    localStorage.removeItem('orca_voz_user_id');
  }
};
