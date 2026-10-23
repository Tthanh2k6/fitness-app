import { useEffect, useId, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Dumbbell, Flame, Info, Minus, Pencil, Plus, Share2, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import Pose, { poseOf } from '../components/Pose'
import { Body, Page, Seg, Sheet, useToast, vn } from '../components/ui'
import { exById } from '../data/exercises'
import { MUSCLE, PLATE, PLATE_INK, PLATE_SOFT, type Group } from '../data/muscles'
import { addDays, isoDate, mondayOf, WEEKDAY_LONG, WEEKDAY_SHORT, weekdayIndex } from '../lib/format'
import { fromIso } from '../logic/challenges'
import { dayWork } from '../logic/daily'
import { isActive, mainGroup, streak } from '../logic/progress'
import { featLabel, personalRecords } from '../logic/records'
import type { WeekPlan } from '../logic/plan'
import { useToday } from '../logic/useToday'
import { hasWeightGoal, useProfile } from '../profile'
import type { Logs, Measure } from '../store'

type Period = 'week' | 'month' | 'quarter'

const kg1 = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 1 })
const dm = (iso: string) => `${Number(iso.slice(8))}/${Number(iso.slice(5, 7))}`

/** Chia sẻ bằng bảng chia sẻ của máy, không có thì chép vào bộ nhớ tạm */
async function shareText(text: string, toast: (m: string) => void) {
  try {
    if (navigator.share) return await navigator.share({ title: 'Tiến độ FitCoach', text })
    await navigator.clipboard.writeText(text)
    toast('Đã chép tóm tắt tiến độ')
  } catch {
    // người dùng huỷ chia sẻ
  }
}

export default function Progress() {
  const { update } = useProfile()
  const { profile, store, week, now, date, session } = useToday()
  const { logs } = store
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const [period, setPeriod] = useState<Period>('month')
  const [weighing, setWeighing] = useState(params.get('log') === 'weight')
  const [measuring, setMeasuring] = useState(false)

  // Ngày bắt đầu tính số buổi, calo; cửa sổ biểu đồ cân nặng
  const statStart = period === 'week' ? mondayOf(now) : period === 'month' ? new Date(now.getFullYear(), now.getMonth(), 1) : addDays(now, -89)
  const chartStart = addDays(now, period === 'week' ? -6 : period === 'month' ? -29 : -89)
  const sessionLabel = period === 'week' ? 'buổi tuần này' : period === 'month' ? `buổi tháng ${now.getMonth() + 1}` : 'buổi 3 tháng'

  let sessions = 0
  let kcal = 0
  for (let d = new Date(statStart); d <= now; d = addDays(d, 1)) {
    const iso = isoDate(d)
    const log = logs.days[iso]
    if (!isActive(log)) continue
    sessions++
    kcal += dayWork(log, profile, iso === date ? session : null).kcal
  }
  const chain = streak(logs, week, now)

  const share = () => {
    const w = logs.weights
    const lines = [
      `FitCoach · tiến độ đến ${now.getDate()}/${now.getMonth() + 1}`,
      `Chuỗi ${chain} buổi liền, ${sessions} ${sessionLabel}, đốt ${vn(kcal)} kcal.`,
      w.length >= 2 ? `Cân nặng ${kg1(w[0].kg)} → ${kg1(profile.weightKg)} kg.` : `Cân nặng ${kg1(profile.weightKg)} kg.`,
    ]
    void shareText(lines.join('\n'), toast)
  }

  const closeWeigh = () => {
    setWeighing(false)
    if (params.has('log')) setParams({}, { replace: true })
  }

  return (
    <Page nav="progress">
      <Body>
        <header className="row between">
          <h1 className="h1">Tiến độ</h1>
          <button className="icon-btn" aria-label="Chia sẻ tiến độ" onClick={share}><Share2 size={20} /></button>
        </header>
        <Seg<Period> options={[{ v: 'week', label: 'Tuần' }, { v: 'month', label: 'Tháng' }, { v: 'quarter', label: '3 tháng' }]} value={period} onChange={setPeriod} />

        <div className="stat3">
          {([
            [Flame, vn(chain), 'buổi liền', 'red'],
            [Dumbbell, vn(sessions), sessionLabel, 'blue'],
            [Zap, vn(kcal), 'kcal đã đốt', 'yellow'],
          ] as const).map(([Icon, v, l, c]) => (
            <div key={l}>
              <span style={{ color: `var(--${c}-ink)` }}><Icon size={18} /></span>
              <span className="num">{v}</span>
              <span className="xs muted">{l}</span>
            </div>
          ))}
        </div>

        <WeightCard logs={logs} start={chartStart} current={profile.weightKg} target={hasWeightGoal(profile) ? profile.targetKg : null}
          goalDown={profile.targetKg < profile.startKg || profile.goal === 'lose'} onLog={() => setWeighing(true)} />

        <MonthCard logs={logs} week={week} now={now} joinedAt={profile.joinedAt} />

        <GroupBalance logs={logs} week={week} now={now} />

        <MeasureCard measures={logs.measures} onEdit={() => setMeasuring(true)} />

        <RecordsCard logs={logs} />
      </Body>

      <WeightSheet open={weighing} onClose={closeWeigh} initial={profile.weightKg}
        onSave={(kg) => {
          store.logWeight(date, kg)
          update({ weightKg: kg })
          toast(`Đã ghi ${kg1(kg)} kg`)
          closeWeigh()
        }} />
      <MeasureSheet open={measuring} onClose={() => setMeasuring(false)} measures={logs.measures}
        onSave={(m) => {
          store.logMeasure({ date, ...m })
          toast('Đã cập nhật số đo')
          setMeasuring(false)
        }} />
    </Page>
  )
}

function WeightCard({ logs, start, current, target, goalDown, onLog }: {
  logs: Logs; start: Date; current: number; target: number | null; goalDown: boolean; onLog: () => void
}) {
  const gid = useId().replace(/:/g, '')
  const startIso = isoDate(start)
  // Mỗi ngày một điểm (lần ghi sau cùng)
  const all = [...new Map(logs.weights.map((w) => [w.date, w])).values()].sort((a, b) => a.date.localeCompare(b.date))
  // Lấy thêm lần cân gần nhất trước cửa sổ làm điểm xuất phát của đường
  const before = [...all].reverse().find((w) => w.date < startIso)
  const pts = [...(before ? [before] : []), ...all.filter((w) => w.date >= startIso)]
  const first = pts[0]
  const delta = first ? current - first.kg : 0
  const towardGoal = goalDown ? delta <= 0 : delta >= 0

  const today = new Date()
  const t0 = first ? fromIso(first.date) : start
  const span = Math.max(1, Math.round((today.getTime() - t0.getTime()) / 86400000))
  const kgs = pts.map((p) => p.kg)
  const showTarget = target !== null && pts.length >= 2 && target >= Math.min(...kgs) - 5 && target <= Math.max(...kgs) + 5
  const range = [...kgs, ...(showTarget ? [target!] : [])]
  const step = Math.max(...range) - Math.min(...range) > 6 ? 2 : 1
  const lo = Math.floor((Math.min(...range) - 0.3) / step) * step
  const hi = Math.ceil((Math.max(...range) + 0.3) / step) * step
  const X = (iso: string) => 34 + (Math.round((fromIso(iso).getTime() - t0.getTime()) / 86400000) / span) * 286
  const Y = (w: number) => 12 + ((hi - w) / Math.max(0.5, hi - lo)) * 128
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.date).toFixed(1)} ${Y(p.kg).toFixed(1)}`).join(' ')
  const ticks: number[] = []
  for (let w = hi; w >= lo; w -= step) ticks.push(w)
  const labels = [0, 0.25, 0.5, 0.75, 1].map((f) => addDays(t0, Math.round(span * f)))

  return (
    <section className="card">
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div>
          <p className="lbl">Cân nặng</p>
          <p><span className="num" style={{ fontSize: 44 }}>{kg1(current)}</span><span className="small muted"> kg</span></p>
          {first && Math.abs(delta) >= 0.05 && (
            <span className={`delta ${towardGoal ? '' : 'up'}`}>
              {delta < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />} {kg1(Math.abs(delta))} kg từ {dm(first.date)}
            </span>
          )}
        </div>
        <button className="btn sm ghost" onClick={onLog}><Plus size={16} /> Ghi cân</button>
      </div>
      {pts.length >= 2 ? (
        <svg width="100%" viewBox="0 0 330 168" role="img" aria-label={`Biểu đồ cân nặng từ ${kg1(pts[0].kg)} kg đến ${kg1(pts[pts.length - 1].kg)} kg`}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2C6BEF" stopOpacity="0.22" />
              <stop offset="1" stopColor="#2C6BEF" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((w) => (
            <g key={w}>
              <line x1="34" x2="322" y1={Y(w)} y2={Y(w)} stroke="var(--line)" strokeWidth="1" />
              <text x="0" y={Y(w) + 4} fontFamily="Barlow Condensed" fontWeight="600" fontSize="12" fill="var(--ink-3)">{vn(w)} kg</text>
            </g>
          ))}
          {showTarget && (
            <>
              <line x1="34" x2="322" y1={Y(target!)} y2={Y(target!)} stroke="var(--green)" strokeWidth="2" strokeDasharray="5 5" />
              <text x="322" y={Y(target!) + (Y(target!) > 30 ? -6 : 14)} textAnchor="end" fontFamily="Be Vietnam Pro" fontWeight="600" fontSize="11" fill="var(--green-ink)">Mục tiêu {kg1(target!)} kg</text>
            </>
          )}
          <path d={`${line} L${X(pts[pts.length - 1].date).toFixed(1)} ${Y(lo)} L${X(pts[0].date).toFixed(1)} ${Y(lo)} Z`} fill={`url(#${gid})`} />
          <path d={line} fill="none" stroke="var(--blue)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
          {pts.map((p, i) => {
            const last = i === pts.length - 1
            return <circle key={p.date} cx={X(p.date)} cy={Y(p.kg)} r={last ? 5.5 : 3} fill={last ? 'var(--blue)' : 'var(--surface)'} stroke="var(--blue)" strokeWidth="2" />
          })}
          {labels.map((d, i) => (
            <text key={i} x={34 + [0, 0.25, 0.5, 0.75, 1][i] * 286} y="164" textAnchor={i === 4 ? 'end' : i === 0 ? 'start' : 'middle'}
              fontFamily="Barlow Condensed" fontWeight="600" fontSize="12" fill="var(--ink-3)">{d.getDate()}/{d.getMonth() + 1}</text>
          ))}
        </svg>
      ) : (
        <p className="small muted">Ghi cân nặng mỗi tuần một lần vào cùng giờ buổi sáng. Biểu đồ hiện từ lần ghi thứ hai.</p>
      )}
    </section>
  )
}

function MonthCard({ logs, week, now, joinedAt }: { logs: Logs; week: WeekPlan; now: Date; joinedAt: string }) {
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const offset = weekdayIndex(first)
  const todayIso = isoDate(now)
  // Chỉ tính buổi lỡ từ ngày bắt đầu dùng app (hoặc ngày có nhật ký đầu tiên)
  const firstLog = Object.keys(logs.days).sort()[0]
  const since = [joinedAt, firstLog].filter(Boolean).sort()[0] ?? todayIso
  let trained = 0
  let missed = 0
  const cells = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), i + 1)
    const iso = isoDate(d)
    const g = mainGroup(logs.days[iso])
    const planned = week[weekdayIndex(d)] !== null
    const past = iso < todayIso
    if (g) trained++
    else if (past && planned && iso >= since) missed++
    return { day: i + 1, iso, g, planned, past: past && iso >= since, future: iso > todayIso, today: iso === todayIso }
  })
  return (
    <section className="card">
      <div className="row between">
        <h2 className="h3">Tháng {now.getMonth() + 1}</h2>
        <span className="xs muted">{trained} buổi · {missed ? `lỡ ${missed} buổi` : 'chưa lỡ buổi nào'}</span>
      </div>
      <div className="cal">
        {WEEKDAY_SHORT.map((d) => <span key={d} className="wd">{d}</span>)}
        {Array.from({ length: offset }, (_, i) => <span key={`e${i}`} />)}
        {cells.map((c) => (
          <span key={c.iso} className={`c ${c.g ? 'tr' : c.past ? 'rest' : ''} ${c.today ? 'now' : ''}`}
            style={c.g ? { background: PLATE[MUSCLE[c.g].plate] } : undefined}
            aria-label={`${c.day}/${now.getMonth() + 1}${c.g ? `, đã tập ${MUSCLE[c.g].label}` : c.planned && c.future ? ', có lịch tập' : ''}`}>
            {c.day}
            {!c.g && c.future && c.planned && <i style={{ position: 'absolute', bottom: 5, width: 4, height: 4, borderRadius: 2, background: 'var(--ink-3)' }} />}
          </span>
        ))}
      </div>
      <div className="legend">
        {(Object.keys(MUSCLE) as Group[]).map((g) => <span key={g}><i style={{ background: PLATE[MUSCLE[g].plate] }} />{MUSCLE[g].label}</span>)}
        <span><i style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--ink-3)' }} />Buổi sắp tới</span>
      </div>
    </section>
  )
}

function GroupBalance({ logs, week, now }: { logs: Logs; week: WeekPlan; now: Date }) {
  const sets: Record<Group, number> = { legs: 0, upper: 0, core: 0, cardio: 0 }
  for (let d = mondayOf(now); d <= now; d = addDays(d, 1)) {
    for (const [id, n] of Object.entries(logs.days[isoDate(d)]?.sets ?? {})) {
      const g = exById(id)?.group
      if (g && n > 0) sets[g] += n
    }
  }
  // Chỉ xét các nhóm có trong lịch tuần
  const planned = new Set(week.flatMap((s) => s?.groups ?? []))
  const groups = (Object.keys(sets) as Group[]).filter((g) => planned.has(g) || sets[g] > 0).sort((a, b) => sets[b] - sets[a])
  const max = Math.max(4, ...groups.map((g) => sets[g]))
  const total = groups.reduce((a, g) => a + sets[g], 0)
  const least = groups.filter((g) => g !== 'cardio').sort((a, b) => sets[a] - sets[b])[0] ?? groups[groups.length - 1]
  const most = groups[0]
  const dow = weekdayIndex(now)
  const nextDay = [1, 2, 3, 4, 5, 6].map((k) => dow + k).find((i) => i < 7 && week[i]?.groups.includes(least))

  let tip: string
  if (!total) tip = 'Tuần này chưa có buổi tập nào. Bắt đầu từ buổi gần nhất trong lịch nhé.'
  else if (least && sets[least] < sets[most] * 0.6) {
    const label = MUSCLE[least].label
    tip = `${label} mới có ${sets[least]} hiệp. ` + (nextDay !== undefined ? `Buổi ${WEEKDAY_LONG[nextDay]} tập ${week[nextDay]!.title} sẽ bù lại.` : `Tuần sau nhớ thêm bài ${label.toLowerCase()}.`)
  } else tip = 'Các nhóm cơ đang được tập khá cân bằng. Giữ nhịp này nhé.'

  return (
    <section className="card">
      <div className="row between"><h2 className="h3">Nhóm cơ tuần này</h2><span className="xs muted">số hiệp</span></div>
      {groups.map((g) => (
        <div key={g} className="mbar" style={{ gridTemplateColumns: '104px 1fr 30px' }}>
          <span>{MUSCLE[g].label}</span>
          <div className="bar" style={{ height: 12 }}><i style={{ width: `${(sets[g] / max) * 100}%`, background: PLATE[MUSCLE[g].plate] }} /></div>
          <span>{sets[g]}</span>
        </div>
      ))}
      <p className="small row" style={{ gap: 8, background: total && tip.startsWith('Các') ? 'var(--green-soft)' : 'var(--yellow-soft)', padding: '10px 12px', borderRadius: 14, alignItems: 'flex-start' }}>
        <span style={{ color: total && tip.startsWith('Các') ? 'var(--green-ink)' : 'var(--yellow-ink)', marginTop: 1 }}><Info size={16} /></span>{tip}
      </p>
    </section>
  )
}

const MEAS: { k: 'waist' | 'hip' | 'fat'; name: string; unit: string }[] = [
  { k: 'waist', name: 'Vòng eo', unit: 'cm' },
  { k: 'hip', name: 'Vòng mông', unit: 'cm' },
  { k: 'fat', name: 'Mỡ cơ thể', unit: '%' },
]

/** Giá trị mới nhất và đầu tiên của từng số đo */
function measureStats(ms: Measure[]) {
  return MEAS.map((m) => {
    const xs = ms.filter((x) => x[m.k] !== undefined)
    const latest = xs[xs.length - 1]?.[m.k]
    const first = xs[0]?.[m.k]
    return { ...m, latest, delta: xs.length >= 2 && latest !== undefined && first !== undefined ? latest - first : null }
  })
}

function MeasureCard({ measures, onEdit }: { measures: Measure[]; onEdit: () => void }) {
  const stats = measureStats(measures)
  return (
    <section className="card">
      <div className="row between">
        <h2 className="h3">Số đo cơ thể</h2>
        <button className="link" onClick={onEdit}>Cập nhật <Pencil size={14} /></button>
      </div>
      {measures.length ? (
        <div className="meas">
          {stats.map((s) => (
            <div key={s.k}>
              <span className="xs muted">{s.name}</span>
              <span className="num">{s.latest !== undefined ? kg1(s.latest) : '–'}<small style={{ fontSize: 14, color: 'var(--ink-3)' }}> {s.unit}</small></span>
              {s.delta !== null && Math.abs(s.delta) >= 0.05 && (
                <span className={`delta ${s.delta > 0 ? 'up' : ''}`}>
                  {s.delta < 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />} {kg1(Math.abs(s.delta))}{s.unit === '%' ? '%' : ' cm'}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="small muted">Đo vòng eo, vòng mông mỗi 2 tuần để thấy thay đổi mà cân nặng không cho thấy.</p>
      )}
    </section>
  )
}

function RecordsCard({ logs }: { logs: Logs }) {
  const { profile } = useProfile()
  const recs = personalRecords(logs, profile).slice(0, 4)
  return (
    <section className="card tight">
      <h2 className="h3">Kỷ lục cá nhân</h2>
      {recs.length ? (
        <div>
          {recs.map((r) => {
            const ex = exById(r.exId)!
            const plate = MUSCLE[ex.group].plate
            return (
              <div key={r.exId} className="pr">
                <span className="thumb" style={{ background: PLATE_SOFT[plate], width: 46, height: 46, borderRadius: 13 }}>
                  <Pose name={poseOf(ex)} size={46} color={PLATE_INK[plate]} />
                </span>
                <span className="grow col"><b style={{ fontWeight: 600 }}>{ex.name}</b><span className="xs muted">{dm(r.date)}</span></span>
                <span className="num" style={{ fontSize: 22, whiteSpace: 'nowrap' }}>{featLabel(r)}</span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="small muted">Hoàn thành bài tập đầu tiên để lập kỷ lục. Mỗi lần làm được nhiều hơn, kỷ lục tự cập nhật.</p>
      )}
    </section>
  )
}

/** Ô nhập số thập phân kiểu Việt Nam (61,4) */
function parseNum(s: string) {
  const n = Number(s.replace(',', '.').replace(/[^\d.]/g, ''))
  return Number.isFinite(n) && s.trim() !== '' ? n : null
}

function WeightSheet({ open, onClose, initial, onSave }: { open: boolean; onClose: () => void; initial: number; onSave: (kg: number) => void }) {
  const [draft, setDraft] = useState(kg1(initial))
  useEffect(() => {
    if (open) setDraft(kg1(initial))
  }, [open, initial])
  const kg = parseNum(draft)
  const ok = kg !== null && kg >= 25 && kg <= 250
  const bump = (d: number) => setDraft(kg1(Math.round(((kg ?? initial) + d) * 10) / 10))
  return (
    <Sheet open={open} onClose={onClose} title="Ghi cân nặng hôm nay">
      <div className="card tight" style={{ alignItems: 'center' }}>
        <div className="stepper">
          <button onClick={() => bump(-0.1)} aria-label="Giảm 0,1 kg"><Minus size={18} /></button>
          <label className="row" style={{ gap: 4 }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} inputMode="decimal" aria-label="Cân nặng (kg)"
              className="num" style={{ fontSize: 40, width: 110, textAlign: 'center', background: 'transparent', outline: 'none' }} />
            <span className="small muted">kg</span>
          </label>
          <button onClick={() => bump(0.1)} aria-label="Tăng 0,1 kg"><Plus size={18} /></button>
        </div>
        <p className="xs muted" style={{ textAlign: 'center' }}>Cân buổi sáng, sau khi đi vệ sinh và trước khi ăn để số liệu ổn định.</p>
      </div>
      <button className="btn wide" disabled={!ok} onClick={() => ok && onSave(Math.round(kg! * 10) / 10)}>Lưu cân nặng</button>
    </Sheet>
  )
}

function MeasureSheet({ open, onClose, measures, onSave }: {
  open: boolean; onClose: () => void; measures: Measure[]; onSave: (m: Omit<Measure, 'date'>) => void
}) {
  const stats = measureStats(measures)
  const [draft, setDraft] = useState<Record<string, string>>({})
  useEffect(() => {
    if (open) setDraft(Object.fromEntries(stats.map((s) => [s.k, s.latest !== undefined ? kg1(s.latest) : ''])))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  const values = Object.fromEntries(MEAS.map((m) => [m.k, parseNum(draft[m.k] ?? '')]))
  const valid = MEAS.some((m) => values[m.k] !== null) && MEAS.every((m) => values[m.k] === null || (values[m.k]! > 0 && values[m.k]! < (m.unit === '%' ? 70 : 250)))
  return (
    <Sheet open={open} onClose={onClose} title="Cập nhật số đo">
      <div className="grid2" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {MEAS.map((m) => (
          <label key={m.k} className="field">
            <span>{m.name} ({m.unit})</span>
            <input value={draft[m.k] ?? ''} onChange={(e) => setDraft({ ...draft, [m.k]: e.target.value })} inputMode="decimal" className="num" style={{ fontSize: 22 }} />
          </label>
        ))}
      </div>
      <p className="xs muted" style={{ padding: '0 4px' }}>Đo vòng eo ngang rốn, vòng mông ở chỗ to nhất. % mỡ lấy từ cân điện tử nếu có, không có thì để trống.</p>
      <button className="btn wide" disabled={!valid} onClick={() => valid && onSave(Object.fromEntries(MEAS.filter((m) => values[m.k] !== null).map((m) => [m.k, values[m.k]])))}>Lưu số đo</button>
    </Sheet>
  )
}
