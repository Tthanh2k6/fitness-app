import { useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarDays, Camera, Salad, Sparkles } from 'lucide-react'
import { ActionBar, Body, Page } from '../components/ui'
import { PLATE, type Plate } from '../data/muscles'
import { useProfile } from '../profile'

const FEATURES: { Icon: typeof Camera; tone: Plate; title: string; desc: string }[] = [
  { Icon: CalendarDays, tone: 'red', title: 'Lịch tập riêng', desc: 'Theo mục tiêu, số buổi và dụng cụ bạn có' },
  { Icon: Camera, tone: 'blue', title: 'Camera đếm lần', desc: 'Nhắc ngay khi gối chụm hay lưng cong' },
  { Icon: Salad, tone: 'green', title: 'Ăn đúng mà không đắt', desc: 'Gợi ý món Việt theo calo và ngân sách ngày' },
]

// Hai bên thanh đòn: đĩa lớn nhất ngoài cùng, nhỏ dần vào giữa
const LEFT: [Plate, number][] = [['red', 30], ['blue', 66], ['yellow', 98], ['green', 126]]
const RIGHT: [Plate, number][] = [['red', 290], ['blue', 258], ['yellow', 230], ['green', 206]]
const PH = [200, 180, 158, 136]
const PW = [32, 28, 24, 20]
const RISE = [100, 90, 79, 68]

export default function Welcome() {
  const nav = useNavigate()
  const { profile } = useProfile()
  return (
    <Page>
      <Body gap={22}>
        <div className="card hero" style={{ padding: 0, height: 330, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <svg width="350" height="330" viewBox="0 0 350 330" aria-hidden="true" style={{ maxWidth: '100%' }}>
            <rect x="-10" y="169" width="370" height="12" rx="6" fill="#9DA29B" opacity="0.5" />
            {LEFT.map(([c, x], i) => <rect key={c} x={x - 2} y={175 - RISE[i]} width={PW[i]} height={PH[i]} rx={9} fill={PLATE[c]} />)}
            {RIGHT.map(([c, x], i) => <rect key={c} x={x} y={175 - RISE[i]} width={PW[i]} height={PH[i]} rx={9} fill={PLATE[c]} />)}
            <rect x="150" y="163" width="50" height="24" rx="6" fill="#26292E" />
          </svg>
          <span className="tag on-hero" style={{ position: 'absolute', left: 16, top: 16 }}><Sparkles size={14} /> Tập ở nhà · 30 phút mỗi ngày</span>
        </div>
        <div className="col" style={{ gap: 10 }}>
          <h1 className="h1" style={{ fontSize: 34 }}>Tập ở nhà, có người chỉnh dáng.</h1>
          <p className="muted">FitCoach lên lịch theo giờ rảnh của bạn, đếm lần và sửa tư thế qua camera, gợi ý món ăn vừa túi tiền.</p>
        </div>
        <div className="col" style={{ gap: 14 }}>
          {FEATURES.map(({ Icon, tone, title, desc }) => (
            <div key={title} className="feat">
              <span className="fi" style={{ background: `var(--${tone}-soft)`, color: `var(--${tone}-ink)` }}><Icon size={20} /></span>
              <div><p className="h3">{title}</p><p className="small muted">{desc}</p></div>
            </div>
          ))}
        </div>
      </Body>
      <ActionBar column>
        <button className="btn wide" onClick={() => nav('/auth')}>Bắt đầu, mất 2 phút <ArrowRight size={18} /></button>
        <button className="btn wide" style={{ background: 'transparent', color: 'var(--ink)' }}
          onClick={() => nav(profile.onboarded ? '/home' : '/auth?mode=login')}>
          Tôi đã có tài khoản
        </button>
      </ActionBar>
    </Page>
  )
}
