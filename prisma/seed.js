const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Xóa dữ liệu cũ nếu có
  await prisma.apartment.deleteMany({});
  await prisma.project.deleteMany({});

  // 1. Tạo các Dự án / Khu vực
  const p1 = await prisma.project.create({
    data: {
      name: 'Vinhomes Central Park',
      district: 'Bình Thạnh',
      address: '208 Nguyễn Hữu Cảnh, Phường 22',
    },
  });

  const p2 = await prisma.project.create({
    data: {
      name: 'Masteri Thảo Điền',
      district: 'TP. Thủ Đức',
      address: '159 Xa Lộ Hà Nội, Thảo Điền',
    },
  });

  const p3 = await prisma.project.create({
    data: {
      name: 'The Sun Avenue',
      district: 'TP. Thủ Đức',
      address: '28 Mai Chí Thọ, An Phú',
    },
  });

  const p4 = await prisma.project.create({
    data: {
      name: 'Nhà Phố Trung Tâm Quận 1',
      district: 'Quận 1',
      address: 'Hẻm xe hơi Đặng Dung, Phường Tân Định',
    },
  });

  const p5 = await prisma.project.create({
    data: {
      name: 'Kingdom 101',
      district: 'Quận 10',
      address: '334 Tô Hiến Thành, Phường 14',
    },
  });

  // 2. Tạo rổ hàng căn hộ / nhà phố
  const apartments = [
    {
      projectId: p1.id,
      unitNumber: 'Park 6 - 22.08',
      bedrooms: 2,
      bathrooms: 2,
      areaSqm: 78.5,
      priceVnd: 22000000,
      depositMonths: 2,
      furniture: 'FULL',
      allowPet: true,
      status: 'AVAILABLE',
      doorPasscode: '886622*',
      ownerName: 'Chị Mai Lan',
      ownerPhone: '0908123456',
      commissionDeal: '1 tháng (HĐ 1 năm)',
      internalNotes: 'Chủ nhà dễ tính, xem nhà báo trước 30 phút. Nội thất mới làm lại cuối năm ngoái.',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
      ],
      videoUrl: 'https://youtube.com/watch?v=example1',
    },
    {
      projectId: p1.id,
      unitNumber: 'Landmark 3 - 15.02',
      bedrooms: 1,
      bathrooms: 1,
      areaSqm: 54.0,
      priceVnd: 16500000,
      depositMonths: 2,
      furniture: 'FULL',
      allowPet: false,
      status: 'AVAILABLE',
      doorPasscode: '123789#',
      ownerName: 'Anh Tuấn Anh',
      ownerPhone: '0912345678',
      commissionDeal: '1 tháng (HĐ 1 năm)',
      internalNotes: 'View hồ bơi thoáng mát. Khách ở 1-2 người văn phòng ưu tiên.',
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      projectId: p1.id,
      unitNumber: 'Central 2 - 08.10',
      bedrooms: 3,
      bathrooms: 2,
      areaSqm: 110.0,
      priceVnd: 35000000,
      depositMonths: 2,
      furniture: 'FULL',
      allowPet: true,
      status: 'UPCOMING_SOON',
      availableDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      doorPasscode: '998877*',
      ownerName: 'Bác Hùng',
      ownerPhone: '0983112233',
      commissionDeal: '50% tháng đầu',
      internalNotes: 'Khách Hàn Quốc chuẩn bị trả nhà ngày 01 tới. Đã có thể hẹn dẫn khách xem trước.',
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      projectId: p2.id,
      unitNumber: 'T2 - 18.04',
      bedrooms: 2,
      bathrooms: 2,
      areaSqm: 72.0,
      priceVnd: 19000000,
      depositMonths: 2,
      furniture: 'FULL',
      allowPet: true,
      status: 'AVAILABLE',
      doorPasscode: '567890*',
      ownerName: 'Chị Thu Thảo',
      ownerPhone: '0938776655',
      commissionDeal: '1 tháng (HĐ 1 năm)',
      internalNotes: 'Gần ga Metro, ban công đông nam mát mẻ cả ngày. Pass khóa vân tay + số.',
      images: [
        'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab32f?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      projectId: p2.id,
      unitNumber: 'T4 - 05.01',
      bedrooms: 1,
      bathrooms: 1,
      areaSqm: 49.5,
      priceVnd: 14000000,
      depositMonths: 1,
      furniture: 'BASIC',
      allowPet: false,
      status: 'RENTED',
      leaseEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      doorPasscode: '112233#',
      ownerName: 'Anh Minh Khang',
      ownerPhone: '0903998877',
      commissionDeal: 'Đã nhận',
      internalNotes: 'Khách thuê người Nhật ký HĐ 1 năm đến cuối năm.',
      images: [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      projectId: p3.id,
      unitNumber: 'SAV5 - 12.06',
      bedrooms: 2,
      bathrooms: 2,
      areaSqm: 75.0,
      priceVnd: 17500000,
      depositMonths: 2,
      furniture: 'FULL',
      allowPet: false,
      status: 'AVAILABLE',
      doorPasscode: '246810*',
      ownerName: 'Anh Đức Trí',
      ownerPhone: '0945678901',
      commissionDeal: '1 tháng',
      internalNotes: 'Căn góc 2 mặt thoáng view Mai Chí Thọ. Đầy đủ máy giặt sấy.',
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      projectId: p3.id,
      unitNumber: 'SAV3 - 20.03',
      bedrooms: 1,
      bathrooms: 1,
      areaSqm: 51.0,
      priceVnd: 13500000,
      depositMonths: 2,
      furniture: 'FULL',
      allowPet: true,
      status: 'DEPOSITED',
      doorPasscode: '334455*',
      ownerName: 'Cô Bích',
      ownerPhone: '0918223344',
      commissionDeal: '1 tháng',
      internalNotes: 'Khách vừa đặt cọc 10tr giữ chỗ, dự kiến ký HĐ ngày 25.',
      images: [
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      projectId: p4.id,
      unitNumber: 'Nhà 42/8 Đặng Dung',
      bedrooms: 3,
      bathrooms: 3,
      areaSqm: 120.0,
      priceVnd: 38000000,
      depositMonths: 2,
      furniture: 'BASIC',
      allowPet: true,
      status: 'AVAILABLE',
      doorPasscode: 'Chìa khóa hộp mã số 0808',
      ownerName: 'Chú Sáu Hải',
      ownerPhone: '0903114477',
      commissionDeal: '1 tháng',
      internalNotes: 'Nhà 1 trệt 2 lầu sân thượng. Phù hợp vừa ở vừa làm văn phòng hoặc studio.',
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      projectId: p5.id,
      unitNumber: 'Tháp A - 16.05',
      bedrooms: 2,
      bathrooms: 2,
      areaSqm: 79.0,
      priceVnd: 21000000,
      depositMonths: 2,
      furniture: 'FULL',
      allowPet: false,
      status: 'AVAILABLE',
      doorPasscode: '909012*',
      ownerName: 'Chị Kim Oanh',
      ownerPhone: '0977889900',
      commissionDeal: '1 tháng (HĐ 1 năm)',
      internalNotes: 'Ngay trung tâm Q10, tiện đi lại các quận 1, 3, 5. Nội thất nhập khẩu cao cấp.',
      images: [
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
      ],
    },
  ];

  for (const apt of apartments) {
    await prisma.apartment.create({ data: apt });
  }

  console.log(`✅ Seeded ${apartments.length} apartments across 5 projects successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
