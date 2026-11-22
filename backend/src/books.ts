import type { Env } from "./auth";

export interface BookItem {
  id: string;
  title: string;
  author: string;
  category_id: string;
  category_name: string;
  price: number;
  stock: number;
  is_active: number;
  cover_color: string;
  symbol: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description: string | null;
}

export async function getCategories(env: Env): Promise<Response> {
  const result = await env.DB.prepare(
    "SELECT id, name, description FROM categories ORDER BY name ASC",
  ).all<CategoryItem>();
  return Response.json({ categories: result.results });
}

export async function getBooks(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const q = url.searchParams.get("q")?.trim();
  const sort = url.searchParams.get("sort");

  let query = `
    SELECT b.id, b.title, b.author, b.category_id, c.name AS category_name,
           b.price, b.stock, b.is_active, b.cover_color, b.symbol, b.description
    FROM books b
    JOIN categories c ON c.id = b.category_id
    WHERE b.is_active = 1
  `;
  const binds: (string | number)[] = [];

  if (category && category !== "Tất cả") {
    query += " AND (c.id = ? OR c.name = ?)";
    binds.push(category, category);
  }

  if (q) {
    query += " AND (b.title LIKE ? OR b.author LIKE ?)";
    const pattern = `%${q}%`;
    binds.push(pattern, pattern);
  }

  if (sort === "asc") {
    query += " ORDER BY b.price ASC";
  } else if (sort === "desc") {
    query += " ORDER BY b.price DESC";
  } else {
    query += " ORDER BY b.id ASC";
  }

  const statement = binds.length ? env.DB.prepare(query).bind(...binds) : env.DB.prepare(query);
  const result = await statement.all<BookItem>();
  return Response.json({ books: result.results });
}

export async function getBookDetail(env: Env, id: string): Promise<Response> {
  const book = await env.DB.prepare(`
    SELECT b.id, b.title, b.author, b.category_id, c.name AS category_name,
           b.price, b.stock, b.is_active, b.cover_color, b.symbol, b.description
    FROM books b
    JOIN categories c ON c.id = b.category_id
    WHERE b.id = ? AND b.is_active = 1
  `).bind(id).first<BookItem>();

  if (!book) {
    return Response.json({ error: "Sách không tồn tại hoặc đã ngừng bán" }, { status: 404 });
  }
  return Response.json({ book });
}

export async function getAdminBooks(env: Env): Promise<Response> {
  const result = await env.DB.prepare(`
    SELECT b.id, b.title, b.author, b.category_id, c.name AS category_name,
           b.price, b.stock, b.is_active, b.cover_color, b.symbol, b.description,
           b.created_at, b.updated_at
    FROM books b
    JOIN categories c ON c.id = b.category_id
    ORDER BY b.updated_at DESC, b.id ASC
  `).all<BookItem>();
  return Response.json({ books: result.results });
}

export async function createAdminBook(request: Request, env: Env): Promise<Response> {
  let body: Partial<BookItem>;
  try {
    body = await request.json() as Partial<BookItem>;
  } catch {
    return Response.json({ error: "Dữ liệu JSON không hợp lệ" }, { status: 400 });
  }

  const title = body.title?.trim();
  const author = body.author?.trim();
  const category_id = body.category_id?.trim();
  const price = Number(body.price);
  const stock = body.stock !== undefined ? Number(body.stock) : 0;
  const is_active = body.is_active === 0 ? 0 : 1;
  const cover_color = body.cover_color?.trim() || "#b96849";
  const symbol = body.symbol?.trim() || "✳";
  const description = body.description?.trim() || null;

  if (!title || !author || !category_id) {
    return Response.json({ error: "Tên sách, tác giả và danh mục là bắt buộc" }, { status: 400 });
  }

  if (Number.isNaN(price) || price < 0) {
    return Response.json({ error: "Giá sách phải là số lớn hơn hoặc bằng 0" }, { status: 400 });
  }

  if (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
    return Response.json({ error: "Số lượng tồn kho phải là số nguyên không âm" }, { status: 400 });
  }

  // Check valid category
  const categoryExists = await env.DB.prepare("SELECT 1 FROM categories WHERE id = ?").bind(category_id).first();
  if (!categoryExists) {
    return Response.json({ error: "Danh mục không tồn tại" }, { status: 400 });
  }

  const id = `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  await env.DB.prepare(`
    INSERT INTO books (id, title, author, category_id, price, stock, is_active, cover_color, symbol, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, title, author, category_id, price, stock, is_active, cover_color, symbol, description).run();

  const created = await env.DB.prepare(`
    SELECT b.id, b.title, b.author, b.category_id, c.name AS category_name,
           b.price, b.stock, b.is_active, b.cover_color, b.symbol, b.description
    FROM books b
    JOIN categories c ON c.id = b.category_id
    WHERE b.id = ?
  `).bind(id).first<BookItem>();

  return Response.json({ book: created }, { status: 201 });
}

export async function updateAdminBook(request: Request, env: Env, id: string): Promise<Response> {
  const existing = await env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(id).first<BookItem>();
  if (!existing) {
    return Response.json({ error: "Sách không tồn tại" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Dữ liệu JSON không hợp lệ" }, { status: 400 });
  }

  const updates: string[] = [];
  const binds: (string | number)[] = [];

  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) return Response.json({ error: "Tên sách không được để trống" }, { status: 400 });
    updates.push("title = ?");
    binds.push(title);
  }

  if (body.author !== undefined) {
    const author = String(body.author).trim();
    if (!author) return Response.json({ error: "Tác giả không được để trống" }, { status: 400 });
    updates.push("author = ?");
    binds.push(author);
  }

  if (body.category_id !== undefined) {
    const category_id = String(body.category_id).trim();
    const categoryExists = await env.DB.prepare("SELECT 1 FROM categories WHERE id = ?").bind(category_id).first();
    if (!categoryExists) return Response.json({ error: "Danh mục không tồn tại" }, { status: 400 });
    updates.push("category_id = ?");
    binds.push(category_id);
  }

  if (body.price !== undefined) {
    const price = Number(body.price);
    if (Number.isNaN(price) || price < 0) {
      return Response.json({ error: "Giá sách phải là số lớn hơn hoặc bằng 0" }, { status: 400 });
    }
    updates.push("price = ?");
    binds.push(price);
  }

  if (body.stock !== undefined) {
    const stock = Number(body.stock);
    if (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      return Response.json({ error: "Số lượng tồn kho phải là số nguyên không âm" }, { status: 400 });
    }
    updates.push("stock = ?");
    binds.push(stock);
  }

  if (body.is_active !== undefined) {
    const is_active = body.is_active === 1 || body.is_active === true ? 1 : 0;
    updates.push("is_active = ?");
    binds.push(is_active);
  }

  if (body.cover_color !== undefined) {
    updates.push("cover_color = ?");
    binds.push(String(body.cover_color));
  }

  if (body.symbol !== undefined) {
    updates.push("symbol = ?");
    binds.push(String(body.symbol));
  }

  if (body.description !== undefined) {
    updates.push("description = ?");
    binds.push(body.description ? String(body.description).trim() : "");
  }

  if (updates.length === 0) {
    return Response.json({ book: existing });
  }

  updates.push("updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))");
  binds.push(id);

  await env.DB.prepare(`
    UPDATE books SET ${updates.join(", ")} WHERE id = ?
  `).bind(...binds).run();

  const updated = await env.DB.prepare(`
    SELECT b.id, b.title, b.author, b.category_id, c.name AS category_name,
           b.price, b.stock, b.is_active, b.cover_color, b.symbol, b.description,
           b.created_at, b.updated_at
    FROM books b
    JOIN categories c ON c.id = b.category_id
    WHERE b.id = ?
  `).bind(id).first<BookItem>();

  return Response.json({ book: updated });
}
