import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Clock, Heart, Info, Plus, ShoppingBag, ShoppingBasket, Target } from 'lucide-react'
import DishArt, { dishKind, dishTone, type DishKind } from '../components/DishArt'
import { ActionBar, BackButton, Body, Page, useToast, vn } from '../components/ui'
import { PLATE } from '../data/muscles'
import { RECIPES } from '../data/recipes'
import { DISHES } from '../ai/food/dishes'
import { mealSlot, type Slot } from '../ai/food/advice'
import { vnd } from '../lib/format'
import { dayWork } from '../logic/daily'
import { dayNutrition, foodById, foodReason } from '../logic/meals'
import { isActive } from '../logic/progress'
import { useToday } from '../logic/useToday'
import { kcalTarget, macroTargets } from '../profile'

const slotWord = (s: Slot) => (s === 'Bữa phụ' ? 'bữa phụ' : `bữa ${s.toLowerCase()}`)
const SLOT_NAMES: Slot[] = ['Sáng', 'Trưa', 'Bữa phụ', 'Tối']
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

// Mẹo gọi món mua ngoài cho nhẹ bụng, theo kiểu món
function outsideTips(kind: DishKind): string[] {
  if (['pho', 'bun', 'bunrieu', 'miquang', 'porridge'].includes(kind)) {
    return ['Gọi bát nhỏ hoặc xin ít bánh, ít bún, thêm rau giá.', 'Không húp hết nước dùng vì nhiều muối và mỡ.', 'Chọn thịt nạc (tái, nạm, chả) thay vì gầu, mỡ, lòng.']
  }
  if (['comtam', 'rice', 'ricebrown', 'xoi', 'beef'].includes(kind)) {
    return ['Xin ít cơm hoặc ít xôi, thêm dưa leo và rau.', 'Bỏ mỡ hành, nước mỡ và da gà.', 'Chọn thịt nướng, luộc thay vì món chiên.']
  }
  if (['pancake', 'khot', 'banhmi', 'cakes', 'banhcuon', 'leaf'].includes(kind)) {
    return ['Ăn kèm thật nhiều rau sống.', 'Thấm bớt dầu bằng giấy trước khi ăn.', 'Chấm ít nước mắm pha đường, chọn phần nhỏ.']
  }
  if (['bunkho', 'nem', 'claypot'].includes(kind)) {
    return ['Ăn cùng nhiều rau, ít bún hoặc cơm.', 'Hạn chế món chiên và mắm, nước chấm mặn.', 'Chia đôi phần nếu ăn chung.']
  }
  return ['Ăn chậm, dừng khi thấy no tám phần.', 'Ăn kèm rau hoặc trái cây.', 'Uống nước lọc thay nước ngọt.']
}

export default function Dish() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const nav = useNavigate()
  const toast = useToast()
  const { profile, store, session, log, date, now } = useToday()
  const food = foodById(id)

  if (!food) {
    return (
      <Page>
        <Body>
          <header className="row"><BackButton to="/meals" /></header>
          <h1 className="h1">Không tìm thấy món</h1>
          <p className="muted">Món này không còn trong danh sách gợi ý.</p>
        </Body>
      </Page>
    )
  }

  const kind = dishKind(food.id, food.name)
  const tone = dishTone(kind)
  const recipe = RECIPES[food.id]
  const street = DISHES.find((d) => d.id === food.id)
  const fav = store.logs.favorites.includes(food.id)
  const qSlot = params.get('slot') as Slot | null
  const slot: Slot = qSlot && SLOT_NAMES.includes(qSlot) ? qSlot : mealSlot(now)
  const trained = isActive(log)
  const reason = foodReason(food, [food], trained)

  // Hôm nay còn bao nhiêu calo và đạm
  const t = dayNutrition(store.logs.meals.filter((m) => m.date === date))
  const target = kcalTarget(profile)
  const macro = macroTargets(profile)
  const left = Math.round(target - t.kcal + dayWork(log, profile, session).kcal)
  const proteinLeft = Math.max(0, Math.round(macro.protein - t.protein))
  const fits = food.kcal <= left

  const e = { p: food.proteinG * 4, c: food.carbG * 4, f: food.fatG * 9 }
  const total = Math.max(1, e.p + e.c + e.f)
  const pct = (x: number) => Math.round((x / total) * 100)
  const pShare = e.p / total

  const tipTitle = fits ? 'Hợp với hôm nay' : 'Hơi nhiều cho hôm nay'
  const tipText = fits
    ? `Vừa ${vn(left)} kcal còn lại${proteinLeft > 0 ? `, bù thêm ${Math.min(proteinLeft, Math.round(food.proteinG))} g đạm` : ''}${trained ? ' sau buổi tập' : ''}.` +
      (pShare >= 0.27 ? ' Nhiều đạm, giúp no lâu.' : food.carbG * 4 / total <= 0.3 ? ' Ít tinh bột.' : '')
    : left > 0
      ? `Món này ${vn(food.kcal)} kcal, hôm nay chỉ còn ${vn(left)} kcal. Ăn khoảng ${Math.max(30, Math.round((left / food.kcal) * 100))}% phần hoặc chọn món nhẹ hơn.`
      : `Hôm nay đã đủ calo. Nếu vẫn đói, chọn món dưới 200 kcal như sữa chua, trái cây.`

  const priceK = food.price >= 1000 ? `${Math.round(food.price / 1000)}k` : vn(food.price)

  const addToLog = () => {
    store.addMeal({ date, slot, name: food.name, kcal: food.kcal, proteinG: food.proteinG, carbG: food.carbG, fatG: food.fatG, price: food.price, foodId: food.id, time: hhmm(new Date()) })
    toast(`Đã thêm ${food.name} vào ${slotWord(slot)}`)
    nav('/meals')
  }

  const toShopping = () => {
    if (!recipe) return
    store.addShopping(recipe.ingredients.map(([name, qty]) => ({ name, qty })))
    toast(`Đã thêm ${recipe.ingredients.length} nguyên liệu vào danh sách đi chợ`)
  }

  return (
    <Page>
      <Body>
        <div className="visual" style={{ background: `var(--${tone}-soft)`, height: 270 }}>
          <DishArt kind={kind} size={220} />
          <span className="tl"><BackButton to="/meals" /></span>
          <span className="tr">
            <button className="icon-btn" aria-label={fav ? 'Bỏ lưu món' : 'Lưu món'} aria-pressed={fav}
              onClick={() => { store.toggleFavorite(food.id); toast(fav ? 'Đã bỏ lưu món' : 'Đã lưu món') }}>
              <Heart size={20} fill={fav ? 'var(--red)' : 'none'} color={fav ? 'var(--red)' : 'currentColor'} />
            </button>
          </span>
          <span className="bl">
            <span className="pill">{recipe ? <><Clock size={14} /> {recipe.minutes} phút</> : <><ShoppingBag size={14} /> Mua ngoài</>}</span>
          </span>
        </div>

        <div className="col" style={{ gap: 8 }}>
          <h1 className="h1" style={{ fontSize: 27 }}>{food.name}</h1>
          <div className="chips">
            <span className={`tag ${reason.tone}`}>{reason.text}</span>
            <span className="tag">{recipe ? 'Tự nấu' : street ? 'Món Việt' : 'Mua ngoài'}</span>
            <span className="tag">1 người</span>
          </div>
        </div>

        <div className="stat4">
          {[[vn(food.kcal), 'kcal'], [`${Math.round(food.proteinG)} g`, 'đạm'], [priceK, 'đồng'], [recipe ? `${recipe.minutes}′` : '—', 'nấu']].map(([v, l]) => (
            <div key={l}><span className="num">{v}</span><span>{l}</span></div>
          ))}
        </div>

        <section className="card tight">
          <h2 className="h3">Năng lượng đến từ</h2>
          <div className="stack" style={{ height: 16 }}>
            <i style={{ flex: e.p, background: PLATE.red }} />
            <i style={{ flex: e.c, background: PLATE.yellow }} />
            <i style={{ flex: e.f, background: PLATE.blue }} />
          </div>
          <div className="stack-lg">
            {([['Đạm', food.proteinG, e.p, 'red'], ['Tinh bột', food.carbG, e.c, 'yellow'], ['Chất béo', food.fatG, e.f, 'blue']] as const).map(([n, g, en, c]) => (
              <div key={n}>
                <span className="nm"><i style={{ background: PLATE[c] }} />{n}</span>
                <span className="num">{pct(en)}%</span>
                <span className="xs muted">{Math.round(g)} g</span>
              </div>
            ))}
          </div>
        </section>

        <div className="tip" style={fits ? undefined : { background: 'var(--yellow-soft)' }}>
          <span className="ib" style={fits ? undefined : { background: 'var(--yellow)', color: '#14161A' }}>{fits ? <Target size={18} /> : <Info size={18} />}</span>
          <div className="col" style={{ gap: 3 }}>
            <b className="h3">{tipTitle}</b>
            <p className="small">{tipText}</p>
          </div>
        </div>

        {recipe ? (
          <>
            <section className="card tight">
              <div className="row between"><h2 className="h3">Nguyên liệu</h2><span className="xs muted">khoảng {vnd(recipe.cost)}</span></div>
              <ul className="ingr">
                {recipe.ingredients.map(([a, b]) => <li key={a}><span>{a}</span><span>{b}</span></li>)}
              </ul>
            </section>
            <section className="card">
              <h2 className="h3">Cách nấu</h2>
              <ol className="steps">
                {recipe.steps.map((s, i) => <li key={s}><span className="sn">{i + 1}</span><span>{s}</span></li>)}
              </ol>
            </section>
          </>
        ) : (
          <section className="card tight">
            <div className="row between">
              <h2 className="h3">Mua ngoài</h2>
              <span className="xs muted">{street ? `${vnd(street.priceVnd[0])}–${vnd(street.priceVnd[1])}` : `khoảng ${vnd(food.price)}`}</span>
            </div>
            <p className="small muted">Mẹo gọi món để bữa này nhẹ hơn:</p>
            <ol className="steps">
              {outsideTips(kind).map((s, i) => <li key={s}><span className="sn">{i + 1}</span><span>{s}</span></li>)}
            </ol>
            {street?.estimated && <p className="xs muted">Số liệu dinh dưỡng của món này là ước tính.</p>}
          </section>
        )}
      </Body>
      <ActionBar>
        {recipe && (
          <button className="btn ghost" style={{ flex: 1, padding: '0 16px' }} onClick={toShopping}><ShoppingBasket size={18} /> Đi chợ</button>
        )}
        <button className="btn" style={{ flex: recipe ? 1.5 : 1, padding: '0 16px' }} onClick={addToLog}><Plus size={18} /> Thêm vào {slotWord(slot)}</button>
      </ActionBar>
    </Page>
  )
}
