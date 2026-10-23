import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, ChevronDown, CircleCheck, ImageIcon, Info, Loader2, Plus, RefreshCw, Search, TriangleAlert, X } from 'lucide-react'
import DishArt, { dishKind } from '../components/DishArt'
import { Page, Seg, Sheet, useToast, vn } from '../components/ui'
import { PLATE } from '../data/muscles'
import { recognizeDish, type DishGuess } from '../ai/food/classifier'
import { DISHES, type Dish } from '../ai/food/dishes'
import { adviseMeal, mealSlot, type Portion, type Slot } from '../ai/food/advice'
import { isoDate } from '../lib/format'
import { kcalTarget, useProfile, type Goal } from '../profile'
import { useStore } from '../store'

type Stage = 'pick' | 'analyzing' | 'result' | 'no-model' | 'error'

const PORTION_FACTOR: Record<Portion, number> = { s: 0.75, m: 1, l: 1.35 }
const BOWL: string[] = ['pho', 'bun', 'bunrieu', 'miquang', 'porridge', 'canhchua']
const slotWord = (s: Slot) => (s === 'Bữa phụ' ? 'bữa phụ' : `bữa ${s.toLowerCase()}`)
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase()

export default function Scan() {
  const { profile } = useProfile()
  const { addMeal } = useStore()
  const nav = useNavigate()
  const toast = useToast()
  const [stage, setStage] = useState<Stage>('pick')
  const [photo, setPhoto] = useState<string | null>(null)
  const [guesses, setGuesses] = useState<DishGuess[]>([])
  const [dish, setDish] = useState<Dish | null>(null)
  const [portion, setPortion] = useState<Portion>('m')
  const [picking, setPicking] = useState(false)
  const cameraInput = useRef<HTMLInputElement>(null)
  const galleryInput = useRef<HTMLInputElement>(null)
  const slot = useMemo(() => mealSlot(new Date()), [])

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo)
  }, [photo])

  const analyze = async (file?: File) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPhoto(url)
    setStage('analyzing')
    setPicking(false)
    setPortion('m')
    try {
      const img = new Image()
      img.src = url
      await img.decode()
      const out = await recognizeDish(img)
      if (!out) {
        setDish(null)
        setGuesses([])
        setStage('no-model')
        return
      }
      setGuesses(out)
      setDish(out[0]?.dish ?? null)
      setStage('result')
    } catch {
      setStage('error')
    }
  }

  const addToLog = () => {
    if (!dish) return
    const f = PORTION_FACTOR[portion]
    addMeal({
      date: isoDate(new Date()), slot, name: dish.name, kcal: dish.kcal[portion],
      proteinG: Math.round(dish.proteinG * f), carbG: Math.round(dish.carbG * f), fatG: Math.round(dish.fatG * f),
      price: Math.round((dish.priceVnd[0] + dish.priceVnd[1]) / 2000) * 1000, foodId: dish.id, time: hhmm(new Date()),
    })
    toast(`Đã thêm ${dish.name} vào ${slotWord(slot)}`)
    nav('/meals')
  }

  const retake = () => {
    setStage('pick')
    setPhoto(null)
    setGuesses([])
    setDish(null)
    setPicking(false)
  }

  const current = dish ? guesses.find((g) => g.dish.id === dish.id) : undefined
  const unsure = current ? current.p < 0.5 : false
  const others = guesses.filter((g) => g.dish.id !== dish?.id)

  return (
    <Page cam>
      <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => void analyze(e.target.files?.[0])} />
      <input ref={galleryInput} type="file" accept="image/*" className="hidden" onChange={(e) => void analyze(e.target.files?.[0])} />

      <div className="camview" style={{ height: 440, flexShrink: 0, background: 'linear-gradient(180deg,#3A2E26 0%,#2B221C 100%)' }}>
        {photo ? (
          <img src={photo} alt="Ảnh món ăn vừa chụp" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <>
            <svg viewBox="0 0 390 440" preserveAspectRatio="none" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x="0" y={i * 76} width="390" height="74" fill="#000" opacity={0.05 + (i % 2) * 0.05} />)}
            </svg>
            <div style={{ position: 'absolute', left: '50%', top: 110, transform: 'translateX(-50%)', opacity: 0.28 }}>
              <DishArt kind="pho" size={220} />
            </div>
          </>
        )}
        <svg viewBox="0 0 390 440" aria-hidden style={{ position: 'absolute', left: '50%', top: 0, width: 390, height: 440, transform: 'translateX(-50%)' }}>
          <g stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity={photo ? 0.75 : 1}>
            <path d="M70 130 v-26 h26" /><path d="M320 130 v-26 h-26" /><path d="M70 330 v26 h26" /><path d="M320 330 v26 h-26" />
          </g>
        </svg>

        {/* Ảnh sáng thì phủ tối phần trên để nút và tiêu đề dễ đọc */}
        {photo && <div aria-hidden style={{ position: 'absolute', inset: '0 0 auto 0', height: 130, background: 'linear-gradient(180deg, rgb(0 0 0 / .55), transparent)', zIndex: 2 }} />}
        <div className="cam-top">
          <Link to="/meals" className="icon-btn" aria-label="Đóng"><X size={22} /></Link>
          <div className="cam-title"><p className="h3">Chụp món ăn</p></div>
          <button className="icon-btn" aria-label="Chọn ảnh có sẵn" onClick={() => galleryInput.current?.click()}><ImageIcon size={20} /></button>
        </div>

        {stage === 'analyzing' && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgb(0 0 0 / .3)', zIndex: 2 }}>
            <span className="tag" style={{ background: 'rgb(0 0 0 / .55)', color: '#fff', height: 36, fontSize: 14, padding: '0 14px' }}>
              <Loader2 size={16} className="spin" /> Đang nhận diện món...
            </span>
          </div>
        )}

        {stage === 'result' && dish && current && (
          <span className="tag" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 38, zIndex: 3, height: 30, fontSize: 13, color: '#fff', background: unsure ? '#B07A00' : '#11A068' }}>
            {unsure ? <TriangleAlert size={15} /> : <CircleCheck size={15} />} {dish.name} · chắc {Math.round(current.p * 100)}%
          </span>
        )}
      </div>

      <div className="sheet" style={{ marginTop: -28, flex: 1 }}>
        <i className="handle" />

        {stage === 'pick' && (
          <>
            <div className="col" style={{ gap: 6 }}>
              <h2 className="h2" style={{ fontSize: 22 }}>Chụp món bạn sắp ăn</h2>
              <p className="small muted">Chụp từ trên xuống, thấy rõ cả đĩa hoặc tô. AI nhận diện ngay trên máy, ảnh không gửi đi đâu.</p>
            </div>
            <button className="btn wide" onClick={() => cameraInput.current?.click()}><Camera size={18} /> Chụp ảnh</button>
            <button className="btn ghost wide" onClick={() => galleryInput.current?.click()}><ImageIcon size={18} /> Chọn ảnh có sẵn</button>
            <p className="xs muted" style={{ textAlign: 'center', textWrap: 'balance' }}>
              Model nhận diện do nhóm huấn luyện trên bộ ảnh 30VNFoods<br />(Do và cộng sự, IEEE COMNETSAT 2021, giấy phép CC BY-NC-SA 4.0)
            </p>
          </>
        )}

        {stage === 'analyzing' && (
          <p className="row small muted" style={{ gap: 8 }}><Loader2 size={16} className="spin" /> Đang nhận diện món trong ảnh...</p>
        )}

        {stage === 'error' && (
          <>
            <div className="tip" style={{ background: 'var(--red-soft)' }}>
              <span className="ib" style={{ background: 'var(--red)' }}><TriangleAlert size={18} /></span>
              <p className="small">Không đọc được ảnh hoặc không tải được AI. Kiểm tra mạng rồi chụp lại.</p>
            </div>
            <button className="btn wide" onClick={retake}><RefreshCw size={18} /> Chụp lại</button>
          </>
        )}

        {(stage === 'result' || stage === 'no-model') && (
          <>
            {stage === 'no-model' && (
              <div className="tip" style={{ background: 'var(--yellow-soft)' }}>
                <span className="ib" style={{ background: 'var(--yellow)', color: '#14161A' }}><Info size={18} /></span>
                <p className="small">Mô hình nhận diện món chưa sẵn sàng. Tạm thời bạn chọn món bằng tay.</p>
              </div>
            )}
            {dish ? (
              <DishResult dish={dish} portion={portion} setPortion={setPortion} slot={slot}
                dailyKcal={kcalTarget(profile)} goal={profile.goal} unsure={unsure} onRename={() => setPicking(true)} />
            ) : (
              <DishPicker current={null} onPick={(d) => setDish(d)} />
            )}
            {dish && (
              <p className="xs muted" style={{ lineHeight: 1.7 }}>
                Không phải món này?{' '}
                {others.map((g) => (
                  <span key={g.dish.id}>
                    <button className="link" style={{ fontSize: 12, textDecoration: 'underline' }} onClick={() => setDish(g.dish)}>{g.dish.name}</button>
                    {' · '}
                  </span>
                ))}
                <button className="link" style={{ fontSize: 12, textDecoration: 'underline' }} onClick={() => setPicking(true)}>Chọn món khác</button>
              </p>
            )}
            <button className="btn wide" disabled={!dish} onClick={addToLog}><Plus size={18} /> Thêm vào {slotWord(slot)}</button>
            <button className="btn ghost wide sm" onClick={retake}><RefreshCw size={16} /> Chụp lại</button>
          </>
        )}
      </div>

      <Sheet open={picking} onClose={() => setPicking(false)} title="Chọn đúng món">
        <DishPicker current={dish} onPick={(d) => { setDish(d); setPicking(false) }} />
      </Sheet>
    </Page>
  )
}

function DishResult({ dish, portion, setPortion, slot, dailyKcal, goal, unsure, onRename }: {
  dish: Dish; portion: Portion; setPortion: (p: Portion) => void; slot: Slot; dailyKcal: number; goal: Goal; unsure: boolean; onRename: () => void
}) {
  const kcal = dish.kcal[portion]
  const f = PORTION_FACTOR[portion]
  const advice = adviseMeal({ kcal, proteinG: dish.proteinG * f, dailyKcal, slot, goal })
  const lo = Math.round((kcal * 0.88) / 10) * 10
  const hi = Math.round((kcal * 1.12) / 10) * 10
  const unit = BOWL.includes(dishKind(dish.id, dish.name)) ? 'Bát' : 'Phần'
  const good = advice.tone === 'good'
  return (
    <div className="col step-in" style={{ gap: 14 }}>
      <div className="col" style={{ gap: 4 }}>
        <button className="row" style={{ gap: 6, alignSelf: 'flex-start' }} onClick={onRename} aria-label={`${dish.name}, bấm để đổi món`}>
          <h2 className="h2" style={{ fontSize: 22 }}>{dish.name}</h2>
          <ChevronDown size={20} className="chev" />
        </button>
        <p><span className="num" style={{ fontSize: 48 }}>{vn(kcal)}</span><span className="small muted"> kcal · khoảng {vn(lo)}–{vn(hi)}</span></p>
        {unsure && <p className="xs" style={{ color: 'var(--yellow-ink)', fontWeight: 600 }}>AI chưa chắc lắm, kiểm tra lại tên món nhé.</p>}
        {dish.estimated && <p className="xs muted">Số liệu món này là ước tính.</p>}
      </div>
      <Seg style={{ background: 'var(--surface)' }} value={portion} onChange={setPortion}
        options={[{ v: 's', label: `${unit} nhỏ` }, { v: 'm', label: `${unit} vừa` }, { v: 'l', label: `${unit} lớn` }]} />
      <div className="stack-lg">
        {([['Đạm', dish.proteinG, 'red'], ['Tinh bột', dish.carbG, 'yellow'], ['Chất béo', dish.fatG, 'blue']] as const).map(([n, g, c]) => (
          <div key={n} style={{ background: 'var(--surface)', borderRadius: 14, padding: 10 }}>
            <span className="nm"><i style={{ background: PLATE[c] }} />{n}</span>
            <span className="num">{Math.round(g * f)} g</span>
          </div>
        ))}
      </div>
      <div className="tip" style={{ background: good ? 'var(--green-soft)' : 'var(--yellow-soft)' }}>
        <span className="ib" style={good ? undefined : { background: 'var(--yellow)', color: '#14161A' }}>{good ? <CircleCheck size={18} /> : <Info size={18} />}</span>
        <p className="small">
          <b>{advice.title}.</b> Món này chiếm {Math.round((kcal / dailyKcal) * 100)}% calo cả ngày. {advice.tip}
        </p>
      </div>
    </div>
  )
}

function DishPicker({ current, onPick }: { current: Dish | null; onPick: (d: Dish) => void }) {
  const [q, setQ] = useState('')
  const list = [...DISHES].sort((a, b) => a.name.localeCompare(b.name, 'vi')).filter((d) => norm(d.name).includes(norm(q)))
  return (
    <div className="col" style={{ gap: 8 }}>
      <label className="row" style={{ height: 46, background: 'var(--surface)', borderRadius: 14, padding: '0 14px', gap: 8 }}>
        <Search size={16} className="chev" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm món, vd: pho, com tam" aria-label="Tìm món"
          style={{ flex: 1, minWidth: 0, background: 'transparent', outline: 'none', fontSize: 15 }} />
      </label>
      <ul className="list-card" style={{ maxHeight: 300, overflowY: 'auto' }}>
        {list.map((d, i) => (
          <li key={d.id} style={i ? { borderTop: '1px solid var(--line)' } : undefined}>
            <button className="lrow" onClick={() => onPick(d)} aria-pressed={current?.id === d.id}>
              <DishArt kind={dishKind(d.id, d.name)} size={36} />
              <span className="grow" style={{ fontWeight: current?.id === d.id ? 700 : 500 }}>{d.name}</span>
              <span className="v num" style={{ fontSize: 15 }}>{d.kcal.m} kcal</span>
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="small muted" style={{ padding: '12px 0' }}>Chưa có món này trong danh sách.</li>}
      </ul>
    </div>
  )
}
