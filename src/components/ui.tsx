import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, CircleCheck } from 'lucide-react'
import { MUSCLE, PLATE, type Group, type Plate } from '../data/muscles'
import BottomNav, { type Tab } from './BottomNav'

/**
 * Khung một màn hình. `nav` hiện thanh điều hướng dưới (5 ô, nút giữa mở camera),
 * `cam` là màn tối (đang tập, camera, tổng kết).
 */
export function Page({ children, nav, cam = false, className = '' }: { children: ReactNode; nav?: Tab; cam?: boolean; className?: string }) {
  // Mở màn mới luôn bắt đầu từ đầu trang
  // Chrome mới trả về Promise từ scrollTo, không được để effect trả về giá trị đó
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <div className={`page ${cam ? 'cam' : ''} ${nav ? 'has-nav' : ''} ${className}`}>
      {children}
      {nav && <BottomNav on={nav} />}
    </div>
  )
}

/** Phần nội dung cuộn của màn, cách lề 20px, các khối cách nhau 14px */
export function Body({ children, gap, className = '', style }: { children: ReactNode; gap?: number; className?: string; style?: CSSProperties }) {
  return <div className={`body ${className}`} style={{ ...(gap !== undefined ? { gap } : null), ...style }}>{children}</div>
}

/** Thanh nút cố định dưới đáy màn (không dùng cùng thanh điều hướng) */
export function ActionBar({ children, column = false }: { children: ReactNode; column?: boolean }) {
  return <div className="actionbar" style={column ? { flexDirection: 'column', gap: 6 } : undefined}>{children}</div>
}

export function BackButton({ to, glass = false, label = 'Quay lại' }: { to?: string; glass?: boolean; label?: string }) {
  const nav = useNavigate()
  return (
    <button className={`icon-btn ${glass ? 'glass' : ''}`} onClick={() => (to ? nav(to) : window.history.length > 1 ? nav(-1) : nav('/home'))} aria-label={label}>
      <ChevronLeft size={22} />
    </button>
  )
}

/** Tiêu đề màn phụ: nút quay lại, tên màn, một nút bên phải */
export function TitleBar({ title, back, right }: { title: string; back?: string; right?: ReactNode }) {
  return (
    <header className="row">
      <BackButton to={back} />
      <h1 className="h1 grow" style={{ fontSize: 26 }}>{title}</h1>
      {right}
    </header>
  )
}

export function Seg<T extends string | number>({ options, value, onChange, className = '', style, small = false }: {
  options: { v: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; className?: string; style?: CSSProperties; small?: boolean
}) {
  return (
    <div className={`seg ${className}`} role="tablist" style={style}>
      {options.map((o) => (
        <button key={String(o.v)} role="tab" aria-selected={value === o.v} className={value === o.v ? 'on' : ''}
          style={small ? { height: 32 } : undefined} onClick={() => onChange(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button className={`toggle ${on ? 'on' : ''}`} role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}>
      <i />
    </button>
  )
}

/** Nhãn nhóm cơ: vạch màu đĩa tạ + tên */
export function MuscleTag({ group }: { group: Group }) {
  const m = MUSCLE[group]
  return <span className="mtag"><i style={{ background: PLATE[m.plate] }} />{m.label}</span>
}

/** Vạch màu đĩa tạ đứng (dùng trong lựa chọn mục tiêu, chú thích) */
export function PlateMini({ c, h = 20 }: { c: Plate; h?: number }) {
  return <i className="plate" style={{ background: PLATE[c], height: h }} />
}

export { default as Sheet } from './Sheet'

const ToastContext = createContext<(msg: string) => void>(() => {})

/** Thông báo nhỏ tự ẩn sau 2,2 giây: const toast = useToast(); toast('Đã lưu') */
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<{ text: string; id: number } | null>(null)
  const timer = useRef<number>(0)
  const show = useCallback((text: string) => {
    window.clearTimeout(timer.current)
    setMsg({ text, id: Date.now() })
    timer.current = window.setTimeout(() => setMsg(null), 2200)
  }, [])
  return (
    <ToastContext.Provider value={show}>
      {children}
      {msg && createPortal(
        <div key={msg.id} className="toast" role="status"><CircleCheck size={18} /><span>{msg.text}</span></div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

/** Số kiểu Việt Nam: 6.842 · 61,4 */
export const vn = (n: number, digits = 0) => n.toLocaleString('vi-VN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
