# Đăng nhập, đăng xuất và phân quyền (US02 / T04)

## Đăng nhập

`POST /api/auth/login` với JSON `{ "email": "reader@example.com", "password": "..." }`.

- HTTP `200`: `{ "user": { "id", "email", "displayName", "role" } }` và cookie `booknest_session` có `HttpOnly`, `SameSite=Lax`, thời hạn 7 ngày. Trên HTTPS cookie có thêm `Secure`.
- HTTP `400`: thiếu email hoặc mật khẩu. HTTP `401`: thông tin đăng nhập sai.
- Token phiên ngẫu nhiên chỉ gửi trong cookie; D1 chỉ lưu SHA-256 của token.

## Xem tài khoản và đăng xuất

- `GET /api/auth/me`: trả `{ "user": ... }` nếu phiên còn hiệu lực; nếu không trả `401`.
- `POST /api/auth/logout`: thu hồi phiên trong D1 và xóa cookie; phiên cũ dùng lại trả `401`.
- `GET /api/admin/me`: endpoint xác nhận quyền admin; khách đã đăng nhập nhận `403`, chưa đăng nhập nhận `401`. Các API quản trị sau này phải gọi cùng hàm `requireUser(request, env, "admin")` trước khi xử lý dữ liệu.

Trình duyệt phải gửi cookie khi gọi API (`credentials: "include"`). Các lệnh POST tài khoản chỉ chấp nhận `Origin` cùng origin với Worker; khi làm frontend local cần dùng proxy hoặc phục vụ chung origin. Không đưa role từ request đăng ký vào database.
