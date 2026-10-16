'use client';

import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import StatsOverview from '@/components/StatsOverview';
import FilterBar from '@/components/FilterBar';
import ApartmentCard from '@/components/ApartmentCard';
import ApartmentModal from '@/components/ApartmentModal';
import ProjectModal from '@/components/ProjectModal';
import Toast from '@/components/Toast';
import { Apartment, Project, FilterState } from '@/lib/types';
import { Plus, Building, RefreshCw, FilterX } from 'lucide-react';

interface RentalDashboardProps {
  initialApartments: Apartment[];
  initialProjects: Project[];
}

export default function RentalDashboard({
  initialApartments,
  initialProjects,
}: RentalDashboardProps) {
  const [apartments, setApartments] = useState<Apartment[]>(initialApartments);
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  // Modals state
  const [isApartmentModalOpen, setIsApartmentModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [apartmentToEdit, setApartmentToEdit] = useState<Apartment | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Refresh data from API
  const refreshData = async () => {
    try {
      const timestamp = Date.now();
      const [aptRes, projRes] = await Promise.all([
        fetch(`/api/apartments?t=${timestamp}`, { cache: 'no-store' }),
        fetch(`/api/projects?t=${timestamp}`, { cache: 'no-store' }),
      ]);
      if (aptRes.ok && projRes.ok) {
        const apts = await aptRes.json();
        const projs = await projRes.json();
        setApartments(apts);
        setProjects(projs);
      }
    } catch (err) {
      console.error('Failed to refresh data', err);
    }
  };

  // Delete handler
  const handleDelete = async (id: string, unitNumber: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa căn ${unitNumber} khỏi rổ hàng?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/apartments/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setApartments((prev) => prev.filter((a) => a.id !== id));
        showToast(`Đã xóa căn ${unitNumber} thành công!`);
      } else {
        alert('Không thể xóa căn hộ này');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi xóa căn hộ');
    }
  };

  // Edit handler
  const handleEdit = (apt: Apartment) => {
    setApartmentToEdit(apt);
    setIsApartmentModalOpen(true);
  };

  // Filter & Search Logic
  const filteredApartments = useMemo(() => {
    return apartments.filter((apt) => {
      // Search
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchUnit = apt.unitNumber.toLowerCase().includes(q);
        const matchProject = apt.project?.name?.toLowerCase().includes(q);
        const matchDistrict = apt.project?.district?.toLowerCase().includes(q);
        const matchOwner = apt.ownerName.toLowerCase().includes(q);
        const matchPhone = apt.ownerPhone.toLowerCase().includes(q);
        const matchPass = apt.doorPasscode?.toLowerCase().includes(q);
        const matchNotes = apt.internalNotes?.toLowerCase().includes(q);

        if (
          !matchUnit &&
          !matchProject &&
          !matchDistrict &&
          !matchOwner &&
          !matchPhone &&
          !matchPass &&
          !matchNotes
        ) {
          return false;
        }
      }

      // Status
      if (filters.status !== 'ALL' && apt.status !== filters.status) {
        return false;
      }

      // District
      if (filters.district !== 'ALL' && apt.project?.district !== filters.district) {
        return false;
      }

      // Project
      if (filters.projectId !== 'ALL' && apt.projectId !== filters.projectId) {
        return false;
      }

      // Bedrooms
      if (filters.bedrooms !== 'ALL') {
        if (filters.bedrooms === '3+') {
          if (apt.bedrooms < 3) return false;
        } else if (apt.bedrooms !== parseInt(filters.bedrooms, 10)) {
          return false;
        }
      }

      // Price Range
      if (filters.priceRange !== 'ALL') {
        if (filters.priceRange === 'under15' && apt.priceVnd >= 15000000) return false;
        if (
          filters.priceRange === '15to25' &&
          (apt.priceVnd < 15000000 || apt.priceVnd > 25000000)
        )
          return false;
        if (filters.priceRange === 'over25' && apt.priceVnd <= 25000000) return false;
      }

      // Pet
      if (filters.allowPetOnly && !apt.allowPet) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'priceAsc') return a.priceVnd - b.priceVnd;
      if (filters.sortBy === 'priceDesc') return b.priceVnd - a.priceVnd;
      if (filters.sortBy === 'areaDesc') return (b.areaSqm || 0) - (a.areaSqm || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [apartments, filters]);

  // Handle direct apartment update from card (e.g. quick YouTube video edit)
  const handleUpdateApartment = (updated: Apartment) => {
    setApartments((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <Navbar
        onOpenApartmentModal={() => {
          setApartmentToEdit(null);
          setIsApartmentModalOpen(true);
        }}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
        totalApartments={apartments.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Stats Overview */}
        <StatsOverview
          apartments={apartments}
          activeStatus={filters.status}
          onSelectStatus={(status) => setFilters((prev) => ({ ...prev, status }))}
        />

        {/* Filter and Search Bar */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          projects={projects}
          totalResults={filteredApartments.length}
        />

        {/* Apartment List Grid */}
        {filteredApartments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Không tìm thấy căn hộ phù hợp
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Thử thay đổi bộ lọc tìm kiếm hoặc thêm căn hộ mới vào rổ hàng của bạn.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() =>
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
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <FilterX className="w-4 h-4" />
                <span>Xóa bộ lọc</span>
              </button>
              <button
                onClick={() => {
                  setApartmentToEdit(null);
                  setIsApartmentModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Căn Mới</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredApartments.map((apartment) => (
              <ApartmentCard
                key={apartment.id}
                apartment={apartment}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShowToast={showToast}
                onUpdateApartment={handleUpdateApartment}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="sm:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setApartmentToEdit(null);
            setIsApartmentModalOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xl flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          title="Thêm căn hộ"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Modals */}
      <ApartmentModal
        isOpen={isApartmentModalOpen}
        onClose={() => {
          setIsApartmentModalOpen(false);
          setApartmentToEdit(null);
        }}
        onSave={refreshData}
        apartmentToEdit={apartmentToEdit}
        projects={projects}
        onShowToast={showToast}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projects={projects}
        onProjectAdded={refreshData}
        onShowToast={showToast}
      />

      {/* Feedback Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
