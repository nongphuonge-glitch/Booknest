-- SQLite / Cloudflare D1 book and category schema. Apply with foreign keys enabled.

CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES categories(id),
    price INTEGER NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    cover_color TEXT NOT NULL DEFAULT '#b96849',
    symbol TEXT NOT NULL DEFAULT '✳',
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    CHECK (length(trim(title)) > 0),
    CHECK (length(trim(author)) > 0)
);

CREATE INDEX books_category_id_idx ON books(category_id);
CREATE INDEX books_is_active_idx ON books(is_active);

-- Seed Categories
INSERT INTO categories (id, name, description) VALUES
    ('cat_lifestyle', 'Đời sống', 'Sách về phong cách sống, trải nghiệm và bình yên tâm hồn'),
    ('cat_psychology', 'Tâm lý', 'Khám phá tâm trí, nội tâm và hành vi con người'),
    ('cat_literature', 'Văn học', 'Tác phẩm văn học, tiểu thuyết và tản văn giàu cảm xúc'),
    ('cat_business', 'Kinh doanh', 'Ý tưởng khởi nghiệp, quản trị và tư duy kinh tế'),
    ('cat_children', 'Thiếu nhi', 'Truyện tranh, đồng thoại và bài học nuôi dưỡng tâm hồn trẻ nhỏ'),
    ('cat_technology', 'Công nghệ', 'Chuyển đổi số, lập trình và công nghệ tương lai');

-- Seed 18 Sample Books (T09: 15-20 sách mẫu phong phú)
INSERT INTO books (id, title, author, category_id, price, stock, is_active, cover_color, symbol, description) VALUES
    ('b01', 'Những ngày chậm rãi', 'An Nhiên', 'cat_lifestyle', 89000, 15, 1, '#b96849', '✳', 'Học cách sống chậm giữa nhịp sống hối hả, tìm bình yên trong từng hơi thở và khoảnh khắc nhỏ bé.'),
    ('b02', 'Khu vườn trong tâm trí', 'Minh An', 'cat_psychology', 115000, 12, 1, '#4e6650', '❋', 'Dành thời gian chăm sóc khu vườn cảm xúc, gỡ bỏ âu lo và lắng nghe chính mình.'),
    ('b03', 'Qua những miền gió', 'Hạ Lam', 'cat_literature', 98000, 20, 1, '#567a89', '≈', 'Tập tản văn dịu mát như làn gió đầu hạ, gom góp những yêu thương mộc mạc đời thường.'),
    ('b04', 'Bắt đầu từ điều nhỏ', 'Quang Minh', 'cat_business', 129000, 8, 1, '#c39342', '↗', 'Chiến lược tích lũy và xây dựng thói quen tạo nên thành công bền vững trong sự nghiệp.'),
    ('b05', 'Một mùa hè rất xanh', 'Trúc Linh', 'cat_literature', 79000, 10, 1, '#6c8062', '☀', 'Hồi ức về những ngày thơ ấu yên bình bên bờ kênh và rặng tre xanh thắm.'),
    ('b06', 'Hiểu mình để lớn', 'Thảo Nguyên', 'cat_psychology', 109000, 14, 1, '#967486', '◒', 'Hành trình thấu hiểu cảm xúc, chấp nhận khuyết điểm và từng bước trưởng thành tự tin.'),
    ('b07', 'Chuyện của hạt mầm', 'Mai Chi', 'cat_children', 65000, 25, 1, '#bf805d', '✿', 'Câu chuyện tranh đáng yêu về hạt mầm nhỏ dũng cảm vươn mình đón nắng mai.'),
    ('b08', 'Cà phê cùng ý tưởng', 'Đức Anh', 'cat_business', 135000, 9, 1, '#435b66', '✦', 'Khơi nguồn cảm hứng sáng tạo và tư duy đột phá trong môi trường làm việc hiện đại.'),
    ('b09', 'Lắng nghe bình minh', 'Diệp Anh', 'cat_lifestyle', 92000, 18, 1, '#d48366', '☼', 'Đánh thức năng lượng tích cực mỗi sớm mai bằng những bài học giản dị về sự biết ơn.'),
    ('b10', 'Bản đồ nội tâm', 'Lê Khải', 'cat_psychology', 125000, 7, 1, '#3b5a45', '◈', 'Khám phá các chiều kích tâm lý học ứng dụng, định hình căn tính và giá trị cốt lõi.'),
    ('b11', 'Phố cũ người xưa', 'Hải Đăng', 'cat_literature', 105000, 11, 1, '#4c6472', '❧', 'Những lát cắt hoài niệm về Hà Nội xưa, nơi những con ngõ nhỏ lưu giữ bao câu chuyện.'),
    ('b12', 'Khởi nghiệp tinh gọn', 'Bảo Hoàng', 'cat_business', 145000, 16, 1, '#b07f35', '◪', 'Nguyên lý thử nghiệm nhanh, giảm thiểu rủi ro và thích ứng linh hoạt trong kinh doanh.'),
    ('b13', 'Xứ sở kẹo ngọt', 'Thanh Trúc', 'cat_children', 72000, 30, 1, '#c2796e', '♥', 'Chuyến phiêu lưu kỳ thú của hai bạn nhỏ vào vương quốc bánh kẹo muôn màu.'),
    ('b14', 'Nghệ thuật tối giản', 'Phan Vũ', 'cat_lifestyle', 88000, 10, 1, '#5d7363', '◎', 'Thanh lọc không gian sống, buông bỏ đồ đạc dư thừa để tìm lại sự tự do trong tâm hồn.'),
    ('b15', 'Trí tuệ nhân tạo và tương lai', 'Nguyễn Khoa', 'cat_technology', 168000, 20, 1, '#334e58', '⚡', 'Toàn cảnh cách mạng AI, những tác động sâu sắc đến đời sống và cơ hội cho giới trẻ.'),
    ('b16', 'Lập trình đám mây căn bản', 'Trần Nam', 'cat_technology', 155000, 15, 1, '#2b4436', '☁', 'Kiến thức cốt lõi về Cloud Computing, Serverless Workers và phân tán dữ liệu hiện đại.'),
    ('b17', 'Vút bay cùng ước mơ', 'Ngọc Hân', 'cat_children', 68000, 22, 1, '#a66a54', '✈', 'Nuôi dưỡng khát vọng khám phá bầu trời bao la cho các em nhỏ qua từng trang sách.'),
    ('b18', 'Sách thử nghiệm ngừng bán', 'Tác Giả Ẩn', 'cat_lifestyle', 99000, 0, 0, '#777777', '✕', 'Sách dùng để kiểm thử tiêu chí US05 và AC05: sách ẩn không xuất hiện trong danh mục khách.');
