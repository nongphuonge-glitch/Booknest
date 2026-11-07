# Giao diện tài khoản BookNest

Frontend React + Vite + TypeScript cho Epic Tài khoản và phân quyền.

## Chạy local

1. Trong `backend`, chạy `npm install`, `npm run db:migrate:local`, rồi `npm run dev`.
2. Trong `frontend`, chạy `npm install`, rồi `npm run dev`.
3. Mở địa chỉ Vite in ra, mặc định `http://127.0.0.1:5173`.

Vite chuyển `/api` sang Worker ở `127.0.0.1:8787`, để trình duyệt gửi cookie phiên khi đăng nhập và đăng xuất. Khi đưa cả website lên cloud, cần cấu hình cùng origin cho frontend và API.

Chạy `npm run check` để kiểm tra TypeScript và `npm run build` để kiểm tra bản build.
