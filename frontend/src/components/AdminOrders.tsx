import { useState, useEffect } from "react";
import type { Order, OrderStatus } from "../types";
import { apiUrl } from "../api";

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("Tất cả");

  function loadOrders() {
    setLoading(true);
    fetch(apiUrl("/api/admin/orders"), { credentials: "include" })
      .then((res) => res.json() as Promise<{ orders?: Order[]; error?: string }>)
      .then((data) => {
        if (data.orders) {
          setOrders(data.orders);
          setError("");
        } else {
          setError(data.error || "Không thể tải danh sách đơn hàng");
        }
      })
      .catch(() => {
        setError("Lỗi kết nối khi tải danh sách đơn hàng.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderId: string, nextStatus: OrderStatus) {
    setError("");
    setSuccess("");
    setUpdatingId(orderId);

    try {
      const res = await fetch(apiUrl(`/api/admin/orders/${orderId}/status`), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = (await res.json()) as { order?: Order; error?: string };
      if (!res.ok || !data.order) throw new Error(data.error || "Không thể cập nhật trạng thái");

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus, updated_at: data.order!.updated_at } : o)),
      );
      setSuccess(`Đã cập nhật đơn "${orderId}" sang trạng thái "${nextStatus}"`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã xảy ra lỗi");
    } finally {
      setUpdatingId(null);
    }
  }

  const money = (n: number) => n.toLocaleString("vi-VN") + "đ";

  // Statistics calculation
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Chờ xác nhận").length;
  const shippingOrders = orders.filter((o) => o.status === "Đang giao").length;
  const completedRevenue = orders
    .filter((o) => o.status === "Hoàn thành")
    .reduce((sum, o) => sum + o.total, 0);

  const displayedOrders =
    filterStatus === "Tất cả" ? orders : orders.filter((o) => o.status === filterStatus);

  const STATUS_OPTIONS: OrderStatus[] = [
    "Chờ xác nhận",
    "Đã xác nhận",
    "Đang giao",
    "Hoàn thành",
    "Đã hủy",
  ];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <span className="eyebrow"><span className="eyebrow-line" /> QUẢN TRỊ VIÊN · BOOKNEST</span>
          <h2>Quản lý đơn hàng & Tiến độ COD</h2>
          <p className="admin-subhead">Xác nhận đơn, cập nhật tiến độ giao hàng và tự động đối soát tồn kho.</p>
        </div>
        <button className="secondary-button" onClick={loadOrders} disabled={loading}>
          {loading ? "Đang tải..." : "Làm mới đơn ↻"}
        </button>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="status">{success}</div>}

      {/* KPI Stats Bar */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <span className="stat-label">Tổng đơn hàng</span>
          <strong className="stat-value">{totalOrders}</strong>
        </div>
        <div className="stat-card alert-stat">
          <span className="stat-label">Chờ xác nhận</span>
          <strong className="stat-value">{pendingOrders}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Đang giao hàng</span>
          <strong className="stat-value">{shippingOrders}</strong>
        </div>
        <div className="stat-card highlight-stat">
          <span className="stat-label">Doanh thu hoàn thành</span>
          <strong className="stat-value">{money(completedRevenue)}</strong>
        </div>
      </div>

      {/* Filter status tabs */}
      <div className="admin-filter-bar">
        <div className="filter-group">
          <span>Lọc theo trạng thái:</span>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="Tất cả">Tất cả đơn ({totalOrders})</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st} ({orders.filter((o) => o.status === st).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="catalog-loading">Đang tải danh sách đơn hàng...</div>
      ) : displayedOrders.length === 0 ? (
        <div className="catalog-empty">Không có đơn hàng nào thuộc trạng thái này.</div>
      ) : (
        <div className="admin-orders-list">
          {displayedOrders.map((o) => (
            <div key={o.id} className="admin-order-card">
              <div className="admin-order-top">
                <div>
                  <strong>Mã đơn: <span className="order-id-badge">{o.id}</span></strong>
                  <span className="order-date">
                    Ngày đặt: {new Date(o.created_at).toLocaleString("vi-VN")}
                  </span>
                </div>

                <div className="status-control">
                  <label htmlFor={`status-${o.id}`}>Cập nhật trạng thái:</label>
                  <select
                    id={`status-${o.id}`}
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                    disabled={updatingId === o.id}
                    className={`status-select status-${o.status === "Chờ xác nhận" ? "pending" : o.status === "Đã xác nhận" ? "confirmed" : o.status === "Đang giao" ? "shipping" : o.status === "Hoàn thành" ? "done" : "cancelled"}`}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items in order */}
              <div className="admin-order-items">
                {o.items?.map((item) => (
                  <div key={item.id} className="admin-order-item-row">
                    <span className="title">📖 {item.title}</span>
                    <span className="qty">x {item.quantity}</span>
                    <span className="price">{money(item.total_price)}</span>
                  </div>
                ))}
              </div>

              {/* Bottom details */}
              <div className="admin-order-bottom">
                <div className="cust-info">
                  <div>Người nhận: <strong>{o.customer_name}</strong> · ĐT: {o.phone}</div>
                  <div>Địa chỉ: {o.address}</div>
                  {o.note && <div className="note">Ghi chú: {o.note}</div>}
                </div>

                <div className="price-breakdown">
                  <span>Tiền sách: {money(o.subtotal)} | Phí ship: {money(o.shipping_fee)}</span>
                  <div className="total-highlight">
                    Tổng thu (COD): <strong>{money(o.total)}</strong>
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
