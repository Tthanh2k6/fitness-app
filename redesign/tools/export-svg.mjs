// Xuất mỗi màn của demo thành một tệp SVG để kéo thả vào Figma.
//   node tools/export-svg.mjs            -> svg/sang/*.svg, svg/toi/*.svg, png/sang/*.png, png/toi/*.png
// Chữ giữ nguyên là chữ (sửa được trong Figma), nhóm lớp đặt tên theo thuộc tính data-n trong demo.
import puppeteer from 'puppeteer-core'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const THEMES = { sang: 'light', toi: 'dark' }

const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Chạy trong trình duyệt: đọc layout đã render và dựng chuỗi SVG
function convert(rootId, prefix) {
  const root = document.getElementById(rootId)
  const R = root.getBoundingClientRect()
  const W = Math.round(R.width), H = Math.round(R.height)
  const defs = []
  const usedIds = {}
  const canvas = document.createElement('canvas').getContext('2d')
  const ascentCache = {}
  let clipN = 0

  const f = (n) => +n.toFixed(2)
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const uid = (base) => {
    const clean = (base || 'layer').trim().replace(/[\s/·,:&()+]+/g, '_').replace(/[^\p{L}\p{N}_-]/gu, '').replace(/^(\d)/, '_$1') || 'layer'
    usedIds[clean] = (usedIds[clean] || 0) + 1
    return usedIds[clean] === 1 ? clean : `${clean}_${usedIds[clean]}`
  }
  const parseColor = (c) => {
    if (!c || c === 'transparent') return null
    const m = c.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number)
    const a = p.length > 3 ? p[3] : 1
    if (a === 0) return null
    const hex = '#' + p.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()
    return { hex, a }
  }
  const paint = (c, kind = 'fill') => `${kind}="${c.hex}"${c.a < 1 ? ` ${kind}-opacity="${f(c.a)}"` : ''}`
  const splitTop = (s) => {
    const out = []; let depth = 0, cur = ''
    for (const ch of s) {
      if (ch === '(') depth++
      if (ch === ')') depth--
      if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = '' } else cur += ch
    }
    if (cur.trim()) out.push(cur.trim())
    return out
  }
  const radii = (cs, w, h) => {
    const one = (v) => { const n = parseFloat(v) || 0; return v.endsWith('%') ? (n / 100) * Math.min(w, h) : n }
    let r = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(one)
    const k = Math.min(1, w / Math.max(r[0] + r[1], r[3] + r[2], 0.001), h / Math.max(r[0] + r[3], r[1] + r[2], 0.001))
    return r.map((v) => v * k)
  }
  const shape = (x, y, w, h, r, attrs) => {
    if (w <= 0 || h <= 0) return ''
    if (r.every((v) => Math.abs(v - r[0]) < 0.01)) {
      return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"${r[0] > 0 ? ` rx="${f(r[0])}"` : ''} ${attrs}/>`
    }
    const [a, b, c, d] = r
    return `<path d="M${f(x + a)} ${f(y)} H${f(x + w - b)} A${f(b)} ${f(b)} 0 0 1 ${f(x + w)} ${f(y + b)} V${f(y + h - c)} A${f(c)} ${f(c)} 0 0 1 ${f(x + w - c)} ${f(y + h)} H${f(x + d)} A${f(d)} ${f(d)} 0 0 1 ${f(x)} ${f(y + h - d)} V${f(y + a)} A${f(a)} ${f(a)} 0 0 1 ${f(x + a)} ${f(y)} Z" ${attrs}/>`
  }
  const gradient = (bg, w, h) => {
    const m = bg.match(/^linear-gradient\((.*)\)$/)
    if (!m) return null
    const parts = splitTop(m[1])
    let angle = 180
    if (/deg$/.test(parts[0])) angle = parseFloat(parts.shift())
    else if (/^to /.test(parts[0])) { const t = parts.shift(); angle = { 'to right': 90, 'to left': 270, 'to top': 0, 'to bottom': 180 }[t] ?? 180 }
    const rad = (angle * Math.PI) / 180, dx = Math.sin(rad), dy = -Math.cos(rad)
    const id = `${prefix}g${defs.length}`
    const stops = parts.map((p, i) => {
      const cm = p.match(/rgba?\([^)]+\)/)
      const c = parseColor(cm ? cm[0] : '')
      const pos = p.replace(cm ? cm[0] : '', '').trim()
      const off = pos ? parseFloat(pos) / 100 : i / (parts.length - 1)
      return c ? `<stop offset="${f(off)}" stop-color="${c.hex}"${c.a < 1 ? ` stop-opacity="${f(c.a)}"` : ''}/>` : ''
    }).join('')
    defs.push(`<linearGradient id="${id}" x1="${f(0.5 - dx / 2)}" y1="${f(0.5 - dy / 2)}" x2="${f(0.5 + dx / 2)}" y2="${f(0.5 + dy / 2)}">${stops}</linearGradient>`)
    return id
  }
  const shadows = (cs) => {
    if (!cs.boxShadow || cs.boxShadow === 'none') return []
    return splitTop(cs.boxShadow).map((s) => {
      const cm = s.match(/rgba?\([^)]+\)/)
      const nums = s.replace(cm ? cm[0] : '', '').replace('inset', '').trim().split(/\s+/).map(parseFloat)
      return { c: parseColor(cm ? cm[0] : ''), x: nums[0] || 0, y: nums[1] || 0, blur: nums[2] || 0, spread: nums[3] || 0, inset: /inset/.test(s) }
    }).filter((s) => s.c && s.blur === 0 && s.x === 0 && s.y === 0 && s.spread > 0)
  }
  const ascent = (font) => {
    if (ascentCache[font] == null) { canvas.font = font; ascentCache[font] = canvas.measureText('Hg').fontBoundingBoxAscent }
    return ascentCache[font]
  }

  function text(node, cs) {
    const raw = node.textContent
    if (!raw.trim()) return ''
    const range = document.createRange()
    const lines = []
    let line = null
    const fs = parseFloat(cs.fontSize)
    for (let i = 0; i < raw.length; i++) {
      range.setStart(node, i); range.setEnd(node, i + 1)
      const rect = [...range.getClientRects()].find((r) => r.width > 0 || r.height > 0)
      let ch = raw[i]
      const space = /\s/.test(ch)
      if (!rect) continue
      if (!line || Math.abs(rect.top - line.top) > fs * 0.5) {
        if (space) continue
        line = { top: rect.top, left: rect.left, s: '' }
        lines.push(line)
      }
      if (space) { if (line.s.endsWith(' ')) continue; ch = ' ' }
      line.s += ch
    }
    if (!lines.length) return ''
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    const asc = ascent(font)
    const c = parseColor(cs.color)
    if (!c) return ''
    const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim()
    const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing)
    const upper = cs.textTransform === 'uppercase'
    const deco = ['line-through', 'underline'].filter((d) => cs.textDecorationLine.includes(d)).map((d) => ` text-decoration="${d}"`).join('')
    const spans = lines.map((l) => {
      let s = l.s.replace(/\s+$/, '')
      if (upper) s = s.toLocaleUpperCase('vi')
      return `<tspan x="${f(l.left - R.left)}" y="${f(l.top - R.top + asc)}">${esc(s)}</tspan>`
    }).join('')
    return `<text xml:space="preserve" font-family="${fam}" font-size="${f(fs)}" font-weight="${cs.fontWeight}"${ls ? ` letter-spacing="${f(ls)}"` : ''} ${paint(c)}${deco}>${spans}</text>`
  }

  const SVG_PROPS = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset', 'opacity', 'fill-opacity', 'stroke-opacity', 'font-family', 'font-size', 'font-weight', 'text-anchor', 'stop-color', 'stop-opacity']
  function inlineSvg(el) {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) return ''
    const vb = el.viewBox && el.viewBox.baseVal && el.viewBox.baseVal.width ? el.viewBox.baseVal : { x: 0, y: 0, width: r.width, height: r.height }
    let sx = r.width / vb.width, sy = r.height / vb.height
    let tx = r.left - R.left, ty = r.top - R.top
    if ((el.getAttribute('preserveAspectRatio') || '') !== 'none') {
      const s = Math.min(sx, sy)
      tx += (r.width - vb.width * s) / 2; ty += (r.height - vb.height * s) / 2
      sx = sy = s
    }
    tx -= vb.x * sx; ty -= vb.y * sy
    const clone = el.cloneNode(true)
    const src = [el, ...el.querySelectorAll('*')], dst = [clone, ...clone.querySelectorAll('*')]
    src.forEach((o, i) => {
      const d = dst[i], cs = getComputedStyle(o)
      d.removeAttribute('class'); d.removeAttribute('style')
      if (o.tagName === 'linearGradient' || o.tagName === 'defs') return
      for (const p of SVG_PROPS) {
        if (p.startsWith('stop') && o.tagName !== 'stop') continue
        if (p.startsWith('font') || p === 'text-anchor') { if (o.tagName !== 'text' && o.tagName !== 'tspan') continue }
        let v = cs.getPropertyValue(p)
        if (!v || v === 'normal') continue
        if (p === 'opacity' && v === '1') continue
        if (p === 'stroke-dasharray' && v === 'none') continue
        if (p === 'stroke-dashoffset' && parseFloat(v) === 0) continue
        if ((p === 'fill' || p === 'stroke' || p === 'stop-color') && v.startsWith('rgb')) {
          const c = parseColor(v)
          if (!c) { d.setAttribute(p, 'none'); continue }
          d.setAttribute(p, c.hex)
          if (c.a < 1) d.setAttribute(p === 'stop-color' ? 'stop-opacity' : `${p}-opacity`, f(c.a))
          continue
        }
        if (v.startsWith('url(')) v = v.replace(/url\("?([^")]+)"?\)/, 'url($1)').replace(/url\([^#]*#/, 'url(#')
        if (p === 'font-family') v = v.split(',')[0].replace(/["']/g, '').trim()
        d.setAttribute(p, v.replace(/px$/, '').replace(/px,/g, ','))
      }
    })
    ;['width', 'height', 'viewBox', 'aria-hidden', 'aria-label', 'preserveAspectRatio', 'xmlns', 'data-i'].forEach((a) => clone.removeAttribute(a))
    return `<g transform="translate(${f(tx)} ${f(ty)}) scale(${f(sx)}${sx !== sy ? ` ${f(sy)}` : ''})">${clone.innerHTML}</g>`
  }

  function walk(el, isRoot) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden' || el.hidden) return ''
    if (el.tagName.toLowerCase() === 'svg') return inlineSvg(el)
    const r = el.getBoundingClientRect()
    const x = r.left - R.left, y = r.top - R.top, w = r.width, h = r.height
    const rad = radii(cs, w, h)
    const back = [], front = []
    const sh = shadows(cs)
    for (const s of sh.filter((s) => !s.inset)) back.push(shape(x - s.spread, y - s.spread, w + 2 * s.spread, h + 2 * s.spread, rad.map((v) => v + s.spread), paint(s.c)))
    const bg = parseColor(cs.backgroundColor)
    if (bg) back.push(shape(x, y, w, h, rad, paint(bg)))
    if (cs.backgroundImage && cs.backgroundImage !== 'none') {
      const g = gradient(cs.backgroundImage, w, h)
      if (g) back.push(shape(x, y, w, h, rad, `fill="url(#${g})"`))
    }
    for (const s of sh.filter((s) => s.inset)) back.push(shape(x + s.spread / 2, y + s.spread / 2, w - s.spread, h - s.spread, rad.map((v) => Math.max(0, v - s.spread / 2)), `fill="none" ${paint(s.c, 'stroke')} stroke-width="${f(s.spread)}"`))
    const sides = ['Top', 'Right', 'Bottom', 'Left'].map((sd) => ({ sd, w: parseFloat(cs[`border${sd}Width`]) || 0, c: cs[`border${sd}Style`] !== 'none' ? parseColor(cs[`border${sd}Color`]) : null }))
    if (sides.every((s) => s.w > 0 && s.c && s.c.hex === sides[0].c.hex && s.w === sides[0].w)) {
      const bw = sides[0].w
      front.push(shape(x + bw / 2, y + bw / 2, w - bw, h - bw, rad.map((v) => Math.max(0, v - bw / 2)), `fill="none" ${paint(sides[0].c, 'stroke')} stroke-width="${f(bw)}"`))
    } else {
      for (const s of sides) {
        if (!s.w || !s.c) continue
        const box = { Top: [x, y, w, s.w], Bottom: [x, y + h - s.w, w, s.w], Left: [x, y, s.w, h], Right: [x + w - s.w, y, s.w, h] }[s.sd]
        front.push(shape(...box, [0, 0, 0, 0], paint(s.c)))
      }
    }
    const kids = []
    for (const n of el.childNodes) {
      if (n.nodeType === 3) kids.push(text(n, cs))
      else if (n.nodeType === 1) kids.push(walk(n, false))
    }
    const body = [...back, ...kids.filter(Boolean), ...front].join('')
    if (!body) return ''
    let attrs = ''
    const op = parseFloat(cs.opacity)
    if (op < 1) attrs += ` opacity="${f(op)}"`
    const clips = !isRoot && (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') && cs.display !== 'inline'
    if (clips) {
      const id = `${prefix}c${++clipN}`
      defs.push(`<clipPath id="${id}">${shape(x, y, w, h, rad, '')}</clipPath>`)
      attrs += ` clip-path="url(#${id})"`
    }
    const named = el.dataset.n || isRoot
    const parts = back.length + kids.filter(Boolean).length + front.length
    if (!named && !attrs && parts === 1) return body
    const cls = (typeof el.className === 'string' && el.className.split(/\s+/).filter(Boolean)[0]) || el.tagName.toLowerCase()
    return `<g id="${prefix}${uid(el.dataset.n || cls)}"${attrs}>${body}</g>`
  }

  const content = walk(root, true)
  return { W, H, defs: defs.join(''), content }
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage()
page.on('pageerror', (e) => console.log('pageerror:', e.message))
const url = pathToFileURL(join(root, 'demo', 'index.html')).href

for (const [folder, theme] of Object.entries(THEMES)) {
  const svgDir = join(root, 'svg', folder), pngDir = join(root, 'png', folder)
  rmSync(svgDir, { recursive: true, force: true })
  rmSync(pngDir, { recursive: true, force: true })
  mkdirSync(svgDir, { recursive: true }); mkdirSync(pngDir, { recursive: true })
  await page.setViewport({ width: 1300, height: 900, deviceScaleFactor: 2 })
  await page.goto(`${url}?export=1&theme=${theme}`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  const list = await page.$$eval('#export > [id^="s-"]', (els) => els.map((e) => ({ id: e.id, title: e.dataset.n || 'Hệ thống thiết kế' })))
  const all = []
  let n = 0
  for (const { id, title } of list) {
    const num = id === 's-guide' ? '00' : String(++n).padStart(2, '0')
    const name = `${num}-${slug(title)}`
    const { W, H, defs, content } = await page.evaluate(convert, id, `${id.slice(2)}_`)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none">\n<title>${title}</title>\n${defs ? `<defs>${defs}</defs>\n` : ''}${content}\n</svg>\n`
    writeFileSync(join(svgDir, `${name}.svg`), svg)
    await (await page.$(`#${id}`)).screenshot({ path: join(pngDir, `${name}.png`) })
    if (id !== 's-guide') all.push({ title, W, H, defs, content })
    console.log(`${folder}/${name}.svg  ${W}×${H}  ${(svg.length / 1024).toFixed(0)} KB`)
  }
  // Tệp tổng: mọi màn đặt cạnh nhau như các frame trên một trang Figma
  const gap = 80, pad = 80, labelH = 48
  const totalW = pad * 2 + all.reduce((a, s) => a + s.W, 0) + gap * (all.length - 1)
  const totalH = pad * 2 + labelH + Math.max(...all.map((s) => s.H))
  let xo = pad
  const body = all.map((s) => {
    const g = `<g id="${slug(s.title)}"><text x="${xo}" y="${pad + 20}" font-family="Be Vietnam Pro" font-size="20" font-weight="700" fill="${theme === 'dark' ? '#EFF0EC' : '#14161A'}">${s.title}</text><g transform="translate(${xo} ${pad + labelH})">${s.content}</g></g>`
    xo += s.W + gap
    return g
  }).join('\n')
  writeFileSync(join(root, 'svg', `tat-ca-man-${folder}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" fill="none">\n<defs>${all.map((s) => s.defs).join('')}</defs>\n<rect width="${totalW}" height="${totalH}" fill="${theme === 'dark' ? '#060708' : '#D9DCD5'}"/>\n${body}\n</svg>\n`)
}
await browser.close()
