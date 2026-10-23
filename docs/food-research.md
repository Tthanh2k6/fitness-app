# Nghiên cứu dữ liệu nhận diện món ăn Việt + bảng dinh dưỡng

> Cập nhật: 16/10/2026. Phạm vi: chọn bộ ảnh để **tự huấn luyện** bộ phân loại chạy trên máy (đầu tuyến tính/MLP trên embedding của MediaPipe ImageEmbedder, MobileNetV3). Ứng dụng **không** gọi Gemini/OpenAI/LLM lúc chạy.
> Quy trình: ảnh → embedding (MediaPipe) → đầu phân loại → tên món + khẩu phần S/M/L → tra bảng → kcal.
> Ràng buộc: tải được **không cần đăng nhập** (không Kaggle, không form xin phép). Không tải bộ dữ liệu nào trong lúc khảo sát; chỉ gọi API metadata và HEAD/GET trang để kiểm link.

---

## 1. Kết luận nhanh

| Hạng mục | Kết luận |
|---|---|
| **Bộ dữ liệu chính** | **30VNFoods** (Do và cộng sự, IEEE COMNETSAT 2021): 30 món, 25.136 ảnh. Tải qua **bản sao trên Hugging Face `vuongnhathien/30VNFoods`**: công khai, không gated, có ghi license `cc-by-nc-sa-4.0`. |
| Link tải trực tiếp | `https://huggingface.co/datasets/vuongnhathien/30VNFoods/resolve/main/train.zip` (3.124.934.599 B ≈ **3,12 GB**)<br>`.../resolve/main/validation.zip` (441.360.867 B ≈ 0,44 GB)<br>`.../resolve/main/test.zip` (910.361.414 B ≈ 0,91 GB)<br>**Tổng ≈ 4,48 GB.** Đã HEAD cả 3 link: trả 302 về CDN với `user_id=public`, tức tải được không cần token. |
| Cách tải gọn hơn (chỉ lấy lớp cần) | Bản sao `nguyenhuann/vnfood-images` để mỗi ảnh thành file riêng trong 30 thư mục `snake_case`, tổng 4,50 GB (đã cộng size từng file qua API), cho phép tải từng lớp (xem mục 3.3). Bản này **không ghi license**, nên vẫn tuân theo license gốc của 30VNFoods. |
| **Bộ phụ (tuỳ chọn)** | **Food-101** (`ethz/food101` trên HF, không gated): chỉ dùng 2 lớp `fried_rice` → cơm chiên, `spring_rolls` → chả giò (mỗi lớp 1.000 ảnh) để vá món còn thiếu. Điều khoản là “scientific fair use”, nên chỉ dùng cho bản demo/thi. Cách tốt hơn là **tự chụp 50–150 ảnh/món** cho các món còn thiếu. |
| License | CC BY-NC-SA 4.0. **Huấn luyện và dùng trong app thi phi thương mại của sinh viên là được**, kèm điều kiện (mục 4). **Không** dùng cho sản phẩm thương mại. |
| Danh sách món khuyến nghị | **28 lớp** = 30 lớp của 30VNFoods, bỏ `Banh duc` (nhiễu, chính tác giả khuyên bỏ) và `Banh pia` (đồ bánh ngọt, ít ảnh nhất, số liệu dinh dưỡng không nhất quán). Xem mục 5. |
| Độ tin cậy số dinh dưỡng | Trung bình. Khẩu phần “vừa” của 22/28 món lấy thẳng từ một bảng tổng hợp có đủ P/C/F (tổng năng lượng khớp 4-4-9). Nguồn gốc bảng chưa truy được tới Viện Dinh dưỡng. Có 6 món là ước tính. Số S/L và giá đều là ước tính. Chi tiết ở mục 6. |

---

## 2. So sánh các bộ dữ liệu đã kiểm tra

| Bộ dữ liệu | Trang / repo | Số lớp / số ảnh | Định dạng, dung lượng | License / điều khoản | Tải không cần đăng nhập? | Kết luận |
|---|---|---|---|---|---|---|
| **30VNFoods** (bản gốc Kaggle `quandang/vietnamese-foods`) | https://www.kaggle.com/datasets/quandang/vietnamese-foods · code: https://github.com/ds4v/30VNFoods (MIT, chỉ áp cho code) | 30 / 25.136 (train 17.581, val 2.515, test 5.040) | ảnh JPG, 4.508.861.865 B (theo Kaggle API) | **CC BY-NC-SA 4.0** (đọc từ Kaggle API `licenseName`) | ❌ Kaggle bắt đăng nhập | Dùng các bản sao HF bên dưới |
| ↳ **HF `vuongnhathien/30VNFoods`** ✅ | https://huggingface.co/datasets/vuongnhathien/30VNFoods | 30 / theo bản gốc | 3 file zip, 4,48 GB | ghi rõ `license: cc-by-nc-sa-4.0` | ✅ không gated (đã HEAD) | **KHUYẾN NGHỊ** |
| ↳ HF `nguyenhuann/vnfood-images` | https://huggingface.co/datasets/nguyenhuann/vnfood-images | 30 / 25.134 (đã gộp split) | imagefolder, mỗi ảnh 1 file, 4,50 GB | không ghi (README trống) | ✅ không gated | Dùng khi muốn tải theo từng lớp |
| ↳ HF `TuyenTrungLe/vietnamese_food_images` | https://huggingface.co/datasets/TuyenTrungLe/vietnamese_food_images | 30 / 25.136, có nhãn và split | 9 file parquet, 4.496.921.007 B ≈ 4,5 GB | không ghi (README trống) | ✅ không gated | Hợp nếu dùng thư viện `datasets`; số ảnh từng lớp ở mục 5 lấy từ đây |
| ↳ HF `trinhtrantran122/CS231_30VNFoods_processed` | https://huggingface.co/datasets/trinhtrantran122/CS231_30VNFoods_processed | 30 / 23.797 (ít hơn bản gốc 1.339 ảnh, có thể đã lọc trùng) | imagefolder Train/Validate/Test | không ghi; không có README nên không rõ đã xử lý gì | ✅ | Chưa rõ nguồn gốc, chỉ để tham khảo |
| VietFood67 (VietFood57 + 10 món) | https://www.kaggle.com/datasets/thomasnguyen6868/vietfood68 · https://github.com/nvhnam/FoodDetector | 68 lớp (67 món + mặt người) / ~33.000 ảnh **có bounding box** (bài toán detection) | 26.408.465.355 B ≈ **26,4 GB** | CC BY-NC-SA 4.0; README: “free for research and educational purposes with proper citation… commercial use or redistribution is not permitted” | ❌ chỉ có trên Kaggle | Có cơm chiên, bún chả, chả giò… nhưng cần đăng nhập Kaggle và rất nặng. Chỉ cân nhắc nếu chấp nhận tạo tài khoản Kaggle |
| VinaFood21 (UIT, RIVF 2021) | https://arxiv.org/abs/2108.02929 · repo trong bài `github.com/nguyenvd-uit/uit-together-dataset` → **404** | 21 / 13.950 (~2 GB) | — | không rõ | ❌ link chết | Loại. Các lớp chủ yếu không phải bữa ăn SV: bò lá lốt, há cảo, bánh ướt, bánh hỏi, thịt kho trứng, bánh căn, cà ri, bắp nướng, bánh tráng trộn, hoành thánh nước, phá lấu, tàu hũ, bột chiên, bò kho, gà nướng, bánh ú, bánh tét, gỏi gà, canh khoai mỡ, canh khổ qua, bánh mì chảo |
| UEH-VDR | IEEE Access 2022, “A Dish Recognition Framework Using Transfer Learning” | không công bố | — | — | ❌ không tìm thấy link tải công khai | Loại |
| TypicalVietnameseFoodNet | ICCAS 2021 (DOI 10.23919/ICCAS52745.2021.9649805) | ? | — | — | ❌ không tìm thấy link | Loại |
| HF `ThanThoai9x/vietnamese-food-images` | https://huggingface.co/datasets/ThanThoai9x/vietnamese-food-images | ? (≈36 GB parquet) | — | cc-by-nc-4.0 | ❌ **gated: manual** (phải đăng nhập và chờ duyệt) | Loại |
| HF `Hoppaaa/Vietnamese-Food-VQA`, `dung3008/vqa-food-vietnamese` | huggingface.co/datasets/… | ~300 ảnh / ~1.470 ảnh (bộ hỏi đáp) | nhỏ | cc-by-4.0 / không ghi | ✅ | Quá ít ảnh |
| HF `chocopiee/vnfoods`, `ZeZanZiet/vnfoods`, `giahuy4205/VNFood-103`, `keklek/VietnameseFoodImageDataset`, `rabbitKabbit/VietnameseFoodProcessed` | — | 83 ảnh / trống / trống / trống / 1 zip 4,3 GB không mô tả | — | — | ✅ | Loại (rỗng hoặc không rõ nội dung) |
| Roboflow Universe (`nhh/vietnamese-food`, `khacthien/vietnamese-food-detection`) | universe.roboflow.com | detection, vài lớp | — | — | ❌ tải phải có tài khoản, trang trả 403 | Loại |
| **Food-101** (bộ phụ) | https://huggingface.co/datasets/ethz/food101 | 101 / 101.000 (dùng 2 lớp: `fried_rice`, `spring_rolls`) | 11 file parquet, 5,06 GB (không tải lẻ từng lớp được) | “Any use beyond scientific fair use must be negotiated with the respective picture owners” | ✅ không gated | Tuỳ chọn để vá cơm chiên / chả giò |

**Trích dẫn bắt buộc** (điều kiện BY của license):
- Trong-Hop Do, Duc-Duy-Anh Nguyen, Hoang-Quan Dang, Hoang-Nhan Nguyen, Phu-Phuoc Pham, Duc-Tri Nguyen. *30VNFoods: A Dataset for Vietnamese Foods Recognition*. IEEE COMNETSAT 2021. DOI: 10.1109/COMNETSAT53002.2021.9530774.
- (nếu dùng Food-101) Bossard, Guillaumin, Van Gool. *Food-101 – Mining Discriminative Components with Random Forests*. ECCV 2014.

---

## 3. Bộ khuyến nghị: 30VNFoods

### 3.1 Lý do chọn
- Đây là bộ phân loại món Việt lớn nhất tải được không cần đăng nhập. Món ăn hằng ngày của SV có đủ: cơm tấm, phở, bún bò Huế, bánh mì, hủ tiếu, gỏi cuốn, bánh xèo, xôi xéo, cháo lòng, mì Quảng, bún riêu, bún thịt nướng, bánh cuốn, bún đậu mắm tôm…
- Mỗi ảnh chỉ có một nhãn, đúng kiểu bài toán phân loại, nên dùng thẳng cho “embedding + đầu tuyến tính” mà không phải cắt bounding box như VietFood67.
- Có split train/val/test gốc, so được với bài báo (top-1 77,54%, top-5 96,07% khi fine-tune toàn mạng).
- Dung lượng vừa phải (4,5 GB). Mỗi lớp có 444–1.530 ảnh, thừa đủ cho một đầu tuyến tính.

### 3.2 Nhược điểm đã biết
- Ảnh được crawl từ web (README repo có mục “Collecting Data” bằng crawler). Bản quyền từng ảnh thuộc người chụp, license của bộ chỉ áp cho bộ sưu tập.
- Có nhiễu nhãn. Báo cáo DataClinic #42 của Pebblous phát hiện ảnh trùng mang 2 nhãn (Banh gio_427 = Banh beo_434), ảnh mà món chỉ chiếm góc nhỏ, và bánh tráng nướng thiếu đa dạng. Lớp lớn nhất gấp ~3,5 lần lớp nhỏ nhất. Mô tả trên Kaggle (ghi chú 2026) khuyên **bỏ lớp `Banh duc`** vì quá nhiễu.
- Thiếu vài món SV hay ăn: **cơm chiên, bún chả, cơm gà, chả giò, bột chiên, bò kho, cơm phần**.
- Ảnh web khác ảnh chụp bằng điện thoại ở căng-tin. Nên tự chụp thêm 20–50 ảnh/món để làm tập kiểm thử thật.

### 3.3 Cách tải (không cần token)
```bash
# Cách A – bản sao có license rõ ràng (tải 3 zip, ~4,48 GB)
curl -L -o train.zip      https://huggingface.co/datasets/vuongnhathien/30VNFoods/resolve/main/train.zip
curl -L -o validation.zip https://huggingface.co/datasets/vuongnhathien/30VNFoods/resolve/main/validation.zip
curl -L -o test.zip       https://huggingface.co/datasets/vuongnhathien/30VNFoods/resolve/main/test.zip
# Lưu ý: chưa mở zip (theo yêu cầu không tải) nên chưa xác nhận cấu trúc thư mục bên trong.
# Bản gốc Kaggle chia theo dạng <split>/<Tên lớp>/*.jpg.

# Cách B – chỉ tải 28 lớp cần (bỏ banh_duc, banh_pia), mỗi ảnh 1 file
pip install -U huggingface_hub
hf download nguyenhuann/vnfood-images --repo-type dataset --local-dir data/vnfood \
  --exclude "banh_duc/*" "banh_pia/*"
# (khoảng 4,33 GB; bản huggingface_hub cũ dùng lệnh `huggingface-cli download`)

# Cách C – parquet có sẵn nhãn và split (dùng thư viện datasets)
#   load_dataset("TuyenTrungLe/vietnamese_food_images")   # 4,5 GB, nhãn = tên lớp gốc
```
Với cách B không có split sẵn, nên tự chia 80/10/10 theo lớp với seed cố định.

### 3.4 Gợi ý huấn luyện (theo pipeline đã chốt)
- Dùng MediaPipe ImageEmbedder (MobileNetV3) để tính embedding cho từng ảnh **một lần**, lưu thành file `.npy`, rồi huấn luyện đầu logistic regression/MLP nhỏ (nhanh, chạy CPU được).
- Kỳ vọng độ chính xác, đây là **ước tính** vì chưa đo: một đầu tuyến tính trên embedding cố định thường thấp hơn fine-tune toàn mạng (bài báo được 77,5% top-1). Nên dự kiến top-1 khoảng 60–75%, top-3 cao hơn nhiều. Vì vậy **UI nên cho người dùng chọn trong top-3** và đặt ngưỡng tin cậy (thấp hơn ngưỡng thì hỏi “Đây là món gì?”).
- Cân bằng lớp bằng `class_weight="balanced"` hoặc lấy mẫu tối đa ~800 ảnh/lớp.
- Lọc nhiễu nhanh: sau lần huấn luyện đầu, xem các ảnh có loss cao nhất ở mỗi lớp rồi xoá ảnh sai nhãn hoặc ảnh không có món.

### 3.5 Trọng số có sẵn để fine-tune hoặc làm “thầy” (không bắt buộc)
| Model | Kiến trúc | Dữ liệu | Kết quả công bố | License | Ghi chú |
|---|---|---|---|---|---|
| https://huggingface.co/Luan220703/vit-base-VietnameseFood | ViT-B/16 (~86M tham số) | `TuyenTrungLe/vietnamese_food_images` (30VNFoods) | test acc 0,8639 | apache-2.0 (nhưng dữ liệu là NC) | Quá nặng cho trình duyệt (~330 MB fp32). Có thể làm “thầy” để lọc nhãn sai |
| https://huggingface.co/TuyenTrungLe/finetuned-vietnamese-food | ViT-B/16 | “indian_vietnam_images” (không rõ) | eval acc 0,896 | apache-2.0 | Không rõ danh sách lớp |
| https://huggingface.co/MatchaMacchiato/LSNet_VietnameseFood | ? | ? | — | — | Không có model card |
| Model của tác giả 30VNFoods (Google Drive trong README) | — | 30VNFoods | — | — | Link Drive trả **404** |

Pipeline MediaPipe + đầu tuyến tính **không cần** các trọng số trên.

---

## 4. Kết luận về license (CC BY-NC-SA 4.0)

| Câu hỏi | Trả lời |
|---|---|
| Có được tải về và huấn luyện không? | **Được.** License cho phép sao chép và tạo bản phái sinh với mục đích phi thương mại. |
| Có được dùng model trong app dự thi của SV (miễn phí, không quảng cáo) không? | **Được.** Đây là mục đích phi thương mại. Cần ghi nguồn 30VNFoods và link license trong trang “Giới thiệu/Credits”. |
| Có được đóng gói ảnh vào app hoặc repo public không? | **Không nên.** Chỉ phân phối model (đầu phân loại + nhãn), không phân phối ảnh. Ảnh gốc là ảnh web, bản quyền thuộc người chụp. |
| ShareAlike áp dụng ra sao? | Nếu công bố trọng số đầu phân loại thì nên để cùng license CC BY-NC-SA 4.0 cho chắc. Việc model đã huấn luyện có tính là “bản phái sinh” hay không chưa có câu trả lời pháp lý rõ ràng. |
| Thương mại hoá (bán app, thu phí, quảng cáo, giao cho doanh nghiệp) thì sao? | **Không được** nếu chưa xin phép tác giả. Khi đó phải tự thu ảnh hoặc mua dữ liệu có license thương mại. |
| Food-101? | Chỉ “scientific fair use”. Dùng cho demo/thi học thuật thì rủi ro thấp, tuyệt đối không dùng thương mại. |

> Ghi chú: được trả tiền để *viết* app không làm app thành thương mại. Điều quyết định là app có được khai thác thương mại hay không. Nếu sau cuộc thi nhóm SV muốn kinh doanh app, phải thay dữ liệu.

---

## 5. Danh sách 28 món khuyến nghị + dinh dưỡng

**Quy ước:**
- `id` = tên thư mục trong `nguyenhuann/vnfood-images` đổi `_` thành `-`. `datasetClass` = tên lớp gốc 30VNFoods (dùng trong zip/parquet).
- Số trong ngoặc ở cột lớp là số ảnh của lớp (train+val+test, đếm từ thống kê HF của `TuyenTrungLe/vietnamese_food_images`).
- **kcal M** (khẩu phần “vừa”) là số liệu bảng (trừ dòng ⚠️). **S = M × 0,75; L = M × 1,35**, làm tròn 10 kcal. **S và L đều là ước tính** (tô nhỏ/đặc biệt).
- P/C/F tính bằng gam cho khẩu phần M.
- Giá là **ước tính** cho quán bình dân đến tầm trung ở TP.HCM 2025–2026, chưa khảo sát thực tế. Cần kiểm lại trên GrabFood/ShopeeFood trước khi demo.
- Nguồn “Nutrihome 2023” = PDF *Bảng lượng calo trong thực phẩm, thức ăn Việt Nam* (https://nutrihome.vn/wp-content/uploads/2023/04/bang-luong-calo-trong-thuc-pham.pdf, 333 dòng, có calo/protein/fat/carb theo khẩu phần). Bìa ghi “Nguồn: Tổng hợp”. Số thứ tự `#` là cột STT trong PDF.

| # | id | Món | Lớp 30VNFoods (ảnh) | Khẩu phần “vừa” | kcal S / M / L | P / C / F (g, M) | Giá TP.HCM (nghìn đ) | Nguồn dinh dưỡng |
|---|---|---|---|---|---|---|---|---|
| 1 | `banh-beo` | Bánh bèo | `Banh beo` (645) | 1 đĩa | 270 / **358** / 480 | 13.3 / 44.9 / 13.9 | 25–40 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #4 'Bánh bèo – 1 đĩa' |
| 2 | `banh-bot-loc` | Bánh bột lọc | `Banh bot loc` (720) | 1 đĩa | 360 / **485** / 660 | 13.2 / 62.7 / 20.2 | 25–45 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #12 'Bánh bột lọc – 1 đĩa' |
| 3 | `banh-can` | Bánh căn | `Banh can` (744) | 1 đĩa ~10 cái | 260 / **350** / 470 | 12 / 55 / 9 | 30–50 *(ước tính)* | ƯỚC TÍNH (không có trong bảng; suy từ bột gạo + trứng cút + nước chấm) ⚠️ước tính |
| 4 | `banh-canh` | Bánh canh | `Banh canh` (964) | 1 tô (cua) | 280 / **378** / 510 | 21.4 / 54.3 / 8.4 | 35–60 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #235 'Bánh canh cua – 1 tô' (thịt heo 321.7 – giò heo 482.8) |
| 5 | `banh-chung` | Bánh chưng | `Banh chung` (506) | 1 cái nhỏ (~¼ cái lớn) | 310 / **408** / 550 | 14.9 / 74.7 / 5.5 | 20–40 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #16 'Bánh chưng – 1 cái' |
| 6 | `banh-cuon` | Bánh cuốn | `Banh cuon` (1140) | 1 đĩa (kèm chả lụa) | 440 / **590** / 800 | 25.7 / 64.3 / 25.6 | 30–50 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #19 'Bánh cuốn – 1 đĩa' |
| 7 | `banh-gio` | Bánh giò | `Banh gio` (641) | 1 cái | 160 / **215** / 290 | 9.3 / 28.5 / 7.1 | 15–30 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #25 'Bánh giò – 1 cái' |
| 8 | `banh-khot` | Bánh khọt | `Banh khot` (835) | 1 đĩa 10 cái | 230 / **308** / 420 | 11.6 / 33.6 / 14.2 | 35–60 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #32 '1 đĩa 5 cái = 154.12' ×2 (bảng có vẻ thấp, nên coi là cận dưới) ⚠️ước tính |
| 9 | `banh-mi` | Bánh mì thịt | `Banh mi` (1336) | 1 ổ | 350 / **461** / 620 | 17.8 / 55.3 / 18.7 | 20–35 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #47 'Bánh mì thịt – 1 ổ' |
| 10 | `banh-tet` | Bánh tét | `Banh tet` (686) | 1 phần (~2 khoanh) | 310 / **408** / 550 | 14.9 / 74.7 / 5.5 | 20–40 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #60 'Bánh tét nhân mặn – 1 cái' |
| 11 | `banh-trang-nuong` | Bánh tráng nướng | `Banh trang nuong` (795) | 1 cái | 190 / **250** / 340 | 9 / 30 / 11 | 15–30 *(ước tính)* | ƯỚC TÍNH (bánh tráng + trứng cút + mỡ hành + xúc xích/sốt; bảng chỉ có bánh tráng trộn 300 kcal/100 g) ⚠️ước tính |
| 12 | `banh-xeo` | Bánh xèo | `Banh xeo` (1173) | 1 cái lớn (kèm rau) | 390 / **517** / 700 | 15 / 70.9 / 19.3 | 30–60 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #66 'Bánh xèo – 1 cái' |
| 13 | `bun-bo-hue` | Bún bò Huế | `Bun bo Hue` (1530) | 1 tô | 360 / **479** / 650 | 18.4 / 65.3 / 16 | 40–65 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #241 'Bún bò huế – 1 tô' (có giò: 621.8) |
| 14 | `bun-dau-mam-tom` | Bún đậu mắm tôm | `Bun dau mam tom` (916) | 1 suất (mẹt 1 người) | 570 / **760** / 1030 | 58.3 / 48.9 / 44.5 | 40–75 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #243 'Bún đậu mắm tôm – 1 suất' |
| 15 | `bun-mam` | Bún mắm | `Bun mam` (773) | 1 tô | 360 / **480** / 650 | 28.2 / 56.8 / 15.5 | 45–70 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #244 'Bún mắm – 1 tô' |
| 16 | `bun-rieu` | Bún riêu | `Bun rieu` (1151) | 1 tô | 360 / **481** / 650 | 16.5 / 66 / 16.8 | 35–60 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #247 'Bún riêu – 1 tô' (riêu cua 413) |
| 17 | `bun-thit-nuong` | Bún thịt nướng | `Bun thit nuong` (747) | 1 tô | 340 / **451** / 610 | 14.7 / 67.3 / 13.7 | 35–55 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #250 'Bún thịt nướng – 1 tô' (kèm chả giò 598) |
| 18 | `ca-kho-to` | Cá kho tộ | `Ca kho to` (676) | 2 khúc cá, CHƯA tính cơm | 200 / **264** / 360 | 31.4 / 17.4 / 7.6 | 35–60 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #176 'Cá lóc kho – 1 lát' ×2 |
| 19 | `canh-chua` | Canh chua cá | `Canh chua` (825) | 1 tô cá nhân (~2 chén + 1 khúc cá) | 110 / **150** / 200 | 15 / 8 / 6 | 25–50 *(ước tính)* | ƯỚC TÍNH: Nutrihome 2023 (bảng tổng hợp) #106 'Canh chua – 1 chén' 29.1 ×2 + ~90 kcal cá lóc ⚠️ước tính |
| 20 | `cao-lau` | Cao lầu | `Cao lau` (618) | 1 tô | 380 / **500** / 680 | 22 / 65 / 16 | 40–65 *(ước tính)* | ƯỚC TÍNH (không có trong bảng; tham chiếu mì Quảng Nutrihome 2023 (bảng tổng hợp) #263) ⚠️ước tính |
| 21 | `chao-long` | Cháo lòng | `Chao long` (1073) | 1 tô | 310 / **412** / 560 | 30.8 / 41.7 / 13.5 | 30–50 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #117 'Cháo lòng – 1 tô' |
| 22 | `com-tam` | Cơm tấm sườn | `Com tam` (942) | 1 dĩa sườn | 400 / **529** / 710 | 20.7 / 81.6 / 13.3 | 35–70 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #129 'Cơm tấm sườn – 1 phần' (bì 628.1, chả 593.7) |
| 23 | `goi-cuon` | Gỏi cuốn | `Goi cuon` (855) | 3 cuốn, CHƯA tính nước chấm | 110 / **147** / 200 | 7.7 / 17.8 / 5 | 15–30 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #203 'Gỏi tôm cuốn – 3 cuốn' |
| 24 | `hu-tieu` | Hủ tiếu Nam Vang | `Hu tieu` (983) | 1 tô | 300 / **400** / 540 | 24.3 / 42.5 / 14.8 | 40–70 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #258 'Hủ tíu Nam vang – 1 tô' (thịt heo 361.3) |
| 25 | `mi-quang` | Mì Quảng | `Mi quang` (884) | 1 tô | 410 / **541** / 730 | 22.4 / 67.4 / 20.2 | 35–60 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #263 'Mì quảng – 1 tô' |
| 26 | `nem-chua` | Nem chua | `Nem chua` (542) | ~100 g (4–5 cái nhỏ) | 100 / **137** / 180 | 21.7 / 4.3 / 3.7 | 20–40 *(ước tính)* | Bảng thành phần thực phẩm VN (Viện Dinh dưỡng 2007) – nem chua/100 g; số nhớ lại, CẦN ĐỐI CHIẾU bản gốc ⚠️ước tính |
| 27 | `pho` | Phở bò | `Pho` (807) | 1 tô | 310 / **414** / 560 | 17.9 / 59.3 / 11.7 | 45–80 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #271 'Phở bò tái – 1 tô' (chín 430.6, phở gà 483.5) |
| 28 | `xoi-xeo` | Xôi xéo | `Xoi xeo` (523) | 1 gói | 400 / **534** / 720 | 15.4 / 92.8 / 11.2 | 15–30 *(ước tính)* | Nutrihome 2023 (bảng tổng hợp) #326 'Xôi đậu xanh – 1 gói' (gần nhất; xôi xéo thêm hành phi/mỡ nên có thể cao hơn ~10%) ⚠️ước tính |

**Hai lớp bỏ khỏi model** (vẫn có trong dữ liệu, thêm lại rất dễ):
- `Banh duc`: nhãn nhiễu (khuyến cáo trên Kaggle). Nutrihome #23 chỉ có bánh đúc 100 g = 51,5 kcal.
- `Banh pia`: bánh ngọt, lớp ít ảnh nhất (444). Nutrihome #50 ghi 709 kcal/cái nhưng P/F/C (29,8/91,3/161) cộng lại ra ~1.585 kcal, tức số liệu không nhất quán.

**Món SV hay ăn nhưng 30VNFoods không có** (giai đoạn 2: tự chụp 50–150 ảnh/món hoặc lấy từ Food-101). Các món này **không** nằm trong JSON cuối vì chưa có ảnh để huấn luyện:

| id đề xuất | Món | Nguồn ảnh khả dĩ | kcal M | P / C / F | Nguồn số liệu |
|---|---|---|---|---|---|
| `com-chien` | Cơm chiên Dương Châu (1 đĩa) | Food-101 `fried_rice` / tự chụp | 532 | 14,9 / 92,7 / 11,3 | Nutrihome #126 |
| `cha-gio` | Chả giò | Food-101 `spring_rolls` / tự chụp | ~40/cuốn | 1,8 / 3,6 / 2,1 (mỗi cuốn) | Nutrihome #184 ghi “10 cuốn = 40,5”, nhiều khả năng là số cho 1 cuốn nhỏ ⚠️ |
| `bot-chien` | Bột chiên (1 đĩa) | tự chụp | 443 | 13,2 / 39,5 / 25,8 | Nutrihome #240 |
| `com-trang` | Cơm trắng (1 chén), cộng thêm cho cá kho/canh chua | — | 200 | 4,6 / 44,2 / 0,6 | Nutrihome #130 |
| `bun-cha` | Bún chả Hà Nội | tự chụp (VietFood67 có nhưng cần Kaggle) | ~550 ⚠️ | — | ước tính, chưa có nguồn đáng tin |
| `com-ga` | Cơm gà xối mỡ | tự chụp | ~650 ⚠️ | — | ước tính, chưa có nguồn đáng tin |

---

## 6. Độ tin cậy của số liệu dinh dưỡng

| Nhóm | Món | Mức tin cậy | Lý do |
|---|---|---|---|
| Lấy thẳng từ bảng, khẩu phần rõ | phở, bún bò Huế, bún riêu, bún thịt nướng, bún mắm, hủ tiếu, mì Quảng, cháo lòng, cơm tấm, bánh mì, bánh xèo, bánh cuốn, bánh canh, bánh bèo, bánh bột lọc, bánh giò, gỏi cuốn, bún đậu mắm tôm, bánh chưng, bánh tét, cá kho tộ (×2 lát) | **Trung bình – khá** | Có đủ P/C/F. Đã kiểm tra P×4 + C×4 + F×9 khớp với kcal (ví dụ phở 414, bún bò 479, bánh mì 460, mì Quảng 541). Các con số nằm trong khoảng mà Long Châu, Pharmacity, Hello Bacsi đưa ra (vd. bún bò ~480–650, phở 350–450). **Nhưng** bảng là “tổng hợp” của một trang tư vấn dinh dưỡng, chưa truy được tới bản gốc Viện Dinh dưỡng/Trung tâm Dinh dưỡng TP.HCM, và không ghi khối lượng tính bằng gam |
| Suy ra từ dòng gần nhất | xôi xéo (dùng dòng xôi đậu xanh), bánh khọt (×2 dòng 5 cái) | **Thấp – trung bình** | Món thực tế khác công thức trong bảng |
| Ước tính | bánh căn, bánh tráng nướng, canh chua cá, cao lầu, nem chua | **Thấp** | Không có dòng tương ứng. Nem chua lấy theo trí nhớ từ *Bảng thành phần thực phẩm Việt Nam* (Viện Dinh dưỡng, 2007), **phải đối chiếu** |
| Khẩu phần S/L | tất cả | **Thấp** | Hệ số ×0,75/×1,35 do tự đặt. Sai số thực tế của ước lượng khẩu phần từ ảnh thường ±20–30% |

**Việc nên làm để tăng độ tin cậy trước buổi thi:**
1. Đối chiếu 28 dòng với sách *Thành phần dinh dưỡng 400 món ăn thông dụng* (Viện Dinh dưỡng, NXB Y học) hoặc *Bảng thành phần thực phẩm Việt Nam* (Viện Dinh dưỡng, 2007; tính theo nguyên liệu / 100 g). Các số liệu này không có bản tra cứu trực tuyến chính thức.
2. Trong app, hiển thị kcal kèm “±25%” và cho người dùng sửa khẩu phần. Ghi rõ “số liệu tham khảo”.
3. Cho phép cộng thêm món kèm (cơm trắng, nước chấm gỏi cuốn ~80–100 kcal, trà sữa…).

---

## 7. Nguồn đã kiểm tra (ngày 15–16/10/2026)
- HF API `api/datasets/<id>` (cờ gated/private, cardData, danh sách file), `api/datasets/<id>/tree/main` (dung lượng file), `datasets-server.huggingface.co/statistics` (số ảnh mỗi lớp) và HEAD các link `resolve/main/...` (302 → CDN, `user_id=public`).
- Kaggle API `api/v1/datasets/view/quandang/vietnamese-foods` (CC BY-NC-SA 4.0, 4.508.861.865 B, cập nhật 06/07/2021) và `.../thomasnguyen6868/vietfood68` (CC BY-NC-SA 4.0, 26.408.465.355 B).
- https://github.com/ds4v/30VNFoods (README, MIT cho code; https://github.com/18520339/vietnamese-foods chuyển hướng về đây).
- https://github.com/nvhnam/FoodDetector (điều khoản VietFood67) và `class_names.py` (danh sách lớp VietFood57).
- https://arxiv.org/abs/2108.02929 (VinaFood21, đọc danh sách 21 lớp ở Hình 6 trong PDF).
- https://blog.pebblous.ai/story/dataclinic-report-42-30vnfoods-story-pb/en/ (báo cáo chất lượng 30VNFoods).
- Crossref (DOI của 30VNFoods, VinaFood21, TypicalVietnameseFoodNet).
- https://nutrihome.vn/wp-content/uploads/2023/04/bang-luong-calo-trong-thuc-pham.pdf (đã đọc toàn bộ 20 trang bảng).
- Đối chiếu tham khảo: nhathuoclongchau.com.vn, pharmacity.vn, hellobacsi.com (bài “… bao nhiêu calo”).

---

## 8. JSON danh sách món (28 lớp, dùng cho bảng tra trong app)

`priceVnd` tính bằng đồng. `kcal.m` lấy từ bảng (trừ các món ghi “ƯỚC TÍNH” trong `source`). `kcal.s`/`kcal.l` và giá đều là ước tính.

```json
[
  {"id": "banh-beo", "name": "Bánh bèo", "datasetClass": "Banh beo", "kcal": {"s": 270, "m": 358, "l": 480}, "proteinG": 13.3, "carbG": 44.9, "fatG": 13.9, "priceVnd": [25000, 40000], "source": "Nutrihome 2023 (bảng tổng hợp) #4 'Bánh bèo – 1 đĩa'; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "banh-bot-loc", "name": "Bánh bột lọc", "datasetClass": "Banh bot loc", "kcal": {"s": 360, "m": 485, "l": 660}, "proteinG": 13.2, "carbG": 62.7, "fatG": 20.2, "priceVnd": [25000, 45000], "source": "Nutrihome 2023 (bảng tổng hợp) #12 'Bánh bột lọc – 1 đĩa'; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "banh-can", "name": "Bánh căn", "datasetClass": "Banh can", "kcal": {"s": 260, "m": 350, "l": 470}, "proteinG": 12, "carbG": 55, "fatG": 9, "priceVnd": [30000, 50000], "source": "ƯỚC TÍNH (không có trong bảng; suy từ bột gạo + trứng cút + nước chấm); S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "banh-canh", "name": "Bánh canh", "datasetClass": "Banh canh", "kcal": {"s": 280, "m": 378, "l": 510}, "proteinG": 21.4, "carbG": 54.3, "fatG": 8.4, "priceVnd": [35000, 60000], "source": "Nutrihome 2023 (bảng tổng hợp) #235 'Bánh canh cua – 1 tô' (thịt heo 321.7 – giò heo 482.8); S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "banh-chung", "name": "Bánh chưng", "datasetClass": "Banh chung", "kcal": {"s": 310, "m": 408, "l": 550}, "proteinG": 14.9, "carbG": 74.7, "fatG": 5.5, "priceVnd": [20000, 40000], "source": "Nutrihome 2023 (bảng tổng hợp) #16 'Bánh chưng – 1 cái'; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "banh-cuon", "name": "Bánh cuốn", "datasetClass": "Banh cuon", "kcal": {"s": 440, "m": 590, "l": 800}, "proteinG": 25.7, "carbG": 64.3, "fatG": 25.6, "priceVnd": [30000, 50000], "source": "Nutrihome 2023 (bảng tổng hợp) #19 'Bánh cuốn – 1 đĩa'; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "banh-gio", "name": "Bánh giò", "datasetClass": "Banh gio", "kcal": {"s": 160, "m": 215, "l": 290}, "proteinG": 9.3, "carbG": 28.5, "fatG": 7.1, "priceVnd": [15000, 30000], "source": "Nutrihome 2023 (bảng tổng hợp) #25 'Bánh giò – 1 cái'; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "banh-khot", "name": "Bánh khọt", "datasetClass": "Banh khot", "kcal": {"s": 230, "m": 308, "l": 420}, "proteinG": 11.6, "carbG": 33.6, "fatG": 14.2, "priceVnd": [35000, 60000], "source": "Nutrihome 2023 (bảng tổng hợp) #32 '1 đĩa 5 cái = 154.12' ×2 (bảng có vẻ thấp, nên coi là cận dưới); S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "banh-mi", "name": "Bánh mì thịt", "datasetClass": "Banh mi", "kcal": {"s": 350, "m": 461, "l": 620}, "proteinG": 17.8, "carbG": 55.3, "fatG": 18.7, "priceVnd": [20000, 35000], "source": "Nutrihome 2023 (bảng tổng hợp) #47 'Bánh mì thịt – 1 ổ'; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "banh-tet", "name": "Bánh tét", "datasetClass": "Banh tet", "kcal": {"s": 310, "m": 408, "l": 550}, "proteinG": 14.9, "carbG": 74.7, "fatG": 5.5, "priceVnd": [20000, 40000], "source": "Nutrihome 2023 (bảng tổng hợp) #60 'Bánh tét nhân mặn – 1 cái'; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "banh-trang-nuong", "name": "Bánh tráng nướng", "datasetClass": "Banh trang nuong", "kcal": {"s": 190, "m": 250, "l": 340}, "proteinG": 9, "carbG": 30, "fatG": 11, "priceVnd": [15000, 30000], "source": "ƯỚC TÍNH (bánh tráng + trứng cút + mỡ hành + xúc xích/sốt; bảng chỉ có bánh tráng trộn 300 kcal/100 g); S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "banh-xeo", "name": "Bánh xèo", "datasetClass": "Banh xeo", "kcal": {"s": 390, "m": 517, "l": 700}, "proteinG": 15.0, "carbG": 70.9, "fatG": 19.3, "priceVnd": [30000, 60000], "source": "Nutrihome 2023 (bảng tổng hợp) #66 'Bánh xèo – 1 cái'; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "bun-bo-hue", "name": "Bún bò Huế", "datasetClass": "Bun bo Hue", "kcal": {"s": 360, "m": 479, "l": 650}, "proteinG": 18.4, "carbG": 65.3, "fatG": 16.0, "priceVnd": [40000, 65000], "source": "Nutrihome 2023 (bảng tổng hợp) #241 'Bún bò huế – 1 tô' (có giò: 621.8); S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "bun-dau-mam-tom", "name": "Bún đậu mắm tôm", "datasetClass": "Bun dau mam tom", "kcal": {"s": 570, "m": 760, "l": 1030}, "proteinG": 58.3, "carbG": 48.9, "fatG": 44.5, "priceVnd": [40000, 75000], "source": "Nutrihome 2023 (bảng tổng hợp) #243 'Bún đậu mắm tôm – 1 suất'; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "bun-mam", "name": "Bún mắm", "datasetClass": "Bun mam", "kcal": {"s": 360, "m": 480, "l": 650}, "proteinG": 28.2, "carbG": 56.8, "fatG": 15.5, "priceVnd": [45000, 70000], "source": "Nutrihome 2023 (bảng tổng hợp) #244 'Bún mắm – 1 tô'; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "bun-rieu", "name": "Bún riêu", "datasetClass": "Bun rieu", "kcal": {"s": 360, "m": 481, "l": 650}, "proteinG": 16.5, "carbG": 66.0, "fatG": 16.8, "priceVnd": [35000, 60000], "source": "Nutrihome 2023 (bảng tổng hợp) #247 'Bún riêu – 1 tô' (riêu cua 413); S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "bun-thit-nuong", "name": "Bún thịt nướng", "datasetClass": "Bun thit nuong", "kcal": {"s": 340, "m": 451, "l": 610}, "proteinG": 14.7, "carbG": 67.3, "fatG": 13.7, "priceVnd": [35000, 55000], "source": "Nutrihome 2023 (bảng tổng hợp) #250 'Bún thịt nướng – 1 tô' (kèm chả giò 598); S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "ca-kho-to", "name": "Cá kho tộ", "datasetClass": "Ca kho to", "kcal": {"s": 200, "m": 264, "l": 360}, "proteinG": 31.4, "carbG": 17.4, "fatG": 7.6, "priceVnd": [35000, 60000], "source": "Nutrihome 2023 (bảng tổng hợp) #176 'Cá lóc kho – 1 lát' ×2; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "canh-chua", "name": "Canh chua cá", "datasetClass": "Canh chua", "kcal": {"s": 110, "m": 150, "l": 200}, "proteinG": 15, "carbG": 8, "fatG": 6, "priceVnd": [25000, 50000], "source": "ƯỚC TÍNH: Nutrihome 2023 (bảng tổng hợp) #106 'Canh chua – 1 chén' 29.1 ×2 + ~90 kcal cá lóc; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "cao-lau", "name": "Cao lầu", "datasetClass": "Cao lau", "kcal": {"s": 380, "m": 500, "l": 680}, "proteinG": 22, "carbG": 65, "fatG": 16, "priceVnd": [40000, 65000], "source": "ƯỚC TÍNH (không có trong bảng; tham chiếu mì Quảng Nutrihome 2023 (bảng tổng hợp) #263); S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "chao-long", "name": "Cháo lòng", "datasetClass": "Chao long", "kcal": {"s": 310, "m": 412, "l": 560}, "proteinG": 30.8, "carbG": 41.7, "fatG": 13.5, "priceVnd": [30000, 50000], "source": "Nutrihome 2023 (bảng tổng hợp) #117 'Cháo lòng – 1 tô'; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "com-tam", "name": "Cơm tấm sườn", "datasetClass": "Com tam", "kcal": {"s": 400, "m": 529, "l": 710}, "proteinG": 20.7, "carbG": 81.6, "fatG": 13.3, "priceVnd": [35000, 70000], "source": "Nutrihome 2023 (bảng tổng hợp) #129 'Cơm tấm sườn – 1 phần' (bì 628.1, chả 593.7); S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "goi-cuon", "name": "Gỏi cuốn", "datasetClass": "Goi cuon", "kcal": {"s": 110, "m": 147, "l": 200}, "proteinG": 7.7, "carbG": 17.8, "fatG": 5.0, "priceVnd": [15000, 30000], "source": "Nutrihome 2023 (bảng tổng hợp) #203 'Gỏi tôm cuốn – 3 cuốn'; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "hu-tieu", "name": "Hủ tiếu Nam Vang", "datasetClass": "Hu tieu", "kcal": {"s": 300, "m": 400, "l": 540}, "proteinG": 24.3, "carbG": 42.5, "fatG": 14.8, "priceVnd": [40000, 70000], "source": "Nutrihome 2023 (bảng tổng hợp) #258 'Hủ tíu Nam vang – 1 tô' (thịt heo 361.3); S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "mi-quang", "name": "Mì Quảng", "datasetClass": "Mi quang", "kcal": {"s": 410, "m": 541, "l": 730}, "proteinG": 22.4, "carbG": 67.4, "fatG": 20.2, "priceVnd": [35000, 60000], "source": "Nutrihome 2023 (bảng tổng hợp) #263 'Mì quảng – 1 tô'; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "nem-chua", "name": "Nem chua", "datasetClass": "Nem chua", "kcal": {"s": 100, "m": 137, "l": 180}, "proteinG": 21.7, "carbG": 4.3, "fatG": 3.7, "priceVnd": [20000, 40000], "source": "Bảng thành phần thực phẩm VN (Viện Dinh dưỡng 2007) – nem chua/100 g; số nhớ lại, CẦN ĐỐI CHIẾU bản gốc; S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "pho", "name": "Phở bò", "datasetClass": "Pho", "kcal": {"s": 310, "m": 414, "l": 560}, "proteinG": 17.9, "carbG": 59.3, "fatG": 11.7, "priceVnd": [45000, 80000], "source": "Nutrihome 2023 (bảng tổng hợp) #271 'Phở bò tái – 1 tô' (chín 430.6, phở gà 483.5); S/L = ước tính ×0.75/×1.35; giá = ước tính"},
  {"id": "xoi-xeo", "name": "Xôi xéo", "datasetClass": "Xoi xeo", "kcal": {"s": 400, "m": 534, "l": 720}, "proteinG": 15.4, "carbG": 92.8, "fatG": 11.2, "priceVnd": [15000, 30000], "source": "Nutrihome 2023 (bảng tổng hợp) #326 'Xôi đậu xanh – 1 gói' (gần nhất; xôi xéo thêm hành phi/mỡ nên có thể cao hơn ~10%); S/L = ước tính ×0.75/×1.35; giá = ước tính"}
]
```
