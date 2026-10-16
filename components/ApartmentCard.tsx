'use client';

import React, { useState } from 'react';
import {
  Phone,
  Copy,
  Check,
  KeyRound,
  ShieldAlert,
  Edit2,
  Trash2,
  Calendar,
  Share2,
  Lock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Apartment } from '@/lib/types';

interface ApartmentCardProps {
  apartment: Apartment;
  onEdit: (apartment: Apartment) => void;
  onDelete: (id: string, unitNumber: string) => void;
  onShowToast: (message: string) => void;
}

export default function ApartmentCard({
  apartment,
  onEdit,
  onDelete,
  onShowToast,
}: ApartmentCardProps) {
  const [copiedZalo, setCopiedZalo] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedInternal, setCopiedInternal] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const priceMillion = (apartment.priceVnd / 1000000).toFixed(1);

  // Status mapping
  const statusConfig = {
    AVAILABLE: {
      label: 'Đang trống',
      class: 'badge-available',
      dot: 'bg-emerald-500',
    },
    UPCOMING_SOON: {
      label: 'Sắp trống',
      class: 'badge-upcoming',
      dot: 'bg-amber-500',
    },
    DEPOSITED: {
      label: 'Đã cọc',
      class: 'badge-deposited',
      dot: 'bg-purple-500',
    },
    RENTED: {
      label: 'Đã cho thuê',
      class: 'badge-rented',
      dot: 'bg-slate-400',
    },
  }[apartment.status] || {
    label: apartment.status,
    class: 'badge-available',
    dot: 'bg-blue-500',
  };

  const furnitureLabel = {
    EMPTY: 'Nhà trống',
    BASIC: 'Nội thất cơ bản',
    FULL: 'Full nội thất',
  }[apartment.furniture];

  // Copy template tin Zalo chào khách (KHÔNG CÓ pass, KHÔNG CÓ SĐT chủ)
  const handleCopyZalo = () => {
    const text = `🏡 CHO THUÊ CĂN HỘ / NHÀ PHỐ ĐẸP
📍 Dự án: ${apartment.project.name} (${apartment.project.district})
🚪 Mã căn: ${apartment.unitNumber}
📐 Diện tích: ${apartment.areaSqm ? `${apartment.areaSqm}m²` : 'Tiêu chuẩn'} • ${apartment.bedrooms} Phòng ngủ • ${apartment.bathrooms} WC
🛋 Nội thất: ${furnitureLabel}
🐾 Thú cưng: ${apartment.allowPet ? 'Cho phép nuôi Pet 🐾' : 'Không nuôi Pet'}
💵 Giá thuê: ${priceMillion} Triệu/tháng (Cọc ${apartment.depositMonths} tháng)
✨ Tình trạng: ${statusConfig.label} ${apartment.availableDate ? `(Trống từ ${new Date(apartment.availableDate).toLocaleDateString('vi-VN')})` : ''}

👉 Quý khách quan tâm inbox em hỗ trợ xem nhà thực tế ngay nhé!`;

    navigator.clipboard.writeText(text);
    setCopiedZalo(true);
    onShowToast('Đã copy tin nhắn Zalo chào khách (đã ẩn pass & SĐT chủ)!');
    setTimeout(() => setCopiedZalo(false), 2500);
  };

  // Copy Passcode nhanh
  const handleCopyPass = () => {
    if (!apartment.doorPasscode) return;
    navigator.clipboard.writeText(apartment.doorPasscode);
    setCopiedPass(true);
    onShowToast(`Đã copy pass cửa: ${apartment.doorPasscode}`);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  // Copy thông tin nội bộ (đầy đủ cho môi giới)
  const handleCopyInternal = () => {
    const text = `[NỘI BỘ MÔI GIỚI]
- Căn: ${apartment.unitNumber} - ${apartment.project.name} (${apartment.project.district})
- Giá thuê: ${priceMillion} Tr/tháng (Cọc ${apartment.depositMonths}th)
- Chủ nhà: ${apartment.ownerName} - ${apartment.ownerPhone}
- Pass cửa: ${apartment.doorPasscode || 'N/A'}
- Hoa hồng: ${apartment.commissionDeal || 'Thỏa thuận'}
- Ghi chú: ${apartment.internalNotes || 'Không có'}`;

    navigator.clipboard.writeText(text);
    setCopiedInternal(true);
    onShowToast('Đã copy thông tin nội bộ đầy đủ!');
    setTimeout(() => setCopiedInternal(false), 2000);
  };

  const images = apartment.images && apartment.images.length > 0 ? apartment.images : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Image Preview / Banner */}
        {images.length > 0 && (
          <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
            <img
              src={images[activeImgIndex]}
              alt={apartment.unitNumber}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              loading="lazy"
            />
            {/* Status Badge Overlay */}
            <div className="absolute top-3 left-3">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs backdrop-blur-md ${statusConfig.class}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                {statusConfig.label}
              </span>
            </div>

            {/* Price Overlay */}
            <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-md text-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
              {priceMillion} Tr<span className="text-xs font-normal text-slate-300">/tháng</span>
            </div>

            {/* Multi-image indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-3 flex gap-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImgIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === activeImgIndex ? 'bg-white w-4' : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-4 sm:p-5">
          {/* Header if no images */}
          {images.length === 0 && (
            <div className="flex items-center justify-between mb-3">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig.class}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                {statusConfig.label}
              </span>
              <div className="text-right">
                <span className="text-xl font-bold text-blue-600">{priceMillion} Tr</span>
                <span className="text-xs text-slate-400 font-medium">/tháng</span>
              </div>
            </div>
          )}

          {/* Unit & Project Title */}
          <div className="mb-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-bold text-lg text-slate-900 tracking-tight leading-snug">
                {apartment.unitNumber}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                {apartment.project.district}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-600 truncate">
              {apartment.project.name}
            </p>
          </div>

          {/* Specs Bar */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 font-medium mb-3.5">
            <span className="px-2 py-1 rounded-md bg-slate-100/90 text-slate-700">
              {apartment.bedrooms} PN
            </span>
            <span className="px-2 py-1 rounded-md bg-slate-100/90 text-slate-700">
              {apartment.bathrooms} WC
            </span>
            {apartment.areaSqm && (
              <span className="px-2 py-1 rounded-md bg-slate-100/90 text-slate-700">
                {apartment.areaSqm} m²
              </span>
            )}
            <span className="px-2 py-1 rounded-md bg-slate-100/90 text-slate-700">
              {furnitureLabel}
            </span>
            {apartment.allowPet && (
              <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold">
                🐾 Pet OK
              </span>
            )}
            <span className="px-2 py-1 rounded-md bg-slate-100/90 text-slate-500">
              Cọc {apartment.depositMonths}th
            </span>
          </div>

          {/* Thông tin môi giới bảo mật (Hộp cam nổi bật) */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 mb-4 space-y-2 text-xs">
            {/* Chủ nhà & SĐT */}
            <div className="flex items-center justify-between">
              <span className="text-amber-900 font-semibold flex items-center gap-1">
                Chủ: {apartment.ownerName}
              </span>
              <a
                href={`tel:${apartment.ownerPhone}`}
                className="font-mono text-amber-900 font-bold hover:underline bg-amber-100 px-1.5 py-0.5 rounded-md flex items-center gap-1"
                title="Gọi trực tiếp"
              >
                <Phone className="w-3 h-3 text-amber-700" />
                {apartment.ownerPhone}
              </a>
            </div>

            {/* Pass Cửa & Hoa hồng */}
            <div className="flex items-center justify-between pt-1 border-t border-amber-200/50">
              <div className="flex items-center gap-1 text-amber-900">
                <KeyRound className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Pass:</span>
                <button
                  onClick={handleCopyPass}
                  disabled={!apartment.doorPasscode}
                  className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Nhấn để copy mật khẩu cửa"
                >
                  {apartment.doorPasscode || 'Chưa có'}
                  {copiedPass ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-2.5 h-2.5 text-amber-600" />
                  )}
                </button>
              </div>

              <div className="text-amber-800 font-medium">
                HH: <strong className="text-amber-950">{apartment.commissionDeal || 'Thỏa thuận'}</strong>
              </div>
            </div>

            {/* Ghi chú nội bộ */}
            {apartment.internalNotes && (
              <p className="text-amber-800/90 italic pt-1 border-t border-amber-200/40 text-[11px] line-clamp-2">
                "{apartment.internalNotes}"
              </p>
            )}

            {/* Ngày trống / Hết hạn */}
            {apartment.availableDate && (
              <div className="flex items-center gap-1 text-[11px] text-amber-800 pt-0.5">
                <Calendar className="w-3 h-3 text-amber-600" />
                <span>Ngày trống: {new Date(apartment.availableDate).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions Toolbar */}
      <div className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5 space-y-2">
        <div className="flex gap-2">
          {/* Nút Copy Zalo chào khách */}
          <button
            onClick={handleCopyZalo}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border border-blue-200 rounded-xl transition-colors cursor-pointer"
            title="Tự động tạo nội dung chào khách, đã ẩn Pass và SĐT chủ"
          >
            {copiedZalo ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Đã copy Zalo!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Tin Zalo</span>
              </>
            )}
          </button>

          {/* Nút Gọi Chủ */}
          <a
            href={`tel:${apartment.ownerPhone}`}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors shrink-0"
            title="Gọi điện cho chủ nhà"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gọi Chủ</span>
          </a>
        </div>

        {/* Bottom Sub-Actions: Edit, Delete, Copy Internal */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={handleCopyInternal}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Copy toàn bộ thông tin nội bộ (bao gồm Pass và Chủ)"
          >
            <Lock className="w-3 h-3" />
            <span>{copiedInternal ? 'Đã copy!' : 'Copy nội bộ'}</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(apartment)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Chỉnh sửa căn hộ"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(apartment.id, apartment.unitNumber)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Xóa căn hộ này"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
