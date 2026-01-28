
import React, { useState, useRef } from 'react';
import { ProfessionalData } from '../types';
import { Save, User, Phone, Mail, FileDigit, MapPin, Image as ImageIcon, X, QrCode, CreditCard, ScrollText } from 'lucide-react';
import { formatCpfCnpj, formatPhone } from '../services/utils';

interface Props {
  initialData: ProfessionalData | null;
  onSave: (data: ProfessionalData) => void;
}

const ProfessionalForm: React.FC<Props> = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState<ProfessionalData>(initialData || {
    nome_profissional: '',
    telefone_profissional: '',
    email_profissional: '',
    cpf_cnpj: '',
    endereco_profissional: '',
    logo_profissional: '',
    chave_pix: '',
    formas_pagamento_aceitas: '',
    condicoes_aceitas: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo_profissional: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData({ ...formData, logo_profissional: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
          <User className="text-indigo-600 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Meus Dados Profissionais</h2>
          <p className="text-slate-500 text-sm">Estas informações aparecerão no cabeçalho e rodapé dos seus orçamentos.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload de Logo */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 block">Logo da Empresa</label>
          <div className="flex items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden relative group"
            >
              {formData.logo_profissional ? (
                <>
                  <img src={formData.logo_profissional} alt="Logo" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ImageIcon className="text-white w-6 h-6" />
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="text-slate-400 w-6 h-6 mb-1" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Upload</span>
                </>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 mb-2">Recomendado: PNG ou JPG com fundo branco ou transparente.</p>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold uppercase tracking-widest text-indigo-600 px-3 py-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  Alterar Logo
                </button>
                {formData.logo_profissional && (
                  <button 
                    type="button"
                    onClick={removeLogo}
                    className="text-xs font-bold uppercase tracking-widest text-red-500 px-3 py-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleLogoUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Nome da Empresa / Profissional
            </label>
            <input 
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
              value={formData.nome_profissional}
              onChange={e => setFormData({ ...formData, nome_profissional: e.target.value })}
              placeholder="Ex: João Pinturas"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileDigit className="w-4 h-4 text-slate-400" /> CPF ou CNPJ
            </label>
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
              value={formData.cpf_cnpj}
              onChange={e => setFormData({ ...formData, cpf_cnpj: formatCpfCnpj(e.target.value) })}
              placeholder="00.000.000/0001-00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" /> WhatsApp / Telefone
            </label>
            <input 
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
              value={formData.telefone_profissional}
              onChange={e => setFormData({ ...formData, telefone_profissional: formatPhone(e.target.value) })}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" /> E-mail Profissional
            </label>
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
              value={formData.email_profissional}
              onChange={e => setFormData({ ...formData, email_profissional: e.target.value })}
              placeholder="seuemail@contato.com"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" /> Endereço Completo
            </label>
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
              value={formData.endereco_profissional}
              onChange={e => setFormData({ ...formData, endereco_profissional: e.target.value })}
              placeholder="Rua, Número, Bairro - Cidade/UF"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-slate-400" /> Chave PIX (Para o Recibo)
            </label>
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
              value={formData.chave_pix}
              onChange={e => setFormData({ ...formData, chave_pix: e.target.value })}
              placeholder="CPF, E-mail ou Telefone"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold">Pagamentos e Condições</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Formas de Pagamento Aceitas</label>
              <textarea 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium min-h-[80px]"
                value={formData.formas_pagamento_aceitas}
                onChange={e => setFormData({ ...formData, formas_pagamento_aceitas: e.target.value })}
                placeholder="Ex: PIX, Cartão de Crédito (até 12x), Boleto, Dinheiro"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-slate-400" /> Condições Gerais
              </label>
              <textarea 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium min-h-[80px]"
                value={formData.condicoes_aceitas}
                onChange={e => setFormData({ ...formData, condicoes_aceitas: e.target.value })}
                placeholder="Ex: Início em até 3 dias após aprovação; Garantia de 90 dias; Material por conta do cliente."
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Save className="w-5 h-5" /> Salvar Meus Dados
        </button>
      </form>
    </div>
  );
};

export default ProfessionalForm;
