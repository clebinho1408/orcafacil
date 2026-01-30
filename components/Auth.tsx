
import React, { useState, useEffect } from 'react';
import { Mail, Lock, Building2, ArrowRight, Loader2, AlertCircle, ChevronLeft, CheckCircle2, Settings, Globe, Database, Phone, FileDigit, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import Logo from './Logo';
import { db } from '../services/db';
import { isConfigured, configureNeon } from '../services/neon';
import { formatCpfCnpj, formatPhone, isValidCpfCnpj } from '../services/utils';

interface Props {
  onLogin: (user: User) => void;
}

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'register' | 'manual_config' | 'forgot_password'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [manualUrl, setManualUrl] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome_profissional: '',
    cpf_cnpj: '',
    telefone_profissional: ''
  });

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl && manualUrl.startsWith('postgresql://')) {
      configureNeon(manualUrl);
    } else {
      setError("URL de conexão inválida. Deve começar com postgresql://");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfigured) {
      setError("Por favor, configure a conexão com o banco de dados antes de continuar.");
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
        if (formData.cpf_cnpj && !isValidCpfCnpj(formData.cpf_cnpj)) {
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
        setSuccessMsg('Conta criada com sucesso!');
        setTimeout(() => setView('login'), 1500);
      } else if (view === 'forgot_password') {
        await db.resetPassword(formData.email, formData.telefone_profissional, formData.password);
        setSuccessMsg('Senha alterada com sucesso! Você já pode entrar.');
        setTimeout(() => setView('login'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700 overflow-y-auto">
      <div className="w-full max-w-md space-y-6 my-8 relative">
        
        <button 
          onClick={() => setView('manual_config')}
          className="absolute -top-12 right-0 p-3 text-slate-300 hover:text-indigo-600 transition-colors"
          title="Configurações de Banco de Dados"
        >
          <Settings className="w-5 h-5" />
        </button>

        <div className="text-center flex flex-col items-center">
          <Logo className="w-20 h-20 mb-4 shadow-2xl rounded-2xl" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">ORÇA VOZ</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mt-2">Profissionalismo em sua voz</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 relative">
          
          {view === 'manual_config' ? (
            <div className="animate-in slide-in-from-bottom-4">
              <div className="mb-6">
                <h2 className="text-lg font-black text-slate-900 uppercase">Configurar Neon</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Cole a 'Connection String' do seu painel Neon:</p>
              </div>
              <form onSubmit={handleManualSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Database URL (PostgreSQL)</label>
                  <div className="relative">
                    <Database className="absolute left-3 top-4 w-4 h-4 text-slate-300" />
                    <textarea 
                      required
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-[10px] min-h-[100px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="postgresql://user:password@ep-host-name.aws.neon.tech/neondb"
                      value={manualUrl}
                      onChange={e => setManualUrl(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">
                  SALVAR E CONECTAR
                </button>
                <button type="button" onClick={() => setView('login')} className="w-full py-2 text-slate-400 font-black text-[9px] uppercase">
                  Voltar
                </button>
              </form>
            </div>
          ) : view === 'forgot_password' ? (
            <div className="animate-in slide-in-from-right-4">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-black text-slate-900 uppercase">Recuperar Acesso</h2>
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Valide seu telefone para criar uma nova senha</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-[10px] font-bold uppercase">{error}</p>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 text-green-700">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold uppercase leading-tight">{successMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Seu E-mail</label>
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
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Telefone / Whats de Cadastro</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium" 
                      placeholder="(00) 00000-0000" 
                      value={formData.telefone_profissional} 
                      onChange={e => setFormData({...formData, telefone_profissional: formatPhone(e.target.value)})} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      required 
                      type="password" 
                      minLength={6} 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium" 
                      placeholder="Nova Senha" 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-[#2B59C3] text-white py-4 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all mt-4 disabled:opacity-70 uppercase tracking-widest"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'REDEFINIR SENHA'}
                </button>

                <button 
                  type="button" 
                  onClick={() => setView('login')}
                  className="w-full py-2 text-slate-400 font-black text-[9px] uppercase"
                >
                  Voltar para login
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
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  {view === 'register' ? 'Preencha seus dados de trabalho' : 'Acesse seus orçamentos na nuvem'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 animate-in shake duration-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-[10px] font-bold uppercase">{error}</p>
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
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Empresa / Nome Profissional</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          required 
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium uppercase" 
                          placeholder="EX: GB CALHAS" 
                          value={formData.nome_profissional} 
                          onChange={e => setFormData({...formData, nome_profissional: e.target.value.toUpperCase()})} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-1">CPF ou CNPJ</label>
                      <div className="relative">
                        <FileDigit className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium" 
                          placeholder="00.000..." 
                          value={formData.cpf_cnpj} 
                          onChange={e => setFormData({...formData, cpf_cnpj: formatCpfCnpj(e.target.value)})} 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Telefone / Whats</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          required
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium" 
                          placeholder="(00) 00000..." 
                          value={formData.telefone_profissional} 
                          onChange={e => setFormData({...formData, telefone_profissional: formatPhone(e.target.value)})} 
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">E-mail de Acesso</label>
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
                      minLength={6} 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium" 
                      placeholder="••••••••" 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                  </div>
                </div>

                {view === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => { setView('forgot_password'); setError(null); }}
                    className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline text-right w-full block mt-1"
                  >
                    Esqueci minha senha
                  </button>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-[#2B59C3] text-white py-4 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all mt-4 disabled:opacity-70 uppercase tracking-widest"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{view === 'login' ? 'Entrar Agora' : 'Finalizar Cadastro'} <ArrowRight className="w-3.5 h-3.5" /></>}
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
