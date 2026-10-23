import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Check, ChevronLeft, ChevronRight, Droplet, Plus, ShoppingBasket, Trash2, Utensils, Wallet } from 'lucide-react'
import DishArt, { dishKind, dishTone } from '../components/DishArt'
import { Body, Page, Sheet, useToast, vn } from '../components/ui'
import { PLATE } from '../data/muscles'
import { MEAL_SHARE, mealSlot, type Slot } from '../ai/food/advice'
import { addDays, isoDate, vnd } from '../lib/format'
import { dayWork, liters, WATER_GOAL } from '../logic/daily'
import { dayNutrition, foodReason, SLOT_TONE, SLOTS, suggestMeals, type Food } from '../logic/meals'
import { isActive } from '../logic/progress'
import { useToday } from '../logic/useToday'
import { GOAL_LABEL, kcalTarget, macroTargets } from '../profile'
import type { MealLog } from '../store'

const MIN_SLOT_BUDGET = 20000

const slotWord = (s: Slot) => (s === 'Bữa phụ' ? 'bữa phụ' : `bữa ${s.toLowerCase()}`)
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

export default function Meals() {
  const { profile, store, session, now } = useToday()
  const toast = useToast()
  const [offset, setOffset] = useState(0)
  const sel = addDays(now, -offset)
  const date = isoDate(sel)
  const isToday = offset === 0
  const log = store.logs.days[date]
  const meals = store.logs.meals.filter((m) => m.date === date)
  const t = dayNutrition(meals)
  const target = kcalTarget(profile)
  const macro = macroTargets(profile)
  const burned = dayWork(log, profile, isToday ? session : null).kcal
  const remaining = target - t.kcal + burned
  const moneyLeft = profile.budget - t.spent
  const water = log?.water ?? 0
  const trained = isActive(log)

  const bySlot = (s: Slot) => meals.filter((m) => m.slot === s)
  const filledSlots = SLOTS.filter((s) => bySlot(s).length > 0)

  // Bữa gợi ý mặc định: bữa tiếp theo chưa ghi, tính từ giờ hiện tại
  const start = isToday ? SLOTS.indexOf(mealSlot(now)) : 0
  const defaultSlot = [...SLOTS.slice(start), ...SLOTS.slice(0, start)].find((s) => !meals.some((m) => m.slot === s)) ?? (isToday ? mealSlot(now) : 'Tối')
  const [picked, setPicked] = useState<{ date: string; slot: Slot } | null>(null)
  const slot = picked?.date === date ? picked.slot : defaultSlot
  const sugRef = useRef<HTMLDivElement>(null)

  const share = MEAL_SHARE[slot]
  const slotBudget = Math.max(MIN_SLOT_BUDGET, profile.budget * (slot === 'Bữa phụ' ? 0.15 : share + 0.05))
  const cap = moneyLeft > 0 ? Math.max(MIN_SLOT_BUDGET, Math.min(slotBudget * 1.3, moneyLeft)) : slotBudget
  const ideas = suggestMeals({ dailyKcal: target, budget: profile.budget, goal: profile.goal, slot, n: 6, maxPrice: moneyLeft > 0 ? moneyLeft : undefined })
  const allUnder = ideas.every((f) => f.price <= cap)

  const add = (f: Food) => {
    // Giữ nguyên bữa đang xem để danh sách gợi ý không nhảy sang bữa khác sau khi thêm
    setPicked({ date, slot })
    store.addMeal({ date, slot, name: f.name, kcal: f.kcal, proteinG: f.proteinG, carbG: f.carbG, fatG: f.fatG, price: f.price, foodId: f.id, time: isToday ? hhmm(new Date()) : undefined })
    toast(`Đã thêm ${f.name} vào ${slotWord(slot)}`)
  }
  const addedIds = new Set(bySlot(slot).map((m) => m.foodId ?? m.name))

  const chooseSlot = (s: Slot) => {
    setPicked({ date, slot: s })
    sugRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const setWater = (i: number) => {
    const next = i < water ? i : i + 1
    store.patchDay(date, { water: next })
  }

  const [active, setActive] = useState<MealLog | null>(null)
  const [shopOpen, setShopOpen] = useState(false)
  const shopping = store.logs.shopping
  const shopLeft = shopping.filter((s) => !s.done).length

  const dayLabel = offset === 0 ? 'Hôm nay' : offset === 1 ? 'Hôm qua' : `${sel.getDate()}/${sel.getMonth() + 1}`
  const macros: [string, number, number, 'red' | 'yellow' | 'blue'][] = [
    ['Đạm', t.protein, macro.protein, 'red'],
    ['Tinh bột', t.carb, macro.carb, 'yellow'],
    ['Chất béo', t.fat, macro.fat, 'blue'],
  ]

  return (
    <Page nav="meals">
      <Body>
        <header className="row between">
          <h1 className="h1">Bữa ăn</h1>
          <div className="row" style={{ gap: 6 }}>
            <button className="icon-btn" aria-label="Ngày trước" onClick={() => setOffset(offset + 1)}><ChevronLeft size={20} /></button>
            <span className="small" style={{ fontWeight: 600, minWidth: 56, textAlign: 'center' }}>{dayLabel}</span>
            <button className="icon-btn" aria-label="Ngày sau" disabled={isToday} style={isToday ? { opacity: 0.4 } : undefined}
              onClick={() => setOffset(Math.max(0, offset - 1))}><ChevronRight size={20} /></button>
          </div>
        </header>

        <section className="card">
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div>
              <p className="lbl">{remaining >= 0 ? 'Còn lại' : 'Vượt'}</p>
              <div className="kcal-big"><span className="num">{vn(Math.abs(remaining))}</span><span>kcal</span></div>
            </div>
            <div className="formula" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 3, paddingTop: 4 }}>
              <span>Mục tiêu <b>{vn(target)}</b></span>
              <span>Đã ăn <b>{vn(t.kcal)}</b></span>
              <span>Đã đốt <b>{vn(burned)}</b></span>
            </div>
          </div>
          <div className="stack" style={{ height: 16 }} aria-hidden>
            {SLOTS.map((s) => {
              const k = bySlot(s).reduce((a, m) => a + m.kcal, 0)
              return k > 0 ? <i key={s} style={{ flex: k, background: PLATE[SLOT_TONE[s]] }} /> : null
            })}
            {remaining > 0 && <i style={{ flex: remaining, background: 'var(--surface-2)' }} />}
          </div>
          <div className="legend">
            {SLOTS.map((s) => (
              <span key={s}>
                <i style={bySlot(s).length ? { background: PLATE[SLOT_TONE[s]] } : { background: 'var(--surface-2)', boxShadow: 'inset 0 0 0 1.5px var(--line)' }} />{s}
              </span>
            ))}
          </div>
          <div className="divider" />
          <div className="stack-lg">
            {macros.map(([n, v, goal, c]) => (
              <div key={n}>
                <span className="nm"><i style={{ background: PLATE[c] }} />{n}</span>
                <span className="num">{Math.round(v)}<small style={{ fontSize: 15, color: 'var(--ink-3)' }}>/{goal}g</small></span>
                <div className="bar" style={{ height: 6 }}><i style={{ width: `${Math.min(100, (v / Math.max(1, goal)) * 100)}%`, background: PLATE[c] }} /></div>
              </div>
            ))}
          </div>
          <div className="row" style={{ background: 'var(--surface-2)', borderRadius: 14, padding: '10px 12px', gap: 10 }}>
            <Wallet size={18} />
            <span className="small grow">Đã chi <b>{vnd(t.spent)}</b></span>
            <span className="small muted">{moneyLeft >= 0 ? `còn ${vnd(moneyLeft)}` : `vượt ${vnd(-moneyLeft)}`}</span>
          </div>
        </section>

        <Link to="/scan" className="card hero" style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 }}>
          <span className="ch-ic" style={{ background: 'var(--hero-2)', color: 'var(--on-hero)' }}><Camera size={24} /></span>
          <span className="grow col" style={{ gap: 2 }}>
            <b className="h3">Chụp món để tính calo</b>
            <span className="xs muted">Nhận ra 28 món Việt như phở, bún bò, cơm tấm</span>
          </span>
          <ChevronRight size={20} />
        </Link>

        <div className="sec"><h2 className="h2">{isToday ? 'Hôm nay đã ăn' : `${dayLabel} đã ăn`}</h2><span className="xs muted">{filledSlots.length}/4 bữa</span></div>
        <div className="list-card">
          {SLOTS.flatMap((s) => {
            const list = bySlot(s)
            if (!list.length) {
              const aim = target * MEAL_SHARE[s]
              const lo = Math.round((aim * 0.9) / 10) * 10
              const hi = Math.round((aim * 1.1) / 10) * 10
              return [
                <div key={s} className="meal">
                  <div className="when"><b>{s}</b><span>--:--</span></div>
                  <span className="empty"><Plus size={20} /></span>
                  <div className="grow col">
                    <span style={{ fontWeight: 600, fontSize: 14 }}>Chưa ghi</span>
                    <span className="xs muted">Gợi ý {vn(lo)}–{vn(hi)} kcal</span>
                  </div>
                  <button className="mini-btn plain" onClick={() => chooseSlot(s)}>Thêm</button>
                </div>,
              ]
            }
            // Bấm vào bữa đã ghi để xem món hoặc xoá
            return list.map((m) => (
              <button key={m.id} className="meal" style={{ width: '100%', textAlign: 'left' }} onClick={() => setActive(m)} aria-label={`${m.name}, ${s}`}>
                <div className="when"><b>{s}</b><span>{m.time ?? '--:--'}</span></div>
                <span className="dish"><DishArt kind={dishKind(m.foodId, m.name)} size={46} /></span>
                <div className="grow col" style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</span>
                  <span className="xs muted">{vn(m.kcal)} kcal · {Math.round(m.proteinG)} g đạm · {vnd(m.price)}</span>
                </div>
              </button>
            ))
          })}
        </div>

        <div ref={sugRef} className="sec" style={{ scrollMarginTop: 16 }}>
          <h2 className="h2">Gợi ý cho {slotWord(slot)}</h2>
          <span className="xs muted">{allUnder ? `dưới ${vnd(cap)}` : 'theo ngân sách'}</span>
        </div>
        <div className="chipset" role="tablist">
          {SLOTS.map((s) => (
            <button key={s} role="tab" aria-selected={s === slot} className={`choice ${s === slot ? 'on' : ''}`} style={{ height: 34, padding: '0 14px', fontSize: 13 }}
              onClick={() => setPicked({ date, slot: s })}>{s}</button>
          ))}
        </div>
        <div className="hscroll">
          {ideas.map((f) => {
            const kind = dishKind(f.id, f.name)
            const reason = foodReason(f, ideas, trained)
            const on = addedIds.has(f.id) || addedIds.has(f.name)
            return (
              <div key={f.id} className="food">
                <div className="pw">
                  <Link to={`/dish/${f.id}?slot=${encodeURIComponent(slot)}`} className="pic" style={{ background: `var(--${dishTone(kind)}-soft)` }} aria-label={`Xem ${f.name}`}>
                    <DishArt kind={kind} size={100} />
                  </Link>
                  <button className={`add ${on ? 'done' : ''}`} disabled={on} onClick={() => add(f)}
                    aria-label={on ? 'Đã thêm' : `Thêm ${f.name} vào ${slotWord(slot)}`}>
                    {on ? <Check size={18} strokeWidth={2.4} /> : <Plus size={18} strokeWidth={2.4} />}
                  </button>
                </div>
                <span className={`tag ${reason.tone}`} style={{ alignSelf: 'flex-start' }}>{reason.text}</span>
                <b style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3, minHeight: 36 }}>{f.name}</b>
                <div className="col">
                  <span className="num" style={{ fontSize: 20 }}>{vn(f.kcal)} kcal</span>
                  <span className="xs muted">{Math.round(f.proteinG)} g đạm · {vnd(f.price)}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="sec">
          <h2 className="h2">Nước</h2>
          <span className="xs muted"><b className="num" style={{ fontSize: 16, color: 'var(--ink)' }}>{liters(water)}</b> / {liters(WATER_GOAL)} lít</span>
        </div>
        <div className="glass-row">
          {Array.from({ length: WATER_GOAL }, (_, i) => (
            <button key={i} className={`glass ${i < water ? 'on' : ''}`} onClick={() => setWater(i)}
              aria-label={i < water ? `Bỏ ly thứ ${i + 1}` : `Ghi ly thứ ${i + 1}`}>
              {i < water ? <Droplet size={14} /> : <Plus size={14} />}
            </button>
          ))}
        </div>

        {shopping.length > 0 && (
          <button className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }} onClick={() => setShopOpen(true)}>
            <span className="ch-ic" style={{ background: 'var(--green-soft)', color: 'var(--green-ink)', width: 44, height: 44 }}><ShoppingBasket size={22} /></span>
            <span className="grow col" style={{ gap: 2 }}>
              <b className="h3">Danh sách đi chợ</b>
              <span className="xs muted">{shopLeft ? `Còn ${shopLeft}/${shopping.length} món cần mua` : 'Đã mua đủ'}</span>
            </span>
            <ChevronRight size={18} className="chev" />
          </button>
        )}

        <p className="xs muted">
          Calo là số ước tính cho một phần ăn thông thường. Gợi ý theo mục tiêu {GOAL_LABEL[profile.goal].toLowerCase()} và tiền ăn {vnd(profile.budget)} mỗi ngày.
        </p>
      </Body>

      <Sheet open={!!active} onClose={() => setActive(null)} title={active?.name}>
        {active && (
          <>
            <p className="small muted" style={{ padding: '0 4px' }}>
              {active.slot}{active.time ? ` · ${active.time}` : ''} · {vn(active.kcal)} kcal · {Math.round(active.proteinG)} g đạm · {vnd(active.price)}
            </p>
            {active.foodId && (
              <Link to={`/dish/${active.foodId}`} className="ov-item">
                <span className="ch-ic" style={{ background: 'var(--green-soft)', color: 'var(--green-ink)', width: 46, height: 46 }}><Utensils size={22} /></span>
                <span className="grow col"><b style={{ fontWeight: 600 }}>Xem món</b><span className="xs muted">Dinh dưỡng, công thức hoặc mẹo gọi món</span></span>
                <ChevronRight size={18} className="chev" />
              </Link>
            )}
            <button className="ov-item" onClick={() => { store.removeMeal(active.id); toast(`Đã xoá ${active.name}`); setActive(null) }}>
              <span className="ch-ic" style={{ background: 'var(--red-soft)', color: 'var(--red-ink)', width: 46, height: 46 }}><Trash2 size={22} /></span>
              <span className="grow col"><b style={{ fontWeight: 600 }}>Xoá khỏi nhật ký</b><span className="xs muted">Ghi nhầm hoặc không ăn món này</span></span>
            </button>
            <button className="btn ghost" onClick={() => setActive(null)}>Đóng</button>
          </>
        )}
      </Sheet>

      <Sheet open={shopOpen} onClose={() => setShopOpen(false)} title="Danh sách đi chợ">
        <div className="list-card">
          {shopping.map((s, i) => (
            <button key={`${s.name}-${i}`} className="lrow" onClick={() => store.toggleShopping(i)} aria-pressed={s.done}>
              <span className={`chk ${s.done ? 'on' : ''}`} style={{ width: 26, height: 26 }}><Check size={14} strokeWidth={3} /></span>
              <span className="grow" style={{ fontWeight: 500, textDecoration: s.done ? 'line-through' : undefined, color: s.done ? 'var(--ink-3)' : undefined }}>{s.name}</span>
              <span className="v num" style={{ fontSize: 15 }}>{s.qty}</span>
            </button>
          ))}
        </div>
        <div className="row">
          <button className="btn ghost" style={{ flex: 1 }} disabled={!shopping.some((s) => s.done)}
            onClick={() => { store.clearShopping(true); toast('Đã xoá các món đã mua') }}>Xoá món đã mua</button>
          <button className="btn line" style={{ flex: 1 }}
            onClick={() => { store.clearShopping(); setShopOpen(false); toast('Đã xoá danh sách đi chợ') }}><Trash2 size={18} /> Xoá hết</button>
        </div>
      </Sheet>
    </Page>
  )
}
