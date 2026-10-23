# FitCoach – bản thiết kế mới

Thiết kế lại toàn bộ giao diện app FitCoach. Thư mục này độc lập với mã nguồn React ở `../src`: không sửa gì trong app cũ.

Demo trực tuyến: https://claude.ai/artifact/WVXDzn8LNJfC6B3EDe1XeZ (đang để riêng tư, cần bấm Share trên trang để gửi cho khách).

## Có gì trong thư mục

| Đường dẫn | Nội dung |
| --- | --- |
| `demo/index.html` | Demo bấm được, mở trực tiếp bằng trình duyệt (cần mạng để tải font Google) |
| `svg/sang/*.svg` | 15 màn + hệ thống thiết kế, giao diện sáng, kéo thả vào Figma |
| `svg/toi/*.svg` | Như trên, giao diện tối |
| `svg/tat-ca-man-sang.svg`, `svg/tat-ca-man-toi.svg` | Mọi màn xếp cạnh nhau trong một tệp |
| `png/sang`, `png/toi` | Ảnh xem nhanh độ phân giải 2x |
| `src/app.html` | Mã nguồn duy nhất của demo, sửa ở đây |
| `tools/` | Script dựng demo và xuất SVG/PNG |

## Đưa vào Figma

1. Cài sẵn hai font Google: **Be Vietnam Pro** (400–800) và **Barlow Condensed** (500–800). Figma có sẵn cả hai trên bản web.
2. Kéo các tệp trong `svg/sang/` vào canvas. Mỗi tệp thành một frame.
3. Chữ là lớp chữ thật, sửa được. Đoạn văn nhiều dòng là một lớp chữ, các dòng ngắt sẵn như trong demo.
4. Nhóm lớp được đặt tên theo khu vực (ví dụ `Thanh_đòn_hôm_nay`, `Buổi_tập_hôm_nay`, `Tab_bar`).
5. Màn dài hơn 844 px là màn cuộn; thanh trạng thái ở đầu và thanh tab ở cuối frame.

## Hướng thiết kế

- **Nền màu phấn, chữ và nút màu cao su lót sàn.** Thẻ trắng cho nội dung, thẻ đen cho thông tin quan trọng nhất của mỗi màn.
- **Bốn màu đĩa tạ thi đấu** (đỏ 25 kg, xanh dương 20 kg, vàng 15 kg, xanh lá 10 kg) mã hoá mọi chỉ số và nhóm cơ, dùng nhất quán:

| Màu | Chỉ số ngày | Nhóm cơ | Dinh dưỡng |
| --- | --- | --- | --- |
| Đỏ `#E4473A` | Calo đốt | Chân & mông | Đạm |
| Xanh dương `#2C6BEF` | Nước | Thân trên | Chất béo |
| Vàng `#F1B11A` | Phút tập | Bụng | Tinh bột |
| Xanh lá `#11A068` | Bước chân | Toàn thân | Hoàn thành |

- **Thanh đòn** là hình ảnh nhận diện: ở trang chủ mỗi đĩa là một chỉ số và đầy dần theo %, ở màn tập mỗi bài xong lắp thêm một đĩa.
- **Chữ:** Barlow Condensed cho số và nhãn in hoa (giống số dập trên đĩa tạ), Be Vietnam Pro cho tiêu đề và nội dung.

## Các màn

| # | Màn | Ghi chú |
| --- | --- | --- |
| 01 | Chào mừng | |
| 02 | Chọn mục tiêu | Thêm mục tiêu “Khỏe hơn mỗi ngày”, tính ngày dự kiến đạt cân nặng |
| 03 | Trang chủ | Thanh đòn chỉ số ngày, nước, giấc ngủ, nhịp tim, cân nặng, bữa ăn, lời nhắc HLV |
| 04 | Tập luyện | Lịch tuần, buổi hôm nay chia khởi động / bài chính / giãn cơ |
| 05 | Chi tiết bài tập | Mức tác động từng cơ, cách làm, lỗi hay gặp |
| 06 | Đang tập | Màn tối, số lần cỡ lớn, gợi ý đọc bằng giọng nói |
| 07 | Camera chỉnh dáng | Khung xương, góc khớp, điểm dáng chuẩn |
| 08 | Tổng kết buổi tập | Kỷ lục mới, hỏi mức nặng để tự điều chỉnh buổi sau |
| 09 | Bữa ăn | Calo còn lại, dòng thời gian bữa ăn, gợi ý món theo ngân sách |
| 10 | Chi tiết món | Công thức, nguyên liệu, danh sách đi chợ (mới) |
| 11 | Chụp món ăn | Khoảng calo theo khẩu phần, lời khuyên |
| 12 | Tiến độ | Cân nặng, lịch tháng, cân bằng nhóm cơ, số đo, kỷ lục |
| 13 | Sức khỏe | Mới: điểm sẵn sàng, giấc ngủ, nhịp tim, kết nối thiết bị |
| 14 | Thử thách | Mới: thử thách bạn bè, bảng xếp hạng, huy hiệu |
| 15 | Hồ sơ | Cài đặt, gói Pro, chuyển sáng/tối |

Số liệu trong demo là dữ liệu mẫu của một người dùng giả định (Minh Anh, 61,4 kg, mục tiêu giảm cân, tập ở nhà).

## Sửa và xuất lại

```bash
cd redesign/tools
npm install            # lần đầu: puppeteer-core
node build.mjs         # gộp icon Lucide vào src/app.html -> demo/
node export-svg.mjs    # xuất lại toàn bộ svg/ và png/ (dùng Chrome cài trên máy)
```

`build.mjs` lấy icon từ `../node_modules/lucide-react`, nên cần chạy `npm install` ở thư mục gốc dự án trước. Nếu Chrome không nằm ở đường dẫn mặc định, đặt biến môi trường `CHROME`.

`node check-svg.mjs <thư mục> <tệp.svg>` mở một SVG đã xuất như ảnh độc lập để so với PNG.
