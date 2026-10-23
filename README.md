# blender-assets

Thư mục người dùng Blender riêng cho công cụ người mẫu 3D (`tools/human` trên nhánh main): add-on MPFB 2.0.18 và bộ tài sản hệ thống MakeHuman (CC0), bỏ bớt da người già/trung niên, răng, lưỡi.

```bash
cat blender-assets/fitcoach-user.tar.gz.part-* | tar -xzf - -C /path/to/fitcoach-user
export BLENDER_USER_RESOURCES=/path/to/fitcoach-user
```

Bố cục sau khi giải nén: `extensions/user_default/mpfb` (mã add-on + targets), `extensions/.user/user_default/mpfb/data` (da, quần áo, tóc, mắt...), `config/userpref.blend`.
