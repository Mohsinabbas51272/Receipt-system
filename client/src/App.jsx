import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ReceiptForm from './components/ReceiptForm';
import ReceiptPreview from './components/ReceiptPreview';
import ReceiptList from './components/ReceiptList';
import { getReceipts, createReceipt, updateReceipt, deleteReceipt } from './services/api';
import { Edit3, Eye } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'history'
  const [mobileView, setMobileView] = useState('form'); // 'form' or 'preview' on small screens
  const [receipts, setReceipts] = useState([]);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [formResetTrigger, setFormResetTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');

  // Fetch receipts from backend on mount
  useEffect(() => {
    fetchReceipts();
    initBlankReceipt();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await getReceipts();
      if (res && res.data) {
        setReceipts(res.data);
      }
    } catch (err) {
      console.warn('Backend API connection notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Initialize a completely blank receipt
  const initBlankReceipt = (num = '') => {
    const blank = {
      receiptNumber: num,
      date: new Date().toISOString().split('T')[0],
      customer: { name: '', phone: '' },
      goldRate: 0,
      goldKarat: '',
      palashWeight: 0,
      items: [],
      summary: { grandTotal: 0, paidAmount: 0, balanceDue: 0 }
    };
    setCurrentReceipt(blank);
    setSelectedReceipt(null);
  };

  // Handler for creating a fresh, blank receipt
  const handleNewReceipt = () => {
    initBlankReceipt('');
    setFormResetTrigger(prev => prev + 1);
    setActiveTab('create');
    setMobileView('form');
    showNotification('✨ نئی خالی پرچی تیار ہے!');
  };

  // Save or update receipt
  const handleSaveReceipt = async (receiptData) => {
    try {
      setLoading(true);
      let res;
      if (receiptData.id) {
        res = await updateReceipt(receiptData.id, receiptData);
      } else {
        res = await createReceipt(receiptData);
      }
      const saved = res?.data || receiptData;
      setReceipts(prev => {
        const exists = prev.some(r => r.id === saved.id);
        if (exists) {
          return prev.map(r => r.id === saved.id ? saved : r);
        }
        return [saved, ...prev];
      });
      setCurrentReceipt(saved);
      setSelectedReceipt(saved);
      showNotification('✅ پرچی گوگل شیٹ میں کامیابی سے محفوظ ہو گئی!');
      setActiveTab('create');
      // On mobile, show the live preview after saving so user can view/print
      setMobileView('preview');
    } catch (err) {
      console.error('Error saving receipt:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      showNotification(`⚠️ پرچی محفوظ کرنے میں مسئلہ: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete receipt
  const handleDeleteReceipt = async (targetReceipt) => {
    const id = targetReceipt?.id;
    try {
      if (id) {
        await deleteReceipt(id);
      }
    } catch (err) {
      console.warn('Delete API warning:', err.message);
    }

    const updated = receipts.filter(r => r.id !== targetReceipt.id);
    setReceipts(updated);

    if (currentReceipt?.id === targetReceipt.id) {
      handleNewReceipt();
    }

    showNotification('🗑️ پرچی کامیابی سے ڈیلیٹ ہو گئی!');
  };

  const handleSelectReceipt = (rcp) => {
    setCurrentReceipt(rcp);
    setSelectedReceipt(rcp);
    setFormResetTrigger(prev => prev + 1);
    setActiveTab('create');
    setMobileView('preview');
  };

  // Live update preview as user types in form
  const handleLiveUpdate = (updatedReceipt) => {
    setCurrentReceipt(prev => ({
      ...prev,
      ...updatedReceipt
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewReceipt={handleNewReceipt}
      />

      {notification && (
        <div className="no-print bg-amber-500 text-slate-950 text-center py-2 px-3 text-xs sm:text-sm font-bold shadow-md transition-all font-urdu">
          {notification}
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-5 lg:p-8">
        {activeTab === 'history' ? (
          <ReceiptList
            receipts={receipts}
            onSelectReceipt={handleSelectReceipt}
            onDeleteReceipt={handleDeleteReceipt}
          />
        ) : (
          <div>
            {/* Mobile View Toggle (Visible only on mobile/tablet < lg) */}
            <div className="lg:hidden no-print mb-3 bg-slate-800 p-1 rounded-2xl flex items-center border border-slate-700 shadow-sm">
              <button
                onClick={() => setMobileView('form')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold font-urdu transition-all ${
                  mobileView === 'form'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>فارم بھریں (Form)</span>
              </button>
              <button
                onClick={() => setMobileView('preview')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold font-urdu transition-all ${
                  mobileView === 'preview'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>پرچی کا نظارہ (Preview &amp; Print)</span>
              </button>
            </div>

            {/* Desktop: 2 Columns Side-by-Side | Mobile: Controlled by mobileView */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Form Section */}
              <div className={`lg:col-span-6 no-print ${mobileView === 'form' ? 'block' : 'hidden lg:block'}`}>
                <ReceiptForm
                  onSave={handleSaveReceipt}
                  onLiveUpdate={handleLiveUpdate}
                  onViewPreview={() => setMobileView('preview')}
                  currentReceiptNumber={selectedReceipt ? selectedReceipt.receiptNumber : ''}
                  initialData={selectedReceipt}
                  resetTrigger={formResetTrigger}
                />
              </div>

              {/* Live Receipt Preview Section */}
              <div className={`lg:col-span-6 lg:sticky lg:top-6 ${mobileView === 'preview' ? 'block' : 'hidden lg:block'}`}>
                <div className="no-print mb-2.5 flex items-center justify-between text-white px-1">
                  <span className="text-[11px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider font-urdu">
                    پرچی کا براہ راست نظارہ (Live Receipt Preview)
                  </span>
                  <span className="text-[10px] sm:text-xs bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-semibold px-2 py-0.5 rounded-full font-urdu">
                    پرنٹ کے لیے تیار
                  </span>
                </div>
                <ReceiptPreview receipt={currentReceipt} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
