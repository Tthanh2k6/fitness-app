// Chụp PNG từng màn (chế độ xuất) để xem nhanh: node tools/shoot.mjs [light|dark] [id...]
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const [theme = 'light', ...only] = process.argv.slice(2)
const out = join(root, 'png', theme)
mkdirSync(out, { recursive: true })

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1300, height: 900, deviceScaleFactor: 2 })
page.on('console', (m) => m.type() === 'error' && console.log('console:', m.text()))
page.on('pageerror', (e) => console.log('pageerror:', e.message))
await page.goto(pathToFileURL(join(root, 'demo', 'index.html')).href + `?export=1&theme=${theme}`, { waitUntil: 'networkidle0' })
await page.evaluate(() => document.fonts.ready)
const ids = await page.$$eval('#export > [id^="s-"]', (els) => els.map((e) => e.id.slice(2)))
for (const id of ids) {
  if (only.length && !only.includes(id)) continue
  const el = await page.$(`#s-${id}`)
  await el.screenshot({ path: join(out, `${id}.png`) })
}
console.log(ids.join(' '))
await browser.close()
