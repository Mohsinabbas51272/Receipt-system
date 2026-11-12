import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ReceiptForm from './components/ReceiptForm';
import ReceiptPreview from './components/ReceiptPreview';
import ReceiptList from './components/ReceiptList';
import { getReceipts, createReceipt, updateReceipt, deleteReceipt } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'history'
  const [receipts, setReceipts] = useState([]);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [formResetTrigger, setFormResetTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');

  // Fetch receipts from PostgreSQL backend on mount
  useEffect(() => {
    fetchReceipts();
    // Start with a completely blank receipt on launch!
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

  // Compute next receipt number
  const computeNextReceiptNumber = (list = receipts) => {
    if (!list || list.length === 0) return '';
    const nums = list
      .map(r => parseInt(r.receiptNumber))
      .filter(n => !isNaN(n));
    if (nums.length === 0) return '';
    return `${Math.max(...nums) + 1}`;
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
    showNotification('✨ نئی خالی پرچی تیار ہے!');
  };

  // Save or update receipt in PostgreSQL database
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
      showNotification('✅ پرچی ڈیٹابیس میں کامیابی کے ساتھ محفوظ ہو گئی!');
      setActiveTab('create');
    } catch (err) {
      console.error('Error saving receipt:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      showNotification(`⚠️ پرچی محفوظ کرنے میں مسئلہ: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete receipt from PostgreSQL database
  const handleDeleteReceipt = async (targetReceipt) => {
    // Always use numeric DB id for deletion — never receipt_number to avoid bulk deletes
    const id = targetReceipt?.id;
    try {
      if (id) {
        await deleteReceipt(id);
      }
    } catch (err) {
      console.warn('Delete API warning:', err.message);
    }

    // Remove ONLY by unique numeric DB id from local state
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
        <div className="no-print bg-amber-500 text-slate-950 text-center py-2 px-4 text-sm font-bold shadow-md transition-all font-urdu">
          {notification}
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'history' ? (
          <ReceiptList
            receipts={receipts}
            onSelectReceipt={handleSelectReceipt}
            onDeleteReceipt={handleDeleteReceipt}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Section */}
            <div className="lg:col-span-6 no-print">
              <ReceiptForm
                onSave={handleSaveReceipt}
                onLiveUpdate={handleLiveUpdate}
                currentReceiptNumber={selectedReceipt ? selectedReceipt.receiptNumber : ''}
                initialData={selectedReceipt}
                resetTrigger={formResetTrigger}
              />
            </div>

            {/* Live Receipt Preview Section (Exact Pad) */}
            <div className="lg:col-span-6 sticky top-6">
              <div className="no-print mb-3 flex items-center justify-between text-white">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-urdu">
                  پرچی کا براہ راست نظارہ (Live Receipt Preview)
                </span>
                <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-semibold px-2.5 py-0.5 rounded-full font-urdu">
                  پرنٹ کے لیے تیار
                </span>
              </div>
              <ReceiptPreview receipt={currentReceipt} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
