import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const projectId = searchParams.get('projectId') || '';
    const district = searchParams.get('district') || '';
    const bedrooms = searchParams.get('bedrooms') || '';
    const priceRange = searchParams.get('priceRange') || '';
    const allowPetOnly = searchParams.get('allowPetOnly') === 'true';
    const sortBy = searchParams.get('sortBy') || 'newest';

    const where: Prisma.ApartmentWhereInput = {};

    // Search query: mã căn, tên dự án, tên chủ, sđt, pass
    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { unitNumber: { contains: q, mode: 'insensitive' } },
        { ownerName: { contains: q, mode: 'insensitive' } },
        { ownerPhone: { contains: q, mode: 'insensitive' } },
        { doorPasscode: { contains: q, mode: 'insensitive' } },
        { project: { name: { contains: q, mode: 'insensitive' } } },
        { project: { district: { contains: q, mode: 'insensitive' } } },
        { internalNotes: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status as any;
    }

    if (projectId && projectId !== 'ALL') {
      where.projectId = projectId;
    }

    if (district && district !== 'ALL') {
      where.project = { district };
    }

    if (bedrooms && bedrooms !== 'ALL') {
      if (bedrooms === '3+') {
        where.bedrooms = { gte: 3 };
      } else {
        where.bedrooms = parseInt(bedrooms, 10);
      }
    }

    if (priceRange && priceRange !== 'ALL') {
      if (priceRange === 'under15') {
        where.priceVnd = { lt: 15000000 };
      } else if (priceRange === '15to25') {
        where.priceVnd = { gte: 15000000, lte: 25000000 };
      } else if (priceRange === 'over25') {
        where.priceVnd = { gt: 25000000 };
      }
    }

    if (allowPetOnly) {
      where.allowPet = true;
    }

    let orderBy: Prisma.ApartmentOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'priceAsc') {
      orderBy = { priceVnd: 'asc' };
    } else if (sortBy === 'priceDesc') {
      orderBy = { priceVnd: 'desc' };
    } else if (sortBy === 'areaDesc') {
      orderBy = { areaSqm: 'desc' };
    }

    const apartments = await prisma.apartment.findMany({
      where,
      include: {
        project: true,
      },
      orderBy,
    });

    return NextResponse.json(apartments);
  } catch (error) {
    console.error('Error fetching apartments:', error);
    return NextResponse.json({ error: 'Không thể tải danh sách căn hộ' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      projectId,
      newProjectName,
      newProjectDistrict,
      unitNumber,
      bedrooms,
      bathrooms,
      areaSqm,
      priceVnd,
      depositMonths,
      furniture,
      allowPet,
      status,
      availableDate,
      doorPasscode,
      ownerName,
      ownerPhone,
      commissionDeal,
      internalNotes,
      leaseEndDate,
      images,
      videoUrl,
    } = body;

    // Validate required fields
    if (!unitNumber || !priceVnd || !ownerName || !ownerPhone) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ Mã căn, Giá thuê, Tên và SĐT chủ nhà' },
        { status: 400 }
      );
    }

    let finalProjectId = projectId;

    // Nếu chọn tạo nhanh dự án mới
    if (projectId === 'NEW' || !projectId) {
      if (!newProjectName) {
        return NextResponse.json(
          { error: 'Vui lòng chọn hoặc nhập tên dự án' },
          { status: 400 }
        );
      }
      const newProj = await prisma.project.create({
        data: {
          name: newProjectName.trim(),
          district: newProjectDistrict?.trim() || 'TP.HCM',
        },
      });
      finalProjectId = newProj.id;
    }

    // Process images (array of URLs or comma separated)
    let processedImages: string[] = [];
    if (Array.isArray(images)) {
      processedImages = images.filter((img) => typeof img === 'string' && img.trim().length > 0);
    } else if (typeof images === 'string' && images.trim()) {
      processedImages = images
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    const apartment = await prisma.apartment.create({
      data: {
        projectId: finalProjectId,
        unitNumber: unitNumber.trim(),
        bedrooms: Number(bedrooms) || 1,
        bathrooms: Number(bathrooms) || 1,
        areaSqm: areaSqm ? Number(areaSqm) : null,
        priceVnd: Number(priceVnd),
        depositMonths: Number(depositMonths) || 1,
        furniture: furniture || 'FULL',
        allowPet: Boolean(allowPet),
        status: status || 'AVAILABLE',
        availableDate: availableDate ? new Date(availableDate) : null,
        doorPasscode: doorPasscode?.trim() || null,
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
        commissionDeal: commissionDeal?.trim() || null,
        internalNotes: internalNotes?.trim() || null,
        leaseEndDate: leaseEndDate ? new Date(leaseEndDate) : null,
        images: processedImages,
        videoUrl: videoUrl?.trim() || null,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(apartment, { status: 201 });
  } catch (error) {
    console.error('Error creating apartment:', error);
    return NextResponse.json({ error: 'Không thể thêm căn hộ mới' }, { status: 500 });
  }
}
