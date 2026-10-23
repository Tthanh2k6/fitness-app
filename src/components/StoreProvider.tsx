import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { EMPTY_LOGS, StoreContext, type DayLog, type Logs, type StoreApi } from '../store'

const KEY = 'fitcoach.logs.v1'

function load(): Logs {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...EMPTY_LOGS, ...JSON.parse(raw) } : EMPTY_LOGS
  } catch {
    return EMPTY_LOGS
  }
}

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState(load)

  const commit = useCallback((change: (prev: Logs) => Logs) => {
    setLogs((prev) => {
      const next = change(prev)
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        // trình duyệt chặn lưu trữ: vẫn dùng được trong phiên hiện tại
      }
      return next
    })
  }, [])

  const day = useCallback(
    (date: string, change: (d: DayLog) => DayLog) =>
      commit((prev) => ({ ...prev, days: { ...prev.days, [date]: change(prev.days[date] ?? { sets: {} }) } })),
    [commit],
  )

  // Giữ số lần tốt nhất của một hiệp trong ngày
  const best = (d: DayLog, exId: string, reps?: number) =>
    reps && reps > 0 ? { ...d.reps, [exId]: Math.max(d.reps?.[exId] ?? 0, reps) } : d.reps

  const api = useMemo<StoreApi>(() => ({
    logs,
    addSets: (date, exId, n = 1, reps) =>
      day(date, (d) => ({ ...d, startedAt: d.startedAt ?? Date.now(), sets: { ...d.sets, [exId]: (d.sets[exId] ?? 0) + n }, reps: best(d, exId, reps) })),
    setSets: (date, exId, n, reps) =>
      day(date, (d) => ({ ...d, sets: { ...d.sets, [exId]: Math.max(0, n) }, reps: n > 0 ? best(d, exId, reps) : d.reps })),
    addForm: (date, exId, r) =>
      day(date, (d) => {
        const old = d.form?.[exId] ?? { reps: 0, good: 0, issues: {} }
        const issues = { ...old.issues }
        for (const [k, v] of Object.entries(r.issues)) issues[k] = (issues[k] ?? 0) + v
        return { ...d, form: { ...d.form, [exId]: { reps: old.reps + r.reps, good: old.good + r.good, issues } } }
      }),
    markStretch: (date, phase) => day(date, (d) => ({ ...d, [phase]: true, startedAt: d.startedAt ?? Date.now() })),
    startSession: (date) => day(date, (d) => ({ ...d, startedAt: d.startedAt ?? Date.now() })),
    finishSession: (date) => day(date, (d) => ({ ...d, finishedAt: Date.now() })),
    patchDay: (date, patch) => day(date, (d) => ({ ...d, ...patch })),
    logWeight: (date, kg) =>
      commit((prev) => ({ ...prev, weights: [...prev.weights.filter((w) => w.date !== date), { date, kg }].sort((a, b) => a.date.localeCompare(b.date)) })),
    logMeasure: (m) =>
      commit((prev) => {
        const old = prev.measures.find((x) => x.date === m.date)
        const merged = { ...old, ...m }
        return { ...prev, measures: [...prev.measures.filter((x) => x.date !== m.date), merged].sort((a, b) => a.date.localeCompare(b.date)) }
      }),
    addMeal: (meal) => commit((prev) => ({ ...prev, meals: [...prev.meals, { ...meal, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }] })),
    removeMeal: (id) => commit((prev) => ({ ...prev, meals: prev.meals.filter((m) => m.id !== id) })),
    joinChallenge: (id, date) => commit((prev) => ({ ...prev, challenges: { ...prev.challenges, [id]: date } })),
    leaveChallenge: (id) =>
      commit((prev) => {
        const rest = { ...prev.challenges }
        delete rest[id]
        return { ...prev, challenges: rest }
      }),
    toggleFavorite: (id) =>
      commit((prev) => ({ ...prev, favorites: prev.favorites.includes(id) ? prev.favorites.filter((x) => x !== id) : [...prev.favorites, id] })),
    addShopping: (items) =>
      commit((prev) => {
        const have = new Set(prev.shopping.filter((s) => !s.done).map((s) => s.name))
        return { ...prev, shopping: [...prev.shopping, ...items.filter((i) => !have.has(i.name)).map((i) => ({ ...i, done: false }))] }
      }),
    toggleShopping: (index) =>
      commit((prev) => ({ ...prev, shopping: prev.shopping.map((s, i) => (i === index ? { ...s, done: !s.done } : s)) })),
    clearShopping: (onlyDone) => commit((prev) => ({ ...prev, shopping: onlyDone ? prev.shopping.filter((s) => !s.done) : [] })),
    replaceAll: (next) => commit(() => ({ ...EMPTY_LOGS, ...next })),
    resetAll: () => commit(() => EMPTY_LOGS),
  }), [logs, commit, day])

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}
