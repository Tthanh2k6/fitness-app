# GIAO THỨC LÀM VIỆC & ĐỒNG BỘ TÀI LIỆU CHO AI AGENT — FITCOACH (`fitness-app`)

> **Tệp đi kèm bắt buộc:** `CODEBASE.md` (Tham chiếu kiến trúc & mã nguồn toàn diện), `README.md`, và `docs/food-research.md`.
> **Mục tiêu tối thượng:** Đảm bảo mọi phiên làm việc của AI Agent hoặc nhà phát triển trên dự án **FitCoach** đều hiểu đúng kiến trúc tức thì, sửa mã an toàn không phá vỡ bất biến kỹ thuật, và giữ cho tài liệu luôn khớp **100%** với mã nguồn thực tế.

---

## 1. Mục đích & Nguyên tắc Hoạt động

Dự án **FitCoach (`fitness-app`)** là ứng dụng huấn luyện thể hình & dinh dưỡng món Việt chạy hoàn toàn phía trình duyệt (Zero-Backend, Offline-First), kết hợp lập lịch tự điều chỉnh theo RPE, chấm dáng thời gian thực qua Camera AI (`PoseLandmarker` 33 khớp), nhận diện 28 món ăn truyền thống Việt Nam (`MobileNetV3` + `LinearHead`), cùng hai pipeline ngoại tuyến bằng Python (`training/food/`) và Blender 3D (`tools/human/`).

Ở bất kỳ phiên trò chuyện mới nào, AI Agent **PHẢI** tuân thủ nguyên tắc phối hợp tài liệu sau:
1. **Đọc `agent.md` đầu tiên** để nắm quy tắc bảo vệ dự án, bảng định tuyến nhanh và quy trình kiểm chứng.
2. **Tra cứu `CODEBASE.md` theo đúng mục liên quan** trước khi mở hoặc chỉnh sửa tệp mã nguồn — tuyệt đối không đoán mò cấu trúc `localStorage`, ngưỡng góc khớp hay công thức tính calo/lịch tập.
3. **Không bao giờ ghi đè hoặc xóa `README.md` và `docs/food-research.md`** trừ khi người dùng yêu cầu trực tiếp.
4. **Đồng bộ ngược lại vào `CODEBASE.md` (và `agent.md` nếu cần)** ngay sau khi hoàn tất bất kỳ thay đổi mã nguồn nào trong cùng phiên làm việc.

---

## 2. Quy trình BẮT BUỘC Trước Khi Sửa Code (Read-First Protocol)

### 2.1. Ba Bước Nắm Ngữ Cảnh Nhanh

1. **Bước 1 — Định vị phân hệ:** Xem Mục `2` (*Kiến trúc Tổng thể & Luồng Dữ liệu*) và Mục `3` (*Bản đồ Toàn bộ Tệp nguồn*) trong `CODEBASE.md` để xác định luồng dữ liệu đi từ màn hình nào qua Context/Logic nào xuống `localStorage`.
2. **Bước 2 — Tra cứu chi tiết thuật toán & bất biến:** Đọc tiểu mục tương ứng trong Mục `4`, Mục `5` và Mục `8.1` của `CODEBASE.md` theo **Bảng Định tuyến Nhanh** dưới đây.
3. **Bước 3 — Đọc toàn bộ tệp nguồn & tệp test đích:** Dùng công cụ đọc tệp xem trực tiếp toàn bộ tệp mã nguồn sắp sửa và tệp `*.test.ts` đi kèm trước khi thực hiện chỉnh sửa.

### 2.2. Bảng Định tuyến Nhanh (Quick Routing Table) Thiết kế Riêng cho `fitness-app`

| Khi cần làm việc với mảng chức năng... | Đọc mục nào trong `CODEBASE.md` | Mở những tệp nguồn & kiểm thử nào |
| :--- | :--- | :--- |
| **1. Hồ sơ người tập, Onboarding 7 bước, công thức TDEE / Macro / BMI / ETA** | Mục `2.4` (Luồng 1), `4.2.1`, `4.8.2`, `5.1` | `src/profile.ts`, `src/components/ProfileProvider.tsx`, `src/pages/Setup.tsx`, `src/pages/Profile.tsx`, `src/logic/logic.test.ts` |
| **2. Thuật toán sinh lịch tập tuần, chia buổi, kê đơn hiệp/lần, đổi bài tương đương** | Mục `4.4.1`, `4.4.2`, `8.1` (Mục 1, 8) | `src/logic/plan.ts`, `src/logic/useToday.ts`, `src/data/exercises.ts`, `src/pages/Train.tsx`, `src/logic/logic.test.ts` |
| **3. Tự điều chỉnh độ nặng theo cảm nhận (`RPE`) & màn Tổng kết buổi tập** | Mục `2.4` (Luồng 2), `4.4.2`, `4.8.4`, `8.1` (Mục 3) | `src/logic/adjust.ts`, `src/logic/useToday.ts`, `src/pages/Done.tsx`, `src/logic/metrics.test.ts` |
| **4. Thư viện 120 bài tập, nhóm cơ, bài khởi động/giãn cơ & video YouTube** | Mục `4.3`, `4.7.2`, `4.7.4`, `8.1` (Mục 1) | `src/data/exercises.ts`, `src/data/videos.ts`, `src/data/muscles.ts`, `src/data/stretches.ts`, `src/components/VideoPlayer.tsx`, `src/pages/Exercise.tsx`, `src/pages/Stretch.tsx` |
| **5. Màn hình dẫn tập trực tiếp (`Workout`), đếm ngược nghỉ & giọng đọc tiếng Việt** | Mục `2.4` (Luồng 2), `4.1.4`, `4.5.1`, `4.8.4` | `src/pages/Workout.tsx`, `src/lib/useCountdown.ts`, `src/ai/speech.ts`, `src/store.ts`, `src/components/StoreProvider.tsx` |
| **6. Camera AI chấm dáng, đếm lần lặp (`squat`, `pushup`, `plank`, `lunge`) & vẽ khung xương** | Mục `2.4` (Luồng 3), `4.5`, `4.8.5`, `8.1` (Mục 4, 10, 12) | `src/ai/pose/geometry.ts`, `src/ai/pose/body.ts`, `src/ai/pose/exercises.ts`, `src/ai/pose/coach.ts`, `src/ai/pose/draw.ts`, `src/ai/pose/landmarker.ts`, `src/pages/Coach.tsx`, `src/pages/CoachPicker.tsx`, `src/ai/pose/coach.test.ts` |
| **7. Camera AI nhận diện 28 món ăn Việt & huấn luyện lại `food-head.json`** | Mục `2.4` (Luồng 4), `4.6`, `4.8.6`, `4.9`, `5.2`, `8.1` (Mục 2), `8.2` | `src/ai/food/dishes.ts`, `src/ai/food/head.ts`, `src/ai/food/classifier.ts`, `src/ai/food/advice.ts`, `src/pages/Scan.tsx`, `src/ai/food/food.test.ts`, `training/food/train_head.py`, `docs/food-research.md` |
| **8. Nhật ký 4 bữa ăn, danh mục 50 món Việt, gợi ý theo ngân sách, công thức nấu & đi chợ** | Mục `4.3` (`recipes`), `4.4.4`, `4.7.3`, `4.8.6` | `src/logic/meals.ts`, `src/data/recipes.ts`, `src/components/DishArt.tsx`, `src/pages/Meals.tsx`, `src/pages/Dish.tsx`, `src/logic/logic.test.ts` |
| **9. Thanh đòn chỉ số ngày (`Barbell`), Điểm sẵn sàng (`Readiness`), Giấc ngủ, Nhịp tim, Nước** | Mục `2.4` (Luồng 5), `4.4.3`, `4.7.1`, `4.8.3`, `4.8.7` | `src/logic/daily.ts`, `src/logic/session.ts`, `src/logic/health.ts`, `src/components/Barbell.tsx`, `src/pages/Home.tsx`, `src/pages/Health.tsx`, `src/logic/metrics.test.ts` |
| **10. Biểu đồ cân nặng, lịch tháng, cân bằng nhóm cơ, số đo cơ thể & Kỷ lục cá nhân (PR)** | Mục `4.4.4`, `4.8.7` | `src/logic/progress.ts`, `src/logic/records.ts`, `src/pages/Progress.tsx`, `src/logic/metrics.test.ts` |
| **11. Thử thách cộng đồng, bảng xếp hạng & 6 huy hiệu đĩa tạ** | Mục `2.4` (Luồng 5), `4.4.4`, `4.8.7` | `src/logic/challenges.ts`, `src/pages/Challenges.tsx`, `src/logic/challenges.test.ts` |
| **12. Hệ thống thiết kế CSS *"Phấn, cao su và đĩa tạ"*, chế độ Sáng/Tối & điều hướng** | Mục `4.1.1`, `4.7.5`, `6.1`, `6.2`, `8.1` (Mục 5) | `src/index.css`, `src/theme.ts`, `index.html`, `src/App.tsx`, `src/components/BottomNav.tsx`, `src/components/Sheet.tsx`, `src/components/ui.tsx` |
| **13. Hình minh họa động tác 3D WebP / người que SVG & pipeline Blender** | Mục `4.7.2`, `4.10`, `7.3.C`, `8.1` (Mục 9) | `src/components/Pose.tsx`, `tools/human/build_human.py`, `tools/human/poses.py`, `tools/human/render_poses.py`, `tools/human/export_webp.py` |
| **14. Dữ liệu mẫu thuyết trình (`Demo Mode`) & Bản mẫu thiết kế xuất Figma** | Mục `2.4` (Luồng 6), `4.11`, `7.3.D` | `src/logic/demo.ts`, `redesign/src/app.html`, `redesign/tools/build.mjs`, `redesign/tools/export-svg.mjs` |

---

## 3. Các Bất biến Kỹ thuật & Quy tắc An toàn Riêng của Dự án (Project-Specific Guardrails)

Khi thêm mới hoặc chỉnh sửa bất kỳ đoạn mã nào trong `fitness-app`, bạn **BẮT BUỘC** tuân thủ nghiêm ngặt 12 chốt chặn an toàn sau:

1. **Giữ đối xứng 1:1 giữa `LIBRARY` và `VIDEOS`:** Thêm bài tập mới vào `src/data/exercises.ts` thì bắt buộc phải thêm đúng mã bài đó vào `src/data/videos.ts` (và khi xóa/đổi tên `id` phải cập nhật cả hai nơi + kiểm tra `BY_ID` trong `Pose.tsx`).
2. **Bảo toàn đồng bộ 3 chiều của AI Món ăn Việt:**
   - Mọi nhãn lớp trong `public/models/food-head.json` phải có bản ghi `datasetClass` khớp chính xác trong `src/ai/food/dishes.ts`.
   - Không bao giờ tắt `l2Normalize: true` trong `src/ai/food/classifier.ts` hoặc `l2_normalize=True` trong `training/food/train_head.py`; hai phía Python và Trình duyệt phải dùng cùng một tệp `mobilenet_v3_large.tflite` (`float32/1`).
3. **Không phá vỡ bất biến thời gian `< date` của `adjustBefore`:** Trong `src/logic/adjust.ts`, chỉ cộng dồn `rpe` của các ngày **nhỏ hơn hẳn** `date` (`if (d >= date) break`). Không bao giờ lấy `rpe` của ngày `date` để điều chỉnh ngược lại chính buổi tập của ngày `date`.
4. **Quy tắc lật gương Camera Selfie & Tách nhịp Render 60fps / 8fps trong `Coach.tsx`:**
   - Phép lật gương `scaleX(-1)` khi dùng camera trước (`facing === 'user'`) phải bọc ở thẻ `<div>` cha chứa chung cả `<video>` và `<canvas>`. Tuyệt đối không lật tọa độ `x` trong `toBody()` để tránh làm sai hướng `facing` của bàn chân và mũi.
   - Giữ nguyên cơ chế vẽ `drawPose` trực tiếp trên Canvas trong `requestAnimationFrame`, còn `setSnap` / `setAngles` cập nhật HUD React phải được điều tiết cách quãng (`~120ms`) để không gây giật khung hình trên điện thoại.
5. **Xử lý ngày giờ theo múi giờ địa phương (`isoDate` & `parseIso`):** Luôn dùng `isoDate()`, `parseIso()`, `shiftDate()`, `mondayOf()` từ `src/store.ts`. Cấm dùng `toISOString().slice(0, 10)` (lệch ngày theo giờ UTC) hoặc `new Date('YYYY-MM-DD')` không kèm giờ trưa `12:00`.
6. **Cập nhật chữ ký cache lịch tuần khi thêm thuộc tính lập lịch:** Nếu thêm trường mới vào `Profile` làm thay đổi kết quả của `buildWeekPlan(profile)`, bắt buộc đưa trường đó vào `planSignature(p)` trong `src/logic/useToday.ts` để bộ đệm `fitcoach.plan.v2` biết tự sinh lại lịch.
7. **Tuân thủ cấu trúc `@layer` của Tailwind CSS v4 trong `src/index.css`:** Các quy tắc reset thẻ HTML thuần (`button`, `input`, `h1..h3`, `ul`) phải nằm trong `@layer base { ... }`, còn hệ thống class thiết kế của FitCoach đặt ngoài `@layer`. Luôn kiểm tra hiển thị ở **cả chế độ Sáng lẫn chế độ Tối** (`[data-theme="dark"]`) và giữ nguyên nền tối `--cam` cho các màn tập/camera.
8. **Tuân thủ TypeScript nghiêm ngặt (`erasableSyntaxOnly` & `verbatimModuleSyntax`):** Luôn dùng `import type` cho kiểu dữ liệu, không dùng `enum` hay parameter properties trong constructor, không để biến/tham số thừa (`noUnusedLocals`, `noUnusedParameters`).
9. **Giải phóng phần cứng Camera & Giọng đọc khi thoát trang:** Mọi `useEffect` khởi tạo `getUserMedia`, `requestAnimationFrame`, `setInterval` hoặc `speechSynthesis` phải thu hồi triệt để (`track.stop()`, `cancelAnimationFrame`, `clearInterval`, `speechSynthesis.cancel()`) khi unmount và có nhánh fallback êm ái khi người dùng từ chối cấp quyền camera hoặc mất mạng.
10. **Tách biệt rõ `src/` với `_backup/` và `redesign/`:**
    - **CẤM SỬA ĐỔI** thư mục `_backup/` (bản lưu lịch sử trước redesign).
    - Thư mục `redesign/` là bản mẫu độc lập dùng xuất SVG sang Figma; sửa `src/` không tự động cập nhật `redesign/` và ngược lại.
11. **Bảo vệ tương thích ngược `localStorage`:** Mọi thao tác `JSON.parse` / `localStorage.getItem` phải nằm trong `try / catch` và hợp nhất với giá trị mặc định (`DEFAULT_PROFILE`, `EMPTY_LOGS`) để dữ liệu cũ của người dùng không bao giờ gây màn hình trắng khi nâng cấp.
12. **Mã hóa UTF-8 cho tiếng Việt trên Windows PowerShell:** Mọi tệp nguồn lưu chuẩn `UTF-8` không BOM. Khi chạy Python xử lý văn bản tiếng Việt trên Windows PowerShell, luôn truyền cờ `python -X utf8 ...` để không vướng lỗi `UnicodeEncodeError` (`cp1252`).

---

## 4. Quy trình BẮT BUỘC Cập nhật Tài liệu Sau Mỗi Lần Sửa Code (Post-Edit Sync Protocol)

### 4.1. Quy tắc Đồng bộ Bắt buộc

> **QUY TẮC SẮT:** Mọi thay đổi đối với mã nguồn, cấu hình, dữ liệu, mô hình AI hoặc công cụ của dự án đều **PHẢI** đi kèm việc cập nhật `CODEBASE.md` (và `agent.md` nếu thay đổi ảnh hưởng đến bảng định tuyến, bất biến kỹ thuật hoặc lệnh kiểm tra) ngay trong **cùng một phiên làm việc**, trước khi báo cáo hoàn thành cho người dùng. Không bao giờ để tài liệu lệch khỏi code dù chỉ một hàm hay một hằng số!

### 4.2. Ma trận Đồng bộ Tài liệu (Documentation Sync Matrix)

| Loại thay đổi bạn vừa thực hiện | Các mục BẮT BUỘC cập nhật trong `CODEBASE.md` | Các mục cần cập nhật trong `agent.md` |
| :--- | :--- | :--- |
| **Thêm / xóa / đổi tên / tách tệp hoặc thư mục** | • Mục `3.1` (*Cây thư mục trực quan*)<br>• Mục `3.2` (*Bảng kê khai tệp nguồn*: đường dẫn, số dòng, vai trò, `exports`)<br>• Mục `4.x` tương ứng<br>• Mục `9` (*Changelog*) | • Mục `2.2` (*Bảng Định tuyến Nhanh*) nếu tệp thuộc luồng tra cứu chính |
| **Thêm / sửa hàm, thuật toán, ngưỡng chấm dáng, công thức tính toán hoặc hằng số** | • Mục `2.4` (nếu đổi luồng nghiệp vụ)<br>• Mục `4.x` (chữ ký hàm, tham số, công thức, ngưỡng số học chính xác)<br>• Mục `9` (*Changelog*) | • Mục `3` (*Guardrails*) nếu xuất hiện quy tắc bất biến mới |
| **Thay đổi cấu trúc `Profile`, `Logs`, khóa `localStorage`, `food-head.json` hoặc URL ngoài** | • Mục `4.2` (logic đọc/lưu & migration)<br>• Mục `5.1` / `5.2` / `5.3` (*Data Schemas, Storage & Protocols*)<br>• Mục `9` (*Changelog*) | • Mục `3` (*Guardrails*) nếu có quy tắc tương thích ngược hoặc chữ ký cache mới |
| **Thêm / sửa route, màn hình, Bottom Sheet, màu sắc hoặc kiểu chữ CSS** | • Mục `3.2.G` (nếu thêm/sửa trang)<br>• Mục `4.7` / `4.8` (*Components & Pages*)<br>• Mục `6.1` (*Sơ đồ điều hướng Mermaid*) & `6.2` (*Design System*)<br>• Mục `9` (*Changelog*) | • Mục `2.2` (*Bảng Định tuyến Nhanh*) nếu thêm mảng màn hình mới |
| **Thêm / nâng cấp thư viện (`package.json`, `requirements.txt`), đổi script build, cổng mạng** | • Mục `1.2` (*Bảng Tech Stack + phiên bản*)<br>• Mục `7.1` / `7.2` / `7.3` (*Setup & Operations*)<br>• Mục `9` (*Changelog*) | • Mục `5.1` (*Lệnh Kiểm tra & Xác minh Nhanh*) |
| **Phát hiện giới hạn mới, edge case, lưu ý bảo mật/giấy phép hoặc trả xong nợ kỹ thuật** | • Mục `8.1` / `8.2` / `8.3` (*Invariants, Security & Gotchas* — cập nhật hoặc gỡ mục nợ kỹ thuật đã xử lý xong)<br>• Mục `9` (*Changelog*) | • Mục `3` (*Guardrails*) & Mục `5.2` (*Checklist*) |

### 4.3. Quy chuẩn Viết Bổ sung Tài liệu

1. **Giữ nguyên chiều sâu kỹ thuật bằng tiếng Việt rõ ràng:** Giải thích đến tận công thức, ngưỡng hằng số và lý do thiết kế; giữ nguyên tên biến, tên hàm, tên kiểu, đường dẫn tệp, câu lệnh CLI và khóa lưu trữ trong dấu backtick `` `...` ``.
2. **Không xóa nhầm thông tin cũ còn hiệu lực:** Chỉ dùng công cụ chỉnh sửa từng vùng (`edit_file`) vào đúng các mục bị ảnh hưởng thay vì viết lại tóm tắt sơ sài làm mất chi tiết của các module khác.
3. **An toàn cú pháp Markdown & Mermaid:**
   - Trong sơ đồ `mermaid`, **luôn bọc nhãn node có dấu ngoặc tròn, ngoặc vuông, dấu hai chấm hoặc ký tự đặc biệt trong dấu ngoặc kép** (ví dụ: `NodeA["Màn hình Quét (Scan.tsx)"]`), và **tuyệt đối không dùng thẻ HTML** (`<br/>`, `<b>`) bên trong Mermaid.
   - Nếu viết ký hiệu tiền tệ `$` trong văn bản xuôi ngoài dấu backtick/khối code, luôn escape thành `\$` để không kích hoạt nhầm công thức toán LaTeX.
4. **Ghi nhận lịch sử:** Luôn thêm một dòng mới vào cuối bảng ở **Mục 9 — Nhật ký Cập nhật Tài liệu (`Documentation Changelog`)** trong `CODEBASE.md` ghi rõ ngày `YYYY-MM-DD`, phạm vi tệp vừa sửa và tóm tắt nội dung.

---

## 5. Lệnh Kiểm tra & Xác minh Nhanh (Verification Commands) & Checklist Hoàn tất

### 5.1. Bộ Lệnh Xác minh Bắt buộc sau khi Sửa Mã Nguồn

Chạy tại thư mục gốc `d:\Project\fitness-app` trên PowerShell:

```powershell
# 1. Kiểm tra kiểu tĩnh TypeScript trên toàn bộ cấu hình app & node (phải đạt 0 lỗi)
npx tsc -b

# 2. Chạy toàn bộ bộ kiểm thử đơn vị của mã nguồn chính trong src/ (tất cả tests phải PASS)
npx vitest run src

# 3. Kiểm tra quy tắc ESLint trên src/ (0 error; lưu ý 6 warning react-refresh hiện hữu ở DishArt, Pose, ui)
npx eslint src

# 4. Kiểm tra đóng gói sản phẩm thực tế (bao gồm prebuild chép WASM + tsc -b + vite build)
npm run build

# 5. Rà soát danh sách tệp thay đổi trên Git để chắc chắn không chạm nhầm _backup/ hay tệp ngoài phạm vi
git status --short
```

*(Lưu ý: Nếu trong máy đang có thư mục tạm `.claude/worktrees/`, việc chỉ định rõ `npx vitest run src` và `npx eslint src` giúp tránh quét trùng vào cây thư mục worktree tạm đó).*

### 5.2. Checklist Hoàn tất Trước Khi Trả lời Người dùng

Trước khi kết thúc phiên làm việc và gửi báo cáo cho người dùng, hãy tự kiểm tra đủ **8 mục** sau:

- [ ] **1. Đọc trước khi sửa:** Đã đối chiếu mục tương ứng trong `CODEBASE.md` và đọc kỹ toàn bộ tệp nguồn liên quan trước khi chỉnh sửa.
- [ ] **2. Bảo toàn bất biến:** Không vi phạm bất kỳ chốt chặn nào trong Mục `3` (đồng bộ `LIBRARY`↔`VIDEOS`, `DISHES`↔`food-head.json`↔`l2Normalize`, điều kiện `< date` của `adjustBefore`, container `scaleX(-1)` của `Coach.tsx`, ngày giờ địa phương `isoDate`, phân lớp `@layer base` trong `index.css`).
- [ ] **3. Kiểm tra kiểu & Đóng gói:** `npx tsc -b` và `npm run build` chạy thành công với mã thoát `0`.
- [ ] **4. Kiểm thử đơn vị:** `npx vitest run src` vượt qua 100% bài test (và đã viết bổ sung bài test mới nếu thêm logic nghiệp vụ, thuật toán chấm dáng hoặc tư vấn bữa ăn mới).
- [ ] **5. Kiểm tra Linter:** `npx eslint src` không phát sinh bất kỳ lỗi (`error`) nào mới.
- [ ] **6. Bảo toàn tệp lịch sử:** `git status --short` xác nhận không sửa đổi nhầm `_backup/` hoặc các tệp ngoài yêu cầu.
- [ ] **7. Đồng bộ tài liệu:** Đã cập nhật đầy đủ các mục liên quan trong `CODEBASE.md` (kèm dòng mới ở Mục `9` *Documentation Changelog*) và `agent.md` theo đúng **Ma trận Đồng bộ Tài liệu**.
- [ ] **8. Kiểm tra định dạng tài liệu:** Mọi sơ đồ Mermaid bọc ngoặc kép nhãn có ký tự đặc biệt, không chứa thẻ HTML, và không có ký tự `$` tiền tệ trần gây lỗi hiển thị Markdown.
