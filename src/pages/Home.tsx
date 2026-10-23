import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell, ChevronRight, Droplet, Dumbbell, Flame, Footprints, HeartPulse, Moon, Play, Plus, Scale, Sparkles, Timer,
  TrendingDown, TrendingUp, UserRound,
} from 'lucide-react'
import Barbell from '../components/Barbell'
import DishArt, { dishKind } from '../components/DishArt'
import Pose, { poseOf } from '../components/Pose'
import { Body, Page, Sheet, useToast, vn } from '../components/ui'
import { exById } from '../data/exercises'
import { MUSCLE, PLATE, PLATE_INK, PLATE_SOFT, type Group } from '../data/muscles'
import { mealSlot } from '../ai/food/advice'
import { addDays, isoDate, mondayOf, vnd, WEEKDAY_LONG, WEEKDAY_SHORT } from '../lib/format'
import { dailyMetrics, dailyPercent, liters, plannedKcal, WATER_GOAL, type Metric } from '../logic/daily'
import { hm, readiness, sleepMinutes } from '../logic/health'
import { dayNutrition, SLOTS, suggestMeals } from '../logic/meals'
import { isActive } from '../logic/progress'
import { doneCount, itemDone, nextIndex } from '../logic/session'
import { useToday } from '../logic/useToday'
import { firstName, initials, macroTargets } from '../profile'
import type { Logs } from '../store'

const METRIC_ICON: Record<Metric['key'], typeof Flame> = { kcal: Flame, steps: Footprints, minutes: Timer, water: Droplet }
const PLATE_NAME = { red: 'đỏ', green: 'xanh lá', yellow: 'vàng', blue: 'xanh dương' } as const

/** Câu nhắc cho đĩa gần đầy nhất mà chưa đầy */
function hintOf(metrics: Metric[]) {
  const open = metrics.filter((m) => m.value < m.target)
  if (!open.length) return { Icon: Sparkles, text: 'Cả bốn đĩa đã đầy. Hôm nay tuyệt lắm!' }
  const m = open.reduce((a, b) => (b.value / b.target > a.value / a.target ? b : a))
  const left = m.target - m.value
  const what = m.key === 'kcal' ? `${vn(left)} kcal` : m.key === 'steps' ? `${vn(left)} bước` : m.key === 'minutes' ? `${left} phút tập` : `${left} ly nước`
  return { Icon: METRIC_ICON[m.key], text: `Còn ${what} nữa là đầy đĩa ${PLATE_NAME[m.plate]}.` }
}

/** Cân nặng khoảng 7 ngày trước (lần ghi gần nhất trước mốc đó, không có thì lần ghi đầu tiên) */
function weekAgoKg(logs: Logs, now: Date) {
  const mark = isoDate(addDays(now, -7))
  const before = logs.weights.filter((w) => w.date <= mark)
  return before.length ? before[before.length - 1].kg : logs.weights.length >= 2 ? logs.weights[0].kg : null
}

export default function Home() {
  const { profile, store, week, now, date, dow, session, log, adjust } = useToday()
  const { logs, patchDay } = store
  const nav = useNavigate()
  const toast = useToast()
  const [bell, setBell] = useState(false)
  const [stepsOpen, setStepsOpen] = useState(false)

  const monday = mondayOf(now)
  const metrics = dailyMetrics(log, profile, session)
  const pct = dailyPercent(metrics)
  const hint = hintOf(metrics)
  const water = log?.water ?? 0
  const addWater = () => {
    patchDay(date, { water: water + 1 })
    toast(`Đã ghi 250 ml, tổng ${liters(water + 1)} lít`)
  }

  // Lời nhắc trong app (chuông)
  const lastWeight = logs.weights[logs.weights.length - 1]
  const reminders: { Icon: typeof Bell; tone: string; text: string; act: () => void }[] = []
  if (session && nextIndex(session, log) !== -1) reminders.push({ Icon: Dumbbell, tone: 'red', text: `Buổi ${session.title} chưa xong`, act: () => nav('/workout') })
  if (water < WATER_GOAL) reminders.push({ Icon: Droplet, tone: 'blue', text: `Còn ${WATER_GOAL - water} ly nước hôm nay · bấm để ghi 1 ly`, act: addWater })
  if (!log?.sleep) reminders.push({ Icon: Moon, tone: 'blue', text: 'Chưa ghi giấc ngủ đêm qua', act: () => nav('/health') })
  if (!log?.hr) reminders.push({ Icon: HeartPulse, tone: 'red', text: 'Chưa đo nhịp tim lúc nghỉ', act: () => nav('/health') })
  if (!lastWeight || lastWeight.date < isoDate(addDays(now, -7))) reminders.push({ Icon: Scale, tone: 'green', text: 'Đã hơn 7 ngày chưa ghi cân nặng', act: () => nav('/progress?log=weight') })
  if (!log?.steps && now.getHours() >= 17) reminders.push({ Icon: Footprints, tone: 'green', text: 'Chưa nhập số bước hôm nay', act: () => setStepsOpen(true) })

  return (
    <Page nav="home">
      <Body>
        <header className="row">
          <Link to="/profile" className="avatar" aria-label="Hồ sơ">{initials(profile.name) || <UserRound size={22} />}</Link>
          <div className="grow">
            <p className="lbl">{WEEKDAY_LONG[dow]} · {now.getDate()} tháng {now.getMonth() + 1}</p>
            <h1 className="h2" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.025em' }}>Chào {firstName(profile.name) || 'bạn'}</h1>
          </div>
          <button className="icon-btn" onClick={() => setBell(true)} aria-label={reminders.length ? `Nhắc nhở, có ${reminders.length} mục` : 'Nhắc nhở'}>
            <Bell size={21} />
            {reminders.length > 0 && <i className="dot" />}
          </button>
        </header>

        <div className="week">
          {week.map((s, i) => {
            const d = addDays(monday, i)
            const trained = isActive(logs.days[isoDate(d)])
            const g = s ? MUSCLE[s.groups[0]].plate : null
            const style = g && (trained || i === dow) ? { background: PLATE[g] } : g ? { background: 'transparent', boxShadow: `inset 0 0 0 1.2px ${PLATE[g]}` } : undefined
            return (
              <div key={i} className={`day ${i === dow ? 'today' : ''}`}>
                <span className="wd">{WEEKDAY_SHORT[i]}</span>
                <span className="dn">{d.getDate()}</span>
                <i className="pip" style={style} />
              </div>
            )
          })}
        </div>

        <section className="card hero">
          <div className="row between">
            <p className="lbl">Thanh đòn hôm nay</p>
            <Link to="/health" className="link">Chi tiết <ChevronRight size={16} /></Link>
          </div>
          <div className="hero-mid">
            <div className="hero-pct">
              <span className="num big">{pct}</span><span className="num pct">%</span>
              <p className="small muted" style={{ marginTop: 6 }}>mục tiêu<br />trong ngày</p>
            </div>
            <div className="grow" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Barbell plates={metrics.map((m) => ({ c: m.plate, pct: m.value / m.target }))} anim label={`Hoàn thành ${pct}% mục tiêu trong ngày`} />
            </div>
          </div>
          <div className="legend4">
            {metrics.map((m) => {
              const inner = (
                <>
                  <span className="nm"><i style={{ background: PLATE[m.plate] }} />{m.name}</span>
                  <span className="num">{m.show}</span>
                  <span className="of">{m.of}</span>
                </>
              )
              return m.key === 'steps' ? (
                <button key={m.key} className="lg" onClick={() => setStepsOpen(true)} aria-label="Nhập số bước hôm nay">{inner}</button>
              ) : <div key={m.key} className="lg">{inner}</div>
            })}
          </div>
          <p className="hint"><hint.Icon size={16} /><span>{hint.text}</span></p>
        </section>

        {session ? sessionCard() : restCard()}

        <div className="grid2">
          <div className="tile">
            <div className="tile-h"><span className="ib bg-blue-soft text-blue-ink"><Droplet size={16} /></span>Nước</div>
            <span className="num">{liters(water)}<small>/ {liters(WATER_GOAL)} lít</small></span>
            <div className="glasses">{Array.from({ length: WATER_GOAL }, (_, i) => <i key={i} className={i < water ? 'on' : ''} />)}</div>
            <button className="mini-btn" style={{ alignSelf: 'flex-start' }} onClick={addWater}><Plus size={14} strokeWidth={2.4} /> 250 ml</button>
          </div>
          {sleepTile()}
          {heartTile()}
          {weightTile()}
        </div>

        {mealsCard()}

        <div className="tip">
          <span className="ib"><Sparkles size={18} /></span>
          <div className="col" style={{ gap: 3 }}>
            <b className="h3">Lời nhắc từ HLV</b>
            <p className="small">{coachTip()}</p>
          </div>
        </div>
      </Body>

      <Sheet open={bell} onClose={() => setBell(false)} title="Nhắc nhở hôm nay">
        {reminders.length ? reminders.map((r) => (
          <button key={r.text} className="ov-item" onClick={() => { setBell(false); r.act() }}>
            <span className="ch-ic" style={{ background: `var(--${r.tone}-soft)`, color: `var(--${r.tone}-ink)`, width: 42, height: 42 }}><r.Icon size={20} /></span>
            <span className="grow" style={{ fontWeight: 600, fontSize: 14 }}>{r.text}</span>
            <ChevronRight size={18} className="chev" />
          </button>
        )) : <p className="small muted" style={{ padding: '4px 4px 8px' }}>Không còn nhắc nhở nào. Hôm nay ổn rồi!</p>}
        <button className="btn ghost" onClick={() => setBell(false)}>Đóng</button>
      </Sheet>

      <StepsSheet open={stepsOpen} onClose={() => setStepsOpen(false)} current={log?.steps ?? 0}
        onSave={(n) => { patchDay(date, { steps: n }); toast(`Đã ghi ${vn(n)} bước hôm nay`) }} />
    </Page>
  )

  function sessionCard() {
    const s = session!
    const done = doneCount(s, log)
    const next = nextIndex(s, log)
    const nextEx = exById(s.items[next === -1 ? 0 : next].exId)!
    // Nhãn nhóm cơ chính của buổi (nhiều bài nhất); buổi toàn thân thì ghi số nhóm cơ
    const count = new Map<Group, number>()
    for (const it of s.items) {
      const grp = exById(it.exId)!.group
      count.set(grp, (count.get(grp) ?? 0) + 1)
    }
    const g: Group = [...count].sort((a, b) => b[1] - a[1])[0][0]
    const pl = MUSCLE[g].plate
    const thumb = MUSCLE[nextEx.group].plate
    return (
      <section className="card">
        <div className="row between">
          <p className="lbl">Buổi tập hôm nay</p>
          {s.kind === 'full'
            ? <span className="tag">{s.groups.length} nhóm cơ</span>
            : <span className={`tag ${pl}`}>{MUSCLE[g].label}</span>}
        </div>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div className="grow col" style={{ gap: 4 }}>
            <h2 className="h2">{s.title}</h2>
            <p className="small muted">{s.items.length} bài · {s.minutes} phút · khoảng {plannedKcal(s, profile)} kcal</p>
          </div>
          <span className="thumb" style={{ background: PLATE_SOFT[thumb], width: 56, height: 56 }}>
            <Pose name={poseOf(nextEx)} size={56} color={PLATE_INK[thumb]} />
          </span>
        </div>
        <div className="row between">
          <div className="mini-plates">
            {s.items.map((it) => {
              const ok = itemDone(it, log)
              const c = MUSCLE[exById(it.exId)!.group].plate
              return <i key={it.exId} className={ok ? '' : 'off'} style={ok ? { background: PLATE[c] } : undefined} />
            })}
          </div>
          <span className="num" style={{ fontSize: 22 }}>{done}<span style={{ color: 'var(--ink-3)' }}>/{s.items.length} bài</span></span>
        </div>
        {next === -1 ? (
          <Link to="/done" className="btn"><Sparkles size={18} /> Xong hết bài · Xem tổng kết</Link>
        ) : (
          <Link to="/workout" className="btn"><Play size={18} /> {done ? 'Tập tiếp' : 'Bắt đầu'}: {nextEx.name}</Link>
        )}
      </section>
    )
  }

  function restCard() {
    const nextDow = [1, 2, 3, 4, 5, 6, 7].map((k) => (dow + k) % 7).find((d) => week[d])
    const next = nextDow !== undefined ? week[nextDow] : null
    return (
      <section className="card">
        <div className="row between">
          <p className="lbl">Hôm nay</p>
          <span className="tag blue"><Moon size={13} /> Ngày nghỉ</span>
        </div>
        <div className="col" style={{ gap: 4 }}>
          <h2 className="h2">Hôm nay nghỉ</h2>
          <p className="small muted">Cơ bắp phát triển trong lúc nghỉ. Đi bộ nhẹ hoặc giãn cơ là đủ.</p>
        </div>
        {next && nextDow !== undefined && (
          <p className="small" style={{ background: 'var(--surface-2)', borderRadius: 14, padding: '10px 12px' }}>
            Buổi tiếp theo: <b>{WEEKDAY_LONG[nextDow]}</b> · {next.title} · {next.minutes} phút
          </p>
        )}
        <Link to="/stretch?phase=cooldown" className="btn"><Play size={18} /> Giãn cơ thư giãn</Link>
      </section>
    )
  }

  function sleepTile() {
    const min = sleepMinutes(log?.sleep)
    const t = min !== null ? hm(min) : null
    return (
      <Link to="/health" className="tile">
        <div className="tile-h"><span className="ib bg-blue-soft text-blue-ink"><Moon size={16} /></span>Giấc ngủ</div>
        {t ? (
          <>
            <span className="num">{t.h}<small>g</small> {String(t.m).padStart(2, '0')}<small>p</small></span>
            <span className="xs muted">{log!.sleep!.bed} → {log!.sleep!.wake}</span>
            <div className="bar" style={{ marginTop: 'auto', height: 10 }}><i style={{ width: `${Math.min(100, (min! / 480) * 100)}%`, background: min! >= 420 ? 'var(--blue)' : 'var(--blue-2)' }} /></div>
          </>
        ) : (
          <>
            <span className="num" style={{ color: 'var(--ink-3)' }}>--</span>
            <span className="xs muted" style={{ marginTop: 'auto' }}>Chưa ghi đêm qua · bấm để ghi</span>
          </>
        )}
      </Link>
    )
  }

  function heartTile() {
    const hrs = Array.from({ length: 7 }, (_, i) => logs.days[isoDate(addDays(now, i - 6))]?.hr ?? null)
    const vals = hrs.filter((x): x is number => x !== null)
    const lo = Math.min(...vals) - 2, hi = Math.max(...vals) + 2
    const pts = hrs.map((v, i) => (v === null ? null : `${(i / 6) * 140},${4 + (1 - (v - lo) / Math.max(1, hi - lo)) * 28}`)).filter(Boolean)
    return (
      <Link to="/health" className="tile">
        <div className="tile-h"><span className="ib bg-red-soft text-red-ink"><HeartPulse size={16} /></span>Nhịp tim nghỉ</div>
        {log?.hr ? <span className="num">{log.hr}<small>bpm</small></span> : <span className="num" style={{ color: 'var(--ink-3)' }}>--</span>}
        {pts.length >= 2 ? (
          <svg width="100%" height="36" viewBox="0 0 140 36" preserveAspectRatio="none" style={{ marginTop: 'auto' }} aria-label="Nhịp tim nghỉ 7 ngày">
            <polyline points={pts.join(' ')} fill="none" stroke="var(--red)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
        ) : null}
        <span className="xs muted" style={pts.length >= 2 ? undefined : { marginTop: 'auto' }}>{log?.hr ? '7 ngày gần nhất' : 'Chưa đo sáng nay · bấm để ghi'}</span>
      </Link>
    )
  }

  function weightTile() {
    const kg = profile.weightKg
    const ago = weekAgoKg(logs, now)
    const d = ago !== null ? Math.round((kg - ago) * 10) / 10 : null
    const losing = profile.targetKg < profile.startKg
    const good = d === null || d === 0 ? true : profile.goal === 'health' ? Math.abs(d) <= 0.5 : losing ? d < 0 : d > 0
    const tracked = profile.goal !== 'health' && Math.abs(profile.startKg - profile.targetKg) >= 0.1
    const total = Math.abs(profile.startKg - profile.targetKg)
    const got = Math.max(0, Math.min(total, losing ? profile.startKg - kg : kg - profile.startKg))
    return (
      <Link to="/progress" className="tile">
        <div className="tile-h"><span className="ib bg-green-soft text-green-ink"><Scale size={16} /></span>Cân nặng</div>
        <span className="num">{vn(kg, 1)}<small>kg</small></span>
        {d !== null && d !== 0 ? (
          <span className={`delta ${good ? '' : 'up'}`}>{d < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />} {vn(Math.abs(d), 1)} kg tuần này</span>
        ) : <span className="xs muted">{d === 0 ? 'Giữ nguyên tuần này' : 'Chưa có số tuần trước'}</span>}
        {tracked ? (
          <>
            <div className="bar" style={{ marginTop: 'auto' }}><i style={{ width: `${total ? (got / total) * 100 : 0}%`, background: 'var(--green)' }} /></div>
            <span className="xs muted">Đã {losing ? 'giảm' : 'tăng'} {vn(got, 1)}/{vn(total, 1)} kg</span>
          </>
        ) : <span className="xs muted" style={{ marginTop: 'auto' }}>{profile.goal === 'health' ? 'Mục tiêu: giữ cân ổn định' : 'Đã đạt cân nặng mục tiêu'}</span>}
      </Link>
    )
  }

  function mealsCard() {
    const meals = logs.meals.filter((m) => m.date === date)
    const n = dayNutrition(meals)
    const t = macroTargets(profile)
    const left = t.kcal - n.kcal
    const from = SLOTS.indexOf(mealSlot(now))
    const slot = SLOTS.slice(from).find((s) => !meals.some((m) => m.slot === s))
    const idea = slot ? suggestMeals({ dailyKcal: t.kcal, budget: profile.budget, goal: profile.goal, slot, n: 1, maxPrice: profile.budget - n.spent })[0] : undefined
    return (
      <section className="card">
        <div className="row between">
          <p className="lbl">Bữa ăn hôm nay</p>
          <Link to="/meals" className="link">Xem <ChevronRight size={16} /></Link>
        </div>
        <Link to="/meals" className="col" style={{ gap: 14 }}>
          <div className="row between" style={{ alignItems: 'flex-end' }}>
            <p><span className="num" style={{ fontSize: 40 }}>{vn(n.kcal)}</span><span className="small muted"> / {vn(t.kcal)} kcal</span></p>
            <span className={`tag ${left >= 0 ? 'green' : 'red'}`}>{left >= 0 ? `Còn ${vn(left)} kcal` : `Vượt ${vn(-left)} kcal`}</span>
          </div>
          <div className="col" style={{ gap: 8 }}>
            {([['Đạm', n.protein, t.protein, 'red'], ['Tinh bột', n.carb, t.carb, 'yellow'], ['Chất béo', n.fat, t.fat, 'blue']] as const).map(([name, v, goal, c]) => (
              <div key={name} className="macro">
                <b>{name}</b>
                <div className="bar"><i style={{ width: `${Math.min(100, (v / Math.max(1, goal)) * 100)}%`, background: PLATE[c] }} /></div>
                <span>{Math.round(v)}/{goal} g</span>
              </div>
            ))}
          </div>
        </Link>
        <div className="divider" />
        {idea && slot ? (
          <Link to={`/dish/${idea.id}`} className="next-meal">
            <DishArt kind={dishKind(idea.id, idea.name)} size={52} />
            <div className="grow col">
              <span className="lbl">Gợi ý bữa {slot.toLowerCase()}</span>
              <b style={{ fontWeight: 600 }}>{idea.name}</b>
              <span className="xs muted">{idea.kcal} kcal · {Math.round(idea.proteinG)} g đạm · {vnd(idea.price)}</span>
            </div>
            <ChevronRight size={18} className="chev" />
          </Link>
        ) : (
          <p className="small muted">Đã ghi đủ các bữa hôm nay.</p>
        )}
      </section>
    )
  }

  /** Một câu nhắc dựa trên số liệu thật, theo thứ tự ưu tiên */
  function coachTip(): ReactNode {
    const r = readiness(logs, now, session)
    const sleep = sleepMinutes(log?.sleep)
    const t = sleep !== null ? hm(sleep) : null
    const slept = t ? `Đêm qua bạn ngủ ${t.h} tiếng${t.m ? ` ${t.m} phút` : ''}. ` : ''
    if (r.measured && r.score < 60) return `${slept}Điểm sẵn sàng ${r.score}/100. ${r.advice}`
    if (session && (adjust.reps || adjust.rest || adjust.sets)) {
      if (adjust.sets < 0) return 'Buổi trước bạn thấy quá sức, hôm nay mỗi bài bớt 1 hiệp. Tập chậm và đúng dáng.'
      if (adjust.reps > 0) return `Các buổi trước bạn thấy nhẹ, hôm nay mỗi hiệp tăng thêm ${adjust.reps} lần. Cố giữ dáng chuẩn ở hiệp cuối.`
      if (adjust.rest > 0) return `Buổi trước khá nặng, hôm nay được nghỉ thêm ${adjust.rest} giây giữa các hiệp.`
    }
    // Nhóm cơ chính chưa tập tuần này
    const trained = new Set<Group>()
    for (let d = mondayOf(now); d <= now; d = addDays(d, 1)) {
      for (const [id, n] of Object.entries(logs.days[isoDate(d)]?.sets ?? {})) {
        const g = exById(id)?.group
        if (g && n > 0) trained.add(g)
      }
    }
    const missing = (['legs', 'upper', 'core'] as Group[]).filter((g) => !trained.has(g))
    if (dow >= 3 && missing.length && trained.size > 0) {
      const g = missing[0]
      const later = week.findIndex((s, i) => i >= dow && s?.groups.includes(g))
      return later === dow
        ? `Tuần này chưa tập ${MUSCLE[g].label.toLowerCase()}, buổi hôm nay sẽ bù lại.`
        : later > dow
          ? `Tuần này chưa tập ${MUSCLE[g].label.toLowerCase()}. ${WEEKDAY_LONG[later]} có buổi bù lại, đừng bỏ nhé.`
          : `Tuần này chưa tập ${MUSCLE[g].label.toLowerCase()}. Thêm vài bài trong thư viện vào ngày nghỉ nhé.`
    }
    if (now.getHours() >= 14 && water < 4) return `Mới uống ${liters(water)} lít nước. Uống thêm 2 ly trước buổi tập nhé.`
    if (r.measured) return `${slept}Điểm sẵn sàng ${r.score}/100. ${r.advice}`
    return session
      ? `Hôm nay tập ${session.title}: khởi động 5 phút trước, giãn cơ sau khi tập để đỡ đau cơ.`
      : 'Ngày nghỉ: đi bộ nhẹ 20 phút, uống đủ nước và ngủ sớm để cơ hồi phục.'
  }
}

function StepsSheet({ open, onClose, current, onSave }: { open: boolean; onClose: () => void; current: number; onSave: (n: number) => void }) {
  const [draft, setDraft] = useState('')
  const value = Number(draft.replace(/\D/g, ''))
  return (
    <Sheet open={open} onClose={onClose} title="Số bước hôm nay">
      <p className="small muted" style={{ padding: '0 4px' }}>
        Mở ứng dụng sức khỏe của điện thoại (Sức khỏe, Google Fit, Mi Fitness…), xem số bước hôm nay rồi nhập vào đây.
      </p>
      <label className="field">
        <span>Số bước{current ? ` · đang ghi ${vn(current)}` : ''}</span>
        <input inputMode="numeric" autoFocus placeholder={current ? String(current) : 'Ví dụ 6842'} value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))} aria-label="Số bước hôm nay" className="num" style={{ fontSize: 28 }} />
      </label>
      <button className="btn" disabled={!value || value > 100000} onClick={() => { onSave(value); setDraft(''); onClose() }}>Lưu số bước</button>
    </Sheet>
  )
}
