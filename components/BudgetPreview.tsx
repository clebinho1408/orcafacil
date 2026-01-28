
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
      className="bg-white p-12 text-black leading-normal flex flex-col font-sans" 
      style={{ width: '210mm', minHeight: '297mm', backgroundColor: '#ffffff', color: '#000000' }}
    >
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { background-color: white !important; -webkit-print-color-adjust: exact; }
          * { color: black !important; border-color: black !important; }
          .text-white-print { color: white !important; }
          .bg-black-print { background-color: black !important; }
        }
      `}</style>

      {/* Header Profissional */}
      <div className="flex justify-between items-start mb-14 border-b-2 border-black pb-8">
        <div className="flex items-center gap-6">
          {prof?.logo_profissional && (
            <div className="h-20 w-20 shrink-0 flex items-center justify-center">
              <img src={prof.logo_profissional} alt="Logo" className="max-h-full max-w-full object-contain" />
            </div>
          )}
          <div className="flex flex-col">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-black leading-none mb-1">
              {prof?.nome_profissional}
            </h2>
            <p className="text-[10px] font-black text-black uppercase tracking-widest opacity-70">
              CNPJ/CPF: {prof?.cpf_cnpj}
            </p>
            <p className="text-[9px] font-bold text-black uppercase mt-1">
              {prof?.endereco_profissional}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm font-black text-black uppercase tracking-[0.2em] mb-1">
            ORÇAMENTO N° {sequenceNumber}/{currentYear}
          </p>
          <p className="text-[10px] font-bold text-black uppercase">Data: {budget.legal.data_orcamento}</p>
        </div>
      </div>

      {/* Dados do Cliente */}
      <div className="mb-10 bg-slate-50 p-6 rounded-2xl border border-black/5">
        <label className="text-[8px] font-black uppercase text-black tracking-[0.2em] mb-2 block opacity-50">Cliente</label>
        <p className="text-xl font-black text-black uppercase leading-tight">
          {budget.cliente.nome_cliente || 'CLIENTE NÃO INFORMADO'}
        </p>
        <div className="flex gap-6 mt-2 text-[10px] font-bold text-black uppercase">
          {budget.cliente.telefone_cliente && <span>Fone: {budget.cliente.telefone_cliente}</span>}
          {budget.cliente.endereco_cliente && <span>Endereço: {budget.cliente.endereco_cliente}</span>}
        </div>
      </div>

      {/* Tabela de Serviços */}
      <div className="mb-10 flex-1">
        <div className="border border-black rounded-2xl overflow-hidden flex flex-col h-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-black text-white bg-black-print">
                <th className="p-4 font-black uppercase tracking-[0.1em] text-[9px] text-white-print">Descrição detalhada do serviço</th>
                <th className="p-4 font-black uppercase tracking-[0.1em] text-[9px] text-right text-white-print">Valor Unitário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-black uppercase tracking-tight leading-snug">{item.descricao}</td>
                  <td className="p-4 font-black text-black text-right tracking-tighter">{item.valor}</td>
                </tr>
              ))}
              {/* Spacer para manter layout */}
              <tr className="flex-1"><td colSpan={2} className="h-20"></td></tr>
            </tbody>
          </table>
          
          <div className="mt-auto p-6 bg-slate-50/50 border-t border-black/10">
            <div className="grid grid-cols-2 gap-8">
              <div>
                {prof?.formas_pagamento_aceitas && (
                  <div className="mb-3">
                    <p className="text-[8px] font-black text-black uppercase tracking-widest mb-0.5 opacity-50">Pagamento:</p>
                    <p className="text-[10px] font-black text-black uppercase">{prof.formas_pagamento_aceitas}</p>
                  </div>
                )}
                {prof?.condicoes_aceitas && (
                  <div>
                    <p className="text-[8px] font-black text-black uppercase tracking-widest mb-0.5 opacity-50">Termos:</p>
                    <p className="text-[9px] text-black font-medium leading-tight">{prof.condicoes_aceitas}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                 {(budget.valores.valor_mao_de_obra || budget.valores.valor_material) && (
                   <div className="space-y-1 text-right mb-2">
                      {budget.valores.valor_mao_de_obra && <p className="text-[9px] font-bold uppercase">Mão de Obra: {budget.valores.valor_mao_de_obra}</p>}
                      {budget.valores.valor_material && <p className="text-[9px] font-bold uppercase">Material: {budget.valores.valor_material}</p>}
                   </div>
                 )}
                 {hasObservation && (
                  <div className="p-3 bg-white rounded-xl border border-black/10">
                    <p className="text-[7px] font-black text-black uppercase mb-1 tracking-widest opacity-50">Notas Adicionais:</p>
                    <p className="text-[9px] leading-relaxed text-black font-medium">{budget.servico.observacoes_servico}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Totais e Assinaturas */}
      <div className="flex justify-between items-center mb-12 px-2">
        <div className="w-1/3 text-center">
          <div className="h-[1px] bg-black mb-1 opacity-20"></div>
          <p className="text-[8px] font-black uppercase tracking-widest text-black/50">Aceite do Cliente</p>
        </div>
        
        <div className="text-right">
          <span className="text-[9px] font-black text-black uppercase tracking-widest block mb-0.5 opacity-60">Investimento Total</span>
          <span className="text-5xl font-black text-black tracking-tighter leading-none">{budget.valores.valor_total}</span>
        </div>
      </div>

      {/* Rodapé Moderno */}
      <div className="mt-auto border-t-2 border-black pt-6">
        <div className="flex justify-between items-center text-[9px] font-black text-black uppercase tracking-widest">
          <div className="flex gap-4">
            <span>{prof?.telefone_profissional}</span>
            <span className="opacity-20">|</span>
            <span>{prof?.email_profissional}</span>
          </div>
          <p className="opacity-30 tracking-[0.4em]">ORÇA FÁCIL PRO</p>
        </div>
      </div>
    </div>
  );
};

export default BudgetPreview;
