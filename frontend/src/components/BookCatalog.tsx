import { useState, useEffect } from "react";
import type { Book, Category } from "../types";
import { BookDetailModal } from "./BookDetailModal";
import { apiUrl } from "../api";

interface Props {
  isLoggedIn: boolean;
  onAddToCart: (book: Book) => void;
}

export function BookCatalog({ isLoggedIn, onAddToCart }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Tất cả");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("default");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Load categories
  useEffect(() => {
    fetch(apiUrl("/api/categories"))
      .then((res) => res.json() as Promise<{ categories?: Category[] }>)
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  // Load books with query params
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== "Tất cả") params.set("category", activeCategory);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (sortOption !== "default") params.set("sort", sortOption);

    fetch(apiUrl(`/api/books?${params.toString()}`))
      .then((res) => res.json() as Promise<{ books?: Book[]; error?: string }>)
      .then((data) => {
        if (data.books) {
          setBooks(data.books);
          setError("");
        } else {
          setError(data.error || "Không thể tải danh sách sách");
        }
      })
      .catch(() => {
        setError("Lỗi kết nối khi tải danh sách sách.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeCategory, searchQuery, sortOption]);

  const money = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <div className="catalog-container">
      {/* Hero Section */}
      <section className="catalog-hero">
        <div className="hero-text">
          <span className="eyebrow"><span className="eyebrow-line" /> ĐỌC CHẬM LẠI · SỐNG SÂU HƠN</span>
          <h1>Một trang sách.<br /><em>Một thế giới mới.</em></h1>
          <p>Tuyển chọn những cuốn sách truyền cảm hứng, từ những câu chuyện dịu dàng đến ý tưởng thay đổi tư duy.</p>
          <div className="hero-tags">
            <span>↗ Giao hàng toàn quốc</span>
            <span>✧ Miễn phí ship từ 300.000đ</span>
            <span>♡ Sách chính hãng chọn lọc</span>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="catalog-controls">
        <div className="search-bar">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Tìm theo tên sách, tác giả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Tìm kiếm sách"
          />
        </div>

        <div className="sort-bar">
          <label htmlFor="sort-select">Sắp xếp:</label>
          <select
            id="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="default">Đề xuất cho bạn</option>
            <option value="asc">Giá: Thấp đến cao</option>
            <option value="desc">Giá: Cao đến thấp</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-pills" role="tablist" aria-label="Thể loại">
        <button
          type="button"
          className={activeCategory === "Tất cả" ? "active" : ""}
          onClick={() => setActiveCategory("Tất cả")}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={activeCategory === cat.name ? "active" : ""}
            onClick={() => setActiveCategory(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="catalog-loading">Đang tải tủ sách...</div>
      ) : books.length === 0 ? (
        <div className="catalog-empty">
          <p>Không tìm thấy cuốn sách nào phù hợp.</p>
          <button
            className="secondary-button"
            onClick={() => {
              setActiveCategory("Tất cả");
              setSearchQuery("");
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((b) => (
            <article key={b.id} className="book-card">
              <button
                className="card-cover-wrap"
                onClick={() => setSelectedBook(b)}
                aria-label={`Xem chi tiết ${b.title}`}
              >
                <div className="cover-art" style={{ backgroundColor: b.cover_color }}>
                  <small>BOOKNEST · {b.category_name.toUpperCase()}</small>
                  <strong>{b.title}</strong>
                  <div className="symbol">{b.symbol}</div>
                  <span>{b.author.toUpperCase()}</span>
                </div>
              </button>

              <div className="card-info">
                <span className="card-cat">{b.category_name}</span>
                <h3 onClick={() => setSelectedBook(b)}>{b.title}</h3>
                <p className="card-author">{b.author}</p>
                <div className="card-bottom">
                  <span className="card-price">{money(b.price)}</span>
                  <button
                    className="add-cart-btn"
                    onClick={() => onAddToCart(b)}
                    disabled={isLoggedIn && b.stock <= 0}
                    aria-label={`Thêm ${b.title} vào giỏ sách`}
                    title={
                      !isLoggedIn
                        ? "Đăng nhập để thêm vào giỏ sách"
                        : b.stock > 0
                        ? "Thêm vào giỏ"
                        : "Hết hàng"
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        isLoggedIn={isLoggedIn}
        onClose={() => setSelectedBook(null)}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}
