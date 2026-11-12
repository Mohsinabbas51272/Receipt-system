import React, { useState } from 'react';
import { Printer, User, Store, Copy } from 'lucide-react';
import {
  formatCurrency,
  gramsToTolaMashaRati,
  tolaMashaRatiToString
} from '../utils/goldUnits';

export default function ReceiptPreview({ receipt }) {
  const [copyType, setCopyType] = useState('customer');

  if (!receipt) {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 text-center text-slate-400 font-urdu">
        رسید کی معلومات درج کریں تا کہ پرچی تیار ہو سکے۔
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Action / View Switcher Bar (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5 no-print bg-slate-800/95 p-2.5 sm:p-3 rounded-2xl border border-slate-700 shadow-md">
        <div className="grid grid-cols-3 sm:flex items-center gap-1 sm:gap-1.5">
          {/* Customer Copy */}
          <button
            onClick={() => setCopyType('customer')}
            className={`flex items-center justify-center gap-1 text-[11px] sm:text-xs font-urdu px-2 sm:px-3 py-1.5 rounded-xl font-bold transition-all ${
              copyType === 'customer'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">گاہک کاپی</span>
          </button>

          {/* Jeweller Shop Copy */}
          <button
            onClick={() => setCopyType('jeweller')}
            className={`flex items-center justify-center gap-1 text-[11px] sm:text-xs font-urdu px-2 sm:px-3 py-1.5 rounded-xl font-bold transition-all ${
              copyType === 'jeweller'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Store className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">زرگر کاپی</span>
          </button>

          {/* Both Copies */}
          <button
            onClick={() => setCopyType('both')}
            className={`flex items-center justify-center gap-1 text-[11px] sm:text-xs font-urdu px-2 sm:px-3 py-1.5 rounded-xl font-bold transition-all ${
              copyType === 'both'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Copy className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">دونوں کاپیاں</span>
          </button>
        </div>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-slate-950 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black shadow-md hover:shadow-xl transition-all font-urdu active:scale-95"
        >
          <Printer className="w-4 h-4 text-slate-950 shrink-0" />
          <span>پرنٹ رسید (Print)</span>
        </button>
      </div>

      {/* PRINT CONTAINER */}
      <div id="printable-receipt" className="w-full">
        {copyType === 'both' ? (
          <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
            {/* Copy 1: Customer Copy */}
            <div className="w-full max-w-[480px] mx-auto">
              <SingleReceiptCard receipt={receipt} isJewellerCopy={false} />
            </div>

            {/* Copy 2: Jeweller Copy */}
            <div className="w-full max-w-[480px] mx-auto">
              <SingleReceiptCard receipt={receipt} isJewellerCopy={true} />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[480px] mx-auto">
            <SingleReceiptCard
              receipt={receipt}
              isJewellerCopy={copyType === 'jeweller'}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable single receipt card component with progressive live writing
function SingleReceiptCard({ receipt, isJewellerCopy = false }) {
  const {
    customer = {},
    items = [],
    summary = {},
    date = '',
    receiptNumber = '',
    goldRate = 0,
    goldKarat = '',
    palashWeight = 0
  } = receipt || {};

  // ONLY items that user has actually typed (either name or weight)
  const activeItems = (items || []).filter(
    it => (it.description && it.description.trim() !== '') || (parseFloat(it.weight || it.netWeight || it.grossWeight) > 0)
  );

  const itemsWeight = activeItems.reduce(
    (sum, it) => sum + (parseFloat(it.weight || it.netWeight || it.grossWeight) || 0),
    0
  );
  const palash = parseFloat(palashWeight) || 0;
  const totalWeight = itemsWeight + palash;

  const tmrTotal = gramsToTolaMashaRati(totalWeight);
  const tmrPalash = gramsToTolaMashaRati(palash);

  // Progressive calculation conditions:
  const rateNum = parseFloat(goldRate) || 0;
  const hasTotalPrice = totalWeight > 0 && rateNum > 0;
  const calculatedGrandTotal = summary?.grandTotal !== undefined && summary?.grandTotal !== 0
    ? summary.grandTotal
    : (hasTotalPrice ? Math.round((totalWeight / 11.6638) * rateNum) : 0);

  const paidAmount = parseFloat(summary?.paidAmount) || 0;
  const hasPaid = paidAmount > 0;
  const balanceDue = Math.max(0, calculatedGrandTotal - paidAmount);

  const hasPalash = palash > 0;
  const hasTotalWeight = totalWeight > 0;
  const totalWeightLabel = hasPalash ? 'کل وزن بمعہ پالش' : 'کل وزن';

  // Calculate used lines dynamically based on what is actually present
  const TOTAL_LINES = 11;
  let usedLines = activeItems.length;
  if (hasPalash) usedLines += 1;
  if (hasTotalWeight) usedLines += 1;
  if (calculatedGrandTotal > 0) usedLines += 1;
  if (hasPaid) usedLines += 1;
  if (calculatedGrandTotal > 0) usedLines += 1;

  const emptyLinesCount = Math.max(0, TOTAL_LINES - usedLines);

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden text-slate-900 border border-slate-300 font-sans min-h-[640px] relative w-full">
      {/* ================= 1. HEADER BANNER ================= */}
      <div className="bg-gradient-to-r from-[#6b0f1a] via-[#851622] to-[#5a0c14] text-white relative border-b-2 border-amber-400">
        <div className="absolute inset-x-2 top-1 border-t border-amber-400/40"></div>
        <div className="absolute inset-x-2 bottom-1 border-b border-amber-400/40"></div>

        <div className="flex justify-between items-center relative z-10 py-3 sm:py-3.5 px-2.5 sm:px-3.5 gap-2">
          {/* Left: Copy Badge & Jewellery Badge */}
          <div className="flex flex-col items-center justify-center gap-1.5 flex-shrink-0 w-20 sm:w-24">
            <span className="text-[9px] sm:text-[10px] font-urdu font-bold bg-amber-400/20 text-amber-200 border border-amber-400/40 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap shadow-2xs">
              {isJewellerCopy ? 'زرگر ریکارڈ کاپی' : 'گاہک کاپی'}
            </span>

            <div className="w-full flex flex-col items-center justify-center p-1 bg-black/30 rounded-lg border border-amber-400/40 shadow-inner">
              <div className="flex items-center justify-center space-x-1 mb-0.5">
                <span className="text-sm sm:text-base">💍</span>
                <span className="text-base sm:text-lg text-yellow-400">👑</span>
                <span className="text-sm sm:text-base">✨</span>
              </div>
              <div className="text-[7.5px] sm:text-[8px] uppercase tracking-wider text-amber-200 font-bold text-center leading-tight">
                21K &amp; 22K Gold
              </div>
            </div>
          </div>

          {/* Right: Urdu Brand Info */}
          <div className="text-right flex-1 pr-1 sm:pr-2 flex flex-col justify-center gap-0.5 sm:gap-1 min-w-0">
            {/* Tagline */}
            <div className="text-[10px] sm:text-[11px] text-amber-300 font-urdu tracking-wide leading-normal">
              دلکش زیورات کا مرکز
            </div>

            {/* Main Brand Name */}
            <h2 className="text-xl sm:text-[26px] font-brand font-black text-amber-300 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight sm:leading-normal truncate">
              ایم اقبال جیولرز
            </h2>

            {/* Contact Numbers */}
            <div className="space-y-0.5 text-[9px] sm:text-[10px] text-amber-100 font-urdu leading-normal">
              <div className="flex items-center justify-end gap-1 sm:gap-1.5 truncate">
                <span className="font-mono text-amber-200 font-bold text-[9px] sm:text-[10px]">0301-6345657</span>
                <span className="text-emerald-400 font-bold text-xs">✆</span>
                <span className="truncate">ظفر اقبال راجپوت زرگر</span>
              </div>
              <div className="flex items-center justify-end gap-1 sm:gap-1.5 truncate">
                <span className="font-mono text-amber-200 font-bold text-[9px] sm:text-[10px]">0302-6343557</span>
                <span className="text-emerald-400 font-bold text-xs">✆</span>
                <span className="truncate">احمد اقبال راجپوت زرگر</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. INFORMATION CARD (معلومات کارڈ) ================= */}
      {/* Engineered with exact 3-column layout and responsive typography so fields NEVER mix or collide */}
      <div className="px-2.5 sm:px-4 pt-2.5 sm:pt-3 pb-1">
        <div className="bg-amber-50/60 rounded-xl border border-amber-200/90 p-2 sm:p-2.5 shadow-2xs font-urdu text-slate-900">
          {/* Row 1: Tareekh (Left), Receipt Number (Center), Customer Name (Right) - 3 Columns */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 items-center pb-2 border-b border-amber-200/80">
            {/* Col 1 (Left): Tareekh (Value on Left, Text on Right) */}
            <div className="flex items-center justify-start gap-1 min-w-0">
              <span className="font-mono text-[10px] sm:text-xs font-bold text-slate-900 truncate">
                {date || new Date().toISOString().split('T')[0]}
              </span>
              <span className="text-slate-700 text-[10px] sm:text-xs font-semibold shrink-0" dir="rtl">تاریخ:</span>
            </div>

            {/* Col 2 (Center): Receipt Number (Value on Left, Text on Right) */}
            <div className="flex items-center justify-center min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 bg-white px-1.5 sm:px-2 py-0.5 rounded-md border border-amber-300 shadow-2xs">
                {receiptNumber ? (
                  <span className="font-mono font-black text-xs sm:text-sm text-slate-950">
                    {receiptNumber}
                  </span>
                ) : (
                  <span className="font-mono text-xs sm:text-sm text-slate-300">
                    ____
                  </span>
                )}
                <span className="text-[9.5px] sm:text-[11px] text-amber-900 font-bold shrink-0" dir="rtl">پرچی نمبر:</span>
              </div>
            </div>

            {/* Col 3 (Right): Customer Name (Value on Left, Text on Right) */}
            <div className="flex items-center justify-end gap-1 min-w-0">
              <span className="font-bold text-slate-950 text-xs sm:text-sm text-right leading-tight truncate">
                {customer?.name?.trim() ? customer.name : '____'}
              </span>
              <span className="text-slate-700 text-[10px] sm:text-xs font-bold shrink-0" dir="rtl">نام:</span>
            </div>
          </div>

          {/* Row 2: Sona Rate (Left), Karat Sona (Center), Contact Number (Right) - 3 Columns */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 items-center pt-2">
            {/* Col 1 (Left): Sona Rate (Value on Left, Text on Right) */}
            <div className="flex items-center justify-start gap-1 min-w-0">
              <span className="font-mono text-[10px] sm:text-xs font-bold text-amber-900 truncate">
                {rateNum > 0 ? formatCurrency(rateNum) : '____'}
              </span>
              <span className="text-slate-700 text-[9.5px] sm:text-xs font-semibold shrink-0" dir="rtl">سونا ریٹ:</span>
            </div>

            {/* Col 2 (Center): Karat Sona (Value on Left, Text on Right) */}
            <div className="flex items-center justify-center gap-1 min-w-0">
              {goldKarat ? (
                <span className="font-bold text-[10px] sm:text-xs text-amber-900 font-mono bg-amber-100 px-1.5 sm:px-2 py-0.5 rounded border border-amber-300">
                  {goldKarat}
                </span>
              ) : (
                <span className="font-mono text-[10px] sm:text-xs text-slate-400 px-1.5 py-0.5 border border-dashed border-slate-300 rounded">
                  ____
                </span>
              )}
              <span className="text-slate-700 text-[9.5px] sm:text-xs font-semibold shrink-0" dir="rtl">کیریٹ سونا:</span>
            </div>

            {/* Col 3 (Right): Contact Number (Value on Left, Text on Right) */}
            <div className="flex items-center justify-end gap-1 min-w-0">
              <span className="font-mono text-[10px] sm:text-xs font-bold text-slate-900 truncate">
                {customer?.phone?.trim() ? customer.phone : '____'}
              </span>
              <span className="text-slate-700 text-[9.5px] sm:text-xs font-semibold shrink-0" dir="rtl">رابطہ نمبر:</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. TAFSEEL / JEWELLERY TABLE HEADER ================= */}
      <div className="px-2.5 sm:px-4 pt-1 pb-0.5">
        <div className="flex justify-between items-center py-1 px-2 bg-amber-100/80 rounded-lg border border-amber-300/80 shadow-2xs">
          {/* Left: Tola Masha Rati Column Headers */}
          <div className="flex items-center text-center font-urdu font-bold text-[11px] sm:text-xs text-slate-800">
            {isJewellerCopy && (
              <div className="w-[38px] sm:w-[46px] border-r border-amber-300 text-[9px] sm:text-[10px] font-mono font-bold">
                گرام
              </div>
            )}
            <div className="w-[32px] sm:w-[38px] border-r border-amber-300">تولہ</div>
            <div className="w-[32px] sm:w-[38px] border-r border-amber-300">ماشہ</div>
            <div className="w-[32px] sm:w-[38px]">رتی</div>
          </div>

          {/* Right: Tafseel Title */}
          <div className="font-urdu font-bold text-xs text-amber-950 flex items-center gap-1" dir="rtl">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            <span>تفصیل زیورات</span>
          </div>
        </div>
      </div>

      {/* ================= 4. RULED MEMO PAD BODY ================= */}
      <div className="relative px-2.5 sm:px-4 py-1" style={{ minHeight: '340px' }}>
        {/* Faint Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none">
          <div className="text-center">
            <div className="text-7xl sm:text-8xl font-serif font-black tracking-tight text-slate-900">MI</div>
            <div className="text-[10px] sm:text-xs font-serif font-bold uppercase tracking-widest text-slate-900 mt-1">
              M IQBAL JEWELLERS
            </div>
          </div>
        </div>

        {/* Ruled lines */}
        <div className="relative z-10 space-y-0 text-slate-900 font-urdu">
          {/* 1. Jewellery Items */}
          {activeItems.map((item, idx) => {
            const weightVal = item.weight || item.netWeight || item.grossWeight || 0;
            const tmr = gramsToTolaMashaRati(weightVal);

            return (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-slate-300 text-xs min-h-[32px] py-1 px-1.5 sm:px-2 text-slate-900"
              >
                {/* Far Left: Numbers directly under Tola, Masha, Rati */}
                {Number(weightVal) > 0 ? (
                  <div className="flex items-center text-center font-mono text-[11px] sm:text-xs font-black text-slate-950">
                    {isJewellerCopy && (
                      <div className="w-[38px] sm:w-[46px] text-slate-700 text-[9px] sm:text-[10px] truncate border-r border-slate-200">
                        {Number(weightVal).toFixed(2)}
                      </div>
                    )}
                    <div className="w-[32px] sm:w-[38px]">{tmr.tola}</div>
                    <div className="w-[32px] sm:w-[38px]">{tmr.masha}</div>
                    <div className="w-[32px] sm:w-[38px]">{Number(tmr.rati)}</div>
                  </div>
                ) : (
                  <div className={isJewellerCopy ? "w-[134px] sm:w-[160px]" : "w-[96px] sm:w-[114px]"}></div>
                )}

                {/* Far Right: Item description */}
                <div className="flex-1 text-right pl-2 sm:pl-4 min-w-0" dir="rtl">
                  <span className="font-mono font-black text-slate-950 text-xs ml-1 inline-block">
                    {idx + 1}۔
                  </span>
                  <span className="font-bold text-slate-950 font-urdu text-[12.5px] sm:text-[13.5px] leading-snug break-words">
                    {item.description}
                  </span>
                </div>
              </div>
            );
          })}

          {/* 2. Separate Line for Palash */}
          {hasPalash && (
            <div className="flex items-center justify-between border-b border-slate-300 text-xs min-h-[30px] py-1 px-1.5 sm:px-2 bg-amber-50/40 text-slate-900">
              <div className="flex items-center text-center font-mono text-[11px] sm:text-xs font-bold text-amber-950">
                {isJewellerCopy && (
                  <div className="w-[38px] sm:w-[46px] text-amber-900 text-[9px] sm:text-[10px] truncate border-r border-amber-200">
                    +{Number(palash).toFixed(2)}
                  </div>
                )}
                <div className="w-[32px] sm:w-[38px]">{tmrPalash.tola}</div>
                <div className="w-[32px] sm:w-[38px]">{tmrPalash.masha}</div>
                <div className="w-[32px] sm:w-[38px]">{Number(tmrPalash.rati)}</div>
              </div>

              <div className="flex-1 text-right pl-2 sm:pl-4 font-urdu text-[12px] sm:text-[13px] font-bold text-amber-950" dir="rtl">
                <span>پالش کا وزن</span>
              </div>
            </div>
          )}

          {/* 3. Total Weight Line */}
          {hasTotalWeight && (
            <div className="flex items-center justify-between border-b border-slate-300 text-xs min-h-[30px] py-1 px-1.5 sm:px-2 bg-amber-50/50 font-urdu">
              <div className="flex items-center text-center font-mono text-[11px] sm:text-xs font-black text-slate-950 bg-amber-100/90 rounded border border-amber-300 py-0.5">
                {isJewellerCopy && (
                  <div className="w-[38px] sm:w-[46px] text-slate-950 text-[9px] sm:text-[10px] font-bold truncate border-r border-amber-300">
                    {totalWeight.toFixed(2)}
                  </div>
                )}
                <div className="w-[32px] sm:w-[38px]">{tmrTotal.tola}</div>
                <div className="w-[32px] sm:w-[38px]">{tmrTotal.masha}</div>
                <div className="w-[32px] sm:w-[38px]">{Number(tmrTotal.rati)}</div>
              </div>

              <div className="flex-1 text-right pl-2 sm:pl-4 font-urdu text-[12px] sm:text-[13px] font-bold text-slate-900" dir="rtl">
                <span>{totalWeightLabel}</span>
              </div>
            </div>
          )}

          {/* 4. Total Price Line */}
          {calculatedGrandTotal > 0 && (
            <div className="flex items-center justify-between border-t-2 border-slate-800 border-b border-slate-300 text-xs min-h-[32px] py-1 px-1.5 sm:px-2 bg-amber-100/70 font-urdu">
              <div className="font-mono font-black text-xs sm:text-sm text-amber-950 whitespace-nowrap">
                {formatCurrency(calculatedGrandTotal)}
              </div>

              <div className="flex-1 text-right pl-2 sm:pl-4 font-urdu text-[12px] sm:text-[13px] font-black text-amber-950" dir="rtl">
                <span>کل قیمت</span>
              </div>
            </div>
          )}

          {/* 5. Jamah Rakam Line */}
          {hasPaid && (
            <div className="flex items-center justify-between border-b border-slate-300 text-xs min-h-[30px] py-1 px-1.5 sm:px-2 bg-emerald-50/40 font-urdu">
              <div className="font-mono font-bold text-[11px] sm:text-xs text-emerald-800 whitespace-nowrap">
                {formatCurrency(paidAmount)}
              </div>

              <div className="flex-1 text-right pl-2 sm:pl-4 font-urdu text-[12px] sm:text-[13px] font-bold text-emerald-950" dir="rtl">
                <span>جمع رقم</span>
              </div>
            </div>
          )}

          {/* 6. Baqaya Line */}
          {calculatedGrandTotal > 0 && (
            <div className="flex items-center justify-between border-t-2 border-slate-900 border-b-2 border-slate-900 text-xs min-h-[34px] py-1 px-1.5 sm:px-2 bg-rose-50/60 font-urdu">
              <div className="font-mono font-black text-sm sm:text-base text-rose-800 whitespace-nowrap">
                {formatCurrency(balanceDue)}
              </div>

              <div className="flex-1 text-right pl-2 sm:pl-4 font-urdu text-[13px] sm:text-[14px] font-black text-rose-950" dir="rtl">
                <span>بقایا</span>
              </div>
            </div>
          )}

          {/* Empty horizontal ruled lines to complete the pad look */}
          {Array.from({ length: emptyLinesCount }).map((_, i) => (
            <div
              key={`empty-line-${i}`}
              className="border-b border-slate-300 h-7"
            ></div>
          ))}
        </div>
      </div>

      {/* ================= 4. SIGNATURE ================= */}
      <div className="px-3 sm:px-5 pt-2.5 sm:pt-3 pb-2.5 sm:pb-3 font-urdu text-xs sm:text-[13px] bg-white border-t border-slate-300">
        <div className="flex justify-end items-center">
          <div className="text-center pr-2 sm:pr-4">
            <div className="border-b border-slate-400 w-24 sm:w-32 mx-auto mb-1"></div>
            <div className="text-xs text-slate-700 font-urdu font-medium">دستخط</div>
          </div>
        </div>
      </div>

      {/* ================= 5. FOOTER BANNER ================= */}
      <div className="bg-[#640d14] text-amber-200 text-center py-2 px-2.5 sm:px-3 border-t-2 border-amber-400 font-urdu text-[11px] sm:text-xs font-semibold tracking-wide">
        نزد جامع مسجد فیضان مدینہ، مین بازار کٹھہ سگھرال
      </div>
    </div>
  );
}
