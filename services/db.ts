
import { Budget, User, BudgetStatus } from '../types';
import { supabase, isConfigured } from './supabase';

export const db = {
  isCloudEnabled: () => isConfigured,

  login: async (email: string, pass: string): Promise<User | null> => {
    if (!supabase) throw new Error("Supabase não configurado.");
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email_profissional', email)
      .eq('password', pass)
      .single();
    
    if (error) return null;
    return data as User;
  },

  register: async (user: User): Promise<User | null> => {
    if (!supabase) throw new Error("Supabase não configurado");
    const { data, error } = await supabase.from('profiles').insert([user]).select().single();
    if (error) throw new Error(`Erro ao criar perfil: ${error.message}`);
    return data as User;
  },

  resetPassword: async (email: string): Promise<boolean> => {
    if (!supabase) throw new Error("Supabase não configurado");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
    return true;
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
    if (!supabase) throw new Error("Supabase não configurado");
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw new Error(`Erro ao atualizar perfil: ${error.message}`);
  },

  saveBudget: async (budget: Budget): Promise<void> => {
    if (!supabase) throw new Error("Banco de dados não configurado.");
    const { error } = await supabase.from('budgets').insert([budget]);
    if (error) throw new Error(`Erro no banco de dados: ${error.message}`);
  },

  updateBudget: async (id: string, userId: string, updates: Partial<Budget>): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id_orcamento', id)
      .eq('user_id', userId); // Reforço de segurança
    
    if (error) throw new Error(`Erro ao atualizar orçamento: ${error.message}`);
  },

  getBudgets: async (userId: string): Promise<Budget[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('data_criacao', { ascending: false });
    
    if (error) return [];
    return (data || []) as Budget[];
  },

  deleteBudget: async (id: string, userId: string): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id_orcamento', id)
      .eq('user_id', userId); // Reforço de segurança
    
    if (error) throw new Error(`Erro ao excluir: ${error.message}`);
  },

  updateBudgetStatus: async (id: string, userId: string, status: BudgetStatus): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase
      .from('budgets')
      .update({ status_orcamento: status })
      .eq('id_orcamento', id)
      .eq('user_id', userId); // Reforço de segurança
    
    if (error) throw new Error(`Erro ao atualizar status: ${error.message}`);
  }
};
