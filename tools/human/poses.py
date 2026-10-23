# Tư thế của người mẫu cho từng nhóm động tác (tên trùng với PoseName trong src/components/Pose.tsx).
# Hướng viết theo khung của người mẫu lúc đứng thẳng:
#   f = phía trước mặt, u = lên trên, l = sang trái người mẫu (âm là sang phải).
#   s(độ) là hướng trong mặt phẳng nhìn nghiêng: 0 = ra trước, 90 = lên, -90 = xuống, 180 = ra sau.
# Khoá của một tư thế:
#   torso / chest / neck: hướng thân (hông → vai), ngực, đầu; dirs: hướng từng xương tay chân;
#   twist: xoay xương quanh trục của nó (độ); level: hai điểm cùng chạm sàn; lift: nhấc cả người lên (m);
#   props: dụng cụ; yaw: góc máy (0 nhìn nghiêng từ bên phải, 90 nhìn thẳng mặt); elev: góc nhìn từ trên xuống.
import math

from mathutils import Vector

F = Vector((0, -1, 0))
U = Vector((0, 0, 1))
L = Vector((1, 0, 0))


def d(f, u, l=0.0):
    return (F * f + U * u + L * l).normalized()


def s(deg, l=0.0):
    r = math.radians(deg)
    return d(math.cos(r), math.sin(r), l)


FLAT = s(-28)  # bàn chân đặt phẳng trên sàn (từ cổ chân đến gốc ngón)


def pair(bone, left, right=None):
    """Cặp xương trái/phải; right mặc định là left đối xứng qua mặt giữa"""
    if right is None:
        right = Vector((-left.x, left.y, left.z))
    return {bone + '_l': left, bone + '_r': right}


def sym(bone, deg, spread):
    return pair(bone, s(deg, spread))


def merge(*parts):
    out = {}
    for p in parts:
        out.update(p)
    return out


STAND_LEGS = merge(sym('thigh', -90, 0.06), sym('calf', -90, 0.02), pair('foot', d(1, -0.53, 0.12)))
ARMS_DOWN = merge(sym('upperarm', -88, 0.14), sym('lowerarm', -80, 0.06))
FLOOR_HANDS = pair('hand', d(1, -0.05, 0.1))

POSES = {
    'stand': {'dirs': merge(STAND_LEGS, ARMS_DOWN), 'yaw': 35},

    # ---------- Chân & mông ----------
    'squat': {
        'torso': s(55),
        'dirs': merge(sym('thigh', 5, 0.3), sym('calf', -112, 0.08), pair('foot', d(1, -0.53, 0.3)),
                      sym('upperarm', 2, 0.08), sym('lowerarm', 2, 0.05)),
        'yaw': 30,
    },
    'lunge': {
        'torso': s(86),
        'dirs': merge(
            {'thigh_r': s(-6, -0.12), 'calf_r': s(-92, -0.04), 'foot_r': d(1, -0.53, -0.1)},
            {'thigh_l': s(-118, 0.12), 'calf_l': s(-168, 0.04), 'foot_l': s(-62, 0.05)},
            sym('upperarm', -92, 0.2), sym('lowerarm', -88, 0.1)),
        'yaw': 25,
    },
    'hipthrust': {
        'torso': s(178), 'neck': s(150),
        'dirs': merge(sym('thigh', 2, 0.22), sym('calf', -92, 0.08), pair('foot', d(1, -0.53, 0.15)),
                      pair('upperarm', d(-0.25, 0.05, 1)), pair('lowerarm', d(-0.3, 0.05, 1))),
        'props': {'bench': {'under': ('spine_03', 'head'), 'axis': 'L', 'drop': 0.1}},
        'yaw': 20, 'elev': 14,
    },
    'rdl': {
        'torso': s(16),
        'dirs': merge(sym('thigh', -98, 0.08), sym('calf', -84, 0.03), pair('foot', d(1, -0.53, 0.08)),
                      sym('upperarm', -90, 0.1), sym('lowerarm', -90, 0.06)),
        'props': {'dumbbells': True}, 'yaw': 25,
    },
    'stepup': {
        'torso': s(84),
        'dirs': merge(
            {'thigh_r': s(-22, -0.1), 'calf_r': s(-98, -0.03), 'foot_r': d(1, -0.53, -0.08)},
            {'thigh_l': s(-100, 0.08), 'calf_l': s(-104, 0.03), 'foot_l': s(-58, 0.05)},
            {'upperarm_l': s(-62, 0.15), 'lowerarm_l': s(25, 0.1), 'upperarm_r': s(-118, -0.15), 'lowerarm_r': s(-95, -0.1)}),
        'props': {'box': 'foot_r'}, 'yaw': 28,
    },
    'calf': {
        'dirs': merge(sym('thigh', -90, 0.05), sym('calf', -90, 0.02), pair('foot', s(-68, 0.1)), pair('ball', s(-2, 0.1)),
                      sym('upperarm', -88, 0.16), sym('lowerarm', -80, 0.08)),
        'yaw': 30,
    },
    'wallsit': {
        'torso': s(90),
        'dirs': merge(sym('thigh', 0, 0.16), sym('calf', -90, 0.06), pair('foot', d(1, -0.53, 0.12)),
                      sym('upperarm', -78, 0.12), sym('lowerarm', -15, 0.08)),
        'props': {'wall': True}, 'yaw': 30,
    },
    'bridge': {
        'torso': s(-162), 'neck': s(-178),
        'dirs': merge(sym('thigh', 18, 0.18), sym('calf', -102, 0.06), pair('foot', d(1, -0.53, 0.1)),
                      sym('upperarm', -8, 0.3), sym('lowerarm', -2, 0.15)),
        'level': (('clavicle_r', 'tail'), ('foot_r', 'head')),
        'props': {'mat': True}, 'yaw': 22, 'elev': 16,
    },
    'kick': {
        'torso': s(2),
        'dirs': merge(sym('upperarm', -90, 0.12), sym('lowerarm', -90, 0.04), FLOOR_HANDS,
                      {'thigh_l': s(-92, 0.08), 'calf_l': s(-178, 0.05), 'foot_l': s(-172, 0.05),
                       'thigh_r': s(176, -0.08), 'calf_r': s(92, -0.03), 'foot_r': s(150, -0.03)}),
        'level': (('hand_l', 'head'), ('calf_l', 'head')),
        'props': {'mat': True}, 'yaw': 18, 'elev': 14,
    },
    'seated': {
        'torso': s(96),
        'dirs': merge(sym('thigh', 0, 0.1), sym('calf', 12, 0.05), pair('foot', s(80, 0.08)),
                      sym('upperarm', -96, 0.3), sym('lowerarm', -70, 0.1)),
        'lift': 0.46, 'props': {'seat': True}, 'yaw': 28,
    },

    # ---------- Thân trên ----------
    'pushup': {
        'torso': s(12),
        'dirs': merge(sym('thigh', 192, 0.05), sym('calf', 192, 0.02), pair('foot', s(-72, 0.05)), pair('ball', s(-5, 0.05)),
                      sym('upperarm', -90, 0.3), sym('lowerarm', -90, 0.18), FLOOR_HANDS),
        'level': (('hand_r', 'head'), ('ball_r', 'tail')),
        'props': {'mat': True}, 'yaw': 20, 'elev': 10,
    },
    'bench': {
        'torso': s(180), 'neck': s(178),
        'dirs': merge(sym('thigh', -28, 0.25), sym('calf', -96, 0.08), pair('foot', d(1, -0.53, 0.15)),
                      pair('upperarm', d(0, 1, 0.22)), pair('lowerarm', d(0, 1, 0.06))),
        'props': {'bench': {'under': ('spine_02', 'head'), 'axis': 'F', 'drop': 0.11}, 'dumbbells': True},
        'yaw': 22, 'elev': 16,
    },
    'press': {
        'dirs': merge(sym('thigh', -90, 0.1), sym('calf', -90, 0.04), pair('foot', d(1, -0.53, 0.15)),
                      pair('upperarm', d(0.04, 1, 0.42)), pair('lowerarm', d(0, 1, 0.1))),
        'props': {'dumbbells': True}, 'yaw': 62,
    },
    'pike': {
        'torso': s(-48), 'neck': s(-80),
        'dirs': merge(sym('thigh', -122, 0.08), sym('calf', -122, 0.03), pair('foot', s(-55, 0.05)), pair('ball', s(-10, 0.05)),
                      sym('upperarm', -52, 0.22), sym('lowerarm', -55, 0.12), FLOOR_HANDS),
        'level': (('hand_r', 'head'), ('ball_r', 'tail')),
        'props': {'mat': True}, 'yaw': 18, 'elev': 10,
    },
    'raise': {
        'dirs': merge(sym('thigh', -90, 0.08), sym('calf', -90, 0.03), pair('foot', d(1, -0.53, 0.14)),
                      pair('upperarm', d(0.06, 0.02, 1)), pair('lowerarm', d(0.12, 0.04, 1))),
        'props': {'dumbbells': True}, 'yaw': 66,
    },
    'row': {
        'torso': s(22),
        'dirs': merge(sym('thigh', -76, 0.12), sym('calf', -100, 0.04), pair('foot', d(1, -0.53, 0.12)),
                      pair('upperarm', d(-1, 0.22, 0.2)), pair('lowerarm', d(0.08, -1, 0.04))),
        'props': {'dumbbells': True}, 'yaw': 25,
    },
    'hang': {
        'dirs': merge(sym('thigh', -86, 0.05), sym('calf', -105, 0.02), pair('foot', s(-60, 0.05)),
                      pair('upperarm', d(0, 1, 0.42)), pair('lowerarm', d(0, 1, 0.12))),
        'lift': 0.18, 'props': {'bar': True}, 'yaw': 55,
    },
    'superman': {
        'torso': s(8), 'chest': s(20), 'neck': s(22),
        'dirs': merge(sym('thigh', 172, 0.08), sym('calf', 170, 0.04), pair('foot', s(165, 0.03)),
                      pair('upperarm', d(1, 0.22, 0.32)), pair('lowerarm', d(1, 0.22, 0.14))),
        'props': {'mat': True}, 'yaw': 20, 'elev': 14,
    },
    'curl': {
        'dirs': merge(STAND_LEGS, sym('upperarm', -94, 0.08), sym('lowerarm', 72, 0.05)),
        'props': {'dumbbells': True}, 'yaw': 32,
    },
    'dip': {
        'torso': s(94),
        'dirs': merge(sym('thigh', 0, 0.12), sym('calf', -88, 0.04), pair('foot', d(1, -0.53, 0.1)),
                      sym('upperarm', 176, 0.22), sym('lowerarm', -92, 0.12)),
        'props': {'bench': {'under': ('hand_r', 'head'), 'axis': 'L', 'drop': 0.02, 'behind': 0.12}}, 'yaw': 25,
    },

    # ---------- Bụng ----------
    'plank': {
        'torso': s(4),
        'dirs': merge(sym('thigh', 184, 0.06), sym('calf', 184, 0.02), pair('foot', s(-80, 0.05)), pair('ball', s(-5, 0.05)),
                      sym('upperarm', -90, 0.14), sym('lowerarm', 0, 0.08), pair('hand', d(1, 0, 0.05))),
        'level': (('upperarm_r', 'tail'), ('ball_r', 'tail')),
        'props': {'mat': True}, 'yaw': 18, 'elev': 10,
    },
    'deadbug': {
        'torso': s(180), 'neck': s(170),
        'dirs': {'upperarm_r': d(0, 1, -0.15), 'lowerarm_r': d(0, 1, -0.05),
                 'upperarm_l': d(-1, 0.3, 0.15), 'lowerarm_l': d(-1, 0.3, 0.1),
                 'thigh_l': d(0, 1, 0.1), 'calf_l': d(1, 0.02, 0.05), 'foot_l': s(60, 0.05),
                 'thigh_r': s(18, -0.08), 'calf_r': s(18, -0.04), 'foot_r': s(70, -0.04)},
        'props': {'mat': True}, 'yaw': 22, 'elev': 18,
    },
    'crunch': {
        'torso': s(146), 'chest': s(128), 'neck': s(115),
        'dirs': merge(sym('thigh', 48, 0.12), sym('calf', -72, 0.05), pair('foot', d(1, -0.53, 0.1)),
                      pair('upperarm', d(1, 0.25, 0.22)), pair('lowerarm', d(1, 0.3, 0.1))),
        'props': {'mat': True}, 'yaw': 20, 'elev': 14,
    },
    'legraise': {
        'torso': s(180), 'neck': s(175),
        'dirs': merge(sym('thigh', 72, 0.04), sym('calf', 72, 0.02), pair('foot', s(60, 0.03)),
                      pair('upperarm', d(1, -0.08, 0.2)), pair('lowerarm', d(1, -0.05, 0.12))),
        'props': {'mat': True}, 'yaw': 22, 'elev': 16,
    },
    'twist': {
        'torso': s(128), 'chest': s(118),
        'twist': {'spine_02': -18, 'spine_03': -18},
        'dirs': merge(sym('thigh', 42, 0.1), sym('calf', 2, 0.05), pair('foot', s(20, 0.08)),
                      pair('upperarm', d(0.7, -0.35, -0.45), d(0.7, -0.2, -0.8)), pair('lowerarm', d(0.6, 0.05, -0.75), d(0.65, 0.05, 0.6))),
        'props': {'mat': True}, 'yaw': 30, 'elev': 14,
    },

    # ---------- Cardio ----------
    'jack': {
        'dirs': merge(sym('thigh', -90, 0.4), sym('calf', -90, 0.32), pair('foot', d(1, -0.53, 0.3)),
                      pair('upperarm', d(0.05, 1, 0.55)), pair('lowerarm', d(0.05, 1, 0.42))),
        'yaw': 68,
    },
    'run': {
        'torso': s(80),
        'dirs': {'thigh_r': s(-18, -0.06), 'calf_r': s(-112, -0.02), 'foot_r': s(-40, -0.05),
                 'thigh_l': s(-118, 0.06), 'calf_l': s(-165, 0.02), 'foot_l': s(-110, 0.03),
                 'upperarm_l': s(-62, 0.12), 'lowerarm_l': s(28, 0.08),
                 'upperarm_r': s(-124, -0.12), 'lowerarm_r': s(-62, -0.1)},
        'yaw': 25,
    },
    'climber': {
        'torso': s(14),
        'dirs': merge(sym('upperarm', -90, 0.24), sym('lowerarm', -90, 0.14), FLOOR_HANDS,
                      {'thigh_l': s(193, 0.06), 'calf_l': s(193, 0.02), 'foot_l': s(-70, 0.05), 'ball_l': s(-5, 0.05),
                       'thigh_r': s(-26, -0.06), 'calf_r': s(-164, -0.03), 'foot_r': s(-120, -0.04)}),
        'level': (('hand_l', 'head'), ('ball_l', 'tail')),
        'props': {'mat': True}, 'yaw': 20, 'elev': 10,
    },
    'bike': {
        'torso': s(62),
        'dirs': {'thigh_r': s(-12, -0.12), 'calf_r': s(-105, -0.04), 'foot_r': s(-20, -0.05),
                 'thigh_l': s(-58, 0.12), 'calf_l': s(-82, 0.04), 'foot_l': s(-40, 0.05),
                 'upperarm_l': s(-22, 0.16), 'lowerarm_l': s(-18, 0.06), 'upperarm_r': s(-22, -0.16), 'lowerarm_r': s(-18, -0.06)},
        'props': {'bike': True}, 'yaw': 25,
    },

    # ---------- Giãn cơ ----------
    'fold': {
        'torso': s(32), 'neck': s(10),
        'dirs': merge(sym('thigh', 0, 0.06), sym('calf', 0, 0.02), pair('foot', s(80, 0.05)),
                      sym('upperarm', -2, 0.12), sym('lowerarm', -4, 0.06)),
        'props': {'mat': True}, 'yaw': 22, 'elev': 12,
    },
    'quad': {
        'dirs': {'thigh_l': s(-90, 0.04), 'calf_l': s(-90, 0.02), 'foot_l': d(1, -0.53, 0.1),
                 'thigh_r': s(-94, -0.06), 'calf_r': s(102, -0.03), 'foot_r': s(150, -0.03),
                 'upperarm_r': s(-112, -0.18), 'lowerarm_r': s(-150, -0.08),
                 'upperarm_l': d(0.25, -0.1, 1), 'lowerarm_l': d(0.3, 0.05, 1)},
        'yaw': 30,
    },
    'arms': {
        'dirs': merge(STAND_LEGS, pair('upperarm', d(0.05, 0.03, 1)), pair('lowerarm', d(0.08, 0.05, 1))),
        'yaw': 66,
    },
    'hips': {
        'dirs': merge(STAND_LEGS, pair('upperarm', d(-0.3, -0.85, 0.5)), pair('lowerarm', d(0.5, -0.45, -0.75))),
        'yaw': 50,
    },
    'figure4': {
        'torso': s(180), 'neck': s(168),
        'dirs': {'thigh_l': s(55, 0.1), 'calf_l': s(-66, 0.05), 'foot_l': d(1, -0.53, 0.1),
                 'thigh_r': d(0.55, 0.6, 0.35), 'calf_r': d(0.15, -0.05, 1), 'foot_r': d(0.2, 0.6, 0.8),
                 'upperarm_l': d(0.65, 0.6, 0.2), 'lowerarm_l': d(0.85, 0.3, 0.05),
                 'upperarm_r': d(0.65, 0.6, -0.1), 'lowerarm_r': d(0.85, 0.3, 0.2)},
        'props': {'mat': True}, 'yaw': 25, 'elev': 18,
    },
    'child': {
        'torso': s(-20), 'neck': s(-25),
        'dirs': merge(sym('thigh', -32, 0.16), sym('calf', 182, 0.08), pair('foot', s(175, 0.05)),
                      sym('upperarm', -4, 0.16), sym('lowerarm', -6, 0.1), pair('hand', d(1, -0.02, 0.05))),
        'props': {'mat': True}, 'yaw': 22, 'elev': 16,
    },
}
