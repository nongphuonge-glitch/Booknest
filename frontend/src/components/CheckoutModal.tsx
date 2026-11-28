import { useState, type FormEvent } from "react";
import type { CartItem, User, Order } from "../types";
import { apiUrl } from "../api";

interface Props {
  cart: CartItem[];
  user: User;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export function CheckoutModal({ cart, user, onClose, onOrderSuccess }: Props) {
  const [customerName, setCustomerName] = useState(user.displayName);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingFee = subtotal >= 300000 ? 0 : 25000;
  const total = subtotal + shippingFee;

  const money = (n: number) => n.toLocaleString("vi-VN") + "đ";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setError("Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("/api/orders"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          note: note.trim() || undefined,
          items: cart.map((i) => ({ book_id: i.id, quantity: i.qty })),
        }),
      });

      const data = (await res.json()) as { order?: Order; error?: string };
      if (!res.ok || !data.order) {
        throw new Error(data.error || "Đặt hàng không thành công. Vui lòng thử lại.");
      }

      onOrderSuccess(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo đơn hàng.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <div className="modal-content checkout-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        <span className="eyebrow"><span className="eyebrow-line" /> ĐẶT HÀNG COD · BOOKNEST</span>
        <h2 id="checkout-title">Thông tin giao hàng</h2>
        <p className="checkout-subtitle">Thanh toán tiền mặt khi nhận hàng (COD). Kiểm tra sách trước khi thanh toán.</p>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="checkout-name">Họ và tên người nhận *</label>
            <input
              id="checkout-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="checkout-phone">Số điện thoại *</label>
            <input
              id="checkout-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ví dụ: 0912345678"
              pattern="[0-9+ ()-]{9,15}"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="checkout-address">Địa chỉ nhận hàng chi tiết *</label>
            <input
              id="checkout-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="checkout-note">Ghi chú giao hàng (tùy chọn)</label>
            <input
              id="checkout-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến"
            />
          </div>

          {/* Mini order review */}
          <div className="checkout-review-box">
            <div className="review-row">
              <span>Số lượng sách:</span>
              <strong>{cart.reduce((a, b) => a + b.qty, 0)} cuốn</strong>
            </div>
            <div className="review-row">
              <span>Tiền sách:</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <div className="review-row">
              <span>Phí vận chuyển (BR05):</span>
              <strong className={shippingFee === 0 ? "free-ship" : ""}>
                {shippingFee === 0 ? "Miễn phí" : money(shippingFee)}
              </strong>
            </div>
            <div className="review-divider" />
            <div className="review-row total">
              <span>Tổng thanh toán (COD):</span>
              <strong className="total-price">{money(total)}</strong>
            </div>
          </div>

          <button className="primary-button submit-order-btn" type="submit" disabled={submitting}>
            {submitting ? "Đang xử lý đặt đơn..." : "Xác nhận đặt hàng COD"}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
      </div>
    </div>
  );
}
