import { ImageEmbedder } from '@mediapipe/tasks-vision'
import { EMBEDDER_MODEL_URL } from '../assets'
import { visionFileset } from '../vision'
import { dishByClass, type Dish } from './dishes'
import { predict, type FoodHead } from './head'

const HEAD_URL = '/models/food-head.json'

let embedder: Promise<ImageEmbedder> | null = null
let head: Promise<FoodHead | null> | null = null

function getEmbedder() {
  embedder ??= (async () => {
    const files = await visionFileset()
    const create = (delegate: 'GPU' | 'CPU') =>
      ImageEmbedder.createFromOptions(files, {
        baseOptions: { modelAssetPath: EMBEDDER_MODEL_URL, delegate },
        runningMode: 'IMAGE',
        l2Normalize: true,
      })
    try {
      return await create('GPU')
    } catch {
      return create('CPU')
    }
  })()
  embedder.catch(() => {
    embedder = null
  })
  return embedder
}

/** null nghĩa là chưa có model đã huấn luyện (chưa chạy training/food) */
export function loadFoodHead() {
  head ??= fetch(HEAD_URL)
    .then((r) => (r.ok && r.headers.get('content-type')?.includes('json') ? (r.json() as Promise<FoodHead>) : null))
    .catch(() => null)
  return head
}

export interface DishGuess {
  dish: Dish
  p: number
}

/** Nhận diện món trong ảnh. Trả về null nếu chưa có model. */
export async function recognizeDish(image: HTMLImageElement | HTMLCanvasElement): Promise<DishGuess[] | null> {
  const [h, e] = await Promise.all([loadFoodHead(), getEmbedder()])
  if (!h) return null
  const vec = e.embed(image).embeddings[0]?.floatEmbedding
  if (!vec) throw new Error('Không trích được đặc trưng ảnh')
  return predict(h, vec, 3).flatMap(({ label, p }) => {
    const dish = dishByClass(label)
    return dish ? [{ dish, p }] : []
  })
}
