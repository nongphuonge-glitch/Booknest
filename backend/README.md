# Backend BookNest

Worker TypeScript xử lý API và truy cập Cloudflare D1.

## Chạy local

Yêu cầu Node.js và npm. Từ thư mục `backend`:

```sh
npm install
npm run db:migrate:local
npm run dev
```

Kiểm tra `GET /api/health` và `GET /api/health/db` tại địa chỉ Wrangler in ra (mặc định `http://localhost:8787`). Chạy `npm run check` để kiểm tra TypeScript.

API đầu tiên: `POST /api/auth/register` theo [hợp đồng đăng ký](../docs/api/auth/register.md).

`database_id` trong `wrangler.jsonc` hiện là giá trị tạm cho phát triển local. Trước khi triển khai, tạo D1 trên tài khoản Cloudflare và thay bằng ID thật; không chạy `npm run deploy` khi chưa cấu hình database production.
