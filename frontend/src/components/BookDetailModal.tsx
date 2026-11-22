import type { Book } from "../types";

interface Props {
  book: Book | null;
  isLoggedIn: boolean;
  onClose: () => void;
  onAddToCart: (book: Book) => void;
}

export function BookDetailModal({ book, isLoggedIn, onClose, onAddToCart }: Props) {
  if (!book) return null;

  const money = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        <span className="eyebrow"><span className="eyebrow-line" /> {book.category_name.toUpperCase()}</span>
        <h2 id="detail-title">{book.title}</h2>
        <p className="detail-author">Tác giả: <strong>{book.author}</strong></p>
        <div className="detail-cover-wrap">
          <div className="cover-art" style={{ backgroundColor: book.cover_color }}>
            <small>BOOKNEST · {book.category_name.toUpperCase()}</small>
            <strong>{book.title}</strong>
            <div className="symbol">{book.symbol}</div>
            <span>{book.author.toUpperCase()}</span>
          </div>
        </div>
        <p className="detail-desc">{book.description || "Một cuốn sách hay mang lại những khoảng trời riêng và cảm xúc lắng đọng."}</p>
        <div className="detail-meta">
          <div className="price-tag">{money(book.price)}</div>
          <span className="stock-tag">
            {book.stock > 0 ? `Còn ${book.stock} cuốn` : "Tạm hết hàng"}
          </span>
        </div>
        <button
          className="primary-button"
          onClick={() => {
            onAddToCart(book);
            onClose();
          }}
          disabled={isLoggedIn && book.stock <= 0}
        >
          {!isLoggedIn
            ? "Đăng nhập để thêm vào giỏ sách"
            : book.stock > 0
            ? "Thêm vào giỏ sách"
            : "Hết hàng"}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
  );
}
