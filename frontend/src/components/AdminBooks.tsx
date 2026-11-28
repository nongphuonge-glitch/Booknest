import { useState, useEffect, type FormEvent } from "react";
import type { Book, Category } from "../types";
import { apiUrl } from "../api";

export function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Add book form state
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newPrice, setNewPrice] = useState("89000");
  const [newStock, setNewStock] = useState("10");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("#b96849");
  const [newSymbol, setNewSymbol] = useState("✳");
  const [submitting, setSubmitting] = useState(false);

  // Edit stock inline states
  const [editingStock, setEditingStock] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function loadAdminBooks() {
    setLoading(true);
    Promise.all([
      fetch(apiUrl("/api/admin/books"), { credentials: "include" }).then((r) => r.json() as Promise<{ books?: Book[]; error?: string }>),
      fetch(apiUrl("/api/categories")).then((r) => r.json() as Promise<{ categories?: Category[] }>),
    ])
      .then(([booksData, catData]) => {
        if (booksData.books) {
          setBooks(booksData.books);
          // initialize inline stock values
          const map: Record<string, string> = {};
          for (const b of booksData.books) {
            map[b.id] = String(b.stock);
          }
          setEditingStock(map);
        } else if (booksData.error) {
          setError(booksData.error);
        }
        if (catData.categories) {
          setCategories(catData.categories);
          if (catData.categories.length > 0 && !newCategoryId) {
            setNewCategoryId(catData.categories[0].id);
          }
        }
      })
      .catch(() => {
        setError("Lỗi kết nối khi tải dữ liệu quản trị.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadAdminBooks();
  }, []);

  async function handleToggleActive(book: Book) {
    setError("");
    setSuccess("");
    const nextActive = book.is_active === 1 ? 0 : 1;
    setUpdatingId(book.id);

    try {
      const res = await fetch(apiUrl(`/api/admin/books/${book.id}`), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: nextActive }),
      });
      const data = await res.json() as { book?: Book; error?: string };
      if (!res.ok || !data.book) throw new Error(data.error || "Không thể cập nhật trạng thái");

      setBooks((prev) => prev.map((b) => (b.id === book.id ? data.book! : b)));
      setSuccess(`Đã ${nextActive === 1 ? "bật bán" : "ẩn"} cuốn sách "${book.title}"`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã xảy ra lỗi");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSaveStock(book: Book) {
    setError("");
    setSuccess("");
    const stockVal = editingStock[book.id];
    const parsed = Number(stockVal);

    if (Number.isNaN(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
      setError("Số lượng tồn kho phải là số nguyên không âm (AC06).");
      return;
    }

    setUpdatingId(book.id);
    try {
      const res = await fetch(apiUrl(`/api/admin/books/${book.id}`), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: parsed }),
      });
      const data = await res.json() as { book?: Book; error?: string };
      if (!res.ok || !data.book) throw new Error(data.error || "Không thể cập nhật tồn kho");

      setBooks((prev) => prev.map((b) => (b.id === book.id ? data.book! : b)));
      setSuccess(`Đã cập nhật tồn kho "${book.title}" thành ${parsed}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã xảy ra lỗi");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleCreateBook(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const parsedPrice = Number(newPrice);
    const parsedStock = Number(newStock);

    if (!newTitle.trim() || !newAuthor.trim()) {
      setError("Vui lòng điền tên sách và tác giả.");
      return;
    }
    if (parsedPrice < 0) {
      setError("Giá sách không được là số âm.");
      return;
    }
    if (parsedStock < 0 || !Number.isInteger(parsedStock)) {
      setError("Số lượng tồn kho phải là số nguyên không âm.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("/api/admin/books"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          author: newAuthor.trim(),
          category_id: newCategoryId,
          price: parsedPrice,
          stock: parsedStock,
          description: newDesc.trim() || null,
          cover_color: newColor,
          symbol: newSymbol,
          is_active: 1,
        }),
      });
      const data = await res.json() as { book?: Book; error?: string };
      if (!res.ok || !data.book) throw new Error(data.error || "Không thể thêm sách");

      setBooks((prev) => [data.book!, ...prev]);
      setEditingStock((prev) => ({ ...prev, [data.book!.id]: String(data.book!.stock) }));
      setSuccess(`Thêm sách mới "${data.book.title}" thành công!`);
      setShowAddForm(false);
      setNewTitle("");
      setNewAuthor("");
      setNewDesc("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  }

  const money = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <span className="eyebrow"><span className="eyebrow-line" /> QUẢN TRỊ VIÊN · BOOKNEST</span>
          <h2>Quản lý tủ sách & Tồn kho</h2>
          <p className="admin-subhead">Xem toàn bộ danh mục, cập nhật số lượng tồn kho (BR04) và ẩn/hiện sách bán (BR03).</p>
        </div>
        <button
          className="primary-button add-book-toggle"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Đóng form thêm sách" : "+ Thêm sách mới"}
        </button>
      </div>

      {noticeMessage(error, success)}

      {/* Form thêm sách mới */}
      {showAddForm && (
        <form className="add-book-card" onSubmit={handleCreateBook}>
          <h3>Thêm tựa sách mới vào danh mục</h3>
          <div className="form-grid">
            <div className="field">
              <label>Tên sách *</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ví dụ: Nghệ thuật sống vui"
                required
              />
            </div>
            <div className="field">
              <label>Tác giả *</label>
              <input
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="Ví dụ: Hoàng Nam"
                required
              />
            </div>
            <div className="field">
              <label>Thể loại *</label>
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Đơn giá (VNĐ) *</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Số lượng tồn ban đầu *</label>
              <input
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Màu bìa (Hex)</label>
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Ký hiệu bìa</label>
              <select
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
              >
                <option value="✳">✳ Hoa thị</option>
                <option value="❋">❋ Bông hoa</option>
                <option value="≈">≈ Lượn sóng</option>
                <option value="↗">↗ Mũi tên</option>
                <option value="☀">☀ Mặt trời</option>
                <option value="✿">✿ Hoa nhỏ</option>
                <option value="✦">✦ Ngôi sao</option>
                <option value="◈">◈ Kim cương</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Mô tả ngắn</label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Giới thiệu nội dung cuốn sách..."
            />
          </div>
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Đang lưu sách..." : "Lưu sách vào hệ thống"}
          </button>
        </form>
      )}

      {/* Bảng danh sách sách admin */}
      {loading ? (
        <div className="catalog-loading">Đang tải dữ liệu quản trị...</div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Bìa</th>
                <th>Tên sách & Tác giả</th>
                <th>Thể loại</th>
                <th>Giá bán</th>
                <th>Tồn kho (BR04)</th>
                <th>Trạng thái (BR03)</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id} className={b.is_active === 0 ? "row-hidden" : ""}>
                  <td>
                    <div
                      className="table-mini-cover"
                      style={{ backgroundColor: b.cover_color }}
                    >
                      {b.symbol}
                    </div>
                  </td>
                  <td>
                    <strong>{b.title}</strong>
                    <div className="table-subtext">{b.author}</div>
                  </td>
                  <td>
                    <span className="badge-cat">{b.category_name}</span>
                  </td>
                  <td className="table-price">{money(b.price)}</td>
                  <td>
                    <div className="stock-edit-cell">
                      <input
                        type="number"
                        min="0"
                        className="stock-input"
                        value={editingStock[b.id] ?? b.stock}
                        onChange={(e) =>
                          setEditingStock({ ...editingStock, [b.id]: e.target.value })
                        }
                        aria-label={`Sửa tồn kho cho ${b.title}`}
                      />
                      <button
                        type="button"
                        className="small-btn save-stock-btn"
                        onClick={() => handleSaveStock(b)}
                        disabled={updatingId === b.id}
                        title="Lưu số lượng tồn"
                      >
                        Lưu
                      </button>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        b.is_active === 1 ? "status-active" : "status-hidden"
                      }`}
                    >
                      {b.is_active === 1 ? "Đang bán" : "Đã ẩn"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`small-btn ${
                        b.is_active === 1 ? "btn-hide" : "btn-show"
                      }`}
                      onClick={() => handleToggleActive(b)}
                      disabled={updatingId === b.id}
                    >
                      {b.is_active === 1 ? "Ẩn sách" : "Bật bán"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function noticeMessage(error: string, success: string) {
  return (
    <>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="status">{success}</div>}
    </>
  );
}
