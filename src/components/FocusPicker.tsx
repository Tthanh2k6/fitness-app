import { useState } from 'react'
import { Check } from 'lucide-react'
import type { Muscle } from 'react-body-highlighter'
import BodyMap from './BodyMap'
import { Seg } from './ui'

type Side = 'anterior' | 'posterior'

const GROUPS: { label: string; hint: string; muscles: Muscle[] }[] = [
  { label: 'Ngực', hint: 'Cơ ngực', muscles: ['chest'] },
  { label: 'Lưng', hint: 'Lưng trên, lưng dưới, cầu vai', muscles: ['upper-back', 'lower-back', 'trapezius'] },
  { label: 'Vai', hint: 'Vai trước, vai sau', muscles: ['front-deltoids', 'back-deltoids'] },
  { label: 'Tay', hint: 'Tay trước, tay sau, cẳng tay', muscles: ['biceps', 'triceps', 'forearm'] },
  { label: 'Bụng', hint: 'Bụng, eo', muscles: ['abs', 'obliques'] },
  { label: 'Mông', hint: 'Cơ mông', muscles: ['gluteal', 'abductors'] },
  { label: 'Chân', hint: 'Đùi trước, đùi sau, đùi trong, bắp chân', muscles: ['quadriceps', 'hamstring', 'adductor', 'calves', 'left-soleus', 'right-soleus'] },
]

const DETAIL: { m: Muscle; also?: Muscle[]; label: string; side: Side }[] = [
  { m: 'chest', label: 'Ngực', side: 'anterior' },
  { m: 'front-deltoids', label: 'Vai trước', side: 'anterior' },
  { m: 'biceps', label: 'Tay trước', side: 'anterior' },
  { m: 'forearm', label: 'Cẳng tay', side: 'anterior' },
  { m: 'abs', label: 'Bụng', side: 'anterior' },
  { m: 'obliques', label: 'Eo', side: 'anterior' },
  { m: 'quadriceps', label: 'Đùi trước', side: 'anterior' },
  { m: 'adductor', label: 'Đùi trong', side: 'anterior' },
  { m: 'trapezius', label: 'Cầu vai', side: 'posterior' },
  { m: 'back-deltoids', label: 'Vai sau', side: 'posterior' },
  { m: 'upper-back', label: 'Lưng trên', side: 'posterior' },
  { m: 'lower-back', label: 'Lưng dưới', side: 'posterior' },
  { m: 'triceps', label: 'Tay sau', side: 'posterior' },
  { m: 'gluteal', also: ['abductors'], label: 'Mông', side: 'posterior' },
  { m: 'hamstring', label: 'Đùi sau', side: 'posterior' },
  { m: 'calves', also: ['left-soleus', 'right-soleus'], label: 'Bắp chân', side: 'posterior' },
]
// also: các mảng cơ nhỏ cùng vùng, chọn kèm để hình được tô kín
const musclesOf = (d: (typeof DETAIL)[number]) => [d.m, ...(d.also ?? [])]
const ALL = DETAIL.flatMap(musclesOf)

/** Ô đánh dấu tròn: đen khi chọn, viền khi chưa */
function Tick({ on, size = 22 }: { on: boolean; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full"
      style={{ width: size, height: size, background: on ? 'var(--ink)' : 'transparent', color: 'var(--bg)', boxShadow: on ? 'none' : 'inset 0 0 0 2px var(--line)' }}>
      {on && <Check size={size * 0.6} strokeWidth={3.2} />}
    </span>
  )
}

export default function FocusPicker({ value, onChange }: { value: Muscle[]; onChange: (v: Muscle[]) => void }) {
  const [mode, setMode] = useState<'simple' | 'detail'>('simple')
  const [side, setSide] = useState<Side>('anterior')
  const allOn = ALL.every((m) => value.includes(m))

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="row">
        <Seg className="grow" options={[{ v: 'simple', label: 'Đơn giản' }, { v: 'detail', label: 'Chi tiết' }]} value={mode} onChange={setMode} />
        <button className={`choice ${allOn ? 'on' : ''}`} style={{ height: 46 }} onClick={() => onChange(allOn ? [] : ALL)}>
          {allOn ? 'Bỏ chọn hết' : 'Chọn tất cả'}
        </button>
      </div>
      {mode === 'simple' ? <Simple value={value} onChange={onChange} /> : <Detail value={value} onChange={onChange} side={side} setSide={setSide} />}
    </div>
  )
}

function Simple({ value, onChange }: { value: Muscle[]; onChange: (v: Muscle[]) => void }) {
  const toggle = (g: (typeof GROUPS)[number]) => {
    const on = value.includes(g.muscles[0])
    onChange(on ? value.filter((m) => !g.muscles.includes(m)) : [...new Set([...value, ...g.muscles])])
  }
  return (
    <div className="step-in col" style={{ gap: 10 }}>
      <div className="card" style={{ padding: '14px 0 12px', gap: 6 }}>
        <BodyMap primary={value} plate="red" size={112} />
        <div className="xs muted flex justify-center" style={{ gap: 88 }}><span>Trước</span><span>Sau</span></div>
      </div>
      <div className="grid2" style={{ gap: 8, gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
        {GROUPS.map((g, i) => {
          const on = value.includes(g.muscles[0])
          return (
            <button key={g.label} onClick={() => toggle(g)} aria-pressed={on}
              className={`opt ${on ? 'on' : ''}`} style={{ padding: 12, gap: 10, gridColumn: i === GROUPS.length - 1 && GROUPS.length % 2 ? 'span 2' : undefined }}>
              <Tick on={on} />
              <span className="grow col">
                <b style={{ fontWeight: 600 }}>{g.label}</b>
                <span className="xs muted">{g.hint}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Detail({ value, onChange, side, setSide }: {
  value: Muscle[]; onChange: (v: Muscle[]) => void; side: Side; setSide: (s: Side) => void
}) {
  const toggle = (d: (typeof DETAIL)[number]) => {
    const ms = musclesOf(d)
    onChange(value.includes(d.m) ? value.filter((x) => !ms.includes(x)) : [...new Set([...value, ...ms])])
  }
  const items = (s: Side) => DETAIL.filter((d) => d.side === s)
  const count = (s: Side) => items(s).filter((d) => value.includes(d.m)).length

  return (
    <div className="step-in col" style={{ gap: 10 }}>
      <Seg value={side} onChange={setSide} options={(['anterior', 'posterior'] as const).map((s) => ({
        v: s,
        label: <>{s === 'anterior' ? 'Mặt trước' : 'Mặt sau'} <span className="num" style={{ fontSize: 14, opacity: 0.7 }}>{count(s)}/{items(s).length}</span></>,
      }))} />
      <div key={side} className="step-in grid gap-2.5" style={{ gridTemplateColumns: '1fr 1.1fr' }}>
        <div className="card" style={{ alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
          <BodyMap primary={value} plate="red" views={[side]} size={132} />
        </div>
        <ul className="col" style={{ gap: 4 }}>
          {items(side).map((d) => {
            const on = value.includes(d.m)
            return (
              <li key={d.m} className="flex-1">
                <button onClick={() => toggle(d)} aria-pressed={on}
                  className="row h-full w-full" style={{ minHeight: 40, padding: '0 12px', borderRadius: 14, gap: 10, fontSize: 14, textAlign: 'left',
                    background: on ? 'var(--surface)' : 'transparent', fontWeight: on ? 600 : 500, boxShadow: on ? 'inset 0 0 0 1.5px var(--ink)' : 'none' }}>
                  <Tick on={on} size={20} />
                  {d.label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
