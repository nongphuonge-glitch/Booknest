-- SQLite / Cloudflare D1 orders schema. Apply with foreign keys enabled.

CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    note TEXT,
    subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
    shipping_fee INTEGER NOT NULL CHECK (shipping_fee >= 0),
    total INTEGER NOT NULL CHECK (total >= 0),
    payment_method TEXT NOT NULL DEFAULT 'COD',
    status TEXT NOT NULL DEFAULT 'Chờ xác nhận' CHECK (status IN ('Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Hoàn thành', 'Đã hủy')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    CHECK (length(trim(customer_name)) > 0),
    CHECK (length(trim(phone)) > 0),
    CHECK (length(trim(address)) > 0)
);

CREATE TABLE order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL REFERENCES books(id),
    title TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price INTEGER NOT NULL CHECK (total_price >= 0)
);

CREATE INDEX orders_user_id_idx ON orders(user_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX order_items_order_id_idx ON order_items(order_id);

-- Seed Sample Orders for Demo Testing (AC08)
INSERT INTO orders (id, user_id, customer_name, phone, address, note, subtotal, shipping_fee, total, status, created_at, updated_at)
VALUES
    ('BN-DEMO01', NULL, 'Nguyễn Văn An', '0912345678', 'Số 15 Lê Duẩn, Quận 1, TP. Hồ Chí Minh', 'Giao vào giờ hành chính', 204000, 25000, 229000, 'Chờ xác nhận', '2026-11-20T08:30:00.000Z', '2026-11-20T08:30:00.000Z'),
    ('BN-DEMO02', NULL, 'Trần Thị Mai', '0987654321', 'Số 42 Cầu Giấy, Hà Nội', 'Gọi trước khi giao', 332000, 0, 332000, 'Đã xác nhận', '2026-11-21T10:15:00.000Z', '2026-11-21T11:00:00.000Z'),
    ('BN-DEMO03', NULL, 'Lê Hoàng Nam', '0903112233', '108 Trần Phú, Đà Nẵng', '', 129000, 25000, 154000, 'Hoàn thành', '2026-11-19T14:20:00.000Z', '2026-11-21T16:40:00.000Z');

INSERT INTO order_items (id, order_id, book_id, title, price, quantity, total_price)
VALUES
    ('item_01', 'BN-DEMO01', 'b01', 'Những ngày chậm rãi', 89000, 1, 89000),
    ('item_02', 'BN-DEMO01', 'b02', 'Khu vườn trong tâm trí', 115000, 1, 115000),
    ('item_03', 'BN-DEMO02', 'b04', 'Bắt đầu từ điều nhỏ', 129000, 1, 129000),
    ('item_04', 'BN-DEMO02', 'b08', 'Cà phê cùng ý tưởng', 135000, 1, 135000),
    ('item_05', 'BN-DEMO02', 'b07', 'Chuyện của hạt mầm', 68000, 1, 68000),
    ('item_06', 'BN-DEMO03', 'b04', 'Bắt đầu từ điều nhỏ', 129000, 1, 129000);
