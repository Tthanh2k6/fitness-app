# Huấn luyện AI nhận diện món ăn

App nhận diện món ngay trên điện thoại, không gọi API bên ngoài:

```
Ảnh → MobileNetV3 (MediaPipe ImageEmbedder) → vector 1280 chiều → lớp phân loại do nhóm tự huấn luyện → tên món
     → bảng dinh dưỡng (src/ai/food/dishes.ts) → calo theo khẩu phần → lời khuyên theo mục tiêu
```

Thư mục này tạo ra file `public/models/food-head.json`. Chưa có file này thì màn Chụp món ăn cho người dùng chọn món bằng tay.

## Dữ liệu

Bộ ảnh **30VNFoods** (Do và cộng sự, IEEE COMNETSAT 2021), 30 món, 25.136 ảnh, giấy phép **CC BY-NC-SA 4.0**:
được dùng để huấn luyện cho app thi phi lợi nhuận, phải ghi nguồn, không phát tán lại ảnh, không dùng thương mại.
App dùng 28 món (bỏ Bánh đúc vì nhãn nhiễu, Bánh pía vì thiếu số liệu dinh dưỡng). Chi tiết: `docs/food-research.md`.

## Các bước

```bash
cd training/food
python -m venv .venv
.venv\Scripts\activate            # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

# 1. Tải model trích đặc trưng (10,4 MB) — đúng model app dùng trong src/ai/assets.ts
curl -L -o models/mobilenet_v3_large.tflite https://storage.googleapis.com/mediapipe-models/image_embedder/mobilenet_v3_large/float32/1/mobilenet_v3_large.tflite

# 2. Tải và giải nén bộ ảnh (~4,5 GB) vào D:/datasets/30VNFoods
python download_30vnfoods.py --dest D:/datasets/30VNFoods

# 3. Huấn luyện (mặc định 400 ảnh/món để huấn luyện, 100 ảnh/món để chấm điểm)
python train_head.py --data D:/datasets/30VNFoods --model models/mobilenet_v3_large.tflite
```

Bước 3 in ra độ chính xác top-1 và top-3 trên ảnh model chưa thấy khi huấn luyện, và ghi `report.json`
(độ chính xác từng món, các cặp món hay nhầm). Đây là số liệu thật để đưa vào bài thuyết trình.

## Kết quả lần huấn luyện 16/10/2026

400 ảnh/món (thêm bản lật ngang, tổng 22.198 vector) để học, chấm điểm trên 2.800 ảnh của tập test mà model chưa thấy:

- **Đúng ngay món đầu tiên (top-1): 75,9%**
- **Món đúng nằm trong 3 gợi ý (top-3): 91,5%** — app luôn hiện 3 gợi ý để người dùng chọn lại
- Món nhận đúng nhiều nhất: bún đậu mắm tôm 97%, bánh mì 92%, cá kho tộ 90%, bánh giò 89%, bánh tráng nướng 88%
- Món nhận kém nhất: bánh canh 47%, hủ tiếu 55%, bún bò Huế 57%, phở 59%, bánh cuốn 63%
- Cặp hay nhầm: phở → bún bò Huế, bánh canh → hủ tiếu, bún riêu → bún bò Huế, bánh chưng ↔ bánh tét, hủ tiếu → phở (đều là món giống nhau ngoài đời)

Lần chạy thử trước đó (chọn ảnh hơi khác) ra 76,3% / 91,1%, nên con số ổn định quanh 76% / 91%.

Chi tiết từng món: `report.json`. Vector đặc trưng đã lưu ở `cache/`: chỉ đổi tham số thì chạy lại trong vài giây, thêm hay bớt ảnh thì script tự trích lại.
