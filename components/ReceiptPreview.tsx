
import React from 'react';
import { Budget, ProfessionalData } from '../types';

interface Props {
  budget: Budget;
  professional: ProfessionalData;
  value: string;
}

const ReceiptPreview: React.FC<Props> = ({ budget, professional, value }) => {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const parseCurrency = (val: string) => {
    return parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(val);
  };

  const totalBudgetNum = parseCurrency(budget.valores.valor_total);
  const paidValueNum = parseCurrency(value);
  const remainingValue = Math.max(0, totalBudgetNum - paidValueNum);
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
          body { background-color: white !important; }
          * { color: black !important; border-color: black !important; }
        }
      `}</style>

      {/* Header Unificado Lado a Lado */}
      <div className="flex justify-between items-center mb-16 border-b-2 border-black pb-10">
        <div className="flex items-center gap-8">
          {professional.logo_profissional && (
            <div className="h-24 w-24 shrink-0 flex items-center justify-center">
              <img src={professional.logo_profissional} alt="Logo" className="max-h-full max-w-full object-contain" />
            </div>
          )}
          <div className="flex flex-col">
            <p className="text-sm font-black text-black uppercase tracking-[0.3em] mb-1">
              RECIBO N° {sequenceNumber}/{currentYear}
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-black leading-none mb-2">
              {professional.nome_profissional}
            </h2>
            <p className="text-[11px] font-black text-black uppercase tracking-widest">
              CPF/CNPJ: {professional.cpf_cnpj}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="inline-flex flex-col items-end">
            <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Data</p>
            <p className="text-sm font-black text-black">{today}</p>
          </div>
        </div>
      </div>

      {/* Conteúdo do Recibo */}
      <div className="space-y-12 mb-16">
        <div>
          <label className="text-[9px] font-black uppercase text-black tracking-[0.2em] mb-2 block">Recebemos de:</label>
          <p className="text-2xl font-black text-black uppercase border-b border-black pb-3">
            {budget.cliente.nome_cliente}
          </p>
        </div>

        <div className="bg-slate-50 p-8 rounded-3xl border border-black flex items-center justify-between">
          <div>
            <label className="text-[9px] font-black uppercase text-black tracking-[0.2em] mb-1 block">A Importância de:</label>
            <p className="text-5xl font-black text-black tracking-tighter">{value}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Total do Serviço</p>
            <p className="text-lg font-black text-black">{budget.valores.valor_total}</p>
          </div>
        </div>

        <div>
          <label className="text-[9px] font-black uppercase text-black tracking-[0.2em] mb-4 block">Referente a:</label>
          <div className="p-6 border border-black rounded-2xl">
            <p className="text-sm font-bold text-black uppercase leading-relaxed">
              {budget.servico.items.map(i => i.descricao).join(' • ')}
            </p>
          </div>
        </div>
      </div>

      {/* Saldo e Quitação */}
      <div className="flex justify-between items-end mb-24">
        <div className="w-1/2">
          {remainingValue > 0 && (
            <div className="bg-white p-4 rounded-xl border border-black inline-block">
              <span className="text-[9px] font-black text-black uppercase tracking-widest block mb-1">Saldo Remanescente</span>
              <span className="text-xl font-black text-black">{formatCurrency(remainingValue)}</span>
            </div>
          )}
        </div>
        <div className="w-1/2 text-center">
          <div className="h-px bg-black mb-4"></div>
          <p className="text-sm font-black text-black uppercase">{professional.nome_profissional}</p>
          <p className="text-[9px] font-black text-black uppercase tracking-[0.2em] mt-1">Assinatura Responsável</p>
        </div>
      </div>

      {/* Rodapé Clean em Linha Única */}
      <div className="mt-auto border-t-2 border-black pt-6">
        <div className="flex justify-center items-center gap-4 text-[10px] font-black text-black uppercase tracking-widest text-center">
          <span>{professional.endereco_profissional}</span>
          <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
          <span>{professional.email_profissional}</span>
          <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
          <span>{professional.telefone_profissional}</span>
        </div>
        <p className="text-[8px] text-black font-black uppercase tracking-[0.5em] text-center mt-6 opacity-30">
          ORÇA FÁCIL • GESTÃO PROFISSIONAL
        </p>
      </div>
    </div>
  );
};

export default ReceiptPreview;
