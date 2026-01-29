
import React, { useState, useEffect } from 'react';
import { 
  History, 
  Settings, 
  Plus, 
  LogOut,
  Loader2
} from 'lucide-react';
import { Budget, User, BudgetStatus } from './types';
import BudgetCreator from './components/BudgetCreator';
import BudgetList from './components/BudgetList';
import ProfessionalForm from './components/ProfessionalForm';
import Auth from './components/Auth';
import Logo from './components/Logo';
import ConfirmModal from './components/ConfirmModal';
import { db } from './services/db';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'settings'>('create');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [nextSequence, setNextSequence] = useState(1);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const user = await db.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        loadUserData(user.id);
      }
      setIsAuthChecking(false);
    };

    checkSession();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = await db.getCurrentUser();
          if (user) {
            setCurrentUser(user);
            loadUserData(user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setBudgets([]);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const loadUserData = async (userId: string) => {
    setIsLoadingData(true);
    try {
      const userBudgets = await db.getBudgets(userId);
      setBudgets(userBudgets);
      const max = userBudgets.reduce((prev, current) => Math.max(prev, current.numero_sequencial || 0), 0);
      setNextSequence(max + 1);
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    loadUserData(user.id);
  };

  const performLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveTab('create');
  };

  const saveProfessional = async (data: any) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...data };
    setCurrentUser(updatedUser);
    
    try {
      await db.updateProfile(currentUser.id, data);
      alert('Dados atualizados com sucesso!');
    } catch (e: any) {
      alert(`Erro ao atualizar perfil: ${e.message}`);
    }
  };

  const addBudget = async (budget: Budget) => {
    if (!currentUser) return;
    
    const budgetWithUser = { 
      ...budget, 
      user_id: currentUser.id,
      numero_sequencial: nextSequence 
    };

    try {
      await db.saveBudget(budgetWithUser);
      setBudgets([budgetWithUser, ...budgets]);
      setNextSequence(nextSequence + 1);
      setActiveTab('history');
    } catch (e: any) {
      console.error("Falha ao salvar:", e);
      alert(`Erro ao salvar: ${e.message}`);
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    if (!currentUser) return;
    try {
      await db.updateBudget(id, currentUser.id, updates);
      setBudgets(prev => prev.map(b => b.id_orcamento === id ? { ...b, ...updates } : b));
    } catch (e: any) {
      alert(`Erro ao atualizar orçamento: ${e.message}`);
    }
  };

  const updateBudgetStatus = async (id: string, status: BudgetStatus) => {
    if (!currentUser) return;
    try {
      await db.updateBudgetStatus(id, currentUser.id, status);
      setBudgets(budgets.map(b => b.id_orcamento === id ? { ...b, status_orcamento: status } : b));
    } catch (e: any) {
      alert(`Erro ao atualizar status: ${e.message}`);
    }
  };

  const deleteBudget = async (id: string) => {
    if (!currentUser) return;
    try {
      await db.deleteBudget(id, currentUser.id);
      setBudgets(budgets.filter(b => b.id_orcamento !== id));
    } catch (e: any) {
      alert(`Erro ao excluir: ${e.message}`);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden safe-top">
      <ConfirmModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={performLogout}
        title="Deseja Sair?"
        description="Você precisará entrar com seu e-mail e senha novamente para acessar seus orçamentos."
        confirmLabel="Sair Agora"
        variant="danger"
      />

      <header className="bg-white px-6 pt-8 pb-6 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                ORÇA VOZ
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Orçamento gerado por Voz</p>
            </div>
          </div>
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100 active:scale-90 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 pb-24 bg-slate-50">
        {isLoadingData ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="font-bold text-xs uppercase tracking-widest">Sincronizando Nuvem...</p>
          </div>
        ) : (
          <>
            {activeTab === 'create' && (
              <BudgetCreator 
                professional={currentUser} 
                onSave={addBudget} 
                nextSequence={nextSequence}
              />
            )}
            
            {activeTab === 'history' && (
              <BudgetList 
                budgets={budgets} 
                onUpdateStatus={updateBudgetStatus} 
                onUpdateBudget={updateBudget}
                onDelete={deleteBudget}
                professional={currentUser}
              />
            )}

            {activeTab === 'settings' && (
              <ProfessionalForm initialData={currentUser} onSave={saveProfessional} />
            )}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around px-4 py-4 pb-8 z-50">
        <button onClick={() => setActiveTab('create')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'create' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`p-2 rounded-xl ${activeTab === 'create' ? 'bg-indigo-50' : 'bg-transparent'}`}><Plus className="w-6 h-6" /></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Novo</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`p-2 rounded-xl ${activeTab === 'history' ? 'bg-indigo-50' : 'bg-transparent'}`}><History className="w-6 h-6" /></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Lista</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`p-2 rounded-xl ${activeTab === 'settings' ? 'bg-indigo-50' : 'bg-transparent'}`}><Settings className="w-6 h-6" /></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Dados</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
