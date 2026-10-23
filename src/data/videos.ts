export interface ExVideo {
  id: string
  channel: string
  lang: 'vi' | 'en'
}

/**
 * Video hướng dẫn cho từng bài, nhúng từ YouTube (chỉ chọn video cho phép nhúng).
 * Ưu tiên video tiếng Việt; bài nào không có video tiếng Việt phù hợp thì dùng video tiếng Anh ngắn.
 */
export const VIDEOS: Record<string, ExVideo> = {
  'squat': { id: 'w4QVS63qWV0', channel: "Home Wellness Channel", lang: 'vi' }, // 3:31 · HOW TO DO BODYWEIGHT SQUAT | HƯỚNG DẪN TẬP SQUAT ĐÚNG CÁCH
  'lunge': { id: 'OKZ-CaT_5mI', channel: "Kim Trung", lang: 'vi' }, // 4:38 · 7 Chuyển Động Chức Năng: Hướng Dẫn Động Tác Lunge Cơ Bản Dành Cho Ngườ
  'glute-bridge': { id: '5LYoFBq3TfI', channel: "Swequity", lang: 'vi' }, // 0:45 · [MO05] Hướng Dẫn Tập mông Đúng Cách - Glute Bridge
  'wall-sit': { id: 'iEUX0RvbWGA', channel: "Swequity", lang: 'vi' }, // 0:43 · [CH11] Tập Chân đúng cách - Wall Sit
  'calf-raise': { id: '7HOSxJQddLU', channel: "YourFit Private Gym", lang: 'vi' }, // 2:12 · Hướng dẫn CALF RAISE - kĩ thuật TẬP BẮP CHÂN cho người mới | Beginner 
  'goblet-squat': { id: 'HBUyn9dXKZU', channel: "YourFit Private Gym", lang: 'vi' }, // 4:42 · Hướng dẫn GOBLET SQUAT - kĩ thuật TẬP MÔNG ĐÙI cho người mới | Beginne
  'db-rdl': { id: 'Ga7XdXGaqbA', channel: "Vinny Tran", lang: 'vi' }, // 4:35 · CÁCH TẬP BÀI DUMBBELL ROMANIAN DEADLIFT ĐÚNG CÁCH
  'band-side-walk': { id: '1LvxZrJFy9Y', channel: "Medbridge", lang: 'en' }, // 1:01 · How to Do a Lateral Band Walk Exercise | MedBridge
  'leg-press': { id: '1HzPDRu3U4c', channel: "YourFit Private Gym", lang: 'vi' }, // 6:35 · Hướng dẫn LEG PRESS - kĩ thuật TẬP ĐÙI cho người mới | Beginner Workou
  'leg-curl': { id: '8whsd-n6XbI', channel: "Swequity", lang: 'vi' }, // 2:17 · [DS01] Hướng Dẫn Tập Đùi Sau Đúng Cách - Lying Leg Curl
  'incline-pushup': { id: 'R0-95rxr47M', channel: "Mông Kong - HLV Thu Thuỷ", lang: 'vi' }, // 0:55 · Incline push up (ngực cao săn chắc)
  'pushup': { id: 'ejW14LnBDOg', channel: "Đinh Việt Đức", lang: 'vi' }, // 4:01 · Hướng Dẫn Chống Đẩy (Hít Đất) Đúng Cách
  'superman': { id: '_UbhIUFAJY4', channel: "Ryan Coach Official", lang: 'vi' }, // 0:39 · Hướng dẫn bài tập Superman exercise
  'bench-dip': { id: 'mD10se_DlEs', channel: "Ryan Coach Official", lang: 'vi' }, // 0:35 · Hướng dẫn BENCH DIP | RYAN COACH
  'db-row': { id: '9syeVLAJlGE', channel: "An Nguyễn Fitness", lang: 'vi' }, // 8:53 · 3 Biến Thể Dumbbell Row | THỨ 5 FORM CHECK | An Nguyen Fitness
  'shoulder-press': { id: '0I10wx3fg3c', channel: "SmallGym", lang: 'vi' }, // 8:36 · Kỹ thuật DUMBBELL SHOULDER PRESS - Đẩy Vai Với Tạ Đơn | T3KT
  'db-curl': { id: 'kn5pJDi9BOU', channel: "KHÔNG CÒN BÉO NỮA NMF", lang: 'vi' }, // 0:52 · Dumbbell Curls (hướng dẫn tập) - Dumbbell Curls Tutorial
  'band-row': { id: '4pCChA5akdw', channel: "TMH COACHING", lang: 'vi' }, // 0:20 · Hướng Dẫn Tập Luyện Tại Nhà | Bent over Band Row
  'pull-up': { id: 'Dhb48IRE1R0', channel: "Đinh Việt Đức", lang: 'vi' }, // 4:39 · Kéo Xà Đúng Cách: Kỹ Thuật Chuẩn Để Lưng Dày Rộng (Perfect Pull Up)
  'dead-hang': { id: '0HBhuaD_S7M', channel: "Maximus Pump", lang: 'en' }, // 2:06 · Beginner Dead Hang Tutorial
  'lat-pulldown': { id: 'DkwKrtM8yZE', channel: "YourFit Private Gym", lang: 'vi' }, // 4:39 · Hướng dẫn LAT PULL DOWN - kĩ thuật TẬP LƯNG cho người mới | Beginner W
  'chest-press': { id: 'KYuH1U30t5Q', channel: "SPARTAN FITNESS & YOGA CENTER", lang: 'vi' }, // 3:06 · Hướng Dẫn Tập Bài Tập Đẩy Ngực (Chest Press) Hiệu Quả | SPARTAN FITNES
  'plank': { id: '8nO_tX0VOOg', channel: "YourFit Private Gym", lang: 'vi' }, // 2:13 · Hướng Dẫn Chi Tiết Plank Chuẩn – Kích Hoạt Cơ Core Đúng Cách!!!
  'crunch': { id: 'VzmPc2mIO0E', channel: "YourFit Private Gym", lang: 'vi' }, // 4:08 · Hướng dẫn ABDOMINAL CRUNCH - kĩ thuật TẬP BỤNG cho người mới | Beginne
  'russian-twist': { id: '3uBVpKz698E', channel: "THE THINKING TRAINER Việt Nam", lang: 'vi' }, // 2:07 · Hướng dẫn tập bụng với Russian Twist
  'leg-raise': { id: 'NGDp7D-KE-M', channel: "Lừu Văn Chương", lang: 'vi' }, // 0:20 · Leg Raise - Bài tập bụng dưới hiệu quả tại nhà
  'side-plank': { id: 'lNLD-lsmQCQ', channel: "THE THINKING TRAINER Việt Nam", lang: 'vi' }, // 4:43 · [Hướng dẫn tập Core, Bụng] - SIDE PLANK - Bài tập tuyệt vời giúp sửa t
  'jumping-jack': { id: 'lz1YPbW0Mzw', channel: "Dương Thu Hà Fitness - Hi Sunna", lang: 'vi' }, // 0:29 · HƯỚNG DẪN JUMPING JACK ĐÚNG CÁCH CHO NGƯỜI MỚI #shorts
  'high-knees': { id: 'krISHQKlz4I', channel: "Ryan Coach Official", lang: 'vi' }, // 0:34 · Hướng dẫn tập động tác High Knee - Nâng cao đùi
  'mountain-climber': { id: '4zV_jfL1TU8', channel: "Ryan Coach Official", lang: 'vi' }, // 0:49 · Hướng dẫn Mountain Climber | RYAN COACH
  'burpee': { id: 'nPAIFqRksEM', channel: "Sarah Tran", lang: 'vi' }, // 3:50 · [TECHNIQUE SERIES] #3 KỸ THUẬT BURPEE CHI TIẾT!
  'treadmill': { id: 'WLhSNEwDhSw', channel: "The New Gym", lang: 'vi' }, // 1:00 · Cách sử dụng máy chạy bộ - Treadmill Machine
  'bike': { id: 'qXR2YTO40bE', channel: "Toshiko Việt Nam", lang: 'vi' }, // 3:11 · Hướng Dẫn Tập Luyện Với Xe Đạp Tập| Khoẻ đẹp cùng Toshiko
  'sumo-squat': { id: 'wJOOWNeYKA4', channel: "Stretch Me", lang: 'vi' }, // 2:00 · Sumo Squat- Cách thực hiện đúng, đơn giản, và cảm nhận mông đúng cách.
  'step-up': { id: 't_Hrdhs9YUU', channel: "LONG VU NGOC", lang: 'vi' }, // 0:36 · Bài tập: bước lên bục / Step up
  'single-leg-bridge': { id: 'ISaPvGHPI5s', channel: "THE THINKING TRAINER Việt Nam", lang: 'vi' }, // 3:52 · [Hướng dẫn tập chân mông] - Glutes Bridge, Single Leg Bridge - Tập môn
  'bulgarian-split-squat': { id: 'eYH82Exh96g', channel: "KHÔNG CÒN BÉO NỮA NMF", lang: 'vi' }, // 1:58 · Bulgarian Split Squat (hướng dẫn tập) - Bulgarian Split Squat Tutorial
  'jump-squat': { id: 'cEUnlq1CnBA', channel: "The New Gym", lang: 'vi' }, // 0:17 · Jump Squat - Bài Tập Squat Cho Đùi
  'db-lunge': { id: 'gd-eHniVrJY', channel: "KHÔNG CÒN BÉO NỮA NMF", lang: 'vi' }, // 1:41 · Dumbbell lunge (hướng dẫn tập) - Dumbbell lunge tutorial.
  'leg-extension': { id: '-jpyGlF8Emc', channel: "KHÔNG CÒN BÉO NỮA NMF", lang: 'vi' }, // 0:49 · Leg Extension (hướng dẫn tập) - Leg Extension tutorial.
  'hip-thrust': { id: 'wL_f0Nq_0yw', channel: "KHÔNG CÒN BÉO NỮA NMF", lang: 'vi' }, // 2:22 · Barbell Hip Thrust (hướng dẫn tập) - Barbell Hip Thrust Tutorial
  'wide-pushup': { id: 'GUr7XcDl9zk', channel: "Ryan Coach Official", lang: 'vi' }, // 0:39 · Hướng dẫn Wide Width Push Up | Ryan Coach
  'diamond-pushup': { id: 'xbvh5B2Fsx4', channel: "SUN Movement", lang: 'vi' }, // 4:02 · Kỹ thuật động tác Diamond Push up chuẩn và cách tập hiệu quả hơn | SUN
  'pike-pushup': { id: 'VBWb0VhXhPw', channel: "Toàn Vạn Calisthenics ", lang: 'vi' }, // 2:27 · hướng dẫn động tác pike push up đơn giản dễ hiểu nhưng chẳng ai nói ch
  'db-bench-press': { id: 'uG9eYy8vlFY', channel: "SmallGym", lang: 'vi' }, // 9:46 · Kỹ Thuật DUMBBELL BENCH PRESS Hoàn Hảo Cho Cơ Ngực Dày và Rộng | T3KT
  'lateral-raise': { id: 'IovQD8PvCyA', channel: "KHÔNG CÒN BÉO NỮA NMF", lang: 'vi' }, // 1:04 · Lateral Raise (hướng dẫn tập) - Lateral Raise Tutorial
  'hammer-curl': { id: 'WVHQ3GOwZtY', channel: "YourFit Private Gym", lang: 'vi' }, // 4:34 · Hướng dẫn HAMMER CURL - kĩ thuật TẬP TAY cho người mới | Beginner Work
  'overhead-triceps': { id: 'R-VZMj41ceU', channel: "KHÔNG CÒN BÉO NỮA NMF", lang: 'vi' }, // 1:02 · Overhead Tricep Extension (hướng dẫn tập) - Overhead Tricep Extension 
  'band-pull-apart': { id: 'osRimvxXlKQ', channel: "Physical Therapy 101", lang: 'en' }, // 2:56 · Band Pull Apart Series - Shoulder Pain Relief Exercises
  'chin-up': { id: '04p5BrpnEPs', channel: "Thể Hình Vip", lang: 'vi' }, // 1:25 · Chin Up là gì ? Hướng Dẫn Bài Tập Chin-Up Đúng Cách Với Xà Đơn - Thể H
  'cable-row': { id: 'm6TfyoXCMc4', channel: "Học Viện Đào Tạo PT NuEdu", lang: 'vi' }, // 4:48 · Bài 9 : Hướng Dẫn Chi Tiết Bài tập Lưng : Seated Cable Row
  'shoulder-press-machine': { id: 'JHqsbeYLtMU', channel: "SPARTAN FITNESS & YOGA CENTER", lang: 'vi' }, // 2:07 · HƯỚNG DẪN VAI SĂN CHẮC với MÁY TẬP SHOULDER PRESS | Hướng dẫn chi tiết
  'triceps-pushdown': { id: 'RNd1XifLPeg', channel: "YourFit Private Gym", lang: 'vi' }, // 4:25 · Hướng dẫn TRICEPS PUSHDOWN - kĩ thuật TẬP TAY SAU cho người mới | Begi
  'bicycle-crunch': { id: 'Bdg3K0QXE9M', channel: "Dr Tân HomeFiT", lang: 'vi' }, // 0:36 · Hướng dẫn tập động tác: Bicycle Crunch
  'dead-bug': { id: 'PtVZwabQcsk', channel: "THE THINKING TRAINER Việt Nam", lang: 'vi' }, // 3:16 · Hướng dẫn tập bụng với bài tập Dead Bug
  'bird-dog': { id: 'Ks1pIg9TMqA', channel: "THE THINKING TRAINER Việt Nam", lang: 'vi' }, // 3:26 · Bird Dog - Hướng dẫn tập Core với bài Bird Dog
  'flutter-kicks': { id: 'e7eI3CDAfS8', channel: "Bùi Đức Thao", lang: 'vi' }, // 0:31 · ĐỘNG TÁC FLUTTER KICKS - T6 - K1
  'hanging-knee-raise': { id: 'Hi5q4M7EEyo', channel: "YourFit Private Gym", lang: 'vi' }, // 4:23 · Hướng dẫn HANGING LEG RAISE - kĩ thuật TẬP BỤNG cho người mới | Beginn
  'butt-kicks': { id: 'e4cnI7eVKRw', channel: "Josh Wilson (Chief)", lang: 'en' }, // 0:30 · butt kicks exercise
  'skater-jump': { id: '9_jLW6VkU8A', channel: "BuiltLean®", lang: 'en' }, // 1:09 · Speed Skaters Exercise (Skater Hops): Proper Form
  'jump-rope': { id: '9t9VcUd4-14', channel: "Jump Rope Vn", lang: 'vi' }, // 6:03 · Hướng Dẫn Nhảy Dây Cho Người Mới #7 nhảy dây căn bản Jump rope tutoria
  'rowing-machine': { id: 'ZN0J6qKCIrI', channel: "Training Tall and Just Row with Austin", lang: 'en' }, // 6:12 · The Official 2026 Rowing Form Checklist (PERFECT STROKE!)
  'elliptical': { id: 'nHbwwUb5ZDc', channel: "The New Gym", lang: 'vi' }, // 0:51 · Cách sử dụng máy trượt tuyết - Elliptical Machine
  'box-squat': { id: 'VIohBJYa-Gw', channel: "Life Fitness & Yoga", lang: 'vi' }, // 1:22 · SQUAT VỚI GHẾ CHO NGƯỜI MỚI BẮT ĐẦU TẬP LUYỆN
  'db-sumo-squat': { id: 'wJOOWNeYKA4', channel: "Stretch Me", lang: 'vi' }, // 2:00 · Sumo Squat- Cách thực hiện đúng, đơn giản, và cảm nhận mông đúng cách.
  'assisted-pistol': { id: 'HNT9o19RqIk', channel: "Ryan Coach Official", lang: 'vi' }, // 0:37 · Hướng dẫn tập Pistol Squat
  'barbell-squat': { id: 'aZsAcrj8zLc', channel: "Thể Hình Vip", lang: 'vi' }, // 1:24 · Barbell Back Squat là gì ? Hướng dẫn tập đúng cách tăng mông đùi - Thể
  'single-leg-rdl': { id: 'BhR9ghPaOTE', channel: "THE THINKING TRAINER Việt Nam", lang: 'vi' }, // 6:41 · [Hướng dẫn tập chân, mông] - các biến thể của Single Leg Deadlift
  'good-morning': { id: 'HUfc1xW-uJE', channel: "KHÔNG CÒN BÉO NỮA NMF", lang: 'vi' }, // 1:28 · Good Morning (hướng dẫn tập) - Good Morning Tutorial
  'barbell-deadlift': { id: 'TUDNqLGEHIo', channel: "FitnGrit Fitness", lang: 'vi' }, // 2:00 · Hướng Dẫn Động Tác Deadlift
  'reverse-lunge': { id: '5PCjgsYqT7w', channel: "PERFECT Team", lang: 'vi' }, // 4:36 · Reverse Lunge và các lỗi sai cần tránh | PERFECT Team
  'split-squat': { id: 'VccqgVjqfl8', channel: "THE THINKING TRAINER Việt Nam", lang: 'vi' }, // 2:44 · [Hướng dẫn tập chân mông] - Split Squat (Phiên bản dễ thực hiện nhất)
  'side-lunge': { id: 'T_r9rvCyuBE', channel: "HuyBooDH", lang: 'vi' }, // 4:44 · Bodyweight Side Lunge | Chân Mông | TechniqueToday | HuyBooDH
  'cossack-squat': { id: 'XrxuLPSrQEo', channel: "Nguyen-PT", lang: 'vi' }, // 3:04 · Tập Cossack Squat Cho Người Mới với Kettlebell Tại Nhà: Tập Chân Mông 
  'db-step-up': { id: 'FmhU0u0bRx8', channel: "Kênh Thể Hình T3H", lang: 'vi' }, // 0:12 · TẬP CHÂN | Dumbbell Step Up - Nâng Cao Đùi Tạ Đôi | Động Tác Mẫu
  'donkey-kick': { id: '0QlqFGFQSoY', channel: "Dương Thu Hà Fitness - Hi Sunna", lang: 'vi' }, // 1:03 · HƯỚNG DẪN KỸ THUẬT DONKEY KICK ĐỘ MÔNG DỄ HIỂU NHẤT CHO NGƯỜI MỚI? #sh
  'fire-hydrant': { id: 'm5robMcZTss', channel: "Mông Kong - HLV Thu Thuỷ", lang: 'vi' }, // 1:32 · Fire Hydrant bài tập mông nhỡ ( bài tập kích thích v3 căng tròn)
  'clamshell': { id: 'aQVApsdOLSI', channel: "PostureFlow", lang: 'en' }, // 4:20 · Clamshell Exercise - Strengthen Gluteus Medius
  'hip-abduction-machine': { id: 'Sj7Q4DevVuY', channel: "KHÔNG CÒN BÉO NỮA NMF", lang: 'vi' }, // 1:00 · Hip Abductor Machine (hướng dẫn tập) - Hip Abductor Machine Tutorial
  'db-calf-raise': { id: 'qPd73snQfUs', channel: "Hospital for Special Surgery", lang: 'en' }, // 0:31 · Single-Leg Calf Raise (HSS)
  'knee-pushup': { id: 'P4qmq3-CPjY', channel: "DAVIDNGUYENN", lang: 'vi' }, // 0:26 · Hướng dẫn bài tập Knee Push Up
  'decline-pushup': { id: 'G0fvkkLw3ik', channel: "Ryan Coach Official", lang: 'vi' }, // 0:43 · Hướng dẫn Decline Push Up | Ryan Coach
  'band-chest-press': { id: '9cFcjdX9H5k', channel: "Dr Tân HomeFiT", lang: 'vi' }, // 0:37 · Hướng dẫn tập động tác: Chest press with resistance band
  'incline-db-press': { id: 'KS-MlpUpqUo', channel: "An Nguyễn Fitness", lang: 'vi' }, // 9:30 · INCLINE DUMBBELL PRESS và 3 SAI LẦM Thường Gặp| Thứ 5 Form Check| An N
  'db-fly': { id: 'v_8rp_254z8', channel: "SmallGym", lang: 'vi' }, // 9:53 · Kỹ Thuật DUMBBELL CHEST FLY Hoàn Hảo Cho Cơ Ngực Dày và Rộng | T3KT
  'pec-deck': { id: 'j5rqR6VbIYQ', channel: "SPARTAN FITNESS & YOGA CENTER", lang: 'vi' }, // 2:34 · Hướng Dẫn Tập Máy Ép Ngực & Ép Vai Sau | Rear Delt Pec Fly (Chi Tiết)
  'arnold-press': { id: '5eNNRwH3SYc', channel: "KHÔNG CÒN BÉO NỮA NMF", lang: 'vi' }, // 1:36 · Seated Arnold Press (hướng dẫn tập) - Seated Arnold Press Tutorial
  'band-shoulder-press': { id: 'R2M_iKaVB88', channel: "Dr Tân HomeFiT", lang: 'vi' }, // 0:35 · Hướng dẫn tập động tác: Overhead shoulder press with resistance band
  'rear-delt-fly': { id: 'hH1iCS4mbfA', channel: "YourFit Private Gym", lang: 'vi' }, // 4:46 · Hướng dẫn REAR DELT FLY - kĩ thuật TẬP VAI SAU cho người mới | Beginne
  'face-pull': { id: 'y0opXRM2UX4', channel: "SmallGym", lang: 'vi' }, // 2:16 · Kéo Dây Cáp về Hướng Mặt ( Face Pull ) | SmallGym
  'yt-raise': { id: 'QdGTI4Lshg4', channel: "The Active Life", lang: 'en' }, // 0:31 · Prone Y T W
  'inverted-row': { id: '7hE1Cmvp3YA', channel: "YourFit Private Gym", lang: 'vi' }, // 5:27 · Hướng dẫn INVERTED ROW - kĩ thuật TẬP LƯNG cho người mới | Beginner Wo
  'door-row': { id: 'oDlTipyAGnk', channel: "Jim Penick", lang: 'en' }, // 1:40 · Home Exercise Pull 1: Door Frame Rows
  'renegade-row': { id: '7l03NoMzGp4', channel: "Fabio Bonanno", lang: 'en' }, // 0:34 · Single kettlebell Renegade row
  'band-pulldown': { id: '_97pmOC2tzE', channel: "Fitness My Life", lang: 'en' }, // 0:57 · How To Do Lat Pull Down With Resistance Band | Back Workout | Fitness 
  'db-pullover': { id: 'TRj-2SzJKUc', channel: "SmallGym", lang: 'vi' }, // 9:34 · Bài Tập Bị Underrated Nhất? Kỹ Thuật Dumbbell Pullover HOÀN HẢO | THỨ 
  'negative-pullup': { id: 'gbPURTSxQLY', channel: "Bodybuilding.com", lang: 'en' }, // 1:02 · How To Do a Negative Pull-Up | Exercise Guide
  'assisted-pullup': { id: 'qEqNik0ILRU', channel: "The New Gym", lang: 'vi' }, // 1:00 · Cách sử dụng máy hít xà đơn trợ lực - Assisted Pull Up Machine
  'band-curl': { id: 'LRsF-s4lqNo', channel: "TMH COACHING", lang: 'vi' }, // 0:28 · Hướng Dẫn Tập Luyện Tại Nhà | Bicep Curl With Band
  'db-kickback': { id: '8hiYsJ3PyWc', channel: "KHÔNG CÒN BÉO NỮA NMF", lang: 'vi' }, // 1:01 · Triceps Kick Back (hướng dẫn tập) - Triceps Kick Back Tutorial
  'band-pushdown': { id: 'Y3CDzx-oj3k', channel: "Undersun Fitness", lang: 'en' }, // 2:19 · Arms | How To Do Triceps Pushdowns with Resistance Bands
  'skull-crusher': { id: '6leArTBmyQQ', channel: "KHÔNG CÒN BÉO NỮA NMF", lang: 'vi' }, // 1:11 · Skull Crushers (hướng dẫn tập) - Skull Crushers Tutorial
  'hollow-hold': { id: 'x_srRwRVXRQ', channel: "Làng Hoa Workout", lang: 'vi' }, // 3:49 · Hướng dẫn tập Hollow Rock - Bài bụng duy nhất để có 6 múi! - Street Wo
  'plank-shoulder-tap': { id: '8rgurWd-PB8', channel: "The Active Life", lang: 'en' }, // 0:19 · Plank Shoulder Taps
  'pallof-press': { id: 'A15rdPx4A2w', channel: "Swequity", lang: 'vi' }, // 1:16 · [BU04] Hướng Dẫn Tập bụng Đúng Cách - Palloff Press
  'reverse-crunch': { id: 'xjPM6dCovIA', channel: "Dương Thu Hà Fitness - Hi Sunna", lang: 'vi' }, // 0:31 · KỸ THUẬT REVERSE CRUNCH ĐÚNG - GIẢM BỤNG DƯỚI #shorts
  'v-up': { id: '1BPp9FcBif4', channel: "Hồ Hoài Fitness", lang: 'vi' }, // 0:54 · Bài tập gập bụng V-Up
  'heel-touch': { id: 'wL2PJc90acY', channel: "iFitness.vn", lang: 'vi' }, // 4:30 · Alternate Heel Touchers | Bài tập nâng cấp cơ bụng cho nữ | iFitness.v
  'band-woodchop': { id: 'g837HMImTYo', channel: "Gymtime", lang: 'en' }, // 0:36 · Band Wood Chop - Exercise Tip of the Week
  'db-side-bend': { id: 'LcPJ8-2jE0U', channel: "TheHinhOnline", lang: 'vi' }, // 1:53 · Dumbbell Side Bend Tập cơ bụng xiên hoàn hảo với tạ đôi
  'step-jack': { id: 'DUkR98Kf4w0', channel: "Justin Agustin", lang: 'en' }, // 0:42 · Low Impact Jumping Jacks for Beginners
  'run-in-place': { id: '3OsBk8Xe5Wo', channel: "Fun and Fit/Alexandra and Kymberly", lang: 'en' }, // 1:26 · Running in Place: Right and Wrong Way
  'shadow-boxing': { id: 'J4j3AOVWuHE', channel: "Tony Jeffries", lang: 'en' }, // 3:00 · Quick Shadow Boxing Tutorial by Olympian
  'star-jump': { id: '0DKY6gSPpuc', channel: "wearecult", lang: 'en' }, // 0:49 · Cardio Jump Workout at Home | How to Do Star Jumps | cult fit | Warm U
  'tuck-jump': { id: '4hXaSh2WlyE', channel: "Les Mills UK", lang: 'en' }, // 0:37 · How to Tuck Jump (Technique Guide)
  'half-burpee': { id: 'I4dqZX8gJ6M', channel: "Live Lean TV Daily Exercises", lang: 'en' }, // 0:43 · How To Do A NO JUMP BEGINNER BURPEE | Exercise Demonstration Video and
  'inchworm': { id: '0HFXsIMKqUg', channel: "Wodstar", lang: 'en' }, // 0:18 · Inchworms
  'plank-jack': { id: '0VrVjgUV9do', channel: "Ryan Coach Official", lang: 'vi' }, // 0:41 · Hướng dẫn tập plank jack
  'db-thruster': { id: '-rHJkjHUbmo', channel: "CrossFit Life Tulsa", lang: 'en' }, // 0:52 · Dumbbell Thruster Demo - CrossFit
  'stair-climber': { id: 'ww3YV_N6U_U', channel: "McKinley Health Center", lang: 'en' }, // 3:19 · StairMaster Workout and Exercises! How to Use StairMaster with Proper 
}
