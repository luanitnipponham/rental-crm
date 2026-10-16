'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, KeyRound, User, Home, Shield, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Apartment, Project, ApartmentStatus, FurnitureStatus } from '@/lib/types';

interface ApartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  apartmentToEdit?: Apartment | null;
  projects: Project[];
  onShowToast: (message: string) => void;
}

export default function ApartmentModal({
  isOpen,
  onClose,
  onSave,
  apartmentToEdit,
  projects,
  onShowToast,
}: ApartmentModalProps) {
  const isEditing = Boolean(apartmentToEdit);

  // Form State
  const [projectId, setProjectId] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDistrict, setNewProjectDistrict] = useState('Bình Thạnh');

  const [unitNumber, setUnitNumber] = useState('');
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [areaSqm, setAreaSqm] = useState('');
  const [priceVnd, setPriceVnd] = useState('');
  const [depositMonths, setDepositMonths] = useState(1);
  const [furniture, setFurniture] = useState<FurnitureStatus>('FULL');
  const [allowPet, setAllowPet] = useState(false);
  const [status, setStatus] = useState<ApartmentStatus>('AVAILABLE');
  const [availableDate, setAvailableDate] = useState('');

  const [doorPasscode, setDoorPasscode] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [commissionDeal, setCommissionDeal] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [leaseEndDate, setLeaseEndDate] = useState('');

  const [imagesText, setImagesText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill when editing
  useEffect(() => {
    if (apartmentToEdit) {
      setProjectId(apartmentToEdit.projectId);
      setIsCreatingProject(false);
      setUnitNumber(apartmentToEdit.unitNumber);
      setBedrooms(apartmentToEdit.bedrooms);
      setBathrooms(apartmentToEdit.bathrooms);
      setAreaSqm(apartmentToEdit.areaSqm ? String(apartmentToEdit.areaSqm) : '');
      setPriceVnd(String(apartmentToEdit.priceVnd));
      setDepositMonths(apartmentToEdit.depositMonths);
      setFurniture(apartmentToEdit.furniture);
      setAllowPet(apartmentToEdit.allowPet);
      setStatus(apartmentToEdit.status);
      setAvailableDate(
        apartmentToEdit.availableDate
          ? new Date(apartmentToEdit.availableDate).toISOString().split('T')[0]
          : ''
      );
      setDoorPasscode(apartmentToEdit.doorPasscode || '');
      setOwnerName(apartmentToEdit.ownerName);
      setOwnerPhone(apartmentToEdit.ownerPhone);
      setCommissionDeal(apartmentToEdit.commissionDeal || '');
      setInternalNotes(apartmentToEdit.internalNotes || '');
      setLeaseEndDate(
        apartmentToEdit.leaseEndDate
          ? new Date(apartmentToEdit.leaseEndDate).toISOString().split('T')[0]
          : ''
      );
      setImagesText(apartmentToEdit.images ? apartmentToEdit.images.join('\n') : '');
      setVideoUrl(apartmentToEdit.videoUrl || '');
    } else {
      // Default reset
      setProjectId(projects.length > 0 ? projects[0].id : '');
      setIsCreatingProject(projects.length === 0);
      setNewProjectName('');
      setNewProjectDistrict('Bình Thạnh');
      setUnitNumber('');
      setBedrooms(2);
      setBathrooms(2);
      setAreaSqm('');
      setPriceVnd('');
      setDepositMonths(2);
      setFurniture('FULL');
      setAllowPet(false);
      setStatus('AVAILABLE');
      setAvailableDate('');
      setDoorPasscode('');
      setOwnerName('');
      setOwnerPhone('');
      setCommissionDeal('1 tháng (HĐ 1 năm)');
      setInternalNotes('');
      setLeaseEndDate('');
      setImagesText('');
      setVideoUrl('');
    }
    setError('');
  }, [apartmentToEdit, isOpen, projects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!unitNumber.trim()) {
      setError('Vui lòng nhập mã căn');
      return;
    }
    if (!priceVnd || Number(priceVnd) <= 0) {
      setError('Vui lòng nhập giá thuê hợp lệ');
      return;
    }
    if (!ownerName.trim() || !ownerPhone.trim()) {
      setError('Vui lòng nhập tên và số điện thoại chủ nhà');
      return;
    }
    if (isCreatingProject && !newProjectName.trim()) {
      setError('Vui lòng nhập tên dự án mới');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        projectId: isCreatingProject ? 'NEW' : projectId,
        newProjectName,
        newProjectDistrict,
        unitNumber,
        bedrooms,
        bathrooms,
        areaSqm: areaSqm ? parseFloat(areaSqm) : null,
        priceVnd: parseInt(priceVnd, 10),
        depositMonths,
        furniture,
        allowPet,
        status,
        availableDate: availableDate ? new Date(availableDate).toISOString() : null,
        doorPasscode,
        ownerName,
        ownerPhone,
        commissionDeal,
        internalNotes,
        leaseEndDate: leaseEndDate ? new Date(leaseEndDate).toISOString() : null,
        images: imagesText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        videoUrl,
      };

      const url = isEditing && apartmentToEdit ? `/api/apartments/${apartmentToEdit.id}` : '/api/apartments';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      onShowToast(isEditing ? 'Đã cập nhật căn hộ thành công!' : 'Đã thêm căn hộ mới vào rổ hàng!');
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Không thể lưu căn hộ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {isEditing && apartmentToEdit ? `Chỉnh Sửa Căn: ${apartmentToEdit.unitNumber}` : 'Thêm Căn Hộ / Nhà Phố Mới'}
              </h2>
              <p className="text-xs text-slate-500">
                Cập nhật đầy đủ thông tin để quản lý rổ hàng và tạo tin Zalo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Dự án & Thông số BĐS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-slate-800">
              <Home className="w-4 h-4 text-blue-600" />
              <span>1. Dự Án & Thông Số Căn Hộ</span>
            </div>

            {/* Chọn dự án hoặc tạo mới */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Dự án / Khu vực</label>
                <button
                  type="button"
                  onClick={() => setIsCreatingProject(!isCreatingProject)}
                  className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  {isCreatingProject ? '← Chọn từ danh sách' : '+ Thêm dự án mới'}
                </button>
              </div>

              {!isCreatingProject ? (
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.district})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-200/60">
                  <div>
                    <label className="text-xs text-slate-600">Tên dự án *</label>
                    <input
                      type="text"
                      placeholder="VD: Masteri Centre Point"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Quận / Huyện</label>
                    <input
                      type="text"
                      placeholder="VD: TP. Thủ Đức"
                      value={newProjectDistrict}
                      onChange={(e) => setNewProjectDistrict(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mã căn & Giá thuê */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã căn / Số nhà *
                </label>
                <input
                  type="text"
                  placeholder="VD: P6-22.08 hoặc Nhà 42 Đặng Dung"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giá thuê VND/tháng *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="VD: 22000000"
                    value={priceVnd}
                    onChange={(e) => setPriceVnd(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-14"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600">
                    {priceVnd ? `${(Number(priceVnd) / 1000000).toFixed(1)} Tr` : 'VND'}
                  </span>
                </div>
              </div>
            </div>

            {/* PN, WC, Diện tích, Tiền cọc */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số PN</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={1}>1 Phòng ngủ</option>
                  <option value={2}>2 Phòng ngủ</option>
                  <option value={3}>3 Phòng ngủ</option>
                  <option value={4}>4+ Phòng ngủ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số WC</label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={1}>1 WC</option>
                  <option value={2}>2 WC</option>
                  <option value={3}>3 WC</option>
                  <option value={4}>4+ WC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diện tích (m²)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="VD: 75.5"
                  value={areaSqm}
                  onChange={(e) => setAreaSqm(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tiền cọc</label>
                <select
                  value={depositMonths}
                  onChange={(e) => setDepositMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={1}>1 tháng</option>
                  <option value={2}>2 tháng</option>
                  <option value={3}>3 tháng</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Tình trạng & Tiện ích */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-slate-800">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>2. Tình Trạng & Tiện Ích</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApartmentStatus)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="AVAILABLE">🟢 Đang trống (Sẵn sàng)</option>
                  <option value="UPCOMING_SOON">🟡 Sắp trống (Hẹn trước)</option>
                  <option value="DEPOSITED">🟣 Đã cọc</option>
                  <option value="RENTED">⚪ Đã cho thuê</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nội thất</label>
                <select
                  value={furniture}
                  onChange={(e) => setFurniture(e.target.value as FurnitureStatus)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="FULL">Full nội thất</option>
                  <option value="BASIC">Nội thất cơ bản</option>
                  <option value="EMPTY">Nhà trống</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày trống</label>
                <input
                  type="date"
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="allowPet"
                checked={allowPet}
                onChange={(e) => setAllowPet(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="allowPet" className="text-xs font-semibold text-slate-700 cursor-pointer">
                🐾 Cho phép nuôi thú cưng (Pet friendly)
              </label>
            </div>
          </div>

          {/* Section 3: Thông tin Chủ nhà & Pass cửa (Bảo mật môi giới) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-amber-200 text-sm font-bold text-amber-900">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>3. Thông Tin Chủ Nhà & Pass Cửa (Nội Bộ Môi Giới)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ tên chủ nhà *
                </label>
                <input
                  type="text"
                  placeholder="VD: Anh Minh hoặc Chị Hương"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại chủ nhà *
                </label>
                <input
                  type="tel"
                  placeholder="VD: 0908123456"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-amber-900 mb-1">
                  Mật khẩu cửa vào xem nhà
                </label>
                <input
                  type="text"
                  placeholder="VD: 123456* hoặc Hộp chìa 8888"
                  value={doorPasscode}
                  onChange={(e) => setDoorPasscode(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-amber-50/50 border border-amber-300 rounded-xl font-mono focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thỏa thuận hoa hồng
                </label>
                <input
                  type="text"
                  placeholder="VD: 1 tháng (HĐ 1 năm) hoặc 50%"
                  value={commissionDeal}
                  onChange={(e) => setCommissionDeal(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú nội bộ
              </label>
              <textarea
                rows={2}
                placeholder="VD: Chủ tính hơi kỹ tính, hẹn trước 30 phút. Khóa vân tay tầng 1..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Section 4: Link Hình Ảnh */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-slate-800">
              <ImageIcon className="w-4 h-4 text-purple-600" />
              <span>4. Link Hình Ảnh & Video</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link hình ảnh (mỗi dòng 1 link URL)
              </label>
              <textarea
                rows={3}
                placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Lưu Thay Đổi' : 'Tạo Căn Hộ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
