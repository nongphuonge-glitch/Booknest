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
- [API đăng ký khách hàng](docs/api/auth/register.md) (US01 / T03, đang triển khai).
- [API phiên và phân quyền](docs/api/auth/session.md) (US02 / T04).

Quy trình nhánh: `main` → `develop` → `feature/<ten-cong-viec>`. Tính năng được làm trên feature rồi gộp vào `develop` sau khi kiểm tra.
