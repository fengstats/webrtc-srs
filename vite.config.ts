import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    // 配置别名
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [vue(), UnoCSS()],
})
