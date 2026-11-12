import React, { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import {
  getSuggestions,
  phoneticTransliterateWord
} from '../utils/urduTransliteration';

export default function UrduSmartInput({
  value = '',
  onChange,
  placeholder = '',
  type = 'jewellery', // 'jewellery' | 'name'
  className = '',
  disabled = false,
  required = false
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract last word currently being typed
  const getLastWordInfo = (text) => {
    // Delimiters: space, comma, plus
    const match = text.match(/([a-zA-Z0-9_\u0600-\u06FF]+)$/);
    if (match) {
      return {
        word: match[1],
        index: match.index,
        isEnglish: /^[a-zA-Z]+$/.test(match[1])
      };
    }
    return { word: '', index: text.length, isEnglish: false };
  };

  const handleInputChange = (e) => {
    const rawVal = e.target.value;
    onChange(rawVal);

    const lastInfo = getLastWordInfo(rawVal);
    if (lastInfo.word && lastInfo.isEnglish) {
      const matched = getSuggestions(lastInfo.word, type, 6);
      setSuggestions(matched);
      setShowSuggestions(matched.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Replace the last typed English word with chosen Urdu word
  const applyUrduWord = (urduWord) => {
    const lastInfo = getLastWordInfo(value);
    let newVal = '';
    if (lastInfo.word) {
      const prefix = value.substring(0, lastInfo.index);
      newVal = prefix + urduWord;
    } else {
      newVal = value + (value ? ' ' : '') + urduWord;
    }

    onChange(newVal);
    setShowSuggestions(false);

    // Keep focus
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
  };

  const handleKeyDown = (e) => {
    // 1. Navigation through suggestions dropdown
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applyUrduWord(suggestions[selectedIndex].urdu);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }

    // 2. Transliterate on Spacebar or Enter
    if (e.key === ' ' || e.key === 'Enter') {
      const lastInfo = getLastWordInfo(value);
      if (lastInfo.word && lastInfo.isEnglish) {
        e.preventDefault();
        // Check top suggestion or phonetic fallback
        const topMatch = suggestions.length > 0 ? suggestions[0].urdu : phoneticTransliterateWord(lastInfo.word);
        if (topMatch) {
          const prefix = value.substring(0, lastInfo.index);
          const newVal = prefix + topMatch + (e.key === ' ' ? ' ' : '');
          onChange(newVal);
          setShowSuggestions(false);
        }
      }
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          dir="rtl"
          className={`w-full px-3 py-2 border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-xl text-sm font-urdu outline-none transition-all shadow-sm bg-white ${className}`}
        />
      </div>

      {/* Floating Word Suggestion Dropdown (Only Suggestions) */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-2xl border border-amber-300 overflow-hidden font-urdu animate-in fade-in-50">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1.5 text-[11px] text-amber-950 font-bold border-b border-amber-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>تجویز کردہ الفاظ (منتخب کرنے کے لیے کلک کریں یا Space دبائیں):</span>
            </span>
            <span className="text-[10px] bg-amber-200/70 text-amber-950 font-mono font-bold px-1.5 py-0.5 rounded">
              EN ➔ اردو
            </span>
          </div>

          <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyUrduWord(item.urdu);
                }}
                className={`flex items-center justify-between px-3.5 py-2 cursor-pointer transition-colors ${
                  idx === selectedIndex
                    ? 'bg-amber-100 text-amber-950 font-bold'
                    : 'hover:bg-amber-50/60 text-slate-800'
                }`}
              >
                {/* Roman transliteration hint */}
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {item.roman}
                </span>

                {/* Urdu suggested word */}
                <span className="text-base font-bold text-slate-950 text-right font-urdu">
                  {item.urdu}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
