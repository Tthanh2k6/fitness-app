// Runtime wasm được app tự phục vụ (chép từ node_modules), model tải từ kho model chính thức của MediaPipe
export const WASM_BASE = '/mediapipe/wasm'
export const POSE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
export const EMBEDDER_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/image_embedder/mobilenet_v3_large/float32/1/mobilenet_v3_large.tflite'
