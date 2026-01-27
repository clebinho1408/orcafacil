
import { Budget, User, BudgetStatus } from '../types';
import { supabase } from './supabase';

// Helper para garantir que o Supabase está configurado antes de cada operação
const getClient = () => {
  if (!supabase) {
    throw new Error("Configuração do Supabase ausente. Verifique SUPABASE_URL e SUPABASE_ANON_KEY.");
  }
  return supabase;
};

export const db = {
  login: async (email: string, pass: string): Promise<User | null> => {
    const { data, error } = await getClient()
      .from('profiles')
      .select('*')
      .eq('email_profissional', email)
      .eq('password', pass)
      .single();
    
    if (error || !data) return null;
    return data as User;
  },

  register: async (user: User): Promise<User | null> => {
    const { data, error } = await getClient()
      .from('profiles')
      .insert([user])
      .select()
      .single();
    
    if (error) return null;
    return data as User;
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
    await getClient()
      .from('profiles')
      .update(updates)
      .eq('id', userId);
  },

  saveBudget: async (budget: Budget): Promise<void> => {
    const { error } = await getClient()
      .from('budgets')
      .insert([{
        id_orcamento: budget.id_orcamento,
        user_id: budget.user_id,
        numero_sequencial: budget.numero_sequencial,
        status_orcamento: budget.status_orcamento,
        cliente: budget.cliente,
        servico: budget.servico,
        valores: budget.valores,
        legal: budget.legal,
        data_criacao: budget.data_criacao
      }]);
    
    if (error) throw error;
  },

  getBudgets: async (userId: string): Promise<Budget[]> => {
    const { data, error } = await getClient()
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('data_criacao', { ascending: false });
    
    if (error) return [];
    return data as Budget[];
  },

  deleteBudget: async (id: string): Promise<void> => {
    await getClient()
      .from('budgets')
      .delete()
      .eq('id_orcamento', id);
  },

  updateBudgetStatus: async (id: string, status: BudgetStatus): Promise<void> => {
    await getClient()
      .from('budgets')
      .update({ status_orcamento: status })
      .eq('id_orcamento', id);
  }
};
