# Epic tài khoản và phân quyền (BOOK-6)

| Jira | Kết quả trong repo |
| --- | --- |
| BOOK-29 | ERD và migration `users`, `sessions` cho D1 local. |
| BOOK-28 | Form đăng ký và đăng nhập responsive, có trường email, mật khẩu, tên hiển thị và vị trí báo lỗi. |
| BOOK-27 | API đăng ký băm mật khẩu, chuẩn hóa email, từ chối email trùng. |
| BOOK-31 | Đăng nhập, phiên cookie, đăng xuất thu hồi phiên và hàm kiểm tra quyền API. |
| BOOK-30 | Form gọi API qua Vite proxy; hiển thị tên sau đăng nhập và lỗi khi sai mật khẩu. |

Chạy hai tiến trình local theo [backend](../backend/README.md) và [frontend](../frontend/README.md). Luồng kiểm tra: tạo email mới, đăng nhập sai mật khẩu, đăng nhập đúng, tải lại trang để đọc phiên, thử API admin bằng tài khoản khách, đăng xuất và thử dùng lại phiên cũ. Các API quản trị hoặc đơn hàng được thêm về sau phải dùng `requireUser` trước khi truy cập dữ liệu; riêng quyền đọc/sửa đơn thuộc task kiểm tra đơn hàng ở Epic khác.

Epic này chưa được triển khai lên Cloudflare. `database_id` trong Wrangler là giá trị local tạm; khi triển khai cần tạo D1 thật và cấu hình ID tương ứng.
