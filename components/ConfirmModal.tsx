
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'info';
}

const ConfirmModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmLabel = "Confirmar", 
  cancelLabel = "Cancelar",
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 flex flex-col items-center text-center">
          <div className={`w-16 h-16 ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-600'} rounded-2xl flex items-center justify-center mb-6`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-tight mb-2">
            {title}
          </h3>
          
          <p className="text-slate-500 text-sm font-bold uppercase tracking-tight leading-relaxed">
            {description}
          </p>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
              variant === 'danger' 
                ? 'bg-red-500 text-white shadow-red-200 hover:bg-red-600' 
                : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
            }`}
          >
            {confirmLabel}
          </button>
          
          <button 
            onClick={onClose}
            className="w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
