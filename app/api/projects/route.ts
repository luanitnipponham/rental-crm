import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: { apartments: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Không thể tải danh sách dự án' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, district, address } = body;

    if (!name || !district) {
      return NextResponse.json({ error: 'Tên dự án và Quận/Huyện là bắt buộc' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        district: district.trim(),
        address: address?.trim() || null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Không thể tạo dự án mới' }, { status: 500 });
  }
}
