import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const openAiProxy={
  target:'https://api.openai.com',
  changeOrigin:true,
  secure:true,
  rewrite:function(path){return path.replace(/^\/\_\_ranji-openai/,'')}
}

export default defineConfig({
  plugins:[react()],
  server:{proxy:{'/__ranji-openai':openAiProxy}},
  preview:{proxy:{'/__ranji-openai':openAiProxy}}
})
