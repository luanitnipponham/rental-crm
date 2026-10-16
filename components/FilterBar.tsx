'use client';

import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, Dog, RotateCcw } from 'lucide-react';
import { FilterState, Project } from '@/lib/types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  projects: Project[];
  totalResults: number;
}

export default function FilterBar({
  filters,
  setFilters,
  projects,
  totalResults,
}: FilterBarProps) {
  // Extract unique districts
  const districts = Array.from(new Set(projects.map((p) => p.district))).filter(Boolean);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'ALL' ||
    filters.projectId !== 'ALL' ||
    filters.district !== 'ALL' ||
    filters.bedrooms !== 'ALL' ||
    filters.priceRange !== 'ALL' ||
    filters.allowPetOnly;

  const handleReset = () => {
    setFilters({
      search: '',
      status: 'ALL',
      projectId: 'ALL',
      district: 'ALL',
      bedrooms: 'ALL',
      priceRange: 'ALL',
      furniture: 'ALL',
      allowPetOnly: false,
      sortBy: 'newest',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-4">
      {/* Top Row: Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Tìm theo mã căn, dự án, tên chủ nhà, số ĐT, pass cửa..."
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[170px]">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))
              }
              className="w-full pl-8 pr-8 py-2.5 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 cursor-pointer appearance-none"
            >
              <option value="newest">Mới cập nhật nhất</option>
              <option value="priceAsc">Giá thuê: Thấp đến Cao</option>
              <option value="priceDesc">Giá thuê: Cao đến Thấp</option>
              <option value="areaDesc">Diện tích: Lớn nhất</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Second Row: Detailed Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
        {/* District Filter */}
        <select
          value={filters.district}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              district: e.target.value,
              projectId: 'ALL', // reset project if district changed
            }))
          }
          className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="ALL">Tất cả khu vực (Quận)</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Project Filter */}
        <select
          value={filters.projectId}
          onChange={(e) => setFilters((prev) => ({ ...prev, projectId: e.target.value }))}
          className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="ALL">Tất cả dự án / khu vực</option>
          {projects
            .filter((p) => filters.district === 'ALL' || p.district === filters.district)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.district})
              </option>
            ))}
        </select>

        {/* Bedroom Pills */}
        <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
          {['ALL', '1', '2', '3+'].map((br) => {
            const isSelected = filters.bedrooms === br;
            const label = br === 'ALL' ? 'Tất cả PN' : `${br} PN`;
            return (
              <button
                key={br}
                onClick={() => setFilters((prev) => ({ ...prev, bedrooms: br }))}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Price Range Filter */}
        <select
          value={filters.priceRange}
          onChange={(e) => setFilters((prev) => ({ ...prev, priceRange: e.target.value }))}
          className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="ALL">Tất cả mức giá</option>
          <option value="under15">Dưới 15 Triệu</option>
          <option value="15to25">Từ 15 - 25 Triệu</option>
          <option value="over25">Trên 25 Triệu</option>
        </select>

        {/* Pet Friendly Toggle Button */}
        <button
          onClick={() =>
            setFilters((prev) => ({ ...prev, allowPetOnly: !prev.allowPetOnly }))
          }
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
            filters.allowPetOnly
              ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Dog className="w-3.5 h-3.5 text-amber-600" />
          <span>Cho nuôi Pet</span>
        </button>

        {/* Results Count Badge */}
        <span className="ml-auto text-xs font-medium text-slate-500">
          Tìm thấy <strong className="text-slate-800">{totalResults}</strong> căn
        </span>
      </div>
    </div>
  );
}
