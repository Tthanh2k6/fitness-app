import { useCallback, useEffect, useState } from 'react'

const KEY = 'fitcoach.voice'

const findVoice = () =>
  typeof speechSynthesis === 'undefined'
    ? undefined
    : speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('vi'))

/** Giọng đọc tiếng Việt của trình duyệt (Web Speech). Máy không có giọng tiếng Việt thì tự tắt. */
export function useVietnameseVoice() {
  const [voice, setVoice] = useState(findVoice)
  const [on, setOn] = useState(() => {
    try {
      return localStorage.getItem(KEY) !== 'off'
    } catch {
      return true
    }
  })

  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return
    // Danh sách giọng thường được nạp trễ sau khi trang mở
    const load = () => setVoice(findVoice())
    speechSynthesis.addEventListener('voiceschanged', load)
    return () => speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  const toggle = useCallback(() => {
    setOn((prev) => {
      try {
        localStorage.setItem(KEY, prev ? 'off' : 'on')
      } catch {
        // không lưu được thì chỉ áp dụng cho lần mở này
      }
      if (prev) speechSynthesis.cancel()
      return !prev
    })
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!on || !voice) return
      speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.voice = voice
      u.lang = voice.lang
      u.rate = 1.1
      speechSynthesis.speak(u)
    },
    [on, voice],
  )

  return { available: Boolean(voice), on, toggle, speak }
}
