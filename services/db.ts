
import { Budget, User, BudgetStatus } from '../types';
import { supabase, isConfigured } from './supabase';

export const db = {
  isCloudEnabled: () => isConfigured,

  login: async (email: string, pass: string): Promise<User | null> => {
    if (!supabase) throw new Error("Supabase não configurado. Verifique as variáveis de ambiente no Vercel.");
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email_profissional', email)
      .eq('password', pass)
      .single();
    
    if (error) {
      console.error("Erro ao fazer login:", error.message);
      return null;
    }
    return data as User;
  },

  register: async (user: User): Promise<User | null> => {
    if (!supabase) throw new Error("Supabase não configurado");
    
    // Removemos campos sensíveis ou nulos antes de inserir se necessário
    const { data, error } = await supabase
      .from('profiles')
      .insert([user])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao registrar perfil:", error.message);
      throw new Error(`Erro ao criar perfil: ${error.message}`);
    }
    return data as User;
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
    if (!supabase) throw new Error("Supabase não configurado");
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw new Error(`Erro ao atualizar perfil: ${error.message}`);
  },

  saveBudget: async (budget: Budget): Promise<void> => {
    if (!supabase) {
      throw new Error("Banco de dados (Supabase) não configurado no Vercel.");
    }

    // Garantimos que o objeto enviado corresponde exatamente ao que o banco espera
    // Se você não executou o SQL de migração, o Supabase rejeitará campos extras
    const { error } = await supabase
      .from('budgets')
      .insert([budget]);
    
    if (error) {
      console.error("ERRO DETALHADO SUPABASE:", error);
      
      // Mensagem amigável para erro de coluna faltando
      if (error.message.includes("column") && error.message.includes("does not exist")) {
        throw new Error(`Estrutura do banco incompleta: A coluna ${error.message.split('"')[1]} está faltando na tabela budgets. Execute o SQL de migração.`);
      }
      
      throw new Error(`Erro no banco de dados: ${error.message}`);
    }
  },

  getBudgets: async (userId: string): Promise<Budget[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('data_criacao', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar orçamentos:", error.message);
      return [];
    }
    return (data || []) as Budget[];
  },

  deleteBudget: async (id: string): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.from('budgets').delete().eq('id_orcamento', id);
    if (error) throw new Error(`Erro ao excluir: ${error.message}`);
  },

  updateBudgetStatus: async (id: string, status: BudgetStatus): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.from('budgets').update({ status_orcamento: status }).eq('id_orcamento', id);
    if (error) throw new Error(`Erro ao atualizar status: ${error.message}`);
  }
};
