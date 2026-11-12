import React from 'react';
import { Gem, PlusCircle, History, Database } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onNewReceipt }) {
  return (
    <header className="bg-slate-950 text-white shadow-xl border-b border-amber-600/40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3.5">
            <div className="bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-400 p-2.5 rounded-2xl shadow-lg text-slate-950 font-bold">
              <Gem className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-brand font-black tracking-wide text-amber-400">
                  ایم اقبال جیولرز
                </h1>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                  M Iqbal Jewellers
                </span>
              </div>
              <p className="text-xs text-slate-400 font-urdu mt-0.5">
                دلکش زیورات کا مرکز • مین بازار کنجاہ سگھرال
              </p>
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center space-x-2.5">
            {/* New Blank Receipt Button */}
            <button
              onClick={onNewReceipt}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-slate-950 shadow-md hover:shadow-lg transition-all font-urdu"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>+ نئی خالی پرچی (New)</span>
            </button>

            {/* Saved Receipts Button */}
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all font-urdu ${
                activeTab === 'history'
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/50 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>محفوظ پرچیاں (Saved)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
