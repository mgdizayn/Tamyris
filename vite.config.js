import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub kullanıcı adın ve depo adınla tam uyumlu olmalı
  base: '/Tamyris/', 
  build: {
    outDir: 'dist',
  }
})
