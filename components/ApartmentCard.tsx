'use client';

import React, { useState } from 'react';
import {
  Phone,
  Copy,
  Check,
  KeyRound,
  Edit2,
  Trash2,
  Calendar,
  Lock,
  ExternalLink,
  Play,
  X,
  Loader2,
  Film,
  Send,
} from 'lucide-react';
import { Apartment } from '@/lib/types';
import { extractYouTubeId, getYouTubeEmbedUrl, formatExternalUrl } from '@/lib/youtube';

interface ApartmentCardProps {
  apartment: Apartment;
  onEdit: (apartment: Apartment) => void;
  onDelete: (id: string, unitNumber: string) => void;
  onShowToast: (message: string) => void;
  onUpdateApartment?: (updatedApartment: Apartment) => void;
}

export default function ApartmentCard({
  apartment,
  onEdit,
  onDelete,
  onShowToast,
  onUpdateApartment,
}: ApartmentCardProps) {
  const [copiedZalo, setCopiedZalo] = useState(false);
  const [copiedInternalZalo, setCopiedInternalZalo] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedInternal, setCopiedInternal] = useState(false);
  const [copiedVideo, setCopiedVideo] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Quick Zalo phone modal states
  const [isQuickZaloPhoneModalOpen, setIsQuickZaloPhoneModalOpen] = useState(false);
  const [quickZaloPhoneInput, setQuickZaloPhoneInput] = useState('');
  const [isSavingZaloPhone, setIsSavingZaloPhone] = useState(false);

  // Video viewer & quick edit states
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isQuickEditVideoOpen, setIsQuickEditVideoOpen] = useState(false);
  const [videoInput, setVideoInput] = useState('');
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  const priceMillion = (apartment.priceVnd / 1000000).toFixed(1);
  const hasVideo = Boolean(apartment.videoUrl && apartment.videoUrl.trim());
  const youtubeId = extractYouTubeId(apartment.videoUrl);
  const embedUrl = getYouTubeEmbedUrl(apartment.videoUrl, true);

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

  // Tạo template tin Zalo chào khách (kèm link video nếu có)
  const getZaloShareText = () => {
    const videoSection = apartment.videoUrl ? `\n🎥 Video quay thực tế: ${apartment.videoUrl}` : '';

    return `🏡 CHO THUÊ CĂN HỘ / NHÀ PHỐ ĐẸP
📍 Dự án: ${apartment.project.name} (${apartment.project.district})
🚪 Mã căn: ${apartment.unitNumber}
📐 Diện tích: ${apartment.areaSqm ? `${apartment.areaSqm}m²` : 'Tiêu chuẩn'} • ${apartment.bedrooms} Phòng ngủ • ${apartment.bathrooms} WC
🛋 Nội thất: ${furnitureLabel}
🐾 Thú cưng: ${apartment.allowPet ? 'Cho phép nuôi Pet 🐾' : 'Không nuôi Pet'}
💵 Giá thuê: ${priceMillion} Triệu/tháng (Cọc ${apartment.depositMonths} tháng)
✨ Tình trạng: ${statusConfig.label} ${apartment.availableDate ? `(Trống từ ${new Date(apartment.availableDate).toLocaleDateString('vi-VN')})` : ''}${videoSection}

👉 Quý khách quan tâm inbox em hỗ trợ xem nhà thực tế ngay nhé!`;
  };

  // Copy template tin Zalo chào khách (KHÔNG CÓ pass, KHÔNG CÓ SĐT chủ, CÓ link video nếu có)
  const handleCopyZalo = () => {
    const text = getZaloShareText();
    navigator.clipboard.writeText(text);
    setCopiedZalo(true);
    onShowToast('Đã copy tin nhắn Zalo chào khách (kèm link video nếu có)!');
    setTimeout(() => setCopiedZalo(false), 2500);
  };

  // Helper mở Zalo với Group hoặc số điện thoại & tự động copy tin
  const executeOpenZalo = (target: string) => {
    const trimmed = target.trim();
    if (!trimmed) {
      onShowToast('Chưa có thông tin số điện thoại hoặc link nhóm Zalo!');
      return;
    }

    const text = getZaloShareText();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }

    setCopiedInternalZalo(true);
    setTimeout(() => setCopiedInternalZalo(false), 2500);

    let zaloUrl = '';
    // Nếu là link nhóm Zalo (zalo.me/g/... hoặc http...)
    if (trimmed.includes('zalo.me/g/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      zaloUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      onShowToast('Đã copy tin nhắn & đang mở nhóm Zalo! Bạn hãy bấm Dán (Paste) để gửi.');
    } else {
      // Nếu là số điện thoại
      const cleanPhone = trimmed.replace(/\D/g, '');
      if (!cleanPhone) {
        onShowToast('Số điện thoại hoặc link Zalo không hợp lệ!');
        return;
      }
      zaloUrl = `https://zalo.me/${cleanPhone}`;
      onShowToast(`Đã copy tin nhắn & đang mở Zalo (${trimmed})! Bạn hãy bấm Dán (Paste) để gửi.`);
    }

    window.open(zaloUrl, '_blank');
  };

  // Bấm nút "Gửi Zalo group nội bộ"
  const handleSendInternalZalo = () => {
    const phoneOrLink = apartment.internalZaloPhone?.trim();
    if (!phoneOrLink) {
      setQuickZaloPhoneInput('');
      setIsQuickZaloPhoneModalOpen(true);
      return;
    }

    executeOpenZalo(phoneOrLink);
  };

  // Lưu nhanh số Zalo nội bộ từ modal inline
  const handleSaveAndSendQuickZalo = async () => {
    const clean = quickZaloPhoneInput.trim();
    if (!clean) {
      onShowToast('Vui lòng nhập số điện thoại Zalo');
      return;
    }

    setIsSavingZaloPhone(true);
    try {
      const res = await fetch(`/api/apartments/${apartment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalZaloPhone: clean }),
      });

      if (!res.ok) {
        throw new Error('Lỗi cập nhật số Zalo');
      }

      const updated = await res.json();
      if (onUpdateApartment) {
        onUpdateApartment(updated);
      }
      setIsQuickZaloPhoneModalOpen(false);
      executeOpenZalo(clean);
    } catch (err: any) {
      onShowToast(err.message || 'Lỗi khi lưu số Zalo');
    } finally {
      setIsSavingZaloPhone(false);
    }
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
- Zalo nội bộ: ${apartment.internalZaloPhone || 'Chưa gắn'}
- Hoa hồng: ${apartment.commissionDeal || 'Thỏa thuận'}
- Video YouTube: ${apartment.videoUrl || 'Chưa có'}
- Ghi chú: ${apartment.internalNotes || 'Không có'}`;

    navigator.clipboard.writeText(text);
    setCopiedInternal(true);
    onShowToast('Đã copy thông tin nội bộ đầy đủ!');
    setTimeout(() => setCopiedInternal(false), 2000);
  };

  // Copy Link Video YouTube
  const handleCopyVideoUrl = () => {
    if (!apartment.videoUrl) return;
    navigator.clipboard.writeText(apartment.videoUrl);
    setCopiedVideo(true);
    onShowToast('Đã copy link video YouTube!');
    setTimeout(() => setCopiedVideo(false), 2000);
  };

  // Quick save video URL directly from card
  const handleSaveVideoUrl = async (urlToSave: string | null) => {
    setIsSavingVideo(true);
    try {
      const res = await fetch(`/api/apartments/${apartment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: urlToSave }),
      });

      if (!res.ok) {
        throw new Error('Lỗi cập nhật video');
      }

      const updated = await res.json();
      if (onUpdateApartment) {
        onUpdateApartment(updated);
      }
      setIsQuickEditVideoOpen(false);
      onShowToast(
        urlToSave
          ? `Đã cập nhật link YouTube cho căn ${apartment.unitNumber}!`
          : `Đã xóa link video căn ${apartment.unitNumber}!`
      );
    } catch (err: any) {
      alert(err.message || 'Không thể lưu link video');
    } finally {
      setIsSavingVideo(false);
    }
  };

  const images = apartment.images && apartment.images.length > 0 ? apartment.images : [];
  // Tự động dùng ảnh thumbnail từ YouTube nếu căn hộ chưa tải ảnh lên
  const displayImages =
    images.length > 0
      ? images
      : youtubeId
      ? [`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`]
      : [];

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
        <div>
          {/* Image Preview / Banner */}
          {displayImages.length > 0 && (
            <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
              <img
                src={displayImages[activeImgIndex] || displayImages[0]}
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

              {/* Video Badge on Image if available */}
              {hasVideo && (
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="absolute top-3 right-3 bg-red-600/95 hover:bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer z-10"
                  title="Nhấn để xem video trực tiếp trên màn hình"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Xem Video</span>
                </button>
              )}

              {/* Price Overlay */}
              <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-md text-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                {priceMillion} Tr<span className="text-xs font-normal text-slate-300">/tháng</span>
              </div>

              {/* Multi-image indicators */}
              {displayImages.length > 1 && (
                <div className="absolute bottom-3 left-3 flex gap-1">
                  {displayImages.map((_, i) => (
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
            {displayImages.length === 0 && (
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
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 mb-3.5 space-y-2 text-xs">
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

            {/* VỊ TRÍ LINK YOUTUBE ĐỂ XEM TRÊN MÀN HÌNH (Theo đúng yêu cầu của người dùng) */}
            {hasVideo ? (
              <div className="mb-3.5 space-y-2">
                {/* NÚT LỚN XEM TRỰC TIẾP TRÊN MÀN HÌNH */}
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-red-600/20 transition-all cursor-pointer transform active:scale-98"
                  title="Bấm vào xem video trực tiếp trên màn hình"
                >
                  <div className="w-5 h-5 rounded-full bg-white text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </div>
                  <span>Xem Video YouTube Trên Màn Hình</span>
                </button>

                {/* THANH LINK CHI TIẾT & CÁC NÚT TIỆN ÍCH */}
                <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 bg-red-50/80 border border-red-200/80 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <svg className="w-3.5 h-3.5 fill-current text-red-600 shrink-0" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span
                      className="font-mono text-[11px] text-slate-600 truncate max-w-[150px] sm:max-w-[200px]"
                      title={apartment.videoUrl || ''}
                    >
                      {apartment.videoUrl}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={formatExternalUrl(apartment.videoUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Mở trên trang web/app YouTube"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={handleCopyVideoUrl}
                      className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded transition-colors cursor-pointer"
                      title="Copy link YouTube"
                    >
                      {copiedVideo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setVideoInput(apartment.videoUrl || '');
                        setIsQuickEditVideoOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      title="Đổi hoặc xóa link video"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Khi chưa có link video - Hiển thị nút bấm thêm nhanh tiện lợi */
              <div className="mb-3.5">
                <button
                  onClick={() => {
                    setVideoInput('');
                    setIsQuickEditVideoOpen(true);
                  }}
                  className="w-full py-2.5 px-3 border border-dashed border-red-300 hover:border-red-500 bg-red-50/20 hover:bg-red-50/60 text-slate-700 hover:text-red-600 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer group"
                  title="Thêm link video YouTube để xem trên màn hình"
                >
                  <svg
                    className="w-4 h-4 fill-current text-red-500 group-hover:scale-110 transition-transform"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span>+ Thêm link YouTube xem nhà</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions Toolbar */}
        <div className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5 space-y-2">
          {/* NÚT GỬI TIN ZALO GROUP NỘI BỘ */}
          <button
            onClick={handleSendInternalZalo}
            className="w-full inline-flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:to-sky-700 active:scale-[0.99] rounded-xl shadow-xs transition-all cursor-pointer group"
            title={
              apartment.internalZaloPhone
                ? `Mở trực tiếp Zalo group / số điện thoại (${apartment.internalZaloPhone}) và copy sẵn tin nhắn`
                : 'Bấm để thêm số hoặc link group Zalo nội bộ và gửi tin'
            }
          >
            <div className="flex items-center gap-2">
              {/* Icon Zalo đặc trưng */}
              <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center p-0.5 shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-full h-full fill-white" viewBox="0 0 40 40">
                  <path d="M11 14h18v3.5l-12 12h12V33H11v-3.5l12-12H11V14z" />
                </svg>
              </div>
              <span>{copiedInternalZalo ? 'Đã copy tin & mở Zalo!' : 'Gửi Zalo group nội bộ'}</span>
            </div>

            {apartment.internalZaloPhone ? (
              <span className="text-[11px] font-mono font-medium text-blue-100 bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs max-w-[130px] truncate">
                {apartment.internalZaloPhone.includes('zalo.me/g') ? 'Nhóm Zalo' : apartment.internalZaloPhone}
              </span>
            ) : (
              <span className="text-[10px] font-medium text-amber-200 bg-black/25 px-1.5 py-0.5 rounded-md border border-amber-300/30">
                + Thêm Group / SĐT
              </span>
            )}
          </button>

          <div className="flex gap-2">
            {/* Nút Copy Zalo chào khách */}
            <button
              onClick={handleCopyZalo}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border border-blue-200 rounded-xl transition-colors cursor-pointer"
              title="Tự động tạo nội dung chào khách (bao gồm Link YouTube nếu có)"
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
              title="Copy toàn bộ thông tin nội bộ (bao gồm Pass, Chủ & Video)"
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

      {/* POPUP MODAL: XEM VIDEO YOUTUBE TRỰC TIẾP TRÊN MÀN HÌNH */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    Video thực tế: Căn {apartment.unitNumber}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {apartment.project.name} ({apartment.project.district}) • {priceMillion} Tr/tháng
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasVideo && (
                  <a
                    href={formatExternalUrl(apartment.videoUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mở trên YouTube</span>
                  </a>
                )}
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Đóng video"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Player Display */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {youtubeId && embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={`Video căn hộ ${apartment.unitNumber}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : apartment.videoUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
                <video
                  src={apartment.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="p-8 text-center text-slate-300 space-y-3">
                  <Film className="w-12 h-12 text-slate-500 mx-auto" />
                  <p className="text-sm">Link video căn hộ:</p>
                  <p className="font-mono text-xs text-blue-400 break-all px-4 py-2 bg-slate-800 rounded-lg max-w-lg mx-auto">
                    {apartment.videoUrl}
                  </p>
                  <a
                    href={apartment.videoUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Mở xem video trên tab mới</span>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 bg-slate-800/80 border-t border-slate-700/80 flex items-center justify-between">
              <div className="text-xs text-slate-300">
                <span className="text-emerald-400 font-bold">{priceMillion} Tr/tháng</span> •{' '}
                {apartment.bedrooms} PN • {apartment.bathrooms} WC • {furnitureLabel}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyVideoUrl}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {copiedVideo ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedVideo ? 'Đã copy!' : 'Copy link video'}</span>
                </button>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: THÊM / SỬA NHANH LINK YOUTUBE */}
      {isQuickEditVideoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsQuickEditVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center">
                  <Play className="w-3 h-3 fill-current" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Link YouTube • Căn {apartment.unitNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsQuickEditVideoOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dán đường dẫn Video YouTube:
              </label>
              <input
                type="url"
                autoFocus
                placeholder="https://youtube.com/watch?v=... hoặc https://youtu.be/..."
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Hỗ trợ link YouTube máy tính, link rút gọn youtu.be, hoặc YouTube Shorts.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {apartment.videoUrl ? (
                <button
                  type="button"
                  disabled={isSavingVideo}
                  onClick={() => handleSaveVideoUrl(null)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                >
                  Xóa link video
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickEditVideoOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isSavingVideo}
                  onClick={() => handleSaveVideoUrl(videoInput.trim() || null)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingVideo && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Lưu Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* POPUP MODAL: NHẬP SỐ ZALO NỘI BỘ NHANH */}
      {isQuickZaloPhoneModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsQuickZaloPhoneModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 40 40">
                    <path d="M11 14h18v3.5l-12 12h12V33H11v-3.5l12-12H11V14z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Gửi Zalo group nội bộ ({apartment.unitNumber})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nhập link nhóm Zalo hoặc số điện thoại để gửi tin:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickZaloPhoneModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Link nhóm Zalo hoặc Số điện thoại Zalo
              </label>
              <input
                type="text"
                placeholder="VD: https://zalo.me/g/xxxxxx hoặc 0908123456"
                value={quickZaloPhoneInput}
                onChange={(e) => setQuickZaloPhoneInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveAndSendQuickZalo();
                  }
                }}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition-all text-slate-800"
                autoFocus
              />
              <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
                💡 Hệ thống sẽ lưu thông tin này vào căn hộ, tự động copy sẵn nội dung tin nhắn và mở thẳng nhóm / khung chat Zalo.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsQuickZaloPhoneModalOpen(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSavingZaloPhone || !quickZaloPhoneInput.trim()}
                onClick={handleSaveAndSendQuickZalo}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingZaloPhone ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Lưu &amp; Mở Zalo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
