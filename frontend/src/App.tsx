import { useEffect, useState, type FormEvent } from "react";

type Mode = "login" | "register";
type User = { id: string; email: string; displayName: string; role: "customer" | "admin" };
type ApiResult = { user?: User; error?: string };

const messages: Record<string, string> = {
  "Email already registered": "Email này đã được sử dụng. Hãy đăng nhập hoặc dùng email khác.",
  "Invalid credentials": "Email hoặc mật khẩu không đúng.",
  "Invalid email": "Vui lòng nhập địa chỉ email hợp lệ.",
  "Invalid display name": "Tên hiển thị cần có từ 1 đến 100 ký tự.",
  "Password must be 8 to 128 characters": "Mật khẩu cần có từ 8 đến 128 ký tự.",
};

async function api(path: string, method = "GET", body?: object): Promise<{ status: number; data: ApiResult }> {
  const response = await fetch(path, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, data: await response.json() as ApiResult };
}

export default function App() {
  const [mode, setMode] = useState<Mode>("login");
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    let active = true;
    api("/api/auth/me")
      .then(({ status, data }) => { if (active && status === 200 && data.user) setUser(data.user); })
      .catch(() => { if (active) setError("Không kết nối được máy chủ. Hãy kiểm tra Worker local."); })
      .finally(() => { if (active) setLoadingSession(false); });
    return () => { active = false; };
  }, []);

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setNotice("");
    setPassword("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password || (mode === "register" && !displayName.trim())) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "register") {
        const result = await api("/api/auth/register", "POST", {
          email: normalizedEmail, password, displayName: displayName.trim(),
        });
        if (result.status !== 201) throw new Error(result.data.error || "Đăng ký không thành công.");
        setMode("login");
        setPassword("");
        setNotice("Tạo tài khoản thành công. Hãy đăng nhập để tiếp tục.");
      } else {
        const result = await api("/api/auth/login", "POST", { email: normalizedEmail, password });
        if (result.status !== 200 || !result.data.user) throw new Error(result.data.error || "Đăng nhập không thành công.");
        setUser(result.data.user);
        setPassword("");
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Đã xảy ra lỗi. Vui lòng thử lại.";
      setError(messages[message] || (message === "Failed to fetch" ? "Không kết nối được máy chủ. Hãy kiểm tra Worker local." : message));
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setError("");
    try {
      const result = await api("/api/auth/logout", "POST");
      if (result.status !== 200) throw new Error("Không đăng xuất được. Vui lòng thử lại.");
      setUser(null);
      setMode("login");
      setNotice("Bạn đã đăng xuất an toàn.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không đăng xuất được.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="BookNest - Trang tài khoản">
          <span className="brand-mark" aria-hidden="true">✳</span><span>Book<span className="brand-accent">Nest</span></span>
        </a>
        <span className="topbar-note">Một góc nhỏ dành cho người yêu sách</span>
      </header>

      <main className="main-grid">
        <section className="story-panel" aria-labelledby="story-title">
          <div className="story-content">
            <span className="eyebrow"><span className="eyebrow-line" /> CHÀO MỪNG ĐẾN BOOKNEST</span>
            <h1 id="story-title">Mỗi cuốn sách,<br /><em>một hành trình mới.</em></h1>
            <p>Lưu giữ những lựa chọn của bạn, khám phá những câu chuyện hay và theo dõi đơn sách ở một nơi quen thuộc.</p>
            <div className="story-rule" />
            <div className="story-footer"><span className="story-number">01 / 03</span><span>Đọc nhiều hơn, mỗi ngày.</span></div>
          </div>
          <div className="book-illustration" aria-hidden="true">
            <div className="book book-back" /><div className="book book-middle" /><div className="book book-front"><span>BOOK<br />NEST</span><small>STORIES TO KEEP</small></div>
            <span className="spark spark-one">✦</span><span className="spark spark-two">✳</span>
          </div>
        </section>

        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-content">
            <span className="section-kicker">TÀI KHOẢN CỦA BẠN</span>
            {loadingSession ? <p role="status">Đang kiểm tra phiên đăng nhập...</p> : user ? (
              <>
                <h2 id="auth-title">Chào mừng trở lại,<br /><em>{user.displayName}</em></h2>
                <p className="intro">Bạn đã đăng nhập vào BookNest.</p>
                <div className="account-card">
                  <div className="avatar" aria-hidden="true">{user.displayName.charAt(0).toUpperCase()}</div>
                  <div><strong>{user.displayName}</strong><span>{user.email}</span></div>
                  <span className="role-pill">{user.role === "admin" ? "Quản trị viên" : "Khách hàng"}</span>
                </div>
                {error && <div className="alert alert-error" role="alert">{error}</div>}
                <button className="primary-button" type="button" onClick={logout} disabled={busy}>{busy ? "Đang đăng xuất..." : "Đăng xuất"}<span aria-hidden="true">↗</span></button>
              </>
            ) : (
              <>
                <h2 id="auth-title">{mode === "login" ? <>Rất vui khi<br /><em>gặp lại bạn.</em></> : <>Bắt đầu một<br /><em>chương mới.</em></>}</h2>
                <p className="intro">{mode === "login" ? "Đăng nhập để tiếp tục hành trình đọc sách của bạn." : "Tạo tài khoản để lưu lại những cuốn sách bạn yêu thích."}</p>

                <div className="auth-tabs" role="tablist" aria-label="Tài khoản">
                  <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>Đăng nhập</button>
                  <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")}>Đăng ký</button>
                </div>

                {notice && <div className="alert alert-success" role="status">{notice}</div>}
                {error && <div className="alert alert-error" role="alert">{error}</div>}

                <form onSubmit={submit}>
                  {mode === "register" && <div className="field"><label htmlFor="display-name">Tên hiển thị</label><input id="display-name" autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={100} placeholder="Tên của bạn" required /></div>}
                  <div className="field"><label htmlFor="email">Địa chỉ email</label><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} placeholder="ban@example.com" required /></div>
                  <div className="field"><label htmlFor="password">Mật khẩu</label><div className="password-field"><input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={mode === "register" ? 8 : undefined} maxLength={128} placeholder={mode === "register" ? "Tối thiểu 8 ký tự" : "Nhập mật khẩu"} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{showPassword ? "Ẩn" : "Hiện"}</button></div></div>
                  <button className="primary-button" type="submit" disabled={busy}>{busy ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}<span aria-hidden="true">↗</span></button>
                </form>
                <p className="switch-hint">{mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"} <button type="button" onClick={() => switchMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}</button></p>
              </>
            )}
          </div>
          <footer className="auth-footer"><span>© 2026 BookNest</span><span>Những trang sách đang chờ bạn.</span></footer>
        </section>
      </main>
    </div>
  );
}
