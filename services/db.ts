
import { Budget, User, BudgetStatus } from '../types';
import { supabase, isConfigured } from './supabase';

export const db = {
  isCloudEnabled: () => isConfigured,

  login: async (email: string, pass: string): Promise<User | null> => {
    if (!supabase) throw new Error("Supabase não configurado");
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email_profissional', email)
      .eq('password', pass)
      .single();
    
    if (error || !data) return null;
    return data as User;
  },

  register: async (user: User): Promise<User | null> => {
    if (!supabase) throw new Error("Supabase não configurado");
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([user])
      .select()
      .single();
    
    if (error) return null;
    return data as User;
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
    if (!supabase) throw new Error("Supabase não configurado");
    await supabase.from('profiles').update(updates).eq('id', userId);
  },

  saveBudget: async (budget: Budget): Promise<void> => {
    if (!supabase) throw new Error("Supabase não configurado");
    const { error } = await supabase.from('budgets').insert([budget]);
    if (error) throw error;
  },

  getBudgets: async (userId: string): Promise<Budget[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('data_criacao', { ascending: false });
    
    if (error) return [];
    return data as Budget[];
  },

  deleteBudget: async (id: string): Promise<void> => {
    if (!supabase) return;
    await supabase.from('budgets').delete().eq('id_orcamento', id);
  },

  updateBudgetStatus: async (id: string, status: BudgetStatus): Promise<void> => {
    if (!supabase) return;
    await supabase.from('budgets').update({ status_orcamento: status }).eq('id_orcamento', id);
  }
};
