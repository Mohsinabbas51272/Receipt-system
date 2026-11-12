import React, { useState } from 'react';
import { Eye, Clock, User, Phone, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/goldUnits';

export default function ReceiptList({ receipts, onSelectReceipt, onDeleteReceipt }) {
  const [deletingId, setDeletingId] = useState(null);

  if (!receipts || receipts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-700 font-urdu">کوئی رسید محفوظ نہیں ہے</h3>
        <p className="text-sm text-slate-500 mt-1 font-urdu">
          نئی رسید بنانے کے لیے اوپر "+ نئی خالی پرچی" کے بٹن پر کلک کریں۔
        </p>
      </div>
    );
  }

  const handleDeleteClick = (e, rcp) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `کیا آپ واقعی پرچی نمبر #${rcp.receiptNumber} (${rcp.customer?.name}) کو ڈیلیٹ کرنا چاہتے ہیں؟`
    );
    if (confirmed) {
      setDeletingId(rcp.id || rcp.receiptNumber);
      onDeleteReceipt(rcp);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="text-base font-bold text-slate-800 font-urdu">
            محفوظ شدہ پرچیاں (PostgreSQL Database: {receipts.length})
          </h3>
          <p className="text-xs text-slate-500 font-urdu mt-0.5">
            یہاں سے آپ پرانی پرچی دیکھ سکتے ہیں، پرنٹ کر سکتے ہیں یا ڈیلیٹ کر سکتے ہیں۔
          </p>
        </div>
        <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-2.5 py-1 rounded-full font-urdu">
          ایم اقبال جیولرز
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {receipts.map((rcp) => (
          <div
            key={rcp.id || rcp.receiptNumber}
            className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-slate-50/80 transition-colors gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-800 font-mono text-sm bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                  پرچی #{rcp.receiptNumber || rcp.id}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-mono text-slate-500">{rcp.date}</span>
                <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {rcp.goldKarat || '22K'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-800 font-semibold">
                <span className="flex items-center gap-1.5 text-base font-urdu">
                  <User className="w-4 h-4 text-slate-400" />
                  {rcp.customer?.name}
                </span>
                {rcp.customer?.phone && (
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {rcp.customer.phone}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-urdu">
                {rcp.items?.length || 0} آئٹمز • سونا ریٹ: {formatCurrency(rcp.goldRate)}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <div className="text-xs text-slate-400 uppercase font-urdu">ٹوٹل رقم</div>
                <div className="text-base font-mono font-bold text-slate-900">
                  {formatCurrency(summaryTotal(rcp))}
                </div>
                {rcp.summary?.balanceDue > 0 ? (
                  <div className="text-xs text-rose-600 font-semibold font-mono">
                    بقایا: {formatCurrency(rcp.summary?.balanceDue)}
                  </div>
                ) : (
                  <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 justify-end font-urdu">
                    <CheckCircle className="w-3 h-3" /> تمام کلیئر
                  </div>
                )}
              </div>

              {/* View / Print Button */}
              <button
                onClick={() => onSelectReceipt(rcp)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition-all font-urdu"
              >
                <Eye className="w-4 h-4" /> کھولیں / پرنٹ
              </button>

              {/* Delete Button */}
              <button
                onClick={(e) => handleDeleteClick(e, rcp)}
                disabled={deletingId === rcp.id}
                title="یہ پرچی ڈیلیٹ کریں"
                className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 font-bold text-xs px-3 py-2 rounded-xl border border-rose-200 transition-all font-urdu"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>ڈیلیٹ</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function summaryTotal(rcp) {
  return rcp.summary?.grandTotal || rcp.total_amount || 0;
}
