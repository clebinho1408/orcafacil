
import React, { useState, useRef } from 'react';
import { Budget, BudgetStatus, ProfessionalData } from '../types';
import { 
  Calendar, 
  Trash2, 
  MessageCircle, 
  FileText,
  CheckCircle,
  Share2,
  Loader2,
  Receipt,
  Download,
  Search,
  Hash,
  AlertCircle
} from 'lucide-react';
import BudgetPreview from './BudgetPreview';
import ReceiptPreview from './ReceiptPreview';

interface Props {
  budgets: Budget[];
  onUpdateStatus: (id: string, status: BudgetStatus) => void;
  onUpdateBudget: (id: string, updates: Partial<Budget>) => void;
  onDelete: (id: string) => void;
  professional: ProfessionalData | null;
}

const BudgetList: React.FC<Props> = ({ budgets, onUpdateStatus, onUpdateBudget, onDelete, professional }) => {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [pdfBudget, setPdfBudget] = useState<Budget | null>(null);
  const [receiptBudget, setReceiptBudget] = useState<Budget | null>(null);
  const [receiptValue, setReceiptValue] = useState<string>('');
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const receiptContainerRef = useRef<HTMLDivElement>(null);

  const formatCurrencyInput = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) return "";
    const numberValue = parseInt(cleanValue) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numberValue);
  };

  const parseCurrency = (val: string) => {
    return parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: "currency", 
      currency: "BRL" 
    }).format(val);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setReceiptValue(formatted);
  };

  const handleWhatsApp = (budget: Budget) => {
    const prof = professional;
    const profName = prof?.nome_profissional || 'Empresa';

    let message = `*📄 ORÇAMENTO PROFISSIONAL*\n`;
    message += `Olá *${budget.cliente.nome_cliente || 'cliente'}*,\n`;
    message += `Seguem os detalhes do seu orçamento:\n\n`;
    
    budget.servico.items.forEach((item, idx) => {
      message += `${idx + 1}. *${item.descricao}* - ${item.valor}\n`;
    });

    message += `\n*💰 VALOR TOTAL:* _${budget.valores.valor_total}_\n`;
    message += `----------------------------------\n`;

    if (prof?.formas_pagamento_aceitas) message += `*💳 FORMA DE PAGAMENTO:* ${prof.formas_pagamento_aceitas}\n`;
    if (prof?.condicoes_aceitas) message += `*📋 CONDIÇÕES:* ${prof.condicoes_aceitas}\n`;
    if (budget.servico.observacoes_servico) message += `\n*📝 OBS:* ${budget.servico.observacoes_servico}\n`;
    
    message += `----------------------------------\n`;
    message += `*EMPRESA:* ${profName}\n`;
    if (prof?.cpf_cnpj) message += `*CNPJ/CPF:* ${prof.cpf_cnpj}\n`;
    if (prof?.endereco_profissional) message += `*ENDEREÇO:* ${prof.endereco_profissional}\n`;
    if (prof?.email_profissional) message += `*E-MAIL:* ${prof.email_profissional}\n`;
    if (prof?.telefone_profissional) message += `*CONTATO:* ${prof.telefone_profissional}\n`;
    
    const url = `https://wa.me/${budget.cliente.telefone_cliente.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const generatePDF = async (element: HTMLElement | null, filename: string) => {
    if (!element) return;
    const opt = {
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    const pdfBlob = await window.html2pdf().from(element).set(opt).output('blob');
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    if (navigator.share) {
      await navigator.share({ files: [file], title: 'Documento Profissional' });
    } else {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    }
  };

  const handleShareBudget = async (budget: Budget) => {
    setGeneratingId(budget.id_orcamento);
    setPdfBudget(budget);
    await new Promise(r => setTimeout(r, 800));
    await generatePDF(pdfContainerRef.current, `Orcamento_${budget.cliente.nome_cliente}.pdf`);
    setGeneratingId(null);
    setPdfBudget(null);
  };

  const handleShareReceipt = async () => {
    if (!receiptBudget || !receiptValue) return;
    setIsGeneratingReceipt(true);
    
    // Atualiza o acumulado no banco de dados
    const currentPaidNow = parseCurrency(receiptValue);
    const alreadyPaid = parseCurrency(receiptBudget.valores.valor_pago_acumulado || '0');
    const newTotalPaid = formatCurrency(alreadyPaid + currentPaidNow);
    
    await onUpdateBudget(receiptBudget.id_orcamento, {
      valores: {
        ...receiptBudget.valores,
        valor_pago_acumulado: newTotalPaid
      }
    });

    await new Promise(r => setTimeout(r, 1200));
    await generatePDF(receiptContainerRef.current, `Recibo_${receiptBudget.cliente.nome_cliente}.pdf`);
    setIsGeneratingReceipt(false);
    setReceiptBudget(null);
    setReceiptValue('');
  };

  const getStatusColor = (status: BudgetStatus) => {
    switch (status) {
      case BudgetStatus.PENDENTE: return 'bg-amber-100 text-amber-700';
      case BudgetStatus.APROVADO: return 'bg-green-100 text-green-700';
      case BudgetStatus.RECUSADO: return 'bg-red-100 text-red-700';
    }
  };

  const filteredBudgets = budgets.filter(b => {
    const term = searchTerm.toLowerCase();
    return b.cliente.nome_cliente.toLowerCase().includes(term) || b.numero_sequencial?.toString().includes(term);
  });

  return (
    <div className="space-y-4 animate-in slide-in-from-right-4 duration-500 pb-20">
      <div className="pdf-render-wrapper" style={{ position: 'fixed', left: '-9999px', top: '0', width: '210mm', height: '297mm', overflow: 'hidden', zIndex: -100 }}>
        <div id="pdf-content-to-capture" ref={pdfContainerRef}>
          {pdfBudget && <BudgetPreview budget={pdfBudget} />}
        </div>
        <div ref={receiptContainerRef}>
          {receiptBudget && professional && (
            <ReceiptPreview 
              budget={receiptBudget} 
              professional={professional} 
              value={receiptValue} 
            />
          )}
        </div>
      </div>

      {receiptBudget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Recibo Profissional</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Confirmação de Pagamento</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Orçado</p>
                  <p className="text-sm font-black text-slate-700">{receiptBudget.valores.valor_total}</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Pago Anteriormente</p>
                  <p className="text-sm font-black text-indigo-700">{receiptBudget.valores.valor_pago_acumulado || 'R$ 0,00'}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Valor Recebido Agora:</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">R$</span>
                  <input 
                    autoFocus
                    type="text"
                    inputMode="numeric"
                    className="w-full p-5 pl-12 bg-white border-2 border-indigo-600 rounded-2xl text-3xl font-black text-slate-900 outline-none shadow-inner"
                    placeholder="0,00"
                    value={receiptValue.replace("R$", "").trim()}
                    onChange={handleValueChange}
                  />
                </div>
                {receiptValue && parseCurrency(receiptValue) > 0 && (
                  <p className="text-[10px] font-bold text-green-600 mt-2 uppercase flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Saldo restante após este pagamento: {
                      formatCurrency(Math.max(0, parseCurrency(receiptBudget.valores.valor_total) - (parseCurrency(receiptBudget.valores.valor_pago_acumulado || '0') + parseCurrency(receiptValue))))
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleShareReceipt}
                disabled={!receiptValue || isGeneratingReceipt}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 transition-all"
              >
                {isGeneratingReceipt ? <Loader2 className="animate-spin" /> : <CheckCircle className="w-5 h-5" />} EMITIR E COMPARTILHAR
              </button>
              <button 
                onClick={() => { setReceiptBudget(null); setReceiptValue(''); }}
                className="w-full py-2 text-slate-400 font-black uppercase text-[10px] tracking-widest"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Meus Orçamentos</h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
            placeholder="Pesquisar cliente ou número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredBudgets.map((budget) => (
          <div key={budget.id_orcamento} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm group">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 relative">
                  <FileText className="w-7 h-7" />
                  <div className="absolute -top-1 -right-1 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
                    {budget.numero_sequencial}
                  </div>
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-black text-slate-900 text-lg uppercase leading-tight truncate">
                    {budget.servico.items && budget.servico.items.length > 0 ? budget.servico.items[0].descricao : budget.servico.descricao_servico}
                  </h3>
                  <p className="text-sm text-slate-500 font-bold mt-0.5 truncate uppercase">Cliente: {budget.cliente.nome_cliente || 'Consumidor'}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-black text-indigo-600">{budget.valores.valor_total}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${getStatusColor(budget.status_orcamento)}`}>
                      {budget.status_orcamento}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button onClick={() => handleWhatsApp(budget)} className="bg-green-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase active:scale-95">
                  <MessageCircle className="w-4 h-4 fill-current" /> Whats
                </button>
                <button onClick={() => handleShareBudget(budget)} disabled={generatingId === budget.id_orcamento} className="bg-white border-2 border-slate-900 text-slate-900 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase active:scale-95">
                  {generatingId === budget.id_orcamento ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} PDF
                </button>
                {budget.status_orcamento === BudgetStatus.APROVADO && (
                  <button 
                    onClick={() => { 
                      setReceiptBudget(budget); 
                      const totalNum = parseCurrency(budget.valores.valor_total);
                      const paidNum = parseCurrency(budget.valores.valor_pago_acumulado || '0');
                      setReceiptValue(formatCurrency(totalNum - paidNum)); 
                    }} 
                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase active:scale-95"
                  >
                    <Receipt className="w-4 h-4" /> Recibo
                  </button>
                )}
                <button onClick={() => onDelete(budget.id_orcamento)} className="p-2.5 text-red-400 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all ml-auto">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetList;
