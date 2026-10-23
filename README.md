# FitCoach

Web app hỗ trợ tự tập luyện: lịch tập theo mục tiêu và thời gian rảnh, camera chỉnh dáng, theo dõi tiến độ và sức khỏe, gợi ý ăn uống theo ngân sách, chụp món ăn để biết calo.

React 19 + Vite + TypeScript + Tailwind CSS 4. Giao diện theo bản thiết kế "Phấn, cao su và đĩa tạ" trong `redesign/` (sáng và tối).

## Chạy

```bash
npm install
npm run dev      # http://localhost:5173, điện thoại cùng wifi dùng địa chỉ Network
npm run build
npm test         # kiểm thử chấm động tác, lịch tập, tiến độ, sức khỏe, dinh dưỡng, thử thách
```

## Cấu trúc

| Thư mục / file | Nội dung |
| --- | --- |
| `src/pages/` | Các màn hình, mỗi file một route (xem `src/App.tsx`) |
| `src/components/` | Thành phần dùng chung: khung trang, thanh điều hướng, bảng chọn, thanh đòn (`Barbell`), ảnh minh hoạ động tác (`Pose`, dự phòng bằng hình người que), hình món ăn (`DishArt`), video hướng dẫn |
| `src/index.css` | Màu (sáng/tối), font và các lớp giao diện chung, chuyển từ `redesign/src/app.html` |
| `src/data/` | 120 bài tập, video YouTube cho từng bài, khởi động / giãn cơ, màu nhóm cơ, công thức nấu 12 món |
| `src/logic/` | Sinh lịch tập, tự điều chỉnh độ nặng theo cảm nhận (`adjust.ts`), chỉ số trong ngày (`daily.ts`), điểm sẵn sàng (`health.ts`), kỷ lục (`records.ts`), gợi ý món (`meals.ts`), thử thách và huy hiệu (`challenges.ts`), dữ liệu mẫu để trình diễn (`demo.ts`) |
| `src/profile.ts`, `src/store.ts` | Hồ sơ và nhật ký (tập, cân nặng, số đo, bữa ăn, nước, bước chân, giấc ngủ, nhịp tim, thử thách), lưu trên máy (localStorage) |
| `src/theme.ts` | Giao diện sáng / tối / theo hệ thống |
| `src/ai/pose/` | AI chỉnh dáng: MediaPipe Pose, tính góc khớp, đếm lần, bắt lỗi, khung tư thế chuẩn |
| `src/ai/food/` | AI nhận diện món: MobileNetV3 + lớp phân loại tự huấn luyện, bảng dinh dưỡng, lời khuyên |
| `training/food/` | Script tải dữ liệu và huấn luyện lớp phân loại món ăn |
| `tools/human/`, `public/poses/` | Người mẫu 3D (MakeHuman, CC0) đặt vào từng tư thế và render thành ảnh minh hoạ động tác, xem `tools/human/README.md` |
| `redesign/` | Bản thiết kế: demo HTML, SVG cho Figma, ảnh PNG từng màn |
| `docs/food-research.md` | Bộ dữ liệu, giấy phép, nguồn số liệu dinh dưỡng |

## Màn hình

| Route | Màn |
| --- | --- |
| `/welcome` | Chào mừng |
| `/auth` | Đăng ký / đăng nhập (chưa có máy chủ, tài khoản lưu trên máy) |
| `/setup` | 7 bước: hồ sơ, mục tiêu + cân nặng mong muốn, vùng tập, trình độ, thời gian, nơi tập, tiền ăn (`?step=N&from=profile` để sửa từng bước) |
| `/home` | Trang chủ: thanh đòn chỉ số ngày (calo đốt, bước, phút tập, nước), buổi tập hôm nay, giấc ngủ, nhịp tim, cân nặng, bữa ăn, lời nhắc HLV |
| `/train` | Tập luyện: Hôm nay / Lịch tuần / Thư viện (`?tab=today`, `week`, `library`) |
| `/exercise/:id` | Chi tiết bài tập, video, cơ tác động, bài thay thế |
| `/workout` | Đang tập: đếm lần theo nhịp có giọng đọc, đếm giờ, nghỉ giữa hiệp (`?ex=<id>` để tập một bài) |
| `/stretch` | Khởi động / giãn cơ có đếm giờ từng động tác |
| `/coach`, `/coach/:id` | Chọn bài và camera chỉnh dáng: góc khớp, điểm dáng chuẩn |
| `/done` | Tổng kết buổi tập: kỷ lục mới, cảm nhận (tự điều chỉnh buổi sau), gợi ý bữa ăn |
| `/meals` | Bữa ăn: calo còn lại, đạm / tinh bột / chất béo, tiền đã chi, dòng thời gian bữa ăn, gợi ý món, nước, danh sách đi chợ |
| `/dish/:id` | Chi tiết món: công thức, nguyên liệu, thêm vào danh sách đi chợ |
| `/scan` | Chụp món ăn |
| `/progress` | Tiến độ: cân nặng, lịch tháng, nhóm cơ trong tuần, số đo, kỷ lục |
| `/health` | Sức khỏe: điểm sẵn sàng, giấc ngủ, nhịp tim nghỉ, nước, cảm nhận |
| `/challenges` | Thử thách và huy hiệu |
| `/profile` | Hồ sơ, cài đặt, giao diện sáng/tối, dữ liệu mẫu để trình diễn |

Bước chân, giấc ngủ và nhịp tim nhập tay (ứng dụng web chưa đọc được cảm biến điện thoại). Camera chỉ chạy trên `localhost` hoặc https. AI chạy hoàn toàn trên máy người dùng, không gửi ảnh đi đâu.

Bản đồ cơ ở bước chọn vùng tập dùng thư viện [react-body-highlighter](https://github.com/giavinh79/react-body-highlighter) (MIT). Mã giao diện trước khi thiết kế lại được lưu ở `_backup/`.
