# Epic Danh mục sách, Giỏ hàng & Tồn kho (Epic E2 & E3)

Tài liệu theo dõi tiến độ hoàn thành các User Story và Task thuộc Epic E2 (Danh mục & Giỏ sách) và Epic E3 (Quản lý sách & Tồn kho) trên nhánh `feature/E2-E3-books-catalog`.

---

## 1. Bảng đối chiếu tiến độ User Story & Task

| Mã | Hạng mục | Người phụ trách | Kết quả trong kho mã nguồn | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **US03** | Tìm và xem sách | Nong Minh Phuong | API `GET /api/books`, `GET /api/books/:id`, giao diện `BookCatalog.tsx` & `BookDetailModal.tsx`. | **Hoàn thành** |
| **US04** | Điều chỉnh giỏ hàng | Nong Minh Phuong | Giao diện `Cart.tsx`, tính tạm tính, miễn phí ship từ 300k (`BR05`), giới hạn theo tồn kho (`BR04`). | **Hoàn thành** |
| **US05** | Quản lý danh mục bán | Hoang Duy Hanh | Migration `0002_books.sql`, API `GET/POST /api/admin/books`, tính năng ẩn/hiện sách (`is_active`). | **Hoàn thành** |
| **US06** | Cập nhật tồn kho | Hoang Duy Hanh | API `PATCH /api/admin/books/:id`, giao diện `AdminBooks.tsx` sửa tồn trực tiếp, chặn số âm (`BR04`). | **Hoàn thành** |
| **T09** | 15–20 sách mẫu local | Hoang Duy Hanh | 18 cuốn sách mẫu thuộc 6 thể loại cùng 1 sách ẩn để kiểm thử tiêu chí nghiệm thu. | **Hoàn thành** |
| **T10** | Phác thảo trang quản lý | Hoang Duy Hanh | Trang quản lý sách responsive với form thêm mới và bảng cập nhật trạng thái. | **Hoàn thành** |

---

## 2. Tiêu chuẩn nghiệm thu (Acceptance Criteria)

* **AC03 (Tìm và xem sách)**:
  * Khách tìm theo từ khóa tên sách hoặc tác giả -> Trả đúng danh sách phù hợp.
  * Lọc theo thể loại -> Trả đúng sách thuộc thể loại đó.
  * Sắp xếp giá tăng dần / giảm dần -> Danh sách hiển thị theo đúng thứ tự đơn giá.
  * Bấm vào cuốn sách -> Mở modal xem đầy đủ mô tả, tác giả, giá tiền và trạng thái tồn kho.
* **AC04 (Điều chỉnh giỏ hàng)**:
  * Thêm sách vào giỏ -> Hiển thị badge số lượng trên thanh điều hướng.
  * Tăng / giảm số lượng -> Tạm tính cập nhật theo thời gian thực.
  * Giới hạn tối đa 20 cuốn mỗi tựa hoặc không vượt quá số lượng tồn kho còn lại.
  * Miễn phí giao hàng khi tổng tiền sách đạt từ 300.000đ trở lên; dưới 300.000đ áp dụng phí 25.000đ (`BR05`).
* **AC05 (Quản lý danh mục bán)**:
  * Admin thêm sách mới -> Sách mới xuất hiện ngay trong danh mục bán của khách.
  * Admin bấm "Ẩn sách" -> Sách chuyển sang `is_active = 0` và biến mất khỏi danh mục khách (`BR03`).
* **AC06 (Cập nhật tồn kho)**:
  * Admin sửa số lượng tồn kho (ví dụ từ 5 thành 3) -> Lưu thành công vào CSDL.
  * Admin nhập số lượng âm (ví dụ -1) -> Hệ thống từ chối cập nhật và báo lỗi rõ ràng.

---

## 3. Tài liệu kỹ thuật liên quan

* [Mô hình dữ liệu sách & danh mục](books-data-model.md)
* [Migration SQLite/D1 sách và danh mục](../backend/db/migrations/0002_books.sql)
* [Hợp đồng API Tủ sách & Danh mục](api/books/catalog.md)
* [Hợp đồng API Quản trị Sách & Tồn kho](api/books/admin.md)
