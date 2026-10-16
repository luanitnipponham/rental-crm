'use client';

import React, { useState } from 'react';
import { X, Layers, Plus, MapPin, Loader2, Building } from 'lucide-react';
import { Project } from '@/lib/types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onProjectAdded: () => void;
  onShowToast: (message: string) => void;
}

export default function ProjectModal({
  isOpen,
  onClose,
  projects,
  onProjectAdded,
  onShowToast,
}: ProjectModalProps) {
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !district.trim()) {
      setError('Vui lòng nhập tên dự án và quận/huyện');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, district, address }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      onShowToast(`Đã thêm dự án "${name}" thành công!`);
      setName('');
      setDistrict('');
      setAddress('');
      onProjectAdded();
    } catch (err: any) {
      setError(err.message || 'Không thể tạo dự án');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Danh Mục Dự Án / Khu Vực</h2>
              <p className="text-xs text-slate-500">Quản lý các cụm chung cư & tuyến đường nhà phố</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Form thêm mới */}
          <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Thêm Dự Án Mới
            </h3>

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên dự án *</label>
                <input
                  type="text"
                  placeholder="VD: Masteri Thảo Điền"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quận / Huyện *</label>
                <input
                  type="text"
                  placeholder="VD: Bình Thạnh, Q1..."
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ cụ thể</label>
              <input
                type="text"
                placeholder="VD: 208 Nguyễn Hữu Cảnh, P.22"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Lưu Dự Án Mới</span>
            </button>
          </form>

          {/* List of current projects */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Các dự án hiện có ({projects.length})
            </h3>
            <div className="space-y-2">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {p.district} {p.address ? `• ${p.address}` : ''}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                    {p._count?.apartments ?? 0} căn
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
