
import { Budget, User, BudgetStatus } from '../types';
import { supabase, isConfigured } from './supabase';

export const db = {
  isCloudEnabled: () => isConfigured,

  getCurrentUser: async (): Promise<User | null> => {
    if (!supabase) return null;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    return profile as User;
  },

  login: async (email: string, pass: string): Promise<User | null> => {
    if (!supabase) throw new Error("Supabase não configurado.");
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    return profile as User;
  },

  register: async (user: User): Promise<User | null> => {
    if (!supabase) throw new Error("Supabase não configurado");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.email_profissional,
      password: user.password!,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Falha ao criar usuário.");

    const profileData = {
      id: authData.user.id,
      email_profissional: user.email_profissional,
      nome_profissional: user.nome_profissional,
      cpf_cnpj: user.cpf_cnpj,
      telefone_profissional: user.telefone_profissional,
      endereco_profissional: user.endereco_profissional || '',
      formas_pagamento_aceitas: user.formas_pagamento_aceitas || 'PIX, Cartão, Dinheiro',
      condicoes_aceitas: user.condicoes_aceitas || 'Validade de 7 dias; Garantia de 90 dias.'
    };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (profileError) {
      console.error("Erro ao criar perfil:", profileError);
      // Retornamos os dados básicos se o perfil falhar mas o auth funcionar
      return profileData as User;
    }
    
    return profile as User;
  },

  resetPassword: async (email: string): Promise<boolean> => {
    if (!supabase) throw new Error("Supabase não configurado");
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`, // Redireciona para a home
    });
    
    if (error) throw new Error(error.message);
    return true;
  },

  updatePassword: async (newPassword: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase não configurado");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
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
      .eq('user_id', userId);
    
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
      .eq('user_id', userId);
    
    if (error) throw new Error(`Erro ao excluir: ${error.message}`);
  },

  updateBudgetStatus: async (id: string, userId: string, status: BudgetStatus): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase
      .from('budgets')
      .update({ status_orcamento: status })
      .eq('id_orcamento', id)
      .eq('user_id', userId);
    
    if (error) throw new Error(`Erro ao atualizar status: ${error.message}`);
  }
};
