'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Building2,
  KeyRound,
  User,
  Home,
  Shield,
  Image as ImageIcon,
  Loader2,
  Camera,
  Upload,
  Trash2,
  Plus,
  Link as LinkIcon,
  Play,
  ExternalLink,
} from 'lucide-react';
import { Apartment, Project, ApartmentStatus, FurnitureStatus } from '@/lib/types';

interface ApartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedApartment?: Apartment) => void;
  apartmentToEdit?: Apartment | null;
  projects: Project[];
  onShowToast: (message: string) => void;
}

// Client-side image compression to optimize storage & mobile upload speed
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Vui lòng chỉ chọn file hình ảnh'));
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(img.src);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG 0.78 for great quality & tiny file size (~80KB)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Lỗi tải hình ảnh'));
    };
    reader.onerror = () => reject(new Error('Lỗi đọc file từ thiết bị'));
  });
};

export default function ApartmentModal({
  isOpen,
  onClose,
  onSave,
  apartmentToEdit,
  projects,
  onShowToast,
}: ApartmentModalProps) {
  const isEditing = Boolean(apartmentToEdit);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Image list state
  const [imageList, setImageList] = useState<string[]>([]);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState('');
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
      setImageList(apartmentToEdit.images || []);
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
      setImageList([]);
      setVideoUrl('');
    }
    setShowManualUrl(false);
    setManualUrlInput('');
    setError('');
  }, [apartmentToEdit, isOpen, projects]);

  if (!isOpen) return null;

  // Handle mobile / desktop photo file selection
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhotos(true);
    setError('');

    try {
      const fileArray = Array.from(files);
      const compressedPromises = fileArray.map((file) => compressImageFile(file));
      const compressedResults = await Promise.all(compressedPromises);

      setImageList((prev) => [...prev, ...compressedResults]);
      onShowToast(`Đã thêm ${compressedResults.length} ảnh từ thiết bị!`);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xử lý hình ảnh');
    } finally {
      setIsProcessingPhotos(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove photo from list
  const handleRemovePhoto = (indexToRemove: number) => {
    setImageList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Add manual URL
  const handleAddManualUrl = () => {
    if (!manualUrlInput.trim()) return;
    const url = manualUrlInput.trim();
    setImageList((prev) => [...prev, url]);
    setManualUrlInput('');
  };

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
        images: imageList,
        videoUrl: videoUrl.trim() || null,
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

      onSave(data);
      onClose();
      onShowToast(isEditing ? 'Đã cập nhật căn hộ thành công!' : 'Đã thêm căn hộ mới vào rổ hàng!');
    } catch (err: any) {
      setError(err.message || 'Không thể lưu căn hộ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
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
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
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

          {/* Section 4: Hình Ảnh Trực Tiếp & Link Video */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-sm font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span>4. Hình Ảnh Thực Tế & Video</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                {imageList.length} hình ảnh
              </span>
            </div>

            {/* Nút bấm chọn ảnh từ điện thoại / thư viện */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                id="photo-upload-picker"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingPhotos}
                  className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer transform active:scale-98 disabled:opacity-50"
                >
                  {isProcessingPhotos ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang nén và tải ảnh lên...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Tải Ảnh Từ Thư Viện / Chụp Ảnh</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowManualUrl(!showManualUrl)}
                  className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{showManualUrl ? 'Ẩn ô dán link' : 'Dán link URL'}</span>
                </button>
              </div>

              {/* Ô dán link thủ công nếu muốn */}
              {showManualUrl && (
                <div className="mt-2.5 flex gap-2">
                  <input
                    type="url"
                    placeholder="Dán link ảnh https://... vào đây"
                    value={manualUrlInput}
                    onChange={(e) => setManualUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualUrl}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>
              )}
            </div>

            {/* Danh sách ảnh Preview đã chọn */}
            {imageList.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                {imageList.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 border border-slate-300/80 group shadow-2xs"
                  >
                    <img
                      src={imgUrl}
                      alt={`Căn hộ photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.2 rounded font-semibold backdrop-blur-2xs">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full shadow-xs transition-transform transform hover:scale-110 cursor-pointer"
                      title="Xóa ảnh này"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Video link */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 fill-current text-red-600" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>Link Video YouTube xem nhà thực tế</span>
                </label>
                {videoUrl && (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-md transition-colors"
                    title="Mở xem thử video trong tab mới"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Xem thử link</span>
                  </a>
                )}
              </div>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=... hoặc https://youtu.be/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Link YouTube sẽ hiển thị nổi bật trên thẻ căn hộ để bấm xem trực tiếp trên màn hình.
              </p>
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
              disabled={loading || isProcessingPhotos}
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
