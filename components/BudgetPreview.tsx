
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

      {/* Header Refinado Lado a Lado */}
      <div className="flex justify-between items-center mb-16 border-b-2 border-black pb-10">
        <div className="flex items-center gap-8">
          {prof?.logo_profissional && (
            <div className="h-24 w-24 shrink-0 flex items-center justify-center">
              <img src={prof.logo_profissional} alt="Logo" className="max-h-full max-w-full object-contain" />
            </div>
          )}
          <div className="flex flex-col">
            <p className="text-sm font-black text-black uppercase tracking-[0.3em] mb-1">
              ORÇAMENTO N° {sequenceNumber}/{currentYear}
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-black leading-none mb-2">
              {prof?.nome_profissional}
            </h2>
            <p className="text-[11px] font-black text-black uppercase tracking-widest">
              CPF/CNPJ: {prof?.cpf_cnpj}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="inline-flex flex-col items-end">
            <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Emitido em</p>
            <p className="text-sm font-black text-black">{budget.legal.data_orcamento}</p>
          </div>
        </div>
      </div>

      {/* Dados do Cliente */}
      <div className="mb-12">
        <label className="text-[9px] font-black uppercase text-black tracking-[0.2em] mb-2 block">Cliente:</label>
        <div className="flex justify-between items-end border-b border-black pb-4">
          <p className="text-2xl font-black text-black uppercase">
            {budget.cliente.nome_cliente || 'CLIENTE NÃO INFORMADO'}
          </p>
          <p className="text-sm font-bold text-black uppercase">WhatsApp: {budget.cliente.telefone_cliente || 'N/A'}</p>
        </div>
      </div>

      {/* Tabela de Serviços */}
      <div className="mb-12 flex-1">
        <div className="border border-black rounded-2xl overflow-hidden flex flex-col h-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-black text-white bg-black-print">
                <th className="p-5 font-black uppercase tracking-[0.2em] text-[10px] text-white-print">Descrição dos Serviços</th>
                <th className="p-5 font-black uppercase tracking-[0.2em] text-[10px] text-right text-white-print">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 flex-1">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-5 font-bold text-black uppercase tracking-tight">{item.descricao}</td>
                  <td className="p-5 font-black text-black text-right tracking-tighter">{item.valor}</td>
                </tr>
              ))}
              <tr className="flex-1"><td colSpan={2} className="p-10"></td></tr>
            </tbody>
          </table>
          
          <div className="mt-auto p-6 bg-slate-50 border-t border-black">
            <div className="grid grid-cols-2 gap-8">
              <div>
                {prof?.formas_pagamento_aceitas && (
                  <div className="mb-4">
                    <p className="text-[9px] font-black text-black uppercase tracking-widest mb-1">Formas de Pagamento:</p>
                    <p className="text-xs font-black text-black uppercase">{prof.formas_pagamento_aceitas}</p>
                  </div>
                )}
                {prof?.condicoes_aceitas && (
                  <div>
                    <p className="text-[9px] font-black text-black uppercase tracking-widest mb-1">Termos e Condições:</p>
                    <p className="text-[10px] text-black font-medium leading-tight">{prof.condicoes_aceitas}</p>
                  </div>
                )}
              </div>
              <div>
                {hasObservation && (
                  <div className="p-4 bg-white rounded-xl border border-black">
                    <p className="text-[8px] font-black text-black uppercase mb-1 tracking-widest">Observações:</p>
                    <p className="text-[10px] leading-relaxed text-black font-medium">{budget.servico.observacoes_servico}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valor Total e Assinaturas */}
      <div className="flex justify-between items-center mb-16 px-4">
        <div className="text-center w-1/3">
          <div className="h-px bg-black mb-2"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-black">Assinatura Cliente</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-1">Total do Orçamento</span>
          <span className="text-4xl font-black text-black tracking-tighter">{budget.valores.valor_total}</span>
        </div>
      </div>

      {/* Rodapé Clean em Linha Única */}
      <div className="mt-auto border-t-2 border-black pt-6">
        <div className="flex justify-center items-center gap-4 text-[10px] font-black text-black uppercase tracking-widest text-center">
          <span>{prof?.endereco_profissional}</span>
          <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
          <span>{prof?.email_profissional}</span>
          <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
          <span>{prof?.telefone_profissional}</span>
        </div>
        <p className="text-[8px] text-black font-black uppercase tracking-[0.5em] text-center mt-6 opacity-30">
          ORÇA FÁCIL • GESTÃO PROFISSIONAL
        </p>
      </div>
    </div>
  );
};

export default BudgetPreview;
