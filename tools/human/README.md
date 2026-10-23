# Người mẫu 3D cho hình minh hoạ động tác

Mọi hình minh hoạ bài tập trong app (`public/poses/*.webp`) là cùng một người mẫu 3D được đặt vào từng tư thế rồi render.

- Người mẫu dựng bằng [MPFB](https://extensions.blender.org/add-ons/mpfb/) (MakeHuman cho Blender) với bộ tài sản hệ thống MakeHuman. Lưới người, da, quần áo, tóc đều là CC0, dùng thương mại không cần ghi nguồn.
- Khung xương `game_engine`, nữ khoảng 24 tuổi, gốc Á, đồ tập (áo croptop, quần legging, giày).

## Tệp

| Tệp | Việc |
| --- | --- |
| `build_human.py` | Dựng người mẫu, lưu `human.blend` |
| `poses.py` | Tư thế của từng nhóm động tác: hướng thân, tay, chân, dụng cụ, góc máy |
| `render_poses.py` | Đặt tư thế, thêm dụng cụ (tạ, ghế, bục, xà, tường, xe đạp, thảm), render PNG nền trong suốt vào `out/` |
| `export_webp.py` | Đổi `out/*.png` thành `public/poses/<tên>.webp` (512 px) và `<tên>-sm.webp` (192 px) |

Tên tư thế trùng với `PoseName` trong `src/components/Pose.tsx`; bài tập nào dùng tư thế nào xem `poseOf` và `stretchPose` trong file đó.

## Chạy lại

Cần Blender 4.2 trở lên (máy này: `D:\App\Blender\blender-4.5.14-windows-x64`). MPFB và bộ tài sản được cài vào thư mục người dùng riêng `D:\App\Blender\fitcoach-user` để không đụng cài đặt Blender thường ngày.

```powershell
$env:BLENDER_USER_RESOURCES = 'D:\App\Blender\fitcoach-user'
$blender = 'D:\App\Blender\blender-4.5.14-windows-x64\blender.exe'

# Lần đầu: cài MPFB rồi giải nén makehuman_system_assets_cc0.zip vào ...\fitcoach-user\extensions\.user\user_default\mpfb\data
& $blender --factory-startup -b --command extension install-file -r user_default -e add-on-mpfb-v2.0.18.zip

& $blender -b -P tools/human/build_human.py                                   # dựng người mẫu
& $blender -b tools/human/human.blend -P tools/human/render_poses.py -- --size 512 --samples 128   # mọi tư thế, khoảng 3 phút với RTX 3050
& $blender -b tools/human/human.blend -P tools/human/render_poses.py -- squat lunge                # chỉ vài tư thế
training/food/.venv/Scripts/python -I tools/human/export_webp.py
```

Thêm tư thế mới: khai báo trong `poses.py`, thêm hình người que dự phòng cùng tên vào `POSES` trong `Pose.tsx`, render, xuất WebP.
