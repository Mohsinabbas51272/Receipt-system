import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Scale, RotateCcw, Sparkles, Languages, Eye } from 'lucide-react';
import { TOLA_IN_GRAMS, gramsToTolaMashaRati, tolaMashaRatiToString } from '../utils/goldUnits';
import UrduSmartInput from './UrduSmartInput';

const QUICK_ITEM_TAGS = ['انگوٹھی', 'کنٹھی', 'ہار', 'بالیاں', 'کڑا', 'چین', 'ٹاپس', 'لاکٹ', 'پازیب'];

export default function ReceiptForm({
  onSave,
  onLiveUpdate,
  onViewPreview,
  currentReceiptNumber = '',
  initialData = null,
  resetTrigger = 0
}) {
  const [receiptNumber, setReceiptNumber] = useState(currentReceiptNumber || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [goldRate, setGoldRate] = useState(0);
  const [goldRateInput, setGoldRateInput] = useState('');
  const [goldKarat, setGoldKarat] = useState('');
  const [items, setItems] = useState([]);
  const [palashWeight, setPalashWeight] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');

  // Initialize or reset form
  useEffect(() => {
    if (initialData) {
      const rate = parseFloat(initialData.goldRate) || 0;
      const karat = initialData.goldKarat || '';
      const palash = initialData.palashWeight !== undefined ? initialData.palashWeight : '';
      const cust = {
        name: initialData.customer?.name || '',
        phone: initialData.customer?.phone || ''
      };
      const num = initialData.receiptNumber || '';
      const dt = initialData.date || new Date().toISOString().split('T')[0];
      const advance = initialData.summary?.paidAmount !== undefined ? initialData.summary.paidAmount : '';
      const loadedItems = (initialData.items || []).map(it => ({
        id: it.id || Date.now() + Math.random(),
        description: it.description || '',
        weight: it.netWeight || it.grossWeight || it.weight || ''
      }));

      setReceiptNumber(num);
      setDate(dt);
      setCustomer(cust);
      setGoldRate(rate);
      setGoldRateInput(rate > 0 ? String(rate) : '');
      setGoldKarat(karat);
      setPalashWeight(palash);
      setItems(loadedItems);
      setAdvanceAmount(advance);

      if (onLiveUpdate) {
        const itWeight = loadedItems.reduce((s, it) => s + (parseFloat(it.weight) || 0), 0);
        const totWeight = itWeight + (parseFloat(palash) || 0);
        const totPrice = rate > 0 ? Math.round((totWeight / TOLA_IN_GRAMS) * rate) : 0;
        const balDue = Math.max(0, totPrice - (parseFloat(advance) || 0));
        onLiveUpdate({
          receiptNumber: num,
          date: dt,
          customer: cust,
          goldRate: rate,
          goldKarat: karat,
          palashWeight: parseFloat(palash) || 0,
          items: loadedItems.map(it => ({ ...it, grossWeight: it.weight, netWeight: it.weight })),
          summary: { totalWeight: totWeight, grandTotal: totPrice, paidAmount: parseFloat(advance) || 0, balanceDue: balDue }
        });
      }
    } else {
      resetToBlank(currentReceiptNumber);
    }
  }, [resetTrigger, initialData, currentReceiptNumber]);

  const resetToBlank = (num = currentReceiptNumber) => {
    setReceiptNumber(num || '');
    setDate(new Date().toISOString().split('T')[0]);
    setCustomer({ name: '', phone: '' });
    setGoldRate(0);
    setGoldRateInput('');
    setGoldKarat('');
    setPalashWeight('');
    
    const initialItems = [
      {
        id: Date.now(),
        description: '',
        weight: ''
      }
    ];
    setItems(initialItems);
    setAdvanceAmount('');

    if (onLiveUpdate) {
      onLiveUpdate({
        receiptNumber: num || '',
        date: new Date().toISOString().split('T')[0],
        customer: { name: '', phone: '' },
        goldRate: 0,
        goldKarat: '',
        palashWeight: 0,
        items: [],
        summary: { grandTotal: 0, paidAmount: 0, balanceDue: 0 }
      });
    }
  };

  // Calculations
  const itemsWeightGrams = items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
  const palashWeightNum = parseFloat(palashWeight) || 0;
  const totalWeightGrams = itemsWeightGrams + palashWeightNum;
  const grandTotal = Math.round((totalWeightGrams / TOLA_IN_GRAMS) * (parseFloat(goldRate) || 0));
  const balanceDue = Math.max(0, grandTotal - (parseFloat(advanceAmount) || 0));
  const totalTMR = gramsToTolaMashaRati(totalWeightGrams);

  // Emit live update to preview
  const emitUpdate = (updatedState = {}) => {
    const activeItems = updatedState.items !== undefined ? updatedState.items : items;
    const activeRate = updatedState.goldRate !== undefined ? updatedState.goldRate : goldRate;
    const activeKarat = updatedState.goldKarat !== undefined ? updatedState.goldKarat : goldKarat;
    const activeCustomer = updatedState.customer !== undefined ? updatedState.customer : customer;
    const activeDate = updatedState.date !== undefined ? updatedState.date : date;
    const activeNum = updatedState.receiptNumber !== undefined ? updatedState.receiptNumber : receiptNumber;
    const activeAdvance = updatedState.advanceAmount !== undefined ? updatedState.advanceAmount : advanceAmount;
    const activePalash = updatedState.palashWeight !== undefined ? updatedState.palashWeight : palashWeight;

    const itWeight = activeItems.reduce((sum, it) => sum + (parseFloat(it.weight) || 0), 0);
    const totWeight = itWeight + (parseFloat(activePalash) || 0);
    const totPrice = Math.round((totWeight / TOLA_IN_GRAMS) * (parseFloat(activeRate) || 0));
    const balDue = Math.max(0, totPrice - (parseFloat(activeAdvance) || 0));

    if (onLiveUpdate) {
      onLiveUpdate({
        receiptNumber: activeNum,
        date: activeDate,
        customer: activeCustomer,
        goldRate: activeRate,
        goldKarat: activeKarat,
        palashWeight: parseFloat(activePalash) || 0,
        items: activeItems.map(it => ({
          ...it,
          grossWeight: it.weight,
          netWeight: it.weight
        })),
        summary: {
          itemsWeight: itWeight,
          totalWeight: totWeight,
          grandTotal: totPrice,
          paidAmount: parseFloat(activeAdvance) || 0,
          balanceDue: balDue
        }
      });
    }
  };

  const handleRateChange = (rawStr) => {
    setGoldRateInput(rawStr);
    if (rawStr.trim() === '') {
      setGoldRate(0);
      emitUpdate({ goldRate: 0 });
      return;
    }
    const parsed = parseFloat(rawStr);
    if (!isNaN(parsed) && parsed >= 0) {
      setGoldRate(parsed);
      emitUpdate({ goldRate: parsed });
    }
  };

  const handleDescriptionChange = (index, value) => {
    const updated = [...items];
    updated[index].description = value;
    setItems(updated);
    emitUpdate({ items: updated });
  };

  const appendTagToItem = (index, tag) => {
    const updated = [...items];
    const current = updated[index].description.trim();
    if (!current) {
      updated[index].description = tag;
    } else {
      updated[index].description = `${current} + ${tag}`;
    }
    setItems(updated);
    emitUpdate({ items: updated });
  };

  const handleWeightChange = (index, weightValue) => {
    const updated = [...items];
    updated[index].weight = weightValue;
    setItems(updated);
    emitUpdate({ items: updated });
  };

  const handlePalashChange = (val) => {
    setPalashWeight(val);
    emitUpdate({ palashWeight: val });
  };

  const addItemLine = () => {
    const newLine = {
      id: Date.now(),
      description: '',
      weight: ''
    };
    const updated = [...items, newLine];
    setItems(updated);
    emitUpdate({ items: updated });
  };

  const removeItemLine = (index) => {
    if (items.length === 1) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    emitUpdate({ items: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      receiptNumber: receiptNumber || '',
      date,
      customer,
      goldRate: parseFloat(goldRate) || 0,
      goldKarat: goldKarat || '',
      palashWeight: palashWeightNum,
      items: items.map(it => ({
        description: it.description || '',
        karat: goldKarat || '22K',
        weight: parseFloat(it.weight) || 0,
        grossWeight: parseFloat(it.weight) || 0,
        wasteOrStoneWeight: 0,
        netWeight: parseFloat(it.weight) || 0,
        goldRate: parseFloat(goldRate) || 0,
        makingCharges: 0,
        total: 0
      })),
      summary: {
        itemsWeight: itemsWeightGrams,
        palashWeight: palashWeightNum,
        totalWeight: totalWeightGrams,
        grandTotal,
        paidAmount: parseFloat(advanceAmount) || 0,
        balanceDue
      }
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-ui">
      {/* 1. Header Information */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200">
        <div className="flex flex-wrap justify-between items-center mb-3.5 pb-2.5 border-b border-slate-100 gap-2" dir="rtl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
            <h3 className="text-base font-bold text-slate-800 font-ui">
              رسید کی بنیادی معلومات
            </h3>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => resetToBlank()}
              title="فارم صاف کریں اور نئی خالی پرچی بنائیں"
              className="flex items-center gap-1.5 text-xs font-bold font-ui text-slate-600 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>خالی فارم</span>
            </button>

            <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-300">
              <span className="text-xs font-bold text-slate-700 font-ui">پرچی نمبر:</span>
              <input
                type="text"
                placeholder="---"
                value={receiptNumber}
                onChange={(e) => {
                  setReceiptNumber(e.target.value);
                  emitUpdate({ receiptNumber: e.target.value });
                }}
                className="w-16 px-1.5 py-0.5 text-center font-mono font-black text-amber-950 bg-white border border-amber-300 rounded text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* Helpful Transliteration Tip - Zero text mixing */}
        <div className="mb-4 text-xs font-ui text-amber-950 bg-amber-50/90 border border-amber-200 rounded-xl p-3 flex items-start gap-2 shadow-2xs leading-relaxed" dir="rtl">
          <Languages className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-amber-900">اردو الفاظ کی خودکار تجاویز: </span>
            <span>نام یا زیور انگریزی میں لکھیں جیسے </span>
            <span dir="ltr" className="inline-block bg-white px-1.5 py-0.5 rounded border border-amber-300 font-mono font-bold text-amber-900 mx-1">
              angothi
            </span>
            <span>یا</span>
            <span dir="ltr" className="inline-block bg-white px-1.5 py-0.5 rounded border border-amber-300 font-mono font-bold text-amber-900 mx-1">
              ali
            </span>
            <span>تو تجاویز کی فہرست آ جائے گی۔ منتخب کرنے کے لیے لفظ پر کلک کریں یا اسپیس دبائیں!</span>
          </div>
        </div>

        {/* 4 Fields Grid: Pure Urdu labels, zero bidi collision */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5" dir="rtl">
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-ui">
              گاہک کا نام <span className="text-rose-500">*</span>
            </label>
            <UrduSmartInput
              type="name"
              required
              placeholder="مثلاً: محمد احمد خان"
              value={customer.name}
              onChange={(val) => {
                const updated = { ...customer, name: val };
                setCustomer(updated);
                emitUpdate({ customer: updated });
              }}
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-ui">
              رابطہ نمبر
            </label>
            <input
              type="text"
              placeholder="0300-1234567"
              value={customer.phone}
              onChange={(e) => {
                const updated = { ...customer, phone: e.target.value };
                setCustomer(updated);
                emitUpdate({ customer: updated });
              }}
              dir="ltr"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono text-left focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 bg-white"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-ui">
              تاریخ
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                emitUpdate({ date: e.target.value });
              }}
              dir="ltr"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 bg-white"
            />
          </div>

          {/* Gold Karat */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-ui">
              کیریٹ سونا
            </label>
            <select
              value={goldKarat}
              onChange={(e) => {
                setGoldKarat(e.target.value);
                emitUpdate({ goldKarat: e.target.value });
              }}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-amber-950 bg-amber-50/50 outline-none"
            >
              <option value="">-- منتخب کریں --</option>
              <option value="24K">24K (خالص پکہ سونا)</option>
              <option value="22K">22K (معیاری زیورات)</option>
              <option value="21K">21K (راجپوت گولڈ)</option>
              <option value="18K">18K</option>
            </select>
          </div>
        </div>

        {/* Gold Rate Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-amber-50/70 p-3 rounded-xl border border-amber-200/70" dir="rtl">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-sm font-bold text-slate-800 font-ui">
              سونا ریٹ فی تولہ:
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end" dir="ltr">
            <span className="text-sm text-slate-600 font-bold font-mono">Rs</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={goldRateInput}
              onChange={(e) => handleRateChange(e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim() === '') {
                  setGoldRate(0);
                  setGoldRateInput('');
                  emitUpdate({ goldRate: 0 });
                } else {
                  const parsed = parseFloat(e.target.value);
                  if (isNaN(parsed)) {
                    setGoldRateInput(goldRate > 0 ? String(goldRate) : '');
                  }
                }
              }}
              className="w-36 sm:w-44 px-3 py-2 border border-amber-300 rounded-lg text-base font-mono font-bold text-amber-950 bg-white focus:ring-2 focus:ring-amber-400 outline-none text-right"
            />
          </div>
        </div>
      </div>

      {/* 2. Simplified Jewellery Items: Name & Weight */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3.5" dir="rtl">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 font-ui">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
              <span>زیورات کی تفصیل و وزن (آئٹم کا نام اور وزن)</span>
            </h3>
            <p className="text-xs text-slate-500 font-ui mt-0.5">
              ایک لائن پر ایک یا زیادہ چیزیں لکھیں (مثلاً: <strong>انگوٹھی + کنٹھی + ہار</strong>) اور وزن لکھیں۔
            </p>
          </div>

          <button
            type="button"
            onClick={addItemLine}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all font-ui active:scale-95"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>نئی لائن شامل کریں</span>
          </button>
        </div>

        {/* Items Lines */}
        <div className="space-y-3.5">
          {items.map((item, index) => {
            const tmr = gramsToTolaMashaRati(item.weight);
            return (
              <div
                key={item.id || index}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:border-amber-400 transition-colors"
              >
                <div className="flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center">
                  {/* Item Description with Numbering */}
                  <div className="w-full md:col-span-7" dir="rtl">
                    <label className="text-xs font-bold text-slate-700 font-ui flex items-center gap-1.5 mb-1.5">
                      <span className="bg-amber-100 text-amber-950 font-bold px-1.5 py-0.5 rounded text-xs font-mono">
                        {index + 1}۔
                      </span>
                      <span>زیورات کا نام</span>
                    </label>
                    <UrduSmartInput
                      type="jewellery"
                      required
                      value={item.description}
                      onChange={(val) => handleDescriptionChange(index, val)}
                      placeholder="مثلاً: انگوٹھی + کنٹھی + ہار"
                    />

                    {/* Quick helper buttons to append items */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2" dir="rtl">
                      <span className="text-xs text-slate-400 font-ui shrink-0">شامل کریں:</span>
                      {QUICK_ITEM_TAGS.map((tag, tIdx) => (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => appendTagToItem(index, tag)}
                          className="text-xs font-ui bg-white hover:bg-amber-100 hover:text-amber-950 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors active:scale-95"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weight in Grams & Delete Button */}
                  <div className="w-full md:col-span-5 flex items-end gap-2.5 pt-1 md:pt-0" dir="rtl">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 font-ui">
                        وزن گرام <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        required
                        placeholder="0.000"
                        value={item.weight || ''}
                        onChange={(e) => handleWeightChange(index, e.target.value)}
                        dir="ltr"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-base font-mono font-bold text-slate-900 bg-white focus:ring-1 focus:ring-amber-500 outline-none text-left"
                      />
                      <div className="text-xs font-mono text-amber-900 mt-1 font-semibold" dir="ltr">
                        {tolaMashaRatiToString(tmr)}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => removeItemLine(index)}
                      disabled={items.length === 1}
                      title="لائن ڈیلیٹ کریں"
                      className="p-2.5 text-slate-400 hover:text-rose-600 disabled:opacity-20 transition-colors rounded-xl hover:bg-rose-50 border border-slate-200 shrink-0 mb-5 md:mb-0 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. DEDICATED PALASH / POLISH WEIGHT ROW */}
        <div className="mt-4 pt-3.5 border-t border-slate-200 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80" dir="rtl">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 items-center">
            <div className="sm:col-span-7">
              <label className="text-xs sm:text-sm font-bold text-amber-950 font-ui flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>پالش کا وزن</span>
              </label>
              <p className="text-xs text-amber-800/90 font-ui mt-0.5">
                یہ وزن زیورات کے کل وزن میں شامل کر کے کل قیمت نکالی جائے گی۔
              </p>
            </div>

            <div className="sm:col-span-5 flex items-center gap-2" dir="ltr">
              <span className="text-xs font-bold text-amber-900 font-ui shrink-0">گرام</span>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.001"
                  placeholder="پالش وزن (مثلاً: 0.250)"
                  value={palashWeight}
                  onChange={(e) => handlePalashChange(e.target.value)}
                  className="w-full px-3.5 py-2 border border-amber-300 rounded-xl text-base font-mono font-bold text-amber-950 bg-white focus:ring-1 focus:ring-amber-500 outline-none text-right"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. TOTAL WEIGHT, TOTAL PRICE, JAMAH RAKAM & BAQAYA */}
        <div className="mt-4 space-y-2.5">
          {/* Line 1: Total Weight with Palash */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2 text-sm font-mono flex-wrap" dir="ltr">
              <span className="text-white font-black">{totalWeightGrams.toFixed(3)} g</span>
              <span className="text-amber-300 font-bold">({tolaMashaRatiToString(totalTMR)})</span>
              {palashWeightNum > 0 && (
                <span className="text-slate-300 text-xs bg-slate-800 px-2 py-0.5 rounded">
                  آئٹمز: {itemsWeightGrams.toFixed(3)}g + پالش: {palashWeightNum.toFixed(3)}g
                </span>
              )}
            </div>
            <div className="text-xs sm:text-sm font-ui font-bold text-amber-400 self-end sm:self-auto" dir="rtl">
              {palashWeightNum > 0 ? 'کل وزن بمعہ پالش' : 'کل وزن'}
            </div>
          </div>

          {/* Line 2: Total Calculated Price */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-900 flex justify-between items-center gap-2">
            <div className="text-lg sm:text-xl font-mono font-black text-amber-950" dir="ltr">
              Rs {Math.round(grandTotal).toLocaleString()}
            </div>
            <div className="text-sm font-ui font-black text-amber-950" dir="rtl">
              کل قیمت
            </div>
          </div>

          {/* Line 3: Jamah Rakam Input */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 flex justify-between items-center gap-2">
            <div className="w-36 sm:w-48 max-w-[60%]" dir="ltr">
              <input
                type="number"
                placeholder="0"
                value={advanceAmount || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setAdvanceAmount(val);
                  emitUpdate({ advanceAmount: val });
                }}
                className="w-full px-3.5 py-2 bg-white border border-emerald-400 rounded-lg text-base font-mono font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none text-right"
              />
            </div>
            <label className="text-sm font-ui font-bold text-emerald-950 whitespace-nowrap" dir="rtl">
              جمع رقم
            </label>
          </div>

          {/* Line 4: Bold Line and Baqaya */}
          <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-slate-900 text-slate-950 flex justify-between items-center gap-2 shadow-xs">
            <div className="text-xl sm:text-2xl font-mono font-black text-rose-800" dir="ltr">
              Rs {Math.round(balanceDue).toLocaleString()}
            </div>
            <div className="text-base font-ui font-black text-slate-950 whitespace-nowrap" dir="rtl">
              بقایا
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5">
          {onViewPreview && (
            <button
              type="button"
              onClick={onViewPreview}
              className="lg:hidden flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-ui transition-colors"
            >
              <Eye className="w-4 h-4 text-amber-600" />
              <span>پرچی کا نظارہ دیکھیں (Preview)</span>
            </button>
          )}

          <button
            type="submit"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-slate-950 font-black py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-ui active:scale-95"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>رسید محفوظ کریں</span>
          </button>
        </div>
      </div>
    </form>
  );
}
