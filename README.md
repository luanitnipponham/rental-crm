# 🏢 Rental CRM - Quản Lý Rổ Hàng BĐS Nhà Phố & Căn Hộ Cho Thuê

Ứng dụng web chuyên nghiệp hỗ trợ môi giới Bất Động Sản quản lý rổ hàng căn hộ & nhà phố, tra cứu nhanh thông tin chủ nhà, mật khẩu cửa xem nhà (passcode), tự động sinh tin đăng Zalo chào khách, và đồng bộ cơ sở dữ liệu PostgreSQL qua Prisma ORM.

---

## 🚀 Tính Năng Nổi Bật

1. **Dashboard KPI & Thống Kê Rổ Hàng**:
   - Thống kê thời gian thực: Tổng số căn, Căn đang trống (sẵn sàng dẫn khách), Căn sắp trống (chuẩn bị chào khách tái thuê), Căn đã cọc/thuê.
   - Bấm vào từng thẻ KPI để lọc nhanh danh sách.

2. **Bộ Lọc & Tìm Kiếm Thông Minh**:
   - Tìm kiếm đa năng: Theo mã căn, tên dự án, đường, tên chủ nhà, số điện thoại, pass cửa.
   - Lọc theo Khu vực (Quận/Huyện), Dự án, Số phòng ngủ (1PN, 2PN, 3PN+), Khoảng giá, và Tiện ích cho nuôi thú cưng (🐾 Pet OK).
   - Sắp xếp linh hoạt theo giá thuê (tăng/giảm dần), diện tích, hoặc mới cập nhật nhất.

3. **Hộp Thông Tin Môi Giới Bảo Mật**:
   - Lưu trữ số điện thoại chủ nhà (hỗ trợ 1-click gọi điện `tel:...`).
   - Mật khẩu mở cửa xem nhà (Passcode) kèm nút sao chép nhanh 1-chạm.
   - Thỏa thuận mức phí hoa hồng môi giới & ghi chú nội bộ bảo mật.

4. **Tính Năng "Copy Tin Zalo Chào Khách" (Sát thủ môi giới)**:
   - 1-click tự động định dạng mẫu tin nhắn chào khách đầy đủ thông số (Dự án, diện tích, giá, nội thất, tiện ích).
   - **Tự động ẩn Mật khẩu cửa và Số điện thoại chủ nhà** để an tâm gửi trực tiếp cho khách hàng trên Zalo, Facebook, SMS.

5. **Quản Lý Danh Mục Dự Án**:
   - Thêm và theo dõi rổ hàng của từng dự án/tuyến phố.
   - Hỗ trợ thêm nhanh dự án mới trực tiếp từ form thêm căn hộ.

6. **Hỗ Trợ PWA (Progressive Web App)**:
   - Cài đặt như một ứng dụng Native trên điện thoại (iPhone/Android) và máy tính (Windows/Mac) với icon riêng và giao diện toàn màn hình.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: Next.js 16 (App Router, React 19, TypeScript), Tailwind CSS, Lucide Icons.
- **Backend**: Next.js API Routes (Server Components & Route Handlers).
- **ORM & Database**: Prisma ORM v6 + PostgreSQL (`rental_db`).
- **PWA**: Web App Manifest (`manifest.json`), Service Worker (`sw.js`).

---

## 📋 Hướng Dẫn Vận Hành & Sử Dụng

### 1. Khởi động môi trường phát triển (Dev Server)
Mở terminal tại thư mục dự án và chạy:
```bash
npm run dev
```
Truy cập trình duyệt: [http://localhost:3000](http://localhost:3000)

### 2. Quản lý Cơ sở dữ liệu (Prisma & PostgreSQL)
- **Đồng bộ Schema vào Database**:
  ```bash
  npx prisma db push
  ```
- **Nạp dữ liệu mẫu phong phú (Seeding)**:
  ```bash
  node prisma/seed.js
  ```
- **Mở giao diện trực quan Prisma Studio**:
  ```bash
  npx prisma studio
  ```
  Truy cập: [http://localhost:5555](http://localhost:5555)

### 3. Build chạy Production
```bash
npm run build
npm run start
```
