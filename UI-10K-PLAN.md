# UI $10K Checklist - Plan sửa

Nguồn: audit ngày 2026-07-07 dựa trên checklist "8 things that separate a $10K website from a $200 one".
File này chỉ liệt kê hiện trạng + đề xuất, **chưa thực hiện gì**. Đánh dấu `[x]` khi cả hai đã chốt hướng làm, và tick khi code xong.

---

## 1. Point of view, not a template - Đạt

Không cần sửa. Giữ nguyên hướng dark-luxury, overline uppercase + kẻ gold.

Lưu ý theo dõi: pattern "overline / heading / body" đang lặp ở hầu hết section (Story, Ritual, Maisons...). Nếu thêm section mới, cân nhắc biến thể để tránh cảm giác công thức.

- [ ] (Không bắt buộc) Khi làm section mới, thử ít nhất 1 layout khác kiểu overline-trước-heading.

---

## 2. Typography có chủ đích - ĐÃ SỬA (2026-07-07)

Hiện trạng cũ: Playfair Display (heading) + Inter (body). Checklist liệt Inter là ví dụ font "default/cheap".

Đã đổi: body font Inter → **Manrope** (300-700, subset latin+vietnamese, `next/font/google`). Giữ Playfair Display cho heading (không đổi, đã gắn với logo/hero, không cần đập lại nhận diện). Manrope vẫn có full dấu tiếng Việt, ít phổ biến hơn Inter, hình chữ vuông vắn hợp với dark-luxury hơn.

- [x] Đổi body font sang Manrope.
- [x] File đã sửa: `src/app/layout.tsx` (font import, đổi `inter` → `manrope`), `src/app/globals.css` (`--font-sans` token).
- [ ] Cậu tự xem qua bằng mắt trên nhiều đoạn text dài (Story, Ritual) xem trọng lượng/rhythm có ổn không, quyết định giữ hay đổi tiếp.

---

## 3. Màu tiết chế - Đạt trên landing, leak nhẹ ở admin/auth

Landing page + `/menu` dùng 100% token noir/gold/cream. Chỗ leak: `amber`, `emerald`, `red` Tailwind stock ở:
- `src/components/admin/image-upload-field.tsx:24`
- `src/app/profile/page.tsx:15-21` (order status Ready/Cancelled)
- `src/components/cart-drawer.tsx:79` (nút xóa hover đỏ)

- [ ] Quyết định: có cần semantic token riêng (`--status-warning`, `--status-error`, `--status-success`) map theo gam màu brand không, hay giữ nguyên vì đây là UI nội bộ (admin/profile), không phải mặt tiền brand?
- [ ] Nếu làm: thêm token vào `globals.css`, thay các chỗ trên.

---

## 4. Hierarchy that breathes - Chưa đo trực tiếp

Agent audit chỉ suy luận từ design system (overline = tertiary, heading serif = primary, body = secondary), chưa đo whitespace/spacing rhythm thật bằng mắt lúc scroll.

- [ ] Cần tự chấm bằng mắt: scroll qua từng section trên cả desktop và mobile, xem có section nào bị "đặc" (thiếu whitespace) hoặc "loãng" (quá nhiều khoảng trống không có lý do) không.
- [ ] Ghi lại section cụ thể nếu thấy vấn đề, quay lại file này bổ sung.

---

## 5. Imagery with intent - ĐÃ SỬA (2026-07-08)

Hero video + logo: custom pipeline (AI gen, upscale, ffmpeg). Tốt.

Đã xử lý chỗ hở: ảnh Unsplash ở Story section thay bằng 2 ảnh AI-gen do cậu cung cấp (vườn trà + vườn cà phê, có sẵn logo gold khớp brand ngay trong ảnh).

- [x] Nguồn: 2 ảnh AI-gen (`ElevenLabs_image_gpt-image-2...` ở `D:\Download`), crop portrait 4:5 bằng ffmpeg giữ đúng sign + chi tiết chính, xuất `public/images/story-tea-garden.jpg` + `story-coffee-garden.jpg`.
- [x] Layout mới ở `src/components/story.tsx`: ảnh vườn trà là ảnh chính (khung viền gold như cũ), ảnh vườn cà phê là ảnh nhỏ chồng lệch ở góc dưới-phải (`-mt-16/-20 ml-auto w-[44%]`, viền `border-noir-900` + `ring-gold-500/15` + shadow), mỗi ảnh có parallax scroll riêng lệch hướng nhau để tạo độ sâu (không chỉ 1 lớp phẳng).
- [x] Copy text đổi từ chỉ nói về trà sang nói về cả 2 vườn ("hai lô đất trên hai sườn núi liền kề, mười phút đi bộ"), khớp thật với việc site có bán cả trà và phin coffee. Đổi luôn label stat "Tea estates" → "Tea and coffee plots" cho khớp.
- Verify: build/tsc sạch, cả 2 ảnh serve 200, alt text + copy mới lên đúng trong HTML SSR.

---

## 6. Motion that whispers - ĐÃ BỔ SUNG (2026-07-07)

Đã có parallax, stagger, hover microinteractions, custom easing `EASE_LUXE`, respect `prefers-reduced-motion` xuyên suốt. Cậu phản hồi là site vẫn cảm giác tĩnh và vài section phía dưới chung chung, nên bổ sung thêm:

- [x] **Cursor glow toàn site** (`src/components/cursor-glow.tsx`): quầng gold mờ theo con trỏ, dùng `mix-blend-soft-light` để hoà vào nền/ảnh như ánh sáng thật, spring theo con trỏ (không giật). Chỉ chạy khi có chuột thật (`pointer: fine`) và tắt hoàn toàn nếu `prefers-reduced-motion`. Mount global trong `layout.tsx`.
- [x] **Magnetic CTA** (`src/components/magnetic.tsx`): nút bấm chính (Hero "Explore the Collection" / "Our Story", FinalCta "Find your maison") nhích nhẹ theo hướng con trỏ khi hover, spring vật lý, tắt khi reduced motion.
- [x] **Ambient glow "thở"**: thêm keyframe `glow` (8s, opacity + scale) trong `globals.css`, áp cho glow ở Hero và FinalCta thay vì đứng yên.
- [x] **Marquee**: pause khi hover (`hover:[animation-play-state:paused]`) + từng item sáng gold khi hover riêng lẻ.
- [x] **Maisons**: icon mũi tên nhích nhẹ theo hướng chỉ (`translate-x-0.5 -translate-y-0.5`) khi hover thay vì chỉ đổi màu nền.
- [x] **Ritual**: icon mỗi bước xoay nhẹ + nhích lên khi hover step, thay vì chỉ đổi màu số thứ tự.
- [ ] Cậu tự cảm nhận trên preview thật xem cursor glow có quá rõ/quá mờ không, chỉnh lại opacity trong `cursor-glow.tsx` nếu cần (đang để `bg-gold-400/40` + `mix-blend-soft-light`).

---

## 7. Mobile được thiết kế riêng - ĐÃ SỬA (2026-07-07)

Đã có quyết định mobile thật từ trước: Navbar (modal full-screen), Maisons (đổi flex-direction, ẩn count).

Đã bổ sung, verify trực tiếp qua preview 375px + resize desktop để đảm bảo cả hai breakpoint đều đúng:

- [x] **Hero CTA**: 2 nút "Explore the Collection" / "Our Story" chuyển từ `flex-wrap` (wrap lệch, 2 nút không đều nhau) sang `flex-col` full-width-đều-nhau trên mobile, về `flex-row` cạnh nhau trên `sm:+`. Verify: cả 2 nút đo được đúng 335px width, cùng hàng dọc.
- [x] **Hero overline**: "Maison de thé · Saigon · Est. 2016" bị wrap 2 dòng ở 375px (đo height 36px). Sửa bằng 2 span responsive: mobile bỏ "Est. 2016" chỉ còn "Maison de thé · Saigon" (1 dòng, đo lại height 18px), desktop giữ nguyên câu đầy đủ.
- [x] **Collection**: đổi grid 1 cột thành carousel cuộn ngang có `snap-x` + hé lộ 24% card tiếp theo (w-76%) trên mobile, giữ grid 2/4 cột như cũ từ `sm:` lên. Verify: scrollWidth 1088 vs clientWidth 375 ở mobile (cuộn được), tự động chuyển thành `display:grid` 4 cột đều ở desktop (1280px).
- [x] **`/menu` filter bar**: category chips từ `flex-wrap` (bị vỡ 2 dòng ở 375px, đo được) đổi thành thanh cuộn ngang `snap-start` từng chip, và **sticky top-18 dưới navbar** khi cuộn (giữ filter luôn trong tầm tay trên mobile). Cả hai tự tắt về hành vi cũ (`static`, `flex-wrap`) từ `sm:` lên. Verify: sticky đo được `top:72px` khi scrollY=700, tắt đúng (`position:static`) ở desktop.
  - Lưu ý kỹ thuật: phải bỏ `<Reveal>` bọc ngoài block này vì `transform` của framer-motion trên ancestor phá `position: sticky` (đã tự đụng bug này và fix).
- [ ] Marquee: chưa đổi, giữ nguyên vì bản chất nó là dải chữ chạy ngang liên tục, không có "layout" để thiết kế lại riêng cho mobile - đánh giá là không cần.
- [ ] Cậu tự lướt qua trên điện thoại thật xem carousel Collection và sticky filter bar cảm giác có tự nhiên không, đặc biệt lúc vuốt nhanh.

---

## 8. Invisible expensive stuff - Khá tốt, còn vài món nhỏ

Đạt: `next/image` 100%, `font-display: swap`, ARIA + semantic HTML sạch, skip-to-content, favicon/apple-icon đã có qua App Router convention.

Chưa đạt:
- [x] **`src/app/robots.ts`** - tự sinh `/robots.txt`, allow `/`, disallow `/admin`, `/checkout`, `/profile`, `/login`, `/register`, `/forgot-password` (trang không cần SEO index). Verify: `fetch('/robots.txt')` trả đúng nội dung.
- [x] **`src/app/sitemap.ts`** - tự sinh `/sitemap.xml` với `/` và `/menu`. Verify: `fetch('/sitemap.xml')` trả XML đúng format.
- [x] **`src/lib/site.ts`** - thêm `SITE_URL` (đọc từ `NEXT_PUBLIC_SITE_URL`, fallback `https://thenoir.vn` khớp domain hư cấu đã dùng cho email ở footer) để robots/sitemap/metadata dùng chung.
- [x] **`metadata.twitter`** + **`metadata.openGraph.images`** + **`metadata.metadataBase`** trong `layout.tsx` - trước đó OG còn thiếu cả `images` (không chỉ thiếu Twitter card), giờ dùng `hero-poster.jpg` (1920x1080, đã verify đúng kích thước thật của file) làm ảnh chia sẻ cho cả OG và Twitter. Verify: đọc `<meta property="og:image">` / `<meta name="twitter:card">` trên trang thật, đủ cả 13 meta tag.
- [x] **Sửa lỗi thật**: `src/components/cart-drawer.tsx:84`, ảnh sản phẩm trong cart đổi `alt=""` → `alt={item.name}`.
- [ ] Đo tốc độ load thật (Lighthouse/PageSpeed) sau khi deploy - chưa đo được trong môi trường dev/preview vì Lighthouse cần production build đã host, không đo local dev server chính xác được.

Đã chạy `npm run build` production thật để chắc chắn robots.ts/sitemap.ts/metadataBase không phá build - build sạch, `/robots.txt` và `/sitemap.xml` xuất hiện đúng trong route list.

---

## Thứ tự ưu tiên đề xuất (có thể đổi sau khi cậu phân tích)

1. Mobile-specific design cho Hero/Collection/`/menu` (mục 7) - nặng nhất, ảnh hưởng nhiều nhất theo checklist.
2. Ảnh Story thay Unsplash (mục 5) - vừa phải, cần quyết định nguồn ảnh trước.
3. Sửa alt text cart-drawer (mục 8) - nhanh, 5 phút.
4. Thêm `robots.ts` + `sitemap.ts` + Twitter card (mục 8) - nhanh, lợi SEO.
5. Semantic color token cho status (mục 3) - tùy chọn, không bắt buộc vì là UI nội bộ.
6. Đổi/giữ body font (mục 2) - cần cậu quyết định trước, ảnh hưởng toàn site nếu đổi.
7. Đo hierarchy bằng mắt (mục 4) - làm song song, không cần code trước.
