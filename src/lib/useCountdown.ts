import { useEffect, useState } from 'react'

/**
 * Đếm ngược theo mốc thời gian kết thúc (không lệch khi tab bị chậm).
 * endAt = null: đang dừng. Trả về số giây còn lại, gọi onEnd đúng một lần khi hết giờ.
 */
export function useCountdown(endAt: number | null, onEnd: () => void) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (endAt === null) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(id)
  }, [endAt])
  const ended = endAt !== null && now >= endAt
  useEffect(() => {
    if (ended) onEnd()
    // onEnd là hàm mới mỗi lần render, chỉ cần chạy khi vừa hết giờ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ended])
  return endAt === null ? 0 : Math.max(0, Math.ceil((endAt - now) / 1000))
}

export const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
