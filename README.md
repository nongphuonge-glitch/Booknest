# BookNest

Website bán sách theo kế hoạch trong `BookNest-Epic-US-Tasks.xlsx`. Phạm vi gồm tài khoản khách và admin, danh mục sách, giỏ hàng, đơn COD; triển khai dự kiến bằng Cloudflare Workers và D1.

## Cấu trúc dự án

```text
Booknest/
├── backend/                 # API Worker và migration SQLite/D1
│   └── db/migrations/       # Schema theo thứ tự phiên bản
├── frontend/                # Giao diện khách hàng và quản trị
├── docs/                    # ERD, hợp đồng API và tài liệu dự án
└── README.md
```

Bố cục cấp cao theo dự án `nguon-goc-so`: tách backend, frontend và tài liệu. Công nghệ và các thư mục con sẽ theo kiến trúc Workers/D1 của BookNest, không sao chép cấu hình Spring Boot, MySQL hay Kubernetes.

## Công việc hiện có

- [Mô hình dữ liệu tài khoản](docs/account-data-model.md) (T01 / BOOK-29).
- [Migration users và sessions](backend/db/migrations/0001_accounts.sql).
- [Backend Worker và hướng dẫn chạy local](backend/README.md).
- [API đăng ký khách hàng](docs/api/auth/register.md) (US01 / T03).
- [API phiên và phân quyền](docs/api/auth/session.md) (US02 / T04).
- [Giao diện tài khoản và hướng dẫn chạy](frontend/README.md) (BOOK-28 / BOOK-30).
- [Tiến độ Epic tài khoản](docs/epic-account.md).
- [Tiến độ Epic Danh mục & Tồn kho](docs/epic-catalog-inventory.md) (US03, US04, US05, US06).
- [Tiến độ Epic Đơn hàng COD & Tích hợp](docs/epic-orders.md) (US07, US08, US09).
- [Mô hình dữ liệu sách và danh mục](docs/books-data-model.md).
- [Mô hình dữ liệu đơn hàng COD](docs/orders-data-model.md).
- [Migration books và categories](backend/db/migrations/0002_books.sql).
- [Migration orders và order_items](backend/db/migrations/0003_orders.sql).
- [Hợp đồng API Tủ sách & Danh mục](docs/api/books/catalog.md).
- [Hợp đồng API Quản trị Sách & Tồn kho](docs/api/books/admin.md).
- [Hợp đồng API Đặt hàng COD](docs/api/orders/checkout.md).
- [Hợp đồng API Quản trị & Lịch sử Đơn hàng](docs/api/orders/admin.md).
- [Báo cáo Mini Project hoàn chỉnh (7 phần)](docs/bao-cao-mini-project.md) (US11 / T24, T26).
- [Hướng dẫn triển khai Cloudflare Workers & D1](docs/huong-dan-deploy-cloudflare.md) (US10 / T20, T21).
- [Kịch bản Demo & Khung Slide 5–7 phút](docs/kich-ban-demo.md) (US11 / T25, T26).
- [Quy trình Git Flow của nhóm](docs/git-flow.md).

## Hướng dẫn chạy thử nghiệm trên máy (Local Development)

### 1. Khởi chạy Backend Worker & CSDL D1 Local
```bash
cd backend
npm install
npm run db:migrate:local   # Áp dụng 3 file migration và nạp sách/đơn mẫu vào SQLite local
npm run dev                # Khởi động Worker tại http://127.0.0.1:8787
```

### 2. Khởi chạy Frontend React + Vite
```bash
cd frontend
npm install
npm run dev                # Khởi động giao diện web tại http://127.0.0.1:5173
```
Mở trình duyệt truy cập `http://127.0.0.1:5173` để trải nghiệm toàn bộ hệ thống!

---

Quy trình nhánh: `main` → `develop` → `feature/<ten-cong-viec>`. Chi tiết xem tại [Tài liệu Git Flow](docs/git-flow.md).
