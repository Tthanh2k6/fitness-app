import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, Check, ChevronRight, Flame, Play, Plus, Share2, Trophy, X } from 'lucide-react'
import Barbell, { type BarPlate } from '../components/Barbell'
import DishArt, { dishKind } from '../components/DishArt'
import { ActionBar, Body, Page, useToast, vn } from '../components/ui'
import { exById } from '../data/exercises'
import { MUSCLE } from '../data/muscles'
import { mealSlot } from '../ai/food/advice'
import { WEEKDAY_LONG, vnd } from '../lib/format'
import { RPE_EFFECT, RPE_LABEL } from '../logic/adjust'
import { dayWork } from '../logic/daily'
import { suggestMeals } from '../logic/meals'
import { prescribe, type PlanItem } from '../logic/plan'
import { streak } from '../logic/progress'
import { featLabel, newRecords } from '../logic/records'
import { itemDone } from '../logic/session'
import { useToday } from '../logic/useToday'
import { kcalTarget } from '../profile'

const mmss = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function Done() {
  const { profile, session, log, date, store, now, dow, week } = useToday()
  const nav = useNavigate()
  const toast = useToast()
  const { logs } = store

  // Ngày nghỉ mà vẫn tập thêm bài lẻ thì tổng kết theo các bài đã ghi
  const loggedIds = Object.keys(log?.sets ?? {}).filter((id) => (log?.sets[id] ?? 0) > 0)
  const items: PlanItem[] = session?.items ?? loggedIds.filter((id) => exById(id)).map((id) => ({ exId: id, ...prescribe(exById(id)!, profile) }))
  const title = session?.title ?? 'Tập thêm'
  const touched = loggedIds.length > 0
  const doneItems = items.filter((it) => itemDone(it, log))
  const allDone = items.length > 0 && doneItems.length === items.length

  useEffect(() => {
    // Ghi giờ kết thúc buổi khi mở trang tổng kết lần đầu
    if (touched && !log?.finishedAt) store.finishSession(date)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Buổi nhiều bài thì đĩa mỏng lại để thanh đòn vẫn vừa khung
  const per = Math.min(36, 264 / Math.max(1, items.length))
  const pw = Math.round(per * 0.84)
  const plates: BarPlate[] = items.map((it) => (itemDone(it, log) ? { c: MUSCLE[exById(it.exId)!.group].plate, pct: 1 } : { outline: true }))
  const elapsed = log?.startedAt ? (log.finishedAt ?? Date.now()) - log.startedAt : 0
  const work = dayWork(log, profile, session)
  const totalSets = Object.values(log?.sets ?? {}).reduce((a, n) => a + n, 0)
  const forms = Object.values(log?.form ?? {})
  const formReps = forms.reduce((a, f) => a + f.reps, 0)
  const formPct = formReps ? Math.round((forms.reduce((a, f) => a + f.good, 0) / formReps) * 100) : null
  const chain = streak(logs, week, now)
  const pr = newRecords(logs, profile, date)[0]
  const prEx = pr ? exById(pr.now.exId) : undefined
  const rpe = log?.rpe

  const slot = mealSlot(now)
  const ideas = suggestMeals({ dailyKcal: kcalTarget(profile), budget: profile.budget, goal: profile.goal, slot, n: 2 })
  const eaten = logs.meals.filter((m) => m.date === date && m.slot === slot)
  const added = (id: string, name: string) => eaten.some((m) => m.foodId === id || m.name === name)
  const hhmm = () => `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const share = async () => {
    const text = touched
      ? `Mình vừa xong buổi ${title} trên FitCoach: ${doneItems.length}/${items.length} bài, ${totalSets} hiệp, ${work.kcal} kcal trong ${mmss(elapsed)}. Chuỗi ${chain} buổi liền!`
      : `Hôm nay mình tập ${title} với FitCoach.`
    try {
      if (navigator.share) await navigator.share({ title: 'FitCoach', text })
      else {
        await navigator.clipboard.writeText(text)
        toast('Đã chép tóm tắt buổi tập')
      }
    } catch {
      // người dùng đóng bảng chia sẻ
    }
  }

  const stat = (v: string, l: string) => (
    <div key={l} style={{ background: 'var(--cam-2)', borderRadius: 20, padding: 14 }}>
      <span className="num" style={{ fontSize: 38 }}>{v}</span>
      <p className="small" style={{ color: 'var(--cam-ink-2)', marginTop: 4 }}>{l}</p>
    </div>
  )

  return (
    <Page cam>
      <Body gap={18}>
        <div className="row between">
          <Link to="/home" className="icon-btn" aria-label="Đóng"><X size={22} /></Link>
          <button className="icon-btn" onClick={() => void share()} aria-label="Chia sẻ"><Share2 size={20} /></button>
        </div>

        <div className="col" style={{ alignItems: 'center', gap: 6, textAlign: 'center' }}>
          {items.length > 0 && (
            <Barbell plates={plates} w={330} h={150} pw={pw} gap={per - pw} ph={140} anim shaft="var(--cam-ink-2)" empty="var(--cam-3)"
              label={`Đã xong ${doneItems.length} trên ${items.length} bài`} />
          )}
          <p className="lbl" style={{ color: 'var(--cam-ink-2)', marginTop: 6 }}>{WEEKDAY_LONG[dow]} {now.getDate()}/{now.getMonth() + 1} · {title}</p>
          <h1 className="h1" style={{ fontSize: 36 }}>{!touched ? 'Chưa tập bài nào' : allDone ? 'Xong buổi tập!' : `Đã tập ${doneItems.length}/${items.length} bài`}</h1>
          {touched && chain > 0 && <p className="row" style={{ gap: 6, color: '#FFC34A', fontWeight: 600 }}><Flame size={18} /> Chuỗi {chain} buổi liền</p>}
        </div>

        {!touched ? (
          session ? (
            <Link to="/workout" className="btn wide" style={{ background: 'var(--cam-ink)', color: '#14161A' }}><Play size={18} /> Bắt đầu buổi tập</Link>
          ) : (
            <p className="small" style={{ color: 'var(--cam-ink-2)', textAlign: 'center' }}>Hôm nay là ngày nghỉ. Giãn cơ nhẹ hoặc đi bộ là đủ.</p>
          )
        ) : (
          <div className="grid2">
            {stat(elapsed ? mmss(elapsed) : '–', 'thời gian')}
            {stat(vn(work.kcal), 'kcal đã đốt')}
            {stat(String(totalSets), 'hiệp')}
            {formPct !== null ? stat(`${formPct}%`, 'dáng chuẩn') : stat(`${doneItems.length}/${items.length}`, 'bài xong')}
          </div>
        )}

        {pr && prEx && (
          <div className="pop" style={{ background: 'var(--cam-2)', borderRadius: 20, padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span className="ch-ic" style={{ background: '#F1B11A', color: '#14161A', width: 44, height: 44 }}><Trophy size={22} /></span>
            <div className="grow">
              <p className="lbl" style={{ color: 'var(--cam-ink-2)' }}>Kỷ lục mới</p>
              <p style={{ fontWeight: 600 }}>{prEx.name} {featLabel(pr.now)}</p>
            </div>
            <span className="small" style={{ color: 'var(--cam-ink-2)', textAlign: 'right' }}>trước: {featLabel(pr.before)}</span>
          </div>
        )}

        {touched && (
          <div className="col" style={{ gap: 10 }}>
            <p className="h3">Buổi này thấy thế nào?</p>
            <div className="chipset" role="radiogroup" aria-label="Mức nặng của buổi tập">
              {RPE_LABEL.map((t, i) => (
                <button key={t} className={`choice ${rpe === i ? 'on' : ''}`} role="radio" aria-checked={rpe === i}
                  onClick={() => store.patchDay(date, { rpe: i })}>{t}</button>
              ))}
            </div>
            <p className="xs" style={{ color: 'var(--cam-ink-2)' }}>
              {rpe === undefined ? 'Chọn mức nặng để FitCoach tự điều chỉnh số lần, số hiệp cho buổi sau.' : `Buổi sau FitCoach sẽ ${RPE_EFFECT[rpe]}.`}
            </p>
          </div>
        )}

        <div className="col" style={{ gap: 10 }}>
          <div className="row between">
            <p className="h3">{touched ? 'Nạp lại năng lượng' : `Gợi ý bữa ${slot.toLowerCase()}`}</p>
            <Link to="/meals" className="link" style={{ color: 'var(--cam-ink-2)' }}>Xem tất cả <ChevronRight size={16} /></Link>
          </div>
          {ideas.map((f) => {
            const on = added(f.id, f.name)
            return (
              <div key={f.id} className="row" style={{ background: 'var(--cam-2)', borderRadius: 20, padding: 10, gap: 12 }}>
                <Link to={`/dish/${f.id}`} className="row grow" style={{ gap: 12 }}>
                  <DishArt kind={dishKind(f.id, f.name)} size={44} />
                  <span className="grow col" style={{ gap: 2 }}>
                    <b style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</b>
                    <span className="xs" style={{ color: 'var(--cam-ink-2)' }}>{f.kcal} kcal · {Math.round(f.proteinG)} g đạm · {vnd(f.price)}</span>
                  </span>
                </Link>
                <button disabled={on} aria-label={on ? 'Đã thêm' : `Thêm ${f.name} vào bữa ${slot.toLowerCase()}`}
                  onClick={() => {
                    store.addMeal({ date, slot, name: f.name, kcal: f.kcal, proteinG: f.proteinG, carbG: f.carbG, fatG: f.fatG, price: f.price, foodId: f.id, time: hhmm() })
                    toast(`Đã thêm ${f.name} vào bữa ${slot.toLowerCase()}`)
                  }}
                  style={{ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, background: on ? 'var(--green)' : 'var(--cam-ink)', color: on ? '#fff' : '#14161A' }}>
                  {on ? <Check size={18} strokeWidth={2.6} /> : <Plus size={18} strokeWidth={2.4} />}
                </button>
              </div>
            )
          })}
          <Link to="/scan" className="next" style={{ padding: 12 }}>
            <span className="ch-ic" style={{ background: 'var(--cam-3)', width: 40, height: 40, borderRadius: 13 }}><Camera size={20} /></span>
            <span className="grow" style={{ fontWeight: 600 }}>Chụp bữa ăn sau tập</span>
            <ChevronRight size={18} style={{ color: 'var(--cam-ink-2)' }} />
          </Link>
        </div>
      </Body>
      <ActionBar>
        <button className="btn wide" style={{ background: 'var(--cam-ink)', color: '#14161A' }}
          onClick={() => {
            if (touched && !log?.finishedAt) store.finishSession(date)
            nav('/home')
          }}>
          {touched ? 'Lưu và về trang chủ' : 'Về trang chủ'}
        </button>
      </ActionBar>
    </Page>
  )
}
