export interface Pt {
  x: number
  y: number
}

export const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y })
export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y })
export const scale = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k })
export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)
export const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

const deg = (rad: number) => (rad * 180) / Math.PI

/** Góc tại khớp b (độ, 0–180) giữa hai đoạn b→a và b→c */
export function angleAt(a: Pt, b: Pt, c: Pt) {
  const u = sub(a, b)
  const v = sub(c, b)
  const cos = (u.x * v.x + u.y * v.y) / (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y) || 1)
  return deg(Math.acos(Math.min(1, Math.max(-1, cos))))
}

/** Độ nghiêng (0–180) của đoạn from→to so với phương thẳng đứng hướng lên. Trục y của ảnh hướng xuống. */
export function tiltFromVertical(from: Pt, to: Pt) {
  const v = sub(to, from)
  return deg(Math.acos(Math.min(1, Math.max(-1, -v.y / (Math.hypot(v.x, v.y) || 1)))))
}

/**
 * Vector đơn vị theo góc tính từ hướng lên trên: 0° = lên, 90° = về phía mặt người tập,
 * -90° = ra sau lưng, 180° = xuống. facing = +1 nếu người quay mặt sang phải khung hình.
 */
export function dir(angleDeg: number, facing: 1 | -1): Pt {
  const r = (angleDeg * Math.PI) / 180
  return { x: facing * Math.sin(r), y: -Math.cos(r) }
}

/** Khoảng cách có dấu từ p tới đường thẳng a→b; dương khi p nằm phía dưới đường (y lớn hơn) */
export function signedDistanceBelow(p: Pt, a: Pt, b: Pt) {
  const ab = sub(b, a)
  const ap = sub(p, a)
  const cross = ab.x * ap.y - ab.y * ap.x
  const d = cross / (Math.hypot(ab.x, ab.y) || 1)
  return ab.x >= 0 ? d : -d
}
