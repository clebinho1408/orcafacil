
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Loader2, 
  Check, 
  UserPlus, 
  Package, 
  ArrowRight,
  RotateCcw,
  FileText,
  ChevronLeft,
  PlusCircle,
  ListPlus,
  MessageCircle,
  ChevronRight,
  Trash2,
  MapPin,
  Phone,
  Zap
} from 'lucide-react';
import { 
  Budget, 
  ClientData, 
  ValuesData, 
  LegalData, 
  BudgetStatus,
  ExtractedBudget,
  ServiceItem,
  User
} from '../types';
import { extractBudgetData } from '../services/geminiService';
import BudgetPreview from './BudgetPreview';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    html2pdf: any;
  }
}

interface Props {
  professional: User;
  onSave: (budget: Budget) => void;
  nextSequence: number;
}

const BudgetCreator: React.FC<Props> = ({ professional, onSave, nextSequence }) => {
  const [step, setStep] = useState<'voice_services' | 'voice_client' | 'voice_obs' | 'details' | 'preview' | 'finished'>('voice_services');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [silenceCounter, setSilenceCounter] = useState(0);
  const [lastBudget, setLastBudget] = useState<Budget | null>(null);
  const [pdfBudget, setPdfBudget] = useState<Budget | null>(null);
  const [showMultiServiceModal, setShowMultiServiceModal] = useState(false);
  const [pendingExtraction, setPendingExtraction] = useState<ExtractedBudget | null>(null);
  
  const [previewScale, setPreviewScale] = useState(1);
  const previewWrapperRef = useRef<HTMLDivElement>(null);

  const [client, setClient] = useState<ClientData>({
    nome_cliente: '',
    telefone_cliente: '',
    endereco_cliente: '',
    observacoes_cliente: '',
  });

  const [items, setItems] = useState<ServiceItem[]>([]);
  const [serviceMeta, setServiceMeta] = useState({
    observacoes_servico: '',
  });

  const [values, setValues] = useState<ValuesData>({
    valor_total: 'R$ 0,00',
    desconto: '',
    forma_pagamento: 'PIX',
    valor_pago_acumulado: 'R$ 0,00'
  });

  const [legal, setLegal] = useState<LegalData>({
    data_orcamento: new Date().toLocaleDateString('pt-BR'),
    validade_orcamento: '7 dias',
    garantia_servico: '90 dias',
    assinatura_profissional: professional.nome_profissional,
  });

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<number | null>(null);

  const parseCurrency = (val: string) => {
    if (!val) return 0;
    const clean = val.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(val);
  };

  const calculateTotal = (serviceItems: ServiceItem[]) => {
    const total = serviceItems.reduce((acc, item) => acc + parseCurrency(item.valor), 0);
    return formatCurrency(total);
  };

  useEffect(() => {
    if (step === 'preview' && previewWrapperRef.current) {
      const updateScale = () => {
        const containerWidth = previewWrapperRef.current?.clientWidth || 0;
        const a4WidthPx = 210 * 3.7795275591; 
        const scale = (containerWidth - 40) / a4WidthPx;
        setPreviewScale(Math.min(scale, 1));
      };
      
      updateScale();
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }
  }, [step]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event: any) => {
        let newFinalText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            newFinalText += event.results[i][0].transcript;
          }
        }
        if (newFinalText) {
          setTranscript(prev => (prev ? prev + ' ' : '') + newFinalText.trim());
          setSilenceCounter(0); 
        }
      };

      recognition.onend = () => { if (isRecording) try { recognition.start(); } catch (e) {} };
      recognitionRef.current = recognition;
    }
    return () => stopSilenceTimer();
  }, [isRecording]);

  const startSilenceTimer = () => {
    stopSilenceTimer();
    setSilenceCounter(0);
    silenceTimerRef.current = window.setInterval(() => {
      setSilenceCounter(prev => {
        if (prev + 1 >= 8) { handleStopRecording(); return 0; }
        return prev + 1;
      });
    }, 1000);
  };

  const stopSilenceTimer = () => { if (silenceTimerRef.current) { clearInterval(silenceTimerRef.current); silenceTimerRef.current = null; } };

  const handleStopRecording = () => {
    setIsRecording(false);
    stopSilenceTimer();
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e) {}
  };

  const toggleRecording = () => {
    if (isRecording) { handleStopRecording(); } 
    else { setTranscript(''); setIsRecording(true); startSilenceTimer(); try { recognitionRef.current?.start(); } catch(e) {} }
  };

  const handleProcessWithIA = async () => {
    if (!transcript.trim()) return;
    handleStopRecording();
    setIsExtracting(true);
    
    try {
      const data = await extractBudgetData(transcript);
      if (data) {
        if (step === 'voice_services') {
          if (data.descricao_servico && data.valor_total) {
            setPendingExtraction(data);
            setShowMultiServiceModal(true);
          } else {
            alert("Diga o serviço e o valor para continuar.");
          }
        } else if (step === 'voice_client') {
          setClient(prev => ({ 
            ...prev, 
            nome_cliente: (data.nome_cliente || transcript).toUpperCase(),
            telefone_cliente: data.telefone_cliente || prev.telefone_cliente,
            endereco_cliente: data.endereco_cliente || prev.endereco_cliente
          }));
          setTranscript('');
          setStep('voice_obs');
        } else if (step === 'voice_obs') {
          setServiceMeta(prev => ({ ...prev, observacoes_servico: transcript }));
          setTranscript('');
          setStep('details');
        }
      } else {
        if (step === 'voice_client') {
          setClient(prev => ({ ...prev, nome_cliente: transcript.toUpperCase() }));
          setTranscript('');
          setStep('voice_obs');
        } else if (step === 'voice_obs') {
          setServiceMeta(prev => ({ ...prev, observacoes_servico: transcript }));
          setTranscript('');
          setStep('details');
        } else {
          alert("Ops, não consegui entender o serviço. Tente falar novamente.");
        }
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const applyServiceItem = (data: ExtractedBudget, addAnother: boolean) => {
    const newItem: ServiceItem = {
      descricao: data.descricao_servico?.toUpperCase() || 'SERVIÇO',
      valor: data.valor_total || 'R$ 0,00'
    };
    
    const newItems = [...items, newItem];
    setItems(newItems);
    setValues(prev => ({
      ...prev,
      valor_total: calculateTotal(newItems),
      forma_pagamento: data.forma_pagamento || prev.forma_pagamento
    }));

    setTranscript('');
    setPendingExtraction(null);
    setShowMultiServiceModal(false);

    if (addAnother) {
      setStep('voice_services');
    } else {
      setStep('voice_client');
    }
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setValues(prev => ({
      ...prev,
      valor_total: calculateTotal(newItems)
    }));
  };

  const handleResetToVoice = () => {
    handleStopRecording();
    setTranscript('');
    setItems([]);
    setClient({ nome_cliente: '', telefone_cliente: '', endereco_cliente: '', observacoes_cliente: '' });
    setValues({ valor_total: 'R$ 0,00', desconto: '', forma_pagamento: 'PIX', valor_pago_acumulado: 'R$ 0,00' });
    setStep('voice_services');
  };

  const handleFinalize = () => {
    const budget: Budget = {
      id_orcamento: `ORC-${Date.now()}`,
      user_id: professional.id,
      numero_sequencial: nextSequence,
      status_orcamento: BudgetStatus.PENDENTE,
      data_criacao: new Date().toISOString(),
      profissional: professional,
      cliente: client,
      servico: {
        items: items,
        observacoes_servico: serviceMeta.observacoes_servico,
        descricao_servico: items.map(i => i.descricao).join('\n'),
        metragem: '',
        valor_servico: values.valor_total
      },
      valores: values,
      legal,
      texto_transcrito: transcript,
      enviado_whatsapp: false,
    };
    setLastBudget(budget);
    onSave(budget);
    setStep('finished');
  };

  const generateAndSharePDF = async (budget: Budget) => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    setPdfBudget(budget);
    await new Promise(r => setTimeout(r, 1500));
    const element = document.getElementById('pdf-content-to-capture');
    if (!element) { setIsGeneratingPDF(false); setPdfBudget(null); return; }
    
    const opt = {
      margin: 0,
      filename: `Orcamento_${budget.cliente.nome_cliente || 'Cliente'}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      const pdfBlob = await window.html2pdf().from(element).set(opt).output('blob');
      const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
      if (navigator.share) {
        await navigator.share({ files: [file], title: `Orçamento: ${budget.cliente.nome_cliente}` });
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = opt.filename;
        link.click();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPDF(false);
      setPdfBudget(null);
    }
  };

  const sendWhatsApp = (budget: Budget) => {
    const prof = professional;
    const profName = prof?.nome_profissional || 'Empresa';

    let message = `*📄 ORÇAMENTO PROFISSIONAL*\n`;
    message += `Olá *${budget.cliente.nome_cliente}*,\n`;
    message += `Seguem os detalhes do seu orçamento:\n\n`;
    
    budget.servico.items.forEach((item, idx) => {
      message += `${idx + 1}. *${item.descricao}* - ${item.valor}\n`;
    });

    message += `\n*💰 VALOR TOTAL:* _${budget.valores.valor_total}_\n`;
    message += `----------------------------------\n`;
    
    if (prof.formas_pagamento_aceitas) {
      message += `*💳 FORMA DE PAGAMENTO:* ${prof.formas_pagamento_aceitas}\n`;
    }
    
    if (prof.condicoes_aceitas) {
      message += `*📋 CONDIÇÕES:* ${prof.condicoes_aceitas}\n`;
    }

    if (budget.servico.observacoes_servico) message += `\n*📝 OBS:* ${budget.servico.observacoes_servico}\n`;
    
    message += `----------------------------------\n`;
    message += `*EMPRESA:* ${profName}\n`;
    if (prof.cpf_cnpj) message += `*CNPJ/CPF:* ${prof.cpf_cnpj}\n`;
    if (prof.endereco_profissional) message += `*ENDEREÇO:* ${prof.endereco_profissional}\n`;
    if (prof.email_profissional) message += `*E-MAIL:* ${prof.email_profissional}\n`;
    if (prof.telefone_profissional) message += `*CONTATO:* ${prof.telefone_profissional}\n`;

    const url = `https://wa.me/${budget.cliente.telefone_cliente.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const currentStatusIndex = step.includes('voice') ? 0 : (step === 'details' ? 1 : 2);

  return (
    <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500 print:hidden flex flex-col min-h-full overflow-x-hidden">
      <div className="pdf-render-wrapper" style={{ position: 'fixed', left: '-9999px', top: '0', width: '210mm', height: '297mm', overflow: 'hidden', zIndex: -100 }}>
        <div id="pdf-content-to-capture">
          {pdfBudget && <BudgetPreview budget={pdfBudget} />}
        </div>
      </div>

      {showMultiServiceModal && pendingExtraction && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-600">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 uppercase">Item Reconhecido!</h3>
            <p className="text-slate-500 font-bold mb-4 text-sm">
              <span className="text-indigo-600">"{pendingExtraction.descricao_servico}"</span> <br/>
              Valor: <span className="text-indigo-600">{pendingExtraction.valor_total}</span>.
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => applyServiceItem(pendingExtraction, true)} className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all">
                <PlusCircle className="w-4 h-4" /> ADICIONAR OUTRO SERVIÇO
              </button>
              <button onClick={() => applyServiceItem(pendingExtraction, false)} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all">
                PRÓXIMO: CLIENTE <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step !== 'finished' && (
        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-100 shrink-0 mb-1">
          <div className="flex flex-1 items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStatusIndex === 0 ? 'bg-indigo-600 text-white' : 'bg-green-100 text-green-600'}`}>{currentStatusIndex > 0 ? <Check className="w-3 h-3" /> : '1'}</div>
            <span className="text-[9px] font-bold text-slate-400 hidden sm:inline uppercase tracking-widest">Voz</span>
          </div>
          <div className="h-[1px] w-4 bg-slate-200 mx-1" />
          <div className="flex flex-1 items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStatusIndex === 1 ? 'bg-indigo-600 text-white' : (currentStatusIndex > 1 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400')}`}>{currentStatusIndex > 1 ? <Check className="w-3 h-3" /> : '2'}</div>
            <span className="text-[9px] font-bold text-slate-400 hidden sm:inline uppercase tracking-widest">Edição</span>
          </div>
          <div className="h-[1px] w-4 bg-slate-200 mx-1" />
          <div className="flex flex-1 items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStatusIndex === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
            <span className="text-[9px] font-bold text-slate-400 hidden sm:inline uppercase tracking-widest">Resumo</span>
          </div>
        </div>
      )}

      {(step.startsWith('voice_')) && (
        <div className="flex flex-col items-center py-4 bg-white rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden flex-1 max-h-[75vh]">
          {items.length > 0 && step === 'voice_services' && (
            <div className="absolute top-2 right-3 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full flex items-center gap-2 animate-bounce">
              <ListPlus className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-wider">{items.length} ITENS</span>
            </div>
          )}
          <div className="text-center mb-2 px-6">
            <h2 className="text-xl font-black mb-0.5 text-slate-900 leading-tight">
              {isExtracting ? "IA está pensando..." : (isRecording ? "Pode falar..." : "Toque para falar")}
            </h2>
            <p className="text-slate-500 text-[10px] max-w-xs mx-auto font-bold uppercase tracking-tight">
              {step === 'voice_services' && "Diga o serviço e o valor (Ex: Pintura 500 reais)"}
              {step === 'voice_client' && "Diga o nome do cliente (pode incluir fone e endereço)"}
              {step === 'voice_obs' && "Alguma observação extra?"}
            </p>
          </div>
          
          <div className="relative mb-4 flex-shrink-0">
            {isRecording && <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />}
            {isExtracting && <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-pulse scale-110" />}
            
            <button 
              onClick={isExtracting ? undefined : toggleRecording} 
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all transform active:scale-95 ${isExtracting ? 'bg-indigo-400 cursor-wait' : (isRecording ? 'bg-red-500' : 'bg-indigo-600 hover:bg-indigo-700')}`}
            >
              {isExtracting ? <Zap className="text-white w-8 h-8 animate-bounce fill-current" /> : (isRecording ? <Square className="text-white w-8 h-8 fill-current" /> : <Mic className="text-white w-10 h-10" />)}
            </button>
          </div>

          <div className="w-full px-5 mb-3 flex-1 overflow-hidden flex flex-col">
            <div className={`p-3 rounded-xl flex-1 border-2 transition-all overflow-y-auto ${isRecording ? 'bg-indigo-50 border-indigo-200 border-dashed' : 'bg-slate-50 border-slate-200'}`}>
               <textarea 
                  className="w-full h-full bg-transparent outline-none resize-none text-sm font-medium" 
                  value={transcript} 
                  onChange={(e) => setTranscript(e.target.value)} 
                  placeholder={isExtracting ? "Processando informações instantaneamente..." : "Sua voz aparecerá aqui..."} 
                  disabled={isRecording || isExtracting} 
               />
            </div>
          </div>
          
          <div className="flex flex-col w-[90%] gap-2 shrink-0">
            {!isRecording && transcript && (
              <button 
                onClick={handleProcessWithIA} 
                disabled={isExtracting} 
                className={`w-full text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 shadow-xl transition-all ${isExtracting ? 'bg-indigo-400' : 'bg-indigo-600'}`}
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>PROCESSANDO...</span>
                  </>
                ) : (
                  <>
                    <span>CONTINUAR AGORA</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
            
            {!isRecording && !transcript && step === 'voice_obs' && (
              <button onClick={() => setStep('details')} className="w-full bg-indigo-50 text-indigo-600 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 active:bg-indigo-100">
                Finalizar orcamento <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-3 animate-in slide-in-from-right-4 overflow-x-hidden flex-1 pb-24">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3 text-indigo-600"><UserPlus className="w-3.5 h-3.5" /><h3 className="font-bold uppercase text-[9px] tracking-widest">Informações do Cliente</h3></div>
            <div className="space-y-2">
              <input className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs w-full font-black uppercase" placeholder="Nome Completo" value={client.nome_cliente} onChange={e => setClient({ ...client, nome_cliente: e.target.value.toUpperCase() })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input className="p-3 pl-9 bg-slate-50 rounded-lg border border-slate-200 text-xs w-full" placeholder="WhatsApp" value={client.telefone_cliente} onChange={e => setClient({ ...client, telefone_cliente: e.target.value })} />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input className="p-3 pl-9 bg-slate-50 rounded-lg border border-slate-200 text-xs w-full uppercase" placeholder="Endereço" value={client.endereco_cliente} onChange={e => setClient({ ...client, endereco_cliente: e.target.value.toUpperCase() })} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3 text-indigo-600"><Package className="w-3.5 h-3.5" /><h3 className="font-bold uppercase text-[9px] tracking-widest">Serviços e Valores</h3></div>
            <div className="space-y-2 mb-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between">
                    <input 
                      className="w-full bg-transparent font-black text-[11px] uppercase outline-none" 
                      value={item.descricao} 
                      onChange={e => {
                        const newItems = [...items];
                        newItems[idx].descricao = e.target.value.toUpperCase();
                        setItems(newItems);
                      }} 
                    />
                    <button onClick={() => removeItem(idx)} className="text-red-400 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <input 
                      className="w-28 bg-white px-2 py-1.5 rounded-md font-black text-indigo-600 text-[11px] border border-slate-100" 
                      value={item.valor} 
                      onChange={e => {
                        const newItems = [...items];
                        newItems[idx].valor = e.target.value;
                        setItems(newItems);
                        setValues(v => ({ ...v, valor_total: calculateTotal(newItems) }));
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-100">
                <label className="text-[10px] font-black text-green-700 uppercase tracking-widest">Valor Total</label>
                <input className="w-32 bg-transparent text-right font-black text-green-700 text-lg outline-none" value={values.valor_total} onChange={e => setValues({ ...values, valor_total: e.target.value })} />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1 pb-4">
            <button onClick={() => setStep('preview')} disabled={items.length === 0} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50 transition-all">
              VISUALIZAR PROPOSTA <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={handleResetToVoice} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase flex items-center justify-center gap-1 active:bg-slate-50 rounded-lg">
              <RotateCcw className="w-3 h-3" /> Reiniciar Processo
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="flex-1 flex flex-col min-h-0 animate-in zoom-in-95 relative" ref={previewWrapperRef}>
          <div className="bg-slate-200 rounded-xl border border-slate-300 shadow-inner overflow-auto p-4 mb-3 flex-1 flex flex-col items-center">
             <div 
               className="preview-outer-container shadow-2xl bg-white"
               style={{ 
                 height: `calc(297mm * ${previewScale})`, 
                 width: `calc(210mm * ${previewScale})`,
                 flexShrink: 0,
                 overflow: 'hidden'
               }}
             >
                <div 
                  className="preview-scale-container origin-top-left" 
                  style={{ transform: `scale(${previewScale})` }}
                >
                  <BudgetPreview budget={{ 
                    id_orcamento: 'PROPOSTA', 
                    user_id: professional.id,
                    numero_sequencial: nextSequence,
                    status_orcamento: BudgetStatus.PENDENTE, 
                    data_criacao: new Date().toISOString(), 
                    profissional: professional, 
                    cliente: client, 
                    servico: { 
                      items, 
                      observacoes_servico: serviceMeta.observacoes_servico, 
                      descricao_servico: '', 
                      metragem: '', 
                      valor_servico: values.valor_total 
                    }, 
                    valores: values, 
                    legal, 
                    enviado_whatsapp: false 
                  }} />
                </div>
             </div>
          </div>
          <div className="space-y-2 pb-24 px-1 shrink-0 bg-slate-50">
            <button onClick={handleFinalize} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-sm shadow-xl active:scale-95 flex items-center justify-center gap-2">
              <Check className="w-5 h-5 shrink-0" /> <span>CONFIRMAR E SALVAR</span>
            </button>
            <button onClick={() => setStep('details')} className="w-full py-2 text-slate-500 font-bold text-[10px] uppercase flex items-center justify-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Voltar para Edição
            </button>
          </div>
        </div>
      )}

      {step === 'finished' && lastBudget && (
        <div className="flex flex-col items-center py-8 bg-white rounded-2xl shadow-xl border-4 border-indigo-50 animate-in zoom-in-90 mb-20 flex-1 justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600"><Check className="w-10 h-10" /></div>
          <h2 className="text-2xl font-black mb-8 text-slate-900 text-center px-4 uppercase tracking-tighter leading-none">ORÇAMENTO GERADO!</h2>
          <div className="w-full px-8 flex flex-col gap-3">
            <button onClick={() => generateAndSharePDF(lastBudget)} disabled={isGeneratingPDF} className="w-full bg-white border-2 border-slate-900 text-slate-900 py-4 rounded-xl font-black text-base flex items-center justify-center gap-3 active:scale-95 transition-all">
              {isGeneratingPDF ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />} ENVIAR PDF
            </button>
            <button onClick={() => sendWhatsApp(lastBudget)} className="w-full bg-[#25D366] text-white py-4 rounded-xl font-black text-base flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
              <MessageCircle className="w-5 h-5 fill-current" /> WHATSAPP
            </button>
            <button onClick={() => setStep('voice_services')} className="text-slate-400 py-3 rounded-xl font-black active:text-slate-600 transition-colors uppercase text-[10px] tracking-widest mt-4">Novo Orçamento</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetCreator;
