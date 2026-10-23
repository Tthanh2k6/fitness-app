// Chép runtime wasm của MediaPipe từ node_modules sang public/ để app tự phục vụ, không phụ thuộc CDN
import { cpSync, existsSync, mkdirSync } from 'node:fs'

const from = 'node_modules/@mediapipe/tasks-vision/wasm'
const to = 'public/mediapipe/wasm'
if (!existsSync(from)) throw new Error('Thiếu @mediapipe/tasks-vision, hãy chạy npm install')
mkdirSync(to, { recursive: true })
cpSync(from, to, { recursive: true })
