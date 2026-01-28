
import React, { useState, useEffect } from 'react';
import { Mail, Lock, Building2, ArrowRight, Loader2, AlertCircle, RefreshCw, ChevronLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import Logo from './Logo';
import { db } from '../services/db';
import { formatCpfCnpj, formatPhone, isValidCpfCnpj } from '../services/utils';

interface Props {
  onLogin: (user: User) => void;
}

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset_password'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome_profissional: '',
    cpf_cnpj: '',
    telefone_profissional: ''
  });

  useEffect(() => {
    // Detecta se o usuário está voltando de um link de recuperação de senha
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      setView('reset_password');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (view === 'login') {
        const user = await db.login(formData.email, formData.password);
        if (user) onLogin(user);
      } else if (view === 'register') {
        if (!isValidCpfCnpj(formData.cpf_cnpj)) {
          throw new Error('CPF ou CNPJ inválido.');
        }
        const newUser: User = {
          id: '',
          email_profissional: formData.email,
          password: formData.password,
          nome_profissional: formData.nome_profissional,
          cpf_cnpj: formData.cpf_cnpj,
          telefone_profissional: formData.telefone_profissional,
          endereco_profissional: '',
        };
        await db.register(newUser);
        setSuccessMsg('Cadastro realizado! Verifique seu e-mail (e a pasta SPAM) para confirmar a conta.');
      } else if (view === 'forgot') {
        await db.resetPassword(formData.email);
        setSuccessMsg('Link de recuperação enviado! Verifique seu e-mail e SPAM.');
      } else if (view === 'reset_password') {
        await db.updatePassword(formData.password);
        setSuccessMsg('Senha atualizada com sucesso! Você já pode entrar no sistema.');
        setTimeout(() => setView('login'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700 overflow-y-auto">
      <div className="w-full max-w-md space-y-6 my-8">
        <div className="text-center flex flex-col items-center">
          <Logo className="w-20 h-20 mb-4 shadow-2xl rounded-2xl" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">ORÇA FÁCIL</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mt-2">Orçamento gerado por Voz</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
          {(view === 'login' || view === 'register') && (
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button 
                type="button"
                onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                Entrar
              </button>
              <button 
                type="button"
                onClick={() => { setView('register'); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                Criar Conta
              </button>
            </div>
          )}

          {(view === 'forgot' || view === 'reset_password') && (
            <button 
              onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
              className="flex items-center gap-2 text-indigo-600 mb-6 group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Voltar para Login</span>
            </button>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              {view === 'register' && 'Novo Profissional'}
              {view === 'forgot' && 'Recuperar Acesso'}
              {view === 'reset_password' && 'Nova Senha'}
              {view === 'login' && 'Bem-vindo de volta'}
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              {view === 'reset_password' ? 'Digite sua nova senha abaixo' : 'Acesse seus orçamentos na nuvem'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 text-green-700">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs font-bold uppercase leading-tight">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {view === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Empresa / Nome</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium"
                      placeholder="Ex: João Pinturas"
                      value={formData.nome_profissional}
                      onChange={e => setFormData({...formData, nome_profissional: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">CPF ou CNPJ</label>
                    <input 
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium"
                      placeholder="000.000.000-00"
                      value={formData.cpf_cnpj}
                      onChange={e => setFormData({...formData, cpf_cnpj: formatCpfCnpj(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">WhatsApp</label>
                    <input 
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone_profissional}
                      onChange={e => setFormData({...formData, telefone_profissional: formatPhone(e.target.value)})}
                    />
                  </div>
                </div>
              </>
            )}

            {view !== 'reset_password' && (
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    required
                    type="email"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
            )}

            {view !== 'forgot' && (
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                  {view === 'reset_password' ? 'Nova Senha' : 'Senha'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    required
                    type="password"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                {view === 'login' && (
                  <div className="flex justify-center pt-1.5">
                    <button 
                      type="button"
                      onClick={() => { setView('forgot'); setError(null); setSuccessMsg(null); }}
                      className="text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-700 tracking-widest"
                    >
                      Esqueci a senha
                    </button>
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading || (view === 'forgot' && successMsg !== null)}
              className="w-full bg-[#2B59C3] text-white py-4 rounded-xl font-black text-xs shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 transition-all mt-4 disabled:opacity-70 uppercase tracking-tight"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {view === 'login' && 'Entrar'}
                  {view === 'register' && 'Cadastrar'}
                  {view === 'forgot' && 'Enviar Recuperação'}
                  {view === 'reset_password' && 'Salvar Nova Senha'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
