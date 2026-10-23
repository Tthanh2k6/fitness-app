/**
 * Món ăn nhìn từ trên xuống, vẽ bằng hình khối đơn giản (theo redesign/src/app.html).
 * Mỗi món trong FOODS được gán một kiểu hình gần giống nhất.
 */

export type DishKind =
  | 'oats' | 'rice' | 'ricebrown' | 'milk' | 'canhchua' | 'salad' | 'dauhu' | 'pho' | 'bun' | 'bunrieu' | 'miquang'
  | 'bunkho' | 'banhmi' | 'roll' | 'banhcuon' | 'pancake' | 'khot' | 'leaf' | 'cakes' | 'comtam' | 'claypot' | 'porridge'
  | 'xoi' | 'eggs' | 'banana' | 'fruit' | 'yogurt' | 'drink' | 'sweetpotato' | 'nuts' | 'pasta' | 'beef' | 'nem' | 'tofu'

function rnd(seed: number) {
  let s = seed
  return () => (s = (s * 9301 + 49297) % 233280) / 233280
}

const KIND_OF: Record<string, DishKind> = {
  'banh-beo': 'cakes', 'banh-bot-loc': 'cakes', 'banh-can': 'khot', 'banh-canh': 'pho', 'banh-chung': 'leaf', 'banh-cuon': 'banhcuon',
  'banh-gio': 'leaf', 'banh-khot': 'khot', 'banh-mi': 'banhmi', 'banh-tet': 'leaf', 'banh-trang-nuong': 'pancake', 'banh-xeo': 'pancake',
  'bun-bo-hue': 'bun', 'bun-dau-mam-tom': 'bunkho', 'bun-mam': 'bun', 'bun-rieu': 'bunrieu', 'bun-thit-nuong': 'bunkho', 'ca-kho-to': 'claypot',
  'canh-chua': 'canhchua', 'cao-lau': 'miquang', 'chao-long': 'porridge', 'com-tam': 'comtam', 'goi-cuon': 'roll', 'hu-tieu': 'pho',
  'mi-quang': 'miquang', 'nem-chua': 'nem', pho: 'pho', 'xoi-xeo': 'xoi',
  'canh-chua-gao-lut': 'canhchua', 'salad-uc-ga': 'salad', 'dau-hu-sot-ca': 'tofu', 'com-gao-lut-uc-ga': 'ricebrown',
  'trung-banh-mi': 'banhmi', 'sua-chua-chuoi': 'yogurt', 'com-ga-luoc': 'rice', 'yen-mach': 'oats', 'bo-xao-com': 'beef',
  'sinh-to-bo': 'drink', 'khoai-lang-sua': 'sweetpotato', 'xoi-ga': 'xoi', 'com-ga-xoi-mo': 'rice', 'mi-y-bo-bam': 'pasta',
  chuoi: 'banana', 'sua-chua-khong-duong': 'yogurt', 'sua-tuoi-khong-duong': 'milk', 'hai-trung-luoc': 'eggs', 'khoai-lang': 'sweetpotato',
  'sua-dau-nanh': 'drink', 'trai-cay': 'fruit', 'hat-dieu': 'nuts',
}

/** Kiểu hình của một món theo id; món lạ đoán theo tên */
export function dishKind(id?: string, name = ''): DishKind {
  if (id && KIND_OF[id]) return KIND_OF[id]
  const n = name.toLowerCase()
  if (n.includes('phở') || n.includes('hủ tiếu')) return 'pho'
  if (n.includes('bún')) return 'bun'
  if (n.includes('cơm')) return 'rice'
  if (n.includes('salad')) return 'salad'
  if (n.includes('sữa')) return 'milk'
  if (n.includes('trứng')) return 'eggs'
  return 'rice'
}

/** Màu nền nhẹ hợp với từng kiểu hình (thẻ món, khung ảnh) */
export function dishTone(kind: DishKind): 'red' | 'blue' | 'yellow' | 'green' {
  if (['salad', 'canhchua', 'roll', 'leaf', 'fruit', 'tofu'].includes(kind)) return 'green'
  if (['milk', 'yogurt', 'drink', 'eggs', 'banhcuon', 'porridge'].includes(kind)) return 'blue'
  if (['bun', 'bunrieu', 'beef', 'pasta', 'claypot', 'nem', 'comtam'].includes(kind)) return 'red'
  return 'yellow'
}

function art(kind: DishKind) {
  const r = rnd(kind.length * 31 + kind.charCodeAt(0) * 7 + 7)
  const f = (n: number) => n.toFixed(1)
  let s = ''
  const plate = (inner = '#F6F5F0') => `<circle cx="50" cy="50" r="47" fill="#FFFFFF" stroke="#E2E4DE" stroke-width="1.5"/><circle cx="50" cy="50" r="37" fill="${inner}"/>`
  const bowl = (broth: string, rim = '#F3EFE7') => `<circle cx="50" cy="50" r="47" fill="${rim}" stroke="#DCD6CA" stroke-width="1.5"/><circle cx="50" cy="50" r="46" fill="none" stroke="#3E6FB0" stroke-width="1.6" stroke-dasharray="2 3" opacity="0.55"/><circle cx="50" cy="50" r="38" fill="${broth}"/>`
  const herbs = (n: number, cx = 50, cy = 50, rad = 30, col = '#3F9D49') => {
    let h = ''
    for (let i = 0; i < n; i++) {
      const a = r() * 6.28, d = r() * rad
      const x = f(cx + Math.cos(a) * d), y = f(cy + Math.sin(a) * d)
      h += `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.5" transform="rotate(${(r() * 180).toFixed(0)} ${x} ${y})" fill="${col}"/>`
    }
    return h
  }
  const noodles = (col: string, n = 9, y0 = 30) => {
    let h = ''
    for (let i = 0; i < n; i++) {
      const y = y0 + i * 4.5
      h += `<path d="M${f(24 + r() * 6)} ${y} q13 ${f(r() * 8 - 4)} 26 0 t${f(18 + r() * 8)} 0" fill="none" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/>`
    }
    return h
  }
  const meat = (pts: [number, number, number][], fill: string, stroke: string, rx = 12, ry = 7) =>
    pts.map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${x} ${y})" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`).join('')
  const riceMound = (cx: number, cy: number, rad: number, brown: boolean) => {
    let h = `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${brown ? '#D9C3A0' : '#FFFFFF'}" stroke="#EAE6DB" stroke-width="1"/>`
    for (let i = 0; i < 18; i++) h += `<ellipse cx="${f(cx - rad * 0.6 + r() * rad * 1.2)}" cy="${f(cy - rad * 0.6 + r() * rad * 1.2)}" rx="1.8" ry="0.9" fill="${brown ? '#B89B70' : '#E9E5DA'}"/>`
    return h
  }
  const cucumber = (pts: [number, number][]) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="#D6EDBE" stroke="#7DB45A" stroke-width="1.3"/>`).join('')
  const tomato = (pts: [number, number][]) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#E5533F"/><circle cx="${x - 1.5}" cy="${y - 1.5}" r="1.3" fill="#FFFFFF" opacity="0.6"/>`).join('')

  switch (kind) {
    case 'oats':
      s += bowl('#E8D6B0')
      for (let i = 0; i < 26; i++) s += `<circle cx="${f(22 + r() * 56)}" cy="${f(22 + r() * 56)}" r="${f(1 + r() * 1.4)}" fill="#D3BC8E"/>`
      ;[[38, 36], [50, 31], [62, 37]].forEach(([x, y]) => (s += `<circle cx="${x}" cy="${y}" r="7" fill="#F7E68C" stroke="#E7C94F" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="1.4" fill="#D8B54A"/>`))
      s += '<ellipse cx="54" cy="62" rx="13" ry="11" fill="#FFFFFF" stroke="#ECE7DA" stroke-width="1"/><circle cx="55" cy="62" r="6" fill="#F4B638"/>'
      break
    case 'rice':
    case 'ricebrown': {
      const brown = kind === 'ricebrown'
      s += plate() + riceMound(38, 44, 20, brown)
      ;[[60, 36, 20], [66, 50, -12], [58, 62, 8]].forEach(([x, y, a]) => (s += `<rect x="${x - 10}" y="${y - 5}" width="20" height="10" rx="4" transform="rotate(${a} ${x} ${y})" fill="${brown ? '#D99A55' : '#F2D7AE'}" stroke="${brown ? '#B9763A' : '#E2BC86'}" stroke-width="1"/>`))
      s += cucumber([[34, 70], [44, 72], [26, 62]]) + herbs(6, 62, 48, 14)
      break
    }
    case 'comtam':
      s += plate() + riceMound(36, 42, 19, false)
      s += '<path d="M52 52 q14 -10 26 2 q4 10 -8 16 q-14 4 -20 -6 z" fill="#B8642F" stroke="#8E4A20" stroke-width="1"/>'
      for (let i = 0; i < 4; i++) s += `<path d="M${56 + i * 5} ${54 + i} l4 8" stroke="#7A3A16" stroke-width="1.6" stroke-linecap="round" opacity="0.6"/>`
      s += '<ellipse cx="62" cy="30" rx="11" ry="9" fill="#FFFFFF" stroke="#ECE7DA" stroke-width="1"/><circle cx="62" cy="30" r="5" fill="#F4B638"/>'
      s += cucumber([[30, 68], [40, 72]]) + tomato([[22, 54]])
      break
    case 'milk':
      s += '<circle cx="50" cy="50" r="40" fill="#E7EEF8" stroke="#D3DCE8" stroke-width="1.5"/><circle cx="50" cy="50" r="32" fill="#FFFFFF"/><circle cx="50" cy="50" r="24" fill="#FAFAF7"/><rect x="58" y="14" width="5" height="40" rx="2.5" transform="rotate(28 60 34)" fill="#2C6BEF"/>'
      break
    case 'drink':
      s += '<circle cx="50" cy="50" r="40" fill="#E9F1E2" stroke="#D3DEC8" stroke-width="1.5"/><circle cx="50" cy="50" r="32" fill="#CFE3A8"/><circle cx="50" cy="50" r="24" fill="#BCD98E"/><rect x="58" y="14" width="5" height="40" rx="2.5" transform="rotate(28 60 34)" fill="#11A068"/>'
      break
    case 'yogurt':
      s += '<circle cx="50" cy="50" r="40" fill="#F1F3F8" stroke="#D9DEE8" stroke-width="1.5"/><circle cx="50" cy="50" r="32" fill="#FFFFFF"/>'
      ;[[40, 42], [56, 40], [48, 56]].forEach(([x, y]) => (s += `<circle cx="${x}" cy="${y}" r="7" fill="#F7E68C" stroke="#E7C94F" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="1.4" fill="#D8B54A"/>`))
      break
    case 'canhchua':
      s += bowl('#F2B566')
      ;[[36, 36, 30], [62, 58, -20]].forEach(([x, y, a]) => (s += `<rect x="${x - 10}" y="${y - 7}" width="20" height="14" rx="5" transform="rotate(${a} ${x} ${y})" fill="#F7EDDF" stroke="#E3D3BC" stroke-width="1"/>`))
      ;[[58, 34], [38, 60], [66, 44]].forEach(([x, y], i) => (s += `<path d="M${x - 7} ${y} a7 7 0 0 1 14 0 z" transform="rotate(${i * 70} ${x} ${y})" fill="#E5533F"/>`))
      ;[[48, 48], [30, 48], [52, 68]].forEach(([x, y]) => (s += `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" rx="1.5" fill="#F6D45E"/>`))
      for (let i = 0; i < 7; i++) {
        const x = 26 + r() * 46, y = 26 + r() * 46
        s += `<path d="M${f(x)} ${f(y)} l${f(6 + r() * 4)} ${f(r() * 4 - 2)}" stroke="#FFFBEF" stroke-width="2" stroke-linecap="round"/>`
      }
      s += herbs(14)
      break
    case 'salad':
      s += plate('#F3F5EE')
      for (let i = 0; i < 16; i++) {
        const a = r() * 6.28, d = r() * 22
        s += `<circle cx="${f(50 + Math.cos(a) * d)}" cy="${f(50 + Math.sin(a) * d)}" r="${f(7 + r() * 5)}" fill="${['#7CC36A', '#5BAA4E', '#A6D98A', '#8FCB6E'][i % 4]}"/>`
      }
      ;[[44, 42, 25], [56, 52, -15], [46, 60, 40], [60, 38, 70]].forEach(([x, y, a]) => (s += `<rect x="${x - 9}" y="${y - 3.5}" width="18" height="7" rx="3" transform="rotate(${a} ${x} ${y})" fill="#EDC795" stroke="#D4A56A" stroke-width="1"/>`))
      s += tomato([[32, 46], [66, 62], [52, 30]])
      for (let i = 0; i < 18; i++) s += `<ellipse cx="${f(32 + r() * 36)}" cy="${f(32 + r() * 36)}" rx="1" ry="0.6" fill="#FFF7E2"/>`
      break
    case 'dauhu':
    case 'tofu':
      s += plate()
      if (kind === 'tofu') s += riceMound(30, 36, 14, true)
      s += `<circle cx="${kind === 'tofu' ? 56 : 50}" cy="${kind === 'tofu' ? 56 : 50}" r="${kind === 'tofu' ? 24 : 27}" fill="#E06A4C"/>`
      ;(kind === 'tofu' ? [[48, 48, 8], [62, 48, -10], [52, 64, -4], [66, 62, 12]] : [[40, 40, 8], [56, 40, -10], [44, 56, -4], [60, 56, 12], [50, 48, 3]]).forEach(([x, y, a]) => (s += `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="3" transform="rotate(${a} ${x} ${y})" fill="#F7E8C6" stroke="#E2C78C" stroke-width="1"/>`))
      for (let i = 0; i < 9; i++) s += `<circle cx="${f(36 + r() * 40)}" cy="${f(36 + r() * 40)}" r="2.2" fill="none" stroke="#4FA34B" stroke-width="1.4"/>`
      break
    case 'pho':
      s += bowl('#E9C88F', '#FFFFFF') + noodles('#FFF9EC')
      s += meat([[40, 40, 20], [58, 44, -25], [50, 58, 10]], '#C9786A', '#A95A4D')
      ;[[34, 58], [64, 60], [62, 32]].forEach(([x, y]) => (s += `<circle cx="${x}" cy="${y}" r="4" fill="none" stroke="#FFFFFF" stroke-width="1.6"/>`))
      s += herbs(16) + '<path d="M72 30 a9 9 0 0 1 -6 14 z" fill="#A9D04F" stroke="#7DA93A" stroke-width="1"/>'
      break
    case 'bun':
      s += bowl('#D9693F', '#FFFFFF') + noodles('#FFF6EA', 8, 32)
      s += meat([[40, 42, 15], [60, 46, -20]], '#B5594A', '#8E3F33', 11, 6.5)
      s += '<circle cx="52" cy="60" r="8" fill="#8A3B2E" stroke="#6E2C22" stroke-width="1"/>' + herbs(14, 50, 50, 30, '#4FA34B')
      break
    case 'bunrieu':
      s += bowl('#E27A4E', '#FFFFFF') + noodles('#FFF6EA', 8, 32)
      for (let i = 0; i < 6; i++) s += `<circle cx="${f(32 + r() * 36)}" cy="${f(32 + r() * 36)}" r="${f(4 + r() * 3)}" fill="#C7894F" stroke="#A8693A" stroke-width="1"/>`
      s += tomato([[38, 60], [62, 38]]) + herbs(12)
      break
    case 'miquang':
      s += bowl('#F2C14E', '#FFFFFF') + noodles('#F7D774', 8, 32)
      s += meat([[40, 42, 15], [60, 50, -20]], '#E89B7A', '#C77258', 9, 6)
      s += '<ellipse cx="52" cy="34" rx="8" ry="7" fill="#FFFFFF"/><circle cx="52" cy="34" r="3.5" fill="#F4B638"/>'
      for (let i = 0; i < 5; i++) s += `<rect x="${f(30 + r() * 36)}" y="${f(30 + r() * 36)}" width="7" height="5" rx="1.5" fill="#E8C680" stroke="#C9A35A" stroke-width="0.8"/>`
      s += herbs(10)
      break
    case 'bunkho':
      s += plate()
      for (let i = 0; i < 7; i++) s += `<path d="M${f(22 + r() * 4)} ${32 + i * 4} q10 -3 20 0 t20 0" fill="none" stroke="#F3EEE2" stroke-width="2.6" stroke-linecap="round"/>`
      s += meat([[60, 40, 20], [66, 54, -10], [56, 64, 15]], '#B8642F', '#8E4A20', 10, 6)
      s += herbs(10, 36, 64, 10, '#5BAA4E') + '<circle cx="30" cy="66" r="7" fill="#7CC36A"/>'
      break
    case 'banhmi':
      s += plate('#F7F5EE')
      s += '<path d="M20 64 Q16 52 30 42 L62 22 Q76 16 80 28 Q82 36 72 44 L40 70 Q28 78 20 64 Z" fill="#E3A85A" stroke="#B97B30" stroke-width="1.3"/>'
      for (let i = 0; i < 4; i++) s += `<path d="M${32 + i * 11} ${58 - i * 9} l8 -9" stroke="#C78A3E" stroke-width="2" stroke-linecap="round"/>`
      s += '<path d="M30 56 L66 30" stroke="#5BAA4E" stroke-width="3" stroke-linecap="round"/><path d="M33 60 L68 34" stroke="#E5533F" stroke-width="2.4" stroke-linecap="round"/>'
      break
    case 'roll':
      s += plate()
      ;[[36, 40, -30], [54, 50, -30], [42, 62, -30]].forEach(([x, y, a]) => {
        s += `<rect x="${x - 15}" y="${y - 7}" width="30" height="14" rx="7" transform="rotate(${a} ${x} ${y})" fill="#F3F2EC" stroke="#D9D7CE" stroke-width="1.2"/>`
        s += `<ellipse cx="${x - 4}" cy="${y}" rx="4" ry="2.4" transform="rotate(${a} ${x} ${y})" fill="#F08A6C" opacity="0.8"/><ellipse cx="${x + 5}" cy="${y}" rx="3.5" ry="2.2" transform="rotate(${a} ${x} ${y})" fill="#7CC36A" opacity="0.8"/>`
      })
      s += '<circle cx="70" cy="68" r="9" fill="#C9874A" stroke="#A86A33" stroke-width="1"/>'
      break
    case 'banhcuon':
      s += plate()
      ;[[34, 40], [52, 36], [42, 56], [60, 54]].forEach(([x, y]) => (s += `<rect x="${x - 11}" y="${y - 7}" width="22" height="14" rx="7" fill="#FBFAF5" stroke="#DEDBD0" stroke-width="1.2"/>`))
      for (let i = 0; i < 10; i++) s += `<circle cx="${f(28 + r() * 44)}" cy="${f(30 + r() * 36)}" r="1.4" fill="#C98A4B"/>`
      s += '<rect x="62" y="64" width="14" height="10" rx="2" fill="#F2D7AE" stroke="#D9B47E" stroke-width="1"/>' + herbs(6, 40, 66, 8)
      break
    case 'pancake':
      s += plate()
      s += '<path d="M20 58 A30 30 0 0 1 80 58 Z" fill="#F2C14E" stroke="#D9A23A" stroke-width="1.3"/>'
      for (let i = 0; i < 8; i++) s += `<circle cx="${f(28 + r() * 44)}" cy="${f(38 + r() * 16)}" r="${f(1.5 + r() * 2)}" fill="#E0A23A"/>`
      s += '<ellipse cx="40" cy="44" rx="5" ry="3" fill="#F08A6C"/><ellipse cx="58" cy="46" rx="5" ry="3" fill="#F08A6C"/>'
      s += '<circle cx="34" cy="70" r="9" fill="#8FCB6E"/><circle cx="48" cy="72" r="8" fill="#7CC36A"/><circle cx="62" cy="70" r="8" fill="#A6D98A"/>'
      break
    case 'khot':
      s += plate()
      ;[[34, 36], [50, 32], [66, 38], [30, 54], [48, 50], [66, 56], [40, 68], [58, 70]].forEach(([x, y]) =>
        (s += `<circle cx="${x}" cy="${y}" r="8" fill="#F2C14E" stroke="#D29A30" stroke-width="1.2"/><ellipse cx="${x}" cy="${y}" rx="3.5" ry="2.3" fill="#F08A6C"/>`))
      break
    case 'leaf':
      s += plate()
      s += '<rect x="24" y="24" width="52" height="52" rx="6" transform="rotate(8 50 50)" fill="#4E9A49" stroke="#3B7A37" stroke-width="1.5"/>'
      s += '<rect x="30" y="30" width="40" height="40" rx="3" transform="rotate(8 50 50)" fill="#F2EFE2"/>'
      s += '<rect x="40" y="40" width="20" height="20" rx="2" transform="rotate(8 50 50)" fill="#E2C46A"/>'
      s += '<path d="M28 50 L72 56 M47 28 L53 72" stroke="#C9B98A" stroke-width="1.6" transform="rotate(8 50 50)" opacity="0.8"/>'
      break
    case 'cakes':
      s += plate()
      ;[[34, 36], [52, 32], [68, 42], [30, 54], [48, 52], [64, 60], [40, 70]].forEach(([x, y]) =>
        (s += `<circle cx="${x}" cy="${y}" r="8.5" fill="#F4F1E8" stroke="#DCD6C6" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="3.5" fill="#E8955F"/>`))
      break
    case 'claypot':
      s += '<circle cx="50" cy="50" r="46" fill="#9C5A35" stroke="#7A4224" stroke-width="1.5"/><circle cx="50" cy="50" r="38" fill="#7A3E1E"/>'
      ;[[40, 42, 20], [60, 56, -15]].forEach(([x, y, a]) => (s += `<rect x="${x - 13}" y="${y - 9}" width="26" height="18" rx="6" transform="rotate(${a} ${x} ${y})" fill="#A8622F" stroke="#5E2E12" stroke-width="1.2"/>`))
      for (let i = 0; i < 6; i++) s += `<circle cx="${f(30 + r() * 40)}" cy="${f(30 + r() * 40)}" r="1.6" fill="#E5533F"/>`
      s += herbs(6)
      break
    case 'porridge':
      s += bowl('#EFE4CF', '#FFFFFF')
      for (let i = 0; i < 20; i++) s += `<circle cx="${f(24 + r() * 52)}" cy="${f(24 + r() * 52)}" r="1.4" fill="#E2D2B2"/>`
      s += meat([[40, 42, 10], [58, 48, -20], [48, 60, 30]], '#B88066', '#94604A', 7, 5)
      s += herbs(14) + '<circle cx="62" cy="34" r="3" fill="#F2D35B"/>'
      break
    case 'xoi':
      s += plate()
      s += '<circle cx="48" cy="50" r="28" fill="#F2D35B" stroke="#E0B93A" stroke-width="1.2"/>'
      for (let i = 0; i < 22; i++) s += `<ellipse cx="${f(26 + r() * 44)}" cy="${f(28 + r() * 44)}" rx="1.8" ry="1" fill="#E6BE38"/>`
      for (let i = 0; i < 12; i++) s += `<ellipse cx="${f(36 + r() * 24)}" cy="${f(36 + r() * 24)}" rx="2.6" ry="1.4" fill="#B5733A"/>`
      s += herbs(5, 48, 50, 12)
      break
    case 'eggs':
      s += plate()
      ;[[38, 46], [60, 54]].forEach(([x, y]) => (s += `<ellipse cx="${x}" cy="${y}" rx="14" ry="12" fill="#FFFFFF" stroke="#E6E1D4" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="6" fill="#F4B638"/>`))
      s += '<circle cx="50" cy="28" r="1.4" fill="#2B2C2A"/><circle cx="55" cy="30" r="1.2" fill="#2B2C2A"/>'
      break
    case 'banana':
      s += plate()
      s += '<path d="M24 38 Q50 78 78 40 Q72 38 70 42 Q50 66 30 36 Q26 34 24 38 Z" fill="#F6D45E" stroke="#D9AE2A" stroke-width="1.5"/><path d="M76 40 l4 -4" stroke="#7A5A1C" stroke-width="2.4" stroke-linecap="round"/>'
      break
    case 'fruit':
      s += plate()
      ;[[36, 40], [58, 36], [44, 60], [64, 58]].forEach(([x, y], i) =>
        (s += i % 2 ? `<circle cx="${x}" cy="${y}" r="11" fill="#F2F6E2" stroke="#A6C46A" stroke-width="2"/><circle cx="${x}" cy="${y}" r="5" fill="#F3B3A6"/>` : `<path d="M${x - 11} ${y} a11 11 0 0 1 22 0 z" fill="#F7F1DC" stroke="#D9533F" stroke-width="2.4"/>`))
      break
    case 'sweetpotato':
      s += plate()
      ;[[44, 44, -25], [58, 58, -25]].forEach(([x, y, a]) => (s += `<ellipse cx="${x}" cy="${y}" rx="20" ry="10" transform="rotate(${a} ${x} ${y})" fill="#B5603E" stroke="#8E4528" stroke-width="1.2"/><ellipse cx="${x}" cy="${y}" rx="13" ry="6" transform="rotate(${a} ${x} ${y})" fill="#F2A65A"/>`))
      break
    case 'nuts':
      s += plate()
      for (let i = 0; i < 14; i++) {
        const x = 32 + r() * 36, y = 32 + r() * 36
        s += `<path d="M${f(x)} ${f(y)} q6 -8 12 -2 q-2 6 -6 5 q-4 -1 -6 -3 z" fill="#E9C98E" stroke="#C9A060" stroke-width="1" transform="rotate(${(r() * 360).toFixed(0)} ${f(x + 5)} ${f(y - 2)})"/>`
      }
      break
    case 'pasta':
      s += plate()
      for (let i = 0; i < 10; i++) s += `<path d="M${f(28 + r() * 8)} ${f(32 + i * 4)} q10 ${f(r() * 6 - 3)} 18 0 t${f(16 + r() * 6)} 0" fill="none" stroke="#F2D27A" stroke-width="2.6" stroke-linecap="round"/>`
      s += '<circle cx="50" cy="48" r="15" fill="#C8432E"/>'
      for (let i = 0; i < 8; i++) s += `<circle cx="${f(40 + r() * 20)}" cy="${f(38 + r() * 20)}" r="2.2" fill="#8A3B2E"/>`
      s += herbs(4, 50, 48, 10)
      break
    case 'beef':
      s += plate() + riceMound(34, 42, 18, false)
      s += meat([[60, 42, 25], [66, 56, -15], [54, 62, 35], [70, 46, 70]], '#8E4A2E', '#6E3520', 8, 4)
      for (let i = 0; i < 8; i++) s += `<circle cx="${f(52 + r() * 22)}" cy="${f(36 + r() * 30)}" r="${f(3 + r() * 2)}" fill="${['#5BAA4E', '#7CC36A'][i % 2]}"/>`
      s += cucumber([[30, 68]])
      break
    case 'nem':
      s += plate()
      ;[[40, 42], [60, 42], [50, 60]].forEach(([x, y]) => (s += `<rect x="${x - 10}" y="${y - 10}" width="20" height="20" rx="3" fill="#E58372" stroke="#C2604E" stroke-width="1.2"/><circle cx="${x - 3}" cy="${y - 2}" r="1.6" fill="#FFFFFF"/><circle cx="${x + 3}" cy="${y + 3}" r="1.4" fill="#FFFFFF"/>`))
      s += herbs(6, 50, 50, 26, '#4E9A49')
      break
  }
  return s
}

export default function DishArt({ kind, size = 100 }: { kind: DishKind; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: art(kind) }} />
}
