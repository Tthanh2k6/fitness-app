import { FilesetResolver } from '@mediapipe/tasks-vision'
import { WASM_BASE } from './assets'

type WasmFileset = Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>

let fileset: Promise<WasmFileset> | null = null

export function visionFileset() {
  fileset ??= FilesetResolver.forVisionTasks(WASM_BASE)
  return fileset
}
