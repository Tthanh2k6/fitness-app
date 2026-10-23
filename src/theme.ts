import { useCallback, useEffect, useState } from 'react'

export type ThemeChoice = 'light' | 'dark' | 'auto'

const KEY = 'fitcoach.theme'
const media = () => (typeof matchMedia === 'undefined' ? null : matchMedia('(prefers-color-scheme: dark)'))

function read(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'auto'
  } catch {
    return 'auto'
  }
}

function apply(choice: ThemeChoice) {
  const root = document.documentElement
  if (choice === 'auto') delete root.dataset.theme
  else root.dataset.theme = choice
}

/** Giao diện sáng/tối: chọn tay hoặc theo hệ thống. `dark` là giao diện đang hiển thị thật. */
export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(read)
  const [systemDark, setSystemDark] = useState(() => media()?.matches ?? false)

  useEffect(() => {
    const m = media()
    if (!m) return
    const on = () => setSystemDark(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])

  const set = useCallback((v: ThemeChoice) => {
    apply(v)
    setChoice(v)
    try {
      if (v === 'auto') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, v)
    } catch {
      // không lưu được thì chỉ đổi cho lần mở này
    }
  }, [])

  return { choice, dark: choice === 'dark' || (choice === 'auto' && systemDark), set }
}
