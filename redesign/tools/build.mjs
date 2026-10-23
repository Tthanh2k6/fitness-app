// Gộp icon Lucide vào src/app.html rồi xuất:
//   demo/index.html    trang demo đầy đủ, mở trực tiếp bằng trình duyệt
//   demo/artifact.html cùng nội dung nhưng không có khung <html>/<head> (để đăng lên claude.ai)
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const iconDir = join(root, '..', 'node_modules', 'lucide-react', 'dist', 'esm', 'icons')

const src = readFileSync(join(root, 'src', 'app.html'), 'utf8')
// Mọi chuỗi trong mã trùng tên một icon Lucide đều được gộp vào (tên icon hay nằm trong mảng dữ liệu)
const names = [...new Set([...src.matchAll(/(?<=['"])([a-z][a-z0-9-]*)(?=['"])/g)].map((m) => m[1]))]
  .filter((n) => existsSync(join(iconDir, `${n}.js`)))

const icons = {}
for (const name of names) {
  const file = readFileSync(join(iconDir, `${name}.js`), 'utf8')
  const found = file.match(/const __iconNode = (\[[\s\S]*?\]);\r?\n/)
  if (!found) continue // tệp bí danh, không phải icon gốc
  const nodes = new Function(`return ${found[1]}`)()
  icons[name] = nodes.map(([tag, attrs]) =>
    `<${tag} ${Object.entries(attrs).filter(([k]) => k !== 'key').map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('')
}

const body = src.replace('/*ICONS*/{}', JSON.stringify(icons))
mkdirSync(join(root, 'demo'), { recursive: true })
writeFileSync(join(root, 'demo', 'artifact.html'), body)
writeFileSync(join(root, 'demo', 'index.html'),
  `<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${body}\n</body>\n</html>\n`)
console.log(`${names.length} icon, ${(body.length / 1024).toFixed(0)} KB`)
