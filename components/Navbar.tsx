'use client';

import React from 'react';
import { Building2, Plus, FolderPlus, Sparkles, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenApartmentModal: () => void;
  onOpenProjectModal: () => void;
  totalApartments: number;
}

export default function Navbar({
  onOpenApartmentModal,
  onOpenProjectModal,
  totalApartments,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 glass-header border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Rental CRM
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  <Sparkles className="w-3 h-3 text-blue-500" /> BĐS Nhà Phố & Căn Hộ
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Hệ thống quản lý rổ hàng môi giới • {totalApartments} căn đang quản lý
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenProjectModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Quản lý dự án"
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Dự Án</span>
            </button>

            <button
              onClick={onOpenApartmentModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm shadow-blue-600/20 transition-all cursor-pointer transform active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Căn Mới</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
