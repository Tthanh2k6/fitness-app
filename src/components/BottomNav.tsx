import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, ChartLine, ChevronRight, Dumbbell, House, Scale, ScanLine, Utensils } from 'lucide-react'
import Sheet from './Sheet'

export type Tab = 'home' | 'train' | 'meals' | 'progress'

const TABS: { id: Tab; to: string; label: string; Icon: typeof House }[] = [
  { id: 'home', to: '/home', label: 'Trang chủ', Icon: House },
  { id: 'train', to: '/train', label: 'Tập luyện', Icon: Dumbbell },
  { id: 'meals', to: '/meals', label: 'Bữa ăn', Icon: Utensils },
  { id: 'progress', to: '/progress', label: 'Tiến độ', Icon: ChartLine },
]

export default function BottomNav({ on }: { on: Tab }) {
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const go = (to: string) => {
    setOpen(false)
    nav(to)
  }
  const tab = (t: (typeof TABS)[number]) => (
    <Link key={t.id} to={t.to} className={on === t.id ? 'on' : ''} aria-current={on === t.id ? 'page' : undefined}>
      <t.Icon size={24} strokeWidth={on === t.id ? 2.3 : 1.8} />
      <span>{t.label}</span>
    </Link>
  )
  return (
    <>
      <nav className="nav" aria-label="Điều hướng chính">
        {tab(TABS[0])}
        {tab(TABS[1])}
        <button className="fab" onClick={() => setOpen(true)} aria-label="Dùng camera"><ScanLine size={26} /></button>
        {tab(TABS[2])}
        {tab(TABS[3])}
      </nav>
      <Sheet open={open} onClose={() => setOpen(false)} title="Dùng camera để">
        {[
          { Icon: Utensils, tone: 'green', t: 'Chụp món ăn', d: 'Biết calo và lời khuyên cho bữa này', to: '/scan' },
          { Icon: Camera, tone: 'blue', t: 'Chỉnh dáng khi tập', d: 'Đếm lần và sửa tư thế squat, lunge, hít đất, plank', to: '/coach' },
          { Icon: Scale, tone: 'yellow', t: 'Ghi cân nặng', d: 'Nhập cân nặng hôm nay', to: '/progress?log=weight' },
        ].map((x) => (
          <button key={x.t} className="ov-item" onClick={() => go(x.to)}>
            <span className="ch-ic" style={{ background: `var(--${x.tone}-soft)`, color: `var(--${x.tone}-ink)`, width: 46, height: 46 }}><x.Icon size={22} /></span>
            <span className="grow col"><b style={{ fontWeight: 600 }}>{x.t}</b><span className="xs muted">{x.d}</span></span>
            <ChevronRight size={18} className="chev" />
          </button>
        ))}
        <button className="btn ghost" onClick={() => setOpen(false)}>Đóng</button>
      </Sheet>
    </>
  )
}
