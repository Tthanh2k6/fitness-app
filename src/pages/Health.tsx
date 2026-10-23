import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Activity, Bell, Droplets, HeartPulse, Moon, Plus, Watch } from 'lucide-react'
import { Body, Page, Sheet, TitleBar, Toggle, useToast } from '../components/ui'
import { addDays, isoDate, WEEKDAY_SHORT, weekdayIndex } from '../lib/format'
import { liters, WATER_GOAL } from '../logic/daily'
import { hm, MOOD_LABEL, readiness, sleepMinutes, type Level } from '../logic/health'
import { useToday } from '../logic/useToday'
import { useProfile } from '../profile'
import type { Logs } from '../store'

const DOT: Record<Level, string> = { good: 'var(--green)', ok: 'var(--yellow)', low: 'var(--red)' }

export default function Health() {
  const { update } = useProfile()
  const { profile, store, now, date, session, log } = useToday()
  const { logs } = store
  const toast = useToast()
  const { hash } = useLocation()
  const [sleepOpen, setSleepOpen] = useState(false)
  const [hrOpen, setHrOpen] = useState(false)

  // Mở từ hồ sơ "Thiết bị" thì cuộn tới danh sách thiết bị
  useEffect(() => {
    if (hash === '#devices') document.getElementById('devices')?.scrollIntoView({ block: 'start' })
  }, [hash])

  const r = readiness(logs, now, session)
  const water = log?.water ?? 0

  const addWater = () => {
    const n = Math.min(12, water + 1)
    store.patchDay(date, { water: n })
    toast(`Đã ghi 250 ml, tổng ${liters(n)} lít`)
  }

  return (
    <Page>
      <Body>
        <TitleBar title="Sức khỏe" right={
          <button className="icon-btn" aria-label="Kết nối thiết bị" onClick={() => document.getElementById('devices')?.scrollIntoView({ behavior: 'smooth' })}>
            <Watch size={20} />
          </button>
        } />

        <Readiness score={r.score} title={r.title} advice={r.advice} factors={r.factors} measured={r.measured} />

        <SleepCard logs={logs} now={now} onLog={() => setSleepOpen(true)} />

        <div className="grid2">
          <section className="tile">
            <div className="tile-h"><span className="ib" style={{ background: 'var(--blue-soft)', color: 'var(--blue-ink)' }}><Droplets size={16} /></span>Nước</div>
            <span className="num">{liters(water)}<small>/ {liters(WATER_GOAL)} lít</small></span>
            <div className="glasses">{Array.from({ length: WATER_GOAL }, (_, i) => <i key={i} className={i < water ? 'on' : ''} />)}</div>
            <button className="mini-btn" style={{ alignSelf: 'flex-start' }} onClick={addWater}><Plus size={14} strokeWidth={2.4} /> 250 ml</button>
          </section>
          <HeartTile logs={logs} now={now} onLog={() => setHrOpen(true)} />
        </div>

        <section className="card tight">
          <h2 className="h3">Hôm nay bạn thấy thế nào?</h2>
          <div className="chipset">
            {MOOD_LABEL.map((t, i) => (
              <button key={t} className={`choice ${log?.mood === i ? 'on' : ''}`} aria-pressed={log?.mood === i}
                onClick={() => store.patchDay(date, { mood: i })}>{t}</button>
            ))}
          </div>
        </section>

        <section className="list-card" id="devices" style={{ scrollMarginTop: 16 }}>
          <div className="lrow">
            <span className="li"><Bell size={18} /></span>
            <span className="grow col"><b style={{ fontWeight: 600 }}>Nhắc uống nước</b><span className="xs muted">Mỗi 90 phút, 8:00–21:00 · khi mở app</span></span>
            <Toggle on={profile.waterRemind} onChange={(v) => update({ waterRemind: v })} label="Nhắc uống nước" />
          </div>
          {([
            [HeartPulse, 'Apple Sức khỏe', 'Bước chân, nhịp tim, giấc ngủ'],
            [Activity, 'Google Fit', 'Dành cho Android'],
            [Watch, 'Đồng hồ thông minh', 'Garmin, Xiaomi, Huawei'],
          ] as const).map(([Icon, t, d]) => (
            <div key={t} className="lrow">
              <span className="li"><Icon size={18} /></span>
              <span className="grow col"><b style={{ fontWeight: 600 }}>{t}</b><span className="xs muted">{d}</span></span>
              <span className="tag">Sắp có</span>
            </div>
          ))}
        </section>
        <p className="xs muted" style={{ padding: '0 4px' }}>
          Ứng dụng web chưa đọc được cảm biến của điện thoại; tạm thời bạn nhập tay bước chân, giấc ngủ và nhịp tim.
        </p>
      </Body>

      <SleepSheet open={sleepOpen} onClose={() => setSleepOpen(false)} initial={log?.sleep}
        onSave={(s) => {
          store.patchDay(date, { sleep: s })
          const m = sleepMinutes(s)!
          toast(`Đã ghi giấc ngủ ${hm(m).h} giờ ${hm(m).m} phút`)
          setSleepOpen(false)
        }} />
      <HeartSheet open={hrOpen} onClose={() => setHrOpen(false)} initial={log?.hr}
        onSave={(hr) => {
          store.patchDay(date, { hr })
          toast(`Đã ghi nhịp tim ${hr} bpm`)
          setHrOpen(false)
        }} />
    </Page>
  )
}

function Readiness({ score, title, advice, factors, measured }: ReturnType<typeof readiness>) {
  const R = 92, cx = 110, cy = 104
  const pt = (a: number) => `${(cx + R * Math.cos(a)).toFixed(1)} ${(cy + R * Math.sin(a)).toFixed(1)}`
  const a1 = Math.PI + (Math.PI * Math.max(1, score)) / 100
  const color = score >= 60 ? 'var(--green)' : score >= 40 ? 'var(--yellow)' : 'var(--red)'
  return (
    <section className="card hero" style={{ alignItems: 'center', textAlign: 'center' }}>
      <p className="lbl">Mức sẵn sàng hôm nay</p>
      <svg width="220" height="120" viewBox="0 0 220 120" role="img" aria-label={`Điểm sẵn sàng ${score} trên 100`}>
        <path d={`M ${pt(Math.PI)} A ${R} ${R} 0 0 1 ${pt(0)}`} fill="none" stroke="var(--hero-2)" strokeWidth="16" strokeLinecap="round" />
        <path d={`M ${pt(Math.PI)} A ${R} ${R} 0 0 1 ${pt(a1)}`} fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" />
        <text x="110" y="98" textAnchor="middle" fontFamily="Barlow Condensed" fontWeight="700" fontSize="64" fill="var(--on-hero)">{score}</text>
      </svg>
      <p className="h3">{title}</p>
      <p className="small muted" style={{ maxWidth: 290 }}>{advice}</p>
      <div className="factors" style={{ width: '100%' }}>
        {factors.map((f) => (
          <div key={f.name}>
            <span className="xs muted">{f.name}</span>
            <b><i style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: DOT[f.level], marginRight: 6, verticalAlign: 1 }} />{f.value}</b>
          </div>
        ))}
      </div>
      {!measured && <p className="hint" style={{ width: '100%', textAlign: 'left' }}><Moon size={16} />Ghi giấc ngủ và cảm nhận để điểm chính xác hơn.</p>}
    </section>
  )
}

function SleepCard({ logs, now, onLog }: { logs: Logs; now: Date; onLog: () => void }) {
  const today = logs.days[isoDate(now)]
  const mins = sleepMinutes(today?.sleep)
  const nights = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(now, i - 6)
    return { d, m: sleepMinutes(logs.days[isoDate(d)]?.sleep) }
  })
  const known = nights.filter((n) => n.m !== null).map((n) => n.m!)
  const avg = known.length ? known.reduce((a, b) => a + b, 0) / known.length : null
  const tag = mins === null ? null : mins >= 420 ? ['Đủ giấc', 'green'] : mins >= 360 ? ['Hơi ít', 'yellow'] : ['Thiếu ngủ', 'red']
  // Cột: cao tối đa 10 giờ
  const H = 84, top = 6
  const y = (m: number) => top + H - (Math.min(600, m) / 600) * H
  return (
    <section className="card">
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div>
          <p className="lbl">Giấc ngủ đêm qua</p>
          {mins !== null ? (
            <p>
              <span className="num" style={{ fontSize: 40 }}>{hm(mins).h}</span><span className="small muted">giờ </span>
              <span className="num" style={{ fontSize: 40 }}>{hm(mins).m}</span><span className="small muted">phút</span>
            </p>
          ) : <p className="num" style={{ fontSize: 40, color: 'var(--ink-3)' }}>Chưa ghi</p>}
          {today?.sleep && <span className="xs muted">{today.sleep.bed} → {today.sleep.wake}</span>}
        </div>
        {tag && <span className={`tag ${tag[1]}`}>{tag[0]}</span>}
      </div>
      <svg width="100%" viewBox="0 0 350 112" role="img" aria-label="Thời gian ngủ 7 đêm gần nhất">
        <line x1="0" x2="350" y1={y(420)} y2={y(420)} stroke="var(--green)" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="350" y={y(420) - 4} textAnchor="end" fontFamily="Barlow Condensed" fontWeight="600" fontSize="11" fill="var(--green-ink)">7 giờ</text>
        {nights.map((n, i) => {
          const x = 8 + i * 48
          const last = i === 6
          return (
            <g key={i}>
              {n.m !== null
                ? <rect x={x} y={y(n.m)} width="34" height={top + H - y(n.m)} rx="6" fill={last ? 'var(--blue)' : 'var(--blue-2)'} />
                : <rect x={x} y={top + H - 6} width="34" height="6" rx="3" fill="var(--surface-2)" />}
              <text x={x + 17} y="108" textAnchor="middle" fontFamily="Barlow Condensed" fontWeight="600" fontSize="12" fill={last ? 'var(--ink)' : 'var(--ink-3)'}>
                {last ? 'Đêm qua' : WEEKDAY_SHORT[weekdayIndex(n.d)]}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="row between">
        <span className="xs muted">{avg !== null ? `Trung bình ${known.length} đêm: ${hm(avg).h} giờ ${hm(avg).m} phút` : 'Ghi giờ ngủ mỗi sáng để thấy thói quen của bạn'}</span>
        <button className="btn sm ghost" onClick={onLog}><Moon size={16} /> Ghi giấc ngủ</button>
      </div>
    </section>
  )
}

function HeartTile({ logs, now, onLog }: { logs: Logs; now: Date; onLog: () => void }) {
  const days = Array.from({ length: 7 }, (_, i) => logs.days[isoDate(addDays(now, i - 6))]?.hr ?? null)
  const today = days[6]
  const known = days.filter((v): v is number => v !== null)
  const lo = Math.min(...known) - 2, hi = Math.max(...known) + 1
  return (
    <button className="tile" onClick={onLog} aria-label="Ghi nhịp tim lúc nghỉ">
      <div className="tile-h"><span className="ib" style={{ background: 'var(--red-soft)', color: 'var(--red-ink)' }}><HeartPulse size={16} /></span>Nhịp tim nghỉ</div>
      {today ? <span className="num">{today}<small>bpm</small></span> : <span className="num" style={{ color: 'var(--ink-3)', fontSize: 26 }}>Chưa đo</span>}
      {known.length ? (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 44, marginTop: 'auto' }}>
          {days.map((v, i) => (
            <i key={i} style={{ flex: 1, borderRadius: 3, height: v === null ? 4 : 8 + ((v - lo) / Math.max(1, hi - lo)) * 36, background: v === null ? 'var(--surface-2)' : i === 6 ? 'var(--red)' : 'var(--red-soft)' }} />
          ))}
        </div>
      ) : <span className="xs muted" style={{ marginTop: 'auto' }}>Chạm để nhập nhịp tim buổi sáng</span>}
      {known.length > 0 && <span className="xs muted">7 ngày, thấp là tốt</span>}
    </button>
  )
}

function SleepSheet({ open, onClose, initial, onSave }: { open: boolean; onClose: () => void; initial?: { bed: string; wake: string }; onSave: (s: { bed: string; wake: string }) => void }) {
  const [bed, setBed] = useState('23:00')
  const [wake, setWake] = useState('06:30')
  useEffect(() => {
    if (!open) return
    setBed(initial?.bed ?? '23:00')
    setWake(initial?.wake ?? '06:30')
  }, [open, initial])
  const m = bed && wake ? sleepMinutes({ bed, wake }) : null
  return (
    <Sheet open={open} onClose={onClose} title="Giấc ngủ đêm qua">
      <div className="grid2">
        <label className="field"><span>Đi ngủ lúc</span><input type="time" value={bed} onChange={(e) => setBed(e.target.value)} /></label>
        <label className="field"><span>Thức dậy lúc</span><input type="time" value={wake} onChange={(e) => setWake(e.target.value)} /></label>
      </div>
      {m !== null && <p className="small muted" style={{ padding: '0 4px' }}>Ngủ khoảng <b style={{ color: 'var(--ink)' }}>{hm(m).h} giờ {hm(m).m} phút</b>. Người lớn nên ngủ 7–9 giờ.</p>}
      <button className="btn wide" disabled={m === null || m < 60} onClick={() => m !== null && onSave({ bed, wake })}>Lưu giấc ngủ</button>
    </Sheet>
  )
}

function HeartSheet({ open, onClose, initial, onSave }: { open: boolean; onClose: () => void; initial?: number; onSave: (hr: number) => void }) {
  const [draft, setDraft] = useState('')
  useEffect(() => {
    if (open) setDraft(initial ? String(initial) : '')
  }, [open, initial])
  const hr = Number(draft)
  const ok = Number.isInteger(hr) && hr >= 35 && hr <= 150
  return (
    <Sheet open={open} onClose={onClose} title="Nhịp tim lúc nghỉ">
      <p className="small muted" style={{ padding: '0 4px' }}>Đo lúc mới ngủ dậy: đếm mạch ở cổ tay trong 30 giây rồi nhân 2.</p>
      <label className="field">
        <span>Nhịp mỗi phút (bpm)</span>
        <input value={draft} onChange={(e) => setDraft(e.target.value.replace(/\D/g, '').slice(0, 3))} inputMode="numeric" placeholder="Ví dụ 64" className="num" style={{ fontSize: 26 }} />
      </label>
      <button className="btn wide" disabled={!ok} onClick={() => ok && onSave(hr)}>Lưu nhịp tim</button>
    </Sheet>
  )
}
