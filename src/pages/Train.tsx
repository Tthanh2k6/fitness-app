import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Camera, Check, ChevronDown, ChevronRight, Flame, Heart, Moon, Play, Search, Sparkles, Timer } from 'lucide-react'
import Barbell from '../components/Barbell'
import Pose, { poseOf } from '../components/Pose'
import { Body, MuscleTag, Page, Seg } from '../components/ui'
import { DIFFICULTY_LABEL, exById, GEAR_LABEL, LIBRARY, type Ex, type Gear } from '../data/exercises'
import { MUSCLE, PLATE, PLATE_INK, PLATE_SOFT, type Group } from '../data/muscles'
import { STRETCHES, stretchMinutes } from '../data/stretches'
import { addDays, isoDate, mondayOf, WEEKDAY_LONG, WEEKDAY_SHORT } from '../lib/format'
import type { Adjust } from '../logic/adjust'
import { plannedKcal } from '../logic/daily'
import { amountLabel, type PlanItem } from '../logic/plan'
import { isActive } from '../logic/progress'
import { doneCount, itemDone, nextIndex, setsDone } from '../logic/session'
import { useToday } from '../logic/useToday'
import { GOAL_LABEL, LEVEL_LABEL, type Profile } from '../profile'

type TabId = 'today' | 'week' | 'library'
const TABS: { v: TabId; label: string }[] = [{ v: 'today', label: 'Hôm nay' }, { v: 'week', label: 'Lịch tuần' }, { v: 'library', label: 'Thư viện' }]

/** Dụng cụ ngắn gọn cho chip: "Thảm, tạ đơn" */
const gearShort = (p: Profile) =>
  p.place === 'gym' ? 'Phòng gym' : p.equipment.length ? p.equipment.map((x, i) => (i ? x.toLowerCase() : x)).join(', ') : 'Không dụng cụ'

/** "Buổi này đã tăng 2 lần mỗi hiệp, nghỉ thêm 15 giây" */
function adjustNote(a: Adjust) {
  const parts: string[] = []
  if (a.reps > 0) parts.push(`tăng ${a.reps} lần mỗi hiệp`)
  if (a.reps < 0) parts.push(`giảm ${-a.reps} lần mỗi hiệp`)
  if (a.sets < 0) parts.push(`bớt ${-a.sets} hiệp mỗi bài`)
  if (a.rest > 0) parts.push(`nghỉ thêm ${a.rest} giây giữa hiệp`)
  return parts.length ? `Đã ${parts.join(', ')} theo cảm nhận các buổi trước.` : null
}

export default function Train() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const tab: TabId = raw === 'week' || raw === 'library' ? raw : 'today'
  const [openDay, setOpenDay] = useState<number | null>(null)
  const setTab = (t: TabId) => setParams(t === 'today' ? {} : { tab: t }, { replace: true })

  return (
    <Page nav="train">
      <Body>
        <header className="row between">
          <h1 className="h1">Tập luyện</h1>
          <button className="icon-btn" onClick={() => setTab('library')} aria-label="Tìm trong thư viện bài tập"><Search size={20} /></button>
        </header>
        <Seg options={TABS} value={tab} onChange={setTab} />
        {tab === 'today' && <TodayTab onDay={(i) => { setOpenDay(i); setTab('week') }} />}
        {tab === 'week' && <WeekTab openDay={openDay} setOpenDay={setOpenDay} />}
        {tab === 'library' && <LibraryTab />}
      </Body>
    </Page>
  )
}

function ExThumb({ e, size = 60, pose = 60 }: { e: Ex; size?: number; pose?: number }) {
  const c = MUSCLE[e.group].plate
  return (
    <span className="thumb" style={{ background: PLATE_SOFT[c], width: size, height: size, borderRadius: size < 50 ? 13 : 16 }}>
      <Pose name={poseOf(e)} size={pose} color={PLATE_INK[c]} />
    </span>
  )
}

function Part({ n, title, meta, done }: { n: number; title: string; meta: string; done?: boolean }) {
  return (
    <div className="part">
      <span className={`n ${done ? 'done' : ''}`}>{done ? <Check size={14} strokeWidth={3} /> : n}</span>
      <h2 className="h2 grow">{title}</h2>
      <span className="xs muted">{meta}</span>
    </div>
  )
}

function PhaseCard({ to, tone, title, desc, done, icon }: { to: string; tone: 'yellow' | 'green'; title: string; desc: string; done?: boolean; icon: ReactNode }) {
  return (
    <Link to={to} className="phase" style={{ background: `var(--${tone}-soft)` }}>
      <span className={`pi ${done ? 'done' : ''}`}>{done ? <Check size={22} strokeWidth={3} /> : icon}</span>
      <span className="grow col">
        <b style={{ fontWeight: 600 }}>{title}{done ? ' · đã xong' : ''}</b>
        <span className="xs muted">{desc}</span>
      </span>
      <ChevronRight size={18} className="chev" />
    </Link>
  )
}

function TodayTab({ onDay }: { onDay: (i: number) => void }) {
  const { profile, store, week, now, date, dow, session, log, adjust } = useToday()
  const monday = mondayOf(now)

  const strip = (
    <div className="wk-days">
      {week.map((s, i) => {
        const d = addDays(monday, i)
        const dl = store.logs.days[isoDate(d)]
        const done = s ? doneCount(s, dl) === s.items.length : false
        const trained = i === dow ? done : isActive(dl)
        const g = s ? MUSCLE[s.groups[0]].plate : null
        return (
          <button key={i} className={`wk-day ${s ? '' : 'rest'} ${i === dow ? 'today' : ''}`} onClick={() => onDay(i)}
            aria-label={`${WEEKDAY_LONG[i]}: ${s ? s.title : 'nghỉ'}`}>
            <span className="wd">{WEEKDAY_SHORT[i]}</span>
            <span className="dn">{d.getDate()}</span>
            {trained ? <span className="ck"><Check size={10} strokeWidth={3.4} /></span> : <i className="pl" style={{ background: g ? PLATE[g] : 'var(--line)' }} />}
          </button>
        )
      })}
    </div>
  )

  if (!session) {
    const nextDow = [1, 2, 3, 4, 5, 6, 7].map((k) => (dow + k) % 7).find((d) => week[d])
    const next = nextDow !== undefined ? week[nextDow] : null
    return (
      <>
        {strip}
        <section className="card">
          <span className="ch-ic bg-blue-soft text-blue-ink" style={{ width: 48, height: 48 }}><Moon size={22} /></span>
          <div className="col" style={{ gap: 4 }}>
            <h2 className="h1" style={{ fontSize: 28 }}>Hôm nay nghỉ</h2>
            <p className="muted">Cơ bắp phát triển trong lúc nghỉ. Đi bộ nhẹ hoặc giãn cơ là đủ.</p>
          </div>
          {next && nextDow !== undefined && (
            <p className="small" style={{ background: 'var(--surface-2)', borderRadius: 14, padding: '10px 12px' }}>
              Buổi tiếp theo: <b>{WEEKDAY_LONG[nextDow]}</b> · {next.title} · {next.minutes} phút
            </p>
          )}
          <button className="btn ghost" onClick={() => onDay(nextDow ?? dow)}>Xem lịch cả tuần</button>
        </section>
        <PhaseCard to="/stretch?phase=cooldown" tone="green" title="Giãn cơ thư giãn" desc={STRETCHES.cooldown.map((s) => s.name).join(' · ')}
          done={log?.cooldown} icon={<Pose name="fold" size={52} color="var(--green-ink)" floor={false} />} />
      </>
    )
  }

  const items = session.items.map((it) => ({ it, e: exById(it.exId)! }))
  const done = doneCount(session, log)
  const next = nextIndex(session, log)
  const note = adjustNote(adjust)
  const label = next === -1 ? 'Giãn cơ sau tập' : `${done ? 'Tập tiếp' : 'Bắt đầu'}: ${items[next].e.name}`
  // Buổi nhiều bài thì đĩa mỏng lại để thanh đòn vẫn vừa khung
  const per = Math.min(27, 196 / items.length)
  const gap = Math.max(3, Math.round(per * 0.2))

  return (
    <>
      {strip}
      <section className="card hero">
        <div className="row between">
          <p className="lbl">{WEEKDAY_LONG[dow]} · {GOAL_LABEL[profile.goal]}</p>
          <span className="tag on-hero"><Timer size={14} /> {session.minutes} phút</span>
        </div>
        <h2 className="h1" style={{ fontSize: 28 }}>{session.title}</h2>
        <div className="chips">
          <span className="tag on-hero">{items.length} bài</span>
          <span className="tag on-hero"><Flame size={13} /> ~{plannedKcal(session, profile)} kcal</span>
          <span className="tag on-hero">{gearShort(profile)}</span>
        </div>
        <div className="row between">
          <Barbell plates={items.map(({ it, e }) => (itemDone(it, log) ? { c: MUSCLE[e.group].plate, pct: 1 } : { outline: true as const }))}
            w={250} h={92} pw={per - gap} gap={gap} ph={84} label={`Đã xong ${done} trên ${items.length} bài`} />
          <div className="col" style={{ alignItems: 'flex-end' }}>
            <span className="num" style={{ fontSize: 40 }}>{done}/{items.length}</span>
            <span className="xs muted" style={{ whiteSpace: 'nowrap' }}>bài đã xong</span>
          </div>
        </div>
        {note && <p className="hint"><Sparkles size={16} /><span>{note}</span></p>}
        <Link to={next === -1 ? '/stretch?phase=cooldown' : '/workout'} className="btn light"><Play size={18} /> {label}</Link>
      </section>

      <Part n={1} title="Khởi động" meta={`${stretchMinutes(STRETCHES.warmup)} phút · ${STRETCHES.warmup.length} động tác`} done={log?.warmup} />
      <PhaseCard to="/stretch?phase=warmup" tone="yellow" title="Làm nóng cơ thể" desc={STRETCHES.warmup.map((s) => s.name).join(' · ')}
        done={log?.warmup} icon={<Pose name="jack" size={52} color="var(--yellow-ink)" floor={false} />} />

      <Part n={2} title="Bài chính" meta={`${items.length} bài · ${done} đã xong`} done={next === -1} />
      <ul className="ex-list">
        {items.map(({ it, e }) => <ExRow key={e.id} it={it} e={e} done={itemDone(it, log)} partial={setsDone(it, log)}
          onToggle={(ok) => store.setSets(date, e.id, ok ? 0 : it.sets, it.amount)} />)}
      </ul>

      <Part n={3} title="Giãn cơ" meta={`${stretchMinutes(STRETCHES.cooldown)} phút · ${STRETCHES.cooldown.length} động tác`} done={log?.cooldown} />
      <PhaseCard to="/stretch?phase=cooldown" tone="green" title="Thả lỏng và hồi phục" desc={STRETCHES.cooldown.map((s) => s.name).join(' · ')}
        done={log?.cooldown} icon={<Pose name="fold" size={52} color="var(--green-ink)" floor={false} />} />

      <Link to="/done" className="btn line">Kết thúc buổi tập</Link>
    </>
  )
}

function ExRow({ it, e, done, partial, onToggle }: { it: PlanItem; e: Ex; done: boolean; partial: number; onToggle: (done: boolean) => void }) {
  return (
    <li className={`ex ${done ? 'done' : ''}`}>
      <Link to={`/exercise/${e.id}?from=today`} className="ex-main">
        <ExThumb e={e} />
        <span className="ex-txt">
          <b>{e.name}</b>
          <span className="ex-amt">{it.sets} × {amountLabel(it)}</span>
          <span className="ex-meta">
            <span>{partial > 0 && !done ? `xong ${partial}/${it.sets} hiệp` : `nghỉ ${it.rest}s`}</span>
            <MuscleTag group={e.group} />
            {e.ai && <span className="ai"><Camera size={12} strokeWidth={2.4} /> AI</span>}
          </span>
        </span>
      </Link>
      <button className="chk" onClick={() => onToggle(done)} aria-pressed={done} aria-label={`${done ? 'Bỏ đánh dấu' : 'Đánh dấu xong'} ${e.name}`}>
        <Check size={18} strokeWidth={3} />
      </button>
    </li>
  )
}

function WeekTab({ openDay, setOpenDay }: { openDay: number | null; setOpenDay: (i: number | null) => void }) {
  const { profile: p, week, now, dow, store } = useToday()
  const open = openDay ?? dow
  const monday = mondayOf(now)
  const sunday = addDays(monday, 6)
  const chips = [GOAL_LABEL[p.goal], LEVEL_LABEL[p.level], `${p.minutes} phút/buổi`, `${p.days} buổi/tuần`, gearShort(p)]

  return (
    <>
      <div className="col" style={{ gap: 8 }}>
        <p className="lbl">Tuần {monday.getDate()}/{monday.getMonth() + 1} – {sunday.getDate()}/{sunday.getMonth() + 1}</p>
        <div className="chips" style={{ alignItems: 'center' }}>
          {chips.map((t) => <span key={t} className="tag" style={{ background: 'var(--surface)' }}>{t}</span>)}
          <Link to="/setup?step=1&from=profile" className="link" style={{ padding: '0 4px' }}>Đổi</Link>
        </div>
        <p className="xs muted">Lịch tự sắp theo mục tiêu, trình độ, thời gian và dụng cụ của bạn.</p>
      </div>
      <ol className="col" style={{ gap: 8 }}>
        {week.map((s, i) => {
          const date = addDays(monday, i)
          const log = store.logs.days[isoDate(date)]
          const isToday = i === dow
          const done = s ? doneCount(s, log) : 0
          const complete = !!s && done === s.items.length
          const expanded = open === i && !!s
          return (
            <li key={i} className="card" style={{
              padding: 0, gap: 0,
              background: s ? 'var(--surface)' : 'transparent',
              boxShadow: isToday ? 'inset 0 0 0 2px var(--ink)' : s ? undefined : 'inset 0 0 0 1.5px var(--line)',
            }}>
              <button onClick={() => s && setOpenDay(expanded ? -1 : i)} disabled={!s} aria-expanded={expanded} className="row" style={{ padding: 14, width: '100%', gap: 12 }}>
                <span className="col" style={{ width: 40, alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <span className="lbl" style={{ fontSize: 12, color: isToday ? 'var(--ink)' : undefined }}>{WEEKDAY_SHORT[i]}</span>
                  <span className="num" style={{ fontSize: 26 }}>{date.getDate()}</span>
                </span>
                <span className="grow col" style={{ gap: 5 }}>
                  <b style={{ fontWeight: 600, color: s ? undefined : 'var(--ink-2)' }}>{s ? s.title : 'Nghỉ'}</b>
                  {s ? (
                    <span className="ex-meta">
                      {s.groups.map((g: Group) => <MuscleTag key={g} group={g} />)}
                      <span>{s.items.length} bài · {s.minutes} phút</span>
                    </span>
                  ) : <span className="ex-meta"><Moon size={12} /> Hồi phục</span>}
                </span>
                {complete && <span className="tag green"><Check size={12} /> Đã tập</span>}
                {!complete && done > 0 && <span className="tag">{done}/{s!.items.length}</span>}
                {isToday && !complete && <span className="tag" style={{ background: 'var(--cta)', color: 'var(--on-cta)' }}>Hôm nay</span>}
                {s && <ChevronDown size={18} className="chev" style={{ transform: expanded ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }} />}
              </button>
              {expanded && (
                <ul className="step-in col" style={{ gap: 6, padding: '0 12px 12px' }}>
                  {s.items.map((it) => {
                    const e = exById(it.exId)!
                    return (
                      <li key={it.exId}>
                        <Link to={`/exercise/${e.id}${isToday ? '?from=today' : ''}`} className="row" style={{ background: 'var(--surface-2)', borderRadius: 16, padding: 8, gap: 12 }}>
                          <ExThumb e={e} size={44} pose={44} />
                          <span className="grow" style={{ fontWeight: 600, fontSize: 14 }}>{e.name}</span>
                          <span className="ex-amt" style={{ fontSize: 15, color: 'var(--ink-2)' }}>{it.sets} × {amountLabel(it)}</span>
                        </Link>
                      </li>
                    )
                  })}
                  {isToday && <li><Link to="/workout" className="btn sm wide" style={{ marginTop: 4 }}><Play size={16} /> Tập buổi này</Link></li>}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
    </>
  )
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase()

function LibraryTab() {
  const { store } = useToday()
  const [group, setGroup] = useState<Group | 'all' | 'fav'>('all')
  const [gear, setGear] = useState<Gear | 'all'>('all')
  const [q, setQ] = useState('')
  const favs = store.logs.favorites
  const list = LIBRARY.filter((e) =>
    (group === 'all' || (group === 'fav' ? favs.includes(e.id) : e.group === group)) &&
    (gear === 'all' || e.gear === gear) &&
    norm(e.name).includes(norm(q)))

  const chip = (key: string, on: boolean, onClick: () => void, children: ReactNode, small = false) => (
    <button key={key} className={`choice ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on}
      style={{ flexShrink: 0, background: on ? undefined : 'var(--surface)', ...(small ? { height: 34, fontSize: 13, padding: '0 13px' } : null) }}>
      {children}
    </button>
  )

  return (
    <>
      <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: '0 14px', height: 50 }}>
        <Search size={18} className="text-ink-3" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm bài tập, ví dụ: squat" aria-label="Tìm bài tập" style={{ fontWeight: 500 }} />
      </label>
      <div className="hscroll" style={{ gap: 8 }}>
        {chip('all', group === 'all', () => setGroup('all'), 'Tất cả')}
        {(Object.keys(MUSCLE) as Group[]).map((k) => chip(k, group === k, () => setGroup(k), <><i className="plate" style={{ width: 6, height: 13, background: PLATE[MUSCLE[k].plate] }} />{MUSCLE[k].label}</>))}
        {chip('fav', group === 'fav', () => setGroup('fav'), <><Heart size={15} /> Đã lưu{favs.length ? ` (${favs.length})` : ''}</>)}
      </div>
      <div className="hscroll" style={{ gap: 6, marginTop: -6 }}>
        {chip('all', gear === 'all', () => setGear('all'), 'Mọi dụng cụ', true)}
        {(Object.keys(GEAR_LABEL) as Gear[]).map((g) => chip(g, gear === g, () => setGear(g), GEAR_LABEL[g], true))}
      </div>
      <p className="lbl">{list.length} bài</p>
      <ul className="grid2">
        {list.map((e) => {
          const c = MUSCLE[e.group].plate
          return (
            <li key={e.id}>
              <Link to={`/exercise/${e.id}`} className="col" style={{ position: 'relative', height: '100%', gap: 8, background: 'var(--surface)', borderRadius: 20, padding: 10 }}>
                <span className="thumb" style={{ width: '100%', height: 96, background: PLATE_SOFT[c] }}><Pose name={poseOf(e)} size={96} color={PLATE_INK[c]} /></span>
                {e.ai && <span className="tag blue" style={{ position: 'absolute', top: 16, right: 16, height: 24, padding: '0 8px' }} aria-label="Có camera AI"><Camera size={12} /> AI</span>}
                {favs.includes(e.id) && <span style={{ position: 'absolute', top: 18, left: 18, color: 'var(--red)' }}><Heart size={15} fill="currentColor" /></span>}
                <b style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{e.name}</b>
                <span className="ex-meta" style={{ marginTop: 'auto' }}><MuscleTag group={e.group} /><span>{DIFFICULTY_LABEL[e.difficulty]}</span></span>
              </Link>
            </li>
          )
        })}
        {list.length === 0 && <li className="small muted" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 24 }}>Không có bài nào khớp.</li>}
      </ul>
    </>
  )
}
