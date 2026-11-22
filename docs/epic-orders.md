# Epic Đặt hàng COD & Xử lý đơn hàng (Epic E4 & E5)

Tài liệu theo dõi tiến độ hoàn thành các User Story và Task thuộc Epic E4 (Đặt hàng COD & Xử lý đơn) và Epic E5 (Kiểm thử tích hợp local) trên nhánh `feature/E4-orders-cod`.

---

## 1. Bảng đối chiếu tiến độ User Story & Task

| Mã | Hạng mục | Người phụ trách | Kết quả trong kho mã nguồn | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **US07** | Đặt đơn COD | Hoang Duy Hanh & Nong Minh Phuong | API `POST /api/orders`, tính giá server-side (`BR05`), trừ kho atomic (`BR04`), modal form `CheckoutModal.tsx`. | **Hoàn thành** |
| **US08** | Xử lý và theo dõi đơn | Hoang Duy Hanh & Tran Van Nhu | API `GET /api/orders/my` (khách), `GET /api/admin/orders` (admin), `PATCH /api/admin/orders/:id/status`, giao diện `CustomerOrders.tsx` và `AdminOrders.tsx`. | **Hoàn thành** |
| **US09** | Nghiệm thu luồng mua sách | Tran Van Nhu | Kiểm thử tích hợp toàn bộ luồng: Đăng ký/đăng nhập ➔ Chọn sách vào giỏ ➔ Đặt đơn COD ➔ Trừ tồn kho ➔ Admin duyệt đơn ➔ Khách xem lịch sử. | **Hoàn thành** |

---

## 2. Tiêu chuẩn nghiệm thu chi tiết (Acceptance Criteria)

* **AC07 (Đặt đơn COD & Kiểm tra tồn kho)**:
  * Khách hàng đã đăng nhập tiến hành đặt hàng COD với họ tên, số điện thoại, địa chỉ nhận hàng.
  * Nếu sách còn đủ tồn kho (`stock >= quantity`) ➔ Tạo đơn thành công với mã `BN-XXXXXX`, tồn kho tự động trừ trong cùng giao dịch D1 batch (`BR04`).
  * Nếu số lượng đặt vượt quá tồn kho (hoặc khi tồn kho = 0) ➔ Máy chủ từ chối đơn với thông báo lỗi rõ ràng `"Sách '...' chỉ còn ... cuốn trong kho, không đủ đáp ứng số lượng bạn đặt"`. Kho được giữ nguyên và không sinh mã đơn rác.
  * Phí vận chuyển được máy chủ tính toán tự động: 0đ nếu tiền sách ≥ 300.000đ; 25.000đ nếu tiền sách < 300.000đ (`BR05`).
* **AC08 (Xử lý và theo dõi trạng thái đơn hàng)**:
  * Đơn hàng mới tạo có trạng thái mặc định là `Chờ xác nhận`.
  * Quản trị viên mở trang "Quản lý đơn" ➔ Xem được toàn bộ đơn hàng kèm các thẻ thống kê (Tổng đơn, Chờ xác nhận, Đang giao, Doanh thu hoàn thành).
  * Quản trị viên đổi trạng thái sang `Đã xác nhận` ➔ `Đang giao` ➔ `Hoàn thành`.
  * Nếu quản trị viên chọn `Đã hủy` ➔ Hệ thống tự động hoàn lại số lượng sách đã đặt vào kho `books.stock`.
* **AC09 (Phân quyền & Bảo mật đơn hàng)**:
  * Khách hàng A chỉ đọc được các đơn hàng của mình tại tab "Đơn hàng" (`orders.user_id = user.id`), không xem được đơn của khách hàng B (`BR02`).
  * Khách hàng thông thường không thể truy cập API quản trị đơn hàng (`GET /api/admin/orders` hoặc `PATCH /api/admin/orders/:id/status` trả về `403 Forbidden`).

---

## 3. Tài liệu kỹ thuật liên quan

* [Mô hình dữ liệu đơn hàng COD](orders-data-model.md)
* [Migration SQLite/D1 đơn hàng](../backend/db/migrations/0003_orders.sql)
* [Hợp đồng API Đặt hàng COD](api/orders/checkout.md)
* [Hợp đồng API Quản trị & Lịch sử Đơn hàng](api/orders/admin.md)
