# Hướng dẫn chi tiết triển khai BookNest lên Cloudflare (Workers & D1)

Tài liệu này cung cấp các bước chi tiết để triển khai hệ thống BookNest lên hạ tầng Cloudflare thực tế cho nhóm sinh viên, chuẩn bị ảnh chụp minh chứng cho Báo cáo (Phần 5).

---

## 1. Chuẩn bị trước khi triển khai

1. **Tài khoản Cloudflare**: Đăng ký miễn phí tại [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) (không cần nhập thẻ tín dụng).
2. **Môi trường máy tính**: Đã cài đặt **Node.js** (v18 trở lên) và **npm**.
3. **Mã nguồn dự án**: Đã tải hoặc clone từ [https://github.com/nongphuonge-glitch/Booknest.git](https://github.com/nongphuonge-glitch/Booknest.git).

---

## 2. Các bước triển khai chi tiết

### Bước 1: Đăng nhập vào Cloudflare từ máy tính
Mở Terminal/PowerShell tại thư mục gốc dự án và chạy:
```bash
npx wrangler login
```
*Trình duyệt web sẽ mở ra yêu cầu xác thực. Chọn **Allow** để cấp quyền cho Wrangler.*

> 📷 **Chụp ảnh 1**: Màn hình trình duyệt thông báo cấp quyền thành công cho Wrangler và thông báo "Successfully logged in" trên Terminal.

---

### Bước 2: Tạo Cơ sở dữ liệu Cloudflare D1
Chạy lệnh tạo CSDL D1 có tên là `booknest`:
```bash
npx wrangler d1 create booknest
```
Wrangler sẽ trả về đoạn cấu hình tương tự như sau:
```text
✅ Successfully created DB 'booknest'
[[d1_databases]]
binding = "DB"
database_name = "booknest"
database_id = "c82b94a1-4321-4def-9876-123456789abc"
```

Sao chép chuỗi `database_id` vừa nhận được và dán vào file [`backend/wrangler.jsonc`](../backend/wrangler.jsonc):
```jsonc
{
  "name": "booknest-api",
  "main": "src/index.ts",
  "compatibility_date": "2026-11-07",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "booknest",
      "database_id": "c82b94a1-4321-4def-9876-123456789abc", // <-- Dán ID của nhóm vào đây
      "migrations_dir": "db/migrations"
    }
  ]
}
```

> 📷 **Chụp ảnh 2**: Kết quả tạo Database ID trên Terminal và màn hình D1 Database xuất hiện trên [Cloudflare Dashboard](https://dash.cloudflare.com).

---

### Bước 3: Áp dụng CSDL (Migrations) lên Cloudflare D1
Di chuyển vào thư mục backend và thực thi lệnh áp dụng toàn bộ schema lên cloud:
```bash
cd backend
npx wrangler d1 migrations apply booknest --remote
```
Xác nhận `y` khi được hỏi. Hệ thống sẽ áp dụng 3 migrations:
1. `0001_accounts.sql`: Tạo bảng người dùng (`users`) và phiên (`sessions`).
2. `0002_books.sql`: Tạo bảng danh mục (`categories`), sách (`books`) và nạp 18 cuốn sách mẫu.
3. `0003_orders.sql`: Tạo bảng đơn hàng (`orders`), chi tiết đơn (`order_items`) và nạp đơn mẫu.

> 📷 **Chụp ảnh 3**: Terminal thông báo apply 3 migration thành công và giao diện Cloudflare D1 Console hiển thị danh sách các bảng dữ liệu.

---

### Bước 4: Deploy Backend API Worker lên Cloudflare
Tiếp tục trong thư mục backend, chạy lệnh:
```bash
npm run deploy
```
Sau khoảng 10–15 giây, Wrangler sẽ trả về đường dẫn API công khai:
```text
Total Upload: 45.2 KiB / gzip: 12.1 KiB
Uploaded booknest-api (1.20 sec)
Deployed booknest-api triggers:
  https://booknest-api.<account-subdomain>.workers.dev
```

Kiểm tra API hoạt động bằng cách mở trình duyệt truy cập:
`https://booknest-api.<account-subdomain>.workers.dev/api/health` ➔ Nhận kết quả `{"status":"ok"}`.

> 📷 **Chụp ảnh 4**: Terminal thông báo deploy Worker thành công và màn hình Workers & Pages trên Cloudflare Dashboard hiển thị trạng thái `Active`.

---

### Bước 5: Build và Deploy Frontend lên Cloudflare Pages
Di chuyển sang thư mục frontend:
```bash
cd ../frontend
npm run build
npx wrangler pages deploy dist --project-name booknest-web
```
Cloudflare Pages sẽ tải các file tĩnh trong thư mục `dist` lên mạng phân phối CDN toàn cầu và cung cấp URL truy cập trang web (ví dụ: `https://booknest-web.pages.dev`).

> 📷 **Chụp ảnh 5**: Màn hình Cloudflare Pages Deployments hiển thị URL online của trang web.

---

## 3. Kiểm soát chi phí và an toàn tài khoản

* Dịch vụ Workers và D1 trong phạm vi đồ án hoàn toàn nằm trong gói **Free Tier vĩnh viễn** của Cloudflare.
* Không cần add thẻ thanh toán, không lo tự động gia hạn hay phát sinh cước phí ngoài ý muốn.
* Có thể theo dõi lưu lượng truy cập hàng ngày tại tab **Analytics & Logs** trên Cloudflare Dashboard.
