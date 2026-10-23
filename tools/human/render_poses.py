# Đặt người mẫu (human.blend) vào từng tư thế rồi render ảnh nền trong suốt.
#   blender -b tools/human/human.blend -P tools/human/render_poses.py -- [tên tư thế ...] [--size 640] [--samples 64]
# Mỗi tư thế khai báo hướng của từng đoạn xương (thân, đùi, cẳng chân, tay...) trong poses.py.
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import poses  # noqa: E402

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def opt(name, default):
    return argv[argv.index(name) + 1] if name in argv else default
SIZE = int(opt('--size', '640'))
SAMPLES = int(opt('--samples', '64'))
OUT = opt('--out', os.path.join(HERE, 'out'))
only = [a for i, a in enumerate(argv) if not a.startswith('--') and (i == 0 or not argv[i - 1].startswith('--'))]
os.makedirs(OUT, exist_ok=True)

F, U, L = poses.F, poses.U, poses.L
scene = bpy.context.scene
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
meshes = [o for o in bpy.data.objects if o.type == 'MESH' and o.parent == arm]
ORDER = ['pelvis', 'spine_01', 'spine_02', 'spine_03', 'neck_01', 'head',
         'clavicle_l', 'upperarm_l', 'lowerarm_l', 'hand_l', 'clavicle_r', 'upperarm_r', 'lowerarm_r', 'hand_r',
         'thigh_l', 'calf_l', 'foot_l', 'ball_l', 'thigh_r', 'calf_r', 'foot_r', 'ball_r']


# ---------- Cảnh: máy quay, đèn, sàn bắt bóng ----------
def setup_scene():
    scene.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for kind in ('OPTIX', 'CUDA'):
        try:
            prefs.compute_device_type = kind
            prefs.get_devices()
            if any(d.type == kind for d in prefs.devices):
                for d in prefs.devices:
                    d.use = d.type == kind
                scene.cycles.device = 'GPU'
                print('DEVICE', kind)
                break
        except TypeError:
            continue
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 6
    scene.render.film_transparent = True
    scene.render.resolution_x = SIZE
    scene.render.resolution_y = SIZE
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Base Contrast'

    world = bpy.data.worlds.new('World') if not scene.world else scene.world
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get('Background')
    bg.inputs['Color'].default_value = (0.86, 0.88, 0.9, 1)
    bg.inputs['Strength'].default_value = 0.35

    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
    floor = bpy.context.active_object
    floor.name = 'Floor'
    floor.is_shadow_catcher = True

    cam_data = bpy.data.cameras.new('Cam')
    cam_data.lens = 60
    cam = bpy.data.objects.new('Cam', cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam

    def area(name, energy, size, color=(1, 1, 1)):
        d = bpy.data.lights.new(name, 'AREA')
        d.energy = energy
        d.size = size
        d.color = color
        o = bpy.data.objects.new(name, d)
        scene.collection.objects.link(o)
        return o
    lights = {
        'key': area('Key', 260, 2.5, (1.0, 0.96, 0.92)),
        'fill': area('Fill', 70, 3.0, (0.9, 0.94, 1.0)),
        'rim': area('Rim', 260, 1.5, (1.0, 1.0, 1.0)),
    }
    lights['rim'].data.use_shadow = False
    darken_hair()
    return cam, lights


def darken_hair():
    """Tóc và lông mày của bộ tài sản có màu nâu vàng, nhuộm đen nâu cho hợp người Việt"""
    for o in meshes:
        if not any(k in o.name for k in ('ponytail', 'eyebrow', 'eyelash')):
            continue
        for slot in o.material_slots:
            mat = slot.material
            if not mat or not mat.use_nodes:
                continue
            nt = mat.node_tree
            for node in list(nt.nodes):
                if node.type != 'BSDF_PRINCIPLED':
                    continue
                sock = node.inputs['Base Color']
                if not sock.is_linked:
                    sock.default_value = (0.03, 0.022, 0.018, 1)
                    continue
                src = sock.links[0].from_socket
                hsv = nt.nodes.new('ShaderNodeHueSaturation')
                hsv.inputs['Value'].default_value = 0.22
                hsv.inputs['Saturation'].default_value = 0.8
                nt.links.new(src, hsv.inputs['Color'])
                nt.links.new(hsv.outputs['Color'], sock)
                print('HAIR', o.name, mat.name)


def point_at(obj, target):
    d = (target - obj.location).normalized()
    obj.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


# ---------- Tạo dáng ----------
def reset_pose():
    for pb in arm.pose.bones:
        pb.matrix_basis = Matrix.Identity(4)
    arm.location = (0, 0, 0)
    arm.rotation_euler = (0, 0, 0)
    bpy.context.view_layer.update()


def aim(pb, d):
    """Xoay xương (ít nhất có thể) để trục dọc của nó chỉ theo hướng d trong không gian thế giới"""
    bpy.context.view_layer.update()
    m = pb.matrix.copy()
    y = m.col[1].xyz.normalized()
    q = y.rotation_difference(d.normalized())
    head = m.translation.copy()
    nm = q.to_matrix().to_4x4() @ m
    nm.translation = head
    pb.matrix = nm
    bpy.context.view_layer.update()


def twist(pb, deg):
    """Xoay xương quanh trục dọc của chính nó (vặn cổ tay, xoay đùi)"""
    bpy.context.view_layer.update()
    m = pb.matrix.copy()
    axis = m.col[1].xyz.normalized()
    head = m.translation.copy()
    nm = Matrix.Rotation(math.radians(deg), 4, axis) @ m
    nm.translation = head
    pb.matrix = nm
    bpy.context.view_layer.update()


def bone_point(name, end='tail'):
    pb = arm.pose.bones[name]
    return arm.matrix_world @ (pb.tail if end == 'tail' else pb.head)


def eval_points(step=7):
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for o in meshes:
        if o.hide_render:
            continue
        e = o.evaluated_get(dg)
        me = e.to_mesh()
        co = np.empty(len(me.vertices) * 3, dtype=np.float32)
        me.vertices.foreach_get('co', co)
        mw = np.array(e.matrix_world)
        world = co.reshape(-1, 3)[::step] @ mw[:3, :3].T + mw[:3, 3]
        pts.extend(Vector(p) for p in world)
        e.to_mesh_clear()
    return pts


def turn_chain(bone, a, b, d):
    """Xoay `bone` (cùng mọi xương con) để đoạn từ điểm a đến điểm b chỉ theo hướng d, giữ nguyên độ cong tự nhiên"""
    bpy.context.view_layer.update()
    cur = bone_point(b[0], b[1]) - bone_point(a[0], a[1])
    q = cur.normalized().rotation_difference(d.normalized())
    pb = arm.pose.bones[bone]
    m = pb.matrix.copy()
    head = m.translation.copy()
    nm = q.to_matrix().to_4x4() @ m
    nm.translation = head
    pb.matrix = nm
    bpy.context.view_layer.update()


FINGERS = [f'{f}_0{i}_{side}' for f in ('index', 'middle', 'ring', 'pinky') for i in (1, 2, 3) for side in 'lr']
HOLDS = ('dumbbells', 'bar', 'bike', 'seat')


def apply_pose(spec):
    reset_pose()
    dirs = dict(spec.get('dirs', {}))
    # Cổ tay mặc định thẳng theo cẳng tay; vai nhô lên khi giơ tay cao
    for side in 'lr':
        if f'lowerarm_{side}' in dirs and f'hand_{side}' not in dirs:
            dirs[f'hand_{side}'] = dirs[f'lowerarm_{side}']
        up = dirs.get(f'upperarm_{side}')
        if up is not None and f'clavicle_{side}' not in dirs:
            lat = 1 if side == 'l' else -1
            dirs[f'clavicle_{side}'] = (L * lat + U * max(0.0, up.dot(U)) * 0.35 + F * up.dot(F) * 0.12).normalized()
    # Thân xoay từ xương chậu nên hông, lưng và đùi đi theo; sau đó mới đặt chân tay theo hướng riêng
    if 'torso' in spec:
        turn_chain('pelvis', ('pelvis', 'head'), ('spine_03', 'tail'), spec['torso'])
    if 'chest' in spec:
        turn_chain('spine_02', ('spine_02', 'head'), ('spine_03', 'tail'), spec['chest'])
    for name in ORDER:
        if name == 'neck_01' and 'neck' in spec:
            turn_chain('neck_01', ('neck_01', 'head'), ('head', 'tail'), spec['neck'])
        if name in dirs:
            aim(arm.pose.bones[name], dirs[name])
        if name in spec.get('twist', {}):
            twist(arm.pose.bones[name], spec['twist'][name])
    # Nắm tay khi cầm tạ, xà, ghi đông
    props = spec.get('props', {})
    curl = 62 if any(k in props for k in HOLDS) else 18
    for n in FINGERS:
        arm.pose.bones[n].matrix_basis = Matrix.Rotation(math.radians(curl), 4, 'X')
    bpy.context.view_layer.update()
    # Xoay cả người để hai điểm chạm cùng nằm trên sàn (hít đất: bàn tay và mũi chân)
    if 'level' in spec:
        a, b = (bone_point(*n) for n in spec['level'])
        ab = b - a
        if ab.dot(F) < 0:
            ab = -ab
        ang = math.atan2(ab.dot(U), ab.dot(F))
        rot = Matrix.Rotation(ang, 4, L)
        arm.matrix_world = Matrix.Translation(a) @ rot @ Matrix.Translation(-a) @ arm.matrix_world
        bpy.context.view_layer.update()
    pts = eval_points()
    arm.location.z -= min(p.z for p in pts) - spec.get('lift', 0.0)
    bpy.context.view_layer.update()


# ---------- Dụng cụ ----------
PROPS = []


def material(name, color, rough=0.6, metal=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    return m


def srgb(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


def add(obj, mat):
    obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    PROPS.append(obj)
    return obj


def box(center, size, mat, axis_f=None):
    """Hộp có tâm `center`, kích thước (dọc F, ngang L, cao U)"""
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    o = bpy.context.active_object
    o.scale = (size[1], size[0], size[2])  # x = L, y = F
    bpy.ops.object.transform_apply(scale=True)
    bev = o.modifiers.new('Bevel', 'BEVEL')
    bev.width = min(0.012, min(size) / 4)
    bev.segments = 3
    return add(o, mat)


def cyl(a, b, r, mat, verts=24):
    """Ống tròn từ điểm a đến điểm b"""
    v = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=v.length, location=(a + b) / 2)
    o = bpy.context.active_object
    o.rotation_euler = v.to_track_quat('Z', 'Y').to_euler()
    return add(o, mat)


def clear_props():
    for o in PROPS:
        bpy.data.objects.remove(o, do_unlink=True)
    PROPS.clear()


def body_points():
    return eval_points(9)


def build_props(spec):
    props = spec.get('props', {})
    dark = material('PropDark', srgb('#26292E'), 0.55)
    metal = material('PropMetal', srgb('#8C9096'), 0.3, 0.9)
    rubber = material('PropRubber', srgb('#1B1D20'), 0.7)
    pts = body_points()
    if props.get('mat'):
        mat = material('Mat', srgb('#3A4046'), 0.85)
        fs = [p.dot(F) for p in pts]
        ls = [p.dot(L) for p in pts]
        c = F * (min(fs) + max(fs)) / 2 + L * (min(ls) + max(ls)) / 2
        box(c + U * 0.003, (max(fs) - min(fs) + 0.3, max(0.62, max(ls) - min(ls) + 0.12), 0.006), mat)
    if props.get('dumbbells'):
        for side in 'lr':
            k1 = bone_point(f'index_01_{side}', 'head')
            k2 = bone_point(f'pinky_01_{side}', 'head')
            tip = bone_point(f'middle_03_{side}', 'tail')
            center = (k1 + k2 + tip + bone_point(f'middle_01_{side}', 'head')) / 4
            axis = (k1 - k2).normalized()
            cyl(center - axis * 0.07, center + axis * 0.07, 0.015, metal)
            for sgn in (-1, 1):
                a = center + axis * sgn * 0.07
                cyl(a, a + axis * sgn * 0.055, 0.048, rubber, verts=6)
    if 'bench' in props:
        b = props['bench']
        p = bone_point(*b['under'])
        top = p.z - b.get('drop', 0.1)
        c = p - F * b.get('behind', 0.0)
        along = F if b['axis'] == 'F' else L
        across = L if b['axis'] == 'F' else F
        length, width = 1.15, 0.32
        center = Vector((c.x, c.y, top - 0.045))
        size = (length, width, 0.09) if b['axis'] == 'F' else (width, length, 0.09)
        box(center, size, dark)
        for sgn in (-1, 1):
            foot = Vector((c.x, c.y, 0)) + along * sgn * (length / 2 - 0.12)
            box(foot + U * (top - 0.09) / 2, (0.08, 0.26, top - 0.09) if b['axis'] == 'F' else (0.26, 0.08, top - 0.09), metal)
        del across
    if props.get('box'):
        foot = arm.pose.bones[props['box']]
        a = bone_point(props['box'], 'head')
        t = bone_point(props['box'], 'tail')
        top = min(a.z, t.z) - 0.05
        c = (a + t) / 2
        box(Vector((c.x, c.y, top / 2)), (0.5, 0.42, top), dark)
        del foot
    if props.get('wall'):
        back = min(p.dot(F) for p in pts) - 0.004
        mid = sum((p.dot(L) for p in pts), 0.0) / len(pts)
        wall = material('Wall', srgb('#D6D9D2'), 0.9)
        top = max(p.z for p in pts) + 0.12
        box(F * (back - 0.04) + L * mid + U * top / 2, (0.08, 0.95, top), wall)
    if props.get('bar'):
        hl, hr = bone_point('hand_l', 'tail'), bone_point('hand_r', 'tail')
        z = max(hl.z, hr.z) + 0.035
        c = (hl + hr) / 2
        c = Vector((c.x, c.y, z))
        cyl(c - L * 0.62, c + L * 0.62, 0.016, metal)
        for sgn in (-1, 1):
            e = c + L * sgn * 0.62
            cyl(Vector((e.x, e.y, 0)), e + U * 0.03, 0.03, dark)
    if props.get('seat'):
        pel = bone_point('pelvis', 'head')
        top = min(p.z for p in pts) - 0.002
        box(Vector((pel.x, pel.y, top - 0.045)) + F * 0.12, (0.5, 0.42, 0.09), dark)
        for sgn in (-1, 1):
            box(Vector((pel.x, pel.y, (top - 0.09) / 2)) + F * 0.12 + L * sgn * 0.17, (0.06, 0.06, top - 0.09), metal)
        back = min(p.dot(F) for p in pts)
        box(Vector((pel.x, pel.y, top + 0.33)) * 1 + F * (back - pel.dot(F) - 0.05), (0.08, 0.4, 0.6), dark)
    if props.get('bike'):
        pel = bone_point('pelvis', 'head')
        seat_z = min(p.z for p in pts if (p - pel).length < 0.25) - 0.01
        hands = (bone_point('hand_l', 'tail') + bone_point('hand_r', 'tail')) / 2
        crank = (bone_point('foot_l', 'head') + bone_point('foot_r', 'head')) / 2
        crank = Vector((pel.x, crank.y, crank.z - 0.04)) if False else Vector((crank.x, crank.y, crank.z - 0.05))
        seat = Vector((pel.x, pel.y, seat_z))
        box(seat - U * 0.03, (0.26, 0.17, 0.06), rubber)
        base_back = Vector((seat.x, seat.y, 0.03)) - F * 0.15
        base_front = Vector((hands.x, hands.y, 0.03)) + F * 0.12
        cyl(base_back, base_front, 0.03, dark)
        cyl(seat - U * 0.06, Vector((seat.x, seat.y, 0.03)) + F * 0.05, 0.025, dark)
        bar = Vector((hands.x, hands.y, hands.z - 0.02))
        cyl(Vector((base_front.x, base_front.y, 0.03)) - F * 0.1, bar - F * 0.04, 0.025, dark)
        cyl(bar - L * 0.22, bar + L * 0.22, 0.016, metal)
        wheel = Vector((base_front.x, base_front.y, 0.27)) - F * 0.16
        cyl(wheel - L * 0.025, wheel + L * 0.025, 0.24, dark, verts=48)
        cyl(crank - L * 0.09, crank + L * 0.09, 0.05, metal)



# ---------- Khung hình ----------
def prop_points():
    pts = []
    for o in PROPS:
        pts.extend(o.matrix_world @ Vector(c) for c in o.bound_box)
    return pts


def frame(cam, lights, spec):
    from bpy_extras.object_utils import world_to_camera_view
    pts = eval_points(11) + [p for p in prop_points() if not spec.get('props', {}).get('mat') or p.z > 0.02]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    target = (lo + hi) / 2
    yaw = math.radians(spec.get('yaw', 35))
    elev = math.radians(spec.get('elev', 8))
    # yaw 0: nhìn nghiêng từ bên phải người tập (người quay mặt sang phải ảnh); 90: nhìn thẳng mặt
    horiz = (-L * math.cos(yaw) + F * math.sin(yaw)).normalized()
    direction = (horiz * math.cos(elev) + U * math.sin(elev)).normalized()
    dist = 5.0
    margin = spec.get('margin', 0.1)
    for _ in range(6):
        cam.location = target + direction * dist
        point_at(cam, target)
        bpy.context.view_layer.update()
        uv = [world_to_camera_view(scene, cam, p) for p in pts]
        x0, x1 = min(p.x for p in uv), max(p.x for p in uv)
        y0, y1 = min(p.y for p in uv), max(p.y for p in uv)
        span = max(x1 - x0, y1 - y0)
        dist *= span / (1 - 2 * margin)
        # Dời tâm về giữa khung
        right = cam.matrix_world.col[0].xyz
        up = cam.matrix_world.col[1].xyz
        w = 2 * dist * math.tan(cam.data.angle / 2)
        target += right * ((x0 + x1) / 2 - 0.5) * w + up * ((y0 + y1) / 2 - 0.5) * w
    cam.location = target + direction * dist
    point_at(cam, target)
    # Đèn đặt theo máy quay để mọi ảnh sáng giống nhau
    right = cam.matrix_world.col[0].xyz
    toward = direction
    s = dist
    lights['key'].location = target + (toward * 0.9 - right * 1.1 + U * 1.2) * s * 0.6
    lights['fill'].location = target + (toward * 1.0 + right * 1.3 + U * 0.2) * s * 0.6
    lights['rim'].location = target + (-toward * 1.2 + right * 0.6 + U * 1.0) * s * 0.6
    for o in lights.values():
        point_at(o, target)
    bpy.context.view_layer.update()


cam, lights = setup_scene()
names = only or list(poses.POSES)
for name in names:
    spec = poses.POSES[name]
    clear_props()
    apply_pose(spec)
    build_props(spec)
    frame(cam, lights, spec)
    scene.render.filepath = os.path.join(OUT, f'{name}.png')
    bpy.ops.render.render(write_still=True)
    print('RENDERED', name)
