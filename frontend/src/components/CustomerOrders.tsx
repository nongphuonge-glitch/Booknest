import { useState, useEffect } from "react";
import type { Order } from "../types";
import { apiUrl } from "../api";

interface Props {
  onExplore: () => void;
}

export function CustomerOrders({ onExplore }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  function loadMyOrders() {
    setLoading(true);
    fetch(apiUrl("/api/orders/my"), { credentials: "include" })
      .then((res) => res.json() as Promise<{ orders?: Order[]; error?: string }>)
      .then((data) => {
        if (data.orders) {
          setOrders(data.orders);
          setError("");
        } else {
          setError(data.error || "Không thể tải lịch sử đơn hàng.");
        }
      })
      .catch(() => {
        setError("Lỗi kết nối khi tải lịch sử đơn hàng.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadMyOrders();
  }, []);

  const money = (n: number) => n.toLocaleString("vi-VN") + "đ";

  function getStatusClass(status: string) {
    switch (status) {
      case "Chờ xác nhận":
        return "status-pending";
      case "Đã xác nhận":
        return "status-confirmed";
      case "Đang giao":
        return "status-shipping";
      case "Hoàn thành":
        return "status-done";
      case "Đã hủy":
        return "status-cancelled";
      default:
        return "";
    }
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div>
          <span className="eyebrow"><span className="eyebrow-line" /> THEO DÕI HÀNH TRÌNH ĐƠN HÀNG</span>
          <h2>Đơn hàng của bạn</h2>
          <p className="orders-subhead">Kiểm tra trạng thái xử lý và danh sách những cuốn sách bạn đã đặt mua.</p>
        </div>
        <button className="secondary-button refresh-btn" onClick={loadMyOrders} disabled={loading}>
          {loading ? "Đang tải..." : "Làm mới đơn ↻"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="catalog-loading">Đang tải danh sách đơn hàng...</div>
      ) : orders.length === 0 ? (
        <div className="empty-cart-box">
          <p>Bạn chưa có đơn hàng nào tại BookNest.</p>
          <p className="subtext">Hãy chọn những cuốn sách yêu thích và trải nghiệm đặt đơn COD nhé!</p>
          <button className="primary-button" onClick={onExplore}>
            Khám phá tủ sách ngay
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <div key={o.id} className="order-card">
              <div className="order-card-header">
                <div className="order-meta">
                  <strong>Mã đơn: <span className="order-id-badge">{o.id}</span></strong>
                  <span className="order-date">
                    Ngày đặt: {new Date(o.created_at).toLocaleString("vi-VN")}
                  </span>
                </div>
                <span className={`status-badge ${getStatusClass(o.status)}`}>
                  ● {o.status}
                </span>
              </div>

              {/* Order items list */}
              <div className="order-items-table">
                {o.items?.map((item) => (
                  <div key={item.id} className="order-item-line">
                    <span className="item-title">{item.title}</span>
                    <span className="item-qty">x {item.quantity}</span>
                    <span className="item-price">{money(item.total_price)}</span>
                  </div>
                ))}
              </div>

              {/* Order footer info */}
              <div className="order-card-footer">
                <div className="order-shipping-info">
                  <span>Người nhận: <strong>{o.customer_name}</strong> · {o.phone}</span>
                  <span className="address-text">Địa chỉ: {o.address}</span>
                  {o.note && <span className="note-text">Ghi chú: {o.note}</span>}
                </div>

                <div className="order-totals">
                  <div className="sub-line">
                    <span>Tiền sách: {money(o.subtotal)}</span>
                    <span>Phí ship: {o.shipping_fee === 0 ? "Miễn phí" : money(o.shipping_fee)}</span>
                  </div>
                  <div className="main-total">
                    <span>Tổng tiền (COD):</span>
                    <strong>{money(o.total)}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
