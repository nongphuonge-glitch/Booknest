# Kịch bản Demo & Khung Slide thuyết trình (5–7 Phút)

Tài liệu này được biên soạn bám sát **Yêu cầu tại buổi trình bày báo cáo** của Giảng viên môn Điện toán đám mây.

---

## 1. Khung thời gian Demo 5–7 Phút

| Thời gian | Nội dung trình bày | Người nói chính | Minh chứng trực tiếp |
| :---: | :--- | :--- | :--- |
| **0:00 – 1:00** | **Giới thiệu bài toán & Kiến trúc Cloud**: Nêu Input, Output, lý do chọn Cloudflare Workers + D1 (Serverless, Cold start 0ms, Free Tier an toàn không cần thẻ). | Trần Văn Nhu | Slide 1–3 + Kiến trúc hệ thống |
| **1:00 – 2:30** | **Demo luồng Khách hàng**: Đăng ký/đăng nhập ➔ Khám phá tủ sách (tìm kiếm, lọc 6 thể loại, sắp xếp giá) ➔ Thêm sách vào giỏ ➔ Giải thích quy tắc tính tiền và miễn phí giao hàng từ 300.000đ (`BR05`). | Nông Minh Phương | Giao diện web trực tiếp |
| **2:30 – 4:00** | **Demo Đặt đơn COD & Trừ kho**: Điền form nhận hàng ➔ Xác nhận đặt đơn ➔ Nhận mã đơn `BN-XXXXXX` ➔ Chuyển sang tab Đơn hàng kiểm tra trạng thái ➔ Giải thích trừ kho nguyên tử trong CSDL D1 (`BR04`). | Nông Minh Phương | Giao diện web trực tiếp |
| **4:00 – 5:30** | **Demo Quản trị viên & Đối soát**: Đăng nhập tài khoản Admin ➔ Mở Quản lý sách (chứng minh chặn tồn kho âm AC06, ẩn/hiện sách AC05) ➔ Mở Quản lý đơn (chuyển trạng thái đơn từ `Chờ xác nhận` sang `Đã xác nhận`). | Hoàng Duy Hạnh | Giao diện web Admin |
| **5:30 – 6:30** | **Minh chứng triển khai Cloud**: Mở Cloudflare Dashboard thật, chỉ rõ Worker triggers, D1 database tables, log thời gian thực. | Trần Văn Nhu | Cloudflare Dashboard thật |
| **6:30 – 7:00** | **Kết luận & Hướng phát triển**: Tóm tắt kết quả đạt được, định hướng thanh toán online VNPay, AI recommendation. | Cả nhóm | Slide kết luận |

---

## 2. Khung nội dung Slide thuyết trình (8 Slide chuẩn)

* **Slide 1: Trang bìa**:
  * Tên đề tài: BookNest — Website bán sách trên Cloudflare Workers & D1.
  * Giảng viên hướng dẫn & Thành viên nhóm (Trần Văn Nhu, Nông Minh Phương, Hoàng Duy Hạnh).
* **Slide 2: Bài toán & Phân tích thiết kế**:
  * Đặt vấn đề, đối tượng phục vụ (Khách hàng & Admin), phạm vi đơn hàng COD.
  * Input/Output của bài toán.
* **Slide 3: Lựa chọn dịch vụ Public Cloud**:
  * Giới thiệu Cloudflare Workers (Edge Serverless) & Cloudflare D1 (Serverless SQLite).
  * Lý do chọn: Miễn phí trọn đời, không cần add thẻ tín dụng, loại bỏ rủi ro phát sinh phí.
* **Slide 4: Kiến trúc hệ thống & Mô hình dữ liệu**:
  * Sơ đồ phân tầng: React Frontend ➔ Cloudflare Edge Worker API ➔ Cloudflare D1 Database.
  * Sơ đồ ERD 5 bảng dữ liệu.
* **Slide 5: Các quy tắc nghiệp vụ cốt lõi (Business Rules)**:
  * BR01 (Email duy nhất), BR02 (Phân quyền API), BR03 (Sách mở bán), BR04 (Giao dịch trừ kho atomic), BR05 (Tính tiền phía server & freeship 300k).
* **Slide 6: Minh chứng triển khai (Deployment Evidence)**:
  * Ảnh chụp CLI Wrangler, giao diện Cloudflare Dashboard, D1 database tables và Worker metrics.
* **Slide 7: Kết quả đạt được & Demo tính năng**:
  * Điểm lại các màn hình: Tủ sách, Giỏ sách, Đặt COD, Lịch sử đơn, Quản trị sách & đơn.
* **Slide 8: Kết luận & Hướng phát triển**:
  * Đánh giá mức độ hoàn thành so với kế hoạch 4 tuần.
  * Hướng mở rộng: Thanh toán thẻ/ví điện tử, gửi email thông báo, AI gợi ý sách.
