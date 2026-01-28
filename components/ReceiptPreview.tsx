
import React from 'react';
import { Budget, ProfessionalData } from '../types';

interface Props {
  budget: Budget;
  professional: ProfessionalData;
  value: string; // Valor recebido no momento
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
  const paidNowNum = parseCurrency(value);
  const alreadyPaidPrev = parseCurrency(budget.valores.valor_pago_acumulado || '0');
  const totalPaidAccumulated = alreadyPaidPrev + paidNowNum;
  const remainingValue = Math.max(0, totalBudgetNum - totalPaidAccumulated);

  const currentYear = new Date().getFullYear().toString().slice(-2);
  const sequenceNumber = budget.numero_sequencial ? budget.numero_sequencial.toString().padStart(4, '0') : '0000';

  return (
    <div 
      className="bg-white p-12 text-black flex flex-col font-sans" 
      style={{ width: '210mm', height: '297mm', maxHeight: '297mm', backgroundColor: '#ffffff', color: '#000000', boxSizing: 'border-box', overflow: 'hidden' }}
    >
      <style>{`
        @media print { @page { size: A4; margin: 0; } }
        * { box-sizing: border-box !important; -webkit-print-color-adjust: exact; }
      `}</style>

      {/* Header Profissional */}
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
            <p className="text-[12px] font-black text-black uppercase tracking-widest opacity-80">
              CNPJ/CPF: {professional.cpf_cnpj}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1 opacity-50">Data de Emissão</p>
          <p className="text-sm font-black text-black">{today}</p>
        </div>
      </div>

      <div className="space-y-12 mb-16">
        <div>
          <label className="text-[10px] font-black uppercase text-black tracking-[0.2em] mb-2 block opacity-50">Recebemos de:</label>
          <p className="text-2xl font-black text-black uppercase border-b-2 border-black pb-3">
            {budget.cliente.nome_cliente}
          </p>
        </div>

        <div className="bg-slate-50 p-8 rounded-3xl border border-black/10 flex items-center justify-between">
          <div>
            <label className="text-[10px] font-black uppercase text-black tracking-[0.2em] mb-1 block opacity-50">A Importância de (Pago Agora):</label>
            <p className="text-6xl font-black text-black tracking-tighter">{value}</p>
          </div>
          <div className="text-right flex flex-col gap-2">
            <div>
              <p className="text-[9px] font-black text-black uppercase tracking-widest mb-0.5 opacity-50">Total do Serviço</p>
              <p className="text-lg font-black text-black">{budget.valores.valor_total}</p>
            </div>
            {alreadyPaidPrev > 0 && (
              <div>
                <p className="text-[9px] font-black text-black uppercase tracking-widest mb-0.5 opacity-50">Acumulado Anterior</p>
                <p className="text-sm font-bold text-slate-500">{budget.valores.valor_pago_acumulado}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-black tracking-[0.2em] mb-4 block opacity-50">Referente a:</label>
          <div className="p-6 border border-black rounded-2xl">
            <p className="text-sm font-bold text-black uppercase leading-relaxed">
              {budget.servico.items.map(i => i.descricao).join(' • ')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end mb-24">
        <div className="w-1/2">
          <div className="p-5 bg-white rounded-xl border-2 border-black inline-block">
            <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-1 opacity-50">Saldo Restante</span>
            <span className="text-2xl font-black text-black">{formatCurrency(remainingValue)}</span>
          </div>
        </div>
        <div className="w-1/2 text-center">
          <div className="h-px bg-black mb-4 mx-8"></div>
          <p className="text-base font-black text-black uppercase leading-tight">{professional.nome_profissional}</p>
          <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] mt-1 opacity-50">Assinatura Responsável</p>
        </div>
      </div>

      <div className="mt-auto border-t-2 border-black pt-6">
        <div className="flex justify-between items-center text-[11px] font-black text-black uppercase tracking-widest">
          <div className="flex gap-8">
            <span>{professional.telefone_profissional}</span>
            <span>{professional.email_profissional}</span>
          </div>
          <p className="opacity-40 tracking-[0.4em]">ORÇA FÁCIL</p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreview;
