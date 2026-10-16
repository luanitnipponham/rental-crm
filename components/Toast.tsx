'use client';

import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 backdrop-blur-md text-white text-xs sm:text-sm font-medium rounded-xl shadow-xl border border-slate-700/60 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-slate-400 hover:text-white p-0.5 rounded-md transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
