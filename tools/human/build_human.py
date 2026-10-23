# Dựng người mẫu 3D cho hình minh hoạ động tác (chạy trong Blender, cần add-on MPFB và bộ tài sản hệ thống MakeHuman).
#   blender -b -P tools/human/build_human.py
# Toàn bộ lưới người, da, quần áo, tóc của MakeHuman đều là CC0, dùng thương mại được.
import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "human.blend")

# Bật add-on MPFB (cài ở thư mục người dùng riêng, xem README trong thư mục này)
import addon_utils  # noqa: E402

addon_utils.enable("bl_ext.user_default.mpfb", default_set=True, persistent=True)
from bl_ext.user_default.mpfb.services.humanservice import HumanService  # noqa: E402

# Cảnh trống
bpy.ops.wm.read_factory_settings(use_empty=True)
addon_utils.enable("bl_ext.user_default.mpfb", default_set=True, persistent=True)

human_info = {
    "name": "FitCoach",
    # Nữ khoảng 24 tuổi, dáng khoẻ, gốc Á
    "phenotype": {
        "gender": 0.0,
        "age": 0.48,
        "muscle": 0.62,
        "weight": 0.46,
        "proportions": 0.65,
        "height": 0.42,
        "cupsize": 0.45,
        "firmness": 0.6,
        "race": {"asian": 0.85, "caucasian": 0.15, "african": 0.0},
    },
    "rig": "game_engine",
    "eyes": "high-poly/high-poly.mhclo",
    "eyebrows": "eyebrow001/eyebrow001.mhclo",
    "eyelashes": "eyelashes01/eyelashes01.mhclo",
    "tongue": "",
    "teeth": "",
    "hair": "ponytail01/ponytail01.mhclo",
    "proxy": "",
    "targets": [],
    "clothes": ["female_sportsuit01/female_sportsuit01.mhclo", "shoes02/shoes02.mhclo"],
    "skin_mhmat": "young_asian_female/young_asian_female.mhmat",
    "skin_material_type": "ENHANCED_SSS",
    "eyes_material_type": "PROCEDURAL_EYES",
    "skin_material_settings": {},
    "eyes_material_settings": {},
    "expressions": [],
}

settings = HumanService.get_default_deserialization_settings()
settings["subdiv_levels"] = 1
basemesh = HumanService.deserialize_from_dict(human_info, settings)
print("HUMAN", basemesh.name, [o.name for o in bpy.data.objects])

bpy.ops.wm.save_as_mainfile(filepath=OUT)
print("SAVED", OUT)
sys.exit(0)
