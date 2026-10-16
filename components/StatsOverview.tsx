'use client';

import React from 'react';
import { Home, CheckCircle2, Clock, CheckCheck, TrendingUp } from 'lucide-react';
import { Apartment } from '@/lib/types';

interface StatsOverviewProps {
  apartments: Apartment[];
  activeStatus: string;
  onSelectStatus: (status: string) => void;
}

export default function StatsOverview({
  apartments,
  activeStatus,
  onSelectStatus,
}: StatsOverviewProps) {
  const total = apartments.length;
  const available = apartments.filter((a) => a.status === 'AVAILABLE').length;
  const upcoming = apartments.filter((a) => a.status === 'UPCOMING_SOON').length;
  const deposited = apartments.filter((a) => a.status === 'DEPOSITED').length;
  const rented = apartments.filter((a) => a.status === 'RENTED').length;

  const totalValueTr = (
    apartments.reduce((sum, a) => sum + (a.status === 'AVAILABLE' ? a.priceVnd : 0), 0) /
    1000000
  ).toFixed(0);

  const stats = [
    {
      id: 'ALL',
      label: 'Tổng rổ hàng',
      value: total,
      sub: `${apartments.length} bất động sản`,
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      activeRing: 'ring-2 ring-blue-500',
    },
    {
      id: 'AVAILABLE',
      label: 'Đang trống',
      value: available,
      sub: 'Sẵn sàng dẫn khách',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      activeRing: 'ring-2 ring-emerald-500',
    },
    {
      id: 'UPCOMING_SOON',
      label: 'Sắp trống',
      value: upcoming,
      sub: 'Chuẩn bị trả phòng',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      activeRing: 'ring-2 ring-amber-500',
    },
    {
      id: 'DEPOSITED',
      label: 'Đã cọc',
      value: deposited,
      sub: 'Chờ ký hợp đồng',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      activeRing: 'ring-2 ring-purple-500',
    },
    {
      id: 'RENTED',
      label: 'Đã cho thuê',
      value: rented,
      sub: 'Đang có khách ở',
      icon: CheckCheck,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200',
      activeRing: 'ring-2 ring-slate-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s) => {
        const Icon = s.icon;
        const isActive = activeStatus === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelectStatus(isActive && s.id !== 'ALL' ? 'ALL' : s.id)}
            className={`p-3.5 sm:p-4 rounded-xl text-left bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md ${
              isActive ? `${s.activeRing} ${s.borderColor}` : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">{s.label}</span>
              <div className={`p-1.5 rounded-lg ${s.bgColor} ${s.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{s.value}</span>
              <span className="text-xs text-slate-400">căn</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">{s.sub}</p>
          </button>
        );
      })}
    </div>
  );
}
