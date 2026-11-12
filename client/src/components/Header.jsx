import React from 'react';
import { Gem, PlusCircle, History } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onNewReceipt }) {
  return (
    <header className="bg-slate-950 text-white shadow-xl border-b border-amber-600/40 no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-0 sm:h-20 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-400 p-2 sm:p-2.5 rounded-2xl shadow-lg text-slate-950 font-bold shrink-0">
                <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-brand font-black tracking-wide text-amber-400">
                    ایم اقبال جیولرز
                  </h1>
                  <span className="text-[10px] sm:text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 sm:px-2 py-0.5 rounded-full font-mono">
                    M Iqbal Jewellers
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 font-urdu mt-0.5">
                  دلکش زیورات کا مرکز • مین بازار کٹھہ سگھرال
                </p>
              </div>
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-stretch sm:justify-end">
            {/* New Blank Receipt Button */}
            <button
              onClick={onNewReceipt}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-slate-950 shadow-md hover:shadow-lg transition-all font-urdu active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-950 shrink-0" />
              <span className="whitespace-nowrap">+ نئی خالی پرچی</span>
            </button>

            {/* Saved Receipts Button */}
            <button
              onClick={() => setActiveTab(activeTab === 'history' ? 'create' : 'history')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all font-urdu active:scale-95 ${
                activeTab === 'history'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">محفوظ پرچیاں</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
