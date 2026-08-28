import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const getBasePath = () => {
  if (process.env.VITE_BASE_PATH) return process.env.VITE_BASE_PATH
  if (process.env.GITHUB_ACTIONS !== 'true') return '/'

  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/').at(-1)
  if (!repositoryName || repositoryName.endsWith('.github.io')) return '/'

  return `/${repositoryName}/`
}

export default defineConfig({
  base: getBasePath(),
  plugins: [react()],
})
