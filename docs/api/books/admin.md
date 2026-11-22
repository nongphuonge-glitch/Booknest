# Hợp đồng API Quản trị Sách & Tồn kho (US05, US06 / T11, T12)

Mọi endpoint trong tài liệu này đều yêu cầu quyền Quản trị viên (`role = 'admin'`). Người dùng không có quyền hoặc phiên hết hạn sẽ nhận mã lỗi `401 Unauthorized` hoặc `403 Forbidden` (`BR02`).

---

## 1. Lấy toàn bộ sách trong hệ thống
* **Method**: `GET`
* **Path**: `/api/admin/books`
* **Mô tả**: Trả về toàn bộ sách (kể cả sách đang bán `is_active = 1` và sách ẩn `is_active = 0`) kèm số lượng tồn kho.
* **Phản hồi 200 OK**:
  ```json
  {
    "books": [
      {
        "id": "b01",
        "title": "Những ngày chậm rãi",
        "author": "An Nhiên",
        "category_id": "cat_lifestyle",
        "category_name": "Đời sống",
        "price": 89000,
        "stock": 15,
        "is_active": 1,
        "cover_color": "#b96849",
        "symbol": "✳",
        "description": "...",
        "created_at": "...",
        "updated_at": "..."
      }
    ]
  }
  ```

---

## 2. Thêm sách mới
* **Method**: `POST`
* **Path**: `/api/admin/books`
* **Yêu cầu Body JSON**:
  ```json
  {
    "title": "Tên sách mới",
    "author": "Tác giả",
    "category_id": "cat_lifestyle",
    "price": 95000,
    "stock": 10,
    "is_active": 1,
    "cover_color": "#4e6650",
    "symbol": "❋",
    "description": "Mô tả sách"
  }
  ```
* **Quy tắc kiểm tra**:
  * `title`, `author`, `category_id` không được để trống.
  * `price >= 0` và `stock >= 0` (`BR04`).
  * `category_id` phải tồn tại trong bảng `categories`.
* **Phản hồi 201 Created**: Trả về thông tin sách vừa được tạo.

---

## 3. Cập nhật thông tin sách, tồn kho hoặc ẩn/hiện
* **Method**: `PATCH`
* **Path**: `/api/admin/books/:id`
* **Body JSON** (chỉ cần truyền các trường muốn sửa):
  ```json
  {
    "price": 105000,
    "stock": 20,
    "is_active": 0
  }
  ```
* **Quy tắc kiểm tra**:
  * Nhập `stock < 0` bị từ chối với lỗi `400 Bad Request` ("Số lượng tồn kho phải là số nguyên không âm" - AC06).
  * `is_active = 0` sẽ ẩn sách khỏi danh mục khách (`BR03`, AC05).
* **Phản hồi 200 OK**: Trả về dữ liệu sách đã cập nhật.
