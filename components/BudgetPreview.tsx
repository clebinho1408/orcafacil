
import React from 'react';
import { Budget } from '../types';

interface Props {
  budget: Budget;
}

const BudgetPreview: React.FC<Props> = ({ budget }) => {
  const hasObservation = budget.servico.observacoes_servico && 
    budget.servico.observacoes_servico.trim().length > 0 &&
    !budget.servico.observacoes_servico.toLowerCase().includes('nenhuma observação');

  const prof = budget.profissional;
  const items = budget.servico.items || [];
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const sequenceNumber = budget.numero_sequencial ? budget.numero_sequencial.toString().padStart(4, '0') : '0000';

  return (
    <div 
      className="bg-white text-black flex flex-col font-sans relative" 
      style={{ 
        width: '210mm', 
        height: '297mm', 
        minHeight: '297mm',
        maxHeight: '297mm',
        backgroundColor: '#ffffff', 
        color: '#000000',
        boxSizing: 'border-box',
        overflow: 'hidden',
        padding: '12mm 15mm' 
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        * { box-sizing: border-box !important; -webkit-print-color-adjust: exact; }
        .budget-container { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Header Profissional */}
      <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-6 shrink-0">
        <div className="flex items-center gap-6">
          {prof?.logo_profissional && (
            <div className="h-24 w-24 shrink-0 flex items-center justify-center">
              <img src={prof.logo_profissional} alt="Logo" className="max-h-full max-w-full object-contain" />
            </div>
          )}
          <div className="flex flex-col">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-black leading-none mb-1">
              {prof?.nome_profissional}
            </h2>
            <p className="text-[13px] font-black text-black uppercase tracking-widest opacity-80">
              CNPJ/CPF: {prof?.cpf_cnpj}
            </p>
            <p className="text-[11px] font-bold text-black uppercase mt-1 leading-tight opacity-90">
              {prof?.endereco_profissional}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs font-black text-black uppercase tracking-[0.2em] mb-1">
            ORÇAMENTO N° {sequenceNumber}/{currentYear}
          </p>
          <p className="text-[11px] font-bold text-black uppercase">Data: {budget.legal.data_orcamento}</p>
        </div>
      </div>

      {/* Dados do Cliente */}
      <div className="mb-6 bg-slate-50 p-5 rounded-xl border border-black/5 shrink-0">
        <label className="text-[9px] font-black uppercase text-black tracking-[0.2em] mb-1.5 block opacity-50">Cliente</label>
        <p className="text-xl font-black text-black uppercase leading-tight">
          {budget.cliente.nome_cliente || 'CLIENTE NÃO INFORMADO'}
        </p>
        <div className="flex gap-4 mt-2 text-[11px] font-bold text-black uppercase">
          <span>Fone: {budget.cliente.telefone_cliente || 'NÃO INFORMADO'}</span>
          <span className="truncate">Endereço: {budget.cliente.endereco_cliente || 'NÃO INFORMADO'}</span>
        </div>
      </div>

      {/* Tabela de Serviços com Bordas */}
      <div className="flex-1 overflow-hidden flex flex-col mb-4 border-2 border-black rounded-2xl bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-4 font-black uppercase tracking-[0.1em] text-[10px]">Descrição detalhada do serviço</th>
              <th className="p-4 font-black uppercase tracking-[0.1em] text-[10px] text-right w-32">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="p-4 font-bold text-black uppercase tracking-tight leading-snug">{item.descricao}</td>
                <td className="p-4 font-black text-black text-right tracking-tighter whitespace-nowrap">{item.valor}</td>
              </tr>
            ))}
            {/* Espaçador flexível para empurrar o rodapé da tabela para baixo */}
            <tr><td colSpan={2} className="h-full"></td></tr>
          </tbody>
        </table>
        
        {/* Bloco de Notas e Termos dentro do quadro */}
        <div className="mt-auto p-6 bg-slate-50/30 border-t-2 border-black/5">
          <div className="space-y-4">
            {prof?.formas_pagamento_aceitas && (
              <div>
                <p className="text-[9px] font-black text-black uppercase tracking-widest mb-1 opacity-60">Pagamento:</p>
                <p className="text-[11px] font-black text-black uppercase leading-tight">{prof.formas_pagamento_aceitas}</p>
              </div>
            )}
            {prof?.condicoes_aceitas && (
              <div>
                <p className="text-[9px] font-black text-black uppercase tracking-widest mb-1 opacity-60">Condições e Termos:</p>
                <p className="text-[10px] text-black font-bold leading-snug">{prof.condicoes_aceitas}</p>
              </div>
            )}
            {hasObservation && (
              <div className="pt-2">
                <p className="text-[8px] font-black text-black uppercase mb-1 tracking-widest opacity-50">Observações Extras:</p>
                <p className="text-[10px] leading-tight text-black font-semibold italic">"{budget.servico.observacoes_servico}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Totais e Assinatura */}
      <div className="flex justify-between items-end mb-8 px-2 shrink-0">
        <div className="w-1/3 text-center">
          <div className="border-t border-black/30 pt-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-black/40">Aceite do Cliente</p>
          </div>
        </div>
        
        <div className="text-right">
          <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-1 opacity-60">Total do Orçamento</span>
          <span className="text-4xl font-black text-black tracking-tighter leading-none">{budget.valores.valor_total}</span>
        </div>
      </div>

      {/* Rodapé Fixo e Contatos abaixo de tudo */}
      <div className="mt-auto border-t-2 border-black pt-5 shrink-0">
        <div className="flex justify-between items-center text-[12px] font-black text-black uppercase tracking-widest">
          <div className="flex gap-8">
            <span className="flex items-center gap-1">{prof?.telefone_profissional}</span>
            <span className="flex items-center gap-1">{prof?.email_profissional}</span>
          </div>
          <p className="opacity-40 tracking-[0.4em] text-[10px]">ORÇA VOZ</p>
        </div>
      </div>
    </div>
  );
};

export default BudgetPreview;
