# Hợp đồng API Quản trị & Lịch sử Đơn hàng (US08 / T16, T17, T18)

Tài liệu này bao gồm endpoint lịch sử đơn của khách và các endpoint xử lý trạng thái đơn hàng của quản trị viên.

---

## 1. Khách hàng xem lịch sử đơn hàng cá nhân (US08, BR02)
* **Method**: `GET`
* **Path**: `/api/orders/my`
* **Xác thực**: Yêu cầu đã đăng nhập (`session cookie`). Khách hàng chỉ xem được các đơn thuộc sở hữu của chính mình (`orders.user_id = user.id`), không truy cập được đơn của người khác (`BR02`).
* **Phản hồi 200 OK**:
  ```json
  {
    "orders": [
      {
        "id": "BN-M8K2X1",
        "customer_name": "Nguyễn Văn An",
        "phone": "0912345678",
        "address": "Số 15 Lê Duẩn, Quận 1, TP. Hồ Chí Minh",
        "note": "Giao vào giờ hành chính",
        "subtotal": 293000,
        "shipping_fee": 25000,
        "total": 318000,
        "payment_method": "COD",
        "status": "Chờ xác nhận",
        "created_at": "2026-11-22T08:30:00.000Z",
        "items": [
          {
            "id": "item_01",
            "order_id": "BN-M8K2X1",
            "book_id": "b01",
            "title": "Những ngày chậm rãi",
            "price": 89000,
            "quantity": 2,
            "total_price": 178000
          }
        ]
      }
    ]
  }
  ```

---

## 2. Quản trị viên xem toàn bộ đơn hàng (US08, BR02)
* **Method**: `GET`
* **Path**: `/api/admin/orders`
* **Xác thực**: Yêu cầu quyền Quản trị viên (`role = 'admin'`). Khách hàng gọi vào bị từ chối với lỗi `403 Forbidden`.
* **Phản hồi 200 OK**: Trả về danh sách tất cả các đơn hàng trong hệ thống kèm chi tiết từng sản phẩm, sắp xếp theo thời gian mới nhất.

---

## 3. Quản trị viên duyệt / cập nhật trạng thái đơn (US08)
* **Method**: `PATCH`
* **Path**: `/api/admin/orders/:id/status`
* **Xác thực**: Yêu cầu Quản trị viên (`role = 'admin'`).
* **Yêu cầu Body JSON**:
  ```json
  {
    "status": "Đã xác nhận"
  }
  ```
* **Các trạng thái hợp lệ**:
  * `Chờ xác nhận` ➔ `Đã xác nhận` ➔ `Đang giao` ➔ `Hoàn thành` ➔ `Đã hủy`.
* **Quy tắc hoàn kho khi Hủy đơn**:
  * Nếu admin chuyển trạng thái sang `Đã hủy`, hệ thống sẽ tự động hoàn lại số lượng sách đã đặt vào tồn kho `books.stock` tương ứng.
* **Phản hồi 200 OK**: Trả về thông tin đơn hàng sau khi cập nhật trạng thái.
