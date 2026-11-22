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
