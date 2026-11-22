import { requireUser } from "./auth";
import type { Env, CurrentUser } from "./auth";
import type { BookItem } from "./books";

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string;
  title: string;
  price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  phone: string;
  address: string;
  note: string | null;
  subtotal: number;
  shipping_fee: number;
  total: number;
  payment_method: string;
  status: "Chờ xác nhận" | "Đã xác nhận" | "Đang giao" | "Hoàn thành" | "Đã hủy";
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

interface CreateOrderItemInput {
  book_id: string;
  quantity: number;
}

interface CreateOrderInput {
  customer_name: string;
  phone: string;
  address: string;
  note?: string;
  items: CreateOrderItemInput[];
}

export async function createOrder(request: Request, env: Env): Promise<Response> {
  const auth = await requireUser(request, env);
  if (auth instanceof Response) {
    return Response.json(
      { error: "Vui lòng đăng nhập để tiến hành đặt hàng COD (US07)" },
      { status: 401 },
    );
  }
  const user = auth as CurrentUser;

  let body: CreateOrderInput;
  try {
    body = (await request.json()) as CreateOrderInput;
  } catch {
    return Response.json({ error: "Dữ liệu JSON không hợp lệ" }, { status: 400 });
  }

  const customerName = body.customer_name?.trim();
  const phone = body.phone?.trim();
  const address = body.address?.trim();
  const note = body.note?.trim() || null;
  const items = body.items;

  if (!customerName || !phone || !address) {
    return Response.json({ error: "Họ tên, số điện thoại và địa chỉ nhận hàng là bắt buộc" }, { status: 400 });
  }

  if (!/^[0-9+ ()-]{9,15}$/.test(phone)) {
    return Response.json({ error: "Số điện thoại nhận hàng không hợp lệ (9-15 chữ số)" }, { status: 400 });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "Giỏ hàng phải có ít nhất 1 cuốn sách để đặt hàng" }, { status: 400 });
  }

  // Validate items format
  for (const item of items) {
    if (!item.book_id || typeof item.book_id !== "string") {
      return Response.json({ error: "Mã sách không hợp lệ" }, { status: 400 });
    }
    const qty = Number(item.quantity);
    if (Number.isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
      return Response.json({ error: "Số lượng sách đặt mua phải là số nguyên dương" }, { status: 400 });
    }
  }

  // Query books in database to verify active status, stock, and official price (BR03, BR04, BR05)
  let subtotal = 0;
  const verifiedItems: {
    book_id: string;
    title: string;
    price: number;
    quantity: number;
    total_price: number;
  }[] = [];

  for (const item of items) {
    const book = await env.DB.prepare(
      "SELECT id, title, price, stock, is_active FROM books WHERE id = ?",
    ).bind(item.book_id).first<BookItem>();

    if (!book) {
      return Response.json({ error: `Cuốn sách có mã "${item.book_id}" không tồn tại` }, { status: 400 });
    }

    if (book.is_active !== 1) {
      return Response.json(
        { error: `Cuốn sách "${book.title}" hiện đã ngừng bán (BR03)` },
        { status: 400 },
      );
    }

    if (book.stock < item.quantity) {
      return Response.json(
        { error: `Cuốn sách "${book.title}" chỉ còn ${book.stock} cuốn trong kho, không đủ đáp ứng số lượng bạn đặt (BR04, AC07)` },
        { status: 400 },
      );
    }

    const itemPrice = book.price; // BR05: lấy đơn giá từ database server
    const itemTotal = itemPrice * item.quantity;
    subtotal += itemTotal;

    verifiedItems.push({
      book_id: book.id,
      title: book.title,
      price: itemPrice,
      quantity: item.quantity,
      total_price: itemTotal,
    });
  }

  // Calculate shipping fee according to BR05
  // BR05: Phí giao hàng 25.000đ nếu tiền sách dưới 300.000đ, từ 300.000đ trở lên được miễn phí
  const shippingFee = subtotal >= 300000 ? 0 : 25000;
  const total = subtotal + shippingFee;

  const orderId = `BN-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

  // Execute atomic transaction using D1 batch (BR04)
  const statements: D1PreparedStatement[] = [];

  // 1. Insert Order
  statements.push(
    env.DB.prepare(`
      INSERT INTO orders (id, user_id, customer_name, phone, address, note, subtotal, shipping_fee, total, payment_method, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'COD', 'Chờ xác nhận')
    `).bind(orderId, user.id, customerName, phone, address, note, subtotal, shippingFee, total),
  );

  // 2. Insert Order Items & Update Stock
  for (const item of verifiedItems) {
    const itemId = `item_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    statements.push(
      env.DB.prepare(`
        INSERT INTO order_items (id, order_id, book_id, title, price, quantity, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(itemId, orderId, item.book_id, item.title, item.price, item.quantity, item.total_price),
    );

    statements.push(
      env.DB.prepare(`
        UPDATE books
        SET stock = stock - ?, updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        WHERE id = ?
      `).bind(item.quantity, item.book_id),
    );
  }

  await env.DB.batch(statements);

  return Response.json(
    {
      order: {
        id: orderId,
        customer_name: customerName,
        phone,
        address,
        note,
        subtotal,
        shipping_fee: shippingFee,
        total,
        payment_method: "COD",
        status: "Chờ xác nhận",
        items: verifiedItems,
      },
    },
    { status: 201 },
  );
}
