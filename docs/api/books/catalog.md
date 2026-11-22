# Hợp đồng API Tủ sách & Danh mục (US03 / T07)

Các endpoint công khai phục vụ xem danh mục và tìm kiếm sách:

## 1. Lấy danh sách thể loại
* **Method**: `GET`
* **Path**: `/api/categories`
* **Phản hồi 200 OK**:
  ```json
  {
    "categories": [
      { "id": "cat_lifestyle", "name": "Đời sống", "description": "..." }
    ]
  }
  ```

## 2. Tìm kiếm và lọc sách đang bán
* **Method**: `GET`
* **Path**: `/api/books`
* **Query Parameters**:
  * `category` (tùy chọn): lọc theo ID hoặc tên thể loại.
  * `q` (tùy chọn): tìm kiếm theo tên sách hoặc tên tác giả.
  * `sort` (tùy chọn): `asc` (giá tăng dần), `desc` (giá giảm dần).
* **Ràng buộc**: Chỉ trả về sách có `is_active = 1` (BR03).
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
        "description": "..."
      }
    ]
  }
  ```

## 3. Xem chi tiết sách
* **Method**: `GET`
* **Path**: `/api/books/:id`
* **Phản hồi 200 OK**: Chi tiết cuốn sách nếu đang bán (`is_active = 1`).
* **Phản hồi 404 Not Found**: Nếu sách không tồn tại hoặc đã ngừng bán/ẩn.
