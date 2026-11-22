import type { CartItem } from "../types";

interface Props {
  cart: CartItem[];
  onUpdateQty: (bookId: string, delta: number) => void;
  onRemoveItem: (bookId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onExplore: () => void;
}

export function Cart({
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onExplore,
}: Props) {
  const money = (n: number) => n.toLocaleString("vi-VN") + "đ";

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingFee = cart.length === 0 ? 0 : subtotal >= 300000 ? 0 : 25000;
  const total = subtotal + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="cart-container empty">
        <span className="eyebrow"><span className="eyebrow-line" /> GÓC NHỎ CỦA BẠN</span>
        <h2>Giỏ sách của bạn</h2>
        <div className="empty-cart-box">
          <p>Giỏ sách của bạn hiện đang trống.</p>
          <p className="subtext">Hãy dạo quanh tủ sách và chọn những cuốn sách ưng ý nhé!</p>
          <button className="primary-button" onClick={onExplore}>
            Khám phá tủ sách ngay
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <div>
          <span className="eyebrow"><span className="eyebrow-line" /> GÓC NHỎ CỦA BẠN</span>
          <h2>Giỏ sách ({cart.reduce((a, b) => a + b.qty, 0)} cuốn)</h2>
        </div>
        <button className="text-button" onClick={onClearCart}>Xóa tất cả</button>
      </div>

      <div className="cart-grid">
        <div className="cart-items-list">
          {cart.map((item) => (
            <div key={item.id} className="cart-item-row">
              <div
                className="cart-item-mini-cover"
                style={{ backgroundColor: item.cover_color }}
              >
                <span>{item.symbol}</span>
              </div>

              <div className="cart-item-info">
                <h3>{item.title}</h3>
                <p className="cart-item-author">{item.author} · {item.category_name}</p>
                <div className="cart-item-price-unit">{money(item.price)}</div>
              </div>

              <div className="qty-controls">
                <button
                  type="button"
                  onClick={() => onUpdateQty(item.id, -1)}
                  aria-label={`Giảm số lượng ${item.title}`}
                >
                  −
                </button>
                <span className="qty-value">{item.qty}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQty(item.id, 1)}
                  disabled={item.qty >= Math.min(20, item.stock)}
                  aria-label={`Tăng số lượng ${item.title}`}
                  title={item.qty >= item.stock ? "Đã đạt giới hạn tồn kho" : "Tăng số lượng"}
                >
                  +
                </button>
              </div>

              <div className="cart-item-total">
                {money(item.price * item.qty)}
              </div>

              <button
                type="button"
                className="remove-btn"
                onClick={() => onRemoveItem(item.id)}
                aria-label={`Xóa ${item.title}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <aside className="order-summary-box">
          <h3>Tóm tắt đơn hàng</h3>
          <div className="summary-row">
            <span>Tạm tính tiền sách:</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Phí vận chuyển (BR05):</span>
            <strong className={shippingFee === 0 ? "free-ship" : ""}>
              {shippingFee === 0 ? "Miễn phí (≥ 300.000đ)" : money(shippingFee)}
            </strong>
          </div>

          {subtotal < 300000 && (
            <p className="shipping-hint">
              💡 Mua thêm <strong>{money(300000 - subtotal)}</strong> để được <strong>Miễn phí giao hàng</strong> toàn quốc!
            </p>
          )}

          <div className="summary-divider" />

          <div className="summary-row total-row">
            <span>Tổng cộng:</span>
            <strong className="total-price">{money(total)}</strong>
          </div>

          <button
            className="primary-button checkout-btn"
            onClick={onProceedToCheckout}
          >
            Tiến hành đặt hàng COD
            <span aria-hidden="true">↗</span>
          </button>
        </aside>
      </div>
    </div>
  );
}
