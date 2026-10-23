import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: true, allowedHosts: ['.ts.net'] }, // mở được từ điện thoại cùng mạng LAN và qua Tailscale
  preview: { allowedHosts: ['.ts.net'] }, // link chia sẻ qua Tailscale Funnel
  // Bản sao lưu mã cũ và thư mục thiết kế không chạy kiểm thử
  test: { exclude: [...configDefaults.exclude, '_backup/**', 'redesign/**'] },
})
