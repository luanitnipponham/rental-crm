# HƯỚNG DẪN KHỞI TẠO DỰ ÁN WEB APP QUẢN LÝ RỔ HÀNG (NEXT.JS + PRISMA + PWA)

## BƯỚC 1: LỆNH CÀI ĐẶT MÔI TRƯỜNG (TERMINAL)
npm install next-pwa lucide-react react-hook-form @hookform/resolvers zod @prisma/client
npm install prisma --save-dev
npx shadcn-ui@latest init

--------------------------------------------------

## BƯỚC 2: TẠO CÁC FILE CẤU HÌNH HỆ THỐNG

### File: docker-compose.yml (Thư mục gốc)
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: rental_postgres
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: adminpassword
      POSTGRES_DB: rental_db
    ports:
      - "5432:5432"
    restart: unless-stopped


### File: .env (Thư mục gốc)
DATABASE_URL="postgresql://admin:adminpassword@localhost:5432/rental_db?schema=public"


### File: next.config.js (Thư mục gốc)
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);


### File: public/manifest.json
{
  "name": "Rental CRM",
  "short_name": "RentalCRM",
  "description": "Hệ thống quản lý rổ hàng căn hộ",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}

--------------------------------------------------

## BƯỚC 3: TẠO DATABASE SCHEMA

### File: prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum ApartmentStatus {
  AVAILABLE
  UPCOMING_SOON
  DEPOSITED
  RENTED
}

enum FurnitureStatus {
  EMPTY
  BASIC
  FULL
}

model Project {
  id          String      @id @default(uuid())
  name        String
  district    String
  address     String?
  apartments  Apartment[]
  createdAt   DateTime    @default(now())
}

model Apartment {
  id              String          @id @default(uuid())
  projectId       String
  project         Project         @relation(fields: [projectId], references: [id])
  
  unitNumber      String
  bedrooms        Int             @default(1)
  bathrooms       Int             @default(1)
  areaSqm         Float?
  priceVnd        Int
  depositMonths   Int             @default(1)
  furniture       FurnitureStatus @default(FULL)
  allowPet        Boolean         @default(false)
  status          ApartmentStatus @default(AVAILABLE)
  availableDate   DateTime?
  
  images          String[]
  videoUrl        String?
  doorPasscode    String?
  
  ownerName       String
  ownerPhone      String
  commissionDeal  String?
  internalNotes   String?
  
  leaseEndDate    DateTime?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

--------------------------------------------------

## BƯỚC 4: TẠO GIAO DIỆN MÃ NGUỒN FRONTEND

### File: app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rental CRM Dashboard",
  description: "Quản lý rổ hàng căn hộ cho thuê",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}


### File: app/page.tsx
import { PrismaClient } from '@prisma/client'
import { Phone, Copy, Plus } from 'lucide-react'

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function Home() {
  const apartments = await prisma.apartment.findMany({
    include: { project: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center border-b">
        <h1 className="text-xl font-bold text-slate-800">Rổ Hàng Của Tôi</h1>
        <button className="bg-blue-600 text-white px-3 py-2 rounded-lg font-medium shadow flex items-center gap-1 text-sm active:bg-blue-700">
          <Plus size={16}/> Thêm Căn
        </button>
      </div>

      <div className="p-4 space-y-4">
        {apartments.length === 0 ? (
          <div className="text-center text-slate-500 mt-10">Chưa có dữ liệu. Hãy thêm căn hộ mới.</div>
        ) : (
          apartments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
               <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg text-slate-900">{apt.unitNumber} - {apt.project.name}</h3>
                  <span className="text-blue-600 font-bold text-lg">{(apt.priceVnd / 1000000).toFixed(1)} Tr</span>
               </div>
               <p className="text-sm text-slate-600 mb-3 font-medium">
                 {apt.bedrooms}PN • {apt.bathrooms}WC • {apt.furniture} {apt.allowPet && '• 🐾 Pet OK'}
               </p>
               
               <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg mb-4">
                  <div className="flex justify-between">
                    <p className="text-sm text-orange-900 font-semibold">Chủ: {apt.ownerName}</p>
                    <p className="text-sm text-orange-900 font-mono">{apt.ownerPhone}</p>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-orange-700">
                    <p>Pass: <span className="font-mono bg-orange-100 px-1 rounded">{apt.doorPasscode || 'N/A'}</span></p>
                    <p>HH: {apt.commissionDeal || 'Thỏa thuận'}</p>
                  </div>
               </div>

               <div className="flex gap-3">
                  <a href={`tel:${apt.ownerPhone}`} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-center py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                    <Phone size={16}/> Gọi Chủ
                  </a>
                  <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-center py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                    <Copy size={16}/> Copy Zalo
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}