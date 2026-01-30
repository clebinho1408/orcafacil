
import React, { useState, useEffect } from 'react';
import { Mail, Lock, Building2, ArrowRight, Loader2, AlertCircle, ChevronLeft, CheckCircle2, Settings, Globe, Key } from 'lucide-react';
import { User } from '../types';
import Logo from './Logo';
import { db } from '../services/db';
import { isConfigured, missingVars, configureSupabase } from '../services/supabase';
import { formatCpfCnpj, formatPhone, isValidCpfCnpj } from '../services/utils';

interface Props {
  onLogin: (user: User) => void;
}

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset_password' | 'manual_config'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Para configuração manual
  const [manualUrl, setManualUrl] = useState('');
  const [manualKey, setManualKey] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome_profissional: '',
    cpf_cnpj: '',
    telefone_profissional: ''
  });

  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      setView('reset_password');
    }

    if (!isConfigured && view !== 'manual_config') {
      setError(`Conexão com banco de dados não detectada.`);
    }
  }, [view]);

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl && manualKey) {
      configureSupabase(manualUrl, manualKey);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
      setView('manual_config');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (view === 'login') {
        const user = await db.login(formData.email, formData.password);
        if (user) onLogin(user);
      } else if (view === 'register') {
        if (!isValidCpfCnpj(formData.cpf_cnpj)) throw new Error('CPF ou CNPJ inválido.');
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
        setSuccessMsg('Cadastro realizado! Verifique seu e-mail.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar. Verifique os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700 overflow-y-auto">
      <div className="w-full max-w-md space-y-6 my-8">
        <div className="text-center flex flex-col items-center">
          <Logo className="w-20 h-20 mb-4 shadow-2xl rounded-2xl" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">ORÇA VOZ</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mt-2">Orçamento gerado por Voz</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 relative">
          
          {view === 'manual_config' ? (
            <div className="animate-in slide-in-from-bottom-4">
              <div className="mb-6">
                <h2 className="text-lg font-black text-slate-900 uppercase">Configurar Supabase</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase">As variáveis automáticas falharam. Cole seus dados abaixo:</p>
              </div>
              <form onSubmit={handleManualSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400">Project URL</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      required
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                      placeholder="https://xxxx.supabase.co"
                      value={manualUrl}
                      onChange={e => setManualUrl(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400">Anon Key</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <textarea 
                      required
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-[10px] min-h-[80px]"
                      placeholder="eyJhbG..."
                      value={manualKey}
                      onChange={e => setManualKey(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">
                  SALVAR E REINICIAR
                </button>
                <button type="button" onClick={() => setView('login')} className="w-full py-2 text-slate-400 font-black text-[9px] uppercase">
                  Voltar
                </button>
              </form>
            </div>
          ) : (
            <>
              {(view === 'login' || view === 'register') && (
                <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                  <button 
                    type="button"
                    onClick={() => { setView('login'); setError(null); }}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Entrar
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setView('register'); setError(null); }}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Criar Conta
                  </button>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-lg font-black text-slate-900 uppercase">
                  {view === 'register' ? 'Novo Profissional' : 'Bem-vindo de volta'}
                </h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Acesse seus orçamentos na nuvem</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex flex-col gap-2 text-red-600">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-[10px] font-bold uppercase">{error}</p>
                  </div>
                  {!isConfigured && (
                    <button 
                      onClick={() => setView('manual_config')}
                      className="text-[9px] font-black bg-white border border-red-200 px-2 py-1.5 rounded-md uppercase self-start hover:bg-red-50 transition-colors"
                    >
                      Configurar Conexão Manualmente
                    </button>
                  )}
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
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium uppercase"
                          placeholder="EX: JOÃO PINTURAS"
                          value={formData.nome_profissional}
                          onChange={e => setFormData({...formData, nome_profissional: e.target.value.toUpperCase()})}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      required
                      type="email"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      required
                      type="password"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#2B59C3] text-white py-4 rounded-xl font-black text-xs shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 transition-all mt-4 disabled:opacity-70 uppercase"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Entrar <ArrowRight className="w-3.5 h-3.5" /></>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
