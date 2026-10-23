/**
 * Lớp phân loại món ăn do nhóm tự huấn luyện, đặt trên vector đặc trưng của MobileNetV3.
 * File public/models/food-head.json do training/food/train_head.py sinh ra.
 */
export interface FoodHead {
  version: 1
  /** Tên model trích đặc trưng; app phải dùng đúng model này thì vector mới khớp */
  embedder: string
  /** Nhãn theo thứ tự lớp, là tên lớp của bộ ảnh (vd "Com tam") */
  labels: string[]
  dim: number
  /** Ma trận trọng số labels.length × dim, trải phẳng theo hàng */
  W: number[]
  b: number[]
  metrics?: { top1: number; top3: number; testImages: number }
}

export interface Guess {
  label: string
  p: number
}

/** logits = W·x + b, softmax, trả về `k` lớp có xác suất cao nhất */
export function predict(head: FoodHead, x: ArrayLike<number>, k = 3): Guess[] {
  const { labels, dim, W, b } = head
  if (x.length !== dim) throw new Error(`Vector đặc trưng có ${x.length} chiều, model cần ${dim}`)
  const logits = labels.map((_, c) => {
    let s = b[c]
    const row = c * dim
    for (let j = 0; j < dim; j++) s += W[row + j] * x[j]
    return s
  })
  const max = Math.max(...logits)
  const exp = logits.map((z) => Math.exp(z - max))
  const sum = exp.reduce((a, v) => a + v, 0)
  return labels
    .map((label, c) => ({ label, p: exp[c] / sum }))
    .sort((a, b2) => b2.p - a.p)
    .slice(0, k)
}
