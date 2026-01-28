
import React, { useState } from 'react';
import { Mail, Lock, Building2, ArrowRight, Loader2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { User } from '../types';
import Logo from './Logo';
import { db } from '../services/db';
import { missingVars } from '../services/supabase';

interface Props {
  onLogin: (user: User) => void;
}

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCloudAvailable = db.isCloudEnabled();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome_profissional: '',
    cpf_cnpj: '',
    telefone_profissional: ''
  });

  if (!isCloudAvailable) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-red-100 max-w-md w-full text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <AlertCircle className="w-10 h-10" />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 uppercase mb-4 tracking-tighter">Ativação Necessária</h2>
          <p className="text-slate-500 font-bold text-xs uppercase mb-8 leading-relaxed">
            As chaves foram configuradas, mas o site ainda não as "leu". <br/>
            Siga estes <span className="text-red-500">3 PASSOS</span> rápidos:
          </p>

          <div className="space-y-4 text-left mb-10">
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-1">1</div>
              <p className="text-xs font-bold text-slate-700 uppercase leading-tight">Vá na aba <span className="text-indigo-600">Deployments</span> na Vercel.</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-1">2</div>
              <p className="text-xs font-bold text-slate-700 uppercase leading-tight">Clique nos <span className="text-indigo-600">"..."</span> do deploy mais recente (o primeiro da lista).</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-1">3</div>
              <p className="text-xs font-bold text-slate-700 uppercase leading-tight">Selecione <span className="bg-indigo-600 text-white px-2 py-0.5 rounded ml-1 tracking-widest">REDEPLOY</span> e confirme.</p>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-indigo-200"
            >
              <RefreshCw className="w-5 h-5" /> Já fiz o Redeploy, atualizar
            </button>
            <a 
              href="https://vercel.com/clebinho1408/orcafacil/deployments" 
              target="_blank"
              className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors py-2"
            >
              Abrir Painel Vercel <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const user = await db.login(formData.email, formData.password);
        if (user) {
          onLogin(user);
        } else {
          setError('E-mail ou senha incorretos.');
        }
      } else {
        const newUser: User = {
          id: crypto.randomUUID(),
          email_profissional: formData.email,
          password: formData.password,
          nome_profissional: formData.nome_profissional,
          cpf_cnpj: formData.cpf_cnpj,
          telefone_profissional: formData.telefone_profissional,
          endereco_profissional: '',
          formas_pagamento_aceitas: 'PIX, Cartão, Dinheiro',
          condicoes_aceitas: 'Validade de 7 dias; Garantia de 90 dias.'
        };
        
        const registeredUser = await db.register(newUser);
        if (registeredUser) {
          onLogin(registeredUser);
        } else {
          setError('Erro ao criar conta. Verifique se o e-mail já existe.');
        }
      }
    } catch (err: any) {
      setError('Erro de conexão com o banco de dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center flex flex-col items-center">
          <Logo className="w-24 h-24 mb-6 shadow-2xl rounded-[30%]" />
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">ORÇA FÁCIL</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Profissional • Cloud Ready</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100">
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              Criar Conta
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 animate-in shake duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs font-bold uppercase tracking-tight leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nome da Empresa</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                      placeholder="Ex: João Manutenção"
                      value={formData.nome_profissional}
                      onChange={e => setFormData({...formData, nome_profissional: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">CPF/CNPJ</label>
                    <input 
                      required
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                      placeholder="00.000..."
                      value={formData.cpf_cnpj}
                      onChange={e => setFormData({...formData, cpf_cnpj: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">WhatsApp</label>
                    <input 
                      required
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                      placeholder="(00) 0000..."
                      value={formData.telefone_profissional}
                      onChange={e => setFormData({...formData, telefone_profissional: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  required
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  required
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2B59C3] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 transition-all mt-4 disabled:opacity-70 uppercase tracking-tighter"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'ACESSAR CONTA' : 'CRIAR CONTA'}
                  <ArrowRight className="w-6 h-6" />
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
