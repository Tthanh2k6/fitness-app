import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/** Bảng chọn trượt từ đáy màn hình, bấm nền tối để đóng */
export default function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])
  if (!open) return null
  return createPortal(
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ov-sheet" role="dialog" aria-modal="true">
        <i className="handle" style={{ marginBottom: 6 }} />
        {title && <p className="h3" style={{ padding: '0 4px 4px' }}>{title}</p>}
        {children}
      </div>
    </div>,
    document.body,
  )
}
