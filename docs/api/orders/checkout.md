# Hợp đồng API Đặt hàng COD (US07 / T13, T14, T15)

Endpoint phục vụ khách hàng tạo đơn hàng COD thanh toán khi nhận hàng.

---

## 1. Tạo đơn hàng COD mới
* **Method**: `POST`
* **Path**: `/api/orders`
* **Xác thực**: Yêu cầu khách hàng đã đăng nhập (`session cookie`). Nếu chưa đăng nhập, trả về `401 Unauthorized` (tiêu chí US07).
* **Yêu cầu Body JSON**:
  ```json
  {
    "customer_name": "Nguyễn Văn An",
    "phone": "0912345678",
    "address": "Số 15 Lê Duẩn, Quận 1, TP. Hồ Chí Minh",
    "note": "Giao vào giờ hành chính",
    "items": [
      { "book_id": "b01", "quantity": 2 },
      { "book_id": "b02", "quantity": 1 }
    ]
  }
  ```

---

## 2. Quy tắc nghiệp vụ kiểm tra phía máy chủ (Server-side validation)

1. **Kiểm tra trạng thái đang bán (`BR03`)**: Sách phải có `is_active = 1`. Nếu sách đã ngừng bán, từ chối với lỗi 400.
2. **Kiểm tra số lượng tồn kho (`BR04`, AC07)**:
   * Nếu `stock < quantity`: Từ chối tạo đơn với thông báo lỗi rõ ràng `"Sách '...' chỉ còn ... cuốn trong kho, không đủ đáp ứng số lượng bạn đặt"`.
   * Kho được giữ nguyên và không tạo đơn.
3. **Tính toán giá trị và phí giao hàng (`BR05`)**:
   * Bỏ qua hoàn toàn giá client gửi lên. Máy chủ tự lấy `books.price` trong CSDL D1.
   * `subtotal = sum(item.price * item.quantity)`
   * `shipping_fee = subtotal >= 300000 ? 0 : 25000` (Miễn phí từ 300.000đ).
   * `total = subtotal + shipping_fee`.
4. **Giao dịch nguyên tử (Atomic D1 Batch - `BR04`)**:
   * Tạo bản ghi `orders`.
   * Tạo các bản ghi `order_items`.
   * Trừ kho `books.stock = books.stock - quantity`.
   * Cả 3 thao tác diễn ra trong 1 transaction duy nhất thông qua `env.DB.batch(...)`.

---

## 3. Phản hồi thành công (201 Created)
```json
{
  "order": {
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
    "items": [
      {
        "book_id": "b01",
        "title": "Những ngày chậm rãi",
        "price": 89000,
        "quantity": 2,
        "total_price": 178000
      },
      {
        "book_id": "b02",
        "title": "Khu vườn trong tâm trí",
        "price": 115000,
        "quantity": 1,
        "total_price": 115000
      }
    ]
  }
}
```
