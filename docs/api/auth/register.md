# Đăng ký khách hàng (US01 / T03)

`POST /api/auth/register` với `Content-Type: application/json`.

```json
{
  "email": "reader@example.com",
  "password": "mat-khau-du-8-ky-tu",
  "displayName": "Độc giả"
}
```

Thành công: HTTP `201`, trả `id`, `email`, `displayName`, `role: "customer"`. Không trả mật khẩu hoặc mã băm. Email được bỏ khoảng trắng hai đầu, chuyển chữ thường, và phải duy nhất không phân biệt hoa/thường.

Lỗi đầu vào: HTTP `400`; email đã có: HTTP `409`. Mật khẩu dài 8–128 ký tự, tên hiển thị dài 1–100 ký tự. Mật khẩu được băm PBKDF2-SHA-256 với salt ngẫu nhiên trước khi lưu. API không nhận vai trò từ request; tài khoản mới luôn là khách hàng.
