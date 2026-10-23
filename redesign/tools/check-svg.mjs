// Mở SVG đã xuất như một ảnh độc lập rồi chụp lại, để so với PNG của demo
//   node tools/check-svg.mjs <thư mục ra> <tệp.svg>...   (CLIP='{"x":0,"y":0,"width":390,"height":300}' để chụp một vùng)
import puppeteer from 'puppeteer-core'
import { readFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const [out, ...files] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const p = await b.newPage()
for (const f of files) {
  const svg = readFileSync(f, 'utf8')
  const [, w, h] = svg.match(/width="(\d+)" height="(\d+)"/)
  await p.setViewport({ width: +w, height: +h, deviceScaleFactor: 2 })
  await p.setContent(`<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap"></head><body style="margin:0">${svg}</body></html>`, { waitUntil: 'load' })
  await p.evaluate(() => document.fonts.ready)
  await new Promise((r) => setTimeout(r, 1500))
  await p.screenshot({ path: join(out, basename(f).replace('.svg', '.png')), clip: process.env.CLIP ? JSON.parse(process.env.CLIP) : undefined })
}
await b.close()
