export type ApartmentStatus = 'AVAILABLE' | 'UPCOMING_SOON' | 'DEPOSITED' | 'RENTED';

export type FurnitureStatus = 'EMPTY' | 'BASIC' | 'FULL';

export interface Project {
  id: string;
  name: string;
  district: string;
  address?: string | null;
  createdAt?: string | Date;
  _count?: {
    apartments: number;
  };
}

export interface Apartment {
  id: string;
  projectId: string;
  project: Project;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number | null;
  priceVnd: number;
  depositMonths: number;
  furniture: FurnitureStatus;
  allowPet: boolean;
  status: ApartmentStatus;
  availableDate: string | Date | null;
  images: string[];
  videoUrl: string | null;
  doorPasscode: string | null;
  ownerName: string;
  ownerPhone: string;
  commissionDeal: string | null;
  internalNotes: string | null;
  leaseEndDate: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface FilterState {
  search: string;
  status: string; // 'ALL' | ApartmentStatus
  projectId: string;
  district: string;
  bedrooms: string; // 'ALL' | '1' | '2' | '3+'
  priceRange: string; // 'ALL' | 'under15' | '15to25' | 'over25'
  furniture: string; // 'ALL' | FurnitureStatus
  allowPetOnly: boolean;
  sortBy: 'newest' | 'priceAsc' | 'priceDesc' | 'areaDesc';
}
