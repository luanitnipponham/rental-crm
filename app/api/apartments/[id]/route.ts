import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apartment = await prisma.apartment.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!apartment) {
      return NextResponse.json({ error: 'Không tìm thấy căn hộ' }, { status: 404 });
    }

    return NextResponse.json(apartment);
  } catch (error) {
    console.error('Error fetching apartment:', error);
    return NextResponse.json({ error: 'Lỗi tải thông tin căn hộ' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      projectId,
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
      internalZaloPhone,
      commissionDeal,
      internalNotes,
      leaseEndDate,
      images,
      videoUrl,
    } = body;

    let processedImages: string[] | undefined = undefined;
    if (images !== undefined) {
      if (Array.isArray(images)) {
        processedImages = images.filter((img) => typeof img === 'string' && img.trim().length > 0);
      } else if (typeof images === 'string') {
        processedImages = images
          .split('\n')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }
    }

    const updated = await prisma.apartment.update({
      where: { id },
      data: {
        ...(projectId && { projectId }),
        ...(unitNumber && { unitNumber: unitNumber.trim() }),
        ...(bedrooms !== undefined && { bedrooms: Number(bedrooms) }),
        ...(bathrooms !== undefined && { bathrooms: Number(bathrooms) }),
        ...(areaSqm !== undefined && { areaSqm: areaSqm ? Number(areaSqm) : null }),
        ...(priceVnd !== undefined && { priceVnd: Number(priceVnd) }),
        ...(depositMonths !== undefined && { depositMonths: Number(depositMonths) }),
        ...(furniture && { furniture }),
        ...(allowPet !== undefined && { allowPet: Boolean(allowPet) }),
        ...(status && { status }),
        availableDate: availableDate ? new Date(availableDate) : null,
        doorPasscode: doorPasscode !== undefined ? doorPasscode?.trim() || null : undefined,
        ...(ownerName && { ownerName: ownerName.trim() }),
        ...(ownerPhone && { ownerPhone: ownerPhone.trim() }),
        internalZaloPhone:
          internalZaloPhone !== undefined ? internalZaloPhone?.trim() || null : undefined,
        commissionDeal: commissionDeal !== undefined ? commissionDeal?.trim() || null : undefined,
        internalNotes: internalNotes !== undefined ? internalNotes?.trim() || null : undefined,
        leaseEndDate: leaseEndDate ? new Date(leaseEndDate) : null,
        ...(processedImages !== undefined && { images: processedImages }),
        videoUrl: videoUrl !== undefined ? videoUrl?.trim() || null : undefined,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating apartment:', error);
    return NextResponse.json({ error: 'Không thể cập nhật căn hộ' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.apartment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa căn hộ thành công' });
  } catch (error) {
    console.error('Error deleting apartment:', error);
    return NextResponse.json({ error: 'Không thể xóa căn hộ' }, { status: 500 });
  }
}
