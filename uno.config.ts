import { defineConfig, presetMini, presetUno, presetWind, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
  presets: [
    presetUno(), // 默认预设，包含了一系列流行的原子化框架的通用超集
    // presetMini(), // 最小但是包含基本的规则和变量
    // presetWind(), // Tailwind / Windi
    presetAttributify(), // 属性化模式，不用写全在 class 里面，可以按照属性类型分类，还节省了重复输入相同前缀的时间，甚至还有无值属性的支持
    // presetIcons(), // 纯 CSS 图标，由 https://iconify.design/ 提供
  ],
})
