# Quy trình làm việc với Git (Git Flow) — BookNest

Tài liệu này quy định quy chuẩn làm việc với Git cho 3 thành viên dự án BookNest (**Trần Văn Nhu**, **Nông Minh Phương**, **Hoàng Duy Hạnh**), đảm bảo không xung đột mã nguồn, lịch sử commit rõ ràng và đồng bộ với tiến độ đồ án.

---

## 1. Hệ thống nhánh (Branches)

| Nhánh | Mục đích | Quy tắc |
| :--- | :--- | :--- |
| **`main`** | Nhánh sản phẩm / nộp bài cuối cùng | Chỉ chứa code ổn định đã kiểm thử. **Không commit trực tiếp**. Chỉ nhận merge từ `develop` hoặc `release/*`. |
| **`develop`** | Nhánh tích hợp chính của nhóm | Chứa code mới nhất đang phát triển. Mọi tính năng sau khi test xong đều merge vào đây. |
| **`feature/*`** | Nhánh phát triển tính năng | Tách từ `develop`. Mỗi thành viên làm tính năng nào thì tạo nhánh tính năng đó. Xong thì mở PR gộp lại về `develop`. |
| **`release/*`** | Nhánh chuẩn bị nộp bài / deploy (Tuần 4) | Tách từ `develop` để chốt phiên bản, nạp dữ liệu D1 mẫu, kiểm thử nghiệm thu cuối cùng trước khi merge vào `main`. |
| **`hotfix/*`** | Nhánh sửa lỗi khẩn cấp | Tách trực tiếp từ `main` nếu phát hiện lỗi nghiêm trọng trên bản nộp bài / bản deploy production. |

---

## 2. Quy ước đặt tên nhánh

Cú pháp: `feature/<Mã-Task-hoặc-Epic>-<tên-ngắn-gọn>`

Các nhánh tính năng chính theo kế hoạch dự án:
* **Epic E1 (Tài khoản)**: `feature/BOOK-6-account` *(Đã hoàn thành và gộp vào develop)*
* **Epic E2 & E3 (Sách & Giỏ hàng & Tồn kho)**: `feature/E2-E3-books-catalog`
* **Epic E4 (Đơn hàng COD & Quản lý đơn)**: `feature/E4-orders-cod`
* **Epic E6 (Triển khai Cloudflare & D1)**: `feature/E6-cloudflare-d1-deploy`

---

## 3. Quy chuẩn Commit (Conventional Commits)

Mỗi commit phải có tiền tố rõ ràng phản ánh nội dung thay đổi:

* `feat:` Thêm tính năng mới hoặc API mới.
  * *Ví dụ*: `feat: add books API and D1 schema migration`
* `fix:` Sửa lỗi logic, sửa bug giao diện hoặc API.
  * *Ví dụ*: `fix: prevent negative stock when updating book quantity`
* `docs:` Thêm hoặc sửa tài liệu, ERD, README.
  * *Ví dụ*: `docs: add Git Flow guidelines and update README`
* `chore:` Cấu hình dự án, cài đặt package, cập nhật `.gitignore`.
  * *Ví dụ*: `chore: configure wrangler for D1 database`
* `test:` Thêm hoặc cập nhật kịch bản kiểm thử (test script, curl test).
* `refactor:` Tái cấu trúc mã nguồn mà không làm thay đổi hành vi nghiệp vụ.

---

## 4. Quy trình làm việc 6 bước của thành viên

Khi bắt đầu một đầu việc mới, mỗi thành viên thực hiện theo đúng trình tự:

```bash
# 1. Chuyển sang develop và cập nhật mã nguồn mới nhất từ remote
git checkout develop
git pull origin develop

# 2. Tạo nhánh tính năng mới
git checkout -b feature/<ten-nhanh>

# 3. Viết code, chạy thử nghiệm trên local (backend Worker & frontend Vite)
# Đảm bảo mã nguồn chạy không lỗi trước khi commit

# 4. Commit theo đúng quy chuẩn
git add .
git commit -m "feat: mô tả công việc vừa làm"

# 5. Đẩy nhánh lên GitHub
git push -u origin feature/<ten-nhanh>

# 6. Mở Pull Request (PR) trên GitHub:
#    - Base repository / Base branch: develop
#    - Head repository / Compare branch: feature/<ten-nhanh>
#    - Kiểm tra không bị conflict trước khi merge
```

---

## 5. Nguyên tắc an toàn & Tránh xung đột

1. **Không commit file môi trường & dữ liệu tạm**: File `.dev.vars`, `.env`, `node_modules/`, `dist/`, `.wrangler/` đã được chặn trong `.gitignore`. Không được dùng `-f` (force) để thêm các file này.
2. **Quy tắc di chuyển CSDL (D1 Migrations)**: Các file SQL trong `backend/db/migrations/` phải được đánh số thứ tự tăng dần (`0001_accounts.sql`, `0002_books.sql`, `0003_orders.sql`). Không sửa đổi trực tiếp các file migration đã gộp vào `develop`.
3. **Luôn `pull develop` trước khi tạo nhánh mới** để giảm thiểu tối đa khả năng xảy ra Merge Conflict.
