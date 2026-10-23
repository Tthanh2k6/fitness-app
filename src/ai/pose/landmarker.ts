import { PoseLandmarker } from '@mediapipe/tasks-vision'
import { POSE_MODEL_URL } from '../assets'
import { visionFileset } from '../vision'

let instance: Promise<PoseLandmarker> | null = null

/** Dùng chung một PoseLandmarker cho cả app; thử GPU trước, máy không hỗ trợ thì chạy CPU */
export function getPoseLandmarker() {
  instance ??= (async () => {
    const files = await visionFileset()
    const create = (delegate: 'GPU' | 'CPU') =>
      PoseLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate },
        runningMode: 'VIDEO',
        numPoses: 1,
      })
    try {
      return await create('GPU')
    } catch {
      return create('CPU')
    }
  })()
  instance.catch(() => {
    instance = null
  })
  return instance
}
