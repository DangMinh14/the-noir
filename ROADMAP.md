# Thé Noir — Lộ trình kỹ thuật

Kiểm kê hiện trạng hai repo (`the-noir` frontend + [`the-noir-api`](https://github.com/DangMinh14/the-noir-api) backend) và lộ trình để biến sản phẩm từ một landing page thành một showcase full-stack hoàn chỉnh có đặt hàng thật. Dựng từ việc đọc trực tiếp mã nguồn, migration và git log — không suy đoán. Cập nhật lần cuối: 2026-07-06.

Đây là tài liệu tham chiếu cho bất kỳ agent/dev nào làm việc tiếp trên project — đọc trước khi bắt đầu một tính năng mới để biết nó thuộc giai đoạn nào và phụ thuộc gì.

## Hiện trạng

### Frontend (`the-noir`)
Next.js 16 (App Router) + Tailwind v4 + framer-motion + TypeScript. Không có state/form/fetch library ngoài — tự viết wrapper `fetch` ở `src/lib/api.ts`.

**Đã có, hoạt động thật:**
- Landing page dark-luxury đầy đủ: Hero (video loop), Collection, Story, Ritual, Maisons, CTA, Footer
- Auth thật: đăng ký/đăng nhập/quên-đặt lại mật khẩu/đổi hồ sơ — JWT lưu `localStorage`, gọi API thật (không mock)
- `/admin`: 5 panel (Overview, Products, Categories, Cities, Users) — CRUD thật 100%, upload ảnh sản phẩm thật

**Khoảng trống đã xác nhận:**
- **Không có trang `/menu`.** Toàn bộ route hiện có: `/`, `/login`, `/register`, `/profile`, `/admin`, `/forgot-password`. Không filter, không category, không trang chi tiết sản phẩm.
- **Collection trên landing (`src/components/collection.tsx`) dùng mảng `PRODUCTS` hardcode trong code, KHÔNG gọi `/api/products`.** Khách luôn thấy đúng 4 món cố định trỏ ảnh Unsplash, bất kể admin đã thêm/sửa/xoá gì trong database qua `/admin`. Hai hệ thống (catalog admin quản lý và landing page hiển thị) đang hoàn toàn tách biệt — đây là việc cần sửa đầu tiên khi làm trang Menu, không chỉ là "thêm trang mới".
- Không có route bảo vệ ở server (middleware) — `/profile`, `/admin` chỉ chặn phía client bằng `useEffect`
- Không dùng field `expiresAt` trả về từ login — token hết hạn không tự đăng xuất
- Bảng trong 5 panel admin không phân trang, không tìm kiếm
- Không i18n, không theme sáng/tối

### Backend (`the-noir-api`)
ASP.NET Core .NET 10, EF Core + SQLite (đích production: PostgreSQL), JWT HMAC-SHA256 hết hạn 7 ngày. Kiến trúc Controller + Service, 6 controller / 22 endpoint.

**Đã có, hoạt động thật:**
- 4 entity: `User`, `Product`, `Category`, `City` (quan hệ Category 1–n Product, `OnDelete: Restrict`)
- Phân quyền Role (`User`/`Admin`) ở cấp controller — ghi/xoá chỉ Admin, đọc public cho landing dùng
- Chi tiết bảo mật tử tế: hash password chuẩn (`IPasswordHasher<User>`), so sánh reset-token bằng `CryptographicOperations.FixedTimeEquals`, thông báo lỗi generic chống dò email khi login

**Khoảng trống đã xác nhận:**
- **Chưa có entity `Order`/`OrderItem`/`Cart`** — không có gì để "mua" cả, đây là mảnh ghép lớn nhất còn thiếu
- Chưa gửi email thật — `forgot-password` trả `resetToken` thẳng cho client vì chưa có email service (ghi rõ trong comment code, là quyết định tạm có chủ đích)
- Không có refresh token, không có test project nào (`dotnet test` — chưa tồn tại project test)
- `README.md` của backend lỗi thời: roadmap trong đó ghi "Auth + admin-only writes" là `[ ]` chưa làm, dù thực tế đã xong từ commit `1999d6c`

## Nhận định

Phần đã làm chất lượng cao hơn mức trung bình của một project cá nhân — nền tảng đủ vững để xây tiếp, không cần làm lại. Nhưng nhìn tổng thể, sản phẩm hiện tại là **"một brochure sang trọng có thêm ô đăng nhập"**: khách xem được menu tĩnh, đọc được câu chuyện thương hiệu, nhưng không có đường nào để họ thực sự đặt một ly trà. Một hệ thống order chạm đến mọi lớp (data model quan hệ, business logic tính tiền phía server, trạng thái đơn, admin vận hành) là đòn bẩy lớn nhất để chứng minh năng lực full-stack — lớn hơn nhiều so với thêm CRUD cho một entity tĩnh khác.

## Tính năng đề xuất

### Phía khách hàng (Customer)
Xếp theo đòn bẩy — mục đầu là thứ biến site từ brochure thành cửa hàng:

1. **Giỏ hàng & thanh toán** — thêm vào giỏ từ menu, giỏ hàng nổi, checkout chọn maison nhận hàng. Cần entity `Order`/`OrderItem` mới, tính giá phía server (không tin giá client gửi lên).
2. **Trang Menu đầy đủ** (`/menu`) — lọc theo category, tìm kiếm, trang chi tiết từng món. Bắt buộc phải nối `Collection`/trang mới với `/api/products` thật, không tiếp tục hardcode.
3. **Lịch sử đơn hàng** — thêm tab vào `/profile` đã có sẵn
4. **Điểm thành viên** — tích điểm mỗi đơn, đổi quà
5. **Đánh giá sản phẩm** — rating + review, ràng buộc vào `Order` (chỉ khách đã mua mới đánh giá được)
6. **Store locator có bản đồ** — nâng cấp danh sách 4 thành phố tĩnh hiện tại
7. **Danh sách yêu thích**
8. **Đăng ký nhận tin** — đã có sẵn trong roadmap backend cũ, chỉ cần nối UI + bảng `NewsletterSubscriber`

### Phía quản trị (Admin)
1. **Quản lý đơn hàng** — bảng kiểu "kitchen queue": mới → đang pha → sẵn sàng → đã giao
2. **Dashboard phân tích** — thay `overview-panel.tsx` hiện tại (chỉ đếm số dòng) bằng biểu đồ doanh thu/món bán chạy/tỉ trọng danh mục thật
3. **Mã khuyến mãi** — discount code có giới hạn thời gian/số lượt dùng
4. **Tồn kho theo cửa hàng** — nối bảng Product × City
5. **Dịch vụ email thật** (SMTP/SendGrid) — vá lỗ hổng forgot-password, dùng lại cho email xác nhận đơn
6. **Refresh token & nhật ký hoạt động**
7. **Phân trang & tìm kiếm** cho 5 bảng admin hiện có
8. **Phân quyền chi tiết hơn** — tách "Staff" (chỉ xử lý đơn) khỏi "Admin" (toàn quyền)

### Đột phá giao diện
- **Bộ tuỳ chỉnh ly nước động** (ý tưởng gốc từ chủ project): trên trang chi tiết món, minh hoạ ly nước phản ứng trực tiếp — số lượng dùng `layout` animation của framer-motion cho ly xếp hàng/trượt vào-ra có stagger; Nóng/Đá đổi mực nước, đá "rơi" vào ly, hơi nước bốc lên; size morph chiều cao ly mượt. Kỹ thuật: SVG ly nước phân lớp (viền/mực nước/đá/bọt/hơi) để animate độc lập từng lớp, không đổi ảnh raster.
- Command palette (⌘K) — tìm món, nhảy trang, đặt lại đơn gần nhất
- Hành trình lá trà khi cuộn ở section Story — scroll-scrubbed thay vì chỉ parallax
- Nghi thức xác nhận đơn — khoảnh khắc ngắn thay toast khô khan
- Ly nước 3D xoay được (react-three-fiber) — đầu tư cao, để giai đoạn cuối nếu còn thời gian

### Hai quyết định đã cân nhắc

**Song ngữ Anh–Việt:** nên làm bằng `next-intl` (route `/en` /`/vi`), nhưng **sau** khi giỏ hàng/đơn hàng ổn định — làm ngay bây giờ nghĩa là nhân đôi công sức mỗi lần sửa cấu trúc dữ liệu ở Giai đoạn 1.

**Theme sáng/tối:** "Dark luxury" hiện tại là bản sắc thương hiệu Thé Noir, không phải một tuỳ chọn màu — đảo màu máy móc sẽ ra bản "nhạt" mất không khí maison. Nên xây `ThemeProvider` + design token thật, nhưng thiết kế theme sáng như một biến thể **"Salon ban ngày"** riêng (giấy kem ấm, ảnh sáng hơn), không phải phép invert tự động. Ưu tiên thấp hơn song ngữ.

## Lộ trình theo giai đoạn

Thứ tự không tuỳ ý — mỗi giai đoạn sau dựa vào kết cấu/dữ liệu giai đoạn trước.

1. **Lõi thương mại** (đòn bẩy cao nhất) — entity `Order`/`OrderItem` + tính giá server-side, trang `/menu` nối API thật (thay hardcode), giỏ hàng, checkout, lịch sử đơn
2. **Vận hành cho Admin** (có thể song song sớm) — quản lý đơn hàng, dashboard phân tích, email service thật, refresh token, phân trang/tìm kiếm
3. **Tương tác chữ ký** (sau khi có trang chi tiết sản phẩm) — bộ tuỳ chỉnh ly nước động, nghi thức xác nhận đơn, command palette
4. **Song ngữ** — `next-intl`, một lần lên cấu trúc đã ổn định
5. **Hệ thống theme** — token hoá màu thật, biến thể "Salon ban ngày" riêng
6. **Sẵn sàng sản xuất** — SQLite → PostgreSQL, test project đầu tiên, deploy backend thật, rate limiting, secrets ngoài `appsettings.json`

Dùng tài liệu này làm điểm khởi đầu khi nghiên cứu từng giai đoạn, không phải bản thiết kế cố định — thứ tự có thể đổi nếu ràng buộc thời gian/mục tiêu thay đổi.
