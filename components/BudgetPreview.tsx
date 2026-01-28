
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
      className="bg-white text-black flex flex-col font-sans" 
      style={{ 
        width: '210mm', 
        height: '297mm', 
        maxHeight: '297mm',
        backgroundColor: '#ffffff', 
        color: '#000000',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        padding: '12mm' // Margem interna de segurança
      }}
    >
      <style>{`
        * { box-sizing: border-box !important; }
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
        }
      `}</style>

      {/* Header Profissional */}
      <div className="flex justify-between items-start mb-10 border-b-2 border-black pb-6">
        <div className="flex items-center gap-6">
          {prof?.logo_profissional && (
            <div className="h-16 w-16 shrink-0 flex items-center justify-center">
              <img src={prof.logo_profissional} alt="Logo" className="max-h-full max-w-full object-contain" />
            </div>
          )}
          <div className="flex flex-col">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-black leading-none mb-1">
              {prof?.nome_profissional}
            </h2>
            <p className="text-[9px] font-black text-black uppercase tracking-widest opacity-70">
              CNPJ/CPF: {prof?.cpf_cnpj}
            </p>
            <p className="text-[8px] font-bold text-black uppercase mt-1">
              {prof?.endereco_profissional}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs font-black text-black uppercase tracking-[0.2em] mb-1">
            ORÇAMENTO N° {sequenceNumber}/{currentYear}
          </p>
          <p className="text-[9px] font-bold text-black uppercase">Data: {budget.legal.data_orcamento}</p>
        </div>
      </div>

      {/* Dados do Cliente */}
      <div className="mb-6 bg-slate-50 p-5 rounded-xl border border-black/5">
        <label className="text-[7px] font-black uppercase text-black tracking-[0.2em] mb-1.5 block opacity-50">Cliente</label>
        <p className="text-lg font-black text-black uppercase leading-tight">
          {budget.cliente.nome_cliente || 'CLIENTE NÃO INFORMADO'}
        </p>
        <div className="flex gap-4 mt-1.5 text-[9px] font-bold text-black uppercase">
          {budget.cliente.telefone_cliente && <span>Fone: {budget.cliente.telefone_cliente}</span>}
          {budget.cliente.endereco_cliente && <span className="truncate">Endereço: {budget.cliente.endereco_cliente}</span>}
        </div>
      </div>

      {/* Tabela de Serviços */}
      <div className="mb-6 flex-1 overflow-hidden">
        <div className="border border-black rounded-xl overflow-hidden flex flex-col h-full bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-3 font-black uppercase tracking-[0.1em] text-[8px]">Descrição detalhada do serviço</th>
                <th className="p-3 font-black uppercase tracking-[0.1em] text-[8px] text-right w-32">Valor Unitário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-bold text-black uppercase tracking-tight leading-snug">{item.descricao}</td>
                  <td className="p-3 font-black text-black text-right tracking-tighter">{item.valor}</td>
                </tr>
              ))}
              {/* Espaçador Dinâmico */}
              <tr><td colSpan={2} className="h-full"></td></tr>
            </tbody>
          </table>
          
          <div className="mt-auto p-5 bg-slate-50/50 border-t border-black/10">
            <div className="grid grid-cols-2 gap-6">
              <div>
                {prof?.formas_pagamento_aceitas && (
                  <div className="mb-2">
                    <p className="text-[7px] font-black text-black uppercase tracking-widest mb-0.5 opacity-50">Pagamento:</p>
                    <p className="text-[9px] font-black text-black uppercase">{prof.formas_pagamento_aceitas}</p>
                  </div>
                )}
                {prof?.condicoes_aceitas && (
                  <div>
                    <p className="text-[7px] font-black text-black uppercase tracking-widest mb-0.5 opacity-50">Termos:</p>
                    <p className="text-[8px] text-black font-medium leading-tight">{prof.condicoes_aceitas}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                 {(budget.valores.valor_mao_de_obra || budget.valores.valor_material) && (
                   <div className="space-y-1 text-right mb-1">
                      {budget.valores.valor_mao_de_obra && <p className="text-[8px] font-bold uppercase">Mão de Obra: {budget.valores.valor_mao_de_obra}</p>}
                      {budget.valores.valor_material && <p className="text-[8px] font-bold uppercase">Material: {budget.valores.valor_material}</p>}
                   </div>
                 )}
                 {hasObservation && (
                  <div className="p-2.5 bg-white rounded-lg border border-black/10">
                    <p className="text-[6px] font-black text-black uppercase mb-0.5 tracking-widest opacity-50">Notas Adicionais:</p>
                    <p className="text-[8px] leading-tight text-black font-medium">{budget.servico.observacoes_servico}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Totais e Assinaturas */}
      <div className="flex justify-between items-center mb-10 px-2 shrink-0">
        <div className="w-1/3 text-center">
          <div className="h-[0.5px] bg-black mb-1 opacity-20"></div>
          <p className="text-[7px] font-black uppercase tracking-widest text-black/50">Aceite do Cliente</p>
        </div>
        
        <div className="text-right">
          <span className="text-[8px] font-black text-black uppercase tracking-widest block mb-0.5 opacity-60">Investimento Total</span>
          <span className="text-4xl font-black text-black tracking-tighter leading-none">{budget.valores.valor_total}</span>
        </div>
      </div>

      {/* Rodapé */}
      <div className="mt-auto border-t border-black pt-4 shrink-0">
        <div className="flex justify-between items-center text-[8px] font-black text-black uppercase tracking-widest">
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
